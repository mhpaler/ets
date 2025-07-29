/**
 * Staging Airnode Configuration Generator
 *
 * This script generates the Airnode configuration file (config.json) for the staging environment:
 * 1. Reads contract addresses from staging deployment artifacts for all supported chains
 * 2. Reads airnodeAddress from previously generated credentials
 * 3. Generates endpoint IDs using deriveEndpointId
 * 4. Creates the final config.json using the staging template
 *
 * The generated config.json is used by the Airnode container to connect
 * to multiple blockchains and serve API requests in the staging environment.
 */

import { promises as fs } from "node:fs";
import path from "node:path";
import { deriveEndpointId } from "@api3/airnode-admin";
import * as dotenv from "dotenv";
import Handlebars from "handlebars";
import type { AirnodeCredentials } from "../types/airnode";
import { 
  ORACLE_CHAIN_CONFIGS, 
  getSupportedOracleChainIds,
  getContractDeploymentPath,
  getChainRpcUrl
} from "../utils/chainConfig";

// Load environment variables from .env.staging
dotenv.config({ path: path.join(__dirname, "../.env.staging") });

export async function generateStagingConfig() {
  try {
    console.log("Generating Multi-Chain Staging Airnode configuration...");

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

    // Generate chain configurations for all supported chains
    const chainIds = getSupportedOracleChainIds();
    const chainConfigs = [];

    for (const chainId of chainIds) {
      console.log(`Configuring chain: ${ORACLE_CHAIN_CONFIGS[chainId].name} (${chainId})`);
      const deploymentPath = getContractDeploymentPath(chainId);
      const rpcUrl = getChainRpcUrl(chainId);
      const providerName = ORACLE_CHAIN_CONFIGS[chainId].providerName;
      
      try {
        // Read AirnodeRrpV0 contract address for this chain
        const airnodeRrpPath = path.join(
          __dirname,
          `../../../packages/contracts/deployments/${deploymentPath}/AirnodeRrpV0Proxy.json`,
        );

        let airnodeRrpAddress: string;
        try {
          const airnodeRrpData = JSON.parse(await fs.readFile(airnodeRrpPath, "utf8"));
          airnodeRrpAddress = airnodeRrpData.address;
          console.log(`Found AirnodeRrpV0Proxy contract at: ${airnodeRrpAddress} on ${chainId}`);
        } catch (_error) {
          console.error(`Error: Could not find AirnodeRrpV0Proxy deployment file for chain ${chainId}.`);
          console.error(`Please ensure the contracts are deployed to ${deploymentPath} before running this script.`);
          throw new Error(`AirnodeRrpV0Proxy deployment not found for chain ${chainId}`);
        }

        // Read ETSEnrichTarget contract address for this chain
        const etsEnrichTargetPath = path.join(
          __dirname,
          `../../../packages/contracts/deployments/${deploymentPath}/ETSEnrichTarget.json`,
        );

        let etsEnrichTargetAddress: string;
        try {
          const etsEnrichTargetData = JSON.parse(await fs.readFile(etsEnrichTargetPath, "utf8"));
          etsEnrichTargetAddress = etsEnrichTargetData.address;
          console.log(`Found ETSEnrichTarget contract at: ${etsEnrichTargetAddress} on ${chainId}`);
        } catch (_error) {
          console.error(`Error: Could not find ETSEnrichTarget deployment file for chain ${chainId}.`);
          console.error(`Please ensure the contract is deployed to ${deploymentPath} before running this script.`);
          throw new Error(`ETSEnrichTarget deployment not found for chain ${chainId}`);
        }

        // Create chain configuration
        const chainConfig = {
          authorizers: {
            requesterEndpointAuthorizers: [],
            crossChainRequesterAuthorizers: [],
            requesterAuthorizersWithErc721: [],
            crossChainRequesterAuthorizersWithErc721: []
          },
          authorizations: {
            requesterEndpointAuthorizations: {}
          },
          contracts: {
            AirnodeRrp: airnodeRrpAddress
          },
          id: chainId,
          providers: {
            [providerName]: {
              url: rpcUrl
            }
          },
          type: "evm",
          maxConcurrency: 100,
          options: {
            fulfillmentGasLimit: 500000,
            gasPriceOracle: [
              {
                gasPriceStrategy: "providerRecommendedGasPrice",
                recommendedGasPriceMultiplier: 1.2
              },
              {
                gasPriceStrategy: "constantGasPrice",
                gasPrice: {
                  value: 30,
                  unit: "gwei"
                }
              }
            ]
          }
        };

        // Add to chain configurations
        chainConfigs.push(chainConfig);

        // Save chain-specific configuration details for later use
        const configDetailsPath = path.join(configDir, `configuration-details-${ORACLE_CHAIN_CONFIGS[chainId].networkName}.json`);
        await fs.writeFile(configDetailsPath, JSON.stringify({
          chainId,
          networkName: ORACLE_CHAIN_CONFIGS[chainId].networkName,
          airnodeRrpAddress,
          etsEnrichTargetAddress,
          deploymentPath
        }, null, 2));
        
      } catch (error) {
        console.error(`Error configuring chain ${chainId}:`, error);
        throw error;
      }
    }

    // Add chains data to template
    templateData.chains = JSON.stringify(chainConfigs);
    
    // Set API URL for all chains
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

    console.log(`Airnode multi-chain staging config generated at: ${configPath}`);
    console.log(`Airnode staging secrets generated at: ${secretsPath}`);
    
    // Create a master configuration details file
    const masterConfigDetails = {
      timeGenerated: new Date().toISOString(),
      apiUrl: templateData.stagingApiUrl,
      enrichTargetEndpointId: templateData.enrichTargetEndpointId,
      nextAuctionEndpointId: templateData.nextAuctionEndpointId,
      chains: chainIds.map(chainId => ({
        chainId,
        name: ORACLE_CHAIN_CONFIGS[chainId].name,
        networkName: ORACLE_CHAIN_CONFIGS[chainId].networkName,
        rpcUrl: getChainRpcUrl(chainId)
      }))
    };
    
    const masterConfigPath = path.join(configDir, "configuration-details.json");
    await fs.writeFile(masterConfigPath, JSON.stringify(masterConfigDetails, null, 2));
    console.log(`Master configuration details saved to: ${masterConfigPath}`);
    
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
    .then(() => console.log("Multi-chain staging Airnode config generation completed"))
    .catch((error) => {
      console.error("Error in staging Airnode config generation:", error);
      process.exit(1);
    });
}