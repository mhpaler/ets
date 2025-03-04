import fs from "node:fs";
import path from "node:path";
import Arweave from "arweave";

// Load JWK from file
const loadJwk = () => {
  const jwkPath = process.env.ARWEAVE_JWK_PATH || path.resolve("./arweave-keyfile.json");
  return JSON.parse(fs.readFileSync(jwkPath, "utf-8"));
};

async function mintAR() {
  // Initialize Arweave with local network
  const arweave = Arweave.init({
    host: "localhost",
    port: 1984,
    protocol: "http",
  });

  try {
    const jwk = loadJwk();
    const walletAddress = await arweave.wallets.jwkToAddress(jwk);

    console.log(`Wallet address: ${walletAddress}`);
    console.log("Minting test AR...");

    // ArLocal has a special endpoint for minting tokens
    const response = await fetch(`http://localhost:1984/mint/${walletAddress}/1000000000000`);

    if (response.status === 200) {
      console.log("Successfully minted test AR tokens!");

      // Check balance
      const balance = await arweave.wallets.getBalance(walletAddress);
      const ar = arweave.ar.winstonToAr(balance);
      console.log(`New wallet balance: ${ar} AR`);
    } else {
      console.error("Failed to mint tokens:", await response.text());
    }
  } catch (error) {
    console.error("Error in mintAR:", error);
  }
}

mintAR();
