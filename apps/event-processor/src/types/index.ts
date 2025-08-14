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

export interface EventProcessorConfig {
  environment: "staging" | "production" | "development";
  chainId: number;
  rpcUrl: string;
  etsTokenAddress: string;
  subgraphUrl: string;
  offchainApiUrl: string;
  offchainApiKey?: string;
  logLevel: string;
  privateKey?: string;
}
