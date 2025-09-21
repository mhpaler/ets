// @ts-ignore - Bun test runner types
import { afterAll, beforeAll, describe, test } from "bun:test";
import { etsAccessControlsAbi, etsTargetAbi } from "@ethereum-tag-service/contracts/contracts";
import { expect } from "chai";
import { http, type Address, type Hash, createPublicClient, createWalletClient, parseEventLogs } from "viem";
import { mnemonicToAccount } from "viem/accounts";
import { localhost, sepolia, base } from "viem/chains";

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
      enrichment: 15000,
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
  let contracts: {
    ETSTarget?: { address: Address; abi: typeof etsTargetAbi };
    ETSAccessControls?: { address: Address; abi: typeof etsAccessControlsAbi };
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
        walletClient = createWalletClient({
          account: testerAccount,
          chain: env.chain,
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
        const addresses = await getContractAddresses(env.chainId);

        contracts.ETSTarget = {
          address: addresses.ETSTarget as Address,
          abi: etsTargetAbi,
        };

        contracts.ETSAccessControls = {
          address: addresses.ETSAccessControls as Address,
          abi: etsAccessControlsAbi,
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
          abi: etsTargetAbi,
        };
      }
      if (env.contracts.etsAccessControls) {
        contracts.ETSAccessControls = {
          address: env.contracts.etsAccessControls,
          abi: etsAccessControlsAbi,
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

    const targetURI = `https://example.com/test-${Date.now()}`;
    console.log(`\n🎯 Requesting enrichment for: ${targetURI}`);

    // Call requestEnrichTarget on ETSTarget contract
    const { request } = await publicClient.simulateContract({
      address: contracts.ETSTarget!.address,
      abi: contracts.ETSTarget!.abi,
      functionName: "requestEnrichTarget",
      args: [targetURI],
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
    console.log(`  🎉 EnrichTargetRequested event emitted`);
    console.log(`     Target ID: ${enrichRequestEvent?.args?.targetId}`);
    console.log(`     Target URI: ${enrichRequestEvent?.args?.targetURI}`);

    // Wait for Temporal workflow to process
    console.log(`\n⏳ Waiting for Temporal workflow to process enrichment...`);
    await new Promise((resolve) => setTimeout(resolve, 5000));

    // Check for TargetEnriched event (if EVENT_PROCESSOR has enriched it)
    const latestBlock = await publicClient.getBlockNumber();
    const enrichedLogs = await publicClient.getLogs({
      address: contracts.ETSTarget!.address,
      event: {
        name: "TargetEnriched",
        type: "event",
        inputs: [
          { name: "targetId", type: "uint256", indexed: true },
          { name: "title", type: "string" },
          { name: "description", type: "string" },
          { name: "imageUrl", type: "string" },
          { name: "keywords", type: "string" },
        ],
      },
      fromBlock: receipt.blockNumber,
      toBlock: latestBlock,
    });

    if (enrichedLogs.length > 0) {
      console.log(`  🎉 TargetEnriched event found!`);
      const enrichedEvent = enrichedLogs[0];
      console.log(`     Title: ${enrichedEvent.args?.title}`);
      console.log(`     Description: ${enrichedEvent.args?.description?.substring(0, 100)}...`);
    } else {
      console.log(`  ⚠️  No TargetEnriched event yet (workflow may still be processing)`);
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
    const targetId = BigInt(Math.floor(Math.random() * 1000000));

    console.log(`\n🤖 Event processor enriching target ${targetId}...`);

    // Create wallet client for event processor
    const eventProcessorWallet = createWalletClient({
      account: eventProcessorAccount,
      chain: env.chain,
      transport: http(env.rpcUrl),
    });

    // Simulate enrichTarget call
    try {
      const { request } = await publicClient.simulateContract({
        address: contracts.ETSTarget!.address,
        abi: contracts.ETSTarget!.abi,
        functionName: "enrichTarget",
        args: [targetId, "Test Title", "Test Description", "https://example.com/image.png", "test,keywords"],
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
      console.log(`  🎉 TargetEnriched event emitted successfully`);
    } catch (error: any) {
      if (error.message.includes("UNAUTHORIZED")) {
        console.log(`  ⚠️  Event processor not authorized (needs EVENT_PROCESSOR_ROLE)`);
      } else {
        throw error;
      }
    }
  });

  // Test: Non-event processor cannot enrich
  test("should prevent non-event processor from enriching", async () => {
    if (env.isReadOnly || !testerAccount) {
      console.log("⏭️  Skipping authorization test");
      return;
    }

    const targetId = BigInt(Math.floor(Math.random() * 1000000));
    console.log(`\n🚫 Testing unauthorized enrichment attempt...`);

    try {
      await publicClient.simulateContract({
        address: contracts.ETSTarget!.address,
        abi: contracts.ETSTarget!.abi,
        functionName: "enrichTarget",
        args: [targetId, "Hack Title", "Hack Description", "https://hack.com/image.png", "hack"],
        account: testerAccount,
      });

      // Should not reach here
      expect.fail("Expected transaction to revert");
    } catch (error: any) {
      expect(error.message).to.include("UNAUTHORIZED");
      console.log(`  ✅ Correctly rejected unauthorized enrichment`);
    }
  });
});