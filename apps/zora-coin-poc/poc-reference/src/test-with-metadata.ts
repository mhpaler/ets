/**
 * Test Complete Flow with Metadata Generation
 *
 * This script tests the full workflow:
 * 1. Generate metadata via offchain-api
 * 2. Create UserOperation with generated metadata
 * 3. Sign with both EOA and Privy wallets
 *
 * Requires the offchain-api to be running on localhost:4000
 */

import { config } from "./config.js";
import { SmartWalletClient } from "./smartWalletClient.js";

async function testWithMetadata() {
  console.log("🎨 Testing Complete Flow with Metadata Generation");
  console.log("=================================================\n");

  try {
    const client = new SmartWalletClient(config);

    // Test metadata generation first
    console.log("🔍 Checking offchain-api availability...");
    const isApiHealthy = await client.metadataClient.checkHealth();

    if (!isApiHealthy) {
      console.warn("⚠️  Offchain-api not available at", config.offchainApiUrl);
      console.log("💡 Make sure the offchain-api is running:");
      console.log("   cd ../offchain-api && pnpm dev\n");
    } else {
      console.log("✅ Offchain-api is healthy\n");
    }

    // Generate coin parameters with metadata
    console.log("🎨 Generating metadata and coin parameters...");
    const coinParams = await client.createCoinParamsWithMetadata();

    console.log("\n📋 Generated Coin Parameters:");
    console.log(`   Name: ${coinParams.name}`);
    console.log(`   Symbol: ${coinParams.symbol}`);
    console.log(`   URI: ${coinParams.uri}`);
    console.log(`   Payout Recipient: ${coinParams.payoutRecipient}`);
    console.log(`   Platform Referrer: ${coinParams.platformReferrer}`);
    console.log(`   Coin Salt: ${coinParams.coinSalt}\n`);

    // Build UserOperation
    console.log("🔨 Building UserOperation with generated metadata...");
    const userOp = await client.buildDeployUserOp(coinParams);

    console.log(`   Sender: ${userOp.sender}`);
    console.log(`   Nonce: ${userOp.nonce}`);
    console.log(`   Call Gas Limit: ${userOp.callGasLimit}`);
    console.log(`   Max Fee Per Gas: ${userOp.maxFeePerGas}\n`);

    // Test signing with both methods
    let eoaSuccess = false;
    let privySuccess = false;

    console.log("🔐 Testing EOA Signing...");
    try {
      const signedUserOpEOA = await client.signUserOpWithEOA(userOp);
      console.log(`   ✅ EOA Signature: ${signedUserOpEOA.signature.slice(0, 20)}...`);
      eoaSuccess = true;
    } catch (error) {
      console.log(`   ❌ EOA Signing failed: ${error}`);
    }

    console.log("\n🔐 Testing Privy Signing...");
    try {
      const signedUserOpPrivy = await client.signUserOpWithPrivy(userOp);
      console.log(`   ✅ Privy Signature: ${signedUserOpPrivy.signature.slice(0, 20)}...`);
      privySuccess = true;
    } catch (error) {
      console.log(`   ❌ Privy Signing failed: ${error}`);
    }

    // Summary
    console.log("\n🎯 Test Results:");
    console.log("================");
    console.log(`   Metadata Generation: ${isApiHealthy ? "✅ PASS" : "⚠️  FALLBACK"}`);
    console.log(`   EOA Signing: ${eoaSuccess ? "✅ PASS" : "❌ FAIL"}`);
    console.log(`   Privy Signing: ${privySuccess ? "✅ PASS" : "❌ FAIL"}\n`);

    if (isApiHealthy && eoaSuccess && privySuccess) {
      console.log("🎉 Complete flow test PASSED!");
      console.log("🚀 Ready for bundler integration and real coin deployment.");
    } else {
      console.log("⚠️  Some components need attention:");
      if (!isApiHealthy) console.log("   - Start the offchain-api service");
      if (!eoaSuccess) console.log("   - Check EOA private key configuration");
      if (!privySuccess) console.log("   - Check Privy private key configuration");
    }
  } catch (error) {
    console.error("💥 Test failed:", error);
    process.exit(1);
  }
}

testWithMetadata().catch(console.error);
