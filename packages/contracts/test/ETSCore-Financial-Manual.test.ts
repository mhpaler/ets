import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { network } from "hardhat";

describe("ETS Core Financial - Manual Deployment Test", () => {
  it("should handle ETH flow correctly with manual deployment", async () => {
    const { viem } = await network.connect();
    const publicClient = await viem.getPublicClient();
    // Get wallet clients - Note: test users are now at positions 10+
    const walletClients = await viem.getWalletClients();
    const platform = walletClients[1]; // Position 1: ETSPlatform
    const user2 = walletClients[11]; // Position 11: User2 (test account)

    // Get initial balances
    const user2BalanceBefore = await publicClient.getBalance({ address: user2.account.address });

    // TODO: Manual deployment of minimal ETS contracts needed for fee testing
    // For now, let's test if we can even get basic contract interactions working

    // Create a simple transaction to verify ETH handling works
    const testAmount = 100000000000000000n; // 0.1 ETH

    const txHash = await user2.sendTransaction({
      to: platform.account.address,
      value: testAmount,
    });

    await publicClient.getTransactionReceipt({ hash: txHash });

    // Check balances after
    const user2BalanceAfter = await publicClient.getBalance({ address: user2.account.address });
    const _platformBalanceAfter = await publicClient.getBalance({ address: platform.account.address });

    const user2Spent = user2BalanceBefore - user2BalanceAfter;

    // Verify basic ETH transfer works
    assert.ok(user2Spent >= testAmount, "User2 should have spent at least the test amount");
  });

  it("should verify Ignition contracts have bytecode", async () => {
    // Import the Ignition fixture to check its contracts
    const { loadIgnitionFixture } = await import("./fixtures/ignitionFixture.js");
    const { contracts, publicClient } = await loadIgnitionFixture();

    // Check if ETS contracts have bytecode
    const etsCode = await publicClient.getBytecode({ address: contracts.ETS.address });
    const channelCode = await publicClient.getBytecode({ address: contracts.ETSChannel.address });

    // Verify contracts have bytecode
    assert.ok(etsCode && etsCode !== "0x", "ETS contract should have bytecode");
    assert.ok(channelCode && channelCode !== "0x", "ETSChannel contract should have bytecode");

    // Test if we can call a basic read function
    const taggingFee = await contracts.ETS.read.taggingFee();
    assert.ok(taggingFee > 0n, "Tagging fee should be greater than 0");
  });
});
