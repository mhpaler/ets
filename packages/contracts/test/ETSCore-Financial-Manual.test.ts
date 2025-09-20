import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { network } from "hardhat";

describe("ETS Core Financial - Manual Deployment Test", async () => {
  const { viem } = await network.connect();
  const publicClient = await viem.getPublicClient();
  // Get wallet clients - Note: test users are now at positions 10+
  const walletClients = await viem.getWalletClients();
  const platform = walletClients[1]; // Position 1: ETSPlatform
  const user2 = walletClients[11]; // Position 11: User2 (test account)

  it("should handle ETH flow correctly with manual deployment", async () => {
    console.log("🔧 Testing ETH flow with manual contract deployment...");

    // Get initial balances
    const user2BalanceBefore = await publicClient.getBalance({ address: user2.account.address });
    console.log("User2 balance before:", user2BalanceBefore);

    // TODO: Manual deployment of minimal ETS contracts needed for fee testing
    // For now, let's test if we can even get basic contract interactions working

    // Create a simple transaction to verify ETH handling works
    const testAmount = 100000000000000000n; // 0.1 ETH

    const txHash = await user2.sendTransaction({
      to: platform.account.address,
      value: testAmount,
    });

    console.log("Test transaction hash:", txHash);

    const receipt = await publicClient.getTransactionReceipt({ hash: txHash });
    console.log("Transaction status:", receipt.status);
    console.log("Gas used:", receipt.gasUsed);

    // Check balances after
    const user2BalanceAfter = await publicClient.getBalance({ address: user2.account.address });
    const _platformBalanceAfter = await publicClient.getBalance({ address: platform.account.address });

    const user2Spent = user2BalanceBefore - user2BalanceAfter;
    console.log("User2 spent (including gas):", user2Spent);
    console.log("Platform received:", testAmount);

    // Verify basic ETH transfer works
    assert.ok(user2Spent >= testAmount, "User2 should have spent at least the test amount");

    console.log("✅ Basic ETH transfer works - issue is likely with Ignition fixtures");
  });

  it("should verify Ignition contracts have bytecode", async () => {
    console.log("🔍 Checking if Ignition-deployed contracts actually have bytecode...");

    // Import the Ignition fixture to check its contracts
    const { loadIgnitionFixture } = await import("./fixtures/ignitionFixture.js");
    const { contracts } = await loadIgnitionFixture();

    // Check if ETS contracts have bytecode
    const etsCode = await publicClient.getBytecode({ address: contracts.ETS.address });
    const channelCode = await publicClient.getBytecode({ address: contracts.ETSChannel.address });

    console.log("ETS contract address:", contracts.ETS.address);
    console.log("ETS contract has bytecode:", etsCode && etsCode !== "0x" ? "YES" : "NO");
    console.log("ETS bytecode length:", etsCode ? etsCode.length : 0);

    console.log("ETSChannel address:", contracts.ETSChannel.address);
    console.log("ETSChannel has bytecode:", channelCode && channelCode !== "0x" ? "YES" : "NO");
    console.log("ETSChannel bytecode length:", channelCode ? channelCode.length : 0);

    // Test if we can call a basic read function
    try {
      const taggingFee = await contracts.ETS.read.taggingFee();
      console.log("ETS.taggingFee() works:", taggingFee);
    } catch (error: any) {
      console.log("ETS.taggingFee() FAILED:", error.message);
    }
  });
});
