/**
 * Test Metadata Validation
 *
 * This script tests both metadata structure and URI accessibility using Zora SDK functions:
 * - validateMetadataJSON: Tests the metadata object structure
 * - validateMetadataURIContent: Tests URI accessibility and content validity
 */

import { validateMetadataJSON, validateMetadataURIContent } from "@zoralabs/coins-sdk";

// Our current metadata structure (what we're sending to Zora)
const ourCurrentMetadata = {
  name: "TAG: TestTag",
  description: "Test TAG coin for validation",
  // Missing: image field
};

// Fixed metadata structure with required image field
const fixedMetadata = {
  name: "TAG: TestTag",
  description: "Test TAG coin for validation",
  image: "ipfs://bafybeibl2m5jkpgyxatad6rhc5yncrh2wi2tgqgnsngflqbzpni5ogaxve", // Valid image hash
};

// Test URIs
const testUris = [
  // Our current hardcoded URI
  "ipfs://bafkreih2ac5yabo2daerkw5w5wcwdc7rveqejf4l645hx2px26r5fxfnpe",

  // Known good image URI
  "ipfs://bafybeibl2m5jkpgyxatad6rhc5yncrh2wi2tgqgnsngflqbzpni5ogaxve",
];

async function testMetadataStructure() {
  console.log("🧪 PART 1: Testing Metadata Structure (validateMetadataJSON)");
  console.log("===========================================================\n");

  // Test 1: Our current metadata (missing image)
  console.log("📋 Test 1: Our current metadata structure");
  console.log(JSON.stringify(ourCurrentMetadata, null, 2));

  try {
    const _result1 = validateMetadataJSON(ourCurrentMetadata);
    console.log("✅ Our current metadata structure is VALID");
  } catch (error: any) {
    console.log(`❌ Our current metadata structure is INVALID: ${error.message}`);
  }

  // Test 2: Fixed metadata (with image)
  console.log("\n📋 Test 2: Fixed metadata structure (with image)");
  console.log(JSON.stringify(fixedMetadata, null, 2));

  try {
    const _result2 = validateMetadataJSON(fixedMetadata);
    console.log("✅ Fixed metadata structure is VALID");
  } catch (error: any) {
    console.log(`❌ Fixed metadata structure is INVALID: ${error.message}`);
  }
}

async function testMetadataUris() {
  console.log("\n🧪 PART 2: Testing Metadata URI Accessibility (validateMetadataURIContent)");
  console.log("=============================================================================\n");

  for (const uri of testUris) {
    console.log(`🔍 Testing URI: ${uri}`);

    try {
      const _result = await validateMetadataURIContent(uri);
      console.log("✅ URI validation PASSED - metadata is accessible and valid");
    } catch (error: any) {
      console.log(`❌ URI validation FAILED: ${error.message}`);
    }
    console.log("");
  }
}

async function runMetadataValidationTests() {
  console.log("🧪 Complete Metadata Validation Test");
  console.log("====================================\n");

  try {
    // Test metadata structure first
    await testMetadataStructure();

    // Then test URI accessibility
    await testMetadataUris();

    console.log("📊 SUMMARY");
    console.log("==========");
    console.log("This test isolates two potential issues:");
    console.log("1. Metadata structure (missing required fields)");
    console.log("2. URI accessibility (IPFS gateway issues)");
    console.log("\nIf structure tests fail but URI tests pass, fix the metadata structure.");
    console.log("If structure tests pass but URI tests fail, fix IPFS accessibility.");
    console.log("If both fail, fix both issues.");
  } catch (error: any) {
    console.log(`❌ Test suite failed: ${error.message}`);
  }
}

// Run the tests
runMetadataValidationTests().catch(console.error);
