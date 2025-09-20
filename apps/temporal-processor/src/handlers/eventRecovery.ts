import type { Client } from "@temporalio/client";
import { http, createPublicClient } from "viem";
import { parseAbiItem } from "viem";
import { base, localhost, sepolia } from "viem/chains";
import { config } from "../config";
import { getComponentLogger } from "../utils/logger";

const logger = getComponentLogger("EventRecovery");

/**
 * Event Recovery Handler
 *
 * This module provides recovery functionality for missed events using getLogs.
 * Useful for scenarios like:
 * - Service was down during certain blocks
 * - Network issues caused missed events
 * - Manual recovery of specific block ranges
 * - Initial backfill when starting the service
 */

// Event ABIs
const targetCreatedAbi = parseAbiItem(
  "event TargetCreated(uint256 indexed targetId, string targetURI, uint256 targetType, address indexed creator)",
);

const tagCreatedAbi = parseAbiItem(
  "event TagCreated(uint256 indexed tagId, address indexed coinAddress, string tagString, address indexed creator, uint256 blockNumber, address indexed channel, uint256 timestamp)",
);

// Get chain configuration
function getChain() {
  switch (config.blockchain.chainId) {
    case 31337:
      return localhost;
    case 11155111:
      return sepolia;
    case 8453:
      return base;
    default:
      return localhost;
  }
}

const publicClient = createPublicClient({
  chain: getChain(),
  transport: http(config.blockchain.rpcUrl),
});

export class EventRecovery {
  private temporalClient: Client;

  constructor(temporalClient: Client) {
    this.temporalClient = temporalClient;
  }

  /**
   * Recover missed TargetCreated events from a specific block range
   */
  async recoverTargetCreatedEvents(fromBlock: bigint, toBlock: bigint | "latest" = "latest"): Promise<void> {
    logger.info(
      { fromBlock: fromBlock.toString(), toBlock: toBlock.toString() },
      "Starting TargetCreated event recovery",
    );

    try {
      const logs = await publicClient.getLogs({
        address: config.blockchain.contracts.etsTarget as `0x${string}`,
        event: targetCreatedAbi,
        fromBlock,
        toBlock,
      });

      if (logs.length > 0) {
        logger.info(`🔄 RECOVERING ${logs.length} TargetCreated event(s) from blocks ${fromBlock}-${toBlock}`);

        for (const log of logs) {
          // Process each recovered event
          // Could trigger Temporal workflows or store for batch processing
          logger.info(
            {
              blockNumber: log.blockNumber?.toString(),
              transactionHash: log.transactionHash,
            },
            "Processing recovered TargetCreated event",
          );

          // TODO: Trigger Temporal workflow for each recovered event
          // await this.handleRecoveredTargetEvent(log);
        }

        logger.info(`✅ Successfully recovered ${logs.length} TargetCreated events`);
      } else {
        logger.info("No TargetCreated events found in recovery range");
      }
    } catch (error) {
      logger.error({ error, fromBlock, toBlock }, "Failed to recover TargetCreated events");
      throw error;
    }
  }

  /**
   * Recover missed TagCreated events from a specific block range
   */
  async recoverTagCreatedEvents(fromBlock: bigint, toBlock: bigint | "latest" = "latest"): Promise<void> {
    logger.info({ fromBlock: fromBlock.toString(), toBlock: toBlock.toString() }, "Starting TagCreated event recovery");

    try {
      const logs = await publicClient.getLogs({
        address: config.blockchain.contracts.etsToken as `0x${string}`,
        event: tagCreatedAbi,
        fromBlock,
        toBlock,
      });

      if (logs.length > 0) {
        logger.info(`🔄 RECOVERING ${logs.length} TagCreated event(s) from blocks ${fromBlock}-${toBlock}`);

        for (const log of logs) {
          // Process each recovered event
          logger.info(
            {
              blockNumber: log.blockNumber?.toString(),
              transactionHash: log.transactionHash,
            },
            "Processing recovered TagCreated event",
          );

          // TODO: Trigger Temporal workflow for each recovered event
          // await this.handleRecoveredTagEvent(log);
        }

        logger.info(`✅ Successfully recovered ${logs.length} TagCreated events`);
      } else {
        logger.info("No TagCreated events found in recovery range");
      }
    } catch (error) {
      logger.error({ error, fromBlock, toBlock }, "Failed to recover TagCreated events");
      throw error;
    }
  }

  /**
   * Perform full recovery for all event types in a block range
   */
  async recoverAllEvents(fromBlock: bigint, toBlock: bigint | "latest" = "latest"): Promise<void> {
    logger.info("Starting full event recovery");

    await Promise.all([
      this.recoverTargetCreatedEvents(fromBlock, toBlock),
      this.recoverTagCreatedEvents(fromBlock, toBlock),
    ]);

    logger.info("Full event recovery complete");
  }

  /**
   * Smart recovery: Check last processed block and recover from there
   * This would need to track the last successfully processed block in a database
   */
  async smartRecovery(): Promise<void> {
    // TODO: Implement logic to:
    // 1. Read last processed block from database/state
    // 2. Get current block
    // 3. Recover events between last processed and current

    logger.info("Smart recovery not yet implemented");

    // Example implementation:
    // const lastProcessedBlock = await this.getLastProcessedBlock();
    // const currentBlock = await publicClient.getBlockNumber();
    // if (currentBlock > lastProcessedBlock) {
    //   await this.recoverAllEvents(lastProcessedBlock + 1n, currentBlock);
    //   await this.saveLastProcessedBlock(currentBlock);
    // }
  }
}

// Usage example:
// const recovery = new EventRecovery(temporalClient);
//
// // Recover specific range
// await recovery.recoverTargetCreatedEvents(1000n, 2000n);
//
// // Recover from a point to latest
// await recovery.recoverAllEvents(5000n, "latest");
//
// // Smart recovery based on last processed block
// await recovery.smartRecovery();
