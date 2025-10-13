/**
 * Validation schemas for configuration
 */

import { z } from "zod";
import type { ValidationResult } from "./types.js";

// Ethereum address regex
const ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;

// Environment name schema
export const EnvironmentNameSchema = z.enum(["local", "staging", "production"]);

// Network configuration schema
export const NetworkConfigSchema = z.object({
  name: z.string(),
  chainId: z.number().positive(),
  chain: z.any(), // viem Chain object
  rpcUrl: z.string().url().or(z.string().startsWith("http://localhost")),
  blockExplorer: z.string().url().optional(),
  alchemyApiKey: z.string().optional(),
  infuraApiKey: z.string().optional(),
});

// Contract addresses schema
export const ContractAddressesSchema = z.object({
  accessControls: z.string().regex(ADDRESS_REGEX).optional(),
  core: z.string().regex(ADDRESS_REGEX).optional(),
  token: z.string().regex(ADDRESS_REGEX).optional(),
  target: z.string().regex(ADDRESS_REGEX).optional(),
  channelFactory: z.string().regex(ADDRESS_REGEX).optional(),
  mockZoraFactory: z.string().regex(ADDRESS_REGEX).optional(),
  testChannel: z.string().regex(ADDRESS_REGEX).optional(),
  zoraFactory: z.string().regex(ADDRESS_REGEX).optional(),
  deploymentBlock: z.number().optional(),
  deploymentDate: z.string().optional(),
});

// Temporal configuration schema
export const TemporalConfigSchema = z.object({
  serverUrl: z.string(),
  namespace: z.string(),
  taskQueue: z.string(),
  workerId: z.string().optional(),
  uiUrl: z.string().url().optional(),
});

// Service configuration schema
export const ServiceConfigSchema = z.object({
  temporal: TemporalConfigSchema.optional(),
  subgraph: z
    .object({
      url: z.string().url(),
      queryUrl: z.string().url().optional(),
    })
    .optional(),
  offchainApi: z
    .object({
      url: z.string().url().or(z.string().startsWith("http://localhost")),
      apiKey: z.string().optional(),
    })
    .optional(),
  arweave: z
    .object({
      gateway: z.string().url(),
    })
    .optional(),
  ipfs: z
    .object({
      gateway: z.string().url(),
      apiUrl: z.string().url().optional(),
    })
    .optional(),
});

// Wallet configuration schema
export const WalletConfigSchema = z.object({
  mnemonic: z.string().optional(),
  privateKey: z.string().optional(),
  hdPath: z.string().optional(),
  accounts: z
    .object({
      deployer: z.number(),
      admin: z.number(),
      eventProcessor: z.number(),
      zora: z.number(),
      tester: z.number(),
    })
    .optional(),
});

// Test configuration schema
export const TestConfigSchema = z.object({
  readOnly: z.boolean(),
  requiresLocalStack: z.boolean(),
  skipSlowTests: z.boolean(),
  timeouts: z.object({
    transaction: z.number().positive(),
    enrichment: z.number().positive(),
    tagCreation: z.number().positive(),
    serviceHealth: z.number().positive(),
    workflowCompletion: z.number().positive(),
  }),
  validation: z.object({
    checkHardhat: z.boolean(),
    checkTemporal: z.boolean(),
    checkSubgraph: z.boolean(),
  }),
});

// Feature flags schema
export const FeaturesSchema = z.object({
  tagCoins: z.boolean(),
  targetEnrichment: z.boolean(),
  zoraIntegration: z.boolean(),
});

// Complete environment schema
export const EnvironmentSchema = z.object({
  name: EnvironmentNameSchema,
  displayName: z.string(),
  network: NetworkConfigSchema,
  contracts: ContractAddressesSchema.optional(),
  services: ServiceConfigSchema,
  wallet: WalletConfigSchema.optional(),
  testing: TestConfigSchema,
  features: FeaturesSchema.optional(),
});

/**
 * Validate environment configuration
 */
export function validateEnvironment(env: unknown): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    const result = EnvironmentSchema.parse(env);

    // Additional business logic validations
    if (result.name === "production") {
      if (!result.wallet?.mnemonic && !result.wallet?.privateKey) {
        warnings.push("Production environment has no wallet configured");
      }
      if (result.testing.readOnly === false) {
        errors.push("Production environment must be read-only for testing");
      }
    }

    if (result.name === "local") {
      if (!result.services.temporal) {
        warnings.push("Local environment has no Temporal configuration");
      }
      if (result.network.chainId !== 31337) {
        errors.push("Local environment must use chain ID 31337");
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      for (const issue of error.issues) {
        errors.push(`${issue.path.join(".")}: ${issue.message}`);
      }
    } else {
      errors.push(String(error));
    }

    return {
      valid: false,
      errors,
      warnings,
    };
  }
}

/**
 * Validate required environment variables
 */
export function validateEnvVars(required: string[]): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  for (const varName of required) {
    if (!process.env[varName]) {
      errors.push(`Missing required environment variable: ${varName}`);
    }
  }

  // Check for exposed secrets
  const sensitiveVars = ["MNEMONIC", "PRIVATE_KEY", "API_SECRET"];
  for (const varName of sensitiveVars) {
    if (process.env[varName] && !varName.includes("LOCAL")) {
      warnings.push(`Sensitive variable ${varName} is set - ensure it's not committed`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate contract deployment
 */
export function validateContractDeployment(
  contracts: unknown,
  requiredContracts: string[] = ["core", "token", "target"],
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    const parsed = ContractAddressesSchema.parse(contracts);

    for (const name of requiredContracts) {
      if (!parsed[name as keyof typeof parsed]) {
        errors.push(`Missing required contract: ${name}`);
      }
    }

    if (!parsed.deploymentBlock) {
      warnings.push("No deployment block recorded");
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      for (const issue of error.issues) {
        errors.push(`${issue.path.join(".")}: ${issue.message}`);
      }
    }

    return {
      valid: false,
      errors,
      warnings,
    };
  }
}
