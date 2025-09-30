import type { Address, Hash } from "viem";

// Workflow Input Types
export interface TargetEnrichmentWorkflowInput {
  targetId: string;
  targetURI?: string; // Optional - workflow will call offchain-api which fetches this from contract
  transactionHash: Hash;
  blockNumber: string; // String for Temporal payload serialization
  chainId: number;
  timestamp: Date;
}

export interface TagCreatedWorkflowInput {
  coinAddress: Address;
  originalInput: string;
  displayVersion: string;
  machineName: string;
  creator: Address;
  channel: Address;
  transactionHash: Hash;
  blockNumber: string; // String for Temporal payload serialization
  chainId: number;
  timestamp: string; // ISO string for Temporal payload serialization
}

// Activity Result Types
export interface MetadataFetchResult {
  title?: string;
  description?: string;
  image?: string;
  keywords?: string[];
  targetType?: string;
  status: "success" | "failed";
  error?: string;
}

// Arweave removed - using direct event emission instead

export interface EnrichmentEventResult {
  transactionHash: Hash;
  status: "success" | "failed";
  error?: string;
}

export interface ZoraCoinCreationResult {
  coinAddress: Address;
  transactionHash: Hash;
  metadataURI: string;
  status: "success" | "failed";
  error?: string;
}

// Workflow Result Types
export interface TargetEnrichmentResult {
  targetId: string;
  enrichmentTransactionHash?: Hash;
  metadata?: MetadataFetchResult;
  status: "completed" | "failed" | "partial";
  steps: {
    fetchMetadata: boolean;
    emitEnrichmentEvent: boolean;
  };
  error?: string;
}

export interface TagCreatedResult {
  tagId: string;
  coinAddress?: Address;
  zoraTxHash?: Hash;
  status: "completed" | "failed" | "partial";
  steps: {
    createMetadata: boolean;
    deployOnZora: boolean;
    allocateRewards: boolean;
  };
  error?: string;
}

// Event Types from blockchain
export interface TargetCreatedEvent {
  targetId: string;
  targetURI: string;
  targetType: number;
  created: Address;
  transactionHash: Hash;
  blockNumber: bigint;
  logIndex: number;
}

export interface TagCreatedEvent {
  tagId: string;
  coinAddress: Address;
  tagString: string;
  creator: Address;
  transactionHash: Hash;
  blockNumber: bigint;
  logIndex: number;
}

export interface EnrichTargetRequestedEvent {
  targetId: string;
  requester: Address;
  transactionHash: Hash;
  blockNumber: bigint;
  logIndex: number;
}
