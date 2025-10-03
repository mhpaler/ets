/**
 * Test script to create TAG coins via offchain-api
 * This uses the existing ZoraFactoryService infrastructure
 */

import axios from "axios";
import { config } from "./config.js";

interface TagCreatedEventData {
  coinAddress: string;
  originalInput: string;
  displayVersion: string;
  machineName: string;
  creator: string;
  relayer: string;
  timestamp: string;
  blockNumber: string;
  transactionHash: string;
}

async function testOffchainApi() {
  console.log("🚀 Testing TAG Coin Creation via Offchain-API");
  console.log("==========================================\n");

  const offchainApiUrl = process.env.OFFCHAIN_API_URL || "http://localhost:4000";
  console.log("📡 Offchain API URL:", offchainApiUrl);

  try {
    // First, check if the API is healthy
    console.log("\n🏥 Checking API health...");
    const healthResponse = await axios.get(`${offchainApiUrl}/api/tag-coins/health`);
    console.log("✅ API Health:", healthResponse.data);

    // Generate a unique tag for testing
    const timestamp = Date.now();
    const tagString = `#ZoraAPITest${timestamp}`;
    const machineName = tagString.slice(1).toLowerCase();

    console.log("\n📝 Creating TAG coin:");
    console.log("   Tag:", tagString);
    console.log("   Machine Name:", machineName);

    // Prepare the event data (simulating what the Event Processor would send)
    const tagData: TagCreatedEventData = {
      coinAddress: "0x0000000000000000000000000000000000000000", // Will be predicted by API
      originalInput: tagString,
      displayVersion: tagString,
      machineName: machineName,
      creator: config.smartWallet.address, // Using our smart wallet as creator
      relayer: config.smartWallet.address, // Using our smart wallet as relayer
      timestamp: new Date().toISOString(),
      blockNumber: "0", // Will be set by actual transaction
      transactionHash: "0x0000000000000000000000000000000000000000000000000000000000000000",
    };

    // Determine chain ID based on environment
    const chainId = process.env.CHAIN_ID || "8453"; // Default to Base mainnet

    console.log("\n🔗 Chain ID:", chainId);
    console.log("👤 Creator/Relayer:", config.smartWallet.address);

    // Call the tag-coin creation endpoint
    console.log("\n📤 Sending TAG coin creation request...");
    const createResponse = await axios.post(
      `${offchainApiUrl}/api/tag-coins/create`,
      {
        tagData,
        chainId: Number.parseInt(chainId),
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    console.log("\n✅ Response from API:");
    console.log(JSON.stringify(createResponse.data, null, 2));

    if (createResponse.data.success) {
      console.log("\n🎉 TAG coin created successfully!");
      console.log("📍 Coin Address:", createResponse.data.coinAddress);
      if (createResponse.data.transactionHash) {
        console.log("📄 Transaction Hash:", createResponse.data.transactionHash);

        // Generate explorer URL based on chain
        let explorerUrl: string;
        if (chainId === "8453") {
          explorerUrl = `https://basescan.org/tx/${createResponse.data.transactionHash}`;
        } else if (chainId === "84532") {
          explorerUrl = `https://sepolia.basescan.org/tx/${createResponse.data.transactionHash}`;
        } else {
          explorerUrl = "Local chain - no explorer";
        }
        console.log("🔍 Explorer:", explorerUrl);
      }
    } else {
      console.log("\n⚠️ TAG coin creation failed:", createResponse.data.error);
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("\n💥 API Error:", error.response?.data || error.message);
      if (error.response?.status === 404) {
        console.error("❌ Endpoint not found. Is the offchain-api running?");
      } else if (error.code === "ECONNREFUSED") {
        console.error("❌ Cannot connect to offchain-api. Please start it first:");
        console.error("   cd /Users/User/Sites/ets && ./scripts/start-local-stack.sh");
      }
    } else {
      console.error("\n💥 Unexpected error:", error);
    }
  }
}

// Run the test
testOffchainApi().catch(console.error);
