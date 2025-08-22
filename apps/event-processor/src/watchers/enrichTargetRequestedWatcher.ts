import { enrichTargetRequestedEvent, publicClient } from "../clients/viemClient";
import { TargetEnrichmentHandler } from "../handlers/targetEnrichmentHandler";

/**
 * Watches for EnrichTargetRequested events and processes manual enrichment requests
 */
export class EnrichTargetRequestedWatcher {
  private handler: TargetEnrichmentHandler;
  private isWatching = false;

  constructor() {
    this.handler = new TargetEnrichmentHandler();
  }

  /**
   * Start watching for EnrichTargetRequested events
   */
  async start(): Promise<void> {
    if (this.isWatching) {
      console.log("EnrichTargetRequested watcher is already running");
      return;
    }

    console.log("Starting EnrichTargetRequested event watcher...");
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
          console.error("Error watching EnrichTargetRequested events:", error);
        },
      });

      console.log(`Watching for EnrichTargetRequested events on chain ${publicClient.chain?.id}`);
      console.log(`ETSEnrichTarget contract address: ${enrichTargetRequestedEvent.address}`);

      // Handle graceful shutdown
      process.on("SIGINT", () => {
        console.log("\nReceived SIGINT. Shutting down EnrichTargetRequested watcher...");
        unwatch();
        this.isWatching = false;
      });

      process.on("SIGTERM", () => {
        console.log("\nReceived SIGTERM. Shutting down EnrichTargetRequested watcher...");
        unwatch();
        this.isWatching = false;
      });
    } catch (error) {
      console.error("Failed to start EnrichTargetRequested watcher:", error);
      this.isWatching = false;
      throw error;
    }
  }

  /**
   * Process historical events from a specific block range
   */
  async processHistoricalEvents(fromBlock?: bigint, toBlock?: bigint): Promise<void> {
    console.log("Processing historical EnrichTargetRequested events...");

    try {
      const logs = await publicClient.getLogs({
        ...enrichTargetRequestedEvent,
        fromBlock: fromBlock || "earliest",
        toBlock: toBlock || "latest",
      });

      console.log(`Found ${logs.length} historical EnrichTargetRequested event(s)`);

      if (logs.length > 0) {
        await this.handler.handleEnrichTargetRequestedLogs(logs);
      }
    } catch (error) {
      console.error("Failed to process historical EnrichTargetRequested events:", error);
      throw error;
    }
  }
}
