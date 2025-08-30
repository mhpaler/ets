/**
 * Test EOA Signing Only
 *
 * This script tests only the EOA signing functionality
 * for UserOperation creation.
 */

import { config } from "./config.js";
import { SmartWalletClient } from "./smartWalletClient.js";

async function testEOASigning() {
  console.log("🔐 Testing EOA Signing Only");
  console.log("=============================\n");

  try {
    const client = new SmartWalletClient(config);
    const coinParams = client.createDefaultCoinParams();

    console.log("📋 Building UserOperation...");
    const userOp = await client.buildDeployUserOp(coinParams);

    console.log("🔐 Signing with EOA...");
    const signedUserOp = await client.signUserOpWithEOA(userOp);

    console.log("✅ Success!");
    console.log(`   Sender: ${signedUserOp.sender}`);
    console.log(`   Nonce: ${signedUserOp.nonce}`);
    console.log(`   Signature: ${signedUserOp.signature.slice(0, 20)}...${signedUserOp.signature.slice(-10)}`);
    console.log(`   Signature Length: ${signedUserOp.signature.length} characters\n`);

    console.log("🎉 EOA signing test completed successfully!");
  } catch (error) {
    console.error("❌ EOA signing test failed:", error);
    process.exit(1);
  }
}

testEOASigning().catch(console.error);
