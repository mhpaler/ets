import { apiClient } from "./clients/apiClient";
import { targetEnrichmentClient } from "./clients/targetEnrichmentClient";
import { config } from "./config";
import { getComponentLogger } from "./utils/logger";
import { EnrichTargetRequestedWatcher } from "./watchers/enrichTargetRequestedWatcher";
import { TagCreatedWatcher } from "./watchers/tagCreatedWatcher";
import { TargetCreatedWatcher } from "./watchers/targetCreatedWatcher";

const logger = getComponentLogger("EventProcessor");

async function main() {
  logger.info("🚀 Starting ETS Event Processor...");
  logger.info(
    {
      environment: config.environment,
      chainId: config.chainId,
      rpcUrl: config.rpcUrl,
      etsTokenAddress: config.etsTokenAddress,
      etsTargetAddress: config.etsTargetAddress,
      etsEnrichTargetAddress: config.etsEnrichTargetAddress,
      subgraphUrl: config.subgraphUrl,
      offchainApiUrl: config.offchainApiUrl,
      logLevel: config.logLevel,
    },
    "Event processor configuration",
  );

  // Log warning about missing Alchemy key if using localhost fallback
  if (config.rpcUrl === "http://localhost:8545" && !process.env.ALCHEMY_API_KEY) {
    logger.warn("ALCHEMY_API_KEY not provided, using localhost fallback RPC");
  }

  // Health check the off-chain APIs
  logger.info("🔍 Checking off-chain API health...");
  const isApiHealthy = await apiClient.healthCheck();
  const isTargetApiHealthy = await targetEnrichmentClient.healthCheck();

  if (!isApiHealthy) {
    logger.warn("⚠️  Off-chain API health check failed, but continuing...");
  } else {
    logger.info("✅ Off-chain API is healthy");
  }

  if (!isTargetApiHealthy) {
    logger.warn("⚠️  Target enrichment API health check failed, but continuing...");
  } else {
    logger.info("✅ Target enrichment API is healthy");
  }

  // Start the event watchers
  const tagWatcher = new TagCreatedWatcher();
  const targetWatcher = new TargetCreatedWatcher();
  const enrichRequestWatcher = new EnrichTargetRequestedWatcher();

  try {
    // Optionally process historical events first
    const processHistorical = process.argv.includes("--historical");
    if (processHistorical) {
      logger.info("📚 Processing historical events...");
      await tagWatcher.processHistoricalEvents();
      await targetWatcher.processHistoricalEvents();
      await enrichRequestWatcher.processHistoricalEvents();
    }

    // Start watching for new events (parallel processing)
    logger.info("🎯 Starting event watchers for real-time processing...");
    await Promise.all([tagWatcher.start(), targetWatcher.start(), enrichRequestWatcher.start()]);
  } catch (error) {
    logger.error({ error }, "💥 Failed to start event processor");
    process.exit(1);
  }
}

// Handle unhandled rejections
process.on("unhandledRejection", (reason, promise) => {
  logger.error({ reason, promise }, "Unhandled Rejection");
  process.exit(1);
});

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  logger.error({ error }, "Uncaught Exception");
  process.exit(1);
});

// Graceful shutdown
process.on("SIGINT", () => {
  logger.info("🛑 Received SIGINT, shutting down gracefully...");
  process.exit(0);
});

process.on("SIGTERM", () => {
  logger.info("🛑 Received SIGTERM, shutting down gracefully...");
  process.exit(0);
});

// Start the service
main().catch((error) => {
  logger.error({ error }, "💥 Fatal error");
  process.exit(1);
});
