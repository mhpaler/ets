import { publicClient, tagCreatedEvent } from "../clients/viemClient";
import { TagCoinHandler } from "../handlers/tagCoinHandler";

/**
 * Watches for TagCreated events and processes them
 */
export class TagCreatedWatcher {
  private handler: TagCoinHandler;
  private isWatching = false;

  constructor() {
    this.handler = new TagCoinHandler();
  }

  /**
   * Start watching for TagCreated events
   */
  async start(): Promise<void> {
    if (this.isWatching) {
      console.log("TagCreated watcher is already running");
      return;
    }

    console.log("Starting TagCreated event watcher...");
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
          console.error("Error watching TagCreated events:", error);
        },
      });

      console.log(`Watching for TagCreated events on chain ${publicClient.chain?.id}`);
      console.log(`Contract address: ${tagCreatedEvent.address}`);

      // Handle graceful shutdown
      process.on("SIGINT", () => {
        console.log("\nReceived SIGINT. Gracefully shutting down...");
        unwatch();
        this.isWatching = false;
        process.exit(0);
      });

      process.on("SIGTERM", () => {
        console.log("\nReceived SIGTERM. Gracefully shutting down...");
        unwatch();
        this.isWatching = false;
        process.exit(0);
      });
    } catch (error) {
      console.error("Failed to start TagCreated watcher:", error);
      this.isWatching = false;
      throw error;
    }
  }

  /**
   * Process historical events from a specific block range
   */
  async processHistoricalEvents(fromBlock?: bigint, toBlock?: bigint): Promise<void> {
    console.log("Processing historical TagCreated events...");

    try {
      const logs = await publicClient.getLogs({
        ...tagCreatedEvent,
        fromBlock: fromBlock || "earliest",
        toBlock: toBlock || "latest",
      });

      console.log(`Found ${logs.length} historical TagCreated event(s)`);

      if (logs.length > 0) {
        await this.handler.handleTagCreatedLogs(logs);
      }
    } catch (error) {
      console.error("Failed to process historical events:", error);
      throw error;
    }
  }
}
