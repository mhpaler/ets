import { publicClient, tagCreatedEvent } from "../clients/viemClient";
import { TagCoinHandler } from "../handlers/tagCoinHandler";
import { getComponentLogger } from "../utils/logger";

/**
 * Watches for TagCreated events and processes them
 */
export class TagCreatedWatcher {
  private handler: TagCoinHandler;
  private isWatching = false;
  private readonly logger = getComponentLogger("TagCreatedWatcher");

  constructor() {
    this.handler = new TagCoinHandler();
  }

  /**
   * Start watching for TagCreated events
   */
  async start(): Promise<void> {
    if (this.isWatching) {
      this.logger.warn("TagCreated watcher is already running");
      return;
    }

    this.logger.info("🏷️ Starting TagCreated event watcher...");
    this.isWatching = true;

    try {
      // Watch for new TagCreated events
      const unwatch = publicClient.watchEvent({
        ...tagCreatedEvent,
        onLogs: async (logs) => {
          if (logs.length > 0) {
            await this.handler.handleTagCreatedLogs(logs);
          }
        },
        onError: (error) => {
          this.logger.error({ error }, "Error watching TagCreated events");
        },
      });

      this.logger.info(
        {
          chainId: publicClient.chain?.id,
          contractAddress: tagCreatedEvent.address,
        },
        "👀 Watching for TagCreated events",
      );

      // Handle graceful shutdown
      process.on("SIGINT", () => {
        this.logger.info("🛑 Received SIGINT. Gracefully shutting down...");
        unwatch();
        this.isWatching = false;
        process.exit(0);
      });

      process.on("SIGTERM", () => {
        this.logger.info("🛑 Received SIGTERM. Gracefully shutting down...");
        unwatch();
        this.isWatching = false;
        process.exit(0);
      });
    } catch (error) {
      this.logger.error({ error }, "Failed to start TagCreated watcher");
      this.isWatching = false;
      throw error;
    }
  }

  /**
   * Process historical events from a specific block range
   */
  async processHistoricalEvents(fromBlock?: bigint, toBlock?: bigint): Promise<void> {
    this.logger.info({ fromBlock, toBlock }, "📚 Processing historical TagCreated events...");

    try {
      const logs = await publicClient.getLogs({
        ...tagCreatedEvent,
        fromBlock: fromBlock || "earliest",
        toBlock: toBlock || "latest",
      });

      this.logger.info({ eventCount: logs.length }, "📋 Found historical TagCreated events");

      if (logs.length > 0) {
        await this.handler.handleTagCreatedLogs(logs);
      }
    } catch (error) {
      this.logger.error({ error }, "Failed to process historical events");
      throw error;
    }
  }
}
