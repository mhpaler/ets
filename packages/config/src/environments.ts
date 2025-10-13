/**
 * Environment definitions for ETS monorepo
 */

import { defineChain } from "viem";
import { base, baseSepolia } from "viem/chains";
import type { Environment, EnvironmentName } from "./types.js";

// Hardhat uses chainId 31337, not viem's default localhost 1337
const hardhat = defineChain({
  id: 31337,
  name: "Hardhat",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: { http: ["http://localhost:8545"] },
  },
  testnet: true,
});

/**
 * Default environment configurations
 * These can be overridden by environment variables
 */
export const environments: Record<EnvironmentName, Environment> = {
  // ========================================
  // LOCAL: Development environment
  // ========================================
  local: {
    name: "local",
    displayName: "Local Development",

    network: {
      name: "localhost",
      chainId: 31337,
      chain: hardhat,
      rpcUrl: process.env.RPC_URL || "http://localhost:8545",
      blockExplorer: undefined,
    },

    services: {
      temporal: {
        serverUrl: process.env.TEMPORAL_SERVER_URL || "localhost:7233",
        namespace: "default",
        taskQueue: "ets-workflows-local",
        workerId: "ets-worker-local",
        uiUrl: "http://localhost:8080",
      },
      offchainApi: {
        url: process.env.OFFCHAIN_API_URL || "http://localhost:3000",
      },
      arweave: {
        gateway: "https://arweave.net",
      },
      ipfs: {
        gateway: "https://gateway.pinata.cloud/ipfs/",
        apiUrl: "https://api.pinata.cloud",
      },
    },

    wallet: {
      // Hardhat default mnemonic
      mnemonic: process.env.LOCAL_MNEMONIC || "test test test test test test test test test test test junk",
      accounts: {
        deployer: 0,
        admin: 1,
        eventProcessor: 2,
        zora: 3,
        tester: 4,
      },
    },

    testing: {
      readOnly: false,
      requiresLocalStack: true,
      skipSlowTests: false,
      timeouts: {
        transaction: 5_000,
        enrichment: 30_000,
        tagCreation: 30_000,
        serviceHealth: 3_000,
        workflowCompletion: 30_000,
      },
      validation: {
        checkHardhat: true,
        checkTemporal: true,
        checkSubgraph: false,
      },
    },

    features: {
      tagCoins: true,
      targetEnrichment: true,
      zoraIntegration: false, // Use MockZora locally
    },
  },

  // ========================================
  // STAGING: Base Sepolia testnet
  // ========================================
  staging: {
    name: "staging",
    displayName: "Staging (Base Sepolia)",

    network: {
      name: "baseSepolia",
      chainId: 84532,
      chain: baseSepolia,
      rpcUrl:
        process.env.STAGING_RPC_URL ||
        `https://base-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY || "TjjzoNYlIqWqZxcoufe60bhVbARhkxYX"}`,
      blockExplorer: "https://sepolia.basescan.org",
      alchemyApiKey: process.env.ALCHEMY_API_KEY,
    },

    services: {
      temporal: {
        serverUrl: process.env.TEMPORAL_CLOUD_URL || "localhost:7233",
        namespace: process.env.TEMPORAL_NAMESPACE || "default",
        taskQueue: process.env.TEMPORAL_CLOUD_URL
          ? "ets-workflows-staging" // Cloud queue
          : "ets-workflows-local-staging", // Local processor watching staging
        workerId: process.env.TEMPORAL_CLOUD_URL ? "ets-worker-cloud-staging" : "ets-worker-local-staging",
        uiUrl: process.env.TEMPORAL_CLOUD_URL
          ? undefined // Cloud UI requires auth
          : "http://localhost:8080",
      },
      offchainApi: {
        url: process.env.OFFCHAIN_API_URL || "https://api-staging.ets.xyz",
      },
      subgraph: {
        url: "https://api.thegraph.com/subgraphs/name/ets/base-sepolia",
      },
      arweave: {
        gateway: "https://arweave.net",
      },
      ipfs: {
        gateway: "https://gateway.pinata.cloud/ipfs/",
        apiUrl: "https://api.pinata.cloud",
      },
    },

    wallet: {
      // Should be in .env.local (not committed)
      mnemonic: process.env.STAGING_MNEMONIC || process.env.MNEMONIC_TESTNET_STAGING,
      accounts: {
        deployer: 0,
        admin: 1,
        eventProcessor: 2,
        zora: 3,
        tester: 4,
      },
    },

    testing: {
      readOnly: false,
      requiresLocalStack: !process.env.TEMPORAL_CLOUD_URL,
      skipSlowTests: false,
      timeouts: {
        transaction: 15_000,
        enrichment: 60_000,
        tagCreation: 60_000,
        serviceHealth: 5_000,
        workflowCompletion: 60_000,
      },
      validation: {
        checkHardhat: false,
        checkTemporal: !process.env.TEMPORAL_CLOUD_URL,
        checkSubgraph: true,
      },
    },

    features: {
      tagCoins: true,
      targetEnrichment: true,
      zoraIntegration: true,
    },
  },

  // ========================================
  // PRODUCTION: Base mainnet
  // ========================================
  production: {
    name: "production",
    displayName: "Production (Base Mainnet)",

    network: {
      name: "base",
      chainId: 8453,
      chain: base,
      rpcUrl:
        process.env.PRODUCTION_RPC_URL ||
        `https://base-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY_PROD || ""}`,
      blockExplorer: "https://basescan.org",
      alchemyApiKey: process.env.ALCHEMY_API_KEY_PROD,
    },

    services: {
      temporal: {
        serverUrl: process.env.TEMPORAL_CLOUD_URL || "prod.tmprl.cloud:7233",
        namespace: process.env.TEMPORAL_NAMESPACE || "ets-production",
        taskQueue: "ets-workflows-production",
        workerId: "ets-worker-production",
        // No UI access for production
      },
      offchainApi: {
        url: process.env.OFFCHAIN_API_URL || "https://api.ets.xyz",
      },
      subgraph: {
        url: "https://api.thegraph.com/subgraphs/name/ets/base",
      },
      arweave: {
        gateway: "https://arweave.net",
      },
      ipfs: {
        gateway: "https://gateway.pinata.cloud/ipfs/",
        apiUrl: "https://api.pinata.cloud",
      },
    },

    wallet: {
      // Production credentials should NEVER be in code
      mnemonic: process.env.PRODUCTION_MNEMONIC,
      privateKey: process.env.PRODUCTION_PRIVATE_KEY,
      accounts: {
        deployer: 0,
        admin: 1,
        eventProcessor: 2,
        zora: 3,
        tester: 4,
      },
    },

    testing: {
      readOnly: true, // No write operations in production tests
      requiresLocalStack: false,
      skipSlowTests: true,
      timeouts: {
        transaction: 15_000,
        enrichment: 60_000,
        tagCreation: 60_000,
        serviceHealth: 5_000,
        workflowCompletion: 60_000,
      },
      validation: {
        checkHardhat: false,
        checkTemporal: false,
        checkSubgraph: true,
      },
    },

    features: {
      tagCoins: true,
      targetEnrichment: true,
      zoraIntegration: true,
    },
  },
};

/**
 * Get environment configuration by name
 */
export function getEnvironmentConfig(name: EnvironmentName): Environment {
  const env = environments[name];
  if (!env) {
    throw new Error(`Unknown environment: ${name}. Valid options: ${Object.keys(environments).join(", ")}`);
  }
  return env;
}

/**
 * Detect current environment from various sources
 */
export function detectEnvironment(): EnvironmentName {
  // Priority order for environment detection
  const sources = [process.env.ENVIRONMENT, process.env.NODE_ENV, process.env.HARDHAT_NETWORK, process.env.NETWORK];

  for (const source of sources) {
    if (!source) continue;

    // Map various names to our standard environments
    const normalized = source.toLowerCase();

    // Local variations
    if (["local", "localhost", "development", "dev", "test"].includes(normalized)) {
      return "local";
    }

    // Staging variations
    if (["staging", "stage", "sepolia", "basesepolia", "base-sepolia"].includes(normalized)) {
      return "staging";
    }

    // Production variations
    if (["production", "prod", "mainnet", "base", "base-mainnet"].includes(normalized)) {
      return "production";
    }
  }

  // Default to local if no environment detected
  return "local";
}
