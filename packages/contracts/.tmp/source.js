// ../../apps/gelato/web3-functions/target-enrichment/index.ts
import { Web3Function } from "@gelatonetwork/web3-functions-sdk";
Web3Function.onRun(async (_context) => {
  console.log("\u{1F3AF} Target Enrichment Function Running");
  return {
    canExec: false,
    message: "Hello from target-enrichment"
  };
});
