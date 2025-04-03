/**
 * Staging Airnode Configuration Generator
 *
 * This script generates the Airnode configuration file (config.json) for the staging environment:
 * 1. Reads contract addresses from staging deployment artifacts
 * 2. Reads airnodeAddress from previously generated credentials
 * 3. Generates endpoint IDs using deriveEndpointId
 * 4. Creates the final config.json using the staging template
 *
 * The generated config.json is used by the Airnode container to connect
 * to the blockchain and serve API requests in the staging environment.
 */

import { promises as fs } from "node:fs";
import path from "node:path";
import { deriveEndpointId } from "@api3/airnode-admin";
import * as dotenv from "dotenv";
import Handlebars from "handlebars";
import type { AirnodeCredentials } from "../types/airnode";

// Load environment variables from .env.staging
dotenv.config({ path: path.join(__dirname, "../.env.staging") });

export async function generateStagingConfig() {
  try {
    console.log("Generating Staging Airnode configuration...");

    // Create config directory if it doesn't exist
    const configDir = path.join(__dirname, "../config/staging");
    await fs.mkdir(configDir, { recursive: true });

    // Read the airnode credentials
    const credentialsPath = path.join(configDir, "airnode-credentials.json");
    let credentials: AirnodeCredentials;
    try {
      const credentialsData = await fs.readFile(credentialsPath, "utf8");
      credentials = JSON.parse(credentialsData);
      console.log(`Read Airnode credentials for address: ${credentials.airnodeAddress}`);
    } catch (error) {
      console.error(
        "Error reading Airnode credentials for staging. Please run generate-airnode-credentials with staging environment first.",
      );
      throw error;
    }

    // Initialize template data object
    const templateData: Record<string, any> = {};

    // Add Airnode variables
    templateData.airnodeWalletMnemonicVar = "${AIRNODE_WALLET_MNEMONIC}";

    // Add AWS specific variables
    templateData.awsRegion = process.env.AWS_REGION || "us-east-1";
    templateData.httpGatewayApiKey = "${HTTP_GATEWAY_API_KEY}";
    // TODO: Heartbeat is disabled in template, these variables no longer needed
    // templateData.heartbeatApiKey = "${HEARTBEAT_API_KEY}";
    // templateData.heartbeatUrl = process.env.HEARTBEAT_URL || "";

    // Read AirnodeRrpV0 contract address for staging
    try {
      const airnodeRrpPath = path.join(
        __dirname,
        "../../../packages/contracts/deployments/arbitrumSepoliaStaging/AirnodeRrpV0Proxy.json",
      );

      try {
        const airnodeRrpData = JSON.parse(await fs.readFile(airnodeRrpPath, "utf8"));
        templateData.airnodeRrpAddress = airnodeRrpData.address;
        console.log(`Found AirnodeRrpV0Proxy contract at: ${templateData.airnodeRrpAddress}`);
      } catch (_error) {
        console.error("Error: Could not find AirnodeRrpV0Proxy deployment file for staging.");
        console.error("Please ensure the contracts are deployed to staging environment before running this script.");
        throw new Error("AirnodeRrpV0Proxy staging deployment not found");
      }

      // Read ETSEnrichTarget contract address for staging
      const etsEnrichTargetPath = path.join(
        __dirname,
        "../../../packages/contracts/deployments/arbitrumSepoliaStaging/ETSEnrichTarget.json",
      );

      try {
        const etsEnrichTargetData = JSON.parse(await fs.readFile(etsEnrichTargetPath, "utf8"));
        templateData.etsEnrichTargetAddress = etsEnrichTargetData.address;
        console.log(`Found Staging ETSEnrichTarget contract at: ${templateData.etsEnrichTargetAddress}`);
      } catch (_error) {
        console.error("Error: Could not find ETSEnrichTarget deployment file for staging.");
        console.error("Please ensure the contract is deployed to staging environment before running this script.");
        throw new Error("ETSEnrichTarget staging deployment not found");
      }
    } catch (error) {
      console.error(`Error reading staging deployment artifacts: ${error}`);
      throw error;
    }

    // Set staging-specific values
    templateData.chainId = "421614"; // Arbitrum Sepolia chain ID
    templateData.rpcUrl = process.env.ARBITRUM_SEPOLIA_URL || "https://sepolia-rollup.arbitrum.io/rpc";
    templateData.stagingApiUrl = process.env.STAGING_API_URL || "https://ets-offchain-api.onrender.com"; // Staging API endpoint

    // Generate endpoint IDs using the official Airnode utility
    const oisTitle = "ETS API";

    // For the enrichTarget endpoint
    templateData.enrichTargetEndpointId =
      process.env.STAGING_ENRICH_TARGET_ENDPOINT_ID || deriveEndpointId(oisTitle, "enrichTarget");

    // For the nextAuction endpoint
    templateData.nextAuctionEndpointId =
      process.env.STAGING_NEXT_AUCTION_ENDPOINT_ID || deriveEndpointId(oisTitle, "nextAuction");

    console.log(`Staging Enrich Target Endpoint ID: ${templateData.enrichTargetEndpointId}`);
    console.log(`Staging Next Auction Endpoint ID: ${templateData.nextAuctionEndpointId}`);

    templateData.logLevel = process.env.AIRNODE_LOG_LEVEL || "INFO";

    // Read the staging template file
    const templatePath = path.join(__dirname, "../config/templates/staging.template.json");
    const template = await fs.readFile(templatePath, "utf8");

    // Process the template with Handlebars
    const compiledTemplate = Handlebars.compile(template);
    const configData = compiledTemplate(templateData);

    // Write the processed config to config.json
    const configPath = path.join(configDir, "config.json");
    await fs.writeFile(configPath, configData);

    // Create secrets.env file with the required environment variables
    // Only include what's needed - HTTP Gateway API Key and mnemonic
    const secretsContent = `
AIRNODE_WALLET_MNEMONIC=${process.env.AIRNODE_MNEMONIC || credentials.mnemonic}
HTTP_GATEWAY_API_KEY=${process.env.HTTP_GATEWAY_API_KEY || generateRandomApiKey()}
    `.trim();

    const secretsPath = path.join(configDir, "secrets.env");
    await fs.writeFile(secretsPath, secretsContent);

    console.log(`Airnode staging config generated at: ${configPath}`);
    console.log(`Airnode staging secrets generated at: ${secretsPath}`);
    return true;
  } catch (error) {
    console.error("Error generating staging config:", error);
    throw error;
  }
}

// Helper function to generate random API keys
function generateRandomApiKey() {
  // Generate a longer key (at least 30 characters)
  return `${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
}

// For command-line usage
if (require.main === module) {
  generateStagingConfig()
    .then(() => console.log("Staging Airnode config generation completed"))
    .catch((error) => {
      console.error("Error in Staging Airnode config generation:", error);
      process.exit(1);
    });
}
