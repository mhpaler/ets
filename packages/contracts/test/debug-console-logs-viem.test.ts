import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { network } from "hardhat";

describe("Debug Console Logs (Viem)", async () => {
  const { viem } = await network.connect();
  const publicClient = await viem.getPublicClient();

  it("should show we can access viem from hardhat", async () => {
    console.log("=== TESTING viem integration ===");

    // Test basic viem access
    const chainId = await publicClient.getChainId();
    console.log("Chain ID from viem:", chainId);

    // Test wallet client access
    const [walletClient] = await viem.getWalletClients();
    const address = walletClient.account.address;
    console.log("First wallet address:", address);

    assert.equal(chainId, 31337); // Local hardhat network
  });
});
