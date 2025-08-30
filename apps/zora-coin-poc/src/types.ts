/**
 * Types for Zora Content Coin Creation POC
 *
 * This POC demonstrates programmatic creation of Zora content coins
 * using Coinbase Smart Wallet dual-owner architecture with Account Abstraction.
 */

// Account Abstraction Types
export interface UserOperation {
  sender: `0x${string}`;
  nonce: bigint;
  factory?: `0x${string}`;
  factoryData?: `0x${string}`;
  callData: `0x${string}`;
  callGasLimit: bigint;
  verificationGasLimit: bigint;
  preVerificationGas: bigint;
  maxFeePerGas: bigint;
  maxPriorityFeePerGas: bigint;
  paymaster?: `0x${string}`;
  paymasterVerificationGasLimit?: bigint;
  paymasterPostOpGasLimit?: bigint;
  paymasterData?: `0x${string}`;
  signature: `0x${string}`;
}

// Zora Coin Deployment Parameters
export interface CoinDeployParams {
  payoutRecipient: `0x${string}`;
  owners: `0x${string}`[];
  uri: string;
  name: string;
  symbol: string;
  poolConfig: `0x${string}`;
  platformReferrer: `0x${string}`;
  postDeployHook: `0x${string}`;
  postDeployHookData: `0x${string}`;
  coinSalt: `0x${string}`;
}

// Smart Wallet Configuration
export interface SmartWalletConfig {
  address: `0x${string}`;
  owners: {
    eoa: `0x${string}`;
    privy: `0x${string}`;
  };
  entryPoint: `0x${string}`;
}

// Environment Configuration
export interface Config {
  rpcUrl: string;
  alchemyApiKey?: string;
  offchainApiUrl: string;
  smartWallet: SmartWalletConfig;
  zoraFactory: `0x${string}`;
  coinDefaults: {
    name: string;
    symbol: string;
    uri: string;
    platformReferrer: `0x${string}`;
  };
}

// Metadata Generation
export interface TagMetadataRequest {
  tagString: string;
  machineName: string;
  creator: string;
  relayer: string;
}

// Test Results
export interface TestResult {
  signer: "eoa" | "privy";
  success: boolean;
  userOpHash?: `0x${string}`;
  transactionHash?: `0x${string}`;
  coinAddress?: `0x${string}`;
  metadataUri?: string;
  error?: string;
}
