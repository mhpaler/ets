import { getConfig } from "./config/index.js";
import { EventListener } from "./handlers/eventListener.js";
import { getComponentLogger } from "./utils/logger.js";
import { cleanupWorker, startWorker } from "./worker.js";

const logger = getComponentLogger("Main");

// Store event listener instance globally for cleanup
let eventListener: EventListener | null = null;

// Cleanup function for graceful shutdown
async function cleanup() {
  logger.info("Starting cleanup...");

  // Clean up event listener
  if (eventListener) {
    logger.info("Cleaning up event listener...");
    try {
      await eventListener.stop();
      eventListener = null;
    } catch (error) {
      logger.error({ error }, "Error cleaning up event listener");
    }
  }

  // Clean up worker
  try {
    await cleanupWorker();
  } catch (error) {
    logger.error({ error }, "Error cleaning up worker");
  }

  logger.info("Cleanup complete");
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
      taskQueue: config.temporal.taskQueue,
    },
    "Service configuration",
  );

  try {
    // Set up signal handlers first
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

    // Create and start event listener (non-blocking)
    eventListener = new EventListener();
    await eventListener.start();
    logger.info("✅ EventListener started successfully");

    logger.info("✅ Temporal Processor Service started successfully");

    // Start Temporal worker (blocks until shutdown or error)
    // This must come last as it runs indefinitely
    await startWorker();
  } catch (error) {
    logger.error(
      {
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
      },
      "Failed to start Temporal Processor Service",
    );
    process.exit(1);
  }
}

// Start the service
main().catch((error) => {
  logger.error(
    {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
    },
    "Uncaught error in main",
  );
  process.exit(1);
});
