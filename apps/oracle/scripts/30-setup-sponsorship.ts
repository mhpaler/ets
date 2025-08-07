/**
 * Airnode Sponsorship Setup
 *
 * This script sets up the sponsorship relationship between the admin wallet and the requester contract:
 * 1. Reads airnodeAddress and xpub from credentials
 * 2. Identifies sponsorAddress (admin wallet)
 * 3. Derives sponsorWallet using deriveSponsorWalletAddress
 * 4. Funds sponsorWallet with ETH
 * 5. Calls sponsorRequester on AirnodeRrpV0
 * 6. Saves sponsorship info to a JSON file
 *
 * The sponsorship relationship allows the requester contract to use the sponsor's wallet
 * for gas costs when the Airnode fulfills requests.
 */

import { promises as fs } from "node:fs";
import * as path from "node:path";
import { deriveSponsorWalletAddress, sponsorRequester } from "@api3/airnode-admin";
import { AirnodeRrpV0Factory } from "@api3/airnode-protocol";
import * as dotenv from "dotenv";
import { ethers } from "ethers";
import type { AirnodeCredentials, SponsorshipInfo } from "../types/airnode";

// Load environment variables
dotenv.config();

export async function setupSponsorship() {
  try {
    console.log("Setting up Airnode sponsorship...");

    // Create config directory if it doesn't exist
    const configDir = path.join(__dirname, "../config/local");
    await fs.mkdir(configDir, { recursive: true });

    // Read the airnode credentials
    const credentialsPath = path.join(configDir, "airnode-credentials.json");
    let credentials: AirnodeCredentials;
    try {
      const credentialsData = await fs.readFile(credentialsPath, "utf8");
      credentials = JSON.parse(credentialsData);
      console.log(`Read Airnode credentials for address: ${credentials.airnodeAddress}`);
    } catch (error) {
      console.error("Error reading Airnode credentials. Please run 10-generate-airnode-credentials.ts first.");
      throw error;
    }

    // Read the config.json to get contract addresses
    const configPath = path.join(configDir, "config.json");
    let config: any;
    try {
      const configData = await fs.readFile(configPath, "utf8");
      config = JSON.parse(configData);
      console.log("Read Airnode configuration");
    } catch (error) {
      console.error("Error reading Airnode config. Please run 20-generate-config.ts first.");
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
        "ETS_ADMIN_PRIVATE_KEY_LOCAL environment variable is not set. " + "This is required for the sponsor wallet.",
      );
    }

    const wallet = new ethers.Wallet(privateKey, provider);
    const sponsorAddress = wallet.address;

    console.log(`Using sponsor wallet: ${sponsorAddress}`);

    // Get the AirnodeRrp contract address from config
    const airnodeRrpAddress = config.chains[0].contracts.AirnodeRrp;
    if (!airnodeRrpAddress) {
      throw new Error("AirnodeRrp address not found in config.json");
    }
    console.log(`AirnodeRrp address: ${airnodeRrpAddress}`);

    // Get the requester contract address (ETSEnrichTarget)
    let requesterAddress: string;
    try {
      // Read ETSEnrichTarget contract address from deployment artifacts
      const etsEnrichTargetPath = path.join(
        __dirname,
        "../../../packages/contracts/deployments/localhost/ETSEnrichTarget.json",
      );
      const etsEnrichTargetData = JSON.parse(await fs.readFile(etsEnrichTargetPath, "utf8"));
      requesterAddress = etsEnrichTargetData.address;

      if (!requesterAddress) {
        throw new Error("ETSEnrichTarget address not found in deployment artifacts");
      }

      console.log(`Found ETSEnrichTarget contract at: ${requesterAddress}`);
    } catch (error) {
      console.error("Error reading ETSEnrichTarget address:", error);
      throw new Error(
        "Could not find ETSEnrichTarget contract address. " +
          "Please ensure the contract is deployed before running this script.",
      );
    }

    // Derive sponsor wallet address
    console.log("Deriving sponsor wallet address...");
    console.log(`Using airnodeXpub: ${credentials.airnodeXpub.substring(0, 20)}...`);
    console.log(`Using airnodeAddress: ${credentials.airnodeAddress}`);
    console.log(`Using sponsorAddress: ${sponsorAddress}`);

    const sponsorWalletAddress = await deriveSponsorWalletAddress(
      credentials.airnodeXpub,
      credentials.airnodeAddress,
      sponsorAddress,
    );

    console.log(`Derived sponsor wallet address: ${sponsorWalletAddress}`);

    // Fund the sponsor wallet
    const fundAmount = ethers.utils.parseEther("0.1"); // 0.1 ETH

    // Check if wallet needs funding
    const balance = await provider.getBalance(sponsorWalletAddress);
    if (balance.lt(fundAmount)) {
      console.log(`Funding sponsor wallet with ${ethers.utils.formatEther(fundAmount)} ETH...`);

      const tx = await wallet.sendTransaction({
        to: sponsorWalletAddress,
        value: fundAmount,
      });

      console.log(`Transaction hash: ${tx.hash}`);
      await tx.wait();
      console.log("Sponsor wallet funded successfully!");
    } else {
      console.log(`Sponsor wallet already has sufficient funds: ${ethers.utils.formatEther(balance)} ETH`);
    }

    // Set up sponsorship relationship
    console.log("Setting up sponsorship relationship...");
    console.log(`AirnodeRrp address: ${airnodeRrpAddress}`);
    console.log(`Requester address: ${requesterAddress}`);

    // Use the airnode-admin SDK to sponsor the requester
    console.log("Calling sponsorRequester from airnode-admin...");
    try {
      console.log("\nSetting up sponsorship relationship...");
      console.log(`AirnodeRrp address: ${airnodeRrpAddress}`);
      console.log(`Requester address: ${requesterAddress}`);

      // Create an instance of the AirnodeRrpV0 contract using the factory
      // This is what the sponsorRequester function expects as its first parameter
      const airnodeRrp = AirnodeRrpV0Factory.connect(airnodeRrpAddress, wallet);

      // Use the sponsorRequester function from airnode-admin
      // Pass the AirnodeRrpV0 instance as the first parameter
      console.log("Sponsoring requester using airnode-admin SDK...");
      const sponsorshipTxHash = await sponsorRequester(
        airnodeRrp, // The AirnodeRrpV0 contract instance
        requesterAddress, // The requester contract address
        {}, // Optional transaction overrides
      );

      console.log(`Sponsorship transaction hash: ${sponsorshipTxHash}`);
      console.log("Sponsorship relationship established successfully!");
    } catch (error) {
      // Check if the error is because the requester is already sponsored
      if (error instanceof Error && error.message.includes("Requester already sponsored")) {
        console.log("Requester is already sponsored by this sponsor. Continuing...");
      } else {
        console.error("Error establishing sponsorship:", error);
        throw error;
      }
    }

    // Get the endpoint ID from config
    const endpointId = config.triggers.rrp[0]?.endpointId;
    if (!endpointId) {
      throw new Error("Endpoint ID not found in config.json");
    }
    console.log(`Using endpoint ID: ${endpointId}`);

    // Save sponsorship info to a file
    const sponsorshipInfo: SponsorshipInfo = {
      sponsorAddress,
      sponsorWalletAddress,
      airnodeAddress: credentials.airnodeAddress,
      airnodeXpub: credentials.airnodeXpub,
      endpointId,
      requesterAddress,
    };

    const sponsorshipPath = path.join(configDir, "sponsorship-info.json");
    await fs.writeFile(sponsorshipPath, JSON.stringify(sponsorshipInfo, null, 2));
    console.log(`Sponsorship information saved to ${sponsorshipPath}`);

    return sponsorshipInfo;
  } catch (error) {
    console.error("Error setting up sponsorship:", error);
    throw error;
  }
}
// For command-line usage
if (require.main === module) {
  setupSponsorship()
    .then(() => console.log("Sponsorship setup completed"))
    .catch((error) => {
      console.error("Error in sponsorship setup:", error);
      process.exit(1);
    });
}
