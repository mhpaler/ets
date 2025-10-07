import { getConfig } from "./config";
import { EventListener } from "./handlers/eventListener";
import { getComponentLogger } from "./utils/logger";

const logger = getComponentLogger("Main");

// Store event listener instance globally for cleanup
let eventListener: EventListener | null = null;

// Cleanup function for graceful shutdown
async function cleanup() {
  if (eventListener) {
    logger.info("Cleaning up event listener...");
    try {
      await eventListener.stop();
      eventListener = null;
    } catch (error) {
      logger.error({ error }, "Error during cleanup");
    }
  }
}

async function main() {
  // Clean up any existing instance first (important for hot-reload)
  await cleanup();

  logger.info("🚀 Starting Temporal Processor Service");

  // Load config asynchronously
  const config = await getConfig();

  logger.info(
    {
      env: config.env,
      chainId: config.blockchain.chainId,
      rpcUrl: config.blockchain.rpcUrl,
      temporalServer: config.temporal.serverUrl,
    },
    "Service configuration",
  );

  // Create and start event listener
  eventListener = new EventListener();

  try {
    await eventListener.start();
    logger.info("✅ Temporal Processor Service started successfully");

    // Keep the process alive
    process.on("SIGINT", async () => {
      logger.info("Received SIGINT, shutting down gracefully...");
      await cleanup();
      process.exit(0);
    });

    process.on("SIGTERM", async () => {
      logger.info("Received SIGTERM, shutting down gracefully...");
      await cleanup();
      process.exit(0);
    });

    // Handle tsx --watch reload events (SIGUSR2 is sent by tsx before reload)
    process.on("SIGUSR2", async () => {
      logger.info("Received SIGUSR2 (hot-reload), cleaning up...");
      await cleanup();
    });
  } catch (error) {
    logger.error(
      {
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined
      },
      "Failed to start Temporal Processor Service"
    );
    process.exit(1);
  }
}

// Start the service
main().catch((error) => {
  logger.error(
    {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined
    },
    "Uncaught error in main"
  );
  process.exit(1);
});
