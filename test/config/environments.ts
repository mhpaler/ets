/**
 * Unified Test Environment Configuration
 *
 * Simplifies environment management for integration tests
 * Uses consistent terminology: local, staging, production
 */

import type { Address } from "viem";
import { defineChain } from "viem";
import { base, baseSepolia } from "viem/chains";

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

export interface TestEnvironment {
  // Core identifiers
  name: "local" | "staging" | "production";
  displayName: string;

  // Blockchain config
  blockchain: {
    chainId: number;
    chain: typeof hardhat | typeof baseSepolia | typeof base;
    rpcUrl: string;
    // Hardhat default or environment-specific
    mnemonic?: string;
    // Standard account indices
    accounts: {
      deployer: number; // 0
      admin: number; // 1
      eventProcessor: number; // 2
      tester: number; // 3
    };
  };

  // Temporal config
  temporal: {
    // Where Temporal Server is running
    serverUrl: string;
    // Where Temporal Processor is running
    processor: "local" | "remote";
    // Expected task queue
    taskQueue: string;
    // UI for debugging
    uiUrl?: string;
  };

  // Test behavior
  testing: {
    // Can we write transactions?
    readOnly: boolean;
    // Do we need local services?
    requiresLocalStack: boolean;
    // Timeouts for async operations
    timeouts: {
      transaction: number;
      enrichment: number;
      tagCreation: number;
    };
  };

  // Service validation
  validation: {
    checkHardhat: boolean;
    checkTemporal: boolean;
    checkSubgraph?: boolean;
  };
}

// Hardhat default mnemonic
const HARDHAT_MNEMONIC = "test test test test test test test test test test test junk";

/**
 * Environment Configurations
 * Access via: getEnvironment(process.env.ENVIRONMENT || "local")
 */
export const environments: Record<string, TestEnvironment> = {
  // ========================================
  // LOCAL: Everything runs locally
  // ========================================
  local: {
    name: "local",
    displayName: "Local Development",

    blockchain: {
      chainId: 31337,
      chain: hardhat,
      rpcUrl: process.env.RPC_URL || "http://localhost:8545",
      mnemonic: HARDHAT_MNEMONIC,
      accounts: {
        deployer: 0,
        admin: 1,
        eventProcessor: 2,
        tester: 3,
      },
    },

    temporal: {
      serverUrl: "localhost:7233",
      processor: "local",
      taskQueue: "ets-workflows-local",
      uiUrl: "http://localhost:8080",
    },

    testing: {
      readOnly: false,
      requiresLocalStack: true,
      timeouts: {
        transaction: 5_000,
        enrichment: 30_000,
        tagCreation: 30_000,
      },
    },

    validation: {
      checkHardhat: true,
      checkTemporal: true,
      checkSubgraph: false,
    },
  },

  // ========================================
  // STAGING: Base Sepolia blockchain
  // Can use local or remote Temporal
  // ========================================
  staging: {
    name: "staging",
    displayName: "Staging (Base Sepolia)",

    blockchain: {
      chainId: 84532,
      chain: baseSepolia,
      rpcUrl:
        process.env.STAGING_RPC_URL ||
        `https://base-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY || "TjjzoNYlIqWqZxcoufe60bhVbARhkxYX"}`,
      mnemonic: process.env.MNEMONIC_TESTNET_STAGING || process.env.MNEMONIC_TESTNET,
      accounts: {
        deployer: 0,
        admin: 1,
        eventProcessor: 2,
        tester: 3,
      },
    },

    temporal: {
      // Can override with TEMPORAL_CLOUD_URL for remote
      serverUrl: process.env.TEMPORAL_CLOUD_URL || "localhost:7233",
      processor: process.env.TEMPORAL_CLOUD_URL ? "remote" : "local",
      taskQueue: process.env.TEMPORAL_CLOUD_URL
        ? "ets-workflows-staging" // Cloud queue
        : "ets-workflows-local-staging", // Local processor watching staging
      uiUrl: process.env.TEMPORAL_CLOUD_URL
        ? undefined // Cloud UI requires auth
        : "http://localhost:8080",
    },

    testing: {
      readOnly: false,
      requiresLocalStack: !process.env.TEMPORAL_CLOUD_URL,
      timeouts: {
        transaction: 15_000,
        enrichment: 60_000,
        tagCreation: 60_000,
      },
    },

    validation: {
      checkHardhat: false,
      checkTemporal: !process.env.TEMPORAL_CLOUD_URL,
      checkSubgraph: true,
    },
  },

  // ========================================
  // PRODUCTION: Base Mainnet (read-only)
  // ========================================
  production: {
    name: "production",
    displayName: "Production (Base Mainnet)",

    blockchain: {
      chainId: 8453,
      chain: base,
      rpcUrl: process.env.PROD_RPC_URL || "https://mainnet.base.org",
      // No mnemonic - read only
      accounts: {
        deployer: 0,
        admin: 1,
        eventProcessor: 2,
        tester: 3,
      },
    },

    temporal: {
      serverUrl: process.env.TEMPORAL_CLOUD_URL || "prod.tmprl.cloud:7233",
      processor: "remote",
      taskQueue: "ets-workflows-production",
      // No UI access for production
    },

    testing: {
      readOnly: true,
      requiresLocalStack: false,
      timeouts: {
        transaction: 15_000,
        enrichment: 60_000,
        tagCreation: 60_000,
      },
    },

    validation: {
      checkHardhat: false,
      checkTemporal: false,
      checkSubgraph: true,
    },
  },
};

