/**
 * Test Environment Configuration
 *
 * This file wraps the unified @ethereum-tag-service/config package
 * for use in integration tests. All environment configuration is
 * centralized in the config package to avoid duplication.
 */

import {
  type Environment,
  type EnvironmentName,
  detectEnvironment,
  getEnvironment as getConfigEnvironment,
  logEnvironment as logConfigEnvironment,
} from "@ethereum-tag-service/config";
import { getContractAddresses as getDeployedContracts } from "@ethereum-tag-service/contracts/deployments";

// Re-export types from config package for test compatibility
export type TestEnvironment = Environment;
export type { Environment, EnvironmentName };

/**
 * Get environment configuration for tests
 * Uses ENVIRONMENT env var with fallback to auto-detection
 */
export function getEnvironment(name?: string): Environment {
  const envName = (name || process.env.ENVIRONMENT || detectEnvironment()) as EnvironmentName;
  return getConfigEnvironment({ environment: envName });
}

/**
 * Get contract addresses for the current environment
 */
export async function getContractAddresses(env: Environment) {
  const { chainId } = env.network;

  // Map chainId to network name used in deployments
  const networkName = {
    31337: "localhost",
    84532: "baseSepolia",
    8453: "base",
  }[chainId];

  if (!networkName) {
    throw new Error(`No network mapping for chain ${chainId}`);
  }

  const addresses = await getDeployedContracts(networkName as any);

  if (!addresses) {
    throw new Error(`No contracts deployed on ${networkName}`);
  }

  return addresses;
}

/**
 * Log environment details
 */
export function logEnvironment(env?: Environment) {
  if (env) {
    logConfigEnvironment(env);
  } else {
    logConfigEnvironment();
  }
}

/**
 * Validate required services are running
 */
export async function validateServices(env: Environment) {
  console.log("🔍 Validating required services...\n");

  const errors: string[] = [];

  // Check Hardhat if needed
  if (env.testing.validation.checkHardhat) {
    try {
      const response = await fetch(env.network.rpcUrl, {
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

      if (chainId !== env.network.chainId) {
        errors.push(`Hardhat: Wrong chain (expected ${env.network.chainId}, got ${chainId})`);
      } else {
        console.log(`  ✅ Hardhat: Chain ${chainId}`);
      }
    } catch (_error) {
      errors.push("Hardhat: Not running on port 8545");
    }
  }

  // Check Temporal if needed
  if (env.testing.validation.checkTemporal) {
    try {
      if (env.services.temporal?.uiUrl) {
        const response = await fetch(env.services.temporal.uiUrl);
        if (response.ok) {
          console.log("  ✅ Temporal: UI accessible");
        } else {
          errors.push(`Temporal: UI returned ${response.status}`);
        }
      }
    } catch (_error) {
      errors.push("Temporal: Not accessible");
    }
  }

  if (errors.length > 0) {
    console.error("\n❌ Service validation failed:");
    for (const err of errors) {
      console.error(`  - ${err}`);
    }

    if (env.testing.requiresLocalStack) {
      console.error("\n💡 Run: ./scripts/start-local-stack.sh\n");
    }

    throw new Error("Required services not available");
  }

  console.log("\n✅ All required services running!\n");
}
