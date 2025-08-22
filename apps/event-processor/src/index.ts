import { apiClient } from "./clients/apiClient";
import { targetEnrichmentClient } from "./clients/targetEnrichmentClient";
import { config } from "./config";
import { EnrichTargetRequestedWatcher } from "./watchers/enrichTargetRequestedWatcher";
import { TagCreatedWatcher } from "./watchers/tagCreatedWatcher";
import { TargetCreatedWatcher } from "./watchers/targetCreatedWatcher";

async function main() {
  console.log("🚀 Starting ETS Event Processor...");
  console.log(`Environment: ${config.environment}`);
  console.log(`Chain ID: ${config.chainId}`);
  console.log(`RPC URL: ${config.rpcUrl}`);
  console.log(`ETS Token Address: ${config.etsTokenAddress}`);
  console.log(`ETS Target Address: ${config.etsTargetAddress}`);
  console.log(`ETS Enrich Target Address: ${config.etsEnrichTargetAddress}`);
  console.log(`Subgraph URL: ${config.subgraphUrl}`);
  console.log(`Off-chain API URL: ${config.offchainApiUrl}`);

  // Health check the off-chain APIs
  console.log("🔍 Checking off-chain API health...");
  const isApiHealthy = await apiClient.healthCheck();
  const isTargetApiHealthy = await targetEnrichmentClient.healthCheck();

  if (!isApiHealthy) {
    console.warn("⚠️  Off-chain API health check failed, but continuing...");
  } else {
    console.log("✅ Off-chain API is healthy");
  }

  if (!isTargetApiHealthy) {
    console.warn("⚠️  Target enrichment API health check failed, but continuing...");
  } else {
    console.log("✅ Target enrichment API is healthy");
  }

  // Start the event watchers
  const tagWatcher = new TagCreatedWatcher();
  const targetWatcher = new TargetCreatedWatcher();
  const enrichRequestWatcher = new EnrichTargetRequestedWatcher();

  try {
    // Optionally process historical events first
    const processHistorical = process.argv.includes("--historical");
    if (processHistorical) {
      console.log("📚 Processing historical events...");
      await tagWatcher.processHistoricalEvents();
      await targetWatcher.processHistoricalEvents();
      await enrichRequestWatcher.processHistoricalEvents();
    }

    // Start watching for new events (parallel processing)
    await Promise.all([tagWatcher.start(), targetWatcher.start(), enrichRequestWatcher.start()]);
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
