/**
 * Staging Oracle Deployment Script
 *
 * This script orchestrates the complete setup and deployment of the
 * ETS Oracle service to AWS for the staging environment.
 *
 * Workflow:
 * 1. Generate Airnode Credentials for staging
 * 2. Generate Staging Airnode configuration
 * 3. Setup sponsorship relationship
 * 4. Configure staging ETSEnrichTarget requester contract
 * 5. Deploy Airnode to AWS cloud
 *
 * Prerequisites:
 * - AWS credentials must be configured
 * - Staging contracts must be deployed to Arbitrum Sepolia
 * - Admin wallet with ETH for transactions must be available
 * - Staging API must be deployed and accessible
 */

import { exec as execCallback } from "node:child_process";
import { promises as fs } from "node:fs";
import { EOL } from "node:os";
import * as path from "node:path";
import util from "node:util";
import * as dotenv from "dotenv";
import readlineSync from "readline-sync";

// Convert exec to promise-based version
const exec = util.promisify(execCallback);

// Load environment variables from .env.staging
dotenv.config({ path: path.join(__dirname, "../.env.staging") });

import { generateStagingCredentials } from "./10-generate-staging-credentials";
import { generateStagingConfig } from "./20-generate-staging-config";
import { setupStagingSponsorship } from "./30-setup-staging-sponsorship";
import { configureStagingRequester } from "./40-configure-staging-requester";
import { deployStagingAirnode } from "./50-deploy-staging-airnode";

/**
 * Checks for existing Airnode deployments on AWS
 * @returns A promise that resolves to true if an Airnode is detected, false otherwise
 */
async function checkForExistingAirnode(): Promise<boolean> {
  console.log("Checking for existing Airnode deployments...");
  const configDir = path.join(__dirname, "../config/staging");

  // First check: Look for a receipt.json file which indicates a deployment
  try {
    const receiptPath = path.join(configDir, "receipt.json");
    const hasReceipt = await fs
      .access(receiptPath)
      .then(() => true)
      .catch(() => false);

    if (hasReceipt) {
      try {
        // Try to read the receipt to get details
        const receiptData = JSON.parse(await fs.readFile(receiptPath, "utf8"));
        const deploymentId = receiptData.deployment?.deploymentId;
        const airnodeAddress = receiptData.airnodeWallet?.airnodeAddress;

        console.log("\n⚠️ Existing Airnode deployment detected from receipt.json:");
        console.log(`  - Deployment ID: ${deploymentId || "unknown"}`);
        console.log(`  - Airnode Address: ${airnodeAddress || "unknown"}`);

        // Check configuration-details.json for additional info
        try {
          const configDetailsPath = path.join(configDir, "configuration-details.json");
          const configDetails = JSON.parse(await fs.readFile(configDetailsPath, "utf8"));
          if (configDetails.httpGatewayUrl) {
            console.log(`  - HTTP Gateway URL: ${configDetails.httpGatewayUrl}`);
          }
        } catch (_error) {
          // Ignore errors reading configuration-details.json
        }

        console.log("\nYou should remove existing deployments before creating a new one.");
        console.log("Use 'pnpm run remove:staging' to remove existing deployments first.");

        const proceedAnyway = readlineSync.question("\n⚠️ Do you want to proceed with deployment anyway? (y/N): ", {
          limit: /^(y|yes|n|no)$/i,
          limitMessage: "Please answer 'y' or 'n'",
          defaultInput: "n",
        });

        if (proceedAnyway.toLowerCase() === "y" || proceedAnyway.toLowerCase() === "yes") {
          console.log("\nProceeding with deployment despite existing Airnode deployment...");
          return false; // Allow proceeding
        }
        console.log("\nDeployment cancelled. Please remove existing deployments first.");
        process.exit(0); // Exit gracefully

        return true;
      } catch (error) {
        console.warn("Warning: Found receipt.json but couldn't parse it:", error);
      }
    }
  } catch (error) {
    console.warn("Warning during receipt check:", error);
  }

  // Second check: Use Airnode deployer's list command
  try {
    // Get current user ID and group ID for Docker volume permissions
    const { stdout: idOutput } = await exec("id -u && id -g");
    const [userId, groupId] = idOutput.trim().split(EOL);

    // Create aws.env file as required by the Docker-based deployer
    const awsEnvPath = path.join(configDir, "aws.env");
    const awsEnvContent = `AWS_ACCESS_KEY_ID=${process.env.AWS_ACCESS_KEY_ID}
AWS_SECRET_ACCESS_KEY=${process.env.AWS_SECRET_ACCESS_KEY}`;
    await fs.writeFile(awsEnvPath, awsEnvContent);

    // Use the Airnode deployer to list deployments
    const listCommand = `cd "${configDir}" && docker run --rm -e USER_ID=${userId} -e GROUP_ID=${groupId} -v "$(pwd):/app/config" api3/airnode-deployer:latest list`;

    console.log("Executing 'list' command to check for deployments...");
    const { stdout, stderr } = await exec(listCommand);

    if (stderr) {
      console.warn("Warning during airnode list:", stderr);
    }

    // Check if any deployments were found in the output
    const deploymentFound = stdout.includes("Found deployments:") && !stdout.includes("No deployments found");

    if (deploymentFound) {
      console.log("\n⚠️ Existing Airnode deployment(s) detected by list command:");

      // Extract the deployment IDs
      const deploymentMatches = stdout.match(/Deployment ID: (\w+)/g);

      if (deploymentMatches) {
        for (const match of deploymentMatches) {
          const id = match.replace("Deployment ID: ", "");
          console.log(`  - ${id}`);
        }

        console.log("\nYou should remove existing deployments before creating a new one.");
        console.log("Use 'pnpm run remove:staging' to remove existing deployments first.");

        const proceedAnyway = readlineSync.question("\n⚠️ Do you want to proceed with deployment anyway? (y/N): ", {
          limit: /^(y|yes|n|no)$/i,
          limitMessage: "Please answer 'y' or 'n'",
          defaultInput: "n",
        });

        if (proceedAnyway.toLowerCase() === "y" || proceedAnyway.toLowerCase() === "yes") {
          console.log("\nProceeding with deployment despite existing Airnode instances...");
          return false; // Allow proceeding
        }
        console.log("\nDeployment cancelled. Please remove existing deployments first.");
        process.exit(0); // Exit gracefully
      }

      return true;
    }
  } catch (error) {
    console.warn("⚠️ Error checking for existing Airnode deployments with list command:", error);
  }

  // Third check: Check for AWS lambda functions (more direct check)
  try {
    // Set AWS CLI environment variables
    const env = {
      ...process.env,
      AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID || "",
      AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY || "",
      AWS_REGION: process.env.AWS_REGION || "us-east-1",
    };

    // Run AWS Lambda list function with grep for airnode
    const awsCommand = `aws lambda list-functions --region ${env.AWS_REGION} --output json`;
    const { stdout } = await exec(awsCommand, { env });

    // Parse the output and look for Airnode functions
    const lambdaFunctions = JSON.parse(stdout).Functions || [];

    // Define interfaces for AWS Lambda functions
    interface LambdaFunction {
      FunctionName: string;
      Runtime?: string;
      Role?: string;
      [key: string]: any; // Allow other properties
    }

    const airnodeFunctions = lambdaFunctions.filter(
      (func: LambdaFunction) => func.FunctionName.includes("airnode") || func.FunctionName.includes("Airnode"),
    );

    if (airnodeFunctions.length > 0) {
      console.log("\n⚠️ Existing Airnode AWS Lambda functions detected:");
      for (const func of airnodeFunctions) {
        console.log(`  - ${func.FunctionName}`);
      }

      console.log("\nYou should remove existing deployments before creating a new one.");
      console.log("Use 'pnpm run remove:staging' to remove existing deployments first.");

      const proceedAnyway = readlineSync.question("\n⚠️ Do you want to proceed with deployment anyway? (y/N): ", {
        limit: /^(y|yes|n|no)$/i,
        limitMessage: "Please answer 'y' or 'n'",
        defaultInput: "n",
      });

      if (proceedAnyway.toLowerCase() === "y" || proceedAnyway.toLowerCase() === "yes") {
        console.log("\nProceeding with deployment despite existing Airnode AWS resources...");
        return false; // Allow proceeding
      }
      console.log("\nDeployment cancelled. Please remove existing deployments first.");
      process.exit(0); // Exit gracefully

      return true;
    }
  } catch (_error) {
    // AWS CLI might not be installed or configured, so silently ignore errors
    console.warn("Note: Could not check AWS Lambda functions directly. AWS CLI may not be installed or configured.");
  }

  // If we got here, no active deployments were found
  console.log("✅ No existing Airnode deployments found. Proceeding with deployment.");
  return false;
}

