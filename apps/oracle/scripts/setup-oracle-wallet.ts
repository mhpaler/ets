import { promises as fs } from "node:fs";
import * as path from "node:path";
import { deriveSponsorWalletAddress } from "@api3/airnode-admin";
import * as dotenv from "dotenv";
import { ethers } from "ethers";

// Load environment variables
dotenv.config();

async function main() {
  // Connect to the Ethereum provider
  const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL || "http://localhost:8545");

  // Use private key from env or default test key
  const privateKey =
    process.env.ETS_ADMIN_PRIVATE_KEY_LOCAL || "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"; // Default Hardhat account #0
  const wallet = new ethers.Wallet(privateKey, provider);

  console.log("Connected to network with wallet:", wallet.address);

  // Load config to get airnode address
  const configPath = path.join(__dirname, "../config/local/config.json");
  const configData = await fs.readFile(configPath, "utf8");
  const config = JSON.parse(configData);

  // Read the mnemonic from the new environment variable or fallback to test mnemonic
  const mnemonic = process.env.MNEMONIC_AIRNODE_LOCAL || "test test test test test test test test test test test junk";
  console.log(`Using mnemonic: ${mnemonic.substring(0, 10)}...`);

  try {
    // Create HD node from mnemonic - ethers v5 style
    const hdNode = ethers.utils.HDNode.fromMnemonic(mnemonic);

    // Derive the Airnode wallet at m/44'/60'/0' (master path for Airnode)
    const airnodeMasterHdNode = hdNode.derivePath("m/44'/60'/0'");

    // Get the extended key by calling the method directly
    const xpub = airnodeMasterHdNode.neuter().extendedKey;

    // Get the Airnode address at m/44'/60'/0'/0/0
    const airnodeAddress = hdNode.derivePath("m/44'/60'/0'/0/0").address;

    console.log("Airnode xpub:", xpub);
    console.log("Airnode address:", airnodeAddress);

    // Get the RRP contract address
    const rrpAddress = config.chains[0].contracts.AirnodeRrp;
    console.log("AirnodeRrp address:", rrpAddress);

    // IMPORTANT: Use the ETSEnrichTarget contract as the sponsor
    //TODO: Read address from @ethereum-tag-service/contracts package
    const ETSEnrichTargetAddress = "0x46b142DD1E924FAb83eCc3c08e4D46E82f005e0E"; // Your deployed contract address
    console.log("Using ETSEnrichTarget as sponsor:", ETSEnrichTargetAddress);

    // Derive sponsor wallet address
    // Correct function call with all three required arguments
    const sponsorWalletAddress = await deriveSponsorWalletAddress(
      xpub, // First parameter: airnodeXpub
      airnodeAddress, // Second parameter: airnodeAddress
      ETSEnrichTargetAddress, // Third parameter: sponsorAddress
    );
    console.log("Generated sponsor wallet address:", sponsorWalletAddress);

    // Fund the sponsor wallet
    const fundAmount = ethers.utils.parseEther("0.1"); // 0.1 ETH

    // Check if wallet needs funding
    const balance = await provider.getBalance(sponsorWalletAddress);
    if (balance.lt(fundAmount)) {
      console.log("Funding sponsor wallet with", ethers.utils.formatEther(fundAmount), "ETH...");

      const tx = await wallet.sendTransaction({
        to: sponsorWalletAddress,
        value: fundAmount,
      });

      console.log("Transaction hash:", tx.hash);
      await tx.wait();

      console.log("Sponsor wallet funded successfully!");

      // Save sponsor wallet info to a file for easy reference
      const sponsorInfo = {
        sponsorAddress: ETSEnrichTargetAddress,
        sponsorWalletAddress: sponsorWalletAddress,
        airnodeAddress: airnodeAddress,
        airnodeXpub: xpub,
        endpointId: config.triggers.rrp[0].endpointId, // Read from config instead of hardcoding
      };

      await fs.writeFile(
        path.join(__dirname, "../config/local/sponsor-info.json"),
        JSON.stringify(sponsorInfo, null, 2),
      );

      console.log("Sponsor information saved to config/local/sponsor-info.json");
    } else {
      console.log("Sponsor wallet already has sufficient funds!");
    }

    return {
      airnodeAddress,
      sponsorWalletAddress,
      endpointId: config.triggers.rrp[0].endpointId, // Read from config instead of hardcoding
    };
  } catch (error) {
    console.error("Error setting up sponsor wallet:", error);
    throw error;
  }
}

main()
  .then((result) => {
    console.log("Setup completed successfully!", result);
    process.exit(0);
  })
  .catch((error) => {
    console.error("Error setting up sponsor wallet:", error);
    process.exit(1);
  });
