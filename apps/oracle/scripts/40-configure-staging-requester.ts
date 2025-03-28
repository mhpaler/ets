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

// Load environment variables
dotenv.config();

// ETSEnrichTarget ABI - just the function we need
const etsEnrichTargetAbi = [
  "function setAirnodeRequestParameters(address _airnode, bytes32 _endpointId, address _sponsorAddress, address _sponsorWallet) external",
];

export async function configureStagingRequester() {
  try {
    console.log("Configuring Staging ETSEnrichTarget contract with Airnode parameters...");

    // Read sponsorship info from the staging directory
    const configDir = path.join(__dirname, "../config/staging");
    const sponsorshipPath = path.join(configDir, "sponsorship-info.json");

    let sponsorshipInfo: SponsorshipInfo;
    try {
      const sponsorshipData = await fs.readFile(sponsorshipPath, "utf8");
      sponsorshipInfo = JSON.parse(sponsorshipData);
      console.log("Read staging sponsorship information");
    } catch (error) {
      console.error("Error reading staging sponsorship info. Please run setup-staging-sponsorship first.");
      throw error;
    }

    // Connect to the Arbitrum Sepolia provider
    const rpcUrl = process.env.ARBITRUM_SEPOLIA_URL || "https://sepolia-rollup.arbitrum.io/rpc";
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    console.log(`Connected to Arbitrum Sepolia provider at: ${rpcUrl}`);

    // Get admin private key from environment
    const privateKey = process.env.ETS_ADMIN_PRIVATE_KEY_STAGING;
    if (!privateKey) {
      throw new Error(
        "ETS_ADMIN_PRIVATE_KEY_STAGING environment variable is not set. " +
          "This is required for configuring the staging requester contract.",
      );
    }

    const wallet = new ethers.Wallet(privateKey, provider);
    console.log(`Using admin wallet: ${wallet.address}`);

    // Create ETSEnrichTarget contract instance for staging
    const etsEnrichTarget = new ethers.Contract(sponsorshipInfo.requesterAddress, etsEnrichTargetAbi, wallet);

    console.log("Setting Airnode request parameters for staging...");
    console.log(`Airnode address: ${sponsorshipInfo.airnodeAddress}`);
    console.log(`Endpoint ID: ${sponsorshipInfo.endpointId}`);
    console.log(`Sponsor address: ${sponsorshipInfo.sponsorAddress}`);
    console.log(`Sponsor wallet address: ${sponsorshipInfo.sponsorWalletAddress}`);

    // Call setAirnodeRequestParameters with proper gas settings for testnet
    const tx = await etsEnrichTarget.setAirnodeRequestParameters(
      sponsorshipInfo.airnodeAddress,
      sponsorshipInfo.endpointId,
      sponsorshipInfo.sponsorAddress,
      sponsorshipInfo.sponsorWalletAddress,
      {
        gasLimit: 300000, // Higher gas limit for testnet
        gasPrice: ethers.utils.parseUnits("1.5", "gwei"), // Adjust gas price for testnet
      },
    );

    console.log(`Transaction hash: ${tx.hash}`);
    await tx.wait();
    console.log("Staging ETSEnrichTarget contract configured successfully!");

    // Save the configuration details
    const configDetails = {
      success: true,
      transaction: tx.hash,
      requesterAddress: sponsorshipInfo.requesterAddress,
      airnodeAddress: sponsorshipInfo.airnodeAddress,
      endpointId: sponsorshipInfo.endpointId,
      sponsorAddress: sponsorshipInfo.sponsorAddress,
      sponsorWalletAddress: sponsorshipInfo.sponsorWalletAddress,
      timestamp: new Date().toISOString(),
      environment: "staging",
    };

    // Save to a configuration-details.json file
    const configDetailsPath = path.join(configDir, "configuration-details.json");
    await fs.writeFile(configDetailsPath, JSON.stringify(configDetails, null, 2));
    console.log(`Configuration details saved to ${configDetailsPath}`);

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
