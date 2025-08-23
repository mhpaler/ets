import { publicClient, targetCreatedEvent } from "../clients/viemClient";
import { TargetEnrichmentHandler } from "../handlers/targetEnrichmentHandler";
import { getComponentLogger } from "../utils/logger";

/**
 * Watches for TargetCreated events and enriches targets with metadata
 */
export class TargetCreatedWatcher {
  private handler: TargetEnrichmentHandler;
  private isWatching = false;
  private readonly logger = getComponentLogger("TargetCreatedWatcher");

  constructor() {
    this.handler = new TargetEnrichmentHandler();
  }

  /**
   * Start watching for TargetCreated events
   */
  async start(): Promise<void> {
    if (this.isWatching) {
      this.logger.warn("TargetCreated watcher is already running");
      return;
    }

    this.logger.info("🎯 Starting TargetCreated event watcher...");
    this.isWatching = true;

    try {
      // Watch for new TargetCreated events
      const unwatch = publicClient.watchEvent({
        ...targetCreatedEvent,
        onLogs: async (logs) => {
          if (logs.length > 0) {
            await this.handler.handleTargetCreatedLogs(logs);
          }
        },
        onError: (error) => {
          this.logger.error({ error }, "Error watching TargetCreated events");
        },
      });

      this.logger.info(
        {
          chainId: publicClient.chain?.id,
          contractAddress: targetCreatedEvent.address,
        },
        "👀 Watching for TargetCreated events",
      );

      // Handle graceful shutdown
      process.on("SIGINT", () => {
        this.logger.info("🛑 Received SIGINT. Shutting down TargetCreated watcher...");
        unwatch();
        this.isWatching = false;
      });

      process.on("SIGTERM", () => {
        this.logger.info("🛑 Received SIGTERM. Shutting down TargetCreated watcher...");
        unwatch();
        this.isWatching = false;
      });
    } catch (error) {
      this.logger.error({ error }, "Failed to start TargetCreated watcher");
      this.isWatching = false;
      throw error;
    }
  }

  /**
   * Process historical events from a specific block range
   */
  async processHistoricalEvents(fromBlock?: bigint, toBlock?: bigint): Promise<void> {
    this.logger.info({ fromBlock, toBlock }, "📚 Processing historical TargetCreated events...");

    try {
      const logs = await publicClient.getLogs({
        ...targetCreatedEvent,
        fromBlock: fromBlock || "earliest",
        toBlock: toBlock || "latest",
      });

      this.logger.info({ eventCount: logs.length }, "📋 Found historical TargetCreated events");

      if (logs.length > 0) {
        await this.handler.handleTargetCreatedLogs(logs);
      }
    } catch (error) {
      this.logger.error({ error }, "Failed to process historical TargetCreated events");
      throw error;
    }
  }
}
