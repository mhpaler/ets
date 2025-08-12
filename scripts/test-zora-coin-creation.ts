#!/usr/bin/env tsx

/**
 * Test script for Zora coin creation using @zoralabs/coins-sdk
 *
 * This script validates our approach by testing the ZoraService
 * with various tag types to ensure proper parameter generation
 * and integration with the official Zora SDK.
 *
 * Usage: TEST_PRIVATE_KEY=0x... pnpm tsx scripts/test-zora-coin-creation.ts
 */

import { type TagCreatedEventData, ZoraService } from "../apps/offchain-api/src/services/zora/zoraService";

// Test cases to validate
const testCases: Omit<TagCreatedEventData, "tagId" | "timestamp">[] = [
  {
    tagString: "#bitcoin",
    machineName: "bitcoin",
    creator: "0x742d35Cc6636Cc24e5EdFB9b8D54Af0Fa7b1185A", // Example creator
    relayer: "0x742d35Cc6636Cc24e5EdFB9b8D54Af0Fa7b1185B", // Example relayer
  },
  {
    tagString: "#🚀",
    machineName: "🚀",
    creator: "0x742d35Cc6636Cc24e5EdFB9b8D54Af0Fa7b1185A",
    relayer: "0x742d35Cc6636Cc24e5EdFB9b8D54Af0Fa7b1185B",
  },
  {
    tagString: "#artificial-intelligence",
    machineName: "artificial-intelligence",
    creator: "0x742d35Cc6636Cc24e5EdFB9b8D54Af0Fa7b1185A",
    relayer: "0x742d35Cc6636Cc24e5EdFB9b8D54Af0Fa7b1185B",
  },
  {
    tagString: "#DeFi",
    machineName: "defi",
    creator: "0x742d35Cc6636Cc24e5EdFB9b8D54Af0Fa7b1185A",
    relayer: "0x742d35Cc6636Cc24e5EdFB9b8D54Af0Fa7b1185B",
  },
];

class ZoraTestRunner {
  private zoraService: ZoraService;

  constructor() {
    const privateKey = process.env.ETS_EOA_PRIVATE_KEY || process.env.TEST_PRIVATE_KEY;
    if (!privateKey) {
      throw new Error("ETS_EOA_PRIVATE_KEY or TEST_PRIVATE_KEY environment variable required");
    }

    // Use Base Sepolia testnet
    const chainId = 84532;
    const metadataApiUrl = "http://localhost:4000/api/metadata";
    this.zoraService = new ZoraService(privateKey as `0x${string}`, chainId, metadataApiUrl);
  }

  /**
   * Test coin creation using actual Zora service
   */
  async testCreateCoin(testData: Omit<TagCreatedEventData, "tagId" | "timestamp">) {
    console.log(`\n🧪 Testing coin creation for: ${testData.tagString}`);

    try {
      // Convert test data to full event format
      const eventData: TagCreatedEventData = {
        ...testData,
        tagId: Math.floor(Math.random() * 10000).toString(),
        timestamp: Date.now(),
      };

      console.log(
        "📋 Event data:",
        JSON.stringify(
          {
            tagString: eventData.tagString,
            machineName: eventData.machineName,
            creator: eventData.creator,
          },
          null,
          2,
        ),
      );

      // Test parameter generation
      const params = await this.zoraService.createCoinParams(eventData);
      console.log(
        "🔧 Generated coin parameters:",
        JSON.stringify(
          {
            name: params.name,
            symbol: params.symbol,
            recipient: params.recipient,
            referrer: params.referrer,
            metadataUri: params.metadataUri,
          },
          null,
          2,
        ),
      );

      // Test coin existence check
      console.log("🔍 Checking if coin exists...");
      const exists = await this.zoraService.coinExists(eventData);
      console.log(`   Coin exists: ${exists}`);

      // Test address prediction
      const predictedAddress = await this.zoraService.predictCoinAddress(eventData);
      console.log(`   Predicted address: ${predictedAddress}`);

      // Validate parameters
      this.validateParameters(params);

      if (!exists) {
        console.log("🚀 Creating coin on Base Sepolia...");
        const result = await this.zoraService.createCoin(eventData);
        console.log("📊 Creation result:", result);
      }

      console.log("✅ Test completed successfully");
      return { success: true, params };
    } catch (error) {
      console.error("❌ Test failed:", error);
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  }

  /**
   * Validate generated parameters
   */
  private validateParameters(params: any) {
    console.log("🔍 Validating parameters...");

    if (!params.name || params.name.length === 0) {
      throw new Error("Name cannot be empty");
    }

    if (params.name.length > 100) {
      throw new Error("Name too long (>100 chars)");
    }

    if (params.symbol !== "ETS") {
      throw new Error(`Symbol should be 'ETS', got '${params.symbol}'`);
    }

    if (!params.recipient || !/^0x[a-fA-F0-9]{40}$/.test(params.recipient)) {
      throw new Error("Invalid recipient address");
    }

    if (!params.referrer || !/^0x[a-fA-F0-9]{40}$/.test(params.referrer)) {
      throw new Error("Invalid referrer address");
    }

    if (!params.metadataUri || params.metadataUri.length === 0) {
      throw new Error("Metadata URI cannot be empty");
    }

    console.log("   ✅ All parameters valid");
  }

  /**
   * Run all test cases
   */
  async runTests() {
    console.log("🚀 Starting Zora coin creation tests");
    console.log("🔗 Chain: Base Sepolia (84532)");
    console.log("⚡ Using: @zoralabs/coins-sdk + Viem");
    console.log("🛠️  Service: ZoraService");

    const results = [];

    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i];
      console.log(`\n${"=".repeat(50)}`);
      console.log(`🧪 Test ${i + 1}/${testCases.length}: ${testCase.tagString}`);

      const result = await this.testCreateCoin(testCase);
      results.push({ testCase, result });

      // Add delay between tests to avoid rate limiting
      if (i < testCases.length - 1) {
        console.log("⏳ Waiting 2 seconds...");
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }

    console.log(`\n${"=".repeat(50)}`);
    console.log("📊 Test Results Summary:");
    results.forEach((test, index) => {
      const status = test.result.success ? "✅" : "❌";
      console.log(`${status} Test ${index + 1}: ${test.testCase.tagString}`);
      if (!test.result.success) {
        console.log(`   Error: ${test.result.error}`);
      }
    });

    const passed = results.filter((r) => r.result.success).length;
    console.log(`\n🏁 Tests completed: ${passed}/${results.length} passed`);

    if (passed === results.length) {
      console.log("🎉 All tests passed! ZoraService is working correctly.");
    } else {
      console.log("⚠️  Some tests failed. Check the errors above.");
    }

    return results;
  }
}

/**
 * Main execution
 */
async function main() {
  try {
    const runner = new ZoraTestRunner();
    const results = await runner.runTests();

    // Exit with error code if any tests failed
    const allPassed = results.every((r) => r.result.success);
    process.exit(allPassed ? 0 : 1);
  } catch (error) {
    console.error("💥 Test runner failed:", error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

export { ZoraTestRunner };
