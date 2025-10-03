import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { config as dotenvConfig } from "dotenv";
import type { Config } from "./types.js";

// Get the directory containing this file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from the project root
dotenvConfig({ path: join(__dirname, "..", ".env") });

function getRequiredEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function getOptionalEnv(key: string): string | undefined {
  return process.env[key];
}

export const config: Config = {
  rpcUrl: getRequiredEnv("BASE_RPC_URL"),
  alchemyApiKey: getOptionalEnv("ALCHEMY_API_KEY"),
  offchainApiUrl: getOptionalEnv("OFFCHAIN_API_URL") || "http://localhost:4000",

  smartWallet: {
    address: getRequiredEnv("SMART_WALLET_ADDRESS") as `0x${string}`,
    owners: {
      eoa: getRequiredEnv("EOA_PRIVATE_KEY").replace("0x", "") as `0x${string}`,
      privy: getRequiredEnv("PRIVY_PRIVATE_KEY").replace("0x", "") as `0x${string}`,
    },
    entryPoint: getRequiredEnv("ENTRY_POINT_ADDRESS") as `0x${string}`,
  },

  zoraFactory: getRequiredEnv("ZORA_FACTORY_ADDRESS") as `0x${string}`,

  coinDefaults: {
    name: process.env.COIN_NAME || "Test Content Coin",
    symbol: process.env.COIN_SYMBOL || "TCC",
    uri: process.env.COIN_URI || "ipfs://QmTesting123",
    platformReferrer: (process.env.PLATFORM_REFERRER || "0x0000000000000000000000000000000000000000") as `0x${string}`,
  },
};

// Validate addresses are properly formatted
function validateAddress(address: string, name: string): void {
  if (!address.startsWith("0x") || address.length !== 42) {
    throw new Error(`Invalid address format for ${name}: ${address}`);
  }
}

// Validate configuration on load
validateAddress(config.smartWallet.address, "SMART_WALLET_ADDRESS");
validateAddress(config.smartWallet.entryPoint, "ENTRY_POINT_ADDRESS");
validateAddress(config.zoraFactory, "ZORA_FACTORY_ADDRESS");

console.log("Configuration loaded successfully");
console.log(`Smart Wallet: ${config.smartWallet.address}`);
console.log(`Zora Factory: ${config.zoraFactory}`);
console.log(`Entry Point: ${config.smartWallet.entryPoint}`);
