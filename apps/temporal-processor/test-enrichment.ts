/**
 * Simple test script for target enrichment workflow
 *
 * Usage: npx tsx test-enrichment.ts
 */

import { fetchTargetMetadata } from "./src/activities/targetEnrichmentActivities";

async function testEnrichment() {
  console.log("Testing target enrichment with various URLs...\n");

  const testCases = [
    {
      targetId: "123",
      targetURI: "https://github.com/ethereum-tag-service/ets",
    },
    {
      targetId: "456",
      targetURI: "https://www.google.com",
    },
    {
      targetId: "789",
      targetURI: "https://ethereum.org",
    },
  ];

  for (const testCase of testCases) {
    console.log(`\n=== Testing: ${testCase.targetURI} ===`);

    try {
      const result = await fetchTargetMetadata(testCase);

      if (result.status === "success") {
        console.log("✅ Success!");
        console.log("  Title:", result.title);
        console.log("  Description:", `${result.description?.substring(0, 100)}...`);
        console.log("  Image:", result.image);
        console.log("  Keywords:", result.keywords?.join(", "));
        console.log("  Type:", result.targetType);
      } else {
        console.log("❌ Failed:", result.error);
      }
    } catch (error) {
      console.log("❌ Error:", error);
    }
  }
}

// Run the test
testEnrichment().catch(console.error);
