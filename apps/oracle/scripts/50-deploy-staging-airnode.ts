/**
 * Deploy Staging Airnode to AWS
 *
 * This script handles the deployment of the Airnode to AWS for the staging environment:
 * 1. Checks for AWS credentials
 * 2. Uses the Airnode deployer CLI to deploy the Airnode
 * 3. Saves the deployment details to a receipt file
 * 4. Creates a deployment-info.json file with critical information
 *
 * Prerequisites:
 * - AWS credentials must be configured
 * - Staging configuration must be generated
 * - Airnode deployer must be installed globally or available through npx
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

export async function deployStagingAirnode() {
  try {
    console.log("Deploying Staging Airnode to AWS...");

    // Check for AWS credentials
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
      console.error("Error: AWS credentials not found in environment variables.");
      console.error("Please ensure AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY are set.");
      throw new Error("AWS credentials not found");
    }

    // Check if the Airnode deployer is installed
    try {
      await exec("npx @api3/airnode-deployer --version");
      console.log("Airnode deployer is available");
    } catch (_error) {
      console.log("Installing Airnode deployer...");
      await exec("npm install -g @api3/airnode-deployer");
    }

    const configDir = path.join(__dirname, "../config/staging");
    const receiptDir = path.join(configDir, "receipts");

    // Create receipts directory if it doesn't exist
    await fs.mkdir(receiptDir, { recursive: true });

    // Deploy using Airnode deployer
    console.log("Starting deployment... (this may take a few minutes)");
    const receiptPath = path.join(receiptDir, `receipt-${Date.now()}.json`);

    const deployCommand = `npx @api3/airnode-deployer deploy \
      --config ${path.join(configDir, "config.json")} \
      --secrets ${path.join(configDir, "secrets.env")} \
      --receipt ${receiptPath}`;

    // Execute deployment
    const { stdout, stderr } = await exec(deployCommand);

    if (stderr) {
      console.warn("Deployment warnings:", stderr);
    }

    console.log("Deployment output:", stdout);

    // Check if receipt file was created
    try {
      await fs.access(receiptPath);
    } catch (_error) {
      throw new Error(`Deployment failed: No receipt file found at ${receiptPath}`);
    }

    // Load the receipt data
    const receiptData = JSON.parse(await fs.readFile(receiptPath, "utf8"));

    console.log("\nDeployment completed successfully!");
    console.log("Deployment details:");
    console.log(`- Airnode Address: ${receiptData.airnodeWallet.airnodeAddress}`);
    console.log(`- Stage: ${receiptData.deployment.stage}`);
    console.log(`- Region: ${receiptData.deployment.region}`);
    console.log(`- HTTP Gateway URL: ${receiptData.deployment.httpGatewayUrl}`);

    // Create a deployment-info.json file with critical information
    const deploymentInfo = {
      airnodeAddress: receiptData.airnodeWallet.airnodeAddress,
      httpGatewayUrl: receiptData.deployment.httpGatewayUrl,
      deploymentTimestamp: new Date().toISOString(),
      environment: "staging",
      receiptFile: path.basename(receiptPath),
    };

    await fs.writeFile(path.join(configDir, "deployment-info.json"), JSON.stringify(deploymentInfo, null, 2));

    console.log("\nDeployment info saved to:", path.join(configDir, "deployment-info.json"));
    return true;
  } catch (error) {
    console.error("Error deploying Airnode to AWS:", error);
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
