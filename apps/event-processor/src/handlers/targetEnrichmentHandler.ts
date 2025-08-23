import type { Log } from "viem";
import { targetEnrichmentClient } from "../clients/targetEnrichmentClient";
import { etsTargetAbi, viemClient } from "../clients/viemClient";
import { config } from "../config";
import type { EnrichTargetRequestedEvent, TargetCreatedEvent } from "../types";
import { getComponentLogger, getEventLogger } from "../utils/logger";

/**
 * Handles TargetCreated and EnrichTargetRequested events by enriching targets with metadata
 */
export class TargetEnrichmentHandler {
  private readonly logger = getComponentLogger("TargetEnrichmentHandler");

  /**
   * Process an array of TargetCreated event logs
   */
  async handleTargetCreatedLogs(logs: Log[]): Promise<void> {
    this.logger.info({ eventCount: logs.length }, "📥 Processing TargetCreated event(s)");

    for (const log of logs) {
      try {
        await this.processTargetCreatedEvent(log);
      } catch (error) {
        this.logger.error({ error, eventLog: log }, "Failed to process TargetCreated event");
      }
    }
  }

  /**
   * Process an array of EnrichTargetRequested event logs
   */
  async handleEnrichTargetRequestedLogs(logs: Log[]): Promise<void> {
    this.logger.info({ eventCount: logs.length }, "📥 Processing EnrichTargetRequested event(s)");

    for (const log of logs) {
      try {
        await this.processEnrichTargetRequestedEvent(log);
      } catch (error) {
        this.logger.error({ error, eventLog: log }, "Failed to process EnrichTargetRequested event");
      }
    }
  }

  /**
   * Process a single TargetCreated event
   */
  private async processTargetCreatedEvent(log: Log): Promise<void> {
    const event = this.parseTargetCreatedEvent(log);
    const eventLogger = getEventLogger(event.targetId.toString(), config.chainId, "TargetCreated");
    eventLogger.info("🎯 Processing TargetCreated event");
    await this.enrichTarget(event.targetId);
  }

  /**
   * Process a single EnrichTargetRequested event
   */
  private async processEnrichTargetRequestedEvent(log: Log): Promise<void> {
    const event = this.parseEnrichTargetRequestedEvent(log);
    const eventLogger = getEventLogger(event.targetId.toString(), config.chainId, "EnrichTargetRequested");
    eventLogger.info({ requestor: event.requestor }, "🎯 Processing EnrichTargetRequested event");
    await this.enrichTarget(event.targetId);
  }

  /**
   * Common enrichment logic for both event types
   */
  private async enrichTarget(targetId: bigint): Promise<void> {
    const targetIdStr = targetId.toString();
    const enrichmentLogger = getEventLogger(targetIdStr, config.chainId, "Enrichment");

    try {
      enrichmentLogger.info("🔍 Enriching target");

      // Call the offchain API to enrich the target
      const enrichmentResult = await targetEnrichmentClient.enrichTarget(targetIdStr, config.chainId);

      if (enrichmentResult.success) {
        enrichmentLogger.info(
          {
            arweaveTxId: enrichmentResult.txId,
            httpStatus: enrichmentResult.httpStatus,
          },
          "✅ Target enriched successfully",
        );

        // Update the target on-chain with enriched data
        await this.updateTargetOnChain(targetId, enrichmentResult.txId || "", enrichmentResult.httpStatus || 500);
      } else {
        enrichmentLogger.error(
          {
            error: enrichmentResult.error,
            httpStatus: enrichmentResult.httpStatus,
          },
          "❌ Failed to enrich target",
        );

        // Still update the target with error status
        await this.updateTargetOnChain(targetId, "", 500);
      }
    } catch (error) {
      enrichmentLogger.error({ error }, "💥 Error processing target");

      // Update target with error status
      try {
        await this.updateTargetOnChain(targetId, "", 500);
      } catch (updateError) {
        enrichmentLogger.error({ updateError }, "💥 Failed to update target with error status");
      }
    }
  }

  /**
   * Update the target on-chain with enriched data
   */
  private async updateTargetOnChain(targetId: bigint, arweaveTxId: string, httpStatus: number): Promise<void> {
    const chainLogger = getEventLogger(targetId.toString(), config.chainId, "OnChainUpdate");

    if (!viemClient.writeContract) {
      chainLogger.warn("⚠️ No wallet client available - cannot update target on-chain");
      return;
    }

    try {
      chainLogger.info({ arweaveTxId, httpStatus }, "📝 Updating target on-chain");

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
        chain: null, // Let the client determine the chain
      });

      chainLogger.info({ transactionHash: hash }, "✅ Target updated on-chain");

      // Wait for confirmation
      const receipt = await viemClient.waitForTransactionReceipt({ hash });
      chainLogger.info(
        {
          blockNumber: receipt.blockNumber,
          transactionHash: hash,
        },
        "✅ Target update confirmed",
      );
    } catch (error) {
      chainLogger.error({ error }, "💥 Failed to update target on-chain");
      throw error;
    }
  }

  /**
   * Parse TargetCreated event from log
   */
  private parseTargetCreatedEvent(log: Log): TargetCreatedEvent {
    // TargetCreated event has NO indexed parameters - targetId is in log.data
    this.logger.debug(
      {
        topics: log.topics,
        data: log.data,
      },
      "Parsing TargetCreated event",
    );

    // Parse the non-indexed uint256 targetId from log.data
    // log.data contains the ABI-encoded non-indexed parameters
    const targetId = log.data && log.data !== "0x" ? BigInt(log.data) : 0n;

    this.logger.debug({ targetId: targetId.toString() }, "Parsed target ID from event");

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

    this.logger.debug(
      {
        targetId: targetId.toString(),
        requestor,
      },
      "Parsed EnrichTargetRequested event",
    );

    return {
      targetId,
      requestor,
      blockNumber: log.blockNumber || 0n,
      transactionHash: log.transactionHash || "",
    };
  }
}
