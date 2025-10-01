import path from "node:path";
// @ts-ignore - Using require to handle ES module in CommonJS context
const { getContractAddresses } = require("@ethereum-tag-service/contracts/deployments");
import { type Environment, getSubgraphEndpoint } from "@ethereum-tag-service/subgraph-endpoints";
import { config as dotenvConfig } from "dotenv";
import type { Address, Hex } from "viem";

// Load environment variables
dotenvConfig({ path: path.resolve(process.cwd(), ".env") });

interface Config {
  // Temporal Configuration
  temporal: {
    serverUrl: string;
    namespace: string;
    taskQueue: string;
    workerId: string;
    clientCert?: string;
    clientKey?: string;
    isCloud: boolean;
  };

  // Blockchain Configuration
  blockchain: {
    rpcUrl: string;
    chainId: number;
    contracts: {
      etsToken: Address;
      etsTarget: Address;
      ets: Address;
      etsEnrichTarget: Address;
      mockZoraFactory?: Address;
    };
    eventProcessorPrivateKey?: string;
    zoraPrivateKey?: string;
  };

  // External Services
  services: {
    offchainApiUrl: string;
    arweaveGateway: string;
    eventProcessorApiKey: string;
  };

  // Worker Configuration
  worker: {
    maxConcurrentActivities: number;
    maxConcurrentWorkflows: number;
  };

  // Environment
  env: string;
  logLevel: string;
}

// Determine environment from NODE_ENV
const environment = (process.env.NODE_ENV || "development") as Environment;
const chainId = Number.parseInt(process.env.CHAIN_ID || "31337", 10);

// Get network name based on chainId
const getNetworkName = (chainId: number): string => {
  switch (chainId) {
    case 31337:
      return "localhost";
    case 84532:
      return "baseSepolia";
    case 8453:
      return "base";
    default:
      return "localhost";
  }
};

// Get contract addresses from the contracts package
const networkName = getNetworkName(chainId);
const contractAddresses = getContractAddresses(networkName);

// Get RPC URL based on environment
const getRpcUrl = (): string => {
  if (process.env.RPC_URL) {
    return process.env.RPC_URL;
  }

  // Use Alchemy for non-local environments
  const alchemyKey = process.env.ALCHEMY_API_KEY;
  if (alchemyKey && chainId !== 31337) {
    // Construct Alchemy URL based on chainId
    const alchemyNetwork = chainId === 84532 ? "base-sepolia" : "base-mainnet";
    return `https://${alchemyNetwork}.g.alchemy.com/v2/${alchemyKey}`;
  }

  // Fallback to localhost for development
  return "http://localhost:8545";
};

// @ts-ignore - Using require for ESM modules
const { HDKey } = require("@scure/bip32");
// @ts-ignore - Using require for ESM modules
const { mnemonicToSeedSync } = require("@scure/bip39");

// Derive private key from HD wallet
const derivePrivateKey = (mnemonic: string, position: number): Hex => {
  const seed = mnemonicToSeedSync(mnemonic);
  const hdKey = HDKey.fromMasterSeed(seed);
  // Using standard Ethereum HD path
  const path = `m/44'/60'/0'/0/${position}`;
  const derivedKey = hdKey.derive(path);
  if (!derivedKey.privateKey) {
    throw new Error(`Failed to derive private key at position ${position}`);
  }
  return `0x${Buffer.from(derivedKey.privateKey).toString("hex")}` as Hex;
};

