/**
 * Airnode Credentials Generator
 *
 * This script generates or loads the Airnode credentials:
 * 1. Generates a new mnemonic or loads an existing one from environment
 * 2. Derives the airnodeAddress and xpub from the mnemonic
 * 3. Verifies the xpub against the airnodeAddress
 * 4. Saves the credentials to a JSON file for use by other scripts
 *
 * The generated credentials are used to identify the Airnode and derive
 * sponsor wallets for request fulfillment.
 */

import { promises as fs } from "node:fs";
import * as path from "node:path";
import { deriveAirnodeAddress, deriveAirnodeXpub, generateMnemonic, verifyAirnodeXpub } from "@api3/airnode-admin";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

export async function generateAirnodeCredentials() {
  try {
    console.log("Generating Airnode credentials...");

    // Create config directory if it doesn't exist
    const configDir = path.join(__dirname, "../config/local");
    await fs.mkdir(configDir, { recursive: true });

    // Check if we should use an existing mnemonic from environment
    let mnemonic = process.env.MNEMONIC_AIRNODE_LOCAL;
    let isNewMnemonic = false;

    if (!mnemonic) {
      console.log("No mnemonic found in environment. Generating a new one...");
      // Generate a new mnemonic using the SDK
      mnemonic = generateMnemonic();
      isNewMnemonic = true;

      // Save to .env.local for future use
      const envPath = path.join(__dirname, "../.env.local");
      await fs.writeFile(
        envPath,
        `# Generated Airnode mnemonic - keep this secure!\nMNEMONIC_AIRNODE_LOCAL="${mnemonic}"\n`,
        { flag: "a" }, // Append to file if it exists
      );
      console.log(`Mnemonic saved to ${envPath}`);
    } else {
      console.log("Using mnemonic from environment variables");
    }

    // Derive the airnodeAddress from the mnemonic
    const airnodeAddress = deriveAirnodeAddress(mnemonic);
    console.log(`Airnode address: ${airnodeAddress}`);

    // Derive the xpub from the mnemonic
    const airnodeXpub = deriveAirnodeXpub(mnemonic);
    console.log(`Airnode xpub: ${airnodeXpub.substring(0, 20)}...`);

    // Verify the xpub against the airnodeAddress
    const isValid = verifyAirnodeXpub(airnodeXpub, airnodeAddress);
    if (!isValid) {
      throw new Error("Airnode xpub verification failed. The xpub does not match the airnodeAddress.");
    }
    console.log("Airnode xpub verification: VALID");

    // Save the credentials to a JSON file
    const credentials = {
      airnodeAddress,
      airnodeXpub,
      // Don't save the mnemonic to the JSON file for security reasons
      // It's already saved in .env.local
      isNewMnemonic,
    };

    const credentialsPath = path.join(configDir, "airnode-credentials.json");
    await fs.writeFile(credentialsPath, JSON.stringify(credentials, null, 2));
    console.log(`Credentials saved to ${credentialsPath}`);

    // Also save the mnemonic to secrets.env for the Airnode container
    const secretsPath = path.join(configDir, "secrets.env");
    await fs.writeFile(secretsPath, `AIRNODE_WALLET_MNEMONIC="${mnemonic}"\n`);
    console.log(`Mnemonic saved to ${secretsPath} for Airnode container`);

    return credentials;
  } catch (error) {
    console.error("Error generating Airnode credentials:", error);
    throw error;
  }
}

// For command-line usage
if (require.main === module) {
  generateAirnodeCredentials()
    .then(() => console.log("Airnode credentials generation completed"))
    .catch((error) => {
      console.error("Error in Airnode credentials generation:", error);
      process.exit(1);
    });
}
