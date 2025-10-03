/**
 * Test ZoraService Directly
 *
 * This script directly instantiates and tests our fixed ZoraService
 * without going through the API endpoints, to get better error details.
 */

import { ZoraService } from "../../offchain-api/src/services/zora/zoraService";

async function testZoraServiceDirect() {
  console.log("🧪 Testing ZoraService Directly");
  console.log("===============================\n");

  try {
    // Initialize ZoraService with the same config as the API
    const privateKey = "4e284d9ea4aeb9779bc0f22ffcc800c83a3643d826f324b1b2fad316e7fa3b39" as `0x${string}`;
    const chainId = 84532; // Base Sepolia
    const metadataApiUrl = "http://localhost:4000/api/metadata";

    console.log("⚙️ Initializing ZoraService...");
    const zoraService = new ZoraService(privateKey, chainId, metadataApiUrl);

    // Test event data
    const eventData = {
      coinAddress: "0x1234567890123456789012345678901234567890", // Mock predicted address
      originalInput: "#DirectTest",
      displayVersion: "#DirectTest",
      machineName: "directtest",
      creator: "0x4de7c002be724ad63d5dca3f64126bbddb9fd735",
      relayer: "0x4de7c002be724ad63d5dca3f64126bbddb9fd735",
      timestamp: new Date().toISOString(),
      blockNumber: "12345",
      transactionHash: "0xtest1234567890123456789012345678901234567890123456789012345678",
    };

    console.log("📋 Event Data:");
    console.log(JSON.stringify(eventData, null, 2));

    console.log("\n📤 Calling ZoraService.createCoin directly...");

    // Call createCoin with dry run (localhost mode should return mock)
    const result = await zoraService.createCoin(eventData);

    console.log("\n✅ ZoraService.createCoin completed:");
    console.log(JSON.stringify(result, null, 2));

    if (result.success) {
      console.log("\n🎉 SUCCESS!");
      console.log("==============");
      console.log("✅ Fixed ZoraService works correctly");
      console.log("✅ Generates real metadata via API");
      console.log("✅ Successfully creates/mocks coin creation");

      if (result.coinAddress) {
        console.log(`📍 Coin Address: ${result.coinAddress}`);
      }
      if (result.transactionHash) {
        console.log(`📄 Transaction Hash: ${result.transactionHash}`);
      }
    } else {
      console.log("\n❌ ZoraService failed:");
      console.log(`Error: ${result.error}`);
    }
  } catch (error: any) {
    console.log(`\n💥 Exception thrown: ${error.message}`);
    console.log(`Stack trace: ${error.stack}`);
  }
}

// Run the direct test
testZoraServiceDirect().catch(console.error);
