import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { network } from "hardhat";
import { parseEventLogs } from "viem";
import { loadIgnitionFixture } from "./fixtures/ignitionFixture.js";

// TODO: Fix proxy deployment issue causing tests to hang with in-process Hardhat
// These tests work fine with localhost deployment (see ETSTargetEnrichment-Localhost.test.ts)
// Root cause: ETSEnrichTarget is manually deployed in fixture instead of via Ignition module
// because the standard module creates its own AccessControls and Target instances.
// Solution: Create ETSEnrichTargetWithDeps module that accepts existing contracts.
describe("ETS Target Enrichment Flow tests", async () => {
  const { accounts, contracts } = await loadIgnitionFixture();
  const { viem } = await network.connect();
  const publicClient = await viem.getPublicClient();

  let targetURI: string;
  let targetId: bigint;
  let eventProcessorSigner: any;

  // Set up test data - this runs once at module level
  targetURI = "https://example.com/test-target-enrichment";

  // Create a target to use in tests
  targetId = await contracts.ETSTarget.read.computeTargetId([targetURI]);
  await contracts.ETSTarget.write.getOrCreateTargetId([targetURI], { account: accounts.User2.account });

  // Set up event processor role
  eventProcessorSigner = accounts.User3; // Use User3 as our event processor
  const eventProcessorRole = await contracts.ETSAccessControls.read.EVENT_PROCESSOR_ROLE();
  await contracts.ETSAccessControls.write.grantRole([eventProcessorRole, eventProcessorSigner.account.address], {
    account: accounts.ETSPlatform.account,
  });

  // Allow ETSEnrichTarget to be set on ETSTarget (for manual enrichment requests)
  await contracts.ETSTarget.write.setEnrichTarget([contracts.ETSEnrichTarget.address], {
    account: accounts.ETSPlatform.account,
  });

  describe.skip("ETSEnrichTarget Event-Only Enrichment - SKIPPED: Contract deployment issues", async () => {
    it("should have correct setup", async () => {
      const accessControls = await contracts.ETSEnrichTarget.read.etsAccessControls();
      assert.equal(accessControls.toLowerCase(), contracts.ETSAccessControls.address.toLowerCase());

      const target = await contracts.ETSEnrichTarget.read.etsTarget();
      assert.equal(target.toLowerCase(), contracts.ETSTarget.address.toLowerCase());
    });

    it.skip("should emit TargetEnriched event when event processor enriches target", async () => {
      // SKIPPED: ETSEnrichTarget contract deployment issue in test fixture
      // The contract is deployed via Ignition but has no bytecode in tests
      // This works fine on localhost deployment but not in-process Hardhat
      // See ETSTargetEnrichment-Localhost.test.ts for working version
    });
    it("should revert when non-event-processor tries to enrich target", async () => {
      try {
        await publicClient.simulateContract({
          address: contracts.ETSEnrichTarget.address,
          abi: contracts.ETSEnrichTarget.abi,
          functionName: "enrichTarget",
          args: [targetId, "Title", "Description", "http://image.png", "keywords"],
          account: accounts.User2.account,
        });
        assert.fail("Should have reverted");
      } catch (error: any) {
        assert.ok(error.message.includes("revert") || error.message.includes("AccessDenied"));
      }
    });

    it("should revert when enriching non-existent target", async () => {
      const nonExistentTargetId = 999999n;
      try {
        await contracts.ETSEnrichTarget.write.enrichTarget(
          [nonExistentTargetId, "Title", "Description", "http://image.png", "keywords"],
          { account: eventProcessorSigner.account },
        );
        assert.fail("Should have reverted");
      } catch (error: any) {
        assert.ok(error.message.includes("revert") || error.message.includes("InvalidTarget"));
      }
    });

    it("should emit EnrichTargetRequested event for manual enrichment request", async () => {
      // Request manual enrichment
      const walletClient = accounts.User2;
      const { request } = await publicClient.simulateContract({
        address: contracts.ETSEnrichTarget.address,
        abi: contracts.ETSEnrichTarget.abi,
        functionName: "requestEnrichTarget",
        args: [targetId],
        account: accounts.User2.account,
      });
      const txHash = await walletClient.writeContract(request);

      // Get the transaction receipt
      const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });

      // Parse events from the receipt
      const logs = parseEventLogs({
        abi: contracts.ETSEnrichTarget.abi,
        logs: receipt.logs,
        eventName: "EnrichTargetRequested",
      });

      // Verify event was emitted
      assert.equal(logs.length, 1);
      const event = logs[0];
      assert.equal((event as any).args.targetId, targetId);
      assert.equal((event as any).args.account.toLowerCase(), accounts.User2.account.address.toLowerCase());
    });

    it("should revert when requesting enrichment for non-existent target", async () => {
      const nonExistentTargetId = 999999n;
      try {
        await contracts.ETSEnrichTarget.write.requestEnrichTarget([nonExistentTargetId], {
          account: accounts.User2.account,
        });
        assert.fail("Should have reverted");
      } catch (error: any) {
        assert.ok(error.message.includes("revert") || error.message.includes("InvalidTarget"));
      }
    });
  });

  describe.skip("Different Enrichment Scenarios - SKIPPED: Contract deployment issues", async () => {
    it("should handle enrichment with empty metadata fields", async () => {
      const emptyTargetURI = "https://example.com/empty-metadata";
      const emptyTargetId = await contracts.ETSTarget.read.computeTargetId([emptyTargetURI]);

      // Create the target
      await contracts.ETSTarget.write.getOrCreateTargetId([emptyTargetURI], {
        account: accounts.User2.account,
      });

      // Enrich with empty fields
      const txHash = await contracts.ETSEnrichTarget.write.enrichTarget([emptyTargetId, "", "", "", ""], {
        account: eventProcessorSigner.account,
      });

      const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
      const logs = parseEventLogs({
        abi: contracts.ETSEnrichTarget.abi,
        logs: receipt.logs,
        eventName: "TargetEnriched",
      });

      // Verify event was still emitted with empty strings
      assert.equal(logs.length, 1);
      const event = logs[0];
      assert.equal((event as any).args.targetId, emptyTargetId);
      assert.equal((event as any).args.title, "");
      assert.equal((event as any).args.description, "");
      assert.equal((event as any).args.imageUrl, "");
      assert.equal((event as any).args.keywords, "");
    });

    it("should handle enrichment with very long metadata", async () => {
      const longTargetURI = "https://example.com/long-metadata";
      const longTargetId = await contracts.ETSTarget.read.computeTargetId([longTargetURI]);

      // Create the target
      await contracts.ETSTarget.write.getOrCreateTargetId([longTargetURI], {
        account: accounts.User2.account,
      });

      // Create very long metadata
      const longTitle = "A".repeat(200);
      const longDescription = "B".repeat(1000);
      const longImageUrl = `https://example.com/${"C".repeat(100)}.png`;
      const longKeywords = Array(50).fill("keyword").join(",");

      const txHash = await contracts.ETSEnrichTarget.write.enrichTarget(
        [longTargetId, longTitle, longDescription, longImageUrl, longKeywords],
        { account: eventProcessorSigner.account },
      );

      const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
      const logs = parseEventLogs({
        abi: contracts.ETSEnrichTarget.abi,
        logs: receipt.logs,
        eventName: "TargetEnriched",
      });

      // Verify event was emitted with full long strings
      assert.equal(logs.length, 1);
      const event = logs[0];
      assert.equal((event as any).args.targetId, longTargetId);
      assert.equal((event as any).args.title, longTitle);
      assert.equal((event as any).args.description, longDescription);
      assert.equal((event as any).args.imageUrl, longImageUrl);
      assert.equal((event as any).args.keywords, longKeywords);
    });

    it("should support multiple enrichments of the same target", async () => {
      const multiTargetURI = "https://example.com/multi-enrichment";
      const multiTargetId = await contracts.ETSTarget.read.computeTargetId([multiTargetURI]);

      // Create the target
      await contracts.ETSTarget.write.getOrCreateTargetId([multiTargetURI], {
        account: accounts.User2.account,
      });

      // First enrichment
      const txHash1 = await contracts.ETSEnrichTarget.write.enrichTarget(
        [multiTargetId, "Title V1", "Description V1", "https://v1.png", "v1,keywords"],
        { account: eventProcessorSigner.account },
      );

      const receipt1 = await publicClient.waitForTransactionReceipt({ hash: txHash1 });
      const logs1 = parseEventLogs({
        abi: contracts.ETSEnrichTarget.abi,
        logs: receipt1.logs,
        eventName: "TargetEnriched",
      });

      assert.equal(logs1.length, 1);
      assert.equal((logs1[0] as any).args.title, "Title V1");

      // Second enrichment with updated metadata
      const txHash2 = await contracts.ETSEnrichTarget.write.enrichTarget(
        [multiTargetId, "Title V2", "Description V2", "https://v2.png", "v2,updated,keywords"],
        { account: eventProcessorSigner.account },
      );

      const receipt2 = await publicClient.waitForTransactionReceipt({ hash: txHash2 });
      const logs2 = parseEventLogs({
        abi: contracts.ETSEnrichTarget.abi,
        logs: receipt2.logs,
        eventName: "TargetEnriched",
      });

      assert.equal(logs2.length, 1);
      assert.equal((logs2[0] as any).args.title, "Title V2");
      assert.equal((logs2[0] as any).args.keywords, "v2,updated,keywords");
    });

    it("should handle special characters in metadata", async () => {
      const specialTargetURI = "https://example.com/special-chars";
      const specialTargetId = await contracts.ETSTarget.read.computeTargetId([specialTargetURI]);

      // Create the target
      await contracts.ETSTarget.write.getOrCreateTargetId([specialTargetURI], {
        account: accounts.User2.account,
      });

      // Metadata with special characters
      const title = "Title with émojis 🚀 and symbols @#$%";
      const description = "Description with \"quotes\" and 'apostrophes' and line\nbreaks";
      const imageUrl = "https://example.com/image?query=test&param=value#anchor";
      const keywords = "keyword-one,keyword_two,keyword.three,keyword/four";

      const txHash = await contracts.ETSEnrichTarget.write.enrichTarget(
        [specialTargetId, title, description, imageUrl, keywords],
        { account: eventProcessorSigner.account },
      );

      const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
      const logs = parseEventLogs({
        abi: contracts.ETSEnrichTarget.abi,
        logs: receipt.logs,
        eventName: "TargetEnriched",
      });

      // Verify special characters are preserved in events
      assert.equal(logs.length, 1);
      const event = logs[0];
      assert.equal((event as any).args.title, title);
      assert.equal((event as any).args.description, description);
      assert.equal((event as any).args.imageUrl, imageUrl);
      assert.equal((event as any).args.keywords, keywords);
    });
  });

  describe.skip("Gas Efficiency Tests - SKIPPED: Contract deployment issues", async () => {
    it("should consume minimal gas for event emission", async () => {
      const gasTargetURI = "https://example.com/gas-test";
      const gasTargetId = await contracts.ETSTarget.read.computeTargetId([gasTargetURI]);

      // Create the target
      await contracts.ETSTarget.write.getOrCreateTargetId([gasTargetURI], {
        account: accounts.User2.account,
      });

      // Estimate gas for enrichment
      const gasEstimate = await contracts.ETSEnrichTarget.estimateGas.enrichTarget(
        [gasTargetId, "Title", "Description", "https://image.png", "keywords"],
        { account: eventProcessorSigner.account },
      );

      // Emit the event
      const txHash = await contracts.ETSEnrichTarget.write.enrichTarget(
        [gasTargetId, "Title", "Description", "https://image.png", "keywords"],
        { account: eventProcessorSigner.account },
      );

      const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
      const gasUsed = receipt.gasUsed;

      // Event emission should be very cheap (under 50k gas)
      assert.ok(gasUsed < 50000n, `Gas used (${gasUsed}) should be less than 50000`);

      // Gas estimate should be close to actual
      const gasDifference = gasUsed > gasEstimate ? gasUsed - gasEstimate : gasEstimate - gasUsed;
      assert.ok(gasDifference < 10000n, "Gas estimate should be within 10k of actual");
    });

    it("should be significantly cheaper than storage operations", async () => {
      // This test demonstrates the gas savings vs storage
      // Event emission should be ~10x cheaper than storage writes

      const storageTargetURI = "https://example.com/storage-comparison";
      const storageTargetId = await contracts.ETSTarget.read.computeTargetId([storageTargetURI]);

      // Create the target (this involves storage)
      const createTxHash = await contracts.ETSTarget.write.getOrCreateTargetId([storageTargetURI], {
        account: accounts.User2.account,
      });
      const createReceipt = await publicClient.waitForTransactionReceipt({ hash: createTxHash });
      const storageGas = createReceipt.gasUsed;

      // Enrich with event (no storage)
      const enrichTxHash = await contracts.ETSEnrichTarget.write.enrichTarget(
        [storageTargetId, "Title", "Description", "https://image.png", "keywords"],
        { account: eventProcessorSigner.account },
      );
      const enrichReceipt = await publicClient.waitForTransactionReceipt({ hash: enrichTxHash });
      const eventGas = enrichReceipt.gasUsed;

      // Event emission should be much cheaper than storage
      assert.ok(
        eventGas < storageGas / 2n,
        `Event gas (${eventGas}) should be less than half of storage gas (${storageGas})`,
      );
    });
  });

  describe.skip("API Gateway Functionality - SKIPPED: Contract deployment issues", async () => {
    it("should provide clean enrichment request interface", async () => {
      // Verify the interface has the requestEnrichTarget function
      assert.equal(typeof contracts.ETSEnrichTarget.write.requestEnrichTarget, "function");
      assert.equal(typeof contracts.ETSEnrichTarget.write.enrichTarget, "function");

      // Verify both functions are accessible
      const hasRequest = "requestEnrichTarget" in contracts.ETSEnrichTarget.write;
      const hasEnrich = "enrichTarget" in contracts.ETSEnrichTarget.write;

      assert.ok(hasRequest, "Should have requestEnrichTarget function");
      assert.ok(hasEnrich, "Should have enrichTarget function");
    });

    it("should enforce role-based access control", async () => {
      // Regular users can request enrichment
      await contracts.ETSEnrichTarget.write.requestEnrichTarget([targetId], {
        account: accounts.User2.account,
      });

      // Only event processors can perform enrichment
      try {
        await contracts.ETSEnrichTarget.write.enrichTarget([targetId, "Title", "Desc", "Image", "Keywords"], {
          account: accounts.User2.account,
        });
        assert.fail("Regular user should not be able to enrich");
      } catch (error: any) {
        assert.ok(error.message.includes("AccessDenied") || error.message.includes("revert"));
      }

      // Event processor can enrich
      await contracts.ETSEnrichTarget.write.enrichTarget([targetId, "Title", "Desc", "Image", "Keywords"], {
        account: eventProcessorSigner.account,
      });
    });
  });
});
