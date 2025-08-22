/**
 * Test script for target enrichment functionality
 * Run with: bun src/test-target-enrichment.ts
 */

import { targetEnrichmentClient } from "./clients/targetEnrichmentClient";
import { etsTargetAbi, viemClient } from "./clients/viemClient";
import { config } from "./config";

async function testTargetEnrichment() {
  console.log("🧪 Testing Target Enrichment Service");
  console.log("====================================");
  console.log(`Environment: ${config.environment}`);
  console.log(`Chain ID: ${config.chainId}`);
  console.log(`ETS Target Address: ${config.etsTargetAddress}`);
  console.log(`Off-chain API URL: ${config.offchainApiUrl}`);
  console.log("");

  // Test 1: Health check
  console.log("1. Testing health check...");
  const isHealthy = await targetEnrichmentClient.healthCheck();
  console.log(`   Result: ${isHealthy ? "✅ Healthy" : "❌ Unhealthy"}`);
  console.log("");

  // Test 2: Check if we can read from the target contract
  console.log("2. Testing contract read access...");
  try {
    // Try to read a target that might not exist
    const testTargetId = BigInt("1234567890");
    const targetData = await viemClient.readContract({
      address: config.etsTargetAddress as `0x${string}`,
      abi: etsTargetAbi,
      functionName: "getTargetById",
      args: [testTargetId],
    });

    console.log(`   Target data for ID ${testTargetId}:`, targetData);
    console.log("   ✅ Contract read access works");
  } catch (error) {
    console.log(
      "   📝 Contract read test (expected for non-existent target):",
      error instanceof Error ? error.message : "Unknown error",
    );
  }
  console.log("");

  // Test 3: Check write access if wallet is available
  console.log("3. Testing wallet availability...");
  if (viemClient.writeContract) {
    console.log("   ✅ Wallet client available for contract writes");
  } else {
    console.log("   ⚠️  No wallet client - add PRIVATE_KEY to .env for write operations");
  }
  console.log("");

  // Test 4: Test enrichment call (if offchain API is available)
  if (isHealthy) {
    console.log("4. Testing target enrichment (mock call)...");
    try {
      // This will likely fail with a target not found error, which is expected
      const mockTargetId = "999999999";
      const result = await targetEnrichmentClient.enrichTarget(mockTargetId, config.chainId);
      console.log("   Result:", result);
    } catch (error) {
      console.log(
        "   📝 Enrichment test (expected for non-existent target):",
        error instanceof Error ? error.message : "Unknown error",
      );
    }
  } else {
    console.log("4. Skipping enrichment test - API not healthy");
  }
  console.log("");

  console.log("🏁 Test completed");
}

// Run the test
testTargetEnrichment().catch(console.error);
