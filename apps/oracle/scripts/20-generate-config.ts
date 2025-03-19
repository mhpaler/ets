/**
 * Airnode Configuration Generator
 *
 * This script generates the Airnode configuration file (config.json):
 * 1. Reads contract addresses from deployment artifacts
 * 2. Reads airnodeAddress from previously generated credentials
 * 3. Generates endpoint IDs using deriveEndpointId
 * 4. Creates the final config.json using the template
 *
 * The generated config.json is used by the Airnode container to connect
 * to the blockchain and serve API requests.
 */

import { promises as fs } from "node:fs";
import path from "node:path";
import { deriveEndpointId } from "@api3/airnode-admin";
import * as dotenv from "dotenv";
import Handlebars from "handlebars";
import type { AirnodeCredentials } from "../types/airnode";

// Load environment variables
dotenv.config();

export async function generateConfig() {
  try {
    console.log("Generating Airnode configuration...");

    // Create config directory if it doesn't exist
    const configDir = path.join(__dirname, "../config/local");
    await fs.mkdir(configDir, { recursive: true });

    // Read the airnode credentials
    const credentialsPath = path.join(configDir, "airnode-credentials.json");
    let credentials: AirnodeCredentials;
    try {
      const credentialsData = await fs.readFile(credentialsPath, "utf8");
      credentials = JSON.parse(credentialsData);
      console.log(`Read Airnode credentials for address: ${credentials.airnodeAddress}`);
    } catch (error) {
      console.error("Error reading Airnode credentials. Please run 10-generate-airnode-credentials.ts first.");
      throw error;
    }

    // Initialize template data object
    const templateData: Record<string, any> = {};

    // Add Airnode variables
    templateData.airnodeWalletMnemonicVar = "${AIRNODE_WALLET_MNEMONIC}";

    // Read AirnodeRrpV0 contract address
    try {
      const airnodeRrpPath = path.join(
        __dirname,
        "../../../packages/contracts/deployments/localhost/AirnodeRrpV0.json",
      );

      try {
        const airnodeRrpData = JSON.parse(await fs.readFile(airnodeRrpPath, "utf8"));
        templateData.airnodeRrpAddress = airnodeRrpData.address;
        console.log(`Found AirnodeRrpV0 contract at: ${templateData.airnodeRrpAddress}`);
      } catch (_error) {
        // Try the proxy contract if the direct contract isn't found
        const airnodeRrpProxyPath = path.join(
          __dirname,
          "../../../packages/contracts/deployments/localhost/AirnodeRrpV0Proxy.json",
        );
        try {
          const airnodeRrpProxyData = JSON.parse(await fs.readFile(airnodeRrpProxyPath, "utf8"));
          templateData.airnodeRrpAddress = airnodeRrpProxyData.address;
          console.log(`Found AirnodeRrpV0Proxy contract at: ${templateData.airnodeRrpAddress}`);
        } catch (_proxyError) {
          console.error("Error: Could not find AirnodeRrpV0 or AirnodeRrpV0Proxy deployment files.");
          console.error("Please ensure the contracts are deployed before running this script.");
          throw new Error("AirnodeRrpV0 deployment not found");
        }
      }

      // Read ETSEnrichTarget contract address
      const etsEnrichTargetPath = path.join(
        __dirname,
        "../../../packages/contracts/deployments/localhost/ETSEnrichTarget.json",
      );

      try {
        const etsEnrichTargetData = JSON.parse(await fs.readFile(etsEnrichTargetPath, "utf8"));
        templateData.etsEnrichTargetAddress = etsEnrichTargetData.address;
        console.log(`Found ETSEnrichTarget contract at: ${templateData.etsEnrichTargetAddress}`);
      } catch (_error) {
        console.error("Error: Could not find ETSEnrichTarget deployment file.");
        console.error("Please ensure the contract is deployed before running this script.");
        throw new Error("ETSEnrichTarget deployment not found");
      }
    } catch (error) {
      console.error(`Error reading deployment artifacts: ${error}`);
      throw error;
    }

    // Set local-specific values
    templateData.chainId = "31337"; // Hardhat's default chain ID
    templateData.rpcUrl = "http://host.docker.internal:8545";
    templateData.apiUrl = "http://host.docker.internal:4000";

    // Generate endpoint IDs using the official Airnode utility
    const oisTitle = "ETS API";

    // For the enrichTarget endpoint
    templateData.enrichTargetEndpointId =
      process.env.ENRICH_TARGET_ENDPOINT_ID || deriveEndpointId(oisTitle, "enrichTarget");

    // For the nextAuction endpoint
    templateData.nextAuctionEndpointId =
      process.env.NEXT_AUCTION_ENDPOINT_ID || deriveEndpointId(oisTitle, "nextAuction");

    console.log(`Enrich Target Endpoint ID: ${templateData.enrichTargetEndpointId}`);
    console.log(`Next Auction Endpoint ID: ${templateData.nextAuctionEndpointId}`);

    templateData.logLevel = process.env.AIRNODE_LOG_LEVEL || "INFO";

    // Read the local template file
    const templatePath = path.join(__dirname, "../config/templates/local.template.json");
    const template = await fs.readFile(templatePath, "utf8");

    // Process the template with Handlebars
    const compiledTemplate = Handlebars.compile(template);
    const configData = compiledTemplate(templateData);

    // Write the processed config to config.json
    const configPath = path.join(configDir, "config.json");
    await fs.writeFile(configPath, configData);

    console.log(`Airnode config generated at: ${configPath}`);
    return true;
  } catch (error) {
    console.error("Error generating config:", error);
    throw error;
  }
}

// For command-line usage
if (require.main === module) {
  generateConfig()
    .then(() => console.log("Airnode config generation completed"))
    .catch((error) => {
      console.error("Error in Airnode config generation:", error);
      process.exit(1);
    });
}
