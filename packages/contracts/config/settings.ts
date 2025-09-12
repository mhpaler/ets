import { parseEther } from "viem";

/**
 * ETS System Configuration Settings
 * 
 * Centralized configuration for all ETS system parameters.
 * Used by both test fixtures and deployment scripts.
 */

export interface ETSSettings {
  // Token Configuration
  TAG_MIN_STRING_LENGTH: number;
  TAG_MAX_STRING_LENGTH: number;
  
  // Target Configuration
  TARGET_MAX_STRING_LENGTH: number;
  
  // Platform Configuration
  TAGGING_FEE: string;  // ETH amount as string for compatibility
  PLATFORM_PERCENTAGE: number;
  RELAYER_PERCENTAGE: number;
  TAGGING_FEE_PLATFORM_PERCENTAGE: number;
  TAGGING_FEE_RELAYER_PERCENTAGE: number;
  
  // Auction Configuration (legacy, may be removed)
  OWNERSHIP_TERM_LENGTH: number;
  MAX_AUCTIONS: number;
  TIME_BUFFER: number;
  RESERVE_PRICE: string;
  MIN_INCREMENT_BID_PERCENTAGE: number;
  DURATION: number;
  CREATOR_PERCENTAGE: number;
  
  // Relayer Configuration
  RELAYER_NAME: string;
  RELAYER_SYMBOL: string;
  
  // Zora Configuration (network-specific)
  ZORA_FACTORY_ADDRESS?: string;
  ZORA_POOL_CONFIG?: string;
}

/**
 * Default settings for all networks
 */
export const DEFAULT_SETTINGS: ETSSettings = {
  // Token Configuration
  TAG_MIN_STRING_LENGTH: 2,
  TAG_MAX_STRING_LENGTH: 32,
  
  // Target Configuration
  TARGET_MAX_STRING_LENGTH: 512,
  
  // Platform Configuration
  TAGGING_FEE: "0.0001",
  PLATFORM_PERCENTAGE: 40,
  RELAYER_PERCENTAGE: 20,
  TAGGING_FEE_PLATFORM_PERCENTAGE: 20,
  TAGGING_FEE_RELAYER_PERCENTAGE: 30,
  
  // Auction Configuration (legacy)
  OWNERSHIP_TERM_LENGTH: 730,
  MAX_AUCTIONS: 1,
  TIME_BUFFER: 600,
  RESERVE_PRICE: "2",
  MIN_INCREMENT_BID_PERCENTAGE: 5,
  DURATION: 30 * 60, // 30 minutes
  CREATOR_PERCENTAGE: 40,
  
  // Relayer Configuration
  RELAYER_NAME: "ETS Relayer",
  RELAYER_SYMBOL: "ETSR",
};

/**
 * Network-specific overrides
 */
export const NETWORK_SETTINGS: Record<number, Partial<ETSSettings>> = {
  // Localhost (Hardhat)
  31337: {
    TAGGING_FEE: "0.1",  // Higher for testing
    // MockZoraFactory will be deployed locally
  },
  
  // Base Sepolia (Staging)
  84532: {
    TAGGING_FEE: "0.00001",
    // TODO: Add actual Zora testnet addresses
  },
  
  // Base Mainnet (Production)
  8453: {
    TAGGING_FEE: "0.0001",
    // TODO: Add actual Zora mainnet addresses
    // ZORA_FACTORY_ADDRESS: "0x...",
  },
};

/**
 * Get settings for a specific network
 */
export function getNetworkSettings(chainId: number): ETSSettings {
  return {
    ...DEFAULT_SETTINGS,
    ...NETWORK_SETTINGS[chainId],
  };
}