import { ETSConfig } from "@ethereum-tag-service/config";
import type { Address, Hex } from "viem";

// HD wallet utilities for role-based key derivation
// @ts-ignore - Using require for ESM modules
const { HDKey } = require("@scure/bip32");
// @ts-ignore - Using require for ESM modules
const { mnemonicToSeedSync } = require("@scure/bip39");

export interface Config {
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
    wsRpcUrl?: string;
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
const getPrivateKeys = (wallet: { mnemonic?: string } | undefined) => {
  if (wallet?.mnemonic) {
    // HD Wallet positions:
    // 0: ETSAdmin
    // 1: ETSPlatform
    // 2: ETSEventProcessor
    // 3: ETSZora
    const eventProcessorPosition = Number.parseInt(process.env.HD_WALLET_POSITION || "2", 10);
    const zoraPosition = 3; // Always position 3 for Zora

    return {
      eventProcessorPrivateKey: derivePrivateKey(wallet.mnemonic, eventProcessorPosition),
      zoraPrivateKey: derivePrivateKey(wallet.mnemonic, zoraPosition),
    };
  }

  // Fall back to individual private keys for local development
  return {
    eventProcessorPrivateKey: (process.env.EVENT_PROCESSOR_PRIVATE_KEY ||
      "0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a") as Hex, // Hardhat account[2]
    zoraPrivateKey: (process.env.ZORA_PRIVATE_KEY ||
      "0xdbda1821b80551c9d65939329250298aa3472ba22feea921c0cf5d620ea67b97") as Hex, // Hardhat account[3]
  };
};

// Get WebSocket RPC URL from HTTP URL
const getWsRpcUrl = (httpUrl: string): string | undefined => {
  // Convert HTTP Alchemy URLs to WebSocket
  if (httpUrl.includes("g.alchemy.com")) {
    return httpUrl.replace("https://", "wss://");
  }

  // No WebSocket for localhost (Hardhat doesn't support it)
  if (httpUrl.includes("localhost") || httpUrl.includes("127.0.0.1")) {
    return undefined;
  }

  return undefined;
};

// Create async function to get config
async function createConfig(): Promise<Config> {
  // Initialize configuration using the new config package
  const etsConfig = ETSConfig.getInstance();
  const env = etsConfig.getEnvironment();
  const network = etsConfig.getNetwork();
  const wallet = etsConfig.getWallet();
  const contracts = await etsConfig.getContracts();
  const services = etsConfig.getServices();

  // Get temporal configuration from environment or defaults
  const temporal = {
    serverUrl: process.env.TEMPORAL_SERVER_URL || (env.name === "local" ? "localhost:7233" : "cloud.tmprl.cloud:7233"),
    namespace: process.env.TEMPORAL_NAMESPACE || "default",
    taskQueue: process.env.TEMPORAL_TASK_QUEUE || `ets-workflows-${env.name}`,
    workerId: process.env.TEMPORAL_WORKER_ID || `ets-worker-${env.name}-${Date.now()}`,
    clientCert: process.env.TEMPORAL_CLIENT_CERT,
    clientKey: process.env.TEMPORAL_CLIENT_KEY,
    maxConcurrentActivities: Number.parseInt(process.env.MAX_CONCURRENT_ACTIVITIES || "10", 10),
    maxConcurrentWorkflows: Number.parseInt(process.env.MAX_CONCURRENT_WORKFLOWS || "100", 10),
  };

  // Determine if using Temporal Cloud
  const isTemporalCloud = Boolean(temporal.clientCert && temporal.clientKey);

  return {
    temporal: {
      serverUrl: temporal.serverUrl,
      namespace: temporal.namespace,
      taskQueue: temporal.taskQueue,
      workerId: temporal.workerId,
      clientCert: temporal.clientCert,
      clientKey: temporal.clientKey,
      isCloud: isTemporalCloud,
    },

    blockchain: {
      rpcUrl: network.rpcUrl,
      wsRpcUrl: getWsRpcUrl(network.rpcUrl),
      chainId: network.chainId,
      contracts: {
        etsToken: contracts.token as Address,
        etsTarget: contracts.target as Address,
        ets: contracts.core as Address,
        etsEnrichTarget: contracts.target as Address, // Using target since enrichTarget is merged
        mockZoraFactory: contracts.mockZoraFactory as Address | undefined,
      },
      // Use HD wallet-derived keys or fallback to individual private keys
      ...getPrivateKeys(wallet),
    },

    services: {
      offchainApiUrl: services.offchainApi?.url || "http://localhost:3000",
      arweaveGateway: process.env.ARWEAVE_GATEWAY || "https://arweave.net",
      eventProcessorApiKey: services.offchainApi?.apiKey || "local-event-processor-key",
    },

    worker: {
      maxConcurrentActivities: temporal.maxConcurrentActivities,
      maxConcurrentWorkflows: temporal.maxConcurrentWorkflows,
    },

    env: env.name,
    logLevel: process.env.LOG_LEVEL || "info",
  };
}

// Export config as a singleton promise
let configPromise: Promise<Config> | null = null;

export async function getConfig(): Promise<Config> {
  if (!configPromise) {
    configPromise = createConfig().then((config) => {
      // Validate configuration after creation
      validateConfig(config);
      return config;
    });
  }
  return configPromise;
}

// Validate configuration
function validateConfig(config: Config): void {
  try {
    // Check that contract addresses are available
    const { etsToken, etsTarget, ets } = config.blockchain.contracts;

    if (!etsToken || etsToken === "0x0" || !etsTarget || etsTarget === "0x0" || !ets || ets === "0x0") {
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
