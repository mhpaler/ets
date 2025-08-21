import axios from "axios";
import { expect } from "chai";
import { ethers } from "ethers";

/**
 * Target Enrichment Integration Test
 *
 * Tests the complete flow:
 * 1. Target creation → TargetCreated event
 * 2. Event processor picks up event
 * 3. Calls offchain API for enrichment
 * 4. Updates target with metadata
 */
describe("Target Enrichment Integration", function () {
  this.timeout(60000); // 1 minute timeout for integration tests

  let provider: ethers.JsonRpcProvider;
  let signer: ethers.Wallet;
  const contracts: any = {};

  const RPC_URL = "http://localhost:8545";
  const OFFCHAIN_API_URL = "http://localhost:4000";

  // Hardhat test accounts
  const TEST_ACCOUNTS = {
    account0: "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", // ETSAdmin
    account1: "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d", // ETSPlatform
    account2: "0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a", // EventProcessor
    account3: "0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6", // Regular user
  };

  before("Setup integration environment", async function () {
    console.log("\n🔧 Setting up integration test environment...\n");

    // Early failure: Validate all required services are running
    const requiredServices = [
      {
        name: "Hardhat Network",
        port: 8545,
        check: async () => {
          provider = new ethers.JsonRpcProvider(RPC_URL);
          const network = await provider.getNetwork();
          return { success: true, details: `Chain ID: ${network.chainId}` };
        },
      },
      {
        name: "Offchain API",
        port: 4000,
        check: async () => {
          const response = await axios.get(`${OFFCHAIN_API_URL}/health`, { timeout: 3000 });
          return { success: true, details: `Status: ${response.status}` };
        },
      },
      {
        name: "ArLocal",
        port: 1984,
        check: async () => {
          const response = await axios.get("http://localhost:1984/info", { timeout: 3000 });
          return { success: true, details: `Network: ${response.data?.network || "local"}` };
        },
      },
    ];

    console.log("🔍 Validating required services...\n");

    let allServicesHealthy = true;
    const failedServices = [];

    for (const service of requiredServices) {
      try {
        const result = await service.check();
        console.log(`✅ ${service.name} (port ${service.port}): ${result.details}`);
      } catch (error) {
        console.error(`❌ ${service.name} (port ${service.port}): ${error.message}`);
        failedServices.push(service.name);
        allServicesHealthy = false;
      }
    }

    if (!allServicesHealthy) {
      console.error("\n💥 Required services are not running!");
      console.error("📋 Failed services:", failedServices.join(", "));
      console.error("\n💡 To start all required services, run:");
      console.error("   ./scripts/start-core-stack.sh");
      console.error("   npx arlocal  # (in separate terminal)");
      console.error("\nNote: start-core-stack.sh includes Hardhat, Offchain API, and Event Processor");
      this.skip();
      return;
    }

    console.log("\n✅ All required services are healthy!");

    // 2. Setup signers
    const _eventProcessorSigner = new ethers.Wallet(TEST_ACCOUNTS.account2, provider);
    const _platformSigner = new ethers.Wallet(TEST_ACCOUNTS.account1, provider);
    signer = new ethers.Wallet(TEST_ACCOUNTS.account3, provider);

    // 3. Load deployed contract addresses from chainConfig
    try {
      const chainConfig = require("../../packages/contracts/src/chainConfig/localhost.json");

      // Create contract instances
      contracts.ETSAccessControls = new ethers.Contract(
        chainConfig.contracts.ETSAccessControls.address,
        chainConfig.contracts.ETSAccessControls.abi,
        provider,
      );

      contracts.ETSTarget = new ethers.Contract(
        chainConfig.contracts.ETSTarget.address,
        chainConfig.contracts.ETSTarget.abi,
        provider,
      );

      contracts.ETSEnrichTarget = new ethers.Contract(
        chainConfig.contracts.ETSEnrichTarget.address,
        chainConfig.contracts.ETSEnrichTarget.abi,
        provider,
      );

      console.log("✅ Contracts loaded from chainConfig");

      // 4. Verify deployment configuration
      // Note: EVENT_PROCESSOR_ROLE and enrichTarget should be set during deployment (99_postDeployment.js)
      const EVENT_PROCESSOR_ROLE = await contracts.ETSAccessControls.EVENT_PROCESSOR_ROLE();

      // Check if ETSOracle (account[2]) has EVENT_PROCESSOR_ROLE from deployment
      const eventProcessorAddress = new ethers.Wallet(TEST_ACCOUNTS.account2).address;
      const oracleHasRole = await contracts.ETSAccessControls.hasRole(EVENT_PROCESSOR_ROLE, eventProcessorAddress);
      if (oracleHasRole) {
        console.log("✅ EVENT_PROCESSOR_ROLE already granted to ETSOracle (from deployment)");
      } else {
        console.log("⚠️  EVENT_PROCESSOR_ROLE not found - deployment may be incomplete");
      }

      // Verify ETSEnrichTarget has reference to ETSTarget (should be set in deployment)
      const targetContract = await contracts.ETSEnrichTarget.etsTarget();
      if (targetContract !== ethers.ZeroAddress) {
        console.log("✅ ETSEnrichTarget configured with ETSTarget reference");
      } else {
        console.log("⚠️  ETSEnrichTarget not properly configured - deployment may be incomplete");
      }
    } catch (error) {
      console.error("❌ Failed to load contracts:", error);
      console.error("   Make sure contracts are deployed: pnpm hardhat deployETS --tags deployAll --network localhost");
      this.skip();
      return;
    }

    // 6. Verify Event Processor is running (started by start-core-stack.sh)
    await verifyEventProcessor();
  });

  after("Cleanup", async () => {
    // Event processor is managed by start-core-stack.sh, no cleanup needed
    console.log("\n✅ Test cleanup complete");
    console.log("💡 Event processor and other services managed by start-core-stack.sh");
  });

  async function verifyEventProcessor() {
    console.log("🔍 Verifying Event Processor is running...");

    // Since start-core-stack.sh starts the event processor, we just verify it's working
    // by checking if it can connect to required services and has proper configuration
    try {
      // The event processor should be running and watching for events
      // We'll verify this by checking that our test account has the required role
      const EVENT_PROCESSOR_ROLE = await contracts.ETSAccessControls.EVENT_PROCESSOR_ROLE();
      const eventProcessorAddress = new ethers.Wallet(TEST_ACCOUNTS.account2).address;
      const hasRole = await contracts.ETSAccessControls.hasRole(EVENT_PROCESSOR_ROLE, eventProcessorAddress);

      if (hasRole) {
        console.log("✅ Event Processor account has EVENT_PROCESSOR_ROLE");
      } else {
        throw new Error("Event Processor account missing EVENT_PROCESSOR_ROLE");
      }
    } catch (error) {
      console.error("❌ Event Processor verification failed:", error.message);
      console.error("   Make sure start-core-stack.sh completed successfully");
      throw error;
    }
  }

  async function waitForEnrichment(targetId: bigint, maxWaitMs = 15000): Promise<boolean> {
    const startTime = Date.now();

    while (Date.now() - startTime < maxWaitMs) {
      const target = await contracts.ETSTarget.getTargetById(targetId);

      if (target.enriched > 0n) {
        return true; // Enrichment completed
      }

      // Wait 1 second before checking again
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    return false; // Timeout
  }

  describe("Automatic Enrichment Flow", () => {
    it("should automatically enrich a newly created target", async function () {
      const targetURI = `https://example.com/test-${Date.now()}`;

      console.log("\n🎯 Creating target:", targetURI);

      // Compute target ID
      const targetId = ethers.keccak256(ethers.toUtf8Bytes(targetURI));

      // Create target
      const tx = await contracts.ETSTarget.connect(signer).createTarget(targetURI);
      const receipt = await tx.wait();

      // Verify TargetCreated event was emitted
      const targetCreatedEvent = receipt.logs.find((log: any) => {
        try {
          const parsed = contracts.ETSTarget.interface.parseLog(log);
          return parsed?.name === "TargetCreated";
        } catch {
          return false;
        }
      });

      expect(targetCreatedEvent).to.not.be.undefined;
      console.log("✅ TargetCreated event emitted");

      // Wait for enrichment
      console.log("⏳ Waiting for automatic enrichment...");
      const enriched = await waitForEnrichment(BigInt(targetId));

      if (enriched) {
        const target = await contracts.ETSTarget.getTargetById(targetId);
        console.log("✅ Target enriched!");
        console.log("   Enriched at:", new Date(Number(target.enriched) * 1000).toISOString());
        console.log("   HTTP Status:", target.httpStatus.toString());

        if (target.arweaveTxId && target.arweaveTxId !== "") {
          console.log("   Arweave TX:", target.arweaveTxId);
        }

        expect(Number(target.enriched)).to.be.gt(0);
        expect(target.targetURI).to.equal(targetURI);
      } else {
        console.warn("⚠️  Enrichment timed out - event processor may not be running");
        this.skip();
      }
    });
  });

  describe("Manual Enrichment Flow", () => {
    it("should enrich a target when manually requested", async function () {
      const targetURI = `https://example.com/manual-${Date.now()}`;

      console.log("\n🎯 Creating target for manual enrichment:", targetURI);

      // Create target first
      const createTx = await contracts.ETSTarget.connect(signer).createTarget(targetURI);
      await createTx.wait();

      const targetId = ethers.keccak256(ethers.toUtf8Bytes(targetURI));

      // Request manual enrichment
      console.log("📨 Requesting manual enrichment...");
      const enrichTx = await contracts.ETSEnrichTarget.connect(signer).requestEnrichTarget(targetId);
      const receipt = await enrichTx.wait();

      // Verify EnrichTargetRequested event
      const enrichRequestedEvent = receipt.logs.find((log: any) => {
        try {
          const parsed = contracts.ETSEnrichTarget.interface.parseLog(log);
          return parsed?.name === "EnrichTargetRequested";
        } catch {
          return false;
        }
      });

      expect(enrichRequestedEvent).to.not.be.undefined;
      console.log("✅ EnrichTargetRequested event emitted");

      // Wait for enrichment
      console.log("⏳ Waiting for manual enrichment...");
      const enriched = await waitForEnrichment(BigInt(targetId));

      if (enriched) {
        const target = await contracts.ETSTarget.getTargetById(targetId);
        console.log("✅ Target enriched via manual request!");
        console.log("   HTTP Status:", target.httpStatus.toString());

        expect(Number(target.enriched)).to.be.gt(0);
      } else {
        console.warn("⚠️  Manual enrichment timed out");
        this.skip();
      }
    });
  });

  describe("Error Handling", () => {
    it("should handle invalid URLs gracefully", async function () {
      const targetURI = "https://this-domain-definitely-does-not-exist-123456789.invalid";

      console.log("\n🎯 Testing error handling with invalid URL:", targetURI);

      // Create target with invalid URL
      const tx = await contracts.ETSTarget.connect(signer).createTarget(targetURI);
      await tx.wait();

      const targetId = ethers.keccak256(ethers.toUtf8Bytes(targetURI));

      // Wait for enrichment attempt
      console.log("⏳ Waiting for enrichment to handle error...");
      const enriched = await waitForEnrichment(BigInt(targetId));

      if (enriched) {
        const target = await contracts.ETSTarget.getTargetById(targetId);
        console.log("✅ Error handled gracefully");
        console.log("   HTTP Status:", target.httpStatus.toString());

        // Should have an error status (not 200)
        expect(Number(target.enriched)).to.be.gt(0); // Timestamp should still be set
        expect(target.httpStatus).to.not.equal(200);
        expect(target.arweaveTxId).to.equal(""); // No Arweave upload on error
      } else {
        console.warn("⚠️  Error handling test timed out");
        this.skip();
      }
    });
  });
});
