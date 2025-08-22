import { etsAccessControlsAbi, etsEnrichTargetAbi, etsTargetAbi } from "@ethereum-tag-service/contracts/contracts";
import axios from "axios";
import { expect } from "chai";
import { http, type Address, type Hash, createPublicClient, createWalletClient } from "viem";
import { mnemonicToAccount } from "viem/accounts";
import { localhost } from "viem/chains";
import { keccak256, toBytes, toHex } from "viem/utils";
import { describe, beforeAll, afterAll, beforeEach, test } from "bun:test";

/**
 * Target Enrichment Integration Test v2
 *
 * Environment-aware integration testing for target enrichment pipeline.
 *
 * Environments:
 * - local: Uses start-core-stack.sh services (Hardhat, Event Processor, Offchain API, ArLocal, Graph)
 * - staging: Uses Sepolia testnet + staging infrastructure
 * - production: Uses Base mainnet + production infrastructure (read-only)
 */

interface EnvironmentConfig {
  name: string;
  rpcUrl: string;
  chainId: number;
  offchainApiUrl: string;
  arweaveUrl: string;
  graphUrl?: string;
  requiresLocalServices: boolean;
  isReadOnly: boolean;
  mnemonic?: string; // Mnemonic for account derivation
  accounts: {
    eventProcessorIndex?: number; // Account index for event processor
    testerIndex?: number; // Account index for creating targets
    viewer?: Address; // Address for read-only queries
  };
  timeouts: {
    enrichment: number;
    serviceHealth: number;
  };
}

const environments: Record<string, EnvironmentConfig> = {
  local: {
    name: "Local Development",
    rpcUrl: "http://localhost:8545",
    chainId: 31337,
    offchainApiUrl: "http://localhost:4000",
    arweaveUrl: "http://localhost:1984",
    graphUrl: "http://localhost:8000/subgraphs/name/ets-local",
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
  },

  staging: {
    name: "Staging (Sepolia)",
    rpcUrl: process.env.STAGING_RPC_URL || "https://sepolia.infura.io/v3/YOUR_KEY",
    chainId: 11155111,
    offchainApiUrl: "https://api-staging.ets.xyz",
    arweaveUrl: "https://arweave.net",
    graphUrl: "https://api.studio.thegraph.com/query/ets-staging/ets-sepolia/v1.0.0",
    requiresLocalServices: false,
    isReadOnly: false,
    mnemonic: process.env.MNEMONIC_TESTNET_STAGING,
    accounts: {
      testerIndex: 0, // Use first account for testing
    },
    timeouts: {
      enrichment: 30000,
      serviceHealth: 5000,
    },
  },

  production: {
    name: "Production (Base)",
    rpcUrl: process.env.PROD_RPC_URL || "https://mainnet.base.org",
    chainId: 8453,
    offchainApiUrl: "https://api.ets.xyz",
    arweaveUrl: "https://arweave.net",
    graphUrl: "https://api.studio.thegraph.com/query/ets/ets-base/v1.0.0",
    requiresLocalServices: false,
    isReadOnly: true, // Read-only in production
    accounts: {
      viewer: "0x0000000000000000000000000000000000000000" as Address, // No private keys needed
    },
    timeouts: {
      enrichment: 30000,
      serviceHealth: 5000,
    },
  },
};

describe("Target Enrichment Integration v2", () => {
  // Using arrow functions with bun test runner

  let env: EnvironmentConfig;
  let publicClient: any;
  let walletClient: any = null;
  let testerAccount: ReturnType<typeof mnemonicToAccount> | null = null;
  let eventProcessorAccount: ReturnType<typeof mnemonicToAccount> | null = null;
  const contracts: {
    ETSAccessControls?: { address: Address; abi: typeof etsAccessControlsAbi };
    ETSTarget?: { address: Address; abi: typeof etsTargetAbi };
    ETSEnrichTarget?: { address: Address; abi: typeof etsEnrichTargetAbi };
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
    console.log(`📊 Offchain API: ${env.offchainApiUrl}`);
    console.log(`📦 Arweave: ${env.arweaveUrl}`);
    if (env.graphUrl) console.log(`📈 Graph: ${env.graphUrl}`);
    console.log(`🔒 Read-only: ${env.isReadOnly}\n`);

    // 2. Validate environment prerequisites
    await validateEnvironmentPrerequisites();

    // 3. Setup blockchain connection
    await setupBlockchainConnection();

    // 4. Load and validate contracts
    await setupContracts();

    // 5. Environment-specific setup
    if (env.requiresLocalServices) {
      await setupLocalEnvironment();
    } else {
      await setupRemoteEnvironment();
    }

    console.log(`\n✅ ${env.name} environment ready for testing!\n`);
  });

  afterAll(async () => {
    console.log(`\n✅ ${env.name} integration tests complete`);
    if (env.requiresLocalServices) {
      console.log("💡 Local services managed by start-core-stack.sh");
    }
  });

  // Environment validation functions
  async function validateEnvironmentPrerequisites() {
    console.log("🔍 Validating environment prerequisites...");

    if (env.requiresLocalServices) {
      // Local environment: Check all core stack services
      await validateLocalServices();
    } else {
      // Remote environment: Check live services
      await validateRemoteServices();
    }
  }

  async function validateLocalServices() {
    const requiredServices = [
      {
        name: "Hardhat Network",
        port: 8545,
        check: async () => {
          const tempClient = createPublicClient({
            chain: localhost,
            transport: http(env.rpcUrl),
          });
          const chainId = await tempClient.getChainId();
          return { success: true, details: `Chain ID: ${chainId}` };
        },
      },
      {
        name: "Offchain API",
        port: 4000,
        check: async () => {
          const response = await axios.get(`${env.offchainApiUrl}/health`, { timeout: env.timeouts.serviceHealth });
          return { success: true, details: `Status: ${response.status}` };
        },
      },
      {
        name: "ArLocal",
        port: 1984,
        check: async () => {
          const response = await axios.get(`${env.arweaveUrl}/info`, { timeout: env.timeouts.serviceHealth });
          return { success: true, details: `Network: ${response.data?.network || "local"}` };
        },
      },
      // TEMPORARILY DISABLED: Graph Node is broken, will fix later
      // {
      //   name: "The Graph",
      //   port: 8000,
      //   check: async () => {
      //     if (!env.graphUrl) return { success: true, details: "Not configured" };
      //     // Simple GraphQL health check
      //     const response = await axios.post(
      //       env.graphUrl,
      //       {
      //         query: "{ _meta { block { number } } }",
      //       },
      //       { timeout: env.timeouts.serviceHealth },
      //     );
      //     return { success: true, details: `Block: ${response.data?.data?._meta?.block?.number || "Unknown"}` };
      //   },
      // },
    ];

    let allHealthy = true;
    const failedServices = [];

    for (const service of requiredServices) {
      try {
        const result = await service.check();
        console.log(`  ✅ ${service.name} (port ${service.port}): ${result.details}`);
      } catch (error) {
        console.error(`  ❌ ${service.name} (port ${service.port}): ${error.message}`);
        failedServices.push(service.name);
        allHealthy = false;
      }
    }

    if (!allHealthy) {
      console.error("\n💥 Required local services are not running!");
      console.error("📋 Failed services:", failedServices.join(", "));
      console.error("\n💡 To start all required services:");
      console.error("   ./scripts/start-local-stack.sh --core  # Core services for testing");
      throw new Error("Local services not available");
    }
  }

  async function validateRemoteServices() {
    console.log("🔍 Validating remote services...");

    // For staging/production, just check API health
    try {
      const response = await axios.get(`${env.offchainApiUrl}/health`, {
        timeout: env.timeouts.serviceHealth,
      });
      console.log(`  ✅ Offchain API: Status ${response.status}`);
    } catch (error) {
      console.error(`  ❌ Offchain API unavailable: ${error.message}`);
      throw new Error("Remote offchain API not available");
    }
  }

  async function setupBlockchainConnection() {
    console.log("🔗 Setting up blockchain connection...");

    try {
      // Create public client
      publicClient = createPublicClient({
        chain: localhost,
        transport: http(env.rpcUrl),
      });

      const chainId = await publicClient.getChainId();

      if (chainId !== env.chainId) {
        throw new Error(`Chain ID mismatch: expected ${env.chainId}, got ${chainId}`);
      }

      console.log(`  ✅ Connected to ${env.name} (Chain ID: ${chainId})`);

      // Setup accounts and wallet client if not read-only
      if (!env.isReadOnly && env.mnemonic) {
        // Create accounts from mnemonic
        if (env.accounts.testerIndex !== undefined) {
          testerAccount = mnemonicToAccount(env.mnemonic, { addressIndex: env.accounts.testerIndex });
          console.log(`  ✅ Test account: ${testerAccount.address}`);
        }

        if (env.accounts.eventProcessorIndex !== undefined) {
          eventProcessorAccount = mnemonicToAccount(env.mnemonic, { addressIndex: env.accounts.eventProcessorIndex });
          console.log(`  ✅ Event Processor account: ${eventProcessorAccount.address}`);
        }

        // Create wallet client for transactions
        if (testerAccount) {
          walletClient = createWalletClient({
            account: testerAccount,
            chain: { ...localhost, id: 31337 },
            transport: http(env.rpcUrl),
          });
        }
      }
    } catch (error) {
      console.error(`  ❌ Blockchain connection failed: ${error.message}`);
      throw error;
    }
  }

  async function setupContracts() {
    console.log("📄 Loading contracts...");

    try {
      if (env.name === "Local Development") {
        // Load contract addresses from chainConfig
        const { contracts: chainConfigContracts } = await import(
          "@ethereum-tag-service/contracts/chainConfig/localhost"
        );

        // Setup contract references with addresses and ABIs
        contracts.ETSAccessControls = {
          address: chainConfigContracts.ETSAccessControls.address as Address,
          abi: etsAccessControlsAbi,
        };

        contracts.ETSTarget = {
          address: chainConfigContracts.ETSTarget.address as Address,
          abi: etsTargetAbi,
        };

        contracts.ETSEnrichTarget = {
          address: chainConfigContracts.ETSEnrichTarget.address as Address,
          abi: etsEnrichTargetAbi,
        };

        console.log("  ✅ Contracts loaded successfully");
        console.log(`    ETSTarget: ${contracts.ETSTarget.address}`);
        console.log(`    ETSAccessControls: ${contracts.ETSAccessControls.address}`);
        console.log(`    ETSEnrichTarget: ${contracts.ETSEnrichTarget.address}`);
      } else {
        // Load from environment-specific config
        throw new Error(`Contract loading for ${env.name} not yet implemented`);
      }
    } catch (error) {
      console.error(`  ❌ Contract loading failed: ${error.message}`);
      throw error;
    }
  }

  async function setupLocalEnvironment() {
    console.log("🏠 Setting up local environment...");

    if (!contracts.ETSAccessControls || !eventProcessorAccount) {
      throw new Error("Contracts or event processor account not properly initialized");
    }

    // Verify Event Processor role is configured
    // EVENT_PROCESSOR_ROLE hash from the deployed contract
    const EVENT_PROCESSOR_ROLE = "0xcded11c2c0385a4400f33454d6d15744ee8aa819bbaa907edaf1be48a5bb4e7f" as const;

    const hasRole = await publicClient.readContract({
      address: contracts.ETSAccessControls.address,
      abi: contracts.ETSAccessControls.abi,
      functionName: "hasRole",
      args: [EVENT_PROCESSOR_ROLE, eventProcessorAccount.address],
    });

    if (hasRole) {
      console.log("  ✅ Event Processor role configured");
    } else {
      throw new Error("Event Processor role not configured - check start-core-stack.sh deployment");
    }
  }

  async function setupRemoteEnvironment() {
    console.log("🌐 Setting up remote environment...");
    // Placeholder for staging/production setup
    console.log("  ✅ Remote environment setup (placeholder)");
  }

  // Test helper functions
  async function waitForEnrichment(targetId: Hash, maxWaitMs: number = env.timeouts.enrichment): Promise<boolean> {
    const startTime = Date.now();

    while (Date.now() - startTime < maxWaitMs) {
      if (!contracts.ETSTarget) {
        throw new Error("ETSTarget contract not initialized");
      }

      const target = await publicClient.readContract({
        address: contracts.ETSTarget.address,
        abi: contracts.ETSTarget.abi,
        functionName: "getTargetById",
        args: [targetId],
      });

      if (target.enriched > 0n) {
        return true; // Enrichment completed
      }

      // Wait 1 second before checking again
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    return false; // Timeout
  }

  // Test suites
  describe("Environment-Specific Tests", () => {
    test("should validate the test environment is properly configured", async () => {
      expect(env.name).to.be.a("string");
      expect(publicClient).to.not.be.undefined;
      expect(contracts.ETSTarget).to.not.be.undefined;

      if (env.isReadOnly) {
        console.log("ℹ️  Running in read-only mode");
        expect(walletClient).to.be.null;
      } else {
        console.log("ℹ️  Running in write mode");
        expect(walletClient).to.not.be.null;
        expect(testerAccount).to.not.be.null;
      }
    });
  });

  describe("Local Integration Tests", () => {
    beforeEach(() => {
      if (env.name !== "Local Development") {
        console.log("Skipping local tests - not in local environment");
        return;
      }
    });

    test("should automatically enrich a newly created target", async () => {
      // COMMENTED OUT FOR ENVIRONMENT DETECTION TESTING
      // This test validates the complete target enrichment pipeline
      
      if (!walletClient || !contracts.ETSTarget) {
        throw new Error("Wallet client or ETSTarget contract not initialized");
      }

      const targetURI = "https://www.ethereum.org/en/developers/";

      console.log(`\n🎯 Creating target: ${targetURI}`);

      // Compute target ID
      const targetId = keccak256(toBytes(targetURI));
      console.log(`🔢 Target ID: ${targetId}`);

      // Create target
      const txHash = await walletClient.writeContract({
        address: contracts.ETSTarget.address,
        abi: contracts.ETSTarget.abi,
        functionName: "createTarget",
        args: [targetURI],
      });

      console.log(`📝 Transaction: ${txHash}`);

      // Wait for transaction confirmation
      const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });

      // Verify TargetCreated event was emitted
      const targetCreatedLog = receipt.logs.find((log) => {
        try {
          // Check if log matches ETSTarget contract
          return log.address.toLowerCase() === contracts.ETSTarget!.address.toLowerCase();
        } catch {
          return false;
        }
      });

      expect(targetCreatedLog).to.not.be.undefined;
      console.log("✅ TargetCreated event emitted");

      // Wait for enrichment
      console.log("⏳ Waiting for automatic enrichment...");
      const enriched = await waitForEnrichment(targetId);

      if (enriched) {
        const target = await publicClient.readContract({
          address: contracts.ETSTarget.address,
          abi: contracts.ETSTarget.abi,
          functionName: "getTargetById",
          args: [targetId],
        });

        console.log("✅ Target enriched!");
        console.log(`   Enriched at: ${new Date(Number(target.enriched) * 1000).toISOString()}`);
        console.log(`   HTTP Status: ${target.httpStatus.toString()}`);

        if (target.arweaveTxId && target.arweaveTxId !== "") {
          console.log(`   Arweave TX: ${target.arweaveTxId}`);
        }

        expect(Number(target.enriched)).to.be.gt(0);
        expect(target.targetURI).to.equal(targetURI);
      } else {
        console.warn("⚠️  Enrichment timed out - check event processor logs");
        throw new Error("Enrichment timeout");
      }
    });
  });

  describe.skip("Staging Integration Tests", () => {
    // COMMENTED OUT FOR ENVIRONMENT DETECTION TESTING
    beforeEach(() => {
      if (env.name !== "Staging (Sepolia)") {
        console.log("Skipping staging tests");
        return;
      }
    });

    test("should validate staging infrastructure", async () => {
      // Placeholder for staging tests
      console.log("🚧 Staging tests not yet implemented");
    });
  });

  describe.skip("Production Integration Tests", () => {
    // COMMENTED OUT FOR ENVIRONMENT DETECTION TESTING
    beforeEach(() => {
      if (env.name !== "Production (Base)") {
        console.log("Skipping production tests");
        return;
      }
    });

    test("should validate production infrastructure (read-only)", async () => {
      // Placeholder for production read-only tests
      console.log("🚧 Production tests not yet implemented");
    });
  });
});
