#!/usr/bin/env tsx

/**
 * Test script for TAG metadata generation
 *
 * This script tests the metadata generation service in isolation
 * to validate proper metadata creation, validation, and mock functionality.
 *
 * Usage: pnpm tsx scripts/test-metadata-generation.ts
 */

import axios from "axios";

interface TagMetadataRequest {
  tagString: string;
  machineName: string;
  creator: string;
  relayer: string;
}

// Test cases for metadata generation
const testCases: TagMetadataRequest[] = [
  {
    tagString: "#bitcoin",
    machineName: "bitcoin",
    creator: "0x742d35Cc6636Cc24e5EdFB9b8D54Af0Fa7b1185A",
    relayer: "0x8ba1f109551bD432803012645Hac136c",
  },
  {
    tagString: "#🚀",
    machineName: "🚀",
    creator: "0x742d35Cc6636Cc24e5EdFB9b8D54Af0Fa7b1185A",
    relayer: "0x8ba1f109551bD432803012645Hac136c",
  },
  {
    tagString: "#artificial-intelligence",
    machineName: "artificial-intelligence",
    creator: "0x742d35Cc6636Cc24e5EdFB9b8D54Af0Fa7b1185A",
    relayer: "0x8ba1f109551bD432803012645Hac136c",
  },
  {
    tagString: "#DeFi",
    machineName: "defi",
    creator: "0x742d35Cc6636Cc24e5EdFB9b8D54Af0Fa7b1185A",
    relayer: "0x8ba1f109551bD432803012645Hac136c",
  },
];

class MetadataTestRunner {
  private readonly apiBaseUrl: string;

  constructor(apiBaseUrl = "http://localhost:3000/api/metadata") {
    this.apiBaseUrl = apiBaseUrl;
  }

  /**
   * Test metadata generation for a single tag
   */
  async testGenerateMetadata(request: TagMetadataRequest) {
    console.log(`\\n🧪 Testing metadata generation for: ${request.tagString}`);

    try {
      console.log(
        "📋 Request data:",
        JSON.stringify(
          {
            tagString: request.tagString,
            machineName: request.machineName,
            creator: request.creator,
          },
          null,
          2,
        ),
      );

      // Call metadata generation API
      console.log("🚀 Calling metadata generation API...");
      const response = await axios.post(`${this.apiBaseUrl}/generate`, request, {
        timeout: 10000,
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.data.success) {
        console.log("✅ Metadata generated successfully");
        console.log(`   URI: ${response.data.metadataUri}`);
        console.log(`   Name: ${response.data.metadata.name}`);
        console.log(`   Version: ${response.data.metadata.version}`);
        console.log(`   Image: ${response.data.metadata.image}`);
        console.log(`   Attributes: ${response.data.metadata.attributes.length}`);

        // Test validation
        const validationResult = await this.testValidateMetadata(response.data.metadata);
        if (!validationResult.valid) {
          throw new Error(`Validation failed: ${validationResult.errors.join(", ")}`);
        }

        console.log("✅ Metadata validation passed");
        return { success: true, metadata: response.data.metadata };
      }
      throw new Error(response.data.error || "Unknown error");
    } catch (error) {
      console.error("❌ Metadata generation failed:", error);
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  }

  /**
   * Test metadata validation
   */
  async testValidateMetadata(metadata: any): Promise<{ valid: boolean; errors: string[] }> {
    try {
      const response = await axios.post(`${this.apiBaseUrl}/validate`, metadata, {
        timeout: 5000,
        headers: {
          "Content-Type": "application/json",
        },
      });

      return {
        valid: response.data.valid,
        errors: response.data.errors || [],
      };
    } catch (error) {
      console.error("❌ Validation API failed:", error);
      return {
        valid: false,
        errors: ["Validation API call failed"],
      };
    }
  }

  /**
   * Test health check
   */
  async testHealthCheck(): Promise<boolean> {
    try {
      console.log("🔍 Testing metadata service health...");
      const response = await axios.get(`${this.apiBaseUrl}/health`, {
        timeout: 5000,
      });

      if (response.data.success && response.data.status === "healthy") {
        console.log("✅ Metadata service is healthy");
        console.log(`   Mock mode: ${response.data.mockMode}`);
        return true;
      }
      console.log("❌ Metadata service is unhealthy");
      return false;
    } catch (error) {
      console.error("❌ Health check failed:", error);
      return false;
    }
  }

  /**
   * Run all tests
   */
  async runTests() {
    console.log("🚀 Starting metadata generation tests");
    console.log(`🔗 API URL: ${this.apiBaseUrl}`);

    // Health check first
    const isHealthy = await this.testHealthCheck();
    if (!isHealthy) {
      console.log("💥 Metadata service is not healthy, aborting tests");
      return [];
    }

    const results = [];

    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i];
      console.log(`\\n${"=".repeat(50)}`);
      console.log(`🧪 Test ${i + 1}/${testCases.length}: ${testCase.tagString}`);

      const result = await this.testGenerateMetadata(testCase);
      results.push({ testCase, result });

      // Add delay between tests
      if (i < testCases.length - 1) {
        console.log("⏳ Waiting 1 second...");
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    console.log(`\\n${"=".repeat(50)}`);
    console.log("📊 Test Results Summary:");
    results.forEach((test, index) => {
      const status = test.result.success ? "✅" : "❌";
      console.log(`${status} Test ${index + 1}: ${test.testCase.tagString}`);
      if (!test.result.success) {
        console.log(`   Error: ${test.result.error}`);
      }
    });

    const passed = results.filter((r) => r.result.success).length;
    console.log(`\\n🏁 Tests completed: ${passed}/${results.length} passed`);

    if (passed === results.length) {
      console.log("🎉 All metadata tests passed! Service is working correctly.");
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
    const apiUrl = process.env.METADATA_API_URL || "http://localhost:3000/api/metadata";
    const runner = new MetadataTestRunner(apiUrl);
    const results = await runner.runTests();

    // Exit with error code if any tests failed
    const allPassed = results.every((r) => r.result.success);
    process.exit(allPassed ? 0 : 1);
  } catch (error) {
    console.error("💥 Test runner failed:", error);
    console.error("\\n💡 Make sure the offchain-api server is running:");
    console.error("   cd apps/offchain-api && pnpm dev");
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

export { MetadataTestRunner };
