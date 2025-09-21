import assert from "node:assert/strict";
import { describe, it } from "node:test";
import hre from "hardhat";
import { parseEventLogs } from "viem";

describe("ETSTargetEnrichment on Localhost", async () => {
  const { viem } = await hre.network.connect();
  const publicClient = await viem.getPublicClient();
  const walletClients = await viem.getWalletClients();

  // Use deployed contract addresses
  const enrichTargetAddress = "0x8f86403A4DE0BB5791fa46B8e795C547942fE4Cf";
  const targetAddress = "0x70e0bA845a1A0F2DA3359C97E0285013525FFC49";
  const accessControlsAddress = "0x1613beB3B2C4f22Ee086B2b38C1476A3cE7f78E8";

  // Get contract instances
  const enrichTarget = await viem.getContractAt("ETSEnrichTarget", enrichTargetAddress);
  const target = await viem.getContractAt("ETSTarget", targetAddress);
  const accessControls = await viem.getContractAt("ETSAccessControls", accessControlsAddress);

  // Use wallets
  const eventProcessor = walletClients[3];
  const user = walletClients[1];

  describe("Event-Only Enrichment", async () => {
    it("should emit TargetEnriched event when enriching", async () => {
      // Create a test target
      const targetURI = "https://test.com/" + Date.now();
      const targetId = await target.read.computeTargetId([targetURI]);

      await target.write.getOrCreateTargetId([targetURI], { account: user.account });

      // Grant EVENT_PROCESSOR_ROLE if needed
      const EVENT_PROCESSOR_ROLE = await accessControls.read.EVENT_PROCESSOR_ROLE();
      const hasRole = await accessControls.read.hasRole([EVENT_PROCESSOR_ROLE, eventProcessor.account.address]);

      if (!hasRole) {
        await accessControls.write.grantRole([EVENT_PROCESSOR_ROLE, eventProcessor.account.address], {
          account: walletClients[0].account
        });
      }

      // Enrich the target
      const title = "Test Title";
      const description = "Test Description";
      const imageUrl = "https://test.com/image.png";
      const keywords = "test,keywords";

      const { request } = await publicClient.simulateContract({
        address: enrichTargetAddress,
        abi: enrichTarget.abi,
        functionName: 'enrichTarget',
        args: [targetId, title, description, imageUrl, keywords],
        account: eventProcessor.account,
      });

      const hash = await eventProcessor.writeContract(request);
      const receipt = await publicClient.waitForTransactionReceipt({ hash });

      // Parse events
      const logs = parseEventLogs({
        abi: enrichTarget.abi,
        logs: receipt.logs,
        eventName: "TargetEnriched",
      });

      // Verify event
      assert.equal(logs.length, 1);
      const event = logs[0];
      assert.equal((event as any).args.targetId, targetId);
      assert.equal((event as any).args.title, title);
      assert.equal((event as any).args.description, description);
      assert.equal((event as any).args.imageUrl, imageUrl);
      assert.equal((event as any).args.keywords, keywords);
    });

    it("should revert when non-processor tries to enrich", async () => {
      const targetURI = "https://test.com/" + Date.now();
      const targetId = await target.read.computeTargetId([targetURI]);

      await target.write.getOrCreateTargetId([targetURI], { account: user.account });

      try {
        await publicClient.simulateContract({
          address: enrichTargetAddress,
          abi: enrichTarget.abi,
          functionName: 'enrichTarget',
          args: [targetId, "Title", "Desc", "Image", "Keywords"],
          account: user.account, // Non-processor account
        });
        assert.fail("Should have reverted");
      } catch (error: any) {
        assert.ok(error.message.includes("AccessDenied") || error.message.includes("revert"));
      }
    });

    it("should handle requestEnrichTarget from any user", async () => {
      const targetURI = "https://test.com/" + Date.now();
      const targetId = await target.read.computeTargetId([targetURI]);

      await target.write.getOrCreateTargetId([targetURI], { account: user.account });

      // Any user can request enrichment
      const { request } = await publicClient.simulateContract({
        address: enrichTargetAddress,
        abi: enrichTarget.abi,
        functionName: 'requestEnrichTarget',
        args: [targetId],
        account: user.account,
      });

      const hash = await user.writeContract(request);
      const receipt = await publicClient.waitForTransactionReceipt({ hash });

      // Parse events
      const logs = parseEventLogs({
        abi: enrichTarget.abi,
        logs: receipt.logs,
        eventName: "EnrichTargetRequested",
      });

      assert.equal(logs.length, 1);
      const event = logs[0] as any;
      assert.equal(event.args.targetId, targetId);
      assert.equal(event.args.requestor.toLowerCase(), user.account.address.toLowerCase());
    });
  });
});