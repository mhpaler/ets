/**
 * Complete Metadata Validation Test
 *
 * This script thoroughly validates our generated metadata using all Zora SDK validation functions:
 * 1. validateMetadataJSON - Validates the metadata structure
 * 2. validateMetadataURIContent - Validates the metadata URI accessibility
 * 3. validateMetadataURIContent - Validates the image URI accessibility
 */

import { validateMetadataJSON, validateMetadataURIContent } from "@zoralabs/coins-sdk";
import axios from "axios";

async function testCompleteValidation() {
  console.log("🧪 Complete Metadata Validation Test");
  console.log("====================================\n");

  // Step 1: Generate real metadata via our API
  console.log("📤 STEP 1: Generate Real Metadata");
  console.log("==================================");

  const testRequest = {
    tagString: "#ValidationTest",
    machineName: "validationtest",
    creator: "0x4de7c002be724ad63d5dca3f64126bbddb9fd735",
    relayer: "0x4de7c002be724ad63d5dca3f64126bbddb9fd735",
  };

  const response = await axios.post("http://localhost:4000/api/metadata/generate", testRequest, {
    headers: {
      "Content-Type": "application/json",
      "x-api-key": "local-dev-key",
    },
    timeout: 60000,
  });

  if (!response.data.success) {
    console.log("❌ Metadata generation failed:", response.data.error);
    return;
  }

  const metadataUri = response.data.metadataUri;
  const metadata = response.data.metadata;
  const imageUri = metadata.image;

  console.log("✅ Metadata generated successfully");
  console.log(`📍 Metadata URI: ${metadataUri}`);
  console.log(`🖼️  Image URI: ${imageUri}`);
  console.log("📄 Metadata structure:", JSON.stringify(metadata, null, 2));

  // Step 2: Validate metadata structure
  console.log("\n🔍 STEP 2: Validate Metadata Structure");
  console.log("======================================");

  try {
    const _structureResult = validateMetadataJSON(metadata);
    console.log("✅ Metadata structure validation PASSED");
    console.log("   - Has required fields: name, description, image");
    console.log("   - Field types are correct");
    console.log("   - Structure follows Zora specification");
  } catch (error: any) {
    console.log(`❌ Metadata structure validation FAILED: ${error.message}`);
    return;
  }

  // Step 3: Validate metadata URI accessibility
  console.log("\n🔍 STEP 3: Validate Metadata URI Accessibility");
  console.log("===============================================");

  try {
    const _metadataResult = await validateMetadataURIContent(metadataUri);
    console.log("✅ Metadata URI validation PASSED");
    console.log("   - URI is accessible via IPFS");
    console.log("   - Returns valid JSON content");
    console.log("   - JSON matches expected structure");
  } catch (error: any) {
    console.log(`❌ Metadata URI validation FAILED: ${error.message}`);
    return;
  }

  // Step 4: Validate image URI accessibility
  console.log("\n🔍 STEP 4: Validate Image URI Accessibility");
  console.log("===========================================");

  try {
    // Note: This should fail because validateMetadataURIContent expects JSON, not an image
    // But we'll test it to see what happens
    const _imageResult = await validateMetadataURIContent(imageUri);
    console.log("⚠️  Image URI validation PASSED (unexpected - images usually fail JSON validation)");
  } catch (error: any) {
    console.log(`✅ Image URI validation FAILED as expected: ${error.message}`);
    console.log("   - This is normal - validateMetadataURIContent expects JSON, not images");

    // Let's do a manual accessibility check instead
    console.log("\n🔄 Manual Image Accessibility Check:");
    try {
      const gateways = [
        "https://cloudflare-ipfs.com/ipfs/",
        "https://gateway.pinata.cloud/ipfs/",
        "https://ipfs.io/ipfs/",
      ];

      let imageAccessible = false;
      for (const gateway of gateways) {
        try {
          const imageUrl = imageUri.replace("ipfs://", gateway);
          const imageResponse = await axios.head(imageUrl, { timeout: 10000 });
          console.log(`   ✅ Image accessible via ${gateway}`);
          console.log(`   📋 Content-Type: ${imageResponse.headers["content-type"]}`);
          console.log(`   📏 Content-Length: ${imageResponse.headers["content-length"]} bytes`);
          imageAccessible = true;
          break;
        } catch (gatewayError: any) {
          console.log(`   ❌ Failed with ${gateway}: ${gatewayError.message}`);
        }
      }

      if (!imageAccessible) {
        console.log("   ❌ Image not accessible via any IPFS gateway");
        return;
      }
    } catch (manualError: any) {
      console.log(`   ❌ Manual image check failed: ${manualError.message}`);
      return;
    }
  }

  // Step 5: Final validation summary
  console.log("\n📊 FINAL VALIDATION SUMMARY");
  console.log("===========================");
  console.log("✅ Metadata generation: SUCCESS");
  console.log("✅ Metadata structure: VALID");
  console.log("✅ Metadata URI accessibility: PASSED");
  console.log("✅ Image URI accessibility: CONFIRMED");

  console.log("\n🎉 COMPLETE SUCCESS!");
  console.log("====================");
  console.log("Our metadata API generates fully valid, Zora-compliant metadata with:");
  console.log("- Proper JSON structure with all required fields");
  console.log("- Accessible IPFS metadata URI");
  console.log("- Accessible IPFS image URI");
  console.log("- Full compatibility with Zora SDK validation");

  console.log("\n💡 Ready to use in ZoraService:");
  console.log(`   Metadata URI: ${metadataUri}`);
  console.log(`   Image URI: ${imageUri}`);

  return {
    metadataUri,
    imageUri,
    metadata,
    valid: true,
  };
}

// Run the complete validation test
testCompleteValidation().catch(console.error);
