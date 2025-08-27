import { TestWorkflowEnvironment } from "@temporalio/testing";
import { Worker } from "@temporalio/worker";
import {
  allocateCreatorRewards,
  createTagCoinMetadata,
  deployTagCoinOnZora,
} from "../src/activities/tagCoinActivities";
import type { TagCreatedWorkflowInput } from "../src/types";
import { TagCreatedWorkflow } from "../src/workflows";

describe("TagCreatedWorkflow", () => {
  let testEnv: TestWorkflowEnvironment;

  beforeAll(async () => {
    testEnv = await TestWorkflowEnvironment.createLocal();
  }, 30000); // 30 second timeout

  afterAll(async () => {
    await testEnv?.teardown();
  });

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
        blockNumber: "300",
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
  }, 60000); // 60 second timeout
});
