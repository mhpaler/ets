/**
 * Staging Airnode Sponsorship Setup
 *
 * This script sets up the sponsorship relationship between the admin wallet and
 * the staging ETSEnrichTarget contract:
 * 1. Reads airnodeAddress and xpub from staging credentials
 * 2. Identifies sponsorAddress (admin wallet)
 * 3. Derives sponsorWallet using deriveSponsorWalletAddress
 * 4. Funds sponsorWallet with ETH
 * 5. Calls sponsorRequester on AirnodeRrpV0
 * 6. Saves sponsorship info to a JSON file
 */

import { promises as fs } from "node:fs";
import * as path from "node:path";
import { deriveSponsorWalletAddress, sponsorRequester } from "@api3/airnode-admin";
import { AirnodeRrpV0Factory } from "@api3/airnode-protocol";
import * as dotenv from "dotenv";
import { ethers } from "ethers";
import type { AirnodeCredentials, SponsorshipInfo } from "../types/airnode";

// Load environment variables from .env.staging
dotenv.config({ path: path.join(__dirname, "../.env.staging") });

export async function setupStagingSponsorship() {
  try {
    console.log("Setting up Staging Airnode sponsorship...");

    // Create config directory if it doesn't exist
    const configDir = path.join(__dirname, "../config/staging");
    await fs.mkdir(configDir, { recursive: true });

    // Read the airnode credentials
    const credentialsPath = path.join(configDir, "airnode-credentials.json");
    let credentials: AirnodeCredentials;
    try {
      const credentialsData = await fs.readFile(credentialsPath, "utf8");
      credentials = JSON.parse(credentialsData);
      console.log(`Read Staging Airnode credentials for address: ${credentials.airnodeAddress}`);
    } catch (error) {
      console.error(
        "Error reading Staging Airnode credentials. Please run generate-airnode-credentials for staging first.",
      );
      throw error;
    }

    // Read the config.json to get contract addresses
    const configPath = path.join(configDir, "config.json");
    let config: any;
    try {
      const configData = await fs.readFile(configPath, "utf8");
      config = JSON.parse(configData);
      console.log("Read Staging Airnode configuration");
    } catch (error) {
      console.error("Error reading Staging Airnode config. Please run generate-staging-config first.");
      throw error;
    }

    // Connect to the Ethereum provider
    const rpcUrl = process.env.ARBITRUM_SEPOLIA_URL || "https://sepolia-rollup.arbitrum.io/rpc";
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    console.log(`Connected to Arbitrum Sepolia provider at: ${rpcUrl}`);

    // Get sponsor private key from environment
    const privateKey = process.env.SPONSOR_PK;
    if (!privateKey) {
      throw new Error("SPONSOR_PK environment variable is not set. " + "This is required for the sponsor wallet.");
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

    // Get the requester contract address (ETSEnrichTarget) for staging
    let requesterAddress: string;
    try {
      // Read ETSEnrichTarget contract address from staging deployment artifacts
      const etsEnrichTargetPath = path.join(
        __dirname,
        "../../../packages/contracts/deployments/arbitrumSepoliaStaging/ETSEnrichTarget.json",
      );
      const etsEnrichTargetData = JSON.parse(await fs.readFile(etsEnrichTargetPath, "utf8"));
      requesterAddress = etsEnrichTargetData.address;

      if (!requesterAddress) {
        throw new Error("Staging ETSEnrichTarget address not found in deployment artifacts");
      }

      console.log(`Found Staging ETSEnrichTarget contract at: ${requesterAddress}`);
    } catch (error) {
      console.error("Error reading Staging ETSEnrichTarget address:", error);
      throw new Error(
        "Could not find Staging ETSEnrichTarget contract address. " +
          "Please ensure the contract is deployed to the staging environment before running this script.",
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
    const fundAmount = ethers.utils.parseEther("0.05"); // 0.05 ETH - smaller amount for testnet

    // Check if wallet needs funding
    const balance = await provider.getBalance(sponsorWalletAddress);
    if (balance.lt(fundAmount)) {
      console.log(`Funding sponsor wallet with ${ethers.utils.formatEther(fundAmount)} ETH...`);

      // Check if the sponsor wallet has enough funds
      const sponsorBalance = await wallet.getBalance();
      if (sponsorBalance.lt(fundAmount.add(ethers.utils.parseEther("0.01")))) {
        throw new Error(
          `Sponsor wallet has insufficient funds: ${ethers.utils.formatEther(sponsorBalance)} ETH. ` +
            `Please ensure the sponsor wallet has at least ${ethers.utils.formatEther(fundAmount.add(ethers.utils.parseEther("0.01")))} ETH.`,
        );
      }

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

    // Create an instance of the AirnodeRrpV0 contract using the factory
    const airnodeRrp = AirnodeRrpV0Factory.connect(airnodeRrpAddress, wallet);

    // Use the sponsorRequester function from airnode-admin
    try {
      console.log("Sponsoring requester using airnode-admin SDK...");
      const sponsorshipTxHash = await sponsorRequester(
        airnodeRrp, // The AirnodeRrpV0 contract instance
        requesterAddress, // The requester contract address
        {
          gasLimit: 500000, // Higher gas limit for testnet
          gasPrice: ethers.utils.parseUnits("1.5", "gwei"), // Adjust gas price for testnet
        },
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

    // Save configuration details to a file (including sponsorship info)
    const configDetails = {
      // Sponsorship information
      sponsorAddress,
      sponsorWalletAddress,
      airnodeAddress: credentials.airnodeAddress,
      airnodeXpub: credentials.airnodeXpub,
      endpointId,
      requesterAddress,
      environment: "staging",

      // Build process tracking
      sponsorshipTimestamp: new Date().toISOString(),
      sponsorshipSuccess: true,
      deploymentStatus: "pending_configuration", // Will be updated in subsequent steps
      buildSteps: {
        credentials: true,
        config: true,
        sponsorship: true,
        requesterConfig: false,
        deployment: false,
      },
    };

    const configDetailsPath = path.join(configDir, "configuration-details.json");
    await fs.writeFile(configDetailsPath, JSON.stringify(configDetails, null, 2));
    console.log(`Configuration details saved to ${configDetailsPath}`);

    return configDetails;
  } catch (error) {
    console.error("Error setting up sponsorship for staging:", error);
    throw error;
  }
}

// For command-line usage
if (require.main === module) {
  setupStagingSponsorship()
    .then(() => console.log("Staging sponsorship setup completed"))
    .catch((error) => {
      console.error("Error in staging sponsorship setup:", error);
      process.exit(1);
    });
}
