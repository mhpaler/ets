/**
 * Configuration module for supported blockchain chains in the Ethereum Tag Service
 */

import { type SupportedChain, type SupportedChainId, chains } from "@ethereum-tag-service/contracts";

// Re-export types for use in other modules
export type { SupportedChainId, SupportedChain };

/**
 * Array of all supported chain IDs in the system
 */
export const availableChainIds = Object.keys(chains) as SupportedChainId[];

/**
 * Returns chain configuration for a specific chain ID or defaults to first available chain
 * @param chainId - Optional blockchain network ID
 * @returns Chain configuration object containing network details
 */
export const chainsMap = (chainId?: number) =>
  chainId ? chains[chainId.toString() as SupportedChainId] : Object.values(chains)[0];
