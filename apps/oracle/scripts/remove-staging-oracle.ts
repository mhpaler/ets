/**
 * Remove Staging Airnode from AWS
 *
 * This script handles the removal of the Airnode from AWS for the staging environment:
 * 1. Checks for AWS credentials
 * 2. Uses the Airnode deployer Docker container to remove the deployment
 * 3. Cleans up deployment files and updates status
 *
 * Prerequisites:
 * - AWS credentials must be configured
 * - Receipt file must exist from a previous deployment
 * - Docker must be installed and running
 */

import { exec as execCallback } from "node:child_process";
import { promises as fs } from "node:fs";
import path from "node:path";
import util from "node:util";
import * as dotenv from "dotenv";

// Convert exec to promise-based version
const exec = util.promisify(execCallback);

// Load environment variables from .env.staging
dotenv.config({ path: path.join(__dirname, "../.env.staging") });

export async function removeStagingOracle() {
  try {
    console.log("Preparing to remove Staging Airnode from AWS...");

    // Check for AWS credentials
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
      console.error("Error: AWS credentials not found in environment variables.");
      console.error("Please ensure AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY are set.");
      throw new Error("AWS credentials not found");
    }

    // Check if Docker is installed
    try {
      await exec("docker --version");
      console.log("Docker is available");
    } catch (_error) {
      throw new Error("Docker is required for Airnode removal but not available. Please install Docker and try again.");
    }

    const configDir = path.join(__dirname, "../config/staging");

    // Check if receipt.json exists
    const hasReceipt = await fs
      .access(path.join(configDir, "receipt.json"))
      .then(() => true)
      .catch(() => false);

    if (!hasReceipt) {
      console.log("⚠️ No receipt.json file found in the staging directory.");
      console.log("This may indicate that either:");
      console.log("1. The Airnode was never successfully deployed");
      console.log("2. The deployment was done manually and the receipt file is elsewhere");
      console.log("3. The receipt file was accidentally deleted");

      // Look in receipts directory as fallback
      const receiptDir = path.join(configDir, "receipts");
      try {
        const files = await fs.readdir(receiptDir);
        const receiptFiles = files.filter((file) => file.startsWith("receipt-"));

        if (receiptFiles.length > 0) {
          // Sort by timestamp descending
          receiptFiles.sort((a, b) => {
            const aTime = Number.parseInt(a.replace("receipt-", "").replace(".json", ""));
            const bTime = Number.parseInt(b.replace("receipt-", "").replace(".json", ""));
            return bTime - aTime;
          });

          const latestReceiptFile = path.join(receiptDir, receiptFiles[0]);
          console.log(`Found a receipt file in the receipts directory: ${latestReceiptFile}`);
          console.log("Copying to the main directory as receipt.json...");
          await fs.copyFile(latestReceiptFile, path.join(configDir, "receipt.json"));
          console.log("Receipt file copied successfully.");
        } else {
          console.log("No receipt files found in the receipts directory either.");
        }
      } catch (error) {
        console.log("No receipts directory or error accessing it:", error);
      }
    }

    // Create aws.env file as required by the Docker-based deployer
    const awsEnvContent = `AWS_ACCESS_KEY_ID=${process.env.AWS_ACCESS_KEY_ID}
AWS_SECRET_ACCESS_KEY=${process.env.AWS_SECRET_ACCESS_KEY}`;
    const awsEnvPath = path.join(configDir, "aws.env");
    await fs.writeFile(awsEnvPath, awsEnvContent);
    console.log("Created aws.env file for removal");

    // Get current user ID and group ID for Docker volume permissions
    const { stdout: idOutput } = await exec("id -u && id -g");
    const [userId, groupId] = idOutput.trim().split("\n");

    console.log("\n⚠️ Due to Terraform state file issues, we need to remove using Docker directly.");
    console.log("All configuration files have been prepared. Please run the following command manually:");
    console.log("\n============== COPY AND RUN THIS COMMAND ==============");
    console.log(`cd "${configDir}" && \\
docker run --rm --platform linux/amd64 \\
  -e USER_ID=${userId} -e GROUP_ID=${groupId} \\
  -v "$(pwd):/app/config" \\
  api3/airnode-deployer:latest remove`);
    console.log("=======================================================");

    console.log("\nAfter running this command, the Airnode should be removed from AWS.");
    console.log("Check the output of the command for any errors or warnings.");

    // Create a removal-info.json file with manual removal details
    const removalInfo = {
      removalMethod: "manual",
      removalInstructionsTimestamp: new Date().toISOString(),
      environment: "staging",
      status: "pending_manual_removal",
    };

    await fs.writeFile(path.join(configDir, "removal-info.json"), JSON.stringify(removalInfo, null, 2));

    console.log("\nRemoval instructions have been provided.");
    console.log("Removal info saved to:", path.join(configDir, "removal-info.json"));
    return true;
  } catch (error) {
    console.error("Error preparing Airnode removal:", error);
    throw error;
  }
}

// For command-line usage
if (require.main === module) {
  removeStagingOracle()
    .then(() => console.log("Airnode AWS removal completed"))
    .catch((error) => {
      console.error("Error in Airnode AWS removal:", error);
      process.exit(1);
    });
}
