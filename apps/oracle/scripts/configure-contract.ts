/**
 * Oracle Contract Configuration Script
 *
 * This script configures the ETSEnrichTarget contract to work with Airnode:
 * 1. Connects to the Ethereum provider (Hardhat node)
 * 2. Loads sponsor wallet information from sponsor.json
 * 3. Gets contract addresses from deployment artifacts
 * 4. Sets up request parameters on the ETSEnrichTarget contract
 * 5. Associates the sponsor wallet with the Airnode
 *
 * Prerequisites:
 * - Hardhat node must be running
 * - ETSEnrichTarget contract must be deployed
 * - setup-oracle-wallet.ts must have been executed first
 *
 * Inputs:
 * - Reads wallet information from config/local/sponsor.json
 *
 * Runtime: This script runs quickly (a few seconds)
 */
import { promises as fs } from "node:fs";
import * as path from "node:path";
import * as dotenv from "dotenv";
import { ethers } from "ethers";

// Load environment variables
dotenv.config();

// Load ETSEnrichTarget ABI - just the function we need
const enrichTargetAbi = [
  "function setAirnodeRequestParameters(address _airnode, bytes32 _endpointId, address _sponsorWallet) external",
];

// Export the main function
export async function configureContract() {
  // Existing implementation code here
  try {
    // Connect to the Ethereum provider
    const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL || "http://localhost:8545");

    // Use admin private key - this account needs to have admin rights on the contract
    const privateKey =
      process.env.ETS_ADMIN_PRIVATE_KEY_LOCAL || "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"; // Default Hardhat account #0
    const wallet = new ethers.Wallet(privateKey, provider);

    console.log(`Connected to network with admin wallet: ${wallet.address}`);

    // Load sponsorInfo from the file
    const sponsorInfoPath = path.join(__dirname, "../config/local/sponsor-info.json");

    try {
      await fs.access(sponsorInfoPath);
    } catch (_error) {
      console.error("sponsor-info.json not found. Please run setup-oracle-wallet.ts first.");
      process.exit(1);
    }

    const sponsorInfoData = await fs.readFile(sponsorInfoPath, "utf8");
    const sponsorInfo = JSON.parse(sponsorInfoData);

    // ETSEnrichTarget contract address
    const contractAddress = sponsorInfo.sponsorAddress;
    console.log(`Configuring ETSEnrichTarget at address: ${contractAddress}`);

    // Create contract instance
    const etsEnrichTarget = new ethers.Contract(contractAddress, enrichTargetAbi, wallet);

    // Call setAirnodeRequestParameters with the values from sponsorInfo
    console.log("Setting Airnode parameters...");
    console.log(`Airnode: ${sponsorInfo.airnodeAddress}`);
    console.log(`Endpoint ID: ${sponsorInfo.endpointId}`);
    console.log(`Sponsor Wallet: ${sponsorInfo.sponsorWalletAddress}`);

    const tx = await etsEnrichTarget.setAirnodeRequestParameters(
      sponsorInfo.airnodeAddress,
      sponsorInfo.endpointId,
      sponsorInfo.sponsorWalletAddress,
    );

    console.log(`Transaction submitted: ${tx.hash}`);
    await tx.wait();
    console.log("Transaction confirmed! Contract successfully configured.");

    return {
      success: true,
      address: contractAddress,
      transaction: tx.hash,
    };
  } catch (error) {
    console.error("Error configuring contract:", error);
    throw error;
  }
}

// For command-line usage
if (require.main === module) {
  configureContract()
    .then(() => console.log("Contract configuration completed"))
    .catch((error) => {
      console.error("Error configuring contract:", error);
      process.exit(1);
    });
}
