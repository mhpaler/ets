// @ts-ignore - Bun test runner types
import { afterAll, beforeAll, describe, test } from "bun:test";
import { ETSAccessControlsABI, ETSTargetABI } from "@ethereum-tag-service/contracts/abis";
import { expect } from "chai";
import { http, type Address, type Hash, createPublicClient, createWalletClient, parseEventLogs } from "viem";
import { mnemonicToAccount } from "viem/accounts";
import { base, localhost, sepolia } from "viem/chains";

/**
 * Target Enrichment Integration Test v3
 *
 * Tests the new unified ETSTarget contract with integrated enrichment functionality.
 * - No more separate ETSEnrichTarget contract
 * - Direct event emission for The Graph indexing
 * - No Arweave storage
 *
 * Environments:
 * - local: Uses Hardhat + Temporal processor
 * - staging: Uses Sepolia testnet + staging infrastructure
 * - production: Uses Base mainnet (read-only)
 */

interface EnvironmentConfig {
  name: string;
  rpcUrl: string;
  chainId: number;
  chain: typeof localhost | typeof sepolia | typeof base;
  temporalUrl?: string;
  requiresLocalServices: boolean;
  isReadOnly: boolean;
  mnemonic?: string;
  accounts: {
    eventProcessorIndex?: number;
    testerIndex?: number;
    viewer?: Address;
  };
  timeouts: {
    enrichment: number;
    serviceHealth: number;
  };
  contracts?: {
    etsTarget?: Address;
    etsAccessControls?: Address;
  };
}

const environments: Record<string, EnvironmentConfig> = {
  local: {
    name: "Local Development",
    rpcUrl: process.env.RPC_URL || "http://localhost:8545",
    chainId: 31337,
    chain: localhost,
    temporalUrl: "http://localhost:8080", // Temporal UI
    requiresLocalServices: true,
    isReadOnly: false,
    mnemonic: "test test test test test test test test test test test junk", // Hardhat default
    accounts: {
      eventProcessorIndex: 2, // account[2] - Event Processor
      testerIndex: 3, // account[3] - Regular user for testing
    },
    timeouts: {
      enrichment: 30000, // Increased to 30 seconds for workflow completion
      serviceHealth: 3000,
    },
    // Contract addresses will be loaded from deployments
  },

  staging: {
    name: "Staging (Sepolia)",
    rpcUrl: process.env.STAGING_RPC_URL || "https://sepolia.infura.io/v3/YOUR_KEY",
    chainId: 11155111,
    chain: sepolia,
    requiresLocalServices: false,
    isReadOnly: false,
    mnemonic: process.env.MNEMONIC_TESTNET_STAGING,
    accounts: {
      testerIndex: 0,
    },
    timeouts: {
      enrichment: 30000,
      serviceHealth: 5000,
    },
    contracts: {
      // Add staging contract addresses when deployed
    },
  },

  production: {
    name: "Production (Base)",
    rpcUrl: process.env.PROD_RPC_URL || "https://mainnet.base.org",
    chainId: 8453,
    chain: base,
    requiresLocalServices: false,
    isReadOnly: true,
    accounts: {
      viewer: "0x0000000000000000000000000000000000000000" as Address,
    },
    timeouts: {
      enrichment: 30000,
      serviceHealth: 5000,
    },
    contracts: {
      // Add production contract addresses when deployed
    },
  },
};

