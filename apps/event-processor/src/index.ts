import { apiClient } from "./clients/apiClient";
import { config } from "./config";
import { TagCreatedWatcher } from "./watchers/tagCreatedWatcher";

async function main() {
  console.log("🚀 Starting ETS Event Processor...");
  console.log(`Environment: ${config.environment}`);
  console.log(`Chain ID: ${config.chainId}`);
  console.log(`RPC URL: ${config.rpcUrl}`);
  console.log(`ETS Token Address: ${config.etsTokenAddress}`);
  console.log(`Subgraph URL: ${config.subgraphUrl}`);
  console.log(`Off-chain API URL: ${config.offchainApiUrl}`);

  // Health check the off-chain API
  console.log("🔍 Checking off-chain API health...");
  const isApiHealthy = await apiClient.healthCheck();

  if (!isApiHealthy) {
    console.warn("⚠️  Off-chain API health check failed, but continuing...");
  } else {
    console.log("✅ Off-chain API is healthy");
  }

  // Start the TagCreated event watcher
  const watcher = new TagCreatedWatcher();

  try {
    // Optionally process historical events first
    const processHistorical = process.argv.includes("--historical");
    if (processHistorical) {
      console.log("📚 Processing historical events...");
      await watcher.processHistoricalEvents();
    }

    // Start watching for new events
    await watcher.start();
  } catch (error) {
    console.error("💥 Failed to start event processor:", error);
    process.exit(1);
  }
}

// Handle unhandled rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

// Start the service
main().catch((error) => {
  console.error("💥 Fatal error:", error);
  process.exit(1);
});
