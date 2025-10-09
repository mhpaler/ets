import type { Abi, Log, PublicClient } from "viem";
import { getComponentLogger } from "./logger";

const logger = getComponentLogger("EventScanner");

export interface ScanConfig {
  contractAddress: string;
  abi: Abi;
  eventName: string;
  fromBlock: bigint;
  toBlock: bigint;
  chunkSize: number;
}

export interface ScanProgress {
  currentBlock: bigint;
  totalBlocks: bigint;
  chunksCompleted: number;
  totalChunks: number;
  eventsFound: number;
}

/**
 * Scan historical events in chunks to avoid RPC provider limits.
 *
 * Alchemy PAYG limits:
 * - Free tier: 10 blocks
 * - PAYG: ~10,000 blocks
 *
 * This function breaks large block ranges into smaller chunks and processes
 * them sequentially, allowing for checkpoint updates between chunks.
 */
export async function scanHistoricalEvents(
  client: PublicClient,
  config: ScanConfig,
  onLogs: (logs: Log[]) => Promise<void>,
  onProgress?: (progress: ScanProgress) => void,
): Promise<void> {
  const { contractAddress, abi, eventName, fromBlock, toBlock, chunkSize } = config;

  const totalBlocks = toBlock - fromBlock + 1n;
  const totalChunks = Number((totalBlocks + BigInt(chunkSize) - 1n) / BigInt(chunkSize));

  logger.info(
    {
      fromBlock: fromBlock.toString(),
      toBlock: toBlock.toString(),
      totalBlocks: totalBlocks.toString(),
      chunkSize,
      totalChunks,
      eventName,
    },
    "Starting chunked historical event scan",
  );

  let chunksCompleted = 0;
  let eventsFound = 0;
  let currentFrom = fromBlock;

  while (currentFrom <= toBlock) {
    const currentTo = currentFrom + BigInt(chunkSize) - 1n > toBlock ? toBlock : currentFrom + BigInt(chunkSize) - 1n;

    try {
      logger.debug(
        {
          chunk: `${chunksCompleted + 1}/${totalChunks}`,
          fromBlock: currentFrom.toString(),
          toBlock: currentTo.toString(),
          eventName,
        },
        "Scanning chunk",
      );

      const logs = await client.getContractEvents({
        address: contractAddress as `0x${string}`,
        abi,
        eventName,
        fromBlock: currentFrom,
        toBlock: currentTo,
      });

      if (logs.length > 0) {
        logger.info(
          {
            count: logs.length,
            fromBlock: currentFrom.toString(),
            toBlock: currentTo.toString(),
            eventName,
          },
          "Found events in chunk",
        );

        // Process the logs
        await onLogs(logs);
        eventsFound += logs.length;
      }

      chunksCompleted++;

      // Report progress
      if (onProgress) {
        onProgress({
          currentBlock: currentTo,
          totalBlocks,
          chunksCompleted,
          totalChunks,
          eventsFound,
        });
      }

      // Move to next chunk
      currentFrom = currentTo + 1n;
    } catch (error) {
      logger.error(
        {
          error: error instanceof Error ? error.message : error,
          fromBlock: currentFrom.toString(),
          toBlock: currentTo.toString(),
          eventName,
        },
        "Failed to scan chunk",
      );

      // Re-throw to let caller handle
      throw error;
    }
  }

  logger.info(
    {
      totalChunks,
      eventsFound,
      eventName,
    },
    "Completed historical event scan",
  );
}
