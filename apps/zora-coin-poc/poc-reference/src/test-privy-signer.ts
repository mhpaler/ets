/**
 * Test Privy Signing Only
 *
 * This script tests only the Privy wallet signing functionality
 * for UserOperation creation.
 */

import { config } from "./config.js";
import { SmartWalletClient } from "./smartWalletClient.js";

async function testPrivySigning() {
  console.log("🔐 Testing Privy Signing Only");
  console.log("==============================\n");

  try {
    const client = new SmartWalletClient(config);
    const coinParams = client.createDefaultCoinParams();

    console.log("📋 Building UserOperation...");
    const userOp = await client.buildDeployUserOp(coinParams);

    console.log("🔐 Signing with Privy wallet...");
    const signedUserOp = await client.signUserOpWithPrivy(userOp);

    console.log("✅ Success!");
    console.log(`   Sender: ${signedUserOp.sender}`);
    console.log(`   Nonce: ${signedUserOp.nonce}`);
    console.log(`   Signature: ${signedUserOp.signature.slice(0, 20)}...${signedUserOp.signature.slice(-10)}`);
    console.log(`   Signature Length: ${signedUserOp.signature.length} characters\n`);

    console.log("🎉 Privy signing test completed successfully!");
  } catch (error) {
    console.error("❌ Privy signing test failed:", error);
    process.exit(1);
  }
}

testPrivySigning().catch(console.error);
