/**
 * Test Real Metadata API Generation
 *
 * This script tests our metadata API in REAL mode (not mock) to generate
 * actual IPFS metadata using the Zora Metadata Builder.
 */

import { validateMetadataJSON, validateMetadataURIContent } from "@zoralabs/coins-sdk";
import axios from "axios";

async function testRealMetadataGeneration() {
  console.log("🧪 Testing Real Metadata API Generation");
  console.log("======================================\n");

  const apiUrl = "http://localhost:4000/api/metadata/generate";

  // Test request data
  const testRequest = {
    tagString: "#ZoraTestReal",
    machineName: "zoratestreal",
    creator: "0x4de7c002be724ad63d5dca3f64126bbddb9fd735",
    relayer: "0x4de7c002be724ad63d5dca3f64126bbddb9fd735",
  };

  console.log("📋 Test Request:");
  console.log(JSON.stringify(testRequest, null, 2));

  try {
    // Step 1: Call the metadata API
    console.log("\n📤 Calling metadata API...");
    const response = await axios.post(apiUrl, testRequest, {
      headers: {
        "Content-Type": "application/json",
        "x-api-key": "local-dev-key",
      },
      timeout: 60000, // 60 seconds for IPFS uploads
    });

    console.log("✅ API Response received");
    console.log("📄 Response:", JSON.stringify(response.data, null, 2));

    if (!response.data.success) {
      console.log("❌ API returned failure:", response.data.error);
      return;
    }

    const metadataUri = response.data.metadataUri;
    const metadata = response.data.metadata;

    // Step 2: Validate the metadata structure
    console.log("\n🔍 STEP 2: Validating Metadata Structure");
    console.log("==========================================");

    try {
      const _structureResult = validateMetadataJSON(metadata);
      console.log("✅ Metadata structure is VALID");
    } catch (error: any) {
      console.log(`❌ Metadata structure is INVALID: ${error.message}`);
      return;
    }

    // Step 3: Validate the URI accessibility
    console.log("\n🔍 STEP 3: Validating URI Accessibility");
    console.log("=======================================");
    console.log(`Testing URI: ${metadataUri}`);

    try {
      const _uriResult = await validateMetadataURIContent(metadataUri);
      console.log("✅ URI validation PASSED - metadata is accessible and valid");
    } catch (error: any) {
      console.log(`❌ URI validation FAILED: ${error.message}`);
      return;
    }

    // Step 4: Success!
    console.log("\n🎉 SUCCESS! Real metadata generation works!");
    console.log("============================================");
    console.log(`✅ Generated valid metadata URI: ${metadataUri}`);
    console.log("✅ Structure validation passed");
    console.log("✅ URI accessibility validation passed");
    console.log("\n💡 This URI can be used in ZoraService for real coin creation!");

    return metadataUri;
  } catch (error: any) {
    console.log(`❌ Test failed: ${error.message}`);

    if (error.code === "ECONNABORTED") {
      console.log("   (Request timed out - IPFS upload might be slow)");
    }

    if (error.response) {
      console.log("📄 Error response:", JSON.stringify(error.response.data, null, 2));
    }
  }
}

// Run the test
testRealMetadataGeneration().catch(console.error);
