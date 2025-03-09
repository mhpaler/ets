import * as dotenv from "dotenv";
import { ethers } from "ethers";

dotenv.config();

// Extract the xpub from the mnemonic - using ethers v5
async function main() {
  // Read the mnemonic from the new environment variable or fallback to test mnemonic
  const mnemonic = process.env.MNEMONIC_AIRNODE_LOCAL || "test test test test test test test test test test test junk";
  console.log(`Using mnemonic: ${mnemonic.substring(0, 10)}...`);

  try {
    // Create HD node from mnemonic - ethers v5 style
    const hdNode = ethers.utils.HDNode.fromMnemonic(mnemonic);

    // Derive the Airnode wallet at m/44'/60'/0' (master path for Airnode)
    const airnodeMasterHdNode = hdNode.derivePath("m/44'/60'/0'");

    // Get the extended key by calling the method directly
    const xpub = airnodeMasterHdNode.neuter().extendedKey;

    // Get the Airnode address at m/44'/60'/0'/0/0
    const airnodeAddress = hdNode.derivePath("m/44'/60'/0'/0/0").address;

    console.log("Airnode xpub:", xpub);
    console.log("Airnode address:", airnodeAddress);

    return { xpub, address: airnodeAddress };
  } catch (error) {
    console.error("Error getting xpub:", error);
    throw error;
  }
}
main()
  .then((_result) => {
    console.log("Successfully extracted Airnode information");
  })
  .catch((error) => {
    console.error("Error:", error);
    process.exit(1);
  });
