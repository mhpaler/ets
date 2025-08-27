import { Web3Function, type Web3FunctionContext } from "@gelatonetwork/web3-functions-sdk";

Web3Function.onRun(async (context: Web3FunctionContext) => {
  const { userArgs, storage } = context;

  console.log("🚀 Tag-created Web3 Function heartbeat");
  console.log("Context received:", {
    userArgsKeys: Object.keys(userArgs || {}),
    storageAvailable: !!storage,
  });

  // Get run count from storage
  const runCountStr = await storage.get("runCount");
  const runCount = runCountStr ? Number.parseInt(runCountStr) + 1 : 1;

  console.log(`Run #${runCount} - Function is alive and running`);

  // Store updated run count
  await storage.set("runCount", runCount.toString());
  await storage.set("lastRun", new Date().toISOString());

  // Log any user arguments passed in
  if (userArgs && Object.keys(userArgs).length > 0) {
    console.log("User arguments:", userArgs);
  }

  return {
    canExec: false,
    message: `Tag-created heartbeat #${runCount} - Function operational`,
  };
});