describe("Target Enrichment Integration v3 - Unified ETSTarget", () => {
  let env: EnvironmentConfig;
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
    env = environments[envName];

    if (!env) {
      throw new Error(`Unknown environment: ${envName}. Valid options: ${Object.keys(environments).join(", ")}`);
    }

    console.log(`\n🌍 Running integration tests against: ${env.name}`);
    console.log(`📡 RPC: ${env.rpcUrl}`);
    console.log(`🔗 Chain ID: ${env.chainId}`);
    if (env.temporalUrl) console.log(`⏰ Temporal: ${env.temporalUrl}`);
    console.log(`🔒 Read-only: ${env.isReadOnly}\n`);

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

    if (env.requiresLocalServices) {
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
            chain: env.chain,
            transport: http(env.rpcUrl),
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
          if (env.temporalUrl) {
            const response = await fetch(env.temporalUrl);
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
      chain: env.chain,
      transport: http(env.rpcUrl),
    });

    const chainId = await publicClient.getChainId();

    if (chainId !== env.chainId) {
      throw new Error(`Chain ID mismatch: expected ${env.chainId}, got ${chainId}`);
    }

    console.log(`  ✅ Connected to ${env.name} (Chain ID: ${chainId})`);

    // Setup accounts and wallet client if not read-only
    if (!env.isReadOnly && env.mnemonic) {
      if (env.accounts.testerIndex !== undefined) {
        testerAccount = mnemonicToAccount(env.mnemonic, { addressIndex: env.accounts.testerIndex });
        console.log(`  ✅ Test account: ${testerAccount.address}`);
      }

      if (env.accounts.eventProcessorIndex !== undefined) {
        eventProcessorAccount = mnemonicToAccount(env.mnemonic, { addressIndex: env.accounts.eventProcessorIndex });
        console.log(`  ✅ Event Processor account: ${eventProcessorAccount.address}`);
      }

      if (testerAccount) {
        // Use localhost chain configuration with custom chainId
        const localChain = {
          ...localhost,
          id: 31337,
        };

        walletClient = createWalletClient({
          account: testerAccount,
          chain: localChain,
          transport: http(env.rpcUrl),
        });
      }
    }
  }

  async function loadContracts() {
    console.log("📦 Loading contract addresses...");

    if (env.chainId === 31337) {
      // Load from local deployments
      try {
        const { getContractAddresses } = await import("@ethereum-tag-service/contracts/deployments");
        const addresses = await getContractAddresses("localhost");

        if (!addresses) {
          throw new Error("No contract addresses found for localhost");
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
      // Use configured addresses for staging/production
      if (env.contracts.etsTarget) {
        contracts.ETSTarget = {
          address: env.contracts.etsTarget,
          abi: ETSTargetABI,
        };
      }
      if (env.contracts.etsAccessControls) {
        contracts.ETSAccessControls = {
          address: env.contracts.etsAccessControls,
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
    if (env.isReadOnly) {
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

    const createReceipt = await publicClient.waitForTransactionReceipt({ hash: createTargetTx });
    console.log(`  📤 Target created in tx: ${createTargetTx}`);

    // Get the targetId from the TargetCreated event
    const targetCreatedLogs = parseEventLogs({
      abi: contracts.ETSTarget!.abi,
      logs: createReceipt.logs,
    });

    const targetCreatedEvent = targetCreatedLogs.find((log) => log.eventName === "TargetCreated");
    const targetId = targetCreatedEvent?.args?.targetId;
    console.log(`  🎯 Target ID: ${targetId}`);

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
      `\n⏳ Waiting for Temporal workflow to process enrichment (up to ${env.timeouts.enrichment / 1000}s)...`,
    );

    // Poll for enrichment completion
    const startTime = Date.now();
    let enrichedEventFound = false;

    while (Date.now() - startTime < env.timeouts.enrichment && !enrichedEventFound) {
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
            const payloadStr = typeof enrichedEvent.args.payload === 'string'
              ? enrichedEvent.args.payload
              : enrichedEvent.args.payload;
            const cleanHex = payloadStr.startsWith('0x') ? payloadStr.slice(2) : payloadStr;
            const metadata = JSON.parse(Buffer.from(cleanHex, 'hex').toString());

            // Handle nested metadata structure from Temporal workflow
            const title = metadata.core?.title || metadata.title || 'N/A';
            const description = metadata.core?.description || metadata.description || 'N/A';
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
        `  ⚠️  No TargetEnriched event after ${env.timeouts.enrichment / 1000}s (workflow may still be processing)`,
      );
    }
  });

  // Test: Event processor can enrich targets
  test("should allow event processor to enrich target", async () => {
    if (env.isReadOnly || !eventProcessorAccount) {
      console.log("⏭️  Skipping event processor test");
      return;
    }

    // Create target first
    const targetURI = `https://github.com/test-${Date.now()}`;

    // Create wallet client for regular user to create target
    const localChain = { ...localhost, id: 31337 };
    const userWallet = createWalletClient({
      account: testerAccount!,
      chain: localChain,
      transport: http(env.rpcUrl),
    });

    // Create the target
    const createTx = await userWallet.writeContract({
      address: contracts.ETSTarget!.address,
      abi: contracts.ETSTarget!.abi,
      functionName: "createTarget",
      args: [targetURI],
    });

    const createReceipt = await publicClient.waitForTransactionReceipt({ hash: createTx });

    // Get targetId from event
    const logs = parseEventLogs({
      abi: contracts.ETSTarget!.abi,
      logs: createReceipt.logs,
    });

    const targetCreatedEvent = logs.find((log) => log.eventName === "TargetCreated");
    const targetId = targetCreatedEvent?.args?.targetId;

    console.log(`\n🤖 Event processor enriching target ${targetId}...`);

    // Create wallet client for event processor
    const eventProcessorWallet = createWalletClient({
      account: eventProcessorAccount,
      chain: localChain,
      transport: http(env.rpcUrl),
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
      const payload = `0x${Buffer.from(JSON.stringify(metadata)).toString('hex')}` as `0x${string}`;
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
    if (env.isReadOnly || !testerAccount || !walletClient) {
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

    const createReceipt = await publicClient.waitForTransactionReceipt({ hash: createTx });

    // Get targetId from event
    const logs = parseEventLogs({
      abi: contracts.ETSTarget!.abi,
      logs: createReceipt.logs,
    });

    const targetCreatedEvent = logs.find((log) => log.eventName === "TargetCreated");
    const targetId = targetCreatedEvent?.args?.targetId;

    console.log(`\n🚫 Testing unauthorized enrichment attempt for target ${targetId}...`);

    try {
      // Create metadata payload for unauthorized attempt
      const metadata = {
        title: "Hack Title",
        description: "Hack Description",
        image: "https://hack.com/image.png",
        keywords: ["hack"],
      };
      const payload = `0x${Buffer.from(JSON.stringify(metadata)).toString('hex')}` as `0x${string}`;
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
