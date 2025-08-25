import { config } from "./config";
import { EventListener } from "./handlers/eventListener";
import { getComponentLogger } from "./utils/logger";

const logger = getComponentLogger("Main");

async function main() {
  logger.info("🚀 Starting Temporal Processor Service");
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
  const eventListener = new EventListener();

  try {
    await eventListener.start();
    logger.info("✅ Temporal Processor Service started successfully");

    // Keep the process alive
    process.on("SIGINT", async () => {
      logger.info("Received SIGINT, shutting down gracefully...");
      await eventListener.stop();
      process.exit(0);
    });

    process.on("SIGTERM", async () => {
      logger.info("Received SIGTERM, shutting down gracefully...");
      await eventListener.stop();
      process.exit(0);
    });
  } catch (error) {
    logger.error({ error }, "Failed to start Temporal Processor Service");
    process.exit(1);
  }
}

// Start the service
main().catch((error) => {
  logger.error({ error }, "Uncaught error in main");
  process.exit(1);
});
