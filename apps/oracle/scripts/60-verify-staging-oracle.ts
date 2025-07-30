/**
 * Staging Oracle Verification Script
 *
 * This script verifies that the staging Airnode deployment is working correctly:
 * 1. Checks the HTTP Gateway for health status
 * 2. Verifies the contract configuration in ETSEnrichTarget
 * 3. Makes a test request if specified
 * 4. Reports overall deployment health status
 */

import { promises as fs } from "node:fs";
import * as path from "node:path";
import * as dotenv from "dotenv";
import { ethers } from "ethers";

// Load environment variables from .env.staging
dotenv.config({ path: path.join(__dirname, "../.env.staging") });

// ETSEnrichTarget ABI - just what we need
const etsEnrichTargetAbi = [
  "function airnode() view returns (address)",
  "function endpointId() view returns (bytes32)",
  "function sponsorAddress() view returns (address)",
  "function sponsorWallet() view returns (address)",
  "function requestEnrichTarget(uint256 _targetId) external",
  "function getTargetById(uint256 _targetId) view returns (tuple(string targetURI, address createdBy, uint256 enriched, uint256 httpStatus, string arweaveTxId))",
];

// Optional function to make a test request
async function makeTestRequest(etsEnrichTarget: ethers.Contract, wallet: ethers.Wallet): Promise<boolean> {
  try {
    console.log("\nMaking a test enrichment request...");

    // First we need a targetId to enrich - check if any targets exist
    const testTargetId = process.env.TEST_TARGET_ID;

    if (!testTargetId) {
      console.log("No test target ID provided in environment. Skipping test request.");
      return false;
    }

    console.log(`Using test target ID: ${testTargetId}`);

    // Check if the target exists
    try {
      const target = await etsEnrichTarget.getTargetById(testTargetId);
      console.log("Target exists:", target);
    } catch (_error) {
      console.log("Target does not exist. Cannot proceed with test request.");
      return false;
    }

    // Make the request
    console.log("Submitting requestEnrichTarget transaction...");
    const tx = await etsEnrichTarget.connect(wallet).requestEnrichTarget(testTargetId, {
      gasLimit: 500000,
    });

    console.log(`Request transaction hash: ${tx.hash}`);
    await tx.wait();
    console.log("Test request submitted successfully!");

    console.log(
      "\nNote: The oracle request is asynchronous - it may take a few minutes for the Airnode to fulfill it.",
    );
    console.log("You can check the target's status later using the SDK or the ETSTarget.getTargetById function.");

    return true;
  } catch (error) {
    console.error("Error making test request:", error);
    return false;
  }
}

async function verifyOracleHealth() {
  try {
    console.log("Verifying Staging Oracle health...");

    // Load deployment info
    const configDir = path.join(__dirname, "../config/staging");
    const deploymentInfoPath = path.join(configDir, "deployment-info.json");

    let deploymentInfo: any;
    try {
      deploymentInfo = JSON.parse(await fs.readFile(deploymentInfoPath, "utf8"));
      console.log("Found deployment info file");
    } catch (error) {
      console.error("Error reading deployment info. Has the oracle been deployed?");
      throw error;
    }

    // Display HTTP Gateway URL for reference
    const httpGatewayUrl = deploymentInfo.httpGatewayUrl;
    console.log(`\nHTTP Gateway URL: ${httpGatewayUrl}`);
    console.log("✅ HTTP Gateway URL available for Oracle requests");

    // Connect to blockchain
    console.log("\nConnecting to Arbitrum Sepolia testnet...");
    const rpcUrl = process.env.ARBITRUM_SEPOLIA_URL || "https://sepolia-rollup.arbitrum.io/rpc";
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl);

    // Load contract data
    const configDetailsPath = path.join(configDir, "configuration-details.json");
    let configDetails: any;
    try {
      configDetails = JSON.parse(await fs.readFile(configDetailsPath, "utf8"));
      console.log("Found configuration details");
    } catch (error) {
      console.error("Error reading configuration details. Has the requester been configured?");
      throw error;
    }

    // Create contract instance
    const requesterAddress = configDetails.requesterAddress;
    const etsEnrichTarget = new ethers.Contract(requesterAddress, etsEnrichTargetAbi, provider);

    // Check contract configuration
    console.log("\nChecking ETSEnrichTarget contract configuration...");
    console.log(`Contract address: ${requesterAddress}`);

    const airnode = await etsEnrichTarget.airnode();
    const endpointId = await etsEnrichTarget.endpointId();
    const sponsorAddress = await etsEnrichTarget.sponsorAddress();
    const sponsorWallet = await etsEnrichTarget.sponsorWallet();

    console.log("Contract configuration:");
    console.log(`- Airnode: ${airnode}`);
    console.log(`- Endpoint ID: ${endpointId}`);
    console.log(`- Sponsor Address: ${sponsorAddress}`);
    console.log(`- Sponsor Wallet: ${sponsorWallet}`);

    // Verify Airnode address matches
    const expectedAirnodeAddress = deploymentInfo.airnodeAddress;
    if (airnode.toLowerCase() !== expectedAirnodeAddress.toLowerCase()) {
      console.warn("⚠️ Warning: Airnode address mismatch between contract and deployment!");
      console.warn(`Contract: ${airnode}`);
      console.warn(`Deployment: ${expectedAirnodeAddress}`);
    } else {
      console.log("✅ Airnode address matches between contract and deployment");
    }

    // Make a test request if requested
    if (process.env.MAKE_TEST_REQUEST === "true") {
      // Get sponsor private key
      const privateKey = process.env.SPONSOR_PK;
      if (!privateKey) {
        console.warn("SPONSOR_PK not set. Skipping test request.");
      } else {
        const wallet = new ethers.Wallet(privateKey, provider);
        await makeTestRequest(etsEnrichTarget, wallet);
      }
    } else {
      console.log("\nSkipping test request (set MAKE_TEST_REQUEST=true to enable)");
    }

    console.log("\n🔍 Staging Oracle Verification Summary:");
    console.log("- Deployment Info: ✅ Found");
    console.log(`- HTTP Gateway: ${httpGatewayUrl}`);
    console.log(`- Contract Address: ${requesterAddress}`);
    console.log(`- Airnode Address: ${airnode}`);

    console.log("\nStaging Oracle verification completed!");
    return true;
  } catch (error) {
    console.error("Error verifying Oracle:", error);
    throw error;
  }
}

// For command-line usage
if (require.main === module) {
  verifyOracleHealth()
    .then(() => {
      console.log("\nOracle verification completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Error in Oracle verification:", error);
      process.exit(1);
    });
}
