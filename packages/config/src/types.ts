/**
 * Core type definitions for ETS configuration system
 */

import type { Address, Chain } from "viem";

/**
 * Environment names used across the monorepo
 */
export type EnvironmentName = "local" | "staging" | "production";

/**
 * Network configuration for blockchain connections
 */
export interface NetworkConfig {
  name: string;
  chainId: number;
  chain: Chain;
  rpcUrl: string;
  blockExplorer?: string;
  // Optional overrides
  alchemyApiKey?: string;
  infuraApiKey?: string;
}

/**
 * Contract addresses for a specific network
 */
export interface ContractAddresses {
  // Core contracts
  accessControls?: Address;
  core?: Address;
  token?: Address;
  target?: Address;
  channelFactory?: Address;

  // Test/Mock contracts
  mockZoraFactory?: Address;
  testChannel?: Address;

  // External contracts
  zoraFactory?: Address;

  // Deployment metadata
  deploymentBlock?: number;
  deploymentDate?: string;
}

/**
 * Service URLs and endpoints
 */
export interface ServiceConfig {
  temporal?: {
    serverUrl: string;
    namespace: string;
    taskQueue: string;
    workerId?: string;
    uiUrl?: string;
  };

  subgraph?: {
    url: string;
    queryUrl?: string;
  };

  offchainApi?: {
    url: string;
    apiKey?: string;
  };

  arweave?: {
    gateway: string;
  };

  ipfs?: {
    gateway: string;
    apiUrl?: string;
  };
}

/**
 * Wallet and account configuration
 */
export interface WalletConfig {
  mnemonic?: string;
  privateKey?: string;
  hdPath?: string;

  // HD wallet positions for different roles
  accounts?: {
    deployer: number; // Position 0
    admin: number; // Position 1
    eventProcessor: number; // Position 2
    zora: number; // Position 3
    tester: number; // Position 4+
  };
}

/**
 * Test-specific configuration
 */
export interface TestConfig {
  // Behavior flags
  readOnly: boolean;
  requiresLocalStack: boolean;
  skipSlowTests: boolean;

  // Timeouts (in milliseconds)
  timeouts: {
    transaction: number;
    enrichment: number;
    tagCreation: number;
    serviceHealth: number;
    workflowCompletion: number;
  };

  // Service validation
  validation: {
    checkHardhat: boolean;
    checkTemporal: boolean;
    checkSubgraph: boolean;
  };
}

/**
 * Complete environment configuration
 */
export interface Environment {
  // Core identifiers
  name: EnvironmentName;
  displayName: string;

  // Components
  network: NetworkConfig;
  contracts?: ContractAddresses;
  services: ServiceConfig;
  wallet?: WalletConfig;
  testing: TestConfig;

  // Feature flags
  features?: {
    tagCoins: boolean;
    targetEnrichment: boolean;
    zoraIntegration: boolean;
  };
}

/**
 * Configuration source priority (higher number = higher priority)
 */
export enum ConfigPriority {
  DEFAULTS = 0,
  ROOT_ENV = 1,
  NETWORK_ENV = 2,
  LOCAL_ENV = 3,
  RUNTIME = 4,
}

/**
 * Options for loading configuration
 */
export interface ConfigOptions {
  // Override environment detection
  environment?: EnvironmentName;

  // Additional env files to load
  envFiles?: string[];

  // Validation options
  validate?: boolean;
  strict?: boolean;

  // Logging
  debug?: boolean;
}

/**
 * Validation result for configuration
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}
