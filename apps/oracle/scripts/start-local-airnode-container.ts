/**
 * Local Airnode Container Startup Script
 *
 * This script launches the Airnode service in a Docker container:
 * 1. Creates a docker-compose.yml file with Airnode configuration
 * 2. Starts the Airnode container using docker-compose
 *
 * The Airnode container connects to the local Ethereum node and listens for
 * oracle requests from the ETSEnrichTarget contract.
 *
 * Prerequisites:
 * - Docker must be installed and running
 * - setup-oracle-wallet.ts and configure-contract.ts must have been executed
 *
 * Outputs:
 * - Creates docker-compose.yml in the apps/oracle directory
 * - Starts a Docker container running Airnode
 *
 * Runtime: The container starts in a few seconds, but may take longer to
 * fully initialize and start processing requests
 */

import { exec } from "node:child_process";
import { promises as fs } from "node:fs";
import path from "node:path";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Export the main function
export async function startLocalAirnodeContainer() {
  console.log("Starting local Airnode docker container...");

  try {
    // Create docker-compose file
    const dockerCompose = `
services:
  airnode:
    image: api3/airnode-client:0.15.0
    environment:
      - AIRNODE_WALLET_MNEMONIC=test test test test test test test test test test test junk
    volumes:
      - ./config/local:/app/config
    restart: always
    `;

    await fs.writeFile(path.join(__dirname, "../docker-compose.yml"), dockerCompose);
    console.log("Created docker-compose.yml");

    // Start the Airnode container
    exec("docker compose up -d", { cwd: path.join(__dirname, "..") }, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error: ${error.message}`);
        return;
      }
      if (stderr) {
        console.error(`stderr: ${stderr}`);
        return;
      }
      console.log(`stdout: ${stdout}`);
      console.log("Local Airnode is now running");
    });
  } catch (error) {
    console.error("Error starting local Airnode:", error);
  }
}
