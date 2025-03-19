/**
 * Airnode Container Startup
 *
 * This script launches the Airnode service in a Docker container:
 * 1. Creates a docker-compose.yml file with Airnode configuration
 * 2. Starts the Airnode container using docker-compose
 * 3. Verifies that the container is running
 *
 * The Airnode container connects to the local Ethereum node and listens for
 * oracle requests from the ETSEnrichTarget contract.
 *
 * Prerequisites:
 * - Docker must be installed and running
 * - All previous setup scripts must have been executed
 */

import { exec, execSync } from "node:child_process";
import { promises as fs } from "node:fs";
import path from "node:path";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

export async function startAirnodeContainer() {
  console.log("Starting Airnode docker container...");

  try {
    // Create config directory if it doesn't exist
    const configDir = path.join(__dirname, "../config/local");
    await fs.mkdir(configDir, { recursive: true });

    // Check if Docker is running
    try {
      execSync("docker info", { stdio: "ignore" });
    } catch (_error) {
      throw new Error("Docker is not running. Please start Docker and try again.");
    }

    // Check if all required files exist
    const requiredFiles = ["config.json", "secrets.env"];
    for (const file of requiredFiles) {
      try {
        await fs.access(path.join(configDir, file));
      } catch (_error) {
        throw new Error(`Required file ${file} not found in ${configDir}. Please run previous setup scripts first.`);
      }
    }

    // Create docker-compose file
    const dockerCompose = `
services:
  airnode:
    image: api3/airnode-client:0.15.0
    volumes:
      - ./config/local:/app/config
    ports:
      - "8090:3000"  # HTTP Gateway
    restart: always
    `;

    const composePath = path.join(__dirname, "../docker-compose.yml");
    await fs.writeFile(composePath, dockerCompose);
    console.log("Created docker-compose.yml");

    // First make sure any existing container is stopped
    console.log("Stopping any existing Airnode containers...");
    try {
      execSync("docker compose down", {
        cwd: path.join(__dirname, ".."),
        stdio: "inherit",
      });
    } catch (_error) {
      console.log("No existing containers to stop or error stopping containers");
    }

    // Start the container
    console.log("Starting Airnode container...");
    return new Promise<boolean>((resolve, reject) => {
      exec("docker compose up -d", { cwd: path.join(__dirname, "..") }, (error, stdout, stderr) => {
        if (error) {
          console.error(`Error starting container: ${error.message}`);
          reject(error);
          return;
        }

        if (stderr && !stderr.includes("Creating")) {
          console.error(`Container stderr: ${stderr}`);
        }

        console.log(stdout);

        // Verify the container is running
        try {
          const containerCheck = execSync("docker ps | grep oracle-airnode", {
            encoding: "utf8",
          });

          if (containerCheck.includes("oracle-airnode")) {
            console.log("✅ Airnode container is running successfully!");
            console.log("Container details:");
            console.log(containerCheck);

            // Start following the logs
            console.log("Container logs will be available with: docker logs -f oracle-airnode-1");

            resolve(true);
          } else {
            const error = new Error("Container not found in running containers");
            console.error(error.message);
            reject(error);
          }
        } catch (error) {
          console.error("Error verifying container:", error);
          reject(error);
        }
      });
    });
  } catch (error) {
    console.error("Error starting Airnode container:", error);
    throw error;
  }
}

// For command-line usage
if (require.main === module) {
  startAirnodeContainer()
    .then(() => console.log("Airnode container started successfully"))
    .catch((error) => {
      console.error("Error starting Airnode container:", error);
      process.exit(1);
    });
}
