import { Web3Function, type Web3FunctionEventContext } from "@gelatonetwork/web3-functions-sdk";
import { decodeEventLog } from "viem";

// ETS Target ABI - TargetCreated event
const TARGET_ABI = [
  {
    type: "event",
    name: "TargetCreated",
    inputs: [
      {
        name: "targetId",
        type: "uint256",
        indexed: false,
      },
    ],
  },
] as const;

Web3Function.onRun(async (context: Web3FunctionEventContext) => {
  const { log } = context;

  console.log("🎯 Target Enrichment - Event detected!");
  console.log("Raw log:", {
    address: log.address,
    blockNumber: log.blockNumber,
    transactionHash: log.transactionHash,
    logIndex: log.logIndex,
  });

  console.log("📋 Event data:");
  console.log(`  - Data: ${log.data}`);
  console.log(`  - Topics: ${JSON.stringify(log.topics)}`);

  let targetId: bigint;

  try {
    // Parse the TargetCreated event using viem
    const parsedLog = decodeEventLog({
      abi: TARGET_ABI,
      data: log.data as `0x${string}`,
      topics: log.topics as [`0x${string}`, ...`0x${string}`[]],
    });

    targetId = parsedLog.args.targetId;
    console.log("✅ Parsed with viem - Target ID:", targetId.toString());
  } catch (viemError) {
    console.warn("⚠️ Viem parsing failed, falling back to manual parsing:", viemError);

    // Fallback: Extract target ID from the data manually
    const targetIdHex = log.data.slice(2); // Remove 0x prefix
    targetId = BigInt(`0x${targetIdHex}`);
    console.log("✅ Manual parsing - Target ID:", targetId.toString());
  }

  return {
    canExec: false,
    message: `TargetCreated event processed - Target ID: ${targetId}`,
  };
});
