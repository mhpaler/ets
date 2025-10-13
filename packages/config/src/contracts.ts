/**
 * Contract configuration management
 * Integrates with @ethereum-tag-service/contracts package
 */

import * as ABIs from "@ethereum-tag-service/contracts/abis";
import { getContractAddresses } from "@ethereum-tag-service/contracts/deployments";
import type { Address } from "viem";
import type { ContractAddresses, Environment } from "./types.js";

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
    // Get contract addresses from contracts package
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
 */
export function getContractABIs() {
  return {
    ETSTokenABI: ABIs.ETSTokenABI,
    ETSTargetABI: ABIs.ETSTargetABI,
    ETSAccessControlsABI: ABIs.ETSAccessControlsABI,
    ETSCoreABI: ABIs.ETSCoreABI,
    ETSChannelABI: ABIs.ETSChannelABI,
    ETSChannelFactoryABI: ABIs.ETSChannelFactoryABI,
  };
}