// Get private keys for event processor and Zora roles
const getPrivateKeys = () => {
  // Check if using HD wallet (mnemonic provided)
  // Strip quotes if present (dotenv doesn't auto-strip them)
  const mnemonic = process.env.MNEMONIC?.replace(/^["']|["']$/g, "");

  if (mnemonic) {
    // HD Wallet positions:
    // 0: ETSAdmin
    // 1: ETSPlatform
    // 2: ETSEventProcessor
    // 3: ETSZora
    const eventProcessorPosition = Number.parseInt(process.env.HD_WALLET_POSITION || "2", 10);
    const zoraPosition = 3; // Always position 3 for Zora

    return {
      eventProcessorPrivateKey: derivePrivateKey(mnemonic, eventProcessorPosition),
      zoraPrivateKey: derivePrivateKey(mnemonic, zoraPosition),
    };
  }

  // Fall back to individual private keys
  return {
    eventProcessorPrivateKey: (process.env.EVENT_PROCESSOR_PRIVATE_KEY ||
      process.env.PRIVATE_KEY ||
      "0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a") as Hex, // Hardhat account[2]
    zoraPrivateKey: (process.env.ZORA_PRIVATE_KEY ||
      "0xdbda1821b80551c9d65939329250298aa3472ba22feea921c0cf5d620ea67b97") as Hex, // Hardhat account[3]
  };
};

// Determine if using Temporal Cloud
const isTemporalCloud = Boolean(process.env.TEMPORAL_CLIENT_CERT && process.env.TEMPORAL_CLIENT_KEY);

export const config: Config = {
  temporal: {
    serverUrl: process.env.TEMPORAL_SERVER_URL || "localhost:7233",
    namespace: process.env.TEMPORAL_NAMESPACE || "default",
    taskQueue: process.env.TEMPORAL_TASK_QUEUE || "ets-workflows",
    workerId: process.env.TEMPORAL_WORKER_ID || `ets-worker-${Date.now()}`,
    clientCert: process.env.TEMPORAL_CLIENT_CERT,
    clientKey: process.env.TEMPORAL_CLIENT_KEY,
    isCloud: isTemporalCloud,
  },

  blockchain: {
    rpcUrl: getRpcUrl(),
    chainId,
    contracts: {
      etsToken: (contractAddresses?.token as Address) || ("0x0" as Address),
      etsTarget: (contractAddresses?.target as Address) || ("0x0" as Address),
      ets: (contractAddresses?.core as Address) || ("0x0" as Address),
      etsEnrichTarget: (contractAddresses?.target as Address) || ("0x0" as Address), // Using target since enrichTarget is merged
      mockZoraFactory: contractAddresses?.mockZoraFactory as Address,
    },
    // Use HD wallet-derived keys or fallback to individual private keys
    ...getPrivateKeys(),
  },

  services: {
    offchainApiUrl: process.env.OFFCHAIN_API_URL || "http://localhost:3000",
    arweaveGateway: process.env.ARWEAVE_GATEWAY || "https://arweave.net",
    eventProcessorApiKey: process.env.EVENT_PROCESSOR_API_KEY || "local-event-processor-key",
  },

  worker: {
    maxConcurrentActivities: Number.parseInt(process.env.MAX_CONCURRENT_ACTIVITIES || "10", 10),
    maxConcurrentWorkflows: Number.parseInt(process.env.MAX_CONCURRENT_WORKFLOWS || "100", 10),
  },

  env: environment,
  logLevel: process.env.LOG_LEVEL || "info",
};

// Validate configuration
function validateConfig(): void {
  try {
    // Check that contract addresses are available
    const { etsToken, etsTarget, ets } = config.blockchain.contracts;

    if (!etsToken || etsTarget === "0x0" || !etsTarget || etsTarget === "0x0" || !ets || ets === "0x0") {
      throw new Error(
        `Missing contract addresses for environment: ${config.env}, chainId: ${config.blockchain.chainId}`,
      );
    }

    // Check MockZoraFactory for localhost
    if (config.blockchain.chainId === 31337 && !config.blockchain.contracts.mockZoraFactory) {
      console.warn("Warning: MockZoraFactory not deployed for localhost testing");
    }
  } catch (error) {
    throw new Error(`Contract configuration error: ${error instanceof Error ? error.message : error}`);
  }
}

// Validate in production and staging
if (config.env === "production" || config.env === "staging") {
  validateConfig();
}
