import path from "node:path";
import { type Environment, getSubgraphEndpoint } from "@ethereum-tag-service/subgraph-endpoints";
import { config as dotenvConfig } from "dotenv";
import type { Address } from "viem";

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
    };
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

// Contract addresses by chainId
const CONTRACT_ADDRESSES: Record<number, { token: Address; target: Address; ets: Address; enrichTarget: Address }> = {
  31337: {
    token: "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9" as Address,
    target: "0x0165878A594ca255338adfa4d48449f69242Eb8F" as Address,
    ets: "0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6" as Address,
    enrichTarget: "0x610178dA211FEF7D417bC0e6FeD39F05609AD788" as Address,
  },
  // Add staging/production addresses when available
};

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
      etsToken: CONTRACT_ADDRESSES[chainId]?.token || CONTRACT_ADDRESSES[31337].token,
      etsTarget: CONTRACT_ADDRESSES[chainId]?.target || CONTRACT_ADDRESSES[31337].target,
      ets: CONTRACT_ADDRESSES[chainId]?.ets || CONTRACT_ADDRESSES[31337].ets,
      etsEnrichTarget: CONTRACT_ADDRESSES[chainId]?.enrichTarget || CONTRACT_ADDRESSES[31337].enrichTarget,
    },
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
    const { etsToken, etsTarget, ets, etsEnrichTarget } = config.blockchain.contracts;

    if (!etsToken || !etsTarget || !ets || !etsEnrichTarget) {
      throw new Error(
        `Missing contract addresses for environment: ${config.env}, chainId: ${config.blockchain.chainId}`,
      );
    }
  } catch (error) {
    throw new Error(`Contract configuration error: ${error instanceof Error ? error.message : error}`);
  }
}

// Validate in production and staging
if (config.env === "production" || config.env === "staging") {
  validateConfig();
}
