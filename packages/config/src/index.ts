/**
 * @ethereum-tag-service/config
 * Unified configuration system for ETS monorepo
 */

import type {
  ConfigOptions,
  ContractAddresses,
  Environment,
  EnvironmentName,
  NetworkConfig,
  ServiceConfig,
  TestConfig,
  ValidationResult,
  WalletConfig,
} from "./types.js";
import { ConfigPriority } from "./types.js";

import { getContractABIs, getContractConfig, requireContract, validateContracts } from "./contracts.js";
import { detectEnvironment, getEnvironmentConfig } from "./environments.js";
import {
  getEnv,
  isCI,
  isDevelopment,
  isProduction,
  isTest,
  loadEnvironmentVariables,
  mergeWithEnvironment,
  requireEnv,
} from "./loader.js";
import { validateEnvVars, validateEnvironment } from "./validation.js";

// Re-export types
export type {
  EnvironmentName,
  NetworkConfig,
  ContractAddresses,
  ServiceConfig,
  WalletConfig,
  TestConfig,
  Environment,
  ConfigOptions,
  ValidationResult,
} from "./types.js";

// Re-export enums
// biome-ignore lint/performance/noBarrelFile: Config package index provides centralized exports for library consumption
export { ConfigPriority } from "./types.js";

// Re-export individual modules
export {
  detectEnvironment,
  getEnvironmentConfig,
  getContractConfig,
  validateContracts,
  requireContract,
  getContractABIs,
  loadEnvironmentVariables,
  mergeWithEnvironment,
  requireEnv,
  getEnv,
  isCI,
  isDevelopment,
  isProduction,
  isTest,
  validateEnvVars,
  validateEnvironment,
};

/**
 * Main configuration class for ETS
 */
export class ETSConfig {
  private static instance: ETSConfig | null = null;
  private environment: Environment;
  private contracts: ContractAddresses | null = null;
  private initialized = false;

  private constructor(options: ConfigOptions = {}) {
    // Load environment variables
    loadEnvironmentVariables(options);

    // Detect and load environment
    const envName = options.environment || detectEnvironment();
    this.environment = getEnvironmentConfig(envName);

    // Merge with runtime environment variables
    this.mergeRuntimeConfig();

    this.initialized = true;
  }

  /**
   * Get singleton instance
   */
  public static getInstance(options: ConfigOptions = {}): ETSConfig {
    if (!ETSConfig.instance) {
      ETSConfig.instance = new ETSConfig(options);
    }
    return ETSConfig.instance;
  }

  /**
   * Reset singleton (useful for testing)
   */
  public static reset(): void {
    ETSConfig.instance = null;
  }

  /**
   * Merge runtime environment variables into config
   */
  private mergeRuntimeConfig(): void {
    // Override network RPC if specified
    if (process.env.RPC_URL) {
      this.environment.network.rpcUrl = process.env.RPC_URL;
    }

    // Override Alchemy key if specified
    if (process.env.ALCHEMY_API_KEY) {
      this.environment.network.alchemyApiKey = process.env.ALCHEMY_API_KEY;
    }

    // Override Temporal server if specified
    if (process.env.TEMPORAL_SERVER_URL && this.environment.services.temporal) {
      this.environment.services.temporal.serverUrl = process.env.TEMPORAL_SERVER_URL;
    }

    // Override wallet mnemonic if specified (be careful!)
    if (process.env.MNEMONIC && this.environment.wallet) {
      this.environment.wallet.mnemonic = process.env.MNEMONIC;
    }
  }

  /**
   * Get current environment
   */
  public getEnvironment(): Environment {
    return this.environment;
  }

  /**
   * Get environment name
   */
  public getEnvironmentName(): EnvironmentName {
    return this.environment.name;
  }

  /**
   * Get network configuration
   */
  public getNetwork(): NetworkConfig {
    return this.environment.network;
  }

  /**
   * Get service configuration
   */
  public getServices(): ServiceConfig {
    return this.environment.services;
  }

  /**
   * Get wallet configuration
   */
  public getWallet(): WalletConfig | undefined {
    return this.environment.wallet;
  }

  /**
   * Get test configuration
   */
  public getTestConfig(): TestConfig {
    return this.environment.testing;
  }

  /**
   * Get contract addresses (cached)
   */
  public async getContracts(): Promise<ContractAddresses> {
    if (!this.contracts) {
      this.contracts = await getContractConfig(this.environment);
    }
    return this.contracts;
  }

  /**
   * Check if a feature is enabled
   */
  public isFeatureEnabled(feature: keyof NonNullable<Environment["features"]>): boolean {
    return this.environment.features?.[feature] ?? false;
  }

  /**
   * Log current configuration (for debugging)
   */
  public logConfig(): void {
    console.log("\n🌍 ETS Configuration");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`Environment: ${this.environment.displayName}`);
    console.log(`Network: ${this.environment.network.name} (${this.environment.network.chainId})`);
    console.log(`RPC: ${this.environment.network.rpcUrl}`);

    if (this.environment.services.temporal) {
      console.log("\n⏰ Temporal:");
      console.log(`  Server: ${this.environment.services.temporal.serverUrl}`);
      console.log(`  Queue: ${this.environment.services.temporal.taskQueue}`);
    }

    console.log("\n🔧 Features:");
    if (this.environment.features) {
      for (const [feature, enabled] of Object.entries(this.environment.features)) {
        console.log(`  ${feature}: ${enabled ? "✅" : "❌"}`);
      }
    }

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  }
}

// ========================================
// Convenience functions for direct usage
// ========================================

/**
 * Get current environment configuration
 */
export function getEnvironment(options: ConfigOptions = {}): Environment {
  return ETSConfig.getInstance(options).getEnvironment();
}

/**
 * Get network configuration
 */
export function getNetwork(options: ConfigOptions = {}): NetworkConfig {
  return ETSConfig.getInstance(options).getNetwork();
}

/**
 * Get contract addresses
 */
export async function getContracts(options: ConfigOptions = {}): Promise<ContractAddresses> {
  return ETSConfig.getInstance(options).getContracts();
}

/**
 * Get test configuration
 */
export function getTestConfig(options: ConfigOptions = {}): TestConfig {
  return ETSConfig.getInstance(options).getTestConfig();
}

/**
 * Log environment details
 */
export function logEnvironment(env?: Environment): void {
  const environment = env || getEnvironment();
  console.log(`
🌍 Environment: ${environment.displayName}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📡 Network:
   Chain: ${environment.network.name} (${environment.network.chainId})
   RPC: ${environment.network.rpcUrl}

⏰ Services:
   Temporal: ${environment.services.temporal?.serverUrl || "Not configured"}
   Task Queue: ${environment.services.temporal?.taskQueue || "N/A"}

🔧 Testing:
   Read-only: ${environment.testing.readOnly}
   Local Stack Required: ${environment.testing.requiresLocalStack}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);
}

// Export default instance for simple usage
export default ETSConfig.getInstance();
