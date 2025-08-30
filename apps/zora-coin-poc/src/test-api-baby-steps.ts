/**
 * Baby Steps Test Script for TAG Coin Creation via Offchain-API
 *
 * This script tests the offchain-api TAG coin creation in small,
 * debuggable steps with extensive logging at each stage.
 */

import axios, { type AxiosError } from "axios";
import { config } from "./config.js";

// Configuration
const OFFCHAIN_API_URL = process.env.OFFCHAIN_API_URL || "http://localhost:4000";
const ORACLE_API_KEY = process.env.ORACLE_API_KEY || "local-oracle-key";
const CHAIN_ID = process.env.CHAIN_ID || "84532"; // Default to Base Sepolia

// Color codes for console output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
};

function log(level: "INFO" | "SUCCESS" | "WARNING" | "ERROR" | "DEBUG", message: string, data?: any) {
  const timestamp = new Date().toISOString();
  let color = colors.reset;

  switch (level) {
    case "SUCCESS":
      color = colors.green;
      break;
    case "WARNING":
      color = colors.yellow;
      break;
    case "ERROR":
      color = colors.red;
      break;
    case "DEBUG":
      color = colors.cyan;
      break;
    case "INFO":
      color = colors.blue;
      break;
  }

  console.log(`${color}[${timestamp}] ${level}: ${message}${colors.reset}`);
  if (data) {
    console.log(JSON.stringify(data, null, 2));
  }
}

async function step1_CheckAPIHealth() {
  log("INFO", "=== STEP 1: Check API Health ===");

  try {
    // First try without auth (should work for general health)
    log("DEBUG", "Checking general health endpoint...");
    const healthResponse = await axios.get(`${OFFCHAIN_API_URL}/health`);
    log("SUCCESS", "General health check passed", healthResponse.data);

    // Now try the tag-coins health endpoint with auth
    log("DEBUG", "Checking tag-coins health endpoint with authentication...");
    const tagCoinsHealth = await axios.get(`${OFFCHAIN_API_URL}/api/tag-coin/health`, {
      headers: {
        "x-api-key": ORACLE_API_KEY,
        "Content-Type": "application/json",
      },
    });
    log("SUCCESS", "Tag-coins health check passed", tagCoinsHealth.data);

    return true;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      log("ERROR", `Health check failed: ${error.message}`, {
        status: error.response?.status,
        data: error.response?.data,
        url: error.config?.url,
      });
    } else {
      log("ERROR", "Unexpected error during health check", error);
    }
    return false;
  }
}

async function step2_TestMetadataGeneration() {
  log("INFO", "=== STEP 2: Test Metadata Generation ===");

  try {
    const timestamp = Date.now();
    const tagString = `#BabyStep${timestamp}`;
    const machineName = tagString.slice(1).toLowerCase();

    log("DEBUG", "Testing metadata generation", {
      tagString,
      machineName,
      creator: config.smartWallet.address,
    });

    // The metadata endpoint doesn't require oracle auth, just API key
    const metadataResponse = await axios.post(
      `${OFFCHAIN_API_URL}/api/metadata/generate`,
      {
        tagString: tagString, // Changed from originalInput to tagString
        machineName: machineName,
        creator: config.smartWallet.address,
        relayer: config.smartWallet.address,
      },
      {
        headers: {
          "x-api-key": "local-dev-key", // Use general API key for metadata
          "Content-Type": "application/json",
        },
      },
    );

    log("SUCCESS", "Metadata generated successfully", metadataResponse.data);
    return metadataResponse.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      log("ERROR", `Metadata generation failed: ${error.message}`, {
        status: error.response?.status,
        data: error.response?.data,
      });
    } else {
      log("ERROR", "Unexpected error during metadata generation", error);
    }
    return null;
  }
}

