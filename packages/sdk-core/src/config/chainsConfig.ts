/**
 * Configuration module for supported blockchain chains in the Ethereum Tag Service
 */

import {
  type SupportedChain,
  type SupportedChainId,
  availableChainIds,
  chains,
} from "@ethereum-tag-service/contracts/multiChainConfig";

// Re-export types and values for use in other modules
export type { SupportedChainId, SupportedChain };
export { availableChainIds };

/**
 * Returns chain configuration for a specific chain ID or defaults to first available chain
 * @param chainId - Optional blockchain network ID
 * @returns Chain configuration object containing network details
 */
export const chainsMap = (chainId?: number) =>
  chainId ? chains[chainId.toString() as SupportedChainId] : Object.values(chains)[0];
