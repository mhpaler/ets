import { TestWorkflowEnvironment } from "@temporalio/testing";
import { Worker } from "@temporalio/worker";
import { callEnrichTargetOnChain, fetchTargetMetadata } from "../../src/activities/targetEnrichmentActivities";
import type { TargetEnrichmentWorkflowInput } from "../../src/types";
import { TargetEnrichmentWorkflow } from "../../src/workflows";

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
        core: {
          uri: "https://example.com",
          title: "Test Title",
          description: "Test Description",
          image: "https://example.com/image.jpg",
          httpStatus: 200,
          extractionMethod: "opengraph",
          extractedAt: new Date().toISOString(),
        },
        type: "website",
        platform: undefined,
        keywords: ["test", "example"],
      }),
      callEnrichTargetOnChain: jest.fn().mockResolvedValue({
        transactionHash: "0x123456789",
        status: "success",
      }),
    };

    // Create worker with mocked activities
    const worker = await Worker.create({
      connection: nativeConnection,
      taskQueue: "test",
      workflowsPath: require.resolve("../../src/workflows"),
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
      expect(result.steps.emitEnrichmentEvent).toBe(true);
      expect(result.enrichmentTransactionHash).toBe("0x123456789");

      // Verify activities were called
      expect(mockActivities.fetchTargetMetadata).toHaveBeenCalledWith({
        targetId: "123",
        targetURI: "https://example.com",
      });
      expect(mockActivities.callEnrichTargetOnChain).toHaveBeenCalled();
    });
  }, 60000); // 60 second timeout

  it("should handle partial failure gracefully", async () => {
    const { client, nativeConnection } = testEnv;

    // Mock activities with on-chain enrichment failure
    const mockActivities = {
      fetchTargetMetadata: jest.fn().mockResolvedValue({
        core: {
          uri: "https://example.com",
          title: "Test Title",
          description: "Test Description",
          httpStatus: 200,
          extractionMethod: "opengraph",
          extractedAt: new Date().toISOString(),
        },
        type: "website",
      }),
      callEnrichTargetOnChain: jest.fn().mockResolvedValue({
        status: "failed",
        error: "Insufficient gas",
        transactionHash: "0x0",
      }),
    };

    const worker = await Worker.create({
      connection: nativeConnection,
      taskQueue: "test",
      workflowsPath: require.resolve("../../src/workflows"),
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

      // The workflow should throw an error when on-chain enrichment fails
      await expect(
        client.workflow.execute(TargetEnrichmentWorkflow, {
          workflowId: "test-partial-failure",
          taskQueue: "test",
          args: [input],
        }),
      ).rejects.toThrow("Workflow execution failed");

      // Verify that metadata was still attempted to be fetched
      expect(mockActivities.fetchTargetMetadata).toHaveBeenCalled();
      expect(mockActivities.callEnrichTargetOnChain).toHaveBeenCalled();
    });
  }, 60000); // 60 second timeout
});
