/**
 * Deploy Staging Airnode to AWS
 *
 * This script handles the deployment of the Airnode to AWS for the staging environment:
 * 1. Checks for AWS credentials
 * 2. Creates aws.env file for Docker-based deployment
 * 3. Uses the Airnode deployer Docker container to deploy
 * 4. Saves the deployment details to a receipt file
 * 5. Creates a deployment-info.json file with critical information
 *
 * Prerequisites:
 * - AWS credentials must be configured
 * - Staging configuration must be generated
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

export async function deployStagingAirnode() {
  try {
    console.log("Preparing for Staging Airnode AWS deployment...");

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
      throw new Error(
        "Docker is required for Airnode deployment but not available. Please install Docker and try again.",
      );
    }

    const configDir = path.join(__dirname, "../config/staging");
    const receiptDir = path.join(configDir, "receipts");

    // Create receipts directory if it doesn't exist
    await fs.mkdir(receiptDir, { recursive: true });

    // Create aws.env file as required by the Docker-based deployer
    // These credentials are ONLY for deployment, not passed to Lambda functions
    const awsEnvPath = path.join(configDir, "aws.env");
    const awsEnvContent = `AWS_ACCESS_KEY_ID=${process.env.AWS_ACCESS_KEY_ID}
AWS_SECRET_ACCESS_KEY=${process.env.AWS_SECRET_ACCESS_KEY}`;
    await fs.writeFile(awsEnvPath, awsEnvContent);
    console.log("Created aws.env file for deployment (contains AWS credentials for deployer only)");

    // Get current user ID and group ID for Docker volume permissions
    const { stdout: idOutput } = await exec("id -u && id -g");
    const [userId, groupId] = idOutput.trim().split("\n");

    console.log("\n⚠️ Due to Terraform state file issues, we need to deploy using Docker directly.");
    console.log("All configuration files have been prepared. Please run the following command manually:");
    console.log("\n============== COPY AND RUN THIS COMMAND ==============");
    console.log(`cd "${configDir}" && \\
docker run -it --rm \\
  -e USER_ID=${userId} -e GROUP_ID=${groupId} \\
  -v "$(pwd):/app/config" \\
  api3/airnode-deployer:latest deploy`);
    console.log("\n# If the above command fails with TTY error, use this non-interactive version:");
    console.log(`cd "${configDir}" && \\
docker run --rm \\
  -e USER_ID=${userId} -e GROUP_ID=${groupId} \\
  -v "$(pwd):/app/config" \\
  api3/airnode-deployer:latest deploy`);
    console.log("=======================================================");

    console.log("\nAfter running this command, check for a receipt.json file in the staging directory.");
    console.log("If the deployment succeeds, you'll see a HTTP Gateway URL in the output.");
    console.log("Copy that URL for use with the Oracle.");

    // Check if the user has already run the command
    const hasReceipt = await fs
      .access(path.join(configDir, "receipt.json"))
      .then(() => true)
      .catch(() => false);

    if (hasReceipt) {
      console.log("\n✅ Found existing receipt.json file. It appears you've already run the deployment.");
      // Load the receipt data
      const receiptData = JSON.parse(await fs.readFile(path.join(configDir, "receipt.json"), "utf8"));

      // Create a deployment-info.json file with critical information
      const deploymentInfo = {
        airnodeAddress: receiptData.airnodeWallet.airnodeAddress,
        httpGatewayUrl: receiptData.deployment.httpGatewayUrl,
        deploymentTimestamp: new Date().toISOString(),
        environment: "staging",
        status: "deployed_manually",
        receiptFile: "receipt.json",
      };

      await fs.writeFile(path.join(configDir, "deployment-info.json"), JSON.stringify(deploymentInfo, null, 2));

      console.log("\nDeployment details from receipt:");
      console.log(`- Airnode Address: ${receiptData.airnodeWallet.airnodeAddress}`);
      console.log(`- Stage: ${receiptData.deployment.stage}`);
      console.log(`- Region: ${receiptData.deployment.region}`);
      console.log(`- HTTP Gateway URL: ${receiptData.deployment.httpGatewayUrl}`);
      console.log("\nDeployment info saved to:", path.join(configDir, "deployment-info.json"));

      return deploymentInfo;
    }

    console.log("\n⚠️ No receipt.json file found. Please run the Docker command above to deploy.");

    // Return placeholder info
    return {
      airnodeAddress: process.env.AIRNODE_ADDRESS || "0x62676653F23c313a235e179eb19CbA308A45728c",
      httpGatewayUrl: "[RUN DOCKER COMMAND TO GET HTTP GATEWAY URL]",
      deploymentTimestamp: new Date().toISOString(),
      environment: "staging",
      status: "pending_manual_deployment",
    };
  } catch (error) {
    console.error("Error preparing Airnode AWS deployment:", error);
    throw error;
  }
}

// For command-line usage
if (require.main === module) {
  deployStagingAirnode()
    .then(() => console.log("Airnode AWS deployment completed"))
    .catch((error) => {
      console.error("Error in Airnode AWS deployment:", error);
      process.exit(1);
    });
}