async function step3_PrepareTagData() {
  log("INFO", "=== STEP 3: Prepare TAG Creation Data ===");

  const timestamp = Date.now();
  const tagString = `#ZoraTest${timestamp}`;
  const machineName = tagString.slice(1).toLowerCase();

  const tagData = {
    coinAddress: "0x0000000000000000000000000000000000000000", // Will be predicted by API
    originalInput: tagString,
    displayVersion: tagString,
    machineName: machineName,
    creator: config.smartWallet.address,
    relayer: config.smartWallet.address,
    timestamp: new Date().toISOString(),
    blockNumber: "0",
    transactionHash: "0x0000000000000000000000000000000000000000000000000000000000000000",
  };

  log("DEBUG", "Prepared TAG data", tagData);

  // Check ETS EOA wallet balance
  try {
    log("DEBUG", "Checking ETS EOA wallet balance...");
    const ETS_EOA_ADDRESS = "0xB8C76203036E02524143113fd554968f50E9bC05";

    // Determine RPC URL based on chain
    let rpcUrl: string;
    if (CHAIN_ID === "8453") {
      rpcUrl = "https://mainnet.base.org";
    } else if (CHAIN_ID === "84532") {
      rpcUrl = "https://sepolia.base.org";
    } else {
      rpcUrl = "http://localhost:8545";
    }

    // Make a simple eth_getBalance RPC call
    const balanceResponse = await axios.post(
      rpcUrl,
      {
        jsonrpc: "2.0",
        method: "eth_getBalance",
        params: [ETS_EOA_ADDRESS, "latest"],
        id: 1,
      },
      {
        headers: { "Content-Type": "application/json" },
      },
    );

    if (balanceResponse.data.result) {
      const balanceWei = BigInt(balanceResponse.data.result);
      const balanceEth = Number(balanceWei) / 1e18;

      if (balanceEth < 0.001) {
        log("WARNING", `⚠️  ETS EOA wallet has LOW balance: ${balanceEth.toFixed(6)} ETH`, {
          address: ETS_EOA_ADDRESS,
          chain: CHAIN_ID === "8453" ? "Base Mainnet" : CHAIN_ID === "84532" ? "Base Sepolia" : "Localhost",
        });
        log("WARNING", "The offchain-api may fail to create coins due to insufficient gas!");
      } else {
        log("SUCCESS", `✅ ETS EOA wallet balance: ${balanceEth.toFixed(6)} ETH`, {
          address: ETS_EOA_ADDRESS,
          chain: CHAIN_ID === "8453" ? "Base Mainnet" : CHAIN_ID === "84532" ? "Base Sepolia" : "Localhost",
        });
      }
    }
  } catch (error) {
    log("WARNING", "Could not check ETS EOA wallet balance", {
      error: error instanceof Error ? error.message : String(error),
    });
  }

  // Log important configuration
  log("INFO", "Configuration Check", {
    smartWallet: config.smartWallet.address,
    etsEOA: "0xB8C76203036E02524143113fd554968f50E9bC05",
    chainId: CHAIN_ID,
    apiUrl: OFFCHAIN_API_URL,
    hasOracleKey: !!ORACLE_API_KEY,
  });

  return tagData;
}

async function step4_CreateTagCoin(tagData: any, dryRun = true) {
  log("INFO", `=== STEP 4: Create TAG Coin (${dryRun ? "DRY RUN" : "REAL"}) ===`);

  if (dryRun) {
    log("WARNING", "DRY RUN MODE - No actual transaction will be submitted");
  }

  try {
    log("DEBUG", "Sending TAG coin creation request...", {
      url: `${OFFCHAIN_API_URL}/api/tag-coin/create`,
      chainId: Number.parseInt(CHAIN_ID),
      dryRun: dryRun,
    });

    const requestBody = {
      tagData,
      chainId: Number.parseInt(CHAIN_ID),
      dryRun: dryRun, // If the API supports dry run
    };

    log("DEBUG", "Request body", requestBody);

    const response = await axios.post(`${OFFCHAIN_API_URL}/api/tag-coin/create`, requestBody, {
      headers: {
        "x-api-key": ORACLE_API_KEY,
        "Content-Type": "application/json",
      },
      timeout: 30000, // 30 second timeout
    });

    log("SUCCESS", "TAG coin creation response received", response.data);

    if (response.data.success) {
      if (response.data.created) {
        log("SUCCESS", "🎉 New TAG coin created!", {
          coinAddress: response.data.coinAddress,
          transactionHash: response.data.transactionHash,
        });

        // Generate explorer URL
        const explorerUrl =
          CHAIN_ID === "8453"
            ? `https://basescan.org/tx/${response.data.transactionHash}`
            : CHAIN_ID === "84532"
              ? `https://sepolia.basescan.org/tx/${response.data.transactionHash}`
              : "Local chain - no explorer";

        log("INFO", `View on explorer: ${explorerUrl}`);
      } else {
        log("WARNING", "TAG coin already exists", {
          coinAddress: response.data.coinAddress,
        });
      }
    } else {
      log("ERROR", "TAG coin creation failed", response.data);
    }

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      log("ERROR", `API request failed: ${axiosError.message}`, {
        status: axiosError.response?.status,
        statusText: axiosError.response?.statusText,
        data: axiosError.response?.data,
        headers: axiosError.response?.headers,
      });

      // Specific error handling
      if (axiosError.response?.status === 401) {
        log("ERROR", "Authentication failed. Check your ORACLE_API_KEY");
      } else if (axiosError.response?.status === 403) {
        log("ERROR", "Forbidden. Your IP might not be in the allowlist");
      } else if (axiosError.response?.status === 500) {
        log("ERROR", "Server error. Check offchain-api logs for details");
      }
    } else {
      log("ERROR", "Unexpected error during TAG coin creation", error);
    }
    return null;
  }
}

