import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseEventLogs } from "viem";
import { loadIgnitionFixture } from "./fixtures/ignitionFixture.js";

describe("ETS Target tests", () => {
  describe("Valid setup", () => {
    it("should have Access controls set to ETSAccessControls contract", async () => {
      const { contracts } = await loadIgnitionFixture();
      const accessControls = await contracts.ETSTarget.read.etsAccessControls();
      assert.equal(accessControls.toLowerCase(), contracts.ETSAccessControls.address.toLowerCase());
    });
  });

  describe("Event-Only Target Enrichment", () => {
    it("should emit TargetEnriched event when event processor enriches target", async () => {
      const { accounts, contracts, publicClient } = await loadIgnitionFixture();

      // Set up event processor role
      const eventProcessorSigner = accounts.User3;
      const eventProcessorRole = await contracts.ETSAccessControls.read.EVENT_PROCESSOR_ROLE();
      await contracts.ETSAccessControls.write.grantRole([eventProcessorRole, eventProcessorSigner.account.address], {
        account: accounts.ETSPlatform.account,
      });

      // Create a target
      const enrichTargetURI = "https://example.com/enrichment-test";
      const targetId = await contracts.ETSTarget.read.computeTargetId([enrichTargetURI]);

      await contracts.ETSTarget.write.getOrCreateTargetId([enrichTargetURI], {
        account: accounts.User2.account,
      });

      // Enrich the target
      const title = "Test Title";
      const description = "Test Description";
      const imageUrl = "https://test.com/image.png";
      const keywords = "test,keywords";

      const txHash = await contracts.ETSTarget.write.enrichTarget([targetId, title, description, imageUrl, keywords], {
        account: eventProcessorSigner.account,
      });

      // NOW WE CAN WAIT FOR RECEIPT!
      const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
      assert.equal(receipt.status, "success");

      // Parse events using the contract's ABI
      const logs = parseEventLogs({
        abi: contracts.ETSTarget.abi,
        logs: receipt.logs,
      });

      // Find the TargetEnriched event
      const targetEnriched = logs.find((log) => log.eventName === "TargetEnriched");

      assert.ok(targetEnriched, "TargetEnriched event should be emitted");

      // Verify event parameters
      const eventArgs = targetEnriched.args as any;
      assert.equal(eventArgs.targetId, targetId);
      assert.equal(eventArgs.title, title);
      assert.equal(eventArgs.description, description);
      assert.equal(eventArgs.imageUrl, imageUrl);
      assert.equal(eventArgs.keywords, keywords);
    });

    it("should emit EnrichTargetRequested event for manual enrichment request", async () => {
      const { accounts, contracts, publicClient } = await loadIgnitionFixture();

      const requestTargetURI = "https://example.com/request-test";
      const targetId = await contracts.ETSTarget.read.computeTargetId([requestTargetURI]);

      await contracts.ETSTarget.write.getOrCreateTargetId([requestTargetURI], {
        account: accounts.User2.account,
      });

      // Request enrichment
      const txHash = await contracts.ETSTarget.write.requestEnrichTarget([targetId], {
        account: accounts.User2.account,
      });

      // Get receipt and parse events
      const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
      const logs = parseEventLogs({
        abi: contracts.ETSTarget.abi,
        logs: receipt.logs,
      });

      const requestEvent = logs.find((log) => log.eventName === "EnrichTargetRequested");
      assert.ok(requestEvent, "EnrichTargetRequested event should be emitted");

      const eventArgs = requestEvent.args as any;
      assert.equal(eventArgs.targetId, targetId);
      assert.equal(eventArgs.requestor.toLowerCase(), accounts.User2.account.address.toLowerCase());
    });

    it("should test gas efficiency with actual receipts", async () => {
      const { accounts, contracts, publicClient } = await loadIgnitionFixture();

      // Set up event processor
      const eventProcessorSigner = accounts.User3;
      const eventProcessorRole = await contracts.ETSAccessControls.read.EVENT_PROCESSOR_ROLE();
      await contracts.ETSAccessControls.write.grantRole([eventProcessorRole, eventProcessorSigner.account.address], {
        account: accounts.ETSPlatform.account,
      });

      const gasTargetURI = "https://example.com/gas-test";
      const gasTargetId = await contracts.ETSTarget.read.computeTargetId([gasTargetURI]);

      await contracts.ETSTarget.write.getOrCreateTargetId([gasTargetURI], {
        account: accounts.User2.account,
      });

      // Execute enrichment
      const txHash = await contracts.ETSTarget.write.enrichTarget(
        [gasTargetId, "Title", "Description", "https://image.png", "keywords"],
        { account: eventProcessorSigner.account },
      );

      const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
      const gasUsed = receipt.gasUsed;

      // Event emission should be cheap
      assert.ok(gasUsed < 100000n, `Gas used (${gasUsed}) should be less than 100000`);
    });
  });

  describe("Target creation", () => {
    it("should create target and emit TargetCreated event", async () => {
      const { accounts, contracts, publicClient } = await loadIgnitionFixture();

      const newTargetURI = "https://example.com/new-target";
      const expectedId = await contracts.ETSTarget.read.computeTargetId([newTargetURI]);

      // Create target
      const txHash = await contracts.ETSTarget.write.getOrCreateTargetId([newTargetURI], {
        account: accounts.User2.account,
      });

      const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
      const logs = parseEventLogs({
        abi: contracts.ETSTarget.abi,
        logs: receipt.logs,
      });

      const targetCreated = logs.find((log) => log.eventName === "TargetCreated");
      assert.ok(targetCreated, "TargetCreated event should be emitted");

      const eventArgs = targetCreated.args as any;
      assert.equal(eventArgs.targetId, expectedId);
    });

    it("should not create duplicate targets", async () => {
      const { accounts, contracts } = await loadIgnitionFixture();

      const duplicateURI = "https://example.com/duplicate";

      // Create first
      await contracts.ETSTarget.write.getOrCreateTargetId([duplicateURI], {
        account: accounts.User2.account,
      });

      const id1 = await contracts.ETSTarget.read.computeTargetId([duplicateURI]);

      // Try to create again (will return same ID)
      await contracts.ETSTarget.write.getOrCreateTargetId([duplicateURI], {
        account: accounts.User3.account,
      });

      const id2 = await contracts.ETSTarget.read.computeTargetId([duplicateURI]);

      assert.equal(id1, id2, "Should return same ID for duplicate URI");
    });
  });

  describe("Access control", () => {
    it("should only allow EVENT_PROCESSOR_ROLE to enrich targets", async () => {
      const { accounts, contracts } = await loadIgnitionFixture();

      const uri = "https://example.com/access-test";
      const targetId = await contracts.ETSTarget.read.computeTargetId([uri]);

      await contracts.ETSTarget.write.getOrCreateTargetId([uri], {
        account: accounts.User2.account,
      });

      // Should fail without role
      await assert.rejects(async () => {
        await contracts.ETSTarget.write.enrichTarget(
          [targetId, "Title", "Description", "https://image.png", "keywords"],
          { account: accounts.User2.account },
        );
      }, /AccessDenied/);
    });

    it("should allow any user to request enrichment", async () => {
      const { accounts, contracts, publicClient } = await loadIgnitionFixture();

      const uri = "https://example.com/request-access";
      const targetId = await contracts.ETSTarget.read.computeTargetId([uri]);

      await contracts.ETSTarget.write.getOrCreateTargetId([uri], {
        account: accounts.User2.account,
      });

      // Any user can request enrichment
      const txHash = await contracts.ETSTarget.write.requestEnrichTarget([targetId], {
        account: accounts.User3.account, // Different user
      });

      const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
      assert.equal(receipt.status, "success");
    });
  });
});