/**
 * Get environment configuration
 * @param name - Environment name (defaults to "local")
 */
export function getEnvironment(name?: string): TestEnvironment {
  const envName = name || process.env.ENVIRONMENT || "local";
  const env = environments[envName];

  if (!env) {
    throw new Error(
      `Unknown environment: ${envName}\n` +
        `Valid options: ${Object.keys(environments).join(", ")}\n` +
        `Set via ENVIRONMENT env var`,
    );
  }

  return env;
}

/**
 * Get contract addresses for the current environment
 */
export async function getContractAddresses(env: TestEnvironment) {
  const { chainId } = env.blockchain;

  // Map chainId to network name used in deployments
  const networkName = {
    31337: "localhost",
    84532: "baseSepolia", // Will change to "staging"
    8453: "base",
  }[chainId];

  if (!networkName) {
    throw new Error(`No network mapping for chain ${chainId}`);
  }

  // Import from contracts package
  const { getContractAddresses } = await import("@ethereum-tag-service/contracts/deployments");
  const addresses = await getContractAddresses(networkName as any);

  if (!addresses) {
    throw new Error(`No contracts deployed on ${networkName}`);
  }

  return addresses;
}

/**
 * Log environment details
 */
export function logEnvironment(env: TestEnvironment) {
  console.log(`
🌍 Test Environment: ${env.displayName}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📡 Blockchain:
   Chain ID: ${env.blockchain.chainId}
   RPC: ${env.blockchain.rpcUrl}

⏰ Temporal:
   Server: ${env.temporal.serverUrl}
   Processor: ${env.temporal.processor}
   Queue: ${env.temporal.taskQueue}
   ${env.temporal.uiUrl ? `UI: ${env.temporal.uiUrl}` : ""}

🔧 Configuration:
   Read-only: ${env.testing.readOnly}
   Local Stack Required: ${env.testing.requiresLocalStack}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);
}

/**
 * Validate required services are running
 */
export async function validateServices(env: TestEnvironment) {
  console.log("🔍 Validating required services...\n");

  const errors: string[] = [];

  // Check Hardhat if needed
  if (env.validation.checkHardhat) {
    try {
      const response = await fetch(env.blockchain.rpcUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "eth_chainId",
          params: [],
          id: 1,
        }),
      });
      const data = await response.json();
      const chainId = Number.parseInt(data.result, 16);

      if (chainId !== env.blockchain.chainId) {
        errors.push(`Hardhat: Wrong chain (expected ${env.blockchain.chainId}, got ${chainId})`);
      } else {
        console.log(`  ✅ Hardhat: Chain ${chainId}`);
      }
    } catch (error) {
      errors.push("Hardhat: Not running on port 8545");
    }
  }

  // Check Temporal if needed
  if (env.validation.checkTemporal) {
    try {
      if (env.temporal.uiUrl) {
        const response = await fetch(env.temporal.uiUrl);
        if (response.ok) {
          console.log(`  ✅ Temporal: UI accessible`);
        } else {
          errors.push(`Temporal: UI returned ${response.status}`);
        }
      }
    } catch (error) {
      errors.push("Temporal: Not accessible");
    }
  }

  if (errors.length > 0) {
    console.error("\n❌ Service validation failed:");
    errors.forEach((err) => console.error(`  - ${err}`));

    if (env.testing.requiresLocalStack) {
      console.error("\n💡 Run: ./scripts/start-local-stack.sh\n");
    }

    throw new Error("Required services not available");
  }

  console.log("\n✅ All required services running!\n");
}
