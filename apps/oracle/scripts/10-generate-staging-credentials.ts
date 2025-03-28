/**
 * Staging Airnode Credentials Generator
 *
 * This script generates or loads the Airnode credentials for the staging environment:
 * 1. Generates a new mnemonic or loads an existing one from environment
 * 2. Derives the airnodeAddress and xpub from the mnemonic
 * 3. Verifies the xpub against the airnodeAddress
 * 4. Saves the credentials to a JSON file for use by other scripts
 */

import { promises as fs } from "node:fs";
import * as path from "node:path";
import { deriveAirnodeAddress, deriveAirnodeXpub, generateMnemonic, verifyAirnodeXpub } from "@api3/airnode-admin";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

export async function generateStagingCredentials() {
  try {
    console.log("Generating Staging Airnode credentials...");

    // Create staging config directory if it doesn't exist
    const configDir = path.join(__dirname, "../config/staging");
    await fs.mkdir(configDir, { recursive: true });

    // Check if we should use an existing mnemonic from environment
    let mnemonic = process.env.MNEMONIC_AIRNODE_STAGING;
    let isNewMnemonic = false;

    if (!mnemonic) {
      console.log("No staging mnemonic found in environment. Generating a new one...");
      // Generate a new mnemonic using the SDK
      mnemonic = generateMnemonic();
      isNewMnemonic = true;

      // Save to .env.staging for future use
      const envPath = path.join(__dirname, "../.env.staging");
      await fs.writeFile(
        envPath,
        `# Generated Staging Airnode mnemonic - keep this secure!\nMNEMONIC_AIRNODE_STAGING="${mnemonic}"\n`,
        { flag: "a" }, // Append to file if it exists
      );
      console.log(`Staging mnemonic saved to ${envPath}`);
    } else {
      console.log("Using staging mnemonic from environment variables");
    }

    // Derive the airnodeAddress from the mnemonic
    const airnodeAddress = deriveAirnodeAddress(mnemonic);
    console.log(`Staging Airnode address: ${airnodeAddress}`);

    // Derive the xpub from the mnemonic
    const airnodeXpub = deriveAirnodeXpub(mnemonic);
    console.log(`Staging Airnode xpub: ${airnodeXpub.substring(0, 20)}...`);

    // Verify the xpub against the airnodeAddress
    const isValid = verifyAirnodeXpub(airnodeXpub, airnodeAddress);
    if (!isValid) {
      throw new Error("Staging Airnode xpub verification failed. The xpub does not match the airnodeAddress.");
    }
    console.log("Staging Airnode xpub verification: VALID");

    // Save the credentials to a JSON file for staging
    const credentials = {
      airnodeAddress,
      airnodeXpub,
      mnemonic, // Include mnemonic for AWS deployment
      isNewMnemonic,
      environment: "staging",
    };

    const credentialsPath = path.join(configDir, "airnode-credentials.json");
    await fs.writeFile(credentialsPath, JSON.stringify(credentials, null, 2));
    console.log(`Staging credentials saved to ${credentialsPath}`);

    return credentials;
  } catch (error) {
    console.error("Error generating Staging Airnode credentials:", error);
    throw error;
  }
}

// For command-line usage
if (require.main === module) {
  generateStagingCredentials()
    .then(() => console.log("Staging Airnode credentials generation completed"))
    .catch((error) => {
      console.error("Error in Staging Airnode credentials generation:", error);
      process.exit(1);
    });
}
