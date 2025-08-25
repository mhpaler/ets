import fs from "node:fs";
import path from "node:path";
import Arweave from "arweave";

/**
 * Generates an Arweave keyfile (JWK) for local development
 * This keyfile is used for ArLocal testing and should NOT be used in production
 */
async function generateArweaveKeyfile() {
  try {
    console.log("🔑 Generating Arweave keyfile for local development...");

    // Initialize Arweave
    const arweave = Arweave.init({
      host: "localhost",
      port: 1984,
      protocol: "http",
    });

    // Generate a new wallet
    const jwk = await arweave.wallets.generate();
    const address = await arweave.wallets.jwkToAddress(jwk);

    // Define keyfile path
    const keyfilePath = path.resolve(process.cwd(), "arweave-keyfile.json");

    // Write keyfile to disk
    fs.writeFileSync(keyfilePath, JSON.stringify(jwk, null, 2));

    console.log("✅ Arweave keyfile generated successfully!");
    console.log(`📁 Location: ${keyfilePath}`);
    console.log(`🔐 Wallet address: ${address}`);
    console.log("⚠️  NOTE: This keyfile is for LOCAL DEVELOPMENT ONLY!");
    console.log("⚠️  Do NOT use this keyfile for production or mainnet!");

    return { jwk, address, keyfilePath };
  } catch (error) {
    console.error("❌ Failed to generate Arweave keyfile:", error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  generateArweaveKeyfile();
}

export { generateArweaveKeyfile };
