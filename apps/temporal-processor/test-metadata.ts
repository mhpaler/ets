#!/usr/bin/env tsx

/**
 * Test script for metadata extraction
 * Run with: tsx test-metadata.ts
 */

import { MetadataExtractor } from "./src/services/MetadataExtractor";

const testUrls = [
  // Valid URLs with good metadata
  "https://github.com/ethereum/go-ethereum",
  "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "https://en.wikipedia.org/wiki/Ethereum",

  // Social posts
  "https://twitter.com/VitalikButerin/status/1234567890",

  // Edge cases
  "https://example.com",
  "https://httpstat.us/404", // Returns 404
  "https://httpstat.us/500", // Returns 500

  // Direct files
  "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
];

async function testMetadataExtraction() {
  const extractor = new MetadataExtractor();

  console.log("🧪 Testing Metadata Extraction\n");
  console.log("=".repeat(80));

  for (const url of testUrls) {
    console.log(`\n📍 Testing: ${url}`);
    console.log("-".repeat(80));

    try {
      const metadata = await extractor.extract(url);

      // Display core fields
      console.log("✅ Success!");
      console.log("📋 Core Metadata:");
      console.log(`  Title: ${metadata.core.title}`);
      console.log(`  Description: ${metadata.core.description?.substring(0, 100)}...`);
      console.log(`  Image: ${metadata.core.image || "none"}`);
      console.log(`  HTTP Status: ${metadata.core.httpStatus}`);
      console.log(`  Content Type: ${metadata.core.contentType}`);
      console.log(`  Extraction Method: ${metadata.core.extractionMethod}`);

      // Display classification
      console.log("🏷️  Classification:");
      console.log(`  Type: ${metadata.type}`);
      console.log(`  Platform: ${metadata.platform || "none"}`);

      // Display keywords if any
      if (metadata.keywords && metadata.keywords.length > 0) {
        console.log(`  Keywords: ${metadata.keywords.join(", ")}`);
      }

      // Display extensions if any
      if (metadata.extensions) {
        console.log("🔧 Extensions:");
        if (metadata.extensions.creator) {
          console.log(`  Creator: ${metadata.extensions.creator.name}`);
        }
        if (metadata.extensions.dates) {
          console.log(`  Published: ${metadata.extensions.dates.published}`);
        }
        if (metadata.extensions.media) {
          console.log(`  Media: ${JSON.stringify(metadata.extensions.media)}`);
        }
      }
    } catch (error) {
      console.log("❌ Error:", error instanceof Error ? error.message : error);
    }
  }

  console.log(`\n${"=".repeat(80)}`);
  console.log("✅ Testing complete!");
}

// Run the test
testMetadataExtraction().catch(console.error);
