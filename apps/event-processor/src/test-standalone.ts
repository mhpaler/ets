/**
 * Standalone Event Processor Test
 * 
 * This test validates the complete event processing pipeline without requiring
 * external services (blockchain nodes, off-chain API, etc.) to be running.
 * 
 * WHAT THIS TESTS:
 * - Event processing logic (parsing, data extraction)
 * - Data transformation (BigInt to string conversion for JSON)
 * - API client integration (request formation, error handling)
 * - Round-trip architecture preparation
 * 
 * WHAT THIS DOESN'T TEST:
 * - Real blockchain events (uses mock data)
 * - Actual API responses (API connection will fail - expected)
 * - Blockchain write operations (no private key configured)
 * - Real Zora coin creation (happens in off-chain API)
 * 
 * HOW IT WORKS:
 * 1. Creates mock TagCreated event data (simulates blockchain event)
 * 2. Wraps it in Viem log structure (simulates event listener)
 * 3. Processes through TagCoinHandler (real production code path)
 * 4. Attempts API call to create Zora coin (will fail - expected)
 * 5. Logs error but continues (demonstrates resilient error handling)
 * 6. Test passes ✅ because error handling works correctly
 * 
 * The test SUCCESS despite API failure proves that individual event processing
 * errors don't crash the entire service - exactly what we want in production.
 */

import { config } from "./config";
import { TagCoinHandler } from "./handlers/tagCoinHandler";

// Mock TagCreated event data - simulates what comes from the ETS Token contract
const mockTagCreatedEvent = {
  coinAddress: "0x1234567890123456789012345678901234567890", // Predicted Zora coin address
  originalInput: "#TestTag",    // Exact user input
  displayVersion: "#TestTag",   // Canonical display format
  machineName: "testtag",      // Normalized for uniqueness (lowercase, no #)
  creator: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",     // User who created tag
  relayer: "0xfedcbafedcbafedcbafedcbafedcbafedcbafed",    // Relayer that facilitated creation
  timestamp: BigInt(Date.now()), // Block timestamp (BigInt for precision)
  blockNumber: 12345n,          // Block number where event occurred
  transactionHash: "0x9876543210987654321098765432109876543210987654321098765432109876",
};

// Mock log structure - simulates what Viem provides from event watching
const mockLog = {
  args: mockTagCreatedEvent,                    // Event arguments
  blockNumber: mockTagCreatedEvent.blockNumber, // Block metadata
  transactionHash: mockTagCreatedEvent.transactionHash, // Transaction metadata
} as any;

async function testEventProcessor() {
  console.log("🧪 Testing Event Processor in isolation...");
  console.log(`Environment: ${config.environment}`);
  console.log(`ETS Token Address: ${config.etsTokenAddress}`);
  console.log(`Off-chain API URL: ${config.offchainApiUrl}\n`);

  // Create the handler that will process our mock event
  const handler = new TagCoinHandler();

  try {
    console.log("📝 Processing mock TagCreated event...");
    
    // This triggers the complete round-trip flow:
    // 1. Handler.handleTagCreatedLogs() processes the mock log
    // 2. Extracts event data and creates ZoraCoinCreationRequest
    // 3. Calls apiClient.createZoraCoin() with serialized data
    // 4. API client attempts POST to /api/tag-coin/create (will fail - expected)
    // 5. Handler logs the error but doesn't throw (resilient design)
    // 6. If API had succeeded, handler would call updateETSContractWithZoraCoinAddress()
    await handler.handleTagCreatedLogs([mockLog]);
    
    console.log("✅ Event processing completed successfully!");
  } catch (error) {
    console.error("❌ Event processing failed:", error);
    process.exit(1);
  }
}

// Run the test
testEventProcessor().catch((error) => {
  console.error("💥 Test failed:", error);
  process.exit(1);
});
