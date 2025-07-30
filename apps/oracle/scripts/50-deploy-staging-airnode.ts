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

    // Double-check if Docker is installed and running
    try {
      await exec("docker --version");
      console.log("Docker is available");

      try {
        await exec("docker ps");
        console.log("Docker is running");
      } catch (_error) {
        throw new Error("Docker is installed but not running. Please start Docker and try again.");
      }
    } catch (error) {
      console.error("Error checking Docker:", error);
      throw new Error("Docker is required for Airnode deployment. Please ensure Docker is installed and running.");
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

    console.log("\n🚀 Executing Airnode deployment using Docker...");
    console.log("This process typically takes 1-2 minutes. Please wait while AWS resources are being provisioned...");

    // Use the non-interactive version to avoid TTY issues in scripts
    const deployCommand = `cd "${configDir}" && docker run --rm -e USER_ID=${userId} -e GROUP_ID=${groupId} -v "$(pwd):/app/config" api3/airnode-deployer:latest deploy`;

    // Create a loading indicator
    const loadingChars = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
    let loadingIndex = 0;
    const deploymentStartTime = Date.now();

    // Function to format elapsed time
    const formatElapsedTime = (ms: number) => {
      const seconds = Math.floor(ms / 1000);
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
    };

    // Start the loading animation
    const loadingInterval = setInterval(() => {
      const elapsedMs = Date.now() - deploymentStartTime;
      process.stdout.write(
        `\r${loadingChars[loadingIndex]} Deploying Airnode to AWS... (${formatElapsedTime(elapsedMs)} elapsed)`,
      );
      loadingIndex = (loadingIndex + 1) % loadingChars.length;
    }, 100);

    try {
      // Execute the deployment command
      const { stdout, stderr } = await exec(deployCommand);

      // Clear the loading indicator
      clearInterval(loadingInterval);
      process.stdout.write("\r\x1b[K"); // Clear the line

      console.log("✅ Deployment completed!");

      // Extract HTTP Gateway URL from the output if available
      let detectedHttpGatewayUrl = "";
      const gatewayUrlRegex = /HTTP gateway URL: (https:\/\/[^\s]+)/;
      const outputMatch = (stdout + stderr).match(gatewayUrlRegex);
      if (outputMatch?.[1]) {
        detectedHttpGatewayUrl = outputMatch[1];
        // Save to a file for future reference
        await fs.writeFile(path.join(configDir, "gateway-url.txt"), detectedHttpGatewayUrl);
        // HTTP Gateway URL detected and saved (silently)
      }

      // Create deployment-info.json file for verification script
      try {
        // Read receipt.json to get deployment details
        const receiptPath = path.join(configDir, "receipt.json");
        const receiptData = JSON.parse(await fs.readFile(receiptPath, "utf8"));

        const deploymentInfo = {
          airnodeAddress: receiptData.airnodeWallet?.airnodeAddress || "",
          httpGatewayUrl: detectedHttpGatewayUrl,
          deploymentTimestamp: receiptData.deployment?.timestamp || new Date().toISOString(),
          environment: "staging",
          deploymentId: receiptData.deployment?.deploymentId || "",
        };

        await fs.writeFile(path.join(configDir, "deployment-info.json"), JSON.stringify(deploymentInfo, null, 2));

        console.log("✅ Created deployment-info.json for verification");
      } catch (error) {
        console.warn("⚠️ Could not create deployment-info.json:", error);
      }

      if (stderr) {
        console.warn("Deployment warnings:", stderr);
      }

      console.log("\nDeployment output:");
      console.log(stdout);

      // Wait a moment to ensure receipt.json is fully written
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      // Clear the loading indicator on error
      clearInterval(loadingInterval);
      process.stdout.write("\r\x1b[K"); // Clear the line

      console.error("\n❌ Error executing deployment command:", error);
      console.error("This could be due to Docker permissions or configuration issues.");
      console.error("If you need to run the command manually, here it is:");
      console.log("\n============== MANUAL DEPLOYMENT COMMAND ==============");
      console.log(deployCommand);
      console.log("=======================================================");
    }

    console.log("\nChecking for receipt.json file in the staging directory...");

    // Check if the user has already run the command
    const hasReceipt = await fs
      .access(path.join(configDir, "receipt.json"))
      .then(() => true)
      .catch(() => false);

    if (hasReceipt) {
      // Receipt file found (silently)
      // Load the receipt data
      const receiptData = JSON.parse(await fs.readFile(path.join(configDir, "receipt.json"), "utf8"));

      // Archive the receipt file to the history/receipts directory with timestamp
      const timestamp = Date.now();
      const historyDir = path.join(configDir, "history/receipts");
      await fs.mkdir(historyDir, { recursive: true });
      const receiptBackupPath = path.join(historyDir, `receipt-${timestamp}.json`);
      await fs.copyFile(path.join(configDir, "receipt.json"), receiptBackupPath);
      // Receipt file archived (silently)

      // Read the existing configuration details
      let configDetails: any = {};
      try {
        const configDetailsPath = path.join(configDir, "configuration-details.json");
        const configData = await fs.readFile(configDetailsPath, "utf8");
        configDetails = JSON.parse(configData);

        // Update with deployment information
        configDetails.deploymentTimestamp = new Date().toISOString();
        configDetails.deploymentSuccess = true;
        configDetails.deploymentStatus = "active";
        configDetails.buildSteps.deployment = true;
        configDetails.httpGatewayUrl = receiptData.deployment.httpGatewayUrl;
        configDetails.deploymentId = receiptData.deployment.deploymentId;
        configDetails.cloudProvider = receiptData.deployment.cloudProvider;
        configDetails.receiptFile = "receipt.json";
        configDetails.receiptBackupFile = `history/receipts/receipt-${timestamp}.json`;

        // Save updated configuration details
        await fs.writeFile(configDetailsPath, JSON.stringify(configDetails, null, 2));
        // Configuration details updated (silently)
      } catch (_error) {
        console.warn("Could not read/update configuration-details.json, creating new file...");

        // If configuration-details.json doesn't exist, create a basic version
        configDetails = {
          airnodeAddress: receiptData.airnodeWallet.airnodeAddress,
          httpGatewayUrl: receiptData.deployment.httpGatewayUrl,
          deploymentTimestamp: new Date().toISOString(),
          environment: "staging",
          deploymentStatus: "active",
          deploymentId: receiptData.deployment.deploymentId,
          cloudProvider: receiptData.deployment.cloudProvider,
          receiptFile: "receipt.json",
          receiptBackupFile: `history/receipts/receipt-${timestamp}.json`,
        };

        await fs.writeFile(path.join(configDir, "configuration-details.json"), JSON.stringify(configDetails, null, 2));
        // New configuration details created (silently)
      }

      // Quietly get the HTTP Gateway URL without verbose logs
      let httpGatewayUrl = "";

      // Try all possible sources for the HTTP Gateway URL - in order of preference
      try {
        // 1. Try gateway-url.txt first (from current deployment)
        httpGatewayUrl = await fs
          .readFile(path.join(configDir, "gateway-url.txt"), "utf8")
          .then((content) => content.trim());
      } catch (_error) {
        try {
          // 2. Try configuration details
          if (configDetails.httpGatewayUrl) {
            httpGatewayUrl = configDetails.httpGatewayUrl;
          } else {
            // 3. Look through log files (silently)
            const logsDir = path.join(configDir, "logs");
            const logFiles = await fs.readdir(logsDir);
            const sortedLogFiles = (
              await Promise.all(
                logFiles.map(async (file) => ({
                  file,
                  mtime: (await fs.stat(path.join(logsDir, file))).mtime,
                })),
              )
            ).sort((a, b) => b.mtime.getTime() - a.mtime.getTime());

            for (const { file } of sortedLogFiles) {
              if (file.startsWith("deployer-")) {
                const logContent = await fs.readFile(path.join(logsDir, file), "utf8");
                const match = logContent.match(/HTTP gateway URL: (https:\/\/[^\s]+)/);
                if (match?.[1]) {
                  httpGatewayUrl = match[1];
                  // Save it for future reference
                  await fs.writeFile(path.join(configDir, "gateway-url.txt"), httpGatewayUrl);
                  break;
                }
              }
            }
          }
        } catch (_innerError) {
          // Silently continue if any of these methods fail
        }
      }

      // Update configuration-details.json with the URL if we found it
      if (httpGatewayUrl) {
        configDetails.httpGatewayUrl = httpGatewayUrl;
        await fs.writeFile(path.join(configDir, "configuration-details.json"), JSON.stringify(configDetails, null, 2));
      }

      // Only show the configuration file path - no other details
      console.log("Deployment info saved to:", path.join(configDir, "configuration-details.json"));

      // Silently determine if we should generate a curl command
      if (httpGatewayUrl) {
        // Read the config file to get endpoint IDs
        const configData = JSON.parse(await fs.readFile(path.join(configDir, "config.json"), "utf8"));
        // Get the nextAuction endpoint ID from the config
        const nextAuctionEndpointId = configData.triggers.http.find(
          (trigger: any) => trigger.endpointName === "nextAuction",
        )?.endpointId;

        // Extract the UUID part from the HTTP Gateway URL
        const urlParts = httpGatewayUrl.split("/");
        const gatewayUuid = urlParts[urlParts.length - 1];
        const baseGatewayUrl = urlParts.slice(0, -1).join("/");

        // Write the curl command to a text file for future reference
        const curlCommand = `curl -X POST \\
  "${baseGatewayUrl}/${gatewayUuid}/${nextAuctionEndpointId}" \\
  -H "Content-Type: application/json" \\
  -d '{"parameters": {"chainId": "421614", "returnType": "json", "staging": true}}'`;

        await fs.writeFile(path.join(configDir, "test-command.txt"), curlCommand);
      }

      return configDetails;
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
