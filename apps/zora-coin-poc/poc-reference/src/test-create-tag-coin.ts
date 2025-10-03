/**
 * Unified TAG Coin Creation Test
 *
 * This script auto-detects the API configuration and creates a TAG coin accordingly.
 * It queries the API for its current service type (SDK/FACTORY) and chain ID,
 * then creates a test coin with appropriate settings.
 */

import * as readline from "node:readline";
import axios, { type AxiosError } from "axios";

// Configuration
const OFFCHAIN_API_URL = process.env.OFFCHAIN_API_URL || "http://localhost:4000";
const ORACLE_API_KEY = process.env.ORACLE_API_KEY || "local-oracle-key";

interface ApiConfig {
  serviceType: "SDK" | "FACTORY";
  chainId: number;
  chainName: string;
  apiUrl: string;
}

async function getApiConfig(): Promise<ApiConfig> {
  try {
    const response = await axios.get(`${OFFCHAIN_API_URL}/api/tag-coin/config`, {
      headers: {
        "x-api-key": ORACLE_API_KEY,
      },
    });
    if (response.data.success) {
      return response.data.config;
    }
    throw new Error("Failed to get API configuration");
  } catch (error) {
    console.error("❌ Failed to get API configuration. Is the API running?");
    if (axios.isAxiosError(error)) {
      console.error("Error:", error.message);
    }
    process.exit(1);
  }
}

async function askConfirmation(): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question("\n❓ Proceed with coin creation? (y/n): ", (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === "y" || answer.toLowerCase() === "yes");
    });
  });
}

async function testTagCoinCreation() {
  console.log("🚀 Testing TAG Coin Creation via offchain-api");
  console.log("📡 API URL:", OFFCHAIN_API_URL);
  console.log("=".repeat(50));

  // Get API configuration
  console.log("\n🔍 Detecting API configuration...");
  const config = await getApiConfig();

  console.log("⚙️  Service Type:", config.serviceType);
  console.log("⛓️  Chain ID:", config.chainId);
  console.log("🌐 Chain Name:", config.chainName);
  console.log("=".repeat(50));

  // Ask for confirmation
  const shouldProceed = await askConfirmation();
  if (!shouldProceed) {
    console.log("❌ Test cancelled by user");
    process.exit(0);
  }

  try {
    // Create mock TAG event data with service-specific naming
    const timestamp = Date.now();
    const prefix = config.serviceType === "FACTORY" ? "FactoryTest" : "SDKTest";
    const tagString = `#${prefix}${timestamp}`;
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

    console.log(`\n🏷️  Creating coin for: ${tagString}`);
    console.log("📤 Sending request to /api/tag-coin/create...");

    const requestBody = {
      tagData,
      chainId: config.chainId, // Use the API's chain ID
    };

    const response = await axios.post(`${OFFCHAIN_API_URL}/api/tag-coin/create`, requestBody, {
      headers: {
        "x-api-key": ORACLE_API_KEY,
        "Content-Type": "application/json",
      },
      timeout: 60000, // 60 second timeout for coin creation
    });

    console.log("\n📨 Response received:");

    if (response.data.success) {
      console.log("✅ SUCCESS!");
      console.log(`💰 Coin Address: ${response.data.coinAddress}`);
      console.log(`🧾 Transaction: ${response.data.transactionHash}`);
      console.log(`📝 Created: ${response.data.created ? "New coin" : "Already existed"}`);
      if (response.data.totalCostETH) {
        console.log(`⛽ Gas Cost: ${response.data.totalCostETH} ETH`);
      }

      // Generate explorer URL based on chain ID
      let explorerUrl: string;
      if (config.chainId === 8453) {
        // Base mainnet
        explorerUrl = `https://basescan.org/tx/${response.data.transactionHash}`;
      } else if (config.chainId === 84532) {
        // Base Sepolia
        explorerUrl = `https://sepolia.basescan.org/tx/${response.data.transactionHash}`;
      } else if (config.chainId === 31337) {
        // Localhost
        explorerUrl = `Local transaction: ${response.data.transactionHash}`;
      } else {
        // Unknown chain
        explorerUrl = `Transaction hash: ${response.data.transactionHash}`;
      }

      console.log(`🔍 View on explorer: ${explorerUrl}`);

      // Summary
      console.log(`\n${"=".repeat(50)}`);
      console.log("📊 Summary:");
      console.log(`   Service: ${config.serviceType}`);
      console.log(`   Chain: ${config.chainName} (${config.chainId})`);
      console.log(`   TAG: ${tagString}`);
      console.log(`   Coin: ${response.data.coinAddress}`);
      if (response.data.totalCostETH) {
        console.log(`   Cost: ${response.data.totalCostETH} ETH`);
      }
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
        console.error("💥 Server error. Check the offchain-api logs for details");
      }
    } else {
      console.error("❌ Test failed:", error);
    }
    process.exit(1);
  }
}

// Run the test
testTagCoinCreation();
