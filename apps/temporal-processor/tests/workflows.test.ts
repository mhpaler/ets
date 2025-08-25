import { TestWorkflowEnvironment } from "@temporalio/testing";
import { Worker } from "@temporalio/worker";
import { 
  fetchTargetMetadata,
  uploadToArweave, 
  updateTargetOnChain
} from "../src/activities/targetEnrichmentActivities";
import { 
  createTagCoinMetadata,
  deployTagCoinOnZora,
  allocateCreatorRewards
} from "../src/activities/tagCoinActivities";
import type { TagCreatedWorkflowInput, TargetEnrichmentWorkflowInput } from "../src/types";
import { TagCreatedWorkflow, TargetEnrichmentWorkflow } from "../src/workflows";

describe("Temporal Workflows", () => {
  let testEnv: TestWorkflowEnvironment;

  beforeAll(async () => {
    testEnv = await TestWorkflowEnvironment.createLocal();
  });

  afterAll(async () => {
    await testEnv?.teardown();
  });

  describe("TargetEnrichmentWorkflow", () => {
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
          blockNumber: 100n,
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
    });

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
          blockNumber: 200n,
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
    });
  });

  describe("TagCreatedWorkflow", () => {
    it("should successfully create a TAG coin", async () => {
      const { client, nativeConnection } = testEnv;

      // Mock activities
      const mockActivities = {
        createTagCoinMetadata: jest.fn().mockResolvedValue({
          metadataURI: "ipfs://test-metadata-uri",
          status: "success",
        }),
        deployTagCoinOnZora: jest.fn().mockResolvedValue({
          coinAddress: "0x1234567890abcdef",
          transactionHash: "0xabcdef123456",
          metadataURI: "ipfs://test-metadata-uri",
          status: "success",
        }),
        allocateCreatorRewards: jest.fn().mockResolvedValue({
          status: "success",
        }),
      };

      const worker = await Worker.create({
        connection: nativeConnection,
        taskQueue: "test",
        workflowsPath: require.resolve("../src/workflows"),
        activities: mockActivities,
      });

      await worker.runUntil(async () => {
        const input: TagCreatedWorkflowInput = {
          tagId: "789",
          coinAddress: "0x1234567890abcdef",
          tagString: "#ethereum",
          creator: "0xcreator123",
          transactionHash: "0x789abc",
          blockNumber: 300n,
          chainId: 31337,
          timestamp: new Date(),
        };

        const result = await client.workflow.execute(TagCreatedWorkflow, {
          workflowId: "test-tag-creation",
          taskQueue: "test",
          args: [input],
        });

        // Verify result
        expect(result.status).toBe("completed");
        expect(result.tagId).toBe("789");
        expect(result.steps.createMetadata).toBe(true);
        expect(result.steps.deployOnZora).toBe(true);
        expect(result.steps.allocateRewards).toBe(true);
        expect(result.coinAddress).toBe("0x1234567890abcdef");
        expect(result.zoraTxHash).toBe("0xabcdef123456");

        // Verify activities were called
        expect(mockActivities.createTagCoinMetadata).toHaveBeenCalledWith({
          tagId: "789",
          tagString: "#ethereum",
          creator: "0xcreator123",
          coinAddress: "0x1234567890abcdef",
        });
        expect(mockActivities.deployTagCoinOnZora).toHaveBeenCalled();
        expect(mockActivities.allocateCreatorRewards).toHaveBeenCalled();
      });
    });
  });
});
