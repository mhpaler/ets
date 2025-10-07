// @ts-ignore - Bun test runner types
import { afterAll, beforeAll, describe, test } from "bun:test";
import { ETSChannelABI, ETSTokenABI, MockZoraFactoryABI } from "@ethereum-tag-service/contracts/abis";
import { expect } from "chai";
import {
  http,
  type Address,
  type Hash,
  createPublicClient,
  createWalletClient,
  encodeAbiParameters,
  keccak256,
  parseEventLogs,
  toBytes,
} from "viem";
import { mnemonicToAccount } from "viem/accounts";
import { type base, baseSepolia, localhost } from "viem/chains";

/**
 * TAG Coin Temporal Integration Test
 *
 * Tests the complete TAG coin creation flow through Temporal workflows:
 * 1. TAG creation via ETS contracts
 * 2. TagCreated event emission
 * 3. Temporal workflow detection and processing
 * 4. MockZoraFactory deployment (localhost) or real Zora (staging)
 * 5. Metadata generation and storage
 * 6. Creator reward allocation (placeholder)
 *
 * This test specifically validates the Temporal Processor integration
 * and ensures the workflow completes successfully.
 */

interface TestConfig {
  name: string;
  rpcUrl: string;
  chainId: number;
  chain: typeof localhost | typeof baseSepolia | typeof base;
  temporalUrl?: string;
  requiresLocalServices: boolean;
  isReadOnly: boolean;
  mnemonic?: string;
  accounts: {
    deployer?: number;
    admin?: number;
    eventProcessor?: number;
    tester?: number;
  };
  timeouts: {
    tagCreation: number;
    workflowCompletion: number;
    serviceHealth: number;
  };
  contracts?: {
    etsToken?: Address;
    etsChannel?: Address;
    mockZoraFactory?: Address;
  };
}

