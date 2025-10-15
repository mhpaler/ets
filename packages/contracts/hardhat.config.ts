import hardhatToolboxViem from "@nomicfoundation/hardhat-toolbox-viem";
import hardhatVerify from "@nomicfoundation/hardhat-verify";
import * as dotenv from "dotenv";
import type { HardhatUserConfig } from "hardhat/config";

// Load environment variables
// Priority: .env.local > .env > process.env (from monorepo root)
dotenv.config({ path: ".env.local" });
dotenv.config(); // Fallback to .env if exists

// Detect environment
const ENVIRONMENT = process.env.HARDHAT_NETWORK || process.env.NODE_ENV || "local";

// Environment-specific configuration
const getNetworkConfig = () => {
  const isStaging = ENVIRONMENT === "baseSepolia" || ENVIRONMENT === "staging";
  const isProduction = ENVIRONMENT === "base" || ENVIRONMENT === "production";
  const isLocal = !isStaging && !isProduction;

  // Get mnemonic based on environment
  let mnemonic: string | undefined;
  if (isProduction) {
    mnemonic = process.env.PRODUCTION_MNEMONIC;
  } else if (isStaging) {
    mnemonic = process.env.STAGING_MNEMONIC || process.env.MNEMONIC_TESTNET_STAGING;
  } else {
    // Local development - use default Hardhat mnemonic
    mnemonic = process.env.LOCAL_MNEMONIC || "test test test test test test test test test test test junk";
  }

  // Get Alchemy API key
  const alchemyApiKey = process.env.ALCHEMY_API_KEY || "TjjzoNYlIqWqZxcoufe60bhVbARhkxYX"; // Default for Base Sepolia

  return {
    mnemonic,
    alchemyApiKey,
    isLocal,
    isStaging,
    isProduction,
    environment: isProduction ? "production" : isStaging ? "staging" : "local",
  };
};

const networkConfig = getNetworkConfig();

// Log configuration for transparency
console.log("🔧 Hardhat Configuration");
console.log(
  `   Environment: ${networkConfig.environment === "production" ? "Production (Base Mainnet)" : networkConfig.environment === "staging" ? "Staging (Base Sepolia)" : "Local Development"}`,
);
console.log(
  `   Network: ${ENVIRONMENT === "baseSepolia" ? "baseSepolia" : ENVIRONMENT === "base" ? "base" : "localhost"} (${ENVIRONMENT === "baseSepolia" ? 84532 : ENVIRONMENT === "base" ? 8453 : 31337})`,
);
console.log(
  `   RPC: ${networkConfig.isProduction ? "https://mainnet.base.org" : networkConfig.isStaging ? "https://sepolia.base.org" : "http://localhost:8545"}`,
);

// Warn if no mnemonic configured for non-local environments
if (!networkConfig.mnemonic && !networkConfig.isLocal) {
  console.warn("⚠️  No mnemonic configured for environment:", networkConfig.environment);
  console.warn("   Set STAGING_MNEMONIC or PRODUCTION_MNEMONIC in .env.local");
} else if (networkConfig.mnemonic && !networkConfig.isLocal) {
  console.log(`   Mnemonic: ✅ Configured (${networkConfig.mnemonic.split(" ").length} words)`);
}

const config: HardhatUserConfig = {
  plugins: [hardhatToolboxViem, hardhatVerify],
  solidity: {
    npmFilesToBuild: [
      "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol",
      "@openzeppelin/contracts/proxy/beacon/BeaconProxy.sol",
      "@openzeppelin/contracts/proxy/beacon/UpgradeableBeacon.sol",
    ],
    compilers: [
      {
        version: "0.4.24",
      },
      {
        version: "0.6.12",
        settings: {
          optimizer: {
            enabled: true,
            runs: 1000,
          },
        },
      },
      {
        version: "0.8.2",
        settings: {
          optimizer: {
            enabled: true,
            runs: 1000,
          },
        },
      },
      {
        version: "0.8.7",
        settings: {
          optimizer: {
            enabled: true,
            runs: 1000,
          },
        },
      },
      {
        version: "0.8.9",
        settings: {
          optimizer: {
            enabled: true,
            runs: 1000,
          },
        },
      },
      {
        version: "0.8.12",
        settings: {
          optimizer: {
            enabled: true,
            runs: 1000,
          },
        },
      },
    ],
  },
  networks: {
    // Hardhat network (in-process)
    hardhat: {
      type: "edr-simulated",
      chainType: "l1",
      chainId: 31337,
      accounts: networkConfig.mnemonic
        ? {
            mnemonic: networkConfig.mnemonic,
            count: 20, // Generate 20 accounts: 10 reserved + test accounts
          }
        : undefined,
    },

    // Local network (external node)
    localhost: {
      type: "http",
      chainType: "l1",
      url: "http://127.0.0.1:8545",
      chainId: 31337,
      accounts: networkConfig.mnemonic
        ? {
            mnemonic: networkConfig.mnemonic,
            count: 20, // Generate 20 accounts: 10 reserved + test accounts
          }
        : undefined,
    },

    // Base Sepolia (Staging)
    baseSepolia: {
      type: "http",
      chainType: "op",
      url: process.env.STAGING_RPC_URL || `https://base-sepolia.g.alchemy.com/v2/${networkConfig.alchemyApiKey}`,
      chainId: 84532,
      accounts: networkConfig.mnemonic
        ? {
            mnemonic: networkConfig.mnemonic,
            count: 20, // Generate 20 accounts: 10 reserved + test accounts
          }
        : undefined,
    },

    // Base Mainnet (Production)
    base: {
      type: "http",
      chainType: "op",
      url: process.env.PRODUCTION_RPC_URL || `https://base-mainnet.g.alchemy.com/v2/${networkConfig.alchemyApiKey}`,
      chainId: 8453,
      accounts: networkConfig.mnemonic
        ? {
            mnemonic: networkConfig.mnemonic,
            count: 20, // Generate 20 accounts: 10 reserved + test accounts
          }
        : undefined,
    },
  },

  // Contract verification
  verify: {
    etherscan: {
      apiKey: process.env.BASESCAN_API_KEY || "dummy-key-for-local",
    },
  },
};

export default config;
