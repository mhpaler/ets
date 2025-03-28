/**
 * Remove Staging Oracle from AWS
 *
 * This script removes the Airnode deployment from AWS:
 * 1. Finds the latest deployment receipt
 * 2. Uses the airnode-deployer to remove the deployment
 * 3. Updates the deployment-info.json to reflect removal
 *
 * Use this script when you need to:
 * - Redeploy a new version of the oracle
 * - Clean up resources to avoid AWS charges
 * - Troubleshoot deployment issues
 */

import { exec as execCallback } from "node:child_process";
import { promises as fs } from "node:fs";
import path from "node:path";
import util from "node:util";
import * as dotenv from "dotenv";

// Convert exec to promise-based version
const exec = util.promisify(execCallback);

// Load environment variables
dotenv.config();

async function removeOracle() {
  try {
    console.log("Removing Staging Oracle from AWS...");

    // Check for AWS credentials
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
      console.error("Error: AWS credentials not found in environment variables.");
      console.error("Please ensure AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY are set.");
      throw new Error("AWS credentials not found");
    }

    const configDir = path.join(__dirname, "../config/staging");
    const receiptDir = path.join(configDir, "receipts");

    // Check if the receipts directory exists
    try {
      await fs.access(receiptDir);
    } catch (_error) {
      console.error(`Receipts directory not found at ${receiptDir}`);
      throw new Error("Oracle may not be deployed yet");
    }

    // Find the most recent receipt file
    const files = await fs.readdir(receiptDir);
    const receiptFiles = files.filter((file) => file.startsWith("receipt-")).sort();

    if (receiptFiles.length === 0) {
      throw new Error("No deployment receipt found");
    }

    const latestReceiptFile = receiptFiles[receiptFiles.length - 1];
    const latestReceiptPath = path.join(receiptDir, latestReceiptFile);

    console.log(`Using latest receipt file: ${latestReceiptFile}`);

    // Check if the airnode deployer is available
    try {
      await exec("npx @api3/airnode-deployer --version");
      console.log("Airnode deployer is available");
    } catch (_error) {
      console.log("Installing Airnode deployer...");
      await exec("npm install -g @api3/airnode-deployer");
    }

    // Remove the deployment
    console.log(`Removing deployment from AWS using receipt: ${latestReceiptPath}`);
    const removeCommand = `npx @api3/airnode-deployer remove --receipt ${latestReceiptPath}`;

    const { stdout, stderr } = await exec(removeCommand);

    if (stderr) {
      console.warn("Removal warnings:", stderr);
    }

    console.log("Removal output:", stdout);
    console.log("\n✅ Oracle removal completed successfully!");

    // Update deployment-info to reflect removed status
    const deploymentInfoPath = path.join(configDir, "deployment-info.json");
    try {
      const deploymentInfo = JSON.parse(await fs.readFile(deploymentInfoPath, "utf8"));
      deploymentInfo.status = "removed";
      deploymentInfo.removalTimestamp = new Date().toISOString();
      await fs.writeFile(deploymentInfoPath, JSON.stringify(deploymentInfo, null, 2));
      console.log("Updated deployment info to reflect removal");
    } catch (error) {
      console.warn("Could not update deployment info file:", error);
    }

    return true;
  } catch (error) {
    console.error("Error removing Oracle:", error);
    throw error;
  }
}

// For command-line usage
if (require.main === module) {
  removeOracle()
    .then(() => {
      console.log("Oracle removal completed successfully");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Error in Oracle removal:", error);
      process.exit(1);
    });
}
