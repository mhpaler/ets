import type { PublicClient, WalletClient } from "viem";
import { getComponentLogger } from "./logger";

const logger = getComponentLogger("TransactionManager");

export interface TransactionOptions {
  maxRetryTime?: number; // Default: 5 minutes
  initialRetryDelay?: number; // Default: 1 second
  maxRetryDelay?: number; // Default: 30 seconds
  retryableErrors?: string[]; // Default: ["nonce", "network", "timeout"]
}

const DEFAULT_OPTIONS: Required<TransactionOptions> = {
  maxRetryTime: 5 * 60 * 1000, // 5 minutes
  initialRetryDelay: 1000, // 1 second
  maxRetryDelay: 30000, // 30 seconds
  retryableErrors: ["nonce", "network", "timeout"],
};

/**
 * Execute a blockchain transaction with automatic retry on nonce conflicts and network errors.
 * Uses exponential backoff strategy.
 *
 * @example
 * ```ts
 * const hash = await executeWithRetry(
 *   publicClient,
 *   walletClient,
 *   async () => {
 *     const { request } = await publicClient.simulateContract({
 *       address: contractAddress,
 *       abi: contractABI,
 *       functionName: "myFunction",
 *       args: [arg1, arg2],
 *       account,
 *     });
 *     return await walletClient.writeContract(request);
 *   },
 *   { contextInfo: { operation: "myFunction", contractAddress } }
 * );
 * ```
 */
export async function executeWithRetry<T>(
  _publicClient: unknown,
  _walletClient: unknown,
  transaction: () => Promise<T>,
  options: TransactionOptions & { contextInfo?: Record<string, unknown> } = {},
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const startTime = Date.now();
  let retryDelay = opts.initialRetryDelay;
  let lastError: Error | null = null;

  while (Date.now() - startTime < opts.maxRetryTime) {
    try {
      // Execute the transaction
      return await transaction();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      const errorMessage = lastError.message.toLowerCase();

      // Check if error is retryable
      const isRetryable = opts.retryableErrors.some((retryableError) => errorMessage.includes(retryableError));

      if (isRetryable) {
        logger.warn(
          {
            ...options.contextInfo,
            error: errorMessage,
            retryDelay,
            elapsedTime: Date.now() - startTime,
          },
          "Transaction failed, retrying with exponential backoff...",
        );

        // Wait before retrying
        await new Promise((r) => setTimeout(r, retryDelay));

        // Exponential backoff with max limit
        retryDelay = Math.min(retryDelay * 2, opts.maxRetryDelay);
        continue; // Retry
      }

      // Non-retryable error, throw immediately
      throw error;
    }
  }

  // Max retry time exceeded
  const timeoutError = new Error(
    `Transaction retry timeout exceeded (${opts.maxRetryTime / 1000}s). Last error: ${lastError?.message}`,
  );
  logger.error(
    {
      ...options.contextInfo,
      error: timeoutError.message,
    },
    "Failed to execute transaction after max retries",
  );
  throw timeoutError;
}
