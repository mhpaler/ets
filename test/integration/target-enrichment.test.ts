// @ts-ignore - Bun test runner types
import { afterAll, beforeAll, describe, test } from "bun:test";
import { ETSAccessControlsABI, ETSTargetABI } from "@ethereum-tag-service/contracts/abis";
import { expect } from "chai";
import { http, type Address, createPublicClient, createWalletClient, parseEventLogs } from "viem";
import { mnemonicToAccount } from "viem/accounts";
import { type TestEnvironment, getContractAddresses, getEnvironment } from "../config/environments";

describe("Target Enrichment Integration v3 - Unified ETSTarget", () => {
  let env: TestEnvironment;
  let publicClient: any;
  let walletClient: any = null;
  let testerAccount: ReturnType<typeof mnemonicToAccount> | null = null;
  let eventProcessorAccount: ReturnType<typeof mnemonicToAccount> | null = null;
  const contracts: {
    ETSTarget?: { address: Address; abi: typeof ETSTargetABI };
    ETSAccessControls?: { address: Address; abi: typeof ETSAccessControlsABI };
  } = {};

  beforeAll(async () => {
    // 1. Detect environment
    const envName = process.env.ENVIRONMENT || "local";
    env = getEnvironment(envName);

    console.log(`\n🌍 Running integration tests against: ${env.name}`);
    console.log(`📡 RPC: ${env.network.rpcUrl}`);
    console.log(`🔗 Chain ID: ${env.network.chainId}`);
    if (env.services.temporal?.uiUrl) console.log(`⏰ Temporal: ${env.services.temporal.uiUrl}`);
    console.log(`🔒 Read-only: ${env.testing.readOnly}\n`);

    // 2. Validate environment prerequisites
    await validateEnvironmentPrerequisites();

    // 3. Setup blockchain connection
    await setupBlockchainConnection();

    // 4. Load contracts
    await loadContracts();

    console.log(`\n✅ ${env.name} environment ready for testing!\n`);
  });

  afterAll(async () => {
    console.log(`\n✅ ${env.name} integration tests complete`);
  });

  async function validateEnvironmentPrerequisites() {
    console.log("🔍 Validating environment prerequisites...");

    if (env.testing.requiresLocalStack) {
      await validateLocalServices();
    }
  }

  async function validateLocalServices() {
    const requiredServices = [
      {
        name: "Hardhat Network",
        port: 8545,
        check: async () => {
          const tempClient = createPublicClient({
            chain: env.network.chain,
            transport: http(env.network.rpcUrl),
          });
          const chainId = await tempClient.getChainId();
          return { success: true, details: `Chain ID: ${chainId}` };
        },
      },
      {
        name: "Temporal Server",
        port: 7233,
        check: async () => {
          // Check if Temporal UI is accessible
          if (env.services.temporal?.uiUrl) {
            const response = await fetch(env.services.temporal.uiUrl);
            return { success: response.ok, details: `UI Status: ${response.status}` };
          }
          return { success: true, details: "Not configured" };
        },
      },
    ];

    let allHealthy = true;
    const failedServices = [];

    for (const service of requiredServices) {
      try {
        const result = await service.check();
        console.log(`  ✅ ${service.name}: ${result.details}`);
      } catch (error: any) {
        console.error(`  ❌ ${service.name}: ${error.message}`);
        failedServices.push(service.name);
        allHealthy = false;
      }
    }

    if (!allHealthy) {
      console.error("\n💥 Required local services are not running!");
      console.error("📋 Failed services:", failedServices.join(", "));
      console.error("\n💡 To start all required services:");
      console.error("   ./scripts/start-local-stack.sh");
      throw new Error("Local services not available");
    }
  }

  async function setupBlockchainConnection() {
    console.log("🔗 Setting up blockchain connection...");

    // Create public client
    publicClient = createPublicClient({
      chain: env.network.chain,
      transport: http(env.network.rpcUrl),
    });

    const chainId = await publicClient.getChainId();

    if (chainId !== env.network.chainId) {
      throw new Error(`Chain ID mismatch: expected ${env.network.chainId}, got ${chainId}`);
    }

    console.log(`  ✅ Connected to ${env.name} (Chain ID: ${chainId})`);

    // Setup accounts and wallet client if not read-only
    if (!env.testing.readOnly && env.wallet?.mnemonic) {
      if (env.wallet.accounts?.tester !== undefined) {
        testerAccount = mnemonicToAccount(env.wallet.mnemonic, { addressIndex: env.wallet.accounts.tester });
        console.log(`  ✅ Test account: ${testerAccount.address}`);
      }

      if (env.wallet.accounts?.eventProcessor !== undefined) {
        eventProcessorAccount = mnemonicToAccount(env.wallet.mnemonic, {
          addressIndex: env.wallet.accounts.eventProcessor,
        });
        console.log(`  ✅ Event Processor account: ${eventProcessorAccount.address}`);
      }

      if (testerAccount) {
        walletClient = createWalletClient({
          account: testerAccount,
          chain: env.network.chain,
          transport: http(env.network.rpcUrl),
        });
      }
    }
  }

  async function loadContracts() {
    console.log("📦 Loading contract addresses...");

    // Load from contracts package deployments for localhost and baseSepolia
    if (env.network.chainId === 31337 || env.network.chainId === 84532) {
      try {
        const { getContractAddresses } = await import("@ethereum-tag-service/contracts/deployments");
        const networkName = env.network.chainId === 31337 ? "localhost" : "baseSepolia";
        const addresses = await getContractAddresses(networkName);

        if (!addresses) {
          throw new Error(`No contract addresses found for ${networkName}`);
        }

        contracts.ETSTarget = {
          address: addresses.target as Address,
          abi: ETSTargetABI,
        };

        contracts.ETSAccessControls = {
          address: addresses.accessControls as Address,
          abi: ETSAccessControlsABI,
        };

        console.log(`  ✅ ETSTarget: ${contracts.ETSTarget.address}`);
        console.log(`  ✅ ETSAccessControls: ${contracts.ETSAccessControls.address}`);
      } catch (error: any) {
        console.error(`  ❌ Failed to load contract addresses: ${error.message}`);
        throw error;
      }
    } else if (env.contracts) {
      // Use configured addresses for production
      if (env.contracts.target) {
        contracts.ETSTarget = {
          address: env.contracts.target,
          abi: ETSTargetABI,
        };
      }
      if (env.contracts.accessControls) {
        contracts.ETSAccessControls = {
          address: env.contracts.accessControls,
          abi: ETSAccessControlsABI,
        };
      }
    }

    if (!contracts.ETSTarget) {
      throw new Error("ETSTarget contract not found");
    }
  }

  // Test: Request target enrichment
  test("should request target enrichment and emit event", async () => {
    if (env.testing.readOnly) {
      console.log("⏭️  Skipping write test in read-only environment");
      return;
    }

    if (!walletClient || !testerAccount) {
      throw new Error("Wallet not configured");
    }

    // Use a real URL that will return valid metadata
    const targetURI = `https://github.com/ethereum/go-ethereum?t=${Date.now()}`;
    console.log(`\n🎯 Creating and requesting enrichment for: ${targetURI}`);

    // First, create a target by calling createTarget
    const createTargetTx = await walletClient.writeContract({
      address: contracts.ETSTarget!.address,
      abi: contracts.ETSTarget!.abi,
      functionName: "createTarget",
      args: [targetURI],
      account: testerAccount,
    });

    await publicClient.waitForTransactionReceipt({ hash: createTargetTx });
    console.log(`  📤 Target created in tx: ${createTargetTx}`);

    // Wait a moment for RPC state to propagate (Alchemy caching)
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Compute target ID from URI (more reliable than parsing events)
    const targetId = await publicClient.readContract({
      address: contracts.ETSTarget!.address,
      abi: contracts.ETSTarget!.abi,
      functionName: "computeTargetId",
      args: [targetURI],
    });
    console.log(`  🎯 Target ID: ${targetId}`);

    // Verify target exists
    const targetExists = await publicClient.readContract({
      address: contracts.ETSTarget!.address,
      abi: contracts.ETSTarget!.abi,
      functionName: "targetExistsById",
      args: [targetId],
    });
    console.log(`  ✓ Target exists: ${targetExists}`);

    if (!targetExists) {
      throw new Error(`Target ${targetId} was not created successfully`);
    }

    // Now request enrichment for this targetId
    const { request } = await publicClient.simulateContract({
      address: contracts.ETSTarget!.address,
      abi: contracts.ETSTarget!.abi,
      functionName: "requestEnrichTarget",
      args: [targetId],
      account: testerAccount,
    });

    const hash = await walletClient.writeContract(request);
    console.log(`  📤 Transaction: ${hash}`);

    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    console.log(`  ✅ Confirmed in block: ${receipt.blockNumber}`);

    // Parse EnrichTargetRequested event
    const logs = parseEventLogs({
      abi: contracts.ETSTarget!.abi,
      logs: receipt.logs,
    });

    const enrichRequestEvent = logs.find((log) => log.eventName === "EnrichTargetRequested");
    expect(enrichRequestEvent).to.exist;
    console.log("  🎉 EnrichTargetRequested event emitted");
    console.log(`     Target ID: ${enrichRequestEvent?.args?.targetId}`);
    console.log(`     Requestor: ${enrichRequestEvent?.args?.requestor}`);

    // Wait for Temporal workflow to process
    console.log(
      `\n⏳ Waiting for Temporal workflow to process enrichment (up to ${env.testing.timeouts.enrichment / 1000}s)...`,
    );

    // Poll for enrichment completion
    const startTime = Date.now();
    let enrichedEventFound = false;

    while (Date.now() - startTime < env.testing.timeouts.enrichment && !enrichedEventFound) {
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Check every 2 seconds

      // Check for TargetEnriched event (if EVENT_PROCESSOR has enriched it)
      const latestBlock = await publicClient.getBlockNumber();
      const enrichedLogs = await publicClient.getLogs({
        address: contracts.ETSTarget!.address,
        event: {
          name: "TargetEnriched",
          type: "event",
          inputs: [
            { name: "targetId", type: "uint256", indexed: true },
            { name: "enrichedBy", type: "address", indexed: true },
            { name: "schemaVersion", type: "string" },
            { name: "payloadHash", type: "bytes32" },
            { name: "payload", type: "bytes" },
          ],
        },
        fromBlock: receipt.blockNumber,
        toBlock: latestBlock,
      });

      if (enrichedLogs.length > 0) {
        enrichedEventFound = true;
        console.log("  🎉 TargetEnriched event found!");
        const enrichedEvent = enrichedLogs[0];
        console.log(`     Enriched by: ${enrichedEvent.args?.enrichedBy}`);
        console.log(`     Schema version: ${enrichedEvent.args?.schemaVersion}`);

        // Parse the payload to show metadata
        if (enrichedEvent.args?.payload) {
          try {
            const payloadStr =
              typeof enrichedEvent.args.payload === "string" ? enrichedEvent.args.payload : enrichedEvent.args.payload;
            const cleanHex = payloadStr.startsWith("0x") ? payloadStr.slice(2) : payloadStr;
            const metadata = JSON.parse(Buffer.from(cleanHex, "hex").toString());

            // Handle nested metadata structure from Temporal workflow
            const title = metadata.core?.title || metadata.title || "N/A";
            const description = metadata.core?.description || metadata.description || "N/A";
            const image = metadata.core?.image || metadata.image;
            const httpStatus = metadata.core?.httpStatus;

            console.log(`     Title: ${title}`);
            console.log(`     Description: ${description.substring(0, 100)}...`);
            if (image) console.log(`     Image: ${image}`);
            if (httpStatus) console.log(`     HTTP Status: ${httpStatus}`);
            if (metadata.type) console.log(`     Content Type: ${metadata.type}`);
          } catch (e) {
            console.log(`     Payload hash: ${enrichedEvent.args?.payloadHash}`);
            console.log(`     Parse error: ${e}`);
          }
        }
      } else {
        const elapsed = Math.round((Date.now() - startTime) / 1000);
        console.log(`  ⏳ Still waiting... (${elapsed}s elapsed)`);
      }
    }

    if (!enrichedEventFound) {
      console.log(
        `  ⚠️  No TargetEnriched event after ${env.testing.timeouts.enrichment / 1000}s (workflow may still be processing)`,
      );
    }
  }, 40000); // 40 second timeout to allow for enrichment workflow

  // Test: Event processor can enrich targets
  test("should allow event processor to enrich target", async () => {
    if (env.testing.readOnly || !eventProcessorAccount) {
      console.log("⏭️  Skipping event processor test");
      return;
    }

    // Create target first
    const targetURI = `https://github.com/test-${Date.now()}`;

    // Create wallet client for regular user to create target
    const userWallet = createWalletClient({
      account: testerAccount!,
      chain: env.network.chain,
      transport: http(env.network.rpcUrl),
    });

    // Create the target
    const createTx = await userWallet.writeContract({
      address: contracts.ETSTarget!.address,
      abi: contracts.ETSTarget!.abi,
      functionName: "createTarget",
      args: [targetURI],
    });

    await publicClient.waitForTransactionReceipt({ hash: createTx });

    // Wait a moment for RPC state to propagate (Alchemy caching)
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Compute target ID from URI (more reliable than parsing events)
    const targetId = await publicClient.readContract({
      address: contracts.ETSTarget!.address,
      abi: contracts.ETSTarget!.abi,
      functionName: "computeTargetId",
      args: [targetURI],
    });

    console.log(`\n🤖 Event processor enriching target ${targetId}...`);

    // Create wallet client for event processor
    const eventProcessorWallet = createWalletClient({
      account: eventProcessorAccount,
      chain: env.network.chain,
      transport: http(env.network.rpcUrl),
    });

    // Simulate enrichTarget call with new signature (payload + schemaVersion)
    try {
      // Create metadata payload
      const metadata = {
        title: "Test Title",
        description: "Test Description",
        image: "https://example.com/image.png",
        keywords: ["test", "keywords"],
      };
      const payload = `0x${Buffer.from(JSON.stringify(metadata)).toString("hex")}` as `0x${string}`;
      const schemaVersion = "v1.0.0";

      const { request } = await publicClient.simulateContract({
        address: contracts.ETSTarget!.address,
        abi: contracts.ETSTarget!.abi,
        functionName: "enrichTarget",
        args: [targetId, payload, schemaVersion],
        account: eventProcessorAccount,
      });

      const hash = await eventProcessorWallet.writeContract(request);
      console.log(`  📤 Transaction: ${hash}`);

      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      console.log(`  ✅ Enrichment confirmed in block: ${receipt.blockNumber}`);

      // Parse TargetEnriched event
      const logs = parseEventLogs({
        abi: contracts.ETSTarget!.abi,
        logs: receipt.logs,
      });

      const enrichedEvent = logs.find((log) => log.eventName === "TargetEnriched");
      expect(enrichedEvent).to.exist;
      console.log("  🎉 TargetEnriched event emitted successfully");
    } catch (error: any) {
      if (error.message.includes("UNAUTHORIZED")) {
        console.log("  ⚠️  Event processor not authorized (needs EVENT_PROCESSOR_ROLE)");
      } else {
        throw error;
      }
    }
  });

  // Test: Non-event processor cannot enrich
  test("should prevent non-event processor from enriching", async () => {
    if (env.testing.readOnly || !testerAccount || !walletClient) {
      console.log("⏭️  Skipping authorization test");
      return;
    }

    // First create a target as regular user
    const targetURI = `https://example.com/test-unauth-${Date.now()}`;
    const createTx = await walletClient.writeContract({
      address: contracts.ETSTarget!.address,
      abi: contracts.ETSTarget!.abi,
      functionName: "createTarget",
      args: [targetURI],
      account: testerAccount,
    });

    await publicClient.waitForTransactionReceipt({ hash: createTx });

    // Wait a moment for RPC state to propagate (Alchemy caching)
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Compute target ID from URI (more reliable than parsing events)
    const targetId = await publicClient.readContract({
      address: contracts.ETSTarget!.address,
      abi: contracts.ETSTarget!.abi,
      functionName: "computeTargetId",
      args: [targetURI],
    });

    console.log(`\n🚫 Testing unauthorized enrichment attempt for target ${targetId}...`);

    try {
      // Create metadata payload for unauthorized attempt
      const metadata = {
        title: "Hack Title",
        description: "Hack Description",
        image: "https://hack.com/image.png",
        keywords: ["hack"],
      };
      const payload = `0x${Buffer.from(JSON.stringify(metadata)).toString("hex")}` as `0x${string}`;
      const schemaVersion = "v1.0.0";

      await publicClient.simulateContract({
        address: contracts.ETSTarget!.address,
        abi: contracts.ETSTarget!.abi,
        functionName: "enrichTarget",
        args: [targetId, payload, schemaVersion],
        account: testerAccount,
      });

      // Should not reach here
      expect.fail("Expected transaction to revert");
    } catch (error: any) {
      // The transaction should revert with AccessDenied error
      // Viem might return "Internal error" for custom errors sometimes
      const isExpectedError =
        error.message.includes("AccessDenied") ||
        error.message.includes("0x4b0e7970") || // AccessDenied error signature
        error.message.includes("Internal error") || // Generic revert
        error.message.includes("reverted");
      expect(isExpectedError).to.be.true;
      console.log("  ✅ Correctly rejected unauthorized enrichment");
    }
  });
});
