import { enrichTargetRequestedEvent, publicClient } from "../clients/viemClient";
import { TargetEnrichmentHandler } from "../handlers/targetEnrichmentHandler";
import { getComponentLogger } from "../utils/logger";

/**
 * Watches for EnrichTargetRequested events and processes manual enrichment requests
 */
export class EnrichTargetRequestedWatcher {
  private handler: TargetEnrichmentHandler;
  private isWatching = false;
  private readonly logger = getComponentLogger("EnrichTargetRequestedWatcher");

  constructor() {
    this.handler = new TargetEnrichmentHandler();
  }

  /**
   * Start watching for EnrichTargetRequested events
   */
  async start(): Promise<void> {
    if (this.isWatching) {
      this.logger.warn("EnrichTargetRequested watcher is already running");
      return;
    }

    this.logger.info("🗺️ Starting EnrichTargetRequested event watcher...");
    this.isWatching = true;

    try {
      // Watch for new EnrichTargetRequested events
      const unwatch = publicClient.watchEvent({
        ...enrichTargetRequestedEvent,
        onLogs: async (logs) => {
          if (logs.length > 0) {
            await this.handler.handleEnrichTargetRequestedLogs(logs);
          }
        },
        onError: (error) => {
          this.logger.error({ error }, "Error watching EnrichTargetRequested events");
        },
      });

      this.logger.info(
        {
          chainId: publicClient.chain?.id,
          contractAddress: enrichTargetRequestedEvent.address,
        },
        "👀 Watching for EnrichTargetRequested events",
      );

      // Handle graceful shutdown
      process.on("SIGINT", () => {
        this.logger.info("🛑 Received SIGINT. Shutting down EnrichTargetRequested watcher...");
        unwatch();
        this.isWatching = false;
      });

      process.on("SIGTERM", () => {
        this.logger.info("🛑 Received SIGTERM. Shutting down EnrichTargetRequested watcher...");
        unwatch();
        this.isWatching = false;
      });
    } catch (error) {
      this.logger.error({ error }, "Failed to start EnrichTargetRequested watcher");
      this.isWatching = false;
      throw error;
    }
  }

  /**
   * Process historical events from a specific block range
   */
  async processHistoricalEvents(fromBlock?: bigint, toBlock?: bigint): Promise<void> {
    this.logger.info({ fromBlock, toBlock }, "📚 Processing historical EnrichTargetRequested events...");

    try {
      const logs = await publicClient.getLogs({
        ...enrichTargetRequestedEvent,
        fromBlock: fromBlock || "earliest",
        toBlock: toBlock || "latest",
      });

      this.logger.info({ eventCount: logs.length }, "📋 Found historical EnrichTargetRequested events");

      if (logs.length > 0) {
        await this.handler.handleEnrichTargetRequestedLogs(logs);
      }
    } catch (error) {
      this.logger.error({ error }, "Failed to process historical EnrichTargetRequested events");
      throw error;
    }
  }
}
