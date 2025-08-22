export interface TagCreatedEvent {
  coinAddress: string;
  originalInput: string;
  displayVersion: string;
  machineName: string;
  creator: string;
  relayer: string;
  timestamp: bigint;
  blockNumber: bigint;
  transactionHash: string;
}

export interface ZoraCoinCreationRequest {
  tagData: TagCreatedEvent;
  chainId: number;
}

export interface ZoraCoinCreationResponse {
  success: boolean;
  zoraCoinAddress?: string;
  transactionHash?: string;
  error?: string;
}

export interface TargetCreatedEvent {
  targetId: bigint;
  blockNumber: bigint;
  transactionHash: string;
}

export interface TargetEnrichmentRequest {
  targetId: string;
  chainId: number;
}

export interface TargetEnrichmentResponse {
  success: boolean;
  txId?: string;
  httpStatus?: number;
  error?: string;
}

export interface EnrichTargetRequestedEvent {
  targetId: bigint;
  requestor: string;
  blockNumber: bigint;
  transactionHash: string;
}

export interface EventProcessorConfig {
  environment: "staging" | "production" | "development" | "localhost";
  chainId: number;
  rpcUrl: string;
  etsTokenAddress: string;
  etsTargetAddress: string;
  etsEnrichTargetAddress: string;
  subgraphUrl: string;
  offchainApiUrl: string;
  offchainApiKey?: string;
  logLevel: string;
  privateKey?: string;
}
