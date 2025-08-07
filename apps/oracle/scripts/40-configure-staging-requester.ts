/**
 * Staging Requester Contract Configuration
 *
 * This script configures the Staging ETSEnrichTarget contract with Airnode parameters:
 * 1. Reads sponsorship info from the staging JSON file
 * 2. Connects to the Staging ETSEnrichTarget contract on Arbitrum Sepolia
 * 3. Calls setAirnodeRequestParameters with:
 *    - Airnode address
 *    - Endpoint ID
 *    - Sponsor address
 *    - Sponsor wallet address
 */

import { promises as fs } from "node:fs";
import * as path from "node:path";
import * as dotenv from "dotenv";
import { ethers } from "ethers";
import type { SponsorshipInfo } from "../types/airnode";

// Load environment variables from .env.staging
dotenv.config({ path: path.join(__dirname, "../.env.staging") });

// ETSEnrichTarget ABI - just the function we need
const etsEnrichTargetAbi = [
  "function setAirnodeRequestParameters(address _airnode, bytes32 _endpointId, address _sponsorAddress, address _sponsorWallet) external",
];

export async function configureStagingRequester() {
  try {
    console.log("Configuring Staging ETSEnrichTarget contract with Airnode parameters...");

    // Read configuration details from the staging directory
    const configDir = path.join(__dirname, "../config/staging");
    const configDetailsPath = path.join(configDir, "configuration-details.json");

    let configDetails: any;
    try {
      const configData = await fs.readFile(configDetailsPath, "utf8");
      configDetails = JSON.parse(configData);
      console.log("Read staging configuration details");
    } catch (error) {
      console.error("Error reading configuration details. Please run setup-staging-sponsorship first.");
      throw error;
    }

    // Connect to the Arbitrum Sepolia provider
    const rpcUrl = process.env.ARBITRUM_SEPOLIA_URL || "https://sepolia-rollup.arbitrum.io/rpc";
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    console.log(`Connected to Arbitrum Sepolia provider at: ${rpcUrl}`);

    // Get sponsor private key from environment
    const privateKey = process.env.SPONSOR_PK;
    if (!privateKey) {
      throw new Error(
        "SPONSOR_PK environment variable is not set. " +
          "This is required for configuring the staging requester contract.",
      );
    }

    const wallet = new ethers.Wallet(privateKey, provider);
    console.log(`Using sponsor wallet: ${wallet.address}`);

    // Create ETSEnrichTarget contract instance for staging
    const etsEnrichTarget = new ethers.Contract(configDetails.requesterAddress, etsEnrichTargetAbi, wallet);

    console.log("Setting Airnode request parameters for staging...");
    console.log(`Airnode address: ${configDetails.airnodeAddress}`);
    console.log(`Endpoint ID: ${configDetails.endpointId}`);
    console.log(`Sponsor address: ${configDetails.sponsorAddress}`);
    console.log(`Sponsor wallet address: ${configDetails.sponsorWalletAddress}`);

    // Call setAirnodeRequestParameters with proper gas settings for testnet
    const tx = await etsEnrichTarget.setAirnodeRequestParameters(
      configDetails.airnodeAddress,
      configDetails.endpointId,
      configDetails.sponsorAddress,
      configDetails.sponsorWalletAddress,
      {
        gasLimit: 300000, // Higher gas limit for testnet
        gasPrice: ethers.utils.parseUnits("1.5", "gwei"), // Adjust gas price for testnet
      },
    );

    console.log(`Transaction hash: ${tx.hash}`);
    await tx.wait();
    console.log("Staging ETSEnrichTarget contract configured successfully!");

    // Update the configuration details with requester configuration info
    configDetails.requesterConfigSuccess = true;
    configDetails.requesterConfigTimestamp = new Date().toISOString();
    configDetails.requesterConfigTx = tx.hash;
    configDetails.deploymentStatus = "ready_for_deployment";
    configDetails.buildSteps.requesterConfig = true;

    // Save updated configuration details
    await fs.writeFile(configDetailsPath, JSON.stringify(configDetails, null, 2));
    console.log(`Updated configuration details saved to ${configDetailsPath}`);

    return configDetails;
  } catch (error) {
    console.error("Error configuring staging requester contract:", error);
    throw error;
  }
}

// For command-line usage
if (require.main === module) {
  configureStagingRequester()
    .then(() => console.log("Staging requester configuration completed"))
    .catch((error) => {
      console.error("Error in staging requester configuration:", error);
      process.exit(1);
    });
}
