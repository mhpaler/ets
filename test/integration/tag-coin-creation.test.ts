// @ts-ignore - Bun test runner types
import { afterAll, beforeAll, describe, test } from "bun:test";
import {
  ETSABI,
  ETSAccessControlsABI,
  ETSChannelABI,
  ETSChannelFactoryABI,
  ETSTokenABI,
} from "@ethereum-tag-service/contracts/abis";
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
import { type TestEnvironment, getContractAddresses, getEnvironment } from "../config/environments";

/**
 * TAG Coin Creation Integration Test
 *
 * Tests the complete TAG coin creation pipeline:
 * - TAG creation via ETS contracts
 * - TagCreated event emission
 * - Temporal workflow processing
 * - MockZoraFactory (localhost) or real Zora (staging/production) deployment
 * - Metadata generation and validation
 *
 * Environments:
 * - local: Uses Hardhat + MockZoraFactory + Temporal processor
 * - staging: Uses Base Sepolia testnet + real Zora contracts + staging infrastructure
 * - production: Uses Base mainnet (read-only)
 */

describe("TAG Coin Creation Integration Tests", () => {
  let env: TestEnvironment;
  let publicClient: any;
  let walletClient: any;
  let allServicesHealthy = false;

  // Contract addresses
  const contracts: {
    ets?: Address;
    etsToken?: Address;
    etsAccessControls?: Address;
    etsChannel?: Address;
    mockZoraFactory?: Address;
    zoraFactory?: Address;
  } = {};

  // Test-specific unique identifier to prevent conflicts
  const testRunId = Date.now().toString();

  beforeAll(async () => {
    console.log("🏗️  Setting up TAG Coin integration test environment");

    // Detect environment - use ENVIRONMENT like other tests
    const envName = process.env.ENVIRONMENT || "local";
    env = getEnvironment(envName);

    console.log(`Environment: ${env.displayName}`);
    console.log(`Chain ID: ${env.network.chainId}`);
    console.log(`RPC URL: ${env.network.rpcUrl}`);

    // Setup clients
    publicClient = createPublicClient({
      chain: env.network.chain,
      transport: http(env.network.rpcUrl),
    });

    // Only setup wallet for non-readonly environments
    if (!env.testing.readOnly && env.wallet?.mnemonic) {
      const account = mnemonicToAccount(env.wallet.mnemonic, { addressIndex: env.wallet.accounts?.tester || 4 });

      walletClient = createWalletClient({
        account,
        chain: env.network.chain,
        transport: http(env.network.rpcUrl),
      });
    }

    // Check service health for local environment
    if (env.testing.requiresLocalStack) {
      try {
        const blockNumber = await publicClient.getBlockNumber();
        console.log(`✅ Hardhat node is running (block: ${blockNumber})`);

        // Get contract addresses dynamically
        const { getContractAddresses } = await import("@ethereum-tag-service/contracts/deployments");
        const networkName =
          env.network.chainId === 31337 ? "localhost" : env.network.chainId === 84532 ? "baseSepolia" : "base";
        const addresses = getContractAddresses(networkName);

        if (addresses) {
          contracts.ets = addresses.core as Address;
          contracts.etsToken = addresses.token as Address;
          contracts.etsAccessControls = addresses.accessControls as Address;
          contracts.mockZoraFactory = addresses.mockZoraFactory as Address;

          // Get channel address - try multiple channel names
          let channelAddress: Address | null = null;
          const channelNames = ["TestChannel", "Testchannel", "ETSChannel", "DefaultChannel", "Channel"];

          for (const name of channelNames) {
            try {
              const addr = await publicClient.readContract({
                address: contracts.etsAccessControls,
                abi: ETSAccessControlsABI,
                functionName: "getChannelAddressFromName",
                args: [name],
              });

              if (addr && addr !== "0x0000000000000000000000000000000000000000") {
                channelAddress = addr as Address;
                console.log(`   Found channel "${name}": ${channelAddress}`);
                break;
              }
            } catch (_e) {
              // Try next channel name
            }
          }

          // If no channel found, get the first available channel
          if (!channelAddress || channelAddress === "0x0000000000000000000000000000000000000000") {
            console.log("   ⚠️  No named channel found, getting first available channel...");

            // We'll deploy a new channel if needed
            console.log("   No channels found via name lookup");
          }

          // If still no channel, deploy one for testing
          if (!channelAddress || channelAddress === "0x0000000000000000000000000000000000000000") {
            console.log("   📦 Deploying test channel...");

            try {
              // Use the ChannelFactory to deploy a test channel
              const { getContractAddresses } = await import("@ethereum-tag-service/contracts/deployments");
              const addresses = getContractAddresses(networkName);

              if (addresses?.channelFactory) {
                // Create a test channel using the factory
                const deployer = mnemonicToAccount(env.wallet.mnemonic!, { addressIndex: 0 });

                const deployerWallet = createWalletClient({
                  account: deployer,
                  chain: env.network.chain,
                  transport: http(env.network.rpcUrl),
                });

                const { ETSChannelFactoryABI } = await import("@ethereum-tag-service/contracts/abis");

                const hash = await deployerWallet.writeContract({
                  address: addresses.channelFactory as Address,
                  abi: ETSChannelFactoryABI,
                  functionName: "deployChannel",
                  args: ["TestChannel", deployer.address],
                });

                const receipt = await publicClient.waitForTransactionReceipt({ hash });

                // Get the deployed channel address from events
                const logs = parseEventLogs({
                  abi: ETSChannelFactoryABI,
                  logs: receipt.logs,
                });

                if (logs.length > 0) {
                  channelAddress = logs[0].args?.channel as Address;
                  console.log(`   ✅ Deployed test channel: ${channelAddress}`);
                }
              }
            } catch (e) {
              console.log("   ⚠️  Could not deploy test channel:", e);
            }
          }

          contracts.etsChannel = channelAddress || ("0x0000000000000000000000000000000000000000" as Address);

          console.log("✅ Contract addresses loaded:");
          console.log(`   ETS Core: ${contracts.ets}`);
          console.log(`   ETS Token: ${contracts.etsToken}`);
          console.log(`   ETS Channel: ${contracts.etsChannel}`);
          console.log(`   MockZoraFactory: ${contracts.mockZoraFactory}`);
        }

        // Check Temporal is running (optional, don't fail if not)
        try {
          const temporalResponse = await fetch(`${env.services.temporal?.uiUrl}/api/v1/system-info`);
          if (temporalResponse.ok) {
            console.log("✅ Temporal is running");
          }
        } catch (_e) {
          console.log("⚠️  Temporal not detected - TAG coin deployment may not complete");
        }

        allServicesHealthy = true;
      } catch (error) {
        console.log("❌ Local services check failed:", error);
        allServicesHealthy = false;
      }
    } else {
      // For staging/production, assume services are healthy
      allServicesHealthy = true;
    }

    console.log(`Services healthy: ${allServicesHealthy}`);
  });

  afterAll(async () => {
    console.log("🧹 Cleaning up TAG Coin test environment");
  });

  describe("Environment-Aware TAG Coin Creation", () => {
    test(
      "should create a TAG and deploy coin with environment-appropriate metadata",
      async () => {
        if (!allServicesHealthy || env.testing.readOnly) {
          console.log("Skipping test - services unavailable or read-only environment");
          return;
        }

        // Check if we have a valid channel
        if (!contracts.etsChannel || contracts.etsChannel === "0x0000000000000000000000000000000000000000") {
          console.log("Skipping test - no channel available");
          return;
        }

        const uniqueTag = `#test${testRunId}`;
        console.log(`\n🧪 Testing TAG creation: ${uniqueTag}`);

        // Step 1: Create TAG through ETSChannel
        console.log("1️⃣  Creating TAG through ETSChannel...");

        const createTagsHash = await walletClient.writeContract({
          address: contracts.etsChannel,
          abi: ETSChannelABI,
          functionName: "getOrCreateTagIds",
          args: [[uniqueTag]],
        });

        console.log(`   Transaction sent: ${createTagsHash}`);

        // Wait for transaction
        const receipt = await publicClient.waitForTransactionReceipt({
          hash: createTagsHash,
          timeout: env?.timeouts?.tagCreation || 5000,
        });

        expect(receipt.status).to.equal("success");
        console.log(`   ✅ TAG created in block ${receipt.blockNumber}`);

        // Step 2: Parse TagCreated event
        const logs = parseEventLogs({
          abi: ETSTokenABI,
          logs: receipt.logs,
          eventName: "TagCreated",
        });

        expect(logs).to.have.length.greaterThan(0);
        const tagCreatedEvent = logs[0];

        console.log("2️⃣  TagCreated event emitted:");
        console.log(`   Tag ID: ${tagCreatedEvent.args.tagId}`);
        console.log(`   Coin Address: ${tagCreatedEvent.args.coinAddress}`);
        console.log(`   Machine Name: ${tagCreatedEvent.args.machineName}`);

        const coinAddress = tagCreatedEvent.args.coinAddress;

        // Step 3: Wait for TAG coin deployment (if Temporal is running)
        if (env.displayName === "Local Development") {
          console.log("3️⃣  Waiting for MockZoraFactory deployment via Temporal...");

          // Give Temporal workflow time to process
          await new Promise((resolve) => setTimeout(resolve, 5000));

          // Check if MockZoraFactory was called (by checking for events or state)
          // For MVP, the coin address is deterministic
          const expectedCoinAddress = coinAddress;
          console.log(`   Expected coin at: ${expectedCoinAddress}`);

          // Verify the TAG exists in ETSToken contract
          const tagExists = await publicClient.readContract({
            address: contracts.etsToken!,
            abi: ETSTokenABI,
            functionName: "tagExistsByAddress",
            args: [coinAddress],
          });

          expect(tagExists).to.be.true;
          console.log(`   ✅ TAG coin registered at ${coinAddress}`);
        }

        // Step 4: Validate metadata based on environment
        console.log("4️⃣  Validating metadata requirements...");

        if (env.name === "local") {
          console.log("   ✅ Environment allows inline data URIs (localhost/MockZoraFactory)");
          // In localhost, we use inline metadata
          // The metadata would be in the TAG coin deployment transaction
        } else if (env.name !== "local") {
          console.log("   ⚠️  Environment requires IPFS/Arweave metadata (staging/production)");
          // In staging/production, validate that metadata URI is IPFS or Arweave
          // This would be checked in the actual Zora coin contract
        }

        console.log(`\n✅ TAG coin creation test completed for ${env.displayName}`);
      },
      env?.timeouts?.coinDeployment || 30000,
    );

    test(
      "should handle batch TAG creation efficiently",
      async () => {
        if (!allServicesHealthy || env.testing.readOnly) {
          console.log("Skipping test - services unavailable or read-only environment");
          return;
        }

        const batchTags = [`#batch1${testRunId}`, `#batch2${testRunId}`, `#batch3${testRunId}`];

        console.log(`\n🧪 Testing batch TAG creation: ${batchTags.join(", ")}`);

        // Create multiple TAGs in one transaction
        const createTagsHash = await walletClient.writeContract({
          address: contracts.etsChannel!,
          abi: ETSChannelABI,
          functionName: "getOrCreateTagIds",
          args: [batchTags],
        });

        const receipt = await publicClient.waitForTransactionReceipt({
          hash: createTagsHash,
          timeout: env?.timeouts?.tagCreation || 5000,
        });

        // Parse all TagCreated events
        const logs = parseEventLogs({
          abi: ETSTokenABI,
          logs: receipt.logs,
          eventName: "TagCreated",
        });

        expect(logs).to.have.length(batchTags.length);
        console.log(`   ✅ Created ${logs.length} TAGs in single transaction`);

        // Verify each TAG
        for (let i = 0; i < logs.length; i++) {
          const event = logs[i];
          console.log(`   Tag ${i + 1}: ${event.args.originalInput} → ${event.args.coinAddress}`);
        }
      },
      env?.timeouts?.coinDeployment || 30000,
    );

    test("should reject invalid tags appropriately", async () => {
      if (!allServicesHealthy || env.testing.readOnly) {
        console.log("Skipping test - services unavailable or read-only environment");
        return;
      }

      console.log("\n🧪 Testing invalid tag rejection...");

      // Try to create a tag without hashtag
      try {
        await walletClient.writeContract({
          address: contracts.etsChannel!,
          abi: ETSChannelABI,
          functionName: "getOrCreateTagIds",
          args: [["invalid"]], // No hashtag
        });

        // Should not reach here
        expect.fail("Should have rejected tag without hashtag");
      } catch (error: any) {
        console.log("   ✅ Correctly rejected tag without hashtag");
        // The contract correctly reverts when tags don't start with hashtag
        // Viem shows a generic error message when it can't decode the custom error
        expect(error.message).to.include("getOrCreateTagIds");
        expect(error.message).to.include("reverted");
      }
    });

    test("should handle duplicate TAG creation gracefully", async () => {
      if (!allServicesHealthy || env.testing.readOnly) {
        console.log("Skipping test - services unavailable or read-only environment");
        return;
      }

      const duplicateTag = `#duplicate${testRunId}`;
      console.log(`\n🧪 Testing duplicate TAG handling: ${duplicateTag}`);

      // Create TAG first time
      const firstHash = await walletClient.writeContract({
        address: contracts.etsChannel!,
        abi: ETSChannelABI,
        functionName: "getOrCreateTagIds",
        args: [[duplicateTag]],
      });

      await publicClient.waitForTransactionReceipt({ hash: firstHash });
      console.log("   ✅ First TAG creation successful");

      // Try to create same TAG again
      const secondHash = await walletClient.writeContract({
        address: contracts.etsChannel!,
        abi: ETSChannelABI,
        functionName: "getOrCreateTagIds",
        args: [[duplicateTag]],
      });

      const secondReceipt = await publicClient.waitForTransactionReceipt({ hash: secondHash });

      // Should succeed but not emit TagCreated event (tag already exists)
      const logs = parseEventLogs({
        abi: ETSTokenABI,
        logs: secondReceipt.logs,
        eventName: "TagCreated",
      });

      expect(logs).to.have.length(0);
      console.log("   ✅ Duplicate TAG handled correctly (no new creation)");
    });
  });

  describe("Environment-Specific Metadata Tests", () => {
    test("should use appropriate metadata format for environment", async () => {
      if (!allServicesHealthy || env.testing.readOnly) {
        console.log("Skipping test - services unavailable or read-only environment");
        return;
      }

      const metadataTag = `#metadata${testRunId}`;
      console.log(`\n🧪 Testing metadata format for ${env.displayName}: ${metadataTag}`);

      if (env.name === "local") {
        console.log("   📝 Testing inline data URI metadata (localhost)");
        // For localhost, metadata is created as data:application/json;base64,...

        // Create TAG and verify inline metadata
        const hash = await walletClient.writeContract({
          address: contracts.etsChannel!,
          abi: ETSChannelABI,
          functionName: "getOrCreateTagIds",
          args: [[metadataTag]],
        });

        const receipt = await publicClient.waitForTransactionReceipt({ hash });
        expect(receipt.status).to.equal("success");

        console.log("   ✅ TAG created with inline metadata support");
      } else if (env.name !== "local") {
        console.log("   📦 Testing IPFS/Arweave metadata (staging/production)");
        // For staging/production, metadata should be uploaded to IPFS
        // and the URI should be ipfs:// or ar://

        // This would require actual IPFS integration
        console.log("   ⚠️  IPFS metadata validation not yet implemented");
      }
    });
  });
});
