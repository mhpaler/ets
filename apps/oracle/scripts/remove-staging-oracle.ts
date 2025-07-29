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
// @ts-ignore
import readlineSync from "readline-sync";

// Convert exec to promise-based version
const exec = util.promisify(execCallback);

// Load environment variables from .env.staging
dotenv.config({ path: path.join(__dirname, "../.env.staging") });

export async function removeStagingOracle(options: { dryRun?: boolean } = {}) {
  const isDryRun = options.dryRun || false;
  if (isDryRun) {
    console.log("\n🔍 DRY RUN MODE: No actual removal will be performed");
  }
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

    // Try to read the receipt.json file to get the deployment ID
    let deploymentId: string | null = null;
    try {
      const receiptPath = path.join(configDir, "receipt.json");
      if (
        await fs
          .access(receiptPath)
          .then(() => true)
          .catch(() => false)
      ) {
        const receiptData = JSON.parse(await fs.readFile(receiptPath, "utf-8"));
        deploymentId = receiptData.deployment?.deploymentId;
        console.log(`\nFound Airnode deployment with ID: ${deploymentId}`);
      }
    } catch (error) {
      console.log("Error reading receipt file:", error);
    }

    // If no deployment ID found, ask if user wants to proceed with manual command
    if (!deploymentId) {
      console.log("\n⚠️ No deployment ID found in receipt file. Manual removal is required.");
      console.log("\nWould you like to run the full removal command with no deployment ID? (Y/N)");
      console.log("This will attempt to remove all Airnode resources without a specific deployment ID");

      const runManualAnswer = readlineSync.question("> ", {
        limit: /^(y|yes|n|no)$/i,
        limitMessage: "Please answer 'y' or 'n'",
        defaultInput: "n",
      });

      if (runManualAnswer.toLowerCase() === "y" || runManualAnswer.toLowerCase() === "yes") {
        console.log("\n🔄 Executing manual removal command...");
        console.log("This process typically takes 1-2 minutes. Please wait while AWS resources are being removed...");
        try {
          // Run the generic removal command
          const manualRemoveCommand = `cd "${configDir}" && docker run --rm -e USER_ID=${userId} -e GROUP_ID=${groupId} -v "$(pwd):/app/config" api3/airnode-deployer:latest remove`;

          let stdout: string;
          let stderr: string;

          if (isDryRun) {
            console.log("\n🔍 DRY RUN: Would execute command:");
            console.log(manualRemoveCommand);
            console.log("\nSkipping actual execution in dry run mode");

            // Mock stdout/stderr for consistency
            stdout = "** DRY RUN: Command execution skipped **";
            stderr = "";
          } else {
            // Create a loading indicator
            const loadingChars = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
            let loadingIndex = 0;
            const removalStartTime = Date.now();

            // Function to format elapsed time
            const formatElapsedTime = (ms: number) => {
              const seconds = Math.floor(ms / 1000);
              const minutes = Math.floor(seconds / 60);
              const remainingSeconds = seconds % 60;
              return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
            };

            // Start the loading animation
            const loadingInterval = setInterval(() => {
              const elapsedMs = Date.now() - removalStartTime;
              process.stdout.write(
                `\r${loadingChars[loadingIndex]} Removing Airnode from AWS... (${formatElapsedTime(elapsedMs)} elapsed)`,
              );
              loadingIndex = (loadingIndex + 1) % loadingChars.length;
            }, 100);

            // Actually execute the command
            const result = await exec(manualRemoveCommand);

            // Clear the loading indicator
            clearInterval(loadingInterval);
            process.stdout.write("\r\x1b[K"); // Clear the line

            console.log("✅ Removal completed!");

            stdout = result.stdout;
            stderr = result.stderr;

            console.log("\nRemoval command output:");
            console.log(stdout);

            if (stderr) {
              console.warn("Warnings/errors during removal:", stderr);
            }
          }

          // Update configuration details with manual removal information
          let configDetails: any = {};
          try {
            const configDetailsPath = path.join(configDir, "configuration-details.json");
            const configData = await fs.readFile(configDetailsPath, "utf8");
            configDetails = JSON.parse(configData);

            // Update with manual forced removal information
            configDetails.removalMethod = "manual_force";
            configDetails.removalTimestamp = new Date().toISOString();
            configDetails.deploymentStatus = "removed_force";
            configDetails.removalCommand = "airnode-deployer remove (no deployment ID)";
            configDetails.removalLogs = {
              stdout: stdout.toString().trim(),
              stderr: stderr.toString().trim(),
            };

            // Save updated configuration details
            if (isDryRun) {
              console.log("🔍 DRY RUN: Would save updated configuration details");
            } else {
              await fs.writeFile(configDetailsPath, JSON.stringify(configDetails, null, 2));
            }
          } catch (_error) {
            console.warn("Could not read/update configuration-details.json, creating new file...");

            // If configuration-details.json doesn't exist, create a basic version
            configDetails = {
              removalMethod: "manual_force",
              removalTimestamp: new Date().toISOString(),
              environment: "staging",
              deploymentStatus: "removed_force",
              removalCommand: "airnode-deployer remove (no deployment ID)",
              removalLogs: {
                stdout: stdout.toString().trim(),
                stderr: stderr.toString().trim(),
              },
            };

            if (isDryRun) {
              console.log("🔍 DRY RUN: Would create new configuration-details.json");
            } else {
              await fs.writeFile(
                path.join(configDir, "configuration-details.json"),
                JSON.stringify(configDetails, null, 2),
              );
            }
          }

          // Check if a receipt.json exists and rename it, saving to history directory
          const receiptPath = path.join(configDir, "receipt.json");
          if (
            await fs
              .access(receiptPath)
              .then(() => true)
              .catch(() => false)
          ) {
            const historyDir = path.join(configDir, "history/receipts");
            const timestamp = new Date().getTime();
            const backupPath = path.join(historyDir, `receipt-force-removed-${timestamp}.json`);

            if (isDryRun) {
              console.log(`\n🔍 DRY RUN: Would back up receipt.json to ${backupPath}`);
              console.log("🔍 DRY RUN: Would remove original receipt.json");
              
              // In dry run, just simulate the backup path update
              if (configDetails) {
                configDetails.receiptBackupFile = `history/receipts/receipt-force-removed-${timestamp}.json`;
              }
            } else {
              try {
                // Ensure history directory exists
                await fs.mkdir(historyDir, { recursive: true });

                console.log(`\nBacking up receipt.json to ${backupPath}...`);
                await fs.copyFile(receiptPath, backupPath);
                await fs.unlink(receiptPath);

                // Update configuration details with the backup path
                if (configDetails) {
                  configDetails.receiptBackupFile = `history/receipts/receipt-force-removed-${timestamp}.json`;
                  await fs.writeFile(
                    path.join(configDir, "configuration-details.json"),
                    JSON.stringify(configDetails, null, 2),
                  );
                }

                console.log("Receipt backup complete and original removed");
              } catch (backupError) {
                console.warn("Could not back up receipt file:", backupError);
              }
            }
          }

          console.log("\n✅ Manual Airnode removal completed!");
          console.log("Removal info saved to:", path.join(configDir, "configuration-details.json"));
          return true;
        } catch (error) {
          console.error("Error executing manual removal command:", error);
          throw error;
        }
      } else {
        console.log("\nHere is the command you can run manually:");
        console.log("\n============== COPY AND RUN THIS COMMAND ==============");
        console.log(`cd "${configDir}" && \\
docker run --rm \\
  -e USER_ID=${userId} -e GROUP_ID=${groupId} \\
  -v "$(pwd):/app/config" \\
  api3/airnode-deployer:latest remove`);
        console.log("=======================================================");

        // Update configuration details with pending manual removal information
        let configDetails: any = {};
        try {
          const configDetailsPath = path.join(configDir, "configuration-details.json");
          const configData = await fs.readFile(configDetailsPath, "utf8");
          configDetails = JSON.parse(configData);

          // Update with manual removal information
          configDetails.removalMethod = "manual";
          configDetails.removalInstructionsTimestamp = new Date().toISOString();
          configDetails.deploymentStatus = "pending_manual_removal";

          // Save updated configuration details
          await fs.writeFile(configDetailsPath, JSON.stringify(configDetails, null, 2));
        } catch (_error) {
          console.warn("Could not read/update configuration-details.json, creating new file...");

          // If configuration-details.json doesn't exist, create a basic version
          configDetails = {
            removalMethod: "manual",
            removalInstructionsTimestamp: new Date().toISOString(),
            environment: "staging",
            deploymentStatus: "pending_manual_removal",
          };

          await fs.writeFile(
            path.join(configDir, "configuration-details.json"),
            JSON.stringify(configDetails, null, 2),
          );
        }

        console.log("\nRemoval instructions have been provided.");
        console.log("Removal info saved to:", path.join(configDir, "configuration-details.json"));
        return false;
      }
    }

    // Ask for confirmation before removing
    console.log(`\nDo you want to remove the Airnode deployment with ID ${deploymentId}? (Y/N)`);

    // Ask for confirmation with a more explicit prompt
    const answer = readlineSync.question("> ", {
      limit: /^(y|yes|n|no)$/i,
      limitMessage: "Please answer 'y' or 'n'",
      defaultInput: "n",
    });

    if (answer.toLowerCase() !== "y" && answer.toLowerCase() !== "yes") {
      console.log("Removal cancelled by user.");
      return false;
    }

    console.log("\n🔄 Proceeding with Airnode removal...");
    console.log("This process typically takes 1-2 minutes. Please wait while AWS resources are being removed...");

    // Execute the removal command
    console.log(`\nRemoving Airnode deployment ${deploymentId}...`);

    // Create a loading indicator
    const loadingChars = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
    let loadingIndex = 0;
    const removalStartTime = Date.now();

    // Function to format elapsed time
    const formatElapsedTime = (ms: number) => {
      const seconds = Math.floor(ms / 1000);
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
    };

    try {
      const removeCommand = `cd "${configDir}" && docker run --rm -e USER_ID=${userId} -e GROUP_ID=${groupId} -v "$(pwd):/app/config" api3/airnode-deployer:latest remove ${deploymentId}`;

      let stdout: string;
      let stderr: string;

      if (isDryRun) {
        console.log("\n🔍 DRY RUN: Would execute command:");
        console.log(removeCommand);
        console.log("\nSkipping actual execution in dry run mode");

        // Mock stdout/stderr for consistency
        stdout = "** DRY RUN: Command execution skipped **";
        stderr = "";
      } else {
        // Start the loading animation
        const loadingInterval = setInterval(() => {
          const elapsedMs = Date.now() - removalStartTime;
          process.stdout.write(
            `\r${loadingChars[loadingIndex]} Removing Airnode from AWS... (${formatElapsedTime(elapsedMs)} elapsed)`,
          );
          loadingIndex = (loadingIndex + 1) % loadingChars.length;
        }, 100);

        // Actually execute the command
        const result = await exec(removeCommand);
        stdout = result.stdout;
        stderr = result.stderr;

        // Clear the loading indicator
        clearInterval(loadingInterval);
        process.stdout.write("\r\x1b[K"); // Clear the line

        console.log("✅ Removal completed!");

        console.log("\nRemoval command output:");
        console.log(stdout);

        if (stderr) {
          console.warn("Warnings/errors during removal:", stderr);
        }
      }

      // Update the configuration details with removal information
      let configDetails: any = {};
      try {
        const configDetailsPath = path.join(configDir, "configuration-details.json");
        const configData = await fs.readFile(configDetailsPath, "utf8");
        configDetails = JSON.parse(configData);

        // Update with removal information
        configDetails.removalMethod = "automatic";
        configDetails.removalTimestamp = new Date().toISOString();
        configDetails.deploymentStatus = "removed";
        configDetails.removalCommand = "airnode-deployer remove";
        configDetails.removalLogs = {
          stdout: stdout.toString().trim(),
          stderr: stderr.toString().trim(),
        };

        // Save updated configuration details
        if (isDryRun) {
          console.log(`🔍 DRY RUN: Would update configuration details at: ${configDetailsPath}`);
        } else {
          await fs.writeFile(configDetailsPath, JSON.stringify(configDetails, null, 2));
          console.log(`Updated configuration details with removal info at: ${configDetailsPath}`);
        }
      } catch (_error) {
        console.warn("Could not read/update configuration-details.json, creating new file...");

        // If configuration-details.json doesn't exist, create a basic version
        configDetails = {
          removalMethod: "automatic",
          deploymentId,
          removalTimestamp: new Date().toISOString(),
          environment: "staging",
          deploymentStatus: "removed",
          removalCommand: "airnode-deployer remove",
          removalLogs: {
            stdout: stdout.toString().trim(),
            stderr: stderr.toString().trim(),
          },
        };

        if (isDryRun) {
          console.log("🔍 DRY RUN: Would create new configuration-details.json with removal information");
        } else {
          await fs.writeFile(path.join(configDir, "configuration-details.json"), JSON.stringify(configDetails, null, 2));
          console.log("Created new configuration-details.json with removal information");
        }
      }

      // Rename the receipt file and save directly to history directory
      const receiptPath = path.join(configDir, "receipt.json");
      const historyDir = path.join(configDir, "history/receipts");
      const timestamp = new Date().getTime();
      const backupPath = path.join(historyDir, `receipt-removed-${timestamp}.json`);

      if (isDryRun) {
        console.log(`\n🔍 DRY RUN: Would back up receipt.json to ${backupPath}`);
        console.log("🔍 DRY RUN: Would remove original receipt.json");
        
        // In dry run, just simulate the backup path update
        if (configDetails) {
          configDetails.receiptBackupFile = `history/receipts/receipt-removed-${timestamp}.json`;
        }
      } else {
        try {
          // Ensure history directory exists
          await fs.mkdir(historyDir, { recursive: true });

          console.log(`\nBacking up receipt.json to ${backupPath}...`);
          await fs.copyFile(receiptPath, backupPath);
          await fs.unlink(receiptPath);

          // Update configuration details with the backup path
          if (configDetails) {
            configDetails.receiptBackupFile = `history/receipts/receipt-removed-${timestamp}.json`;
            await fs.writeFile(
              path.join(configDir, "configuration-details.json"),
              JSON.stringify(configDetails, null, 2),
            );
          }

          console.log("Receipt backup complete and original removed");
        } catch (backupError) {
          console.warn("Could not back up receipt file:", backupError);
        }
      }

      console.log("\n✅ Airnode removal completed successfully!");
      console.log("Removal info saved to:", path.join(configDir, "configuration-details.json"));
      return true;
    } catch (error) {
      console.error("Error executing removal command:", error);
      throw error;
    }
  } catch (error) {
    console.error("Error preparing Airnode removal:", error);
    throw error;
  }
}
// For command-line usage
if (require.main === module) {
  console.log("\n🧩 ETS Oracle Removal Tool - Staging Environment 🧩");
  console.log("==================================================");

  // Parse command line arguments
  const args = process.argv.slice(2);
  const isDryRun = args.includes("--dry-run") || args.includes("-d");

  removeStagingOracle({ dryRun: isDryRun })
    .then((result) => {
      if (result) {
        if (isDryRun) {
          console.log("\n🔍 DRY RUN: Airnode AWS removal process would have completed successfully");
        } else {
          console.log("\n🎉 Airnode AWS removal process completed successfully");
        }
      } else {
        console.log("\n⚠️ Airnode AWS removal process was cancelled or requires manual steps");
        console.log("Review the output above for instructions if needed");
      }
    })
    .catch((error) => {
      console.error("\n❌ Error in Airnode AWS removal:", error);
      process.exit(1);
    });
}
