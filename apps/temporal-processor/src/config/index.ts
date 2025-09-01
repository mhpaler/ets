import path from "node:path";
import {
  etsAddress,
  etsEnrichTargetAddress,
  etsTargetAddress,
  etsTokenAddress,
} from "@ethereum-tag-service/contracts/contracts";
import { getAlchemyRpcUrlById } from "@ethereum-tag-service/contracts/utils";
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
    };
  };

  // External Services
  services: {
    offchainApiUrl: string;
    arweaveGateway: string;
    oracleApiKey: string;
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

// Get RPC URL using workspace utility or fallback to env
const getRpcUrl = (): string => {
  if (process.env.RPC_URL) {
    return process.env.RPC_URL;
  }

  // Use workspace utility for Alchemy URLs
  try {
    return getAlchemyRpcUrlById(chainId);
  } catch {
    // Fallback to localhost for development
    return "http://localhost:8545";
  }
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
      etsToken: etsTokenAddress[chainId as keyof typeof etsTokenAddress] as Address,
      etsTarget: etsTargetAddress[chainId as keyof typeof etsTargetAddress] as Address,
      ets: etsAddress[chainId as keyof typeof etsAddress] as Address,
    },
  },

  services: {
    offchainApiUrl: process.env.OFFCHAIN_API_URL || "http://localhost:3000",
    arweaveGateway: process.env.ARWEAVE_GATEWAY || "https://arweave.net",
    oracleApiKey: process.env.ORACLE_API_KEY || "local-oracle-key",
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
    // Test that workspace packages provide valid addresses
    const tokenAddr = config.blockchain.contracts.etsToken;
    const targetAddr = config.blockchain.contracts.etsTarget;
    const etsAddr = config.blockchain.contracts.ets;

    if (!tokenAddr || !targetAddr || !etsAddr) {
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
