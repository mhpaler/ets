// web3-functions/target-enrichment/index.ts
import { Web3Function } from "@gelatonetwork/web3-functions-sdk";
import { decodeEventLog } from "viem";
var TARGET_ABI = [
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
];
Web3Function.onRun(async (context) => {
  const { log } = context;
  console.log("\u{1F3AF} Target Enrichment - Event detected!");
  console.log("Raw log:", {
    address: log.address,
    blockNumber: log.blockNumber,
    transactionHash: log.transactionHash,
    logIndex: log.logIndex,
  });
  console.log("\u{1F4CB} Event data:");
  console.log(`  - Data: ${log.data}`);
  console.log(`  - Topics: ${JSON.stringify(log.topics)}`);
  let targetId;
  try {
    const parsedLog = decodeEventLog({
      abi: TARGET_ABI,
      data: log.data,
      topics: log.topics,
    });
    targetId = parsedLog.args.targetId;
    console.log("\u2705 Parsed with viem - Target ID:", targetId.toString());
  } catch (viemError) {
    console.warn("\u26A0\uFE0F Viem parsing failed, falling back to manual parsing:", viemError);
    const targetIdHex = log.data.slice(2);
    targetId = BigInt(`0x${targetIdHex}`);
    console.log("\u2705 Manual parsing - Target ID:", targetId.toString());
  }
  return {
    canExec: false,
    message: `TargetCreated event processed - Target ID: ${targetId}`,
  };
});
