import path from "node:path";
import {
  type SupportedChainId,
  availableChainIds,
  chains,
  networkNames,
} from "@ethereum-tag-service/contracts/multiChainConfig";
import dotenv from "dotenv";

// Load .env file
const envPath =
  process.env.NODE_ENV === "production"
    ? path.resolve(__dirname, "../../.env")
    : path.resolve(__dirname, "../../.env.local");

dotenv.config({ path: envPath });

console.info("process.env.NODE_ENV", process.env.NODE_ENV);
console.info("Environment variables loaded from:", envPath);
console.info("MOCK_ARWEAVE env var:", process.env.MOCK_ARWEAVE);

// Validate that the chainId is supported
export const isChainSupported = (chainId: number): boolean => {
  return availableChainIds.includes(chainId.toString() as SupportedChainId);
};

// Determine the environment
const nodeEnv = process.env.NODE_ENV || "development";
const etsEnv = process.env.ETS_ENVIRONMENT || (nodeEnv === "production" ? "production" : "staging");

console.info("Environment config:", { nodeEnv, etsEnv });

export const config = {
  port: process.env.PORT || 4000,
  environment: nodeEnv,
  etsEnvironment: etsEnv,

  // Chain configuration
  chains: {
    availableChainIds,
    chainDetails: chains,
    networkNames,
    isChainSupported,
  },

  // Blockchain wallet
  privateKey: process.env.PRIVATE_KEY,

  // Arweave configuration
  arweave: {
    keyfilePath: process.env.ARWEAVE_JWK_PATH || path.resolve(__dirname, "../../arweave-keyfile.json"),
    gateway: process.env.ARWEAVE_GATEWAY || "https://arweave.net",
    mockArweave: process.env.MOCK_ARWEAVE === "true",
  },

  // API keys used by sdk-core
  alchemyApiKey: process.env.ALCHEMY_API_KEY,

  // Custom RPC URLs (optional, used by sdk-core if provided)
  rpcUrls: {
    baseSepolia: process.env.BASE_SEPOLIA_RPC_URL,
  },

  // Environment-specific configurations
  environments: {
    // Production settings
    production: {
      subgraphEndpoints: {
        baseSepolia: "https://api.studio.thegraph.com/query/87165/ets-base-sepolia/version/latest",
      },
    },
    // Staging settings
    staging: {
      subgraphEndpoints: {
        baseSepolia: "https://api.studio.thegraph.com/query/87165/ets-base-sepolia-staging/version/latest",
      },
    },
  },
};
