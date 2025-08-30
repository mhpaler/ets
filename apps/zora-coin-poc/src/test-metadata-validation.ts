/**
 * Test Metadata Validation
 *
 * This script tests metadata validation independently to eliminate it as a culprit
 * for the Zora SDK createCoin failures.
 */

import axios from "axios";

// Test various metadata URIs to see which ones pass validation
const testMetadataUris = [
  // Our current hardcoded URI (likely missing required fields)
  "ipfs://bafkreih2ac5yabo2daerkw5w5wcwdc7rveqejf4l645hx2px26r5fxfnpe",

  // Known good Zora metadata URI (from docs example)
  "ipfs://bafkreifch6stfh3fn3nqv5tpxnknjpo7zulqav55f2b5pryadx6hldldwe",

  // Try generating fresh metadata from our API
  "GENERATE_FRESH", // Special marker to generate new metadata

  // Create minimal valid metadata inline
  "CREATE_MINIMAL", // Special marker to create valid metadata
];

async function testMetadataUri(uri: string): Promise<boolean> {
  try {
    console.log(`\n🔍 Testing metadata URI: ${uri}`);

    let actualUri = uri;

    if (uri === "GENERATE_FRESH") {
      console.log("📡 Generating fresh metadata from our API...");
      const response = await axios.post(
        "http://localhost:4000/api/metadata/generate",
        {
          tagString: "#MetadataTest",
          machineName: "metadatatest",
          creator: "0x4de7c002be724ad63d5dca3f64126bbddb9fd735",
          relayer: "0x4de7c002be724ad63d5dca3f64126bbddb9fd735",
        },
        {
          headers: {
            "x-api-key": "local-dev-key",
            "Content-Type": "application/json",
          },
        },
      );

      if (response.data.success) {
        actualUri = response.data.metadataUri;
        console.log(`✅ Generated URI: ${actualUri}`);
      } else {
        console.log(`❌ Failed to generate: ${response.data.error}`);
        return false;
      }
    }

    if (uri === "CREATE_MINIMAL") {
      console.log("🔨 Creating minimal valid metadata...");
      // This would normally be uploaded to IPFS, but for testing we'll use a known URI
      // that contains exactly the required fields according to the docs
      const minimalMetadata = {
        name: "TAG: Test",
        description: "Test TAG coin for validation",
        image: "ipfs://bafkreifch6stfh3fn3nqv5tpxnknjpo7zulqav55f2b5pryadx6hldldwe", // Valid image URI
      };
      console.log("📋 Minimal metadata structure:", JSON.stringify(minimalMetadata, null, 2));

      // For now, use the example URI from the docs that should have this structure
      actualUri = "ipfs://bafkreifch6stfh3fn3nqv5tpxnknjpo7zulqav55f2b5pryadx6hldldwe";
      console.log(`📍 Using example URI for validation: ${actualUri}`);
    }

    // Test 1: Check if URI is reachable
    console.log("📥 Fetching metadata content...");
    // Try multiple IPFS gateways in case one is blocked
    const gateways = [
      "https://cloudflare-ipfs.com/ipfs/",
      "https://gateway.pinata.cloud/ipfs/",
      "https://ipfs.io/ipfs/",
      "https://gateway.ipfs.io/ipfs/",
    ];

    let metadataResponse: any;
    for (const gateway of gateways) {
      try {
        const url = actualUri.replace("ipfs://", gateway);
        console.log(`   Trying gateway: ${gateway}`);
        metadataResponse = await axios.get(url, { timeout: 10000 });
        console.log(`   ✅ Success with gateway: ${gateway}`);
        break;
      } catch (gatewayError: any) {
        console.log(`   ❌ Failed with ${gateway}: ${gatewayError.message}`);
        if (gateway === gateways[gateways.length - 1]) {
          throw new Error(`All IPFS gateways failed for URI: ${actualUri}`);
        }
      }
    }

    console.log("✅ Metadata fetchable");
    console.log("📄 Content preview:", `${JSON.stringify(metadataResponse.data, null, 2).slice(0, 200)}...`);

    // Test 2: Check if it has required fields according to Zora docs
    const metadata = metadataResponse.data;
    const requiredFields = ["name", "description", "image"];
    const missingFields = requiredFields.filter((field) => !metadata[field]);

    if (missingFields.length > 0) {
      console.log(`⚠️  Missing required fields: ${missingFields.join(", ")}`);
    } else {
      console.log("✅ Has required fields");
    }

    // Test 3: Try Zora SDK validation (if we can import it)
    try {
      const { validateMetadataURIContent } = await import("@zoralabs/coins-sdk/src/metadata");
      console.log("🔬 Testing Zora SDK validation...");

      await validateMetadataURIContent(actualUri as any);
      console.log("✅ Zora SDK validation passed!");
      return true;
    } catch (sdkError: any) {
      console.log(`❌ Zora SDK validation failed: ${sdkError.message}`);
      return false;
    }
  } catch (error: any) {
    console.log(`❌ Error testing URI: ${error.message}`);
    if (error.code === "ECONNABORTED") {
      console.log("   (Request timed out - IPFS gateway might be slow)");
    }
    return false;
  }
}

async function runMetadataValidationTests() {
  console.log("🧪 Starting Metadata Validation Tests");
  console.log("=====================================\n");

  const results: { uri: string; passed: boolean }[] = [];

  for (const uri of testMetadataUris) {
    const passed = await testMetadataUri(uri);
    results.push({ uri: uri === "GENERATE_FRESH" ? "FRESH_GENERATED" : uri, passed });
  }

  console.log("\n📊 SUMMARY");
  console.log("==========");
  for (const { uri, passed } of results) {
    console.log(`${passed ? "✅" : "❌"} ${uri}`);
  }

  const validUris = results.filter((r) => r.passed);
  if (validUris.length > 0) {
    console.log(`\n🎉 Found ${validUris.length} valid metadata URI(s)!`);
    console.log("Use any of these in the ZoraService for guaranteed success.");
  } else {
    console.log("\n⚠️  No valid metadata URIs found. This IS the culprit!");
    console.log("We need to fix the metadata generation or find a known-good URI.");
  }
}

// Run the tests
runMetadataValidationTests().catch(console.error);
