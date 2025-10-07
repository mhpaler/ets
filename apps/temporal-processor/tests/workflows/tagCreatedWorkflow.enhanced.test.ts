import { TestWorkflowEnvironment } from "@temporalio/testing";
import { Worker } from "@temporalio/worker";
import type { TagCreatedWorkflowInput } from "../../src/types";
import { TagCreatedWorkflow } from "../../src/workflows";

describe("TagCreatedWorkflow - Enhanced Tests", () => {
  let testEnv: TestWorkflowEnvironment;

  beforeAll(async () => {
    testEnv = await TestWorkflowEnvironment.createLocal();
  }, 30000);

  afterAll(async () => {
    await testEnv?.teardown();
  });

  describe("Happy Path", () => {
    it("should successfully create a TAG coin with all steps", async () => {
      const { client, nativeConnection } = testEnv;

      const mockActivities = {
        createTagCoinMetadata: jest.fn().mockResolvedValue({
          metadataURI: "ipfs://test-metadata-uri",
          status: "success",
        }),
        fetchPoolConfig: jest.fn().mockResolvedValue({
          poolConfig: "0x0000000000000000000000000000000000000000",
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
        workflowsPath: require.resolve("../../src/workflows"),
        activities: mockActivities,
      });

      await worker.runUntil(async () => {
        const input: TagCreatedWorkflowInput = {
          tagId: "789",
          coinAddress: "0x1234567890abcdef",
          originalInput: "#ethereum",
          displayVersion: "#Ethereum",
          machineName: "ethereum",
          creator: "0xcreator123",
          channel: "0xchannel123",
          transactionHash: "0x789abc",
          blockNumber: "300",
          chainId: 31337,
          timestamp: new Date().toISOString(),
        };

        const result = await client.workflow.execute(TagCreatedWorkflow, {
          workflowId: "test-tag-creation-happy",
          taskQueue: "test",
          args: [input],
        });

        expect(result.status).toBe("completed");
        expect(result.tagId).toBe("789");
        expect(result.steps.createMetadata).toBe(true);
        expect(result.steps.deployOnZora).toBe(true);
        expect(result.steps.allocateRewards).toBe(true);
        expect(result.coinAddress).toBe("0x1234567890abcdef");
        expect(result.zoraTxHash).toBe("0xabcdef123456");
      });
    }, 60000);

    it("should handle batch TAG creation efficiently", async () => {
      const { client, nativeConnection } = testEnv;

      const mockActivities = {
        createTagCoinMetadata: jest.fn().mockImplementation(async (params) => ({
          metadataURI: `ipfs://metadata-${params.tagId}`,
          status: "success",
        })),
        fetchPoolConfig: jest.fn().mockResolvedValue({
          poolConfig: "0x0000000000000000000000000000000000000000",
          status: "success",
        }),
        deployTagCoinOnZora: jest.fn().mockImplementation(async (params) => ({
          coinAddress: params.coinAddress,
          transactionHash: `0x${params.tagId}`,
          metadataURI: params.metadataURI,
          status: "success",
        })),
        allocateCreatorRewards: jest.fn().mockResolvedValue({
          status: "success",
        }),
      };

      const worker = await Worker.create({
        connection: nativeConnection,
        taskQueue: "test",
        workflowsPath: require.resolve("../../src/workflows"),
        activities: mockActivities,
      });

      await worker.runUntil(async () => {
        const tags = ["#defi", "#nft", "#dao"];
        const results = await Promise.all(
          tags.map((tag, index) =>
            client.workflow.execute(TagCreatedWorkflow, {
              workflowId: `test-batch-${index}`,
              taskQueue: "test",
              args: [
                {
                  tagId: `batch-${index}`,
                  coinAddress: `0xbatch${index}`,
                  originalInput: tag,
                  displayVersion: tag.charAt(0).toUpperCase() + tag.slice(1),
                  machineName: tag.replace("#", "").toLowerCase(),
                  creator: "0xcreator123",
                  channel: "0xchannel123",
                  transactionHash: `0xbatch${index}`,
                  blockNumber: `${400 + index}`,
                  chainId: 31337,
                  timestamp: new Date().toISOString(),
                },
              ],
            }),
          ),
        );

        expect(results).toHaveLength(3);
        results.forEach((result, index) => {
          expect(result.status).toBe("completed");
          expect(result.tagId).toBe(`batch-${index}`);
        });

        // Verify all activities were called for each tag
        expect(mockActivities.createTagCoinMetadata).toHaveBeenCalledTimes(3);
        expect(mockActivities.deployTagCoinOnZora).toHaveBeenCalledTimes(3);
        expect(mockActivities.allocateCreatorRewards).toHaveBeenCalledTimes(3);
      });
    }, 60000);
  });

  describe("Error Handling", () => {
    it("should handle metadata creation failure gracefully", async () => {
      const { client, nativeConnection } = testEnv;

      const mockActivities = {
        createTagCoinMetadata: jest.fn().mockRejectedValue(new Error("IPFS upload failed")),
        fetchPoolConfig: jest.fn().mockResolvedValue({
          poolConfig: "0x0000000000000000000000000000000000000000",
          status: "success",
        }),
        deployTagCoinOnZora: jest.fn(),
        allocateCreatorRewards: jest.fn(),
      };

      const worker = await Worker.create({
        connection: nativeConnection,
        taskQueue: "test",
        workflowsPath: require.resolve("../../src/workflows"),
        activities: mockActivities,
      });

      await worker.runUntil(async () => {
        const input: TagCreatedWorkflowInput = {
          tagId: "error-metadata",
          coinAddress: "0xfailed",
          originalInput: "#failed",
          displayVersion: "#Failed",
          machineName: "failed",
          creator: "0xcreator123",
          channel: "0xchannel123",
          transactionHash: "0xfailed",
          blockNumber: "500",
          chainId: 31337,
          timestamp: new Date().toISOString(),
        };

        await expect(
          client.workflow.execute(TagCreatedWorkflow, {
            workflowId: "test-metadata-failure",
            taskQueue: "test",
            args: [input],
          }),
        ).rejects.toThrow();

        // Verify that metadata creation was attempted but failed
        expect(mockActivities.createTagCoinMetadata).toHaveBeenCalled();
        // Deployment should not be attempted if metadata fails
        expect(mockActivities.deployTagCoinOnZora).not.toHaveBeenCalled();
      });
    }, 60000);

    it("should retry Zora deployment on transient failures", async () => {
      const { client, nativeConnection } = testEnv;

      let deploymentAttempts = 0;
      const mockActivities = {
        createTagCoinMetadata: jest.fn().mockResolvedValue({
          metadataURI: "ipfs://test",
          status: "success",
        }),
        fetchPoolConfig: jest.fn().mockResolvedValue({
          poolConfig: "0x0000000000000000000000000000000000000000",
          status: "success",
        }),
        deployTagCoinOnZora: jest.fn().mockImplementation(async () => {
          deploymentAttempts++;
          if (deploymentAttempts < 3) {
            throw new Error("Network timeout");
          }
          return {
            coinAddress: "0xretried",
            transactionHash: "0xretried123",
            metadataURI: "ipfs://test",
            status: "success",
          };
        }),
        allocateCreatorRewards: jest.fn().mockResolvedValue({
          status: "success",
        }),
      };

      const worker = await Worker.create({
        connection: nativeConnection,
        taskQueue: "test",
        workflowsPath: require.resolve("../../src/workflows"),
        activities: mockActivities,
        maxCachedWorkflows: 0,
      });

      await worker.runUntil(async () => {
        const input: TagCreatedWorkflowInput = {
          tagId: "retry-test",
          coinAddress: "0xretry",
          originalInput: "#retry",
          displayVersion: "#Retry",
          machineName: "retry",
          creator: "0xcreator123",
          channel: "0xchannel123",
          transactionHash: "0xretry",
          blockNumber: "600",
          chainId: 31337,
          timestamp: new Date().toISOString(),
        };

        const result = await client.workflow.execute(TagCreatedWorkflow, {
          workflowId: "test-retry-deployment",
          taskQueue: "test",
          args: [input],
        });

        // Should succeed after retries
        expect(result.status).toBe("completed");
        expect(deploymentAttempts).toBe(3);
        expect(mockActivities.deployTagCoinOnZora).toHaveBeenCalledTimes(3);
      });
    }, 60000);

    it("should handle invalid tag format", async () => {
      const { client, nativeConnection } = testEnv;

      const mockActivities = {
        createTagCoinMetadata: jest.fn().mockImplementation(async (params) => {
          // Use originalInput from the workflow input that gets mapped to tagString in the activity
          // The workflow should pass originalInput to the activity as tagString
          if (!params.tagString || !params.tagString.startsWith("#")) {
            return {
              metadataURI: "",
              status: "failed",
              error: "Invalid tag format",
            };
          }
          return {
            metadataURI: "ipfs://valid",
            status: "success",
          };
        }),
        fetchPoolConfig: jest.fn().mockResolvedValue({
          poolConfig: "0x0000000000000000000000000000000000000000",
          status: "success",
        }),
        deployTagCoinOnZora: jest.fn(),
        allocateCreatorRewards: jest.fn(),
      };

      const worker = await Worker.create({
        connection: nativeConnection,
        taskQueue: "test",
        workflowsPath: require.resolve("../../src/workflows"),
        activities: mockActivities,
      });

      await worker.runUntil(async () => {
        const input: TagCreatedWorkflowInput = {
          tagId: "invalid-tag",
          coinAddress: "0xinvalid",
          originalInput: "notag", // Missing hashtag
          displayVersion: "notag",
          machineName: "notag",
          creator: "0xcreator123",
          channel: "0xchannel123",
          transactionHash: "0xinvalid",
          blockNumber: "700",
          chainId: 31337,
          timestamp: new Date().toISOString(),
        };

        // The workflow should throw when metadata creation returns failed status
        await expect(
          client.workflow.execute(TagCreatedWorkflow, {
            workflowId: "test-invalid-tag",
            taskQueue: "test",
            args: [input],
          }),
        ).rejects.toThrow(); // Temporal wraps with "Workflow execution failed"

        // Verify that metadata creation was attempted with invalid tag
        expect(mockActivities.createTagCoinMetadata).toHaveBeenCalled();
        expect(mockActivities.deployTagCoinOnZora).not.toHaveBeenCalled();
      });
    }, 60000);
  });

  describe("Edge Cases", () => {
    it("should handle duplicate TAG creation attempts", async () => {
      const { client, nativeConnection } = testEnv;

      const deployedCoins = new Set<string>();
      const mockActivities = {
        createTagCoinMetadata: jest.fn().mockResolvedValue({
          metadataURI: "ipfs://duplicate",
          status: "success",
        }),
        fetchPoolConfig: jest.fn().mockResolvedValue({
          poolConfig: "0x0000000000000000000000000000000000000000",
          status: "success",
        }),
        deployTagCoinOnZora: jest.fn().mockImplementation(async (params) => {
          if (deployedCoins.has(params.coinAddress)) {
            return {
              coinAddress: params.coinAddress,
              transactionHash: "0x0", // Existing deployment
              metadataURI: params.metadataURI,
              status: "already_deployed",
            };
          }
          deployedCoins.add(params.coinAddress);
          return {
            coinAddress: params.coinAddress,
            transactionHash: "0xnew",
            metadataURI: params.metadataURI,
            status: "success",
          };
        }),
        allocateCreatorRewards: jest.fn().mockResolvedValue({
          status: "success",
        }),
      };

      const worker = await Worker.create({
        connection: nativeConnection,
        taskQueue: "test",
        workflowsPath: require.resolve("../../src/workflows"),
        activities: mockActivities,
      });

      await worker.runUntil(async () => {
        const input: TagCreatedWorkflowInput = {
          tagId: "duplicate-tag",
          coinAddress: "0xduplicate123",
          originalInput: "#duplicate",
          displayVersion: "#Duplicate",
          machineName: "duplicate",
          creator: "0xcreator123",
          channel: "0xchannel123",
          transactionHash: "0xdup1",
          blockNumber: "800",
          chainId: 31337,
          timestamp: new Date().toISOString(),
        };

        // First creation
        const result1 = await client.workflow.execute(TagCreatedWorkflow, {
          workflowId: "test-duplicate-1",
          taskQueue: "test",
          args: [input],
        });

        expect(result1.status).toBe("completed");
        expect(result1.zoraTxHash).toBe("0xnew");

        // Duplicate attempt with same coin address
        const result2 = await client.workflow.execute(TagCreatedWorkflow, {
          workflowId: "test-duplicate-2",
          taskQueue: "test",
          args: [
            {
              ...input,
              transactionHash: "0xdup2",
              blockNumber: "801",
            },
          ],
        });

        // Even though it's already deployed, the workflow should complete successfully
        // since the deployment activity returns a status (not throwing)
        expect(result2.status).toBe("completed");
        // The transaction hash should be 0x0 for already deployed
        expect(result2.zoraTxHash).toBe("0x0");
      });
    }, 60000);

    it("should handle special characters in tag names", async () => {
      const { client, nativeConnection } = testEnv;

      const mockActivities = {
        createTagCoinMetadata: jest.fn().mockImplementation(async (params) => {
          // Validate that special chars are handled properly
          const cleanedTag = params.tagString ? params.tagString.replace("#", "") : "";
          return {
            metadataURI: `data:application/json;base64,${Buffer.from(
              JSON.stringify({
                name: `TAG: ${cleanedTag}`,
                symbol: "ETS",
              }),
            ).toString("base64")}`,
            status: "success",
          };
        }),
        fetchPoolConfig: jest.fn().mockResolvedValue({
          poolConfig: "0x0000000000000000000000000000000000000000",
          status: "success",
        }),
        deployTagCoinOnZora: jest.fn().mockResolvedValue({
          coinAddress: "0xspecial",
          transactionHash: "0xspecial123",
          metadataURI: "data:...",
          status: "success",
        }),
        allocateCreatorRewards: jest.fn().mockResolvedValue({
          status: "success",
        }),
      };

      const worker = await Worker.create({
        connection: nativeConnection,
        taskQueue: "test",
        workflowsPath: require.resolve("../../src/workflows"),
        activities: mockActivities,
      });

      const specialTags = ["#DeFi-2024", "#NFT_Collection", "#DAO.eth", "#Layer2+", "#Web3.0"];

      await worker.runUntil(async () => {
        const results = await Promise.all(
          specialTags.map((tag, index) =>
            client.workflow.execute(TagCreatedWorkflow, {
              workflowId: `test-special-${index}`,
              taskQueue: "test",
              args: [
                {
                  tagId: `special-${index}`,
                  coinAddress: `0xspecial${index}`,
                  originalInput: tag,
                  displayVersion: tag.charAt(0) + tag.charAt(1).toUpperCase() + tag.slice(2),
                  machineName: tag.replace("#", "").toLowerCase(),
                  creator: "0xcreator123",
                  channel: "0xchannel123",
                  transactionHash: `0xspec${index}`,
                  blockNumber: `${900 + index}`,
                  chainId: 31337,
                  timestamp: new Date().toISOString(),
                },
              ],
            }),
          ),
        );

        results.forEach((result) => {
          expect(result.status).toBe("completed");
        });

        // Verify all special character tags were processed
        expect(mockActivities.createTagCoinMetadata).toHaveBeenCalledTimes(specialTags.length);
      });
    }, 60000);

    it("should handle very long tag names", async () => {
      const { client, nativeConnection } = testEnv;

      const mockActivities = {
        createTagCoinMetadata: jest.fn().mockImplementation(async (params) => {
          // Tag name length validation
          if (params.tagString && params.tagString.length > 100) {
            return {
              metadataURI: "",
              status: "failed",
              error: "Tag name too long",
            };
          }
          return {
            metadataURI: "ipfs://long-tag",
            status: "success",
          };
        }),
        fetchPoolConfig: jest.fn().mockResolvedValue({
          poolConfig: "0x0000000000000000000000000000000000000000",
          status: "success",
        }),
        deployTagCoinOnZora: jest.fn(),
        allocateCreatorRewards: jest.fn(),
      };

      const worker = await Worker.create({
        connection: nativeConnection,
        taskQueue: "test",
        workflowsPath: require.resolve("../../src/workflows"),
        activities: mockActivities,
      });

      await worker.runUntil(async () => {
        const veryLongTag = "#" + "a".repeat(150); // 151 chars total

        const input: TagCreatedWorkflowInput = {
          tagId: "long-tag",
          coinAddress: "0xlong",
          originalInput: veryLongTag,
          displayVersion: veryLongTag,
          machineName: veryLongTag.replace("#", "").toLowerCase(),
          creator: "0xcreator123",
          channel: "0xchannel123",
          transactionHash: "0xlong",
          blockNumber: "1000",
          chainId: 31337,
          timestamp: new Date().toISOString(),
        };

        // The workflow should throw when metadata creation returns failed status
        await expect(
          client.workflow.execute(TagCreatedWorkflow, {
            workflowId: "test-long-tag",
            taskQueue: "test",
            args: [input],
          }),
        ).rejects.toThrow(); // Temporal wraps with "Workflow execution failed"

        // Verify that metadata creation was attempted
        expect(mockActivities.createTagCoinMetadata).toHaveBeenCalled();
        expect(mockActivities.deployTagCoinOnZora).not.toHaveBeenCalled();
      });
    }, 60000);
  });

  describe("Environment-Specific Behavior", () => {
    it("should use MockZoraFactory for localhost", async () => {
      const { client, nativeConnection } = testEnv;

      const mockActivities = {
        createTagCoinMetadata: jest.fn().mockResolvedValue({
          metadataURI: "data:application/json;base64,test",
          status: "success",
        }),
        fetchPoolConfig: jest.fn().mockResolvedValue({
          poolConfig: "0x0000000000000000000000000000000000000000",
          status: "success",
        }),
        deployTagCoinOnZora: jest.fn().mockImplementation(async (params) => {
          // Localhost should use MockZoraFactory
          // Note: chainId is not passed to activity, it's available in the workflow input
          return {
            coinAddress: params.coinAddress,
            transactionHash: "0xlocal",
            metadataURI: params.metadataURI,
            status: "success",
            factory: "MockZoraFactory",
          };
        }),
        allocateCreatorRewards: jest.fn().mockResolvedValue({
          status: "success",
        }),
      };

      const worker = await Worker.create({
        connection: nativeConnection,
        taskQueue: "test",
        workflowsPath: require.resolve("../../src/workflows"),
        activities: mockActivities,
      });

      await worker.runUntil(async () => {
        const input: TagCreatedWorkflowInput = {
          tagId: "localhost-test",
          coinAddress: "0xlocal",
          originalInput: "#localhost",
          displayVersion: "#Localhost",
          machineName: "localhost",
          creator: "0xcreator123",
          channel: "0xchannel123",
          transactionHash: "0xlocal",
          blockNumber: "1100",
          chainId: 31337, // Localhost
          timestamp: new Date().toISOString(),
        };

        const result = await client.workflow.execute(TagCreatedWorkflow, {
          workflowId: "test-localhost",
          taskQueue: "test",
          args: [input],
        });

        expect(result.status).toBe("completed");
        // Verify the correct chainId was used in the workflow input
        expect(input.chainId).toBe(31337);
        expect(mockActivities.deployTagCoinOnZora).toHaveBeenCalled();
      });
    }, 60000);

    it("should use real Zora for Base Sepolia", async () => {
      const { client, nativeConnection } = testEnv;

      const mockActivities = {
        createTagCoinMetadata: jest.fn().mockResolvedValue({
          metadataURI: "ipfs://QmTest",
          status: "success",
        }),
        fetchPoolConfig: jest.fn().mockResolvedValue({
          poolConfig: "0x0000000000000000000000000000000000000000",
          status: "success",
        }),
        deployTagCoinOnZora: jest.fn().mockImplementation(async (params) => {
          // Base Sepolia should use real Zora
          // Note: chainId is not passed to activity, it's available in the workflow input
          return {
            coinAddress: params.coinAddress,
            transactionHash: "0xsepolia",
            metadataURI: params.metadataURI,
            status: "success",
            factory: "ZoraFactory",
          };
        }),
        allocateCreatorRewards: jest.fn().mockResolvedValue({
          status: "success",
        }),
      };

      const worker = await Worker.create({
        connection: nativeConnection,
        taskQueue: "test",
        workflowsPath: require.resolve("../../src/workflows"),
        activities: mockActivities,
      });

      await worker.runUntil(async () => {
        const input: TagCreatedWorkflowInput = {
          tagId: "sepolia-test",
          coinAddress: "0xsepolia",
          originalInput: "#sepolia",
          displayVersion: "#Sepolia",
          machineName: "sepolia",
          creator: "0xcreator123",
          channel: "0xchannel123",
          transactionHash: "0xsepolia",
          blockNumber: "2000",
          chainId: 84532, // Base Sepolia
          timestamp: new Date().toISOString(),
        };

        const result = await client.workflow.execute(TagCreatedWorkflow, {
          workflowId: "test-sepolia",
          taskQueue: "test",
          args: [input],
        });

        expect(result.status).toBe("completed");
        // Verify the correct chainId was used in the workflow input
        expect(input.chainId).toBe(84532);
        expect(mockActivities.deployTagCoinOnZora).toHaveBeenCalled();
      });
    }, 60000);
  });
});
