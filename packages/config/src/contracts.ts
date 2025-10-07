/**
 * Contract configuration management
 * Integrates with @ethereum-tag-service/contracts package
 */

import type { Address } from "viem";
import type { ContractAddresses, Environment } from "./types";

/**
 * Get contract addresses for the current environment
 * Wraps the contracts package with environment-aware logic
 */
export async function getContractConfig(env: Environment): Promise<ContractAddresses> {
  const { chainId } = env.network;

  // Map chainId to network name used in deployments
  const networkName = {
    31337: "localhost",
    84532: "baseSepolia",
    8453: "base",
  }[chainId];

  if (!networkName) {
    throw new Error(`No contract deployments for chain ${chainId}`);
  }

  try {
    // Dynamically import from contracts package
    const contractsModule = "@ethereum-tag-service/contracts/deployments";
    // @ts-ignore - Dynamic import may not be available during build
    const { getContractAddresses } = await import(contractsModule);
    const addresses = await getContractAddresses(networkName as any);

    if (!addresses) {
      throw new Error(`No contracts deployed on ${networkName}`);
    }

    // Add environment-specific logic
    const config: ContractAddresses = {
      // Core contracts from deployments
      accessControls: addresses.accessControls as Address,
      core: addresses.core as Address,
      token: addresses.token as Address,
      target: addresses.target as Address,
      channelFactory: addresses.channelFactory as Address,

      // Mock contracts (local only)
      mockZoraFactory: env.name === "local" ? (addresses.mockZoraFactory as Address) : undefined,

      // External contracts (production only)
      zoraFactory:
        env.name === "production"
          ? ("0x7777777733606e45c3CdD4A70CEE5F766Ae6745C" as Address) // Real Zora factory on Base
          : env.name === "staging"
            ? ("0x7777777733606e45c3CdD4A70CEE5F766Ae6745C" as Address) // Same on testnet
            : undefined,

      // Deployment metadata
      deploymentBlock: addresses.deploymentBlock,
    };

    return config;
  } catch (error: any) {
    // If contracts package not available or no deployments
    console.warn(`Contract loading failed: ${error.message}`);
    return {};
  }
}

/**
 * Validate that required contracts are deployed
 */
export function validateContracts(
  contracts: ContractAddresses,
  required: string[] = ["core", "token", "target"],
): { valid: boolean; missing: string[] } {
  const missing: string[] = [];

  for (const name of required) {
    if (!contracts[name as keyof ContractAddresses]) {
      missing.push(name);
    }
  }

  return {
    valid: missing.length === 0,
    missing,
  };
}

/**
 * Get a specific contract address with validation
 */
export function requireContract(contracts: ContractAddresses, name: keyof ContractAddresses): Address {
  const address = contracts[name];
  if (!address || typeof address !== "string") {
    throw new Error(`Contract ${name} not deployed`);
  }
  return address as Address;
}

/**
 * Re-export contract ABIs for convenience
 * These are imported dynamically to handle ES module compatibility
 */
export async function getContractABIs() {
  try {
    const abisModule = "@ethereum-tag-service/contracts/abis";
    // @ts-ignore - Dynamic import may not be available during build
    const abis = await import(abisModule);
    return {
      ETSTokenABI: abis.ETSTokenABI,
      ETSTargetABI: abis.ETSTargetABI,
      ETSAccessControlsABI: abis.ETSAccessControlsABI,
      ETSCoreABI: abis.ETSCoreABI,
      ETSChannelABI: abis.ETSChannelABI,
      ETSChannelFactoryABI: abis.ETSChannelFactoryABI,
      MockZoraFactoryABI: abis.MockZoraFactoryABI,
    };
  } catch (error) {
    console.warn("Contract ABIs not available:", error);
    return {};
  }
}
