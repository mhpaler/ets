/**
 * Requester Contract Configuration
 *
 * This script configures the ETSEnrichTarget contract with Airnode parameters:
 * 1. Reads sponsorship info from the JSON file
 * 2. Connects to the ETSEnrichTarget contract
 * 3. Calls setAirnodeRequestParameters with:
 *    - Airnode address
 *    - Endpoint ID
 *    - Sponsor wallet address
 *
 * This configuration allows the ETSEnrichTarget contract to make requests
 * to the Airnode oracle service.
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

export async function configureRequester() {
  try {
    console.log("Configuring ETSEnrichTarget contract with Airnode parameters...");

    // Read sponsorship info
    const configDir = path.join(__dirname, "../config/local");
    const sponsorshipPath = path.join(configDir, "sponsorship-info.json");

    let sponsorshipInfo: SponsorshipInfo;
    try {
      const sponsorshipData = await fs.readFile(sponsorshipPath, "utf8");
      sponsorshipInfo = JSON.parse(sponsorshipData);
      console.log("Read sponsorship information");
    } catch (error) {
      console.error("Error reading sponsorship info. Please run 30-setup-sponsorship.ts first.");
      throw error;
    }

    // Connect to the Ethereum provider
    const rpcUrl = process.env.RPC_URL || "http://localhost:8545";
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    console.log(`Connected to Ethereum provider at: ${rpcUrl}`);

    // Get admin private key from environment
    const privateKey = process.env.ETS_ADMIN_PRIVATE_KEY_LOCAL;
    if (!privateKey) {
      throw new Error(
        "ETS_ADMIN_PRIVATE_KEY_LOCAL environment variable is not set. " +
          "This is required for configuring the requester contract.",
      );
    }

    const wallet = new ethers.Wallet(privateKey, provider);
    console.log(`Using admin wallet: ${wallet.address}`);

    // Create ETSEnrichTarget contract instance
    const etsEnrichTarget = new ethers.Contract(sponsorshipInfo.requesterAddress, etsEnrichTargetAbi, wallet);

    console.log("Setting Airnode request parameters...");
    console.log(`Airnode address: ${sponsorshipInfo.airnodeAddress}`);
    console.log(`Endpoint ID: ${sponsorshipInfo.endpointId}`);
    console.log(`Sponsor wallet address: ${sponsorshipInfo.sponsorWalletAddress}`);

    // Call setAirnodeRequestParameters
    const tx = await etsEnrichTarget.setAirnodeRequestParameters(
      sponsorshipInfo.airnodeAddress,
      sponsorshipInfo.endpointId,
      sponsorshipInfo.sponsorAddress,
      sponsorshipInfo.sponsorWalletAddress,
    );

    console.log(`Transaction hash: ${tx.hash}`);
    await tx.wait();
    console.log("ETSEnrichTarget contract configured successfully!");

    return {
      success: true,
      transaction: tx.hash,
      requesterAddress: sponsorshipInfo.requesterAddress,
    };
  } catch (error) {
    console.error("Error configuring requester contract:", error);
    throw error;
  }
}

// For command-line usage
if (require.main === module) {
  configureRequester()
    .then(() => console.log("Requester configuration completed"))
    .catch((error) => {
      console.error("Error in requester configuration:", error);
      process.exit(1);
    });
}
