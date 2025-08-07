/**
 * Chain Configuration Utility for Oracle
 *
 * Builds on the existing multiChainConfig from contracts package and extends
 * it with Oracle-specific configuration parameters to support multi-chain
 * Oracle deployment with a single Airnode instance.
 */

import fs from "node:fs";
import path from "node:path";
import {
  type SupportedChainId,
  availableChainIds,
  chains,
  networkNames,
} from "@ethereum-tag-service/contracts/multiChainConfig";

/**
 * Extended chain configuration with Oracle-specific parameters
 */
export interface OracleChainConfig {
  chainId: SupportedChainId;
  name: string;
  networkName: string;
  rpcUrl: string;
  rpcEnvKey: string;
  deploymentPath: string;
  providerName: string;
  /** Optional configuration for chain-specific parameters */
  oracleParams?: {
    /** Default gas price for this chain (in wei) */
    gasPrice?: string;
    /** Test target ID for this chain */
    testTargetId?: string;
  };
}

/**
 * Oracle Chain Configuration Registry
 */
export const ORACLE_CHAIN_CONFIGS: Record<SupportedChainId, OracleChainConfig> = {
  "421614": {
    // Arbitrum Sepolia
    chainId: "421614",
    name: chains["421614"].name,
    networkName: networkNames["421614"],
    rpcUrl: process.env.ARBITRUM_SEPOLIA_URL || chains["421614"].rpcUrls.default.http[0],
    rpcEnvKey: "ARBITRUM_SEPOLIA_URL",
    deploymentPath: "arbitrumSepoliaStaging",
    providerName: "arbitrumSepolia",
    oracleParams: {
      gasPrice: "100000000", // 0.1 gwei
    },
  },
  "84532": {
    // Base Sepolia
    chainId: "84532",
    name: chains["84532"].name,
    networkName: networkNames["84532"],
    rpcUrl: process.env.BASE_SEPOLIA_URL || chains["84532"].rpcUrls.default.http[0],
    rpcEnvKey: "BASE_SEPOLIA_URL",
    deploymentPath: "baseSepoliaStaging",
    providerName: "baseSepolia",
    oracleParams: {
      gasPrice: "100000000", // 0.1 gwei
    },
  },
  /*   "31337": {
    // Hardhat - for local testing
    chainId: "31337",
    name: chains["31337"].name,
    networkName: networkNames["31337"],
    rpcUrl: "http://localhost:8545",
    rpcEnvKey: "HARDHAT_URL",
    deploymentPath: "hardhat",
    providerName: "hardhat",
  }, */
};

/**
 * Default primary chain ID - used when no specific chain is provided
 */
export const DEFAULT_PRIMARY_CHAIN_ID: SupportedChainId = "421614"; // Arbitrum Sepolia

/**
 * Get Oracle chain configuration by chain ID
 * @param chainId The chain ID to look up
 * @returns The Oracle chain configuration
 */
export function getOracleChainConfig(chainId: SupportedChainId): OracleChainConfig {
  const config = ORACLE_CHAIN_CONFIGS[chainId];
  if (!config) {
    throw new Error(`Chain configuration not found for chainId: ${chainId}`);
  }
  return config;
}

/**
 * Get the list of supported chain IDs for the Oracle
 * @returns Array of supported chain IDs
 */
export function getSupportedOracleChainIds(): SupportedChainId[] {
  return Object.keys(ORACLE_CHAIN_CONFIGS) as SupportedChainId[];
}

/**
 * Check if the chain ID is supported by the Oracle
 * @param chainId The chain ID to check
 * @returns True if the chain is supported, false otherwise
 */
export function isSupportedOracleChain(chainId: string | number): boolean {
  return Object.keys(ORACLE_CHAIN_CONFIGS).includes(chainId.toString());
}

/**
 * Get the configuration file name suffix for a specific chain
 * Used for creating chain-specific config files
 * @param chainId The chain ID
 * @returns String suffix for the configuration files
 */
export function getConfigFileSuffix(chainId: SupportedChainId): string {
  // Default chain (Arbitrum Sepolia) has no suffix to maintain backward compatibility
  if (chainId === DEFAULT_PRIMARY_CHAIN_ID) {
    return "";
  }

  const config = getOracleChainConfig(chainId);
  return `-${config.name.toLowerCase().replace(/\s+/g, "-")}`;
}

/**
 * Get the contract deployment path for a specific chain
 * @param chainId The chain ID
 * @returns The path where contract artifacts are stored
 */
export function getContractDeploymentPath(chainId: SupportedChainId): string {
  const config = getOracleChainConfig(chainId);
  return config.deploymentPath;
}

/**
 * Get the RPC URL for a specific chain
 * @param chainId The chain ID
 * @returns The RPC URL
 */
export function getChainRpcUrl(chainId: SupportedChainId): string {
  const config = getOracleChainConfig(chainId);
  return config.rpcUrl;
}

/**
 * Get the path to the configuration details file for a specific chain
 * @param chainId The chain ID
 * @param configDir The base configuration directory
 * @returns The path to the configuration details file
 */
export function getConfigDetailsPath(chainId: SupportedChainId, configDir: string): string {
  const suffix = getConfigFileSuffix(chainId);
  return path.join(configDir, `configuration-details${suffix}.json`);
}

/**
 * Get the default primary chain ID
 * This is used when no specific chain is specified
 * @returns The default primary chain ID
 */
export function getDefaultPrimaryChainId(): SupportedChainId {
  return DEFAULT_PRIMARY_CHAIN_ID;
}

/**
 * Get chain-specific directory path
 * Creates subdirectories for each chain to organize configuration files
 * @param baseDir The base directory
 * @param chainId The chain ID
 * @returns The chain-specific directory path
 */
export function getChainSpecificDirectory(baseDir: string, chainId: SupportedChainId): string {
  // No subdirectory for primary chain to maintain backward compatibility
  if (chainId === DEFAULT_PRIMARY_CHAIN_ID) {
    return baseDir;
  }

  const config = getOracleChainConfig(chainId);
  const dirPath = path.join(baseDir, config.networkName);

  // Create directory if it doesn't exist
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  return dirPath;
}

/**
 * Format chain name for display purposes
 * @param chainId The chain ID
 * @returns Formatted chain name
 */
export function formatChainName(chainId: SupportedChainId): string {
  const config = getOracleChainConfig(chainId);
  return config.name;
}

/**
 * Get chain-specific test parameters
 * Used for verifying and testing oracle functionality
 * @param chainId The chain ID
 * @returns Chain-specific test parameters
 */
export function getChainTestParameters(chainId: SupportedChainId): Record<string, any> {
  const config = getOracleChainConfig(chainId);

  return {
    chainId: chainId,
    targetId: config.oracleParams?.testTargetId || process.env.TEST_TARGET_ID,
    gasPrice: config.oracleParams?.gasPrice || "100000000", // Default 0.1 gwei
    returnType: "json",
    staging: "true",
  };
}
