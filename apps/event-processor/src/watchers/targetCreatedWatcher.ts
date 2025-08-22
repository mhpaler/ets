import { publicClient, targetCreatedEvent } from "../clients/viemClient";
import { TargetEnrichmentHandler } from "../handlers/targetEnrichmentHandler";

/**
 * Watches for TargetCreated events and enriches targets with metadata
 */
export class TargetCreatedWatcher {
  private handler: TargetEnrichmentHandler;
  private isWatching = false;

  constructor() {
    this.handler = new TargetEnrichmentHandler();
  }

  /**
   * Start watching for TargetCreated events
   */
  async start(): Promise<void> {
    if (this.isWatching) {
      console.log("TargetCreated watcher is already running");
      return;
    }

    console.log("Starting TargetCreated event watcher...");
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
          console.error("Error watching TargetCreated events:", error);
        },
      });

      console.log(`Watching for TargetCreated events on chain ${publicClient.chain?.id}`);
      console.log(`ETSTarget contract address: ${targetCreatedEvent.address}`);

      // Handle graceful shutdown
      process.on("SIGINT", () => {
        console.log("\nReceived SIGINT. Shutting down TargetCreated watcher...");
        unwatch();
        this.isWatching = false;
      });

      process.on("SIGTERM", () => {
        console.log("\nReceived SIGTERM. Shutting down TargetCreated watcher...");
        unwatch();
        this.isWatching = false;
      });
    } catch (error) {
      console.error("Failed to start TargetCreated watcher:", error);
      this.isWatching = false;
      throw error;
    }
  }

  /**
   * Process historical events from a specific block range
   */
  async processHistoricalEvents(fromBlock?: bigint, toBlock?: bigint): Promise<void> {
    console.log("Processing historical TargetCreated events...");

    try {
      const logs = await publicClient.getLogs({
        ...targetCreatedEvent,
        fromBlock: fromBlock || "earliest",
        toBlock: toBlock || "latest",
      });

      console.log(`Found ${logs.length} historical TargetCreated event(s)`);

      if (logs.length > 0) {
        await this.handler.handleTargetCreatedLogs(logs);
      }
    } catch (error) {
      console.error("Failed to process historical TargetCreated events:", error);
      throw error;
    }
  }
}