async function runBabySteps() {
  // Check for --dry-run flag
  const isDryRunMode = process.argv.includes("--dry-run");

  log("INFO", "🚀 Starting Baby Steps TAG Coin Creation Test");
  if (isDryRunMode) {
    log("WARNING", "DRY RUN MODE - Will NOT create real coins");
  } else {
    log("WARNING", "REAL MODE - Will create actual coins on-chain!");
  }
  log("INFO", "================================================\n");

  // Step 1: Check API Health
  const isHealthy = await step1_CheckAPIHealth();
  if (!isHealthy) {
    log("ERROR", "API health check failed. Please ensure offchain-api is running.");
    log("INFO", "Run: cd /Users/User/Sites/ets/apps/offchain-api && pnpm dev");
    return;
  }

  // Step 2: Test Metadata Generation
  log("INFO", `\n${"=".repeat(50)}`);
  const metadata = await step2_TestMetadataGeneration();
  if (!metadata) {
    log("WARNING", "Metadata generation failed, but continuing with test...");
  }

  // Step 3: Prepare TAG Data
  log("INFO", `\n${"=".repeat(50)}`);
  const tagData = await step3_PrepareTagData();

  // Step 4: Create TAG Coin
  log("INFO", `\n${"=".repeat(50)}`);

  if (isDryRunMode) {
    // Dry run mode - just simulate
    log("INFO", "Performing DRY RUN (no real transaction)...");
    const result = await step4_CreateTagCoin(tagData, true);

    if (result?.success) {
      log("SUCCESS", "✅ Dry run completed successfully!");
      log("INFO", "To create real coin, run without --dry-run flag");
    } else {
      log("ERROR", "Dry run failed");
    }
  } else {
    // Real mode - ask for confirmation first
    log("WARNING", "⚠️  READY TO CREATE REAL COIN ON-CHAIN");
    log("INFO", "This will:");
    log("INFO", "  - Generate real metadata on IPFS");
    log("INFO", "  - Create a real coin on the blockchain");
    log("INFO", "  - Cost gas fees");
    log("INFO", `\n${"=".repeat(50)}`);

    const readline = require("node:readline");
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question(
      `${colors.yellow}Are you sure you want to create a REAL coin? (yes/no): ${colors.reset}`,
      async (answer: string) => {
        if (answer.toLowerCase() === "yes" || answer.toLowerCase() === "y") {
          log("INFO", "Creating real TAG coin...");
          const result = await step4_CreateTagCoin(tagData, false);

          if (result?.success) {
            log("SUCCESS", "🎉 Real coin created successfully!");
          } else {
            log("ERROR", "Real coin creation failed");
          }
        } else {
          log("INFO", "Transaction cancelled by user");
        }
        rl.close();
        process.exit(0);
      },
    );
  }
}

// Handle errors gracefully
process.on("unhandledRejection", (reason, promise) => {
  log("ERROR", "Unhandled Rejection at:", { promise, reason });
  process.exit(1);
});

// Run the test
runBabySteps().catch((error) => {
  log("ERROR", "Fatal error:", error);
  process.exit(1);
});
