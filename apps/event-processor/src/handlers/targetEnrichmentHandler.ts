import type { Log } from "viem";
import { targetEnrichmentClient } from "../clients/targetEnrichmentClient";
import { etsTargetAbi, viemClient } from "../clients/viemClient";
import { config } from "../config";
import type { EnrichTargetRequestedEvent, TargetCreatedEvent } from "../types";

/**
 * Handles TargetCreated and EnrichTargetRequested events by enriching targets with metadata
 */
export class TargetEnrichmentHandler {
  /**
   * Process an array of TargetCreated event logs
   */
  async handleTargetCreatedLogs(logs: Log[]): Promise<void> {
    console.log(`📥 Processing ${logs.length} TargetCreated event(s)...`);

    for (const log of logs) {
      try {
        await this.processTargetCreatedEvent(log);
      } catch (error) {
        console.error("Failed to process TargetCreated event:", error);
        console.error("Event log:", log);
      }
    }
  }

  /**
   * Process an array of EnrichTargetRequested event logs
   */
  async handleEnrichTargetRequestedLogs(logs: Log[]): Promise<void> {
    console.log(`📥 Processing ${logs.length} EnrichTargetRequested event(s)...`);

    for (const log of logs) {
      try {
        await this.processEnrichTargetRequestedEvent(log);
      } catch (error) {
        console.error("Failed to process EnrichTargetRequested event:", error);
        console.error("Event log:", log);
      }
    }
  }

  /**
   * Process a single TargetCreated event
   */
  private async processTargetCreatedEvent(log: Log): Promise<void> {
    const event = this.parseTargetCreatedEvent(log);
    console.log(`🎯 Processing TargetCreated event for target ID: ${event.targetId}`);
    await this.enrichTarget(event.targetId);
  }

  /**
   * Process a single EnrichTargetRequested event
   */
  private async processEnrichTargetRequestedEvent(log: Log): Promise<void> {
    const event = this.parseEnrichTargetRequestedEvent(log);
    console.log(`🎯 Processing EnrichTargetRequested event for target ID: ${event.targetId} by ${event.requestor}`);
    await this.enrichTarget(event.targetId);
  }

  /**
   * Common enrichment logic for both event types
   */
  private async enrichTarget(targetId: bigint): Promise<void> {
    const targetIdStr = targetId.toString();

    try {
      // Call the offchain API to enrich the target
      const enrichmentResult = await targetEnrichmentClient.enrichTarget(targetIdStr, config.chainId);

      if (enrichmentResult.success) {
        console.log(`✅ Target ${targetIdStr} enriched successfully`);
        console.log(`   Arweave TX ID: ${enrichmentResult.txId}`);
        console.log(`   HTTP Status: ${enrichmentResult.httpStatus}`);

        // Update the target on-chain with enriched data
        await this.updateTargetOnChain(targetId, enrichmentResult.txId || "", enrichmentResult.httpStatus || 500);
      } else {
        console.error(`❌ Failed to enrich target ${targetIdStr}:`, enrichmentResult.error);

        // Still update the target with error status
        await this.updateTargetOnChain(targetId, "", 500);
      }
    } catch (error) {
      console.error(`💥 Error processing target ${targetIdStr}:`, error);

      // Update target with error status
      try {
        await this.updateTargetOnChain(targetId, "", 500);
      } catch (updateError) {
        console.error(`💥 Failed to update target ${targetIdStr} with error status:`, updateError);
      }
    }
  }

  /**
   * Update the target on-chain with enriched data
   */
  private async updateTargetOnChain(targetId: bigint, arweaveTxId: string, httpStatus: number): Promise<void> {
    if (!viemClient.writeContract) {
      console.warn("⚠️ No wallet client available - cannot update target on-chain");
      return;
    }

    try {
      console.log(`📝 Updating target ${targetId} on-chain...`);

      // First, get the current target data to preserve the URI
      const targetData = await viemClient.readContract({
        address: config.etsTargetAddress as `0x${string}`,
        abi: etsTargetAbi,
        functionName: "getTargetById",
        args: [targetId],
      });

      // Update the target with enriched data
      const hash = await viemClient.writeContract({
        address: config.etsTargetAddress as `0x${string}`,
        abi: etsTargetAbi,
        functionName: "updateTarget",
        args: [
          targetId,
          targetData[0], // targetURI (preserve original)
          BigInt(Date.now()), // enriched timestamp
          BigInt(httpStatus), // httpStatus
          arweaveTxId, // arweaveTxId
        ],
      });

      console.log(`✅ Target ${targetId} updated on-chain. Transaction: ${hash}`);

      // Wait for confirmation
      const receipt = await viemClient.waitForTransactionReceipt({ hash });
      console.log(`✅ Target update confirmed in block ${receipt.blockNumber}`);
    } catch (error) {
      console.error(`💥 Failed to update target ${targetId} on-chain:`, error);
      throw error;
    }
  }

  /**
   * Parse TargetCreated event from log
   */
  private parseTargetCreatedEvent(log: Log): TargetCreatedEvent {
    // TargetCreated event has one indexed parameter: targetId
    const targetId = BigInt(log.topics[1] || "0x0");

    return {
      targetId,
      blockNumber: log.blockNumber || 0n,
      transactionHash: log.transactionHash || "",
    };
  }

  /**
   * Parse EnrichTargetRequested event from log
   */
  private parseEnrichTargetRequestedEvent(log: Log): EnrichTargetRequestedEvent {
    // EnrichTargetRequested event has two indexed parameters: targetId and requestor
    const targetId = BigInt(log.topics[1] || "0x0");
    const requestor = `0x${log.topics[2]?.slice(26) || "0"}`;

    return {
      targetId,
      requestor,
      blockNumber: log.blockNumber || 0n,
      transactionHash: log.transactionHash || "",
    };
  }
}
