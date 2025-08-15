import { config } from "./config";
import { TagCreatedWatcher } from "./watchers/tagCreatedWatcher";

async function testLocalHardhat() {
  console.log("🔗 Testing Event Processor against local Hardhat...");
  console.log(`Connecting to: ${config.rpcUrl}`);
  console.log(`Watching contract: ${config.etsTokenAddress}\n`);

  const watcher = new TagCreatedWatcher();

  try {
    console.log("📚 Processing any historical events...");
    await watcher.processHistoricalEvents();

    console.log("👀 Starting event watcher (Press Ctrl+C to stop)...");
    console.log("💡 Try creating a tag in the ETS Explorer to see events!\n");

    await watcher.start();
  } catch (error) {
    console.error("❌ Hardhat test failed:", error);
    process.exit(1);
  }
}

// Run the test
testLocalHardhat().catch((error) => {
  console.error("💥 Test failed:", error);
  process.exit(1);
});