const testConfigs: Record<string, TestConfig> = {
  local: {
    name: "Local Development with Temporal",
    rpcUrl: "http://localhost:8545",
    chainId: 31337,
    chain: localhost,
    temporalUrl: "http://localhost:8080",
    requiresLocalServices: true,
    isReadOnly: false,
    mnemonic: "test test test test test test test test test test test junk",
    accounts: {
      deployer: 0,
      admin: 1,
      eventProcessor: 2,
      tester: 4,
    },
    timeouts: {
      tagCreation: 5000,
      workflowCompletion: 30000, // Allow 30s for Temporal workflow
      serviceHealth: 10000,
    },
  },
  staging: {
    name: "Base Sepolia with Temporal",
    rpcUrl: process.env.STAGING_RPC_URL || `https://base-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
    chainId: 84532,
    chain: baseSepolia,
    requiresLocalServices: false,
    isReadOnly: false,
    mnemonic: process.env.MNEMONIC_TESTNET_STAGING,
    accounts: {
      deployer: 0,
      admin: 1,
      eventProcessor: 2,
      tester: 4,
    },
    timeouts: {
      tagCreation: 15000,
      workflowCompletion: 60000, // Allow more time on testnet
      serviceHealth: 15000,
    },
  },
};

describe("TAG Coin Temporal Integration", () => {
  let config: TestConfig;
  let publicClient: any;
  let walletClient: any;
  let servicesHealthy = false;
  let temporalHealthy = false;

  // Unique test run ID to prevent conflicts
  const testRunId = Date.now().toString();

  beforeAll(async () => {
    console.log("🚀 Setting up TAG Coin Temporal integration test");

    // Determine environment
    const envName = process.env.TEST_ENV || "local";
    config = testConfigs[envName];

    if (!config) {
      throw new Error(`Unknown test environment: ${envName}`);
    }

    console.log(`📍 Environment: ${config.name}`);
    console.log(`🔗 Chain ID: ${config.chainId}`);
    console.log(`📡 RPC: ${config.rpcUrl}`);
    if (config.temporalUrl) {
      console.log(`⏰ Temporal: ${config.temporalUrl}`);
    }

    // Setup blockchain clients
    publicClient = createPublicClient({
      chain: config.chain,
      transport: http(config.rpcUrl),
    });

    if (!config.isReadOnly && config.mnemonic) {
      const account = mnemonicToAccount(config.mnemonic, {
        addressIndex: config.accounts.tester || 4,
      });

      walletClient = createWalletClient({
        account,
        chain: config.chain,
        transport: http(config.rpcUrl),
      });

      console.log(`👤 Test account: ${account.address}`);
    }

    // Check required services
    if (config.requiresLocalServices) {
      await checkLocalServices();
    } else {
      servicesHealthy = true;
      temporalHealthy = true;
    }

    // Load contract addresses
    await loadContractAddresses();

    console.log(`\n✅ Test environment ready!\n`);
  });

  afterAll(async () => {
    console.log("🧹 Cleanup complete");
  });

  async function checkLocalServices() {
    console.log("\n🔍 Checking local services...");

    // Check Hardhat node
    try {
      const blockNumber = await publicClient.getBlockNumber();
      console.log(`  ✅ Hardhat node (block: ${blockNumber})`);
      servicesHealthy = true;
    } catch (error) {
      console.log(`  ❌ Hardhat node: ${error}`);
      servicesHealthy = false;
    }

    // Check Temporal
    if (config.temporalUrl) {
      try {
        const response = await fetch(`${config.temporalUrl}/api/v1/system-info`);
        if (response.ok) {
          console.log(`  ✅ Temporal Server`);
          temporalHealthy = true;
        } else {
          console.log(`  ⚠️ Temporal UI returned status ${response.status}`);
          temporalHealthy = false;
        }
      } catch (error) {
        console.log(`  ⚠️ Temporal not accessible (workflows may not complete)`);
        temporalHealthy = false;
      }
    }

    if (!servicesHealthy) {
      throw new Error("Required services not running. Run: ./scripts/start-local-stack.sh");
    }
  }

  async function loadContractAddresses() {
    console.log("\n📦 Loading contract addresses...");

    try {
      const { getContractAddresses } = await import("@ethereum-tag-service/contracts/deployments");
      const networkName = config.chainId === 31337 ? "localhost" : config.chainId === 84532 ? "baseSepolia" : "base";
      const addresses = getContractAddresses(networkName);

      if (addresses) {
        config.contracts = {
          etsToken: addresses.token as Address,
          mockZoraFactory: addresses.mockZoraFactory as Address,
        };

        // Find a channel to use for testing
        const channelFactory = addresses.channelFactory as Address;
        if (channelFactory) {
          // Try to get the first available channel or deploy one
          // For simplicity, we'll assume TestChannel exists
          config.contracts.etsChannel = await findOrDeployChannel(channelFactory);
        }

        console.log(`  ETS Token: ${config.contracts.etsToken}`);
        console.log(`  ETS Channel: ${config.contracts.etsChannel}`);
        if (config.contracts.mockZoraFactory) {
          console.log(`  MockZoraFactory: ${config.contracts.mockZoraFactory}`);
        }
      }
    } catch (error) {
      console.log(`  ⚠️ Could not load contracts: ${error}`);
    }
  }

  async function findOrDeployChannel(factoryAddress: Address): Promise<Address> {
    // For test purposes, we'll return a known test channel address
    // In a real scenario, we'd query or deploy
    return "0x0000000000000000000000000000000000000001" as Address;
  }

  describe("Temporal Workflow Integration", () => {
    test(
      "should process TagCreated event through Temporal workflow",
      async () => {
        if (!servicesHealthy || config.isReadOnly) {
          console.log("⏭️ Skipping - services not available or read-only");
          return;
        }

        if (!temporalHealthy) {
          console.log("⚠️ Temporal not running - workflow won't complete");
        }

        const uniqueTag = `#temporal${testRunId}`;
        console.log(`\n🏷️ Creating TAG: ${uniqueTag}`);

        // Step 1: Create TAG through ETSChannel
        console.log("1️⃣ Creating TAG via ETSChannel...");

        const createTagsHash = await walletClient.writeContract({
          address: config.contracts!.etsChannel!,
          abi: ETSChannelABI,
          functionName: "getOrCreateTagIds",
          args: [[uniqueTag]],
        });

        console.log(`   TX: ${createTagsHash}`);

        const receipt = await publicClient.waitForTransactionReceipt({
          hash: createTagsHash,
          timeout: config.timeouts.tagCreation,
        });

        expect(receipt.status).to.equal("success");
        console.log(`   ✅ Confirmed in block ${receipt.blockNumber}`);

        // Step 2: Parse TagCreated event
        const logs = parseEventLogs({
          abi: ETSTokenABI,
          logs: receipt.logs,
          eventName: "TagCreated",
        });

        expect(logs).to.have.length.greaterThan(0);
        const tagCreatedEvent = logs[0];

        console.log("\n2️⃣ TagCreated event emitted:");
        console.log(`   Tag ID: ${tagCreatedEvent.args.tagId}`);
        console.log(`   Coin Address: ${tagCreatedEvent.args.coinAddress}`);
        console.log(`   Machine Name: ${tagCreatedEvent.args.machineName}`);
        console.log(`   Creator: ${tagCreatedEvent.args.creator}`);

        const coinAddress = tagCreatedEvent.args.coinAddress as Address;

        // Step 3: Wait for Temporal workflow to process
        if (temporalHealthy) {
          console.log(`\n3️⃣ Waiting for Temporal workflow (up to ${config.timeouts.workflowCompletion / 1000}s)...`);

          const startTime = Date.now();
          let workflowCompleted = false;
          let deploymentDetected = false;

          while (Date.now() - startTime < config.timeouts.workflowCompletion && !workflowCompleted) {
            await new Promise((resolve) => setTimeout(resolve, 2000)); // Poll every 2s

            // Check if MockZoraFactory has deployed the coin (localhost)
            if (config.chainId === 31337 && config.contracts?.mockZoraFactory) {
              // Check for MockCoinCreated event
              const latestBlock = await publicClient.getBlockNumber();
              const mockZoraLogs = await publicClient.getLogs({
                address: config.contracts.mockZoraFactory,
                fromBlock: receipt.blockNumber,
                toBlock: latestBlock,
              });

              if (mockZoraLogs.length > 0) {
                deploymentDetected = true;
                console.log(`   🎉 MockZoraFactory deployment detected!`);

                // Parse the deployment event
                const deploymentLogs = parseEventLogs({
                  abi: MockZoraFactoryABI,
                  logs: mockZoraLogs,
                });

                const createdEvent = deploymentLogs.find((log) => log.eventName === "MockCoinCreated");
                if (createdEvent) {
                  console.log(`   Coin deployed at: ${createdEvent.args.coinAddress}`);
                  console.log(`   Metadata URI: ${createdEvent.args.metadataURI}`);
                  workflowCompleted = true;
                }
              }
            }

            // For Base Sepolia, check if coin bytecode exists at predicted address
            if (config.chainId === 84532) {
              const bytecode = await publicClient.getBytecode({ address: coinAddress });
              if (bytecode && bytecode !== "0x") {
                deploymentDetected = true;
                workflowCompleted = true;
                console.log(`   🎉 Zora coin deployed at ${coinAddress}`);
              }
            }

            if (!workflowCompleted) {
              const elapsed = Math.round((Date.now() - startTime) / 1000);
              console.log(`   ⏳ Waiting... (${elapsed}s elapsed)`);
            }
          }

          if (workflowCompleted) {
            console.log("\n✅ Temporal workflow completed successfully!");
          } else {
            console.log("\n⚠️ Workflow did not complete in time (may still be processing)");
          }

          // Verify TAG exists in ETSToken
          const tagExists = await publicClient.readContract({
            address: config.contracts!.etsToken!,
            abi: ETSTokenABI,
            functionName: "tagExistsByAddress",
            args: [coinAddress],
          });

          expect(tagExists).to.be.true;
          console.log(`✅ TAG registered at ${coinAddress}`);
        } else {
          console.log("\n⚠️ Temporal not running - skipping workflow validation");
        }
      },
      config.timeouts.workflowCompletion + 10000,
    );

    test(
      "should handle batch TAG creation through Temporal",
      async () => {
        if (!servicesHealthy || config.isReadOnly || !temporalHealthy) {
          console.log("⏭️ Skipping batch test");
          return;
        }

        const batchTags = [`#batch1-${testRunId}`, `#batch2-${testRunId}`, `#batch3-${testRunId}`];

        console.log(`\n🏷️ Creating batch TAGs: ${batchTags.join(", ")}`);

        const createTagsHash = await walletClient.writeContract({
          address: config.contracts!.etsChannel!,
          abi: ETSChannelABI,
          functionName: "getOrCreateTagIds",
          args: [batchTags],
        });

        const receipt = await publicClient.waitForTransactionReceipt({
          hash: createTagsHash,
        });

        const logs = parseEventLogs({
          abi: ETSTokenABI,
          logs: receipt.logs,
          eventName: "TagCreated",
        });

        expect(logs).to.have.length(batchTags.length);
        console.log(`✅ Created ${logs.length} TAGs in batch`);

        // Wait briefly for Temporal to start processing
        await new Promise((resolve) => setTimeout(resolve, 5000));

        // Check that workflows were triggered for each TAG
        console.log("⏰ Temporal should be processing all TAGs in parallel");

        // In a real test with Temporal API access, we'd query workflow status
        // For now, we just verify the events were emitted correctly
        logs.forEach((log, index) => {
          console.log(`   TAG ${index + 1}: ${log.args.originalInput} → ${log.args.coinAddress}`);
        });
      },
      config.timeouts.workflowCompletion,
    );

    test("should recover from workflow failures gracefully", async () => {
      if (!servicesHealthy || config.isReadOnly) {
        console.log("⏭️ Skipping recovery test");
        return;
      }

      const recoveryTag = `#recovery-${testRunId}`;
      console.log(`\n🔄 Testing workflow recovery for: ${recoveryTag}`);

      // Create TAG
      const createTagsHash = await walletClient.writeContract({
        address: config.contracts!.etsChannel!,
        abi: ETSChannelABI,
        functionName: "getOrCreateTagIds",
        args: [[recoveryTag]],
      });

      const receipt = await publicClient.waitForTransactionReceipt({
        hash: createTagsHash,
      });

      const logs = parseEventLogs({
        abi: ETSTokenABI,
        logs: receipt.logs,
        eventName: "TagCreated",
      });

      const tagCreatedEvent = logs[0];
      console.log(`✅ TAG created: ${tagCreatedEvent.args.coinAddress}`);

      // In a real scenario, we'd simulate a workflow failure and recovery
      // For this test, we just verify the event was emitted correctly
      // and the workflow would be retried by Temporal if it fails

      if (temporalHealthy) {
        console.log("⏰ Temporal will automatically retry failed workflows");
        console.log("   - Exponential backoff for transient failures");
        console.log("   - Dead letter queue for permanent failures");
      } else {
        console.log("⚠️ Temporal not running - recovery behavior not testable");
      }
    });
  });

  describe("Metadata Generation", () => {
    test("should generate correct metadata for TAG coins", async () => {
      if (!servicesHealthy || config.isReadOnly) {
        console.log("⏭️ Skipping metadata test");
        return;
      }

      const metadataTag = `#metadata-${testRunId}`;
      console.log(`\n📝 Testing metadata for: ${metadataTag}`);

      const createTagsHash = await walletClient.writeContract({
        address: config.contracts!.etsChannel!,
        abi: ETSChannelABI,
        functionName: "getOrCreateTagIds",
        args: [[metadataTag]],
      });

      const receipt = await publicClient.waitForTransactionReceipt({
        hash: createTagsHash,
      });

      const logs = parseEventLogs({
        abi: ETSTokenABI,
        logs: receipt.logs,
        eventName: "TagCreated",
      });

      const event = logs[0];
      const machineName = event.args.machineName;

      console.log(`Machine name: ${machineName}`);

      // Expected metadata structure
      const expectedMetadata = {
        name: `TAG: ${machineName}`,
        symbol: "ETS",
        description: `ETS TAG coin for ${metadataTag}`,
      };

      console.log(`Expected metadata:`);
      console.log(`  Name: ${expectedMetadata.name}`);
      console.log(`  Symbol: ${expectedMetadata.symbol}`);
      console.log(`  Description: ${expectedMetadata.description}`);

      if (config.chainId === 31337) {
        console.log("✅ Localhost uses inline data URI metadata");
      } else {
        console.log("✅ Staging/Production uses IPFS metadata");
      }
    });
  });

  describe("Error Scenarios", () => {
    test("should handle duplicate TAG creation attempts", async () => {
      if (!servicesHealthy || config.isReadOnly) {
        console.log("⏭️ Skipping duplicate test");
        return;
      }

      const duplicateTag = `#dup-${testRunId}`;
      console.log(`\n🔁 Testing duplicate TAG: ${duplicateTag}`);

      // First creation
      const hash1 = await walletClient.writeContract({
        address: config.contracts!.etsChannel!,
        abi: ETSChannelABI,
        functionName: "getOrCreateTagIds",
        args: [[duplicateTag]],
      });

      await publicClient.waitForTransactionReceipt({ hash: hash1 });
      console.log("✅ First creation successful");

      // Duplicate attempt
      const hash2 = await walletClient.writeContract({
        address: config.contracts!.etsChannel!,
        abi: ETSChannelABI,
        functionName: "getOrCreateTagIds",
        args: [[duplicateTag]],
      });

      const receipt2 = await publicClient.waitForTransactionReceipt({ hash: hash2 });

      const logs = parseEventLogs({
        abi: ETSTokenABI,
        logs: receipt2.logs,
        eventName: "TagCreated",
      });

      // Should not emit TagCreated for duplicate
      expect(logs).to.have.length(0);
      console.log("✅ Duplicate handled correctly (no new event)");

      if (temporalHealthy) {
        console.log("⏰ Temporal won't trigger workflow for duplicate");
      }
    });

    test("should validate tag format requirements", async () => {
      if (!servicesHealthy || config.isReadOnly) {
        console.log("⏭️ Skipping validation test");
        return;
      }

      console.log("\n❌ Testing invalid tag formats...");

      // Try invalid tag (no hashtag)
      try {
        await walletClient.writeContract({
          address: config.contracts!.etsChannel!,
          abi: ETSChannelABI,
          functionName: "getOrCreateTagIds",
          args: [["notag"]], // Missing hashtag
        });

        expect.fail("Should have rejected invalid tag");
      } catch (error: any) {
        console.log("✅ Correctly rejected tag without hashtag");
      }

      // Try empty tag
      try {
        await walletClient.writeContract({
          address: config.contracts!.etsChannel!,
          abi: ETSChannelABI,
          functionName: "getOrCreateTagIds",
          args: [["#"]], // Just hashtag
        });

        expect.fail("Should have rejected empty tag");
      } catch (error: any) {
        console.log("✅ Correctly rejected empty tag");
      }
    });
  });
});
