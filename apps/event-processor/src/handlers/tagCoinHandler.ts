import type { Log } from "viem";
import { apiClient } from "../clients/apiClient";
import { config } from "../config";
import type { TagCreatedEvent, ZoraCoinCreationRequest } from "../types";

/**
 * Processes TagCreated events and initiates Zora coin creation
 */
export class TagCoinHandler {
  /**
   * Handle a batch of TagCreated event logs
   */
  async handleTagCreatedLogs(logs: Log[]): Promise<void> {
    console.log(`Processing ${logs.length} TagCreated event(s)`);

    for (const log of logs) {
      try {
        await this.processSingleTagCreatedEvent(log);
      } catch (error) {
        console.error("Failed to process TagCreated event:", {
          transactionHash: log.transactionHash,
          error: error instanceof Error ? error.message : error,
        });
        // Continue processing other events even if one fails
      }
    }
  }

  /**
   * Process a single TagCreated event
   */
  private async processSingleTagCreatedEvent(log: Log): Promise<void> {
    // Parse the event data
    const tagEvent = this.parseTagCreatedEvent(log);

    console.log("Processing TagCreated event:", {
      coinAddress: tagEvent.coinAddress,
      machineName: tagEvent.machineName,
      creator: tagEvent.creator,
      transactionHash: tagEvent.transactionHash,
    });

    // Create request for off-chain API
    const request: ZoraCoinCreationRequest = {
      tagData: tagEvent,
      chainId: config.chainId,
    };

    // Call off-chain API to create Zora coin
    const response = await apiClient.createZoraCoin(request);

    if (response.success) {
      console.log("Successfully initiated Zora coin creation:", {
        etsCoinAddress: tagEvent.coinAddress,
        zoraCoinAddress: response.zoraCoinAddress,
        transactionHash: response.transactionHash,
      });
    } else {
      console.error("Failed to create Zora coin:", {
        etsCoinAddress: tagEvent.coinAddress,
        error: response.error,
      });
    }
  }

  /**
   * Parse TagCreated event log into structured data
   */
  private parseTagCreatedEvent(log: Log): TagCreatedEvent {
    // Extract event args (assuming standard event log structure)
    const args = log.args as any;

    return {
      coinAddress: args.coinAddress,
      originalInput: args.originalInput,
      displayVersion: args.displayVersion,
      machineName: args.machineName,
      creator: args.creator,
      relayer: args.relayer,
      timestamp: args.timestamp,
      blockNumber: log.blockNumber || 0n,
      transactionHash: log.transactionHash || "",
    };
  }
}
