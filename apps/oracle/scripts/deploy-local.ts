import { exec } from "node:child_process";
import { promises as fs } from "node:fs";
import path from "node:path";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

async function main() {
  console.log("Starting local Airnode deployment...");

  try {
    // Create docker-compose file
    const dockerCompose = `
version: '3'
services:
  airnode:
    image: api3/airnode-node:0.12.0
    environment:
      - AIRNODE_WALLET_MNEMONIC=test test test test test test test test test test test junk
    volumes:
      - ./config/local:/app/config
    restart: always
    `;

    await fs.writeFile(path.join(__dirname, "../docker-compose.yml"), dockerCompose);
    console.log("Created docker-compose.yml");

    // Start the Airnode container
    exec("docker-compose up -d", { cwd: path.join(__dirname, "..") }, (error, stdout, stderr) => {
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
    console.error("Error deploying local Airnode:", error);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
