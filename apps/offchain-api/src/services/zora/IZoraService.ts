import type { Address } from "viem";

/**
 * Common interface for all Zora service implementations
 * Allows switching between SDK and Factory implementations seamlessly
 */
export interface TagCreatedEventData {
  coinAddress: string; // Predicted Zora coin address from ETS contract
  originalInput: string; // Exact user input (e.g., "#TestTag")
  displayVersion: string; // Canonical display format
  machineName: string; // Normalized identifier
  creator: string;
  relayer: string;
  timestamp: string; // Block timestamp (converted from BigInt)
  blockNumber: string; // Block number (converted from BigInt)
  transactionHash: string; // Transaction hash that created the TAG
}

export interface ZoraCoinCreationResult {
  success: boolean;
  coinAddress?: Address;
  transactionHash?: `0x${string}`;
  blockNumber?: bigint;
  error?: string;
  created?: boolean; // Indicates if coin was newly created vs already existed
}

export interface IZoraService {
  /**
   * Create a new TAG coin on Zora platform
   */
  createCoin(eventData: TagCreatedEventData): Promise<ZoraCoinCreationResult>;

  /**
   * Check if a coin already exists for given event data
   */
  coinExists(eventData: TagCreatedEventData): Promise<boolean>;

  /**
   * Predict the coin address for given event data
   */
  predictCoinAddress(eventData: TagCreatedEventData): Promise<Address>;
}
