/**
 * Test Metadata Structure Validation
 *
 * This script tests if our metadata STRUCTURE is valid by using inline data URIs
 * instead of IPFS URIs that might be blocked by gateways.
 */

async function testMetadataStructure() {
  console.log("🔬 Testing Metadata Structure (bypassing IPFS gateway issues)");
  console.log("=============================================================\n");

  // Test 1: Our current metadata structure as inline data
  console.log("📋 Test 1: Our current metadata structure");
  const ourMetadata = {
    name: "TAG: TestTag",
    description: "Test TAG coin for validation",
    // Note: No image field - this might be the issue
  };

  const ourDataUri = `data:application/json,${encodeURIComponent(JSON.stringify(ourMetadata))}`;
  console.log("📄 Our structure:", JSON.stringify(ourMetadata, null, 2));

  // Test 2: Zora-compliant metadata structure
  console.log("\n📋 Test 2: Zora-compliant metadata structure");
  const zoraCompliantMetadata = {
    name: "TAG: TestTag",
    description: "Test TAG coin for validation",
    image:
      "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzMzNzNkYyIvPjx0ZXh0IHg9IjUwIiB5PSI1NSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+VEFHPC90ZXh0Pjwvc3ZnPg==", // Valid base64 SVG
  };

  const zoraDataUri = `data:application/json,${encodeURIComponent(JSON.stringify(zoraCompliantMetadata))}`;
  console.log("📄 Zora structure:", JSON.stringify(zoraCompliantMetadata, null, 2));

  // Test both with Zora SDK validation
  try {
    console.log("\n🔬 Testing Zora SDK validation...");
    const { validateMetadataURIContent } = await import("@zoralabs/coins-sdk");

    console.log("\n⚡ Testing our metadata structure:");
    try {
      await validateMetadataURIContent(ourDataUri as any);
      console.log("✅ Our metadata structure is VALID!");
    } catch (error: any) {
      console.log(`❌ Our metadata structure is INVALID: ${error.message}`);
    }

    console.log("\n⚡ Testing Zora-compliant metadata structure:");
    try {
      await validateMetadataURIContent(zoraDataUri as any);
      console.log("✅ Zora-compliant metadata structure is VALID!");
    } catch (error: any) {
      console.log(`❌ Zora-compliant metadata structure is INVALID: ${error.message}`);
    }
  } catch (importError: any) {
    console.log(`❌ Could not import Zora SDK validation: ${importError.message}`);
  }

  console.log("\n📊 CONCLUSION");
  console.log("==============");
  console.log("This test bypasses IPFS gateway issues by using data URIs.");
  console.log("If our metadata structure fails but Zora-compliant passes,");
  console.log("then the issue is missing required fields (likely 'image').");
  console.log("If both fail, there's a deeper SDK validation issue.");
}

// Run the test
testMetadataStructure().catch(console.error);
