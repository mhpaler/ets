// @ts-ignore
import { Web3Function, type Web3FunctionContext } from "@gelatonetwork/web3-functions-sdk";

Web3Function.onRun(async (_context: Web3FunctionContext) => {
  console.log("🎯 Target Enrichment Function Running");

  return {
    canExec: false,
    message: "Hello from target-enrichment",
  };
});
