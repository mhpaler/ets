import { TestWorkflowEnvironment } from "@temporalio/testing";
import { Worker } from "@temporalio/worker";
import {
  fetchTargetMetadata,
  updateTargetOnChain,
  uploadToArweave,
} from "../src/activities/targetEnrichmentActivities";
import type { TargetEnrichmentWorkflowInput } from "../src/types";
import { TargetEnrichmentWorkflow } from "../src/workflows";

describe("TargetEnrichmentWorkflow", () => {
  let testEnv: TestWorkflowEnvironment;

  beforeAll(async () => {
    testEnv = await TestWorkflowEnvironment.createLocal();
  }, 30000); // 30 second timeout

  afterAll(async () => {
    await testEnv?.teardown();
  });

  it("should successfully enrich a target with metadata", async () => {
    const { client, nativeConnection } = testEnv;

    // Mock activities
    const mockActivities = {
      fetchTargetMetadata: jest.fn().mockResolvedValue({
        title: "Test Title",
        description: "Test Description",
        image: "https://example.com/image.jpg",
        keywords: ["test", "example"],
        targetType: "website",
        status: "success",
      }),
      uploadToArweave: jest.fn().mockResolvedValue({
        transactionId: "test-arweave-tx-123",
        gatewayUrl: "https://arweave.net/test-arweave-tx-123",
        status: "success",
      }),
      updateTargetOnChain: jest.fn().mockResolvedValue({
        transactionHash: "0x123456789",
        status: "success",
      }),
    };

    // Create worker with mocked activities
    const worker = await Worker.create({
      connection: nativeConnection,
      taskQueue: "test",
      workflowsPath: require.resolve("../src/workflows"),
      activities: mockActivities,
    });

    // Start worker
    await worker.runUntil(async () => {
      const input: TargetEnrichmentWorkflowInput = {
        targetId: "123",
        targetURI: "https://example.com",
        transactionHash: "0xabc123",
        blockNumber: "100",
        chainId: 31337,
        timestamp: new Date(),
      };

      // Execute workflow
      const result = await client.workflow.execute(TargetEnrichmentWorkflow, {
        workflowId: "test-target-enrichment",
        taskQueue: "test",
        args: [input],
      });

      // Verify result
      expect(result.status).toBe("completed");
      expect(result.targetId).toBe("123");
      expect(result.steps.fetchMetadata).toBe(true);
      expect(result.steps.uploadToArweave).toBe(true);
      expect(result.steps.updateBlockchain).toBe(true);
      expect(result.arweaveTransactionId).toBe("test-arweave-tx-123");
      expect(result.metadataURI).toBe("https://arweave.net/test-arweave-tx-123");

      // Verify activities were called
      expect(mockActivities.fetchTargetMetadata).toHaveBeenCalledWith({
        targetId: "123",
        targetURI: "https://example.com",
      });
      expect(mockActivities.uploadToArweave).toHaveBeenCalled();
      expect(mockActivities.updateTargetOnChain).toHaveBeenCalled();
    });
  }, 60000); // 60 second timeout

  it("should handle partial failure gracefully", async () => {
    const { client, nativeConnection } = testEnv;

    // Mock activities with on-chain update failure
    const mockActivities = {
      fetchTargetMetadata: jest.fn().mockResolvedValue({
        title: "Test Title",
        status: "success",
      }),
      uploadToArweave: jest.fn().mockResolvedValue({
        transactionId: "test-arweave-tx-456",
        gatewayUrl: "https://arweave.net/test-arweave-tx-456",
        status: "success",
      }),
      updateTargetOnChain: jest.fn().mockResolvedValue({
        status: "failed",
        error: "Insufficient gas",
      }),
    };

    const worker = await Worker.create({
      connection: nativeConnection,
      taskQueue: "test",
      workflowsPath: require.resolve("../src/workflows"),
      activities: mockActivities,
    });

    await worker.runUntil(async () => {
      const input: TargetEnrichmentWorkflowInput = {
        targetId: "456",
        targetURI: "https://example.com",
        transactionHash: "0xdef456",
        blockNumber: "200",
        chainId: 31337,
        timestamp: new Date(),
      };

      const result = await client.workflow.execute(TargetEnrichmentWorkflow, {
        workflowId: "test-partial-failure",
        taskQueue: "test",
        args: [input],
      });

      // Should be partial success since Arweave succeeded
      expect(result.status).toBe("partial");
      expect(result.steps.fetchMetadata).toBe(true);
      expect(result.steps.uploadToArweave).toBe(true);
      expect(result.steps.updateBlockchain).toBe(false);
      expect(result.arweaveTransactionId).toBe("test-arweave-tx-456");
      expect(result.error).toContain("Insufficient gas");
    });
  }, 60000); // 60 second timeout
});
