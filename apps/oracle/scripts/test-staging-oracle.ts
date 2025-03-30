/**
 * Staging Oracle Test Script
 *
 * This script tests the deployed Oracle by making a direct request to the
 * ETSEnrichTarget contract on the staging environment and verifying the response.
 */

import fs from "node:fs/promises";
import path from "node:path";
import * as dotenv from "dotenv";
import * as ethers from "ethers";

// Load environment variables from .env.staging file
dotenv.config({ path: path.join(__dirname, "../.env.staging") });

async function testStagingOracle() {
  try {
    console.log("=== Testing Staging Oracle Integration ===");

    // Connect to Arbitrum Sepolia testnet
    const providerUrl = process.env.ARBITRUM_SEPOLIA_URL || "https://sepolia-rollup.arbitrum.io/rpc";
    const provider = new ethers.providers.JsonRpcProvider(providerUrl);

    // Load wallet (we need to make a transaction)
    if (!process.env.PRIVATE_KEY) {
      throw new Error("PRIVATE_KEY environment variable is required for testing");
    }

    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    console.log(`Connected with address: ${wallet.address}`);

    // Get contract artifacts
    console.log("Loading contract artifacts...");
    const etsEnrichTargetPath = path.join(
      __dirname,
      "../../../packages/contracts/deployments/arbitrumSepoliaStaging/ETSEnrichTarget.json",
    );

    const etsDataPath = path.join(__dirname, "../../../packages/contracts/deployments/arbitrumSepoliaStaging/ETS.json");

    // Load contract ABI and address
    const etsEnrichTargetData = JSON.parse(await fs.readFile(etsEnrichTargetPath, "utf8"));
    const etsData = JSON.parse(await fs.readFile(etsDataPath, "utf8"));

    // Create contract instances
    const etsEnrichTarget = new ethers.Contract(etsEnrichTargetData.address, etsEnrichTargetData.abi, wallet);

    const ets = new ethers.Contract(etsData.address, etsData.abi, wallet);

    // Get current Oracle configuration
    console.log("\nCurrent ETSEnrichTarget configuration:");
    const airnode = await etsEnrichTarget.airnode();
    const endpointIdHex = await etsEnrichTarget.endpointId();
    const sponsorWallet = await etsEnrichTarget.sponsorWallet();

    console.log(`- Airnode: ${airnode}`);
    console.log(`- Endpoint ID: ${endpointIdHex}`);
    console.log(`- Sponsor Wallet: ${sponsorWallet}`);

    // Create a test target to enrich
    console.log("\nWe need a test target to enrich. Let's check if there's a recent target...");

    // Get the most recent target ID
    const totalTargets = await ets.totalTargets();
    if (totalTargets.eq(0)) {
      throw new Error("No targets found in the ETS contract. Please create a target first.");
    }

    console.log(`Found ${totalTargets.toString()} targets`);

    // Get the most recent target
    const targetId = totalTargets.sub(1);
    const targetData = await ets.targets(targetId);

    console.log(`Using target #${targetId}:`);
    console.log(`- URI: ${targetData.uri}`);
    console.log(`- Type: ${targetData.targetType}`);
    console.log(`- Creator: ${targetData.creator}`);

    // Check if this target has already been enriched
    const currentMetadata = await etsEnrichTarget.targetMetadata(targetId);
    if (
      currentMetadata.arweaveTxId &&
      currentMetadata.arweaveTxId !== "0x0000000000000000000000000000000000000000000000000000000000000000"
    ) {
      console.log(`\nTarget #${targetId} already has metadata:`);
      console.log(`- Arweave TX: ${currentMetadata.arweaveTxId}`);
      console.log(`- Title: ${currentMetadata.title}`);
      console.log(`- Description: ${ethers.utils.parseBytes32String(currentMetadata.description)}`);

      // Ask if user wants to re-enrich anyway
      console.log("\nDo you want to re-enrich this target? (Y/n)");
      const readlineSync = require("readline-sync");
      const answer = readlineSync.question("> ");
      if (answer.toLowerCase() !== "y") {
        console.log("Test aborted. Choose a different target or create a new one.");
        return;
      }
    }

    // Make a request to enrich the target
    console.log("\nMaking a request to enrich the target...");
    const tx = await etsEnrichTarget.makeOracleRequest(targetId);
    console.log(`Transaction submitted: ${tx.hash}`);

    // Wait for transaction confirmation
    console.log("Waiting for transaction confirmation...");
    await tx.wait();
    console.log("Transaction confirmed!");

    // Now we need to monitor for the callback
    console.log("\nMonitoring for Oracle callback... (this may take a minute)");
    console.log("The Airnode should pick up the request and call back with the metadata.");

    // Create a promise that resolves when the TargetMetadataUpdated event is emitted
    const metadataPromise = new Promise((resolve, reject) => {
      // Set a timeout to reject after 5 minutes
      const timeout = setTimeout(
        () => {
          reject(new Error("Timeout waiting for Oracle callback (5 minutes)"));
        },
        5 * 60 * 1000,
      );

      // Listen for the TargetMetadataUpdated event
      etsEnrichTarget.on("TargetMetadataUpdated", (tokenId, metadata, event) => {
        if (tokenId.eq(targetId)) {
          clearTimeout(timeout);
          resolve({ tokenId, metadata, event });
        }
      });
    });

    // Wait for the Oracle callback
    try {
      const { metadata } = await metadataPromise;
      console.log("\n✅ Target metadata updated successfully!");
      console.log("Target Metadata:");
      console.log(`- Arweave TX: ${metadata.arweaveTxId}`);
      console.log(`- Title: ${metadata.title}`);
      console.log(`- Description: ${ethers.utils.parseBytes32String(metadata.description)}`);
      console.log(`- Image URL: ${metadata.imageUrl}`);

      console.log("\n🎉 Staging Oracle is working correctly!");
    } catch (error) {
      console.error("\n❌ Error waiting for Oracle callback:", error);
      throw new Error("Oracle callback test failed. The Oracle may not be processing requests correctly.");
    }

    return true;
  } catch (error) {
    console.error("Error testing Oracle:", error);
    throw error;
  }
}

// Run the test when executed directly
if (require.main === module) {
  testStagingOracle()
    .then(() => {
      console.log("\nTest completed successfully");
      process.exit(0);
    })
    .catch((error) => {
      console.error(`\nTest failed: ${error.message}`);
      process.exit(1);
    });
}

export default testStagingOracle;
