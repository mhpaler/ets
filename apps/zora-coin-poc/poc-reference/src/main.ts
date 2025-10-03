/**
 * Zora Content Coin Creation POC - Main Entry Point
 *
 * This script demonstrates programmatic creation of Zora content coins
 * using Coinbase Smart Wallet dual-owner architecture.
 *
 * The POC validates that we can:
 * 1. Create UserOperations for coin deployment
 * 2. Sign with either EOA or Privy wallet private key
 * 3. (Future) Submit through bundler and create actual coins
 *
 * Usage:
 *   pnpm dev                    # Run full demo
 *   pnpm test:eoa              # Test EOA signing only
 *   pnpm test:privy            # Test Privy signing only
 */

import { config } from "./config.js";
import { SmartWalletClient } from "./smartWalletClient.js";
import type { TestResult } from "./types.js";

async function main() {
  console.log("🚀 Zora Content Coin Creation POC");
  console.log("==================================\n");

  try {
    // Initialize the smart wallet client
    const client = new SmartWalletClient(config);

    // Create coin parameters with generated metadata
    const coinParams = await client.createCoinParamsWithMetadata();

    console.log("📋 Coin Parameters:");
    console.log(`   Name: ${coinParams.name}`);
    console.log(`   Symbol: ${coinParams.symbol}`);
    console.log(`   URI: ${coinParams.uri}`);
    console.log(`   Payout Recipient: ${coinParams.payoutRecipient}`);
    console.log(`   Platform Referrer: ${coinParams.platformReferrer}\n`);

    // Build the UserOperation
    console.log("🔨 Building UserOperation...");
    const userOp = await client.buildDeployUserOp(coinParams);

    console.log(`   Sender: ${userOp.sender}`);
    console.log(`   Nonce: ${userOp.nonce}`);
    console.log(`   Call Gas Limit: ${userOp.callGasLimit}`);
    console.log(`   Verification Gas Limit: ${userOp.verificationGasLimit}`);
    console.log(`   Max Fee Per Gas: ${userOp.maxFeePerGas}`);
    console.log(`   Max Priority Fee Per Gas: ${userOp.maxPriorityFeePerGas}\n`);

    const results: TestResult[] = [];

    // Test EOA signing
    console.log("🔐 Testing EOA Signing...");
    try {
      const signedUserOpEOA = await client.signUserOpWithEOA(userOp);
      console.log(`   ✅ EOA Signature: ${signedUserOpEOA.signature.slice(0, 20)}...`);
      results.push({
        signer: "eoa",
        success: true,
        // In a real implementation, we would submit to bundler here
      });
    } catch (error) {
      console.log(`   ❌ EOA Signing failed: ${error}`);
      results.push({
        signer: "eoa",
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }

    // Test Privy signing
    console.log("\n🔐 Testing Privy Signing...");
    try {
      const signedUserOpPrivy = await client.signUserOpWithPrivy(userOp);
      console.log(`   ✅ Privy Signature: ${signedUserOpPrivy.signature.slice(0, 20)}...`);
      results.push({
        signer: "privy",
        success: true,
        // In a real implementation, we would submit to bundler here
      });
    } catch (error) {
      console.log(`   ❌ Privy Signing failed: ${error}`);
      results.push({
        signer: "privy",
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }

    // Summary
    console.log("\n📊 Results Summary:");
    console.log("===================");

    const successCount = results.filter((r) => r.success).length;
    const totalTests = results.length;

    for (const result of results) {
      const status = result.success ? "✅ PASS" : "❌ FAIL";
      const signer = result.signer.toUpperCase();
      console.log(`   ${signer} Signing: ${status}`);

      if (!result.success && result.error) {
        console.log(`     Error: ${result.error}`);
      }
    }

    console.log(`\n🎯 Overall: ${successCount}/${totalTests} tests passed\n`);

    if (successCount === totalTests) {
      console.log("🎉 POC Complete! Both signing methods work.");
      console.log("🚀 Ready for bundler integration and real coin deployment.");
    } else {
      console.log("⚠️  Some tests failed. Check your private keys and configuration.");
      process.exit(1);
    }
  } catch (error) {
    console.error("💥 Fatal error:", error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on("SIGINT", () => {
  console.log("\n👋 Shutting down gracefully...");
  process.exit(0);
});

// Run the main function
if (require.main === module) {
  main().catch(console.error);
}
