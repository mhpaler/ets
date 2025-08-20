import { mine } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import type { Accounts, Contracts } from "./setup";
import { setup } from "./setup";

describe("ETS Target Enrichment Flow tests", () => {
  let accounts: Accounts;
  let contracts: Contracts;
  let targetURI: string;
  let targetId: bigint;
  let eventProcessorSigner: any;

  beforeEach("Setup test", async () => {
    const result = await setup();
    ({ accounts, contracts } = result);
    targetURI = "https://example.com/test-target";

    // Create a target to use in tests
    targetId = await contracts.ETSTarget.computeTargetId(targetURI);
    await contracts.ETSTarget.connect(accounts.RandomOne).getOrCreateTargetId(targetURI);

    // Set up event processor role
    eventProcessorSigner = accounts.RandomTwo; // Use RandomTwo as our event processor
    await contracts.ETSAccessControls.connect(accounts.ETSPlatform).grantRole(
      await contracts.ETSAccessControls.EVENT_PROCESSOR_ROLE(),
      eventProcessorSigner.address,
    );

    // Allow ETSEnrichTarget to be set on ETSTarget (for manual enrichment requests)
    await contracts.ETSTarget.connect(accounts.ETSPlatform).setEnrichTarget(
      await contracts.ETSEnrichTarget.getAddress(),
    );
  });

  describe("ETSEnrichTarget API Gateway", async () => {
    it("should have correct setup", async () => {
      expect(await contracts.ETSEnrichTarget.etsAccessControls()).to.be.equal(
        await contracts.ETSAccessControls.getAddress(),
      );
      expect(await contracts.ETSEnrichTarget.etsTarget()).to.be.equal(await contracts.ETSTarget.getAddress());
    });

    it("should emit EnrichTargetRequested event for manual enrichment", async () => {
      await expect(contracts.ETSEnrichTarget.connect(accounts.RandomOne).requestEnrichTarget(targetId))
        .to.emit(contracts.ETSEnrichTarget, "EnrichTargetRequested")
        .withArgs(targetId, accounts.RandomOne.address);
    });

    it("should revert when requesting enrichment for non-existent target", async () => {
      const nonExistentTargetId = 999999n;
      await expect(
        contracts.ETSEnrichTarget.connect(accounts.RandomOne).requestEnrichTarget(nonExistentTargetId),
      ).to.be.revertedWithCustomError(contracts.ETSEnrichTarget, "InvalidTarget");
    });
  });

  describe("Direct Target Enrichment by Event Processor", async () => {
    it("should allow event processor to update target with enrichment data", async () => {
      // Mock enrichment data (simulating what event processor would get from offchain-api)
      const mockArweaveTxId = "MOCK_json_a1b2c3d4_1735123456";
      const mockHttpStatus = 200;
      const enrichedTimestamp = BigInt(Date.now());

      // Verify target state before enrichment
      const targetBefore = await contracts.ETSTarget.getTargetById(targetId);
      expect(targetBefore.enriched).to.equal(0n);
      expect(targetBefore.httpStatus).to.equal(0n);
      expect(targetBefore.arweaveTxId).to.equal("");

      // Event processor updates the target directly
      await expect(
        contracts.ETSTarget.connect(eventProcessorSigner).updateTarget(
          targetId,
          targetURI, // Preserve original URI
          enrichedTimestamp,
          mockHttpStatus,
          mockArweaveTxId,
        ),
      )
        .to.emit(contracts.ETSTarget, "TargetUpdated")
        .withArgs(targetId);

      // Verify target was updated correctly
      const targetAfter = await contracts.ETSTarget.getTargetById(targetId);
      expect(targetAfter.targetURI).to.equal(targetURI);
      expect(targetAfter.enriched).to.equal(enrichedTimestamp);
      expect(targetAfter.httpStatus).to.equal(mockHttpStatus);
      expect(targetAfter.arweaveTxId).to.equal(mockArweaveTxId);
    });

    it("should revert when non-event-processor tries to update target", async () => {
      const mockArweaveTxId = "MOCK_json_a1b2c3d4_1735123456";
      const mockHttpStatus = 200;
      const enrichedTimestamp = BigInt(Date.now());

      // Random user should not be able to update target
      await expect(
        contracts.ETSTarget.connect(accounts.RandomOne).updateTarget(
          targetId,
          targetURI,
          enrichedTimestamp,
          mockHttpStatus,
          mockArweaveTxId,
        ),
      ).to.be.revertedWithCustomError(contracts.ETSTarget, "AccessDenied");
    });

    it("should handle enrichment failure with error status", async () => {
      // Mock failed enrichment (empty txId, error HTTP status)
      const mockArweaveTxId = ""; // Empty for failed enrichment
      const mockHttpStatus = 422; // Unprocessable Entity
      const enrichedTimestamp = BigInt(Date.now());

      await contracts.ETSTarget.connect(eventProcessorSigner).updateTarget(
        targetId,
        targetURI,
        enrichedTimestamp,
        mockHttpStatus,
        mockArweaveTxId,
      );

      const target = await contracts.ETSTarget.getTargetById(targetId);
      expect(target.httpStatus).to.equal(mockHttpStatus);
      expect(target.arweaveTxId).to.equal("");
      expect(target.enriched).to.equal(enrichedTimestamp); // Still set timestamp even on failure
    });
  });

  describe("Automatic vs Manual Enrichment Scenarios", async () => {
    it("should simulate automatic enrichment on target creation", async () => {
      // Simulate: TargetCreated event → Event Processor → Enrichment
      const newTargetURI = "https://example.com/auto-enriched";
      const newTargetId = await contracts.ETSTarget.computeTargetId(newTargetURI);

      // Step 1: Target creation emits TargetCreated event
      await expect(contracts.ETSTarget.connect(accounts.RandomOne).createTarget(newTargetURI))
        .to.emit(contracts.ETSTarget, "TargetCreated")
        .withArgs(newTargetId);

      // Step 2: Simulate event processor processing the TargetCreated event
      const mockArweaveTxId = "MOCK_html_b2c3d4e5_1735123457";
      const mockHttpStatus = 200;
      const enrichedTimestamp = BigInt(Date.now());

      await contracts.ETSTarget.connect(eventProcessorSigner).updateTarget(
        newTargetId,
        newTargetURI,
        enrichedTimestamp,
        mockHttpStatus,
        mockArweaveTxId,
      );

      // Verify the target was enriched
      const enrichedTarget = await contracts.ETSTarget.getTargetById(newTargetId);
      expect(enrichedTarget.arweaveTxId).to.equal(mockArweaveTxId);
      expect(enrichedTarget.httpStatus).to.equal(mockHttpStatus);
    });

    it("should simulate manual enrichment request flow", async () => {
      // Simulate: requestEnrichTarget() → EnrichTargetRequested event → Event Processor → Enrichment

      // Step 1: Consumer requests manual enrichment
      await expect(contracts.ETSEnrichTarget.connect(accounts.RandomOne).requestEnrichTarget(targetId))
        .to.emit(contracts.ETSEnrichTarget, "EnrichTargetRequested")
        .withArgs(targetId, accounts.RandomOne.address);

      // Step 2: Simulate event processor processing the EnrichTargetRequested event
      const mockArweaveTxId = "MOCK_json_c3d4e5f6_1735123458";
      const mockHttpStatus = 200;
      const enrichedTimestamp = BigInt(Date.now());

      await contracts.ETSTarget.connect(eventProcessorSigner).updateTarget(
        targetId,
        targetURI,
        enrichedTimestamp,
        mockHttpStatus,
        mockArweaveTxId,
      );

      // Verify the target was enriched
      const enrichedTarget = await contracts.ETSTarget.getTargetById(targetId);
      expect(enrichedTarget.arweaveTxId).to.equal(mockArweaveTxId);
      expect(enrichedTarget.httpStatus).to.equal(mockHttpStatus);
    });

    it("should support re-enrichment of existing targets", async () => {
      // First enrichment
      const firstArweaveTxId = "MOCK_json_d4e5f6g7_1735123459";
      const firstHttpStatus = 200;
      const firstTimestamp = BigInt(Date.now());

      await contracts.ETSTarget.connect(eventProcessorSigner).updateTarget(
        targetId,
        targetURI,
        firstTimestamp,
        firstHttpStatus,
        firstArweaveTxId,
      );

      // Simulate time passing and content changing
      await mine(100);

      // Second enrichment with updated content
      const secondArweaveTxId = "MOCK_json_e5f6g7h8_1735123460";
      const secondHttpStatus = 200;
      const secondTimestamp = BigInt(Date.now()) + 1000n;

      await contracts.ETSTarget.connect(eventProcessorSigner).updateTarget(
        targetId,
        targetURI,
        secondTimestamp,
        secondHttpStatus,
        secondArweaveTxId,
      );

      // Verify the target was updated with new enrichment data
      const reEnrichedTarget = await contracts.ETSTarget.getTargetById(targetId);
      expect(reEnrichedTarget.arweaveTxId).to.equal(secondArweaveTxId);
      expect(reEnrichedTarget.httpStatus).to.equal(secondHttpStatus);
      expect(reEnrichedTarget.enriched).to.equal(secondTimestamp);
    });
  });

  describe("Mock Enrichment Data Scenarios", async () => {
    it("should handle different content types in mock Arweave transaction IDs", async () => {
      const testCases = [
        {
          contentType: "HTML",
          mockTxId: "MOCK_html_a1b2c3d4_1735123456",
          httpStatus: 200,
        },
        {
          contentType: "JSON",
          mockTxId: "MOCK_json_b2c3d4e5_1735123457",
          httpStatus: 200,
        },
        {
          contentType: "Image",
          mockTxId: "MOCK_image_c3d4e5f6_1735123458",
          httpStatus: 200,
        },
        {
          contentType: "Generic",
          mockTxId: "MOCK_unkno_d4e5f6g7_1735123459",
          httpStatus: 200,
        },
      ];

      for (const testCase of testCases) {
        const testTargetURI = `https://example.com/${testCase.contentType.toLowerCase()}-content`;
        const testTargetId = await contracts.ETSTarget.computeTargetId(testTargetURI);

        // Create target
        await contracts.ETSTarget.connect(accounts.RandomOne).createTarget(testTargetURI);

        // Enrich with mock data
        await contracts.ETSTarget.connect(eventProcessorSigner).updateTarget(
          testTargetId,
          testTargetURI,
          BigInt(Date.now()),
          testCase.httpStatus,
          testCase.mockTxId,
        );

        // Verify enrichment
        const target = await contracts.ETSTarget.getTargetById(testTargetId);
        expect(target.arweaveTxId).to.equal(testCase.mockTxId);
        expect(target.httpStatus).to.equal(testCase.httpStatus);
      }
    });

    it("should handle various HTTP status codes", async () => {
      const statusCodes = [
        { status: 200, description: "OK" },
        { status: 404, description: "Not Found" },
        { status: 422, description: "Unprocessable Entity" },
        { status: 500, description: "Internal Server Error" },
        { status: 403, description: "Forbidden" },
      ];

      for (const statusCode of statusCodes) {
        const testTargetURI = `https://example.com/status-${statusCode.status}`;
        const testTargetId = await contracts.ETSTarget.computeTargetId(testTargetURI);

        // Create target
        await contracts.ETSTarget.connect(accounts.RandomOne).createTarget(testTargetURI);

        // Enrich with status code
        const mockTxId = statusCode.status === 200 ? "MOCK_json_success_123" : "";
        await contracts.ETSTarget.connect(eventProcessorSigner).updateTarget(
          testTargetId,
          testTargetURI,
          BigInt(Date.now()),
          statusCode.status,
          mockTxId,
        );

        // Verify status code was recorded
        const target = await contracts.ETSTarget.getTargetById(testTargetId);
        expect(target.httpStatus).to.equal(statusCode.status);
        expect(target.arweaveTxId).to.equal(mockTxId);
      }
    });
  });

  describe("API Gateway Functionality", async () => {
    it("should provide clean enrichment request interface", async () => {
      // Verify the interface has the requestEnrichTarget function
      expect(typeof contracts.ETSEnrichTarget.requestEnrichTarget).to.equal("function");

      // Verify it emits the correct event
      await expect(contracts.ETSEnrichTarget.connect(accounts.RandomOne).requestEnrichTarget(targetId)).to.emit(
        contracts.ETSEnrichTarget,
        "EnrichTargetRequested",
      );
    });
  });
});
