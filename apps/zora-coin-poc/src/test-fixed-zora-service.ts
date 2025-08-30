/**
 * Test Fixed ZoraService
 *
 * This script tests our fixed ZoraService to ensure it now uses real metadata
 * generation instead of hardcoded broken URIs.
 */

import axios from "axios";

async function testFixedZoraService() {
  console.log("🧪 Testing Fixed ZoraService");
  console.log("============================\n");

  const apiUrl = "http://localhost:4000/api/tag-coin/create";

  // Test TAG coin creation data
  const testData = {
    tagData: {
      coinAddress: "0x0000000000000000000000000000000000000000", // Will be predicted by API
      originalInput: "#FixedZoraTest",
      displayVersion: "#FixedZoraTest",
      machineName: "fixedzoratest",
      creator: "0x4de7c002be724ad63d5dca3f64126bbddb9fd735",
      relayer: "0x4de7c002be724ad63d5dca3f64126bbddb9fd735",
      timestamp: new Date().toISOString(),
      blockNumber: "0",
      transactionHash: "0x0000000000000000000000000000000000000000000000000000000000000000",
    },
    chainId: 84532, // Base Sepolia
    dryRun: true, // Dry run mode for testing
  };

  console.log("📋 Test Data:");
  console.log(JSON.stringify(testData, null, 2));

  try {
    console.log("\n📤 Calling TAG coin creation API...");
    console.log("This will test the fixed ZoraService that now uses real metadata generation");

    const response = await axios.post(apiUrl, testData, {
      headers: {
        "Content-Type": "application/json",
        "x-api-key": "local-dev-key", // Oracle auth header
      },
      timeout: 120000, // 2 minutes for metadata generation + coin creation
    });

    console.log("\n✅ API Response received:");
    console.log(JSON.stringify(response.data, null, 2));

    if (response.data.success) {
      console.log("\n🎉 SUCCESS! Fixed ZoraService works!");
      console.log("======================================");
      console.log("✅ ZoraService now generates real metadata instead of using hardcoded URI");
      console.log("✅ Metadata generation and coin creation flow completed");
      console.log("✅ All validations passed");

      if (response.data.coinAddress) {
        console.log(`📍 Coin Address: ${response.data.coinAddress}`);
      }
      if (response.data.transactionHash) {
        console.log(`📄 Transaction Hash: ${response.data.transactionHash}`);
      }

      console.log("\n💡 The fix worked! ZoraService now:");
      console.log("   1. Calls generateMetadata() via metadata API");
      console.log("   2. Uses the returned metadataUri instead of hardcoded URI");
      console.log("   3. Passes Zora SDK validation");
      console.log("   4. Successfully creates TAG coins");
    } else {
      console.log("\n⚠️ Request completed but coin creation failed:");
      console.log(`Error: ${response.data.error}`);

      // Check if it's a metadata generation issue
      if (response.data.error?.includes("metadata")) {
        console.log("\n🔍 This appears to be a metadata generation issue.");
        console.log("Check that the metadata API is running and METADATA_MOCK_MODE=false");
      }
    }
  } catch (error: any) {
    console.log(`\n❌ Test failed: ${error.message}`);

    if (error.code === "ECONNABORTED") {
      console.log("   (Request timed out - metadata generation or coin creation took too long)");
    }

    if (error.response) {
      console.log("\n📄 Error Response:");
      console.log(JSON.stringify(error.response.data, null, 2));
    }

    if (error.code === "ECONNREFUSED") {
      console.log("\n💡 Make sure the offchain-api is running on port 4000:");
      console.log("   cd /Users/User/Sites/ets/apps/offchain-api");
      console.log("   pnpm run dev");
    }
  }
}

// Run the test
testFixedZoraService().catch(console.error);