async function cleanupPreviousDeployment() {
  console.log("Cleaning up any previous deployment artifacts...");
  try {
    const configDir = path.join(__dirname, "../config/staging");

    // Check if there's any receipt.json file in the config directory
    const hasReceipt = await fs
      .access(path.join(configDir, "receipt.json"))
      .then(() => true)
      .catch(() => false);

    if (hasReceipt) {
      console.log("Found existing receipt.json, removing it...");
      await fs.unlink(path.join(configDir, "receipt.json"));
    }

    // Check for Terraform state files
    const hasTfState = await fs
      .access(path.join(configDir, "default.tfstate"))
      .then(() => true)
      .catch(() => false);

    if (hasTfState) {
      console.log("Found existing Terraform state file, removing it...");
      await fs.unlink(path.join(configDir, "default.tfstate"));
    }

    // Check for any other terraform files
    const files = await fs.readdir(configDir);
    for (const file of files) {
      if (file.startsWith("terraform.") || file.endsWith(".tfstate") || file.endsWith(".tfstate.backup")) {
        console.log(`Removing Terraform file: ${file}`);
        await fs.unlink(path.join(configDir, file));
      }
    }

    console.log("Cleanup completed successfully");
  } catch (error) {
    console.warn("Warning during cleanup:", error);
    // Continue with deployment even if cleanup had issues
  }
}

export async function deployStagingOracle() {
  try {
    console.log("=== ETS Staging Oracle Deployment ===");

    // Check for existing Airnode deployments first
    await checkForExistingAirnode();

    // Clean up any previous deployment artifacts
    await cleanupPreviousDeployment();

    console.log("\nStep 1/5: Generating Airnode credentials for staging...");
    const credentials = await generateStagingCredentials();

    console.log("\nStep 2/5: Generating Staging Airnode configuration...");
    await generateStagingConfig();

    console.log("\nStep 3/5: Setting up sponsorship for staging environment...");
    const sponsorship = await setupStagingSponsorship();

    console.log("\nStep 4/5: Configuring staging requester contract...");
    const requesterConfig = await configureStagingRequester();

    console.log("\nStep 5/5: Deploying Airnode to AWS...");
    const deployment = await deployStagingAirnode();

    console.log("\n✅ Staging Oracle deployment completed successfully and is now ready to process requests!");

    return {
      success: true,
      credentials,
      sponsorship,
      requesterConfig,
      deployment,
    };
  } catch (error) {
    console.error("\n❌ Staging Oracle deployment failed:", error);
    throw error;
  }
}

// For command-line usage
if (require.main === module) {
  deployStagingOracle()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error("Error:", error);
      process.exit(1);
    });
}
