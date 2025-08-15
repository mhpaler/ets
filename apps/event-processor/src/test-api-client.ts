import { apiClient } from "./clients/apiClient";
import type { ZoraCoinCreationRequest } from "./types";

// Mock tag data
const mockRequest: ZoraCoinCreationRequest = {
  tagData: {
    coinAddress: "0x1234567890123456789012345678901234567890",
    originalInput: "#TestTag",
    displayVersion: "#TestTag",
    machineName: "testtag",
    creator: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
    relayer: "0xfedcbafedcbafedcbafedcbafedcbafedcbafed",
    timestamp: BigInt(Date.now()),
    blockNumber: 12345n,
    transactionHash: "0x9876543210987654321098765432109876543210987654321098765432109876",
  },
  chainId: 84532,
};

async function testApiClient() {
  console.log("🌐 Testing API Client...");
  console.log(`API URL: ${process.env.OFFCHAIN_API_URL || "http://localhost:3000"}\n`);

  try {
    console.log("🔍 Testing health check...");
    const isHealthy = await apiClient.healthCheck();
    console.log(`Health check result: ${isHealthy ? "✅ Healthy" : "❌ Unhealthy"}\n`);

    console.log("💰 Testing Zora coin creation...");
    const response = await apiClient.createZoraCoin(mockRequest);

    console.log("📝 Response:");
    console.log(JSON.stringify(response, null, 2));

    if (response.success) {
      console.log("\n✅ API client test successful!");
    } else {
      console.log("\n⚠️  API returned error (expected if endpoint not implemented yet)");
    }
  } catch (error) {
    console.error("❌ API client test failed:", error);
    process.exit(1);
  }
}

// Run the test
testApiClient().catch((error) => {
  console.error("💥 Test failed:", error);
  process.exit(1);
});
