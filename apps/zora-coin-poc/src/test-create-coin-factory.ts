/**
 * Factory Test via API - Create coins using offchain-api with FACTORY service
 *
 * This script tests the offchain-api endpoint with ZORA_SERVICE_TYPE=FACTORY
 * Uses the same API endpoint as the SDK test but with factory implementation.
 */

import axios, { type AxiosError } from "axios";

// Configuration
const OFFCHAIN_API_URL = process.env.OFFCHAIN_API_URL || "http://localhost:4000";
const ORACLE_API_KEY = process.env.ORACLE_API_KEY || "local-oracle-key";
const CHAIN_ID = process.env.CHAIN_ID || "84532"; // Default to Base Sepolia

async function testFactoryViAPI() {
  console.log("🚀 Testing Factory coin creation via offchain-api");
  console.log("📡 API URL:", OFFCHAIN_API_URL);
  console.log("⚙️ Service Type: FACTORY (via ZORA_SERVICE_TYPE env var)");
  console.log("⛓️ Chain ID:", CHAIN_ID);
  console.log("=".repeat(50));

  try {
    // Create mock TAG event data
    const timestamp = Date.now();
    const tagString = `#FactoryTest${timestamp}`;
    const machineName = tagString.slice(1).toLowerCase();

    const tagData = {
      coinAddress: "0x0000000000000000000000000000000000000000", // Will be predicted by service
      originalInput: tagString,
      displayVersion: tagString,
      machineName: machineName,
      creator: "0xB8C76203036E02524143113fd554968f50E9bC05", // ETS EOA
      relayer: "0xB8C76203036E02524143113fd554968f50E9bC05",
      timestamp: new Date().toISOString(),
      blockNumber: "1000000",
      transactionHash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
    };

    console.log(`\n🏷️ Creating coin for: ${tagString}`);
    console.log("📤 Sending request to /api/tag-coin/create...");

    const requestBody = {
      tagData,
      chainId: Number.parseInt(CHAIN_ID),
    };

    const response = await axios.post(`${OFFCHAIN_API_URL}/api/tag-coin/create`, requestBody, {
      headers: {
        "x-api-key": ORACLE_API_KEY,
        "Content-Type": "application/json",
      },
      timeout: 60000, // Longer timeout for factory operations
    });

    console.log("\n📨 Response received:");

    if (response.data.success) {
      console.log("✅ SUCCESS!");
      console.log(`💰 Coin Address: ${response.data.coinAddress}`);
      console.log(`🧾 Transaction: ${response.data.transactionHash}`);
      console.log(`📝 Created: ${response.data.created ? "New coin" : "Already existed"}`);

      // Generate explorer URL
      const explorerUrl =
        CHAIN_ID === "8453"
          ? `https://basescan.org/tx/${response.data.transactionHash}`
          : `https://sepolia.basescan.org/tx/${response.data.transactionHash}`;

      console.log(`🔍 View on explorer: ${explorerUrl}`);
    } else {
      console.error("❌ FAILED:", response.data.error);
      console.error("📄 Full response:", JSON.stringify(response.data, null, 2));
      process.exit(1);
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      console.error("❌ API request failed:", axiosError.message);
      console.error("📊 Status:", axiosError.response?.status);
      console.error("📄 Response:", JSON.stringify(axiosError.response?.data, null, 2));

      if (axiosError.response?.status === 401) {
        console.error("🔐 Authentication failed. Check your ORACLE_API_KEY");
      } else if (axiosError.response?.status === 500) {
        console.error("💥 Server error. Check if ZORA_SERVICE_TYPE=FACTORY is set in offchain-api");
      }
    } else {
      console.error("❌ Test failed:", error);
    }
    process.exit(1);
  }
}

testFactoryViAPI();
