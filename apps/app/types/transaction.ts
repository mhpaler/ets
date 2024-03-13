export type TransactionStage = "Preparing" | "Waiting for Signature" | "Sent" | "Processing" | "Completed" | "Failed";

export type TransactionStatus = {
  loading: boolean;
  success: boolean;
  error: Error | null;
  stage: TransactionStage | null;
};
