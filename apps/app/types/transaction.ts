import type { Abi } from "viem";
import type { SimulateContractParameters } from "wagmi/actions";

//export type TransactionStage = "Preparing" | "Waiting for Signature" | "Sent" | "Processing" | "Completed" | "Failed";
//
//export type TransactionStatus = {
//  loading: boolean;
//  success: boolean;
//  error: Error | null;
//  stage: TransactionStage | null;
//};
//

// TransactionTypes.ts
export enum TransactionType {
  AddRelayer = 0,
  Bid = 1,
  SettleAuction = 2,
}

export type TransactionState = {
  isPending: boolean; // Waiting for signature
  isSuccess: boolean; // Transaction complete
  isError: boolean;
  hash: string | null; // Transaction submitted
  errorMessage: string | null;
};

export type TransactionInitiateConfig = {
  abi: Abi;
  address: `0x${string}`;
  functionName: string;
  args?: any[];
  value?: bigint;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
};

// Define the type for the context, referencing TransactionState and including function signatures
export type TransactionContextType = TransactionState & {
  initiateTransaction: (config: SimulateContractParameters) => Promise<void>;
  resetTransaction: () => void;
};
