import { ETSConfig } from "@ethereum-tag-service/config";
import hardhatToolboxViem from "@nomicfoundation/hardhat-toolbox-viem";
import hardhatVerify from "@nomicfoundation/hardhat-verify";
import type { HardhatUserConfig } from "hardhat/config";

// Initialize config system
const etsConfig = ETSConfig.getInstance();
const env = etsConfig.getEnvironment();
const network = etsConfig.getNetwork();
const wallet = etsConfig.getWallet();

// Log configuration for transparency
console.log("🔧 Hardhat Configuration");
console.log(`   Environment: ${env.displayName}`);
console.log(`   Network: ${network.name} (${network.chainId})`);
console.log(`   RPC: ${network.rpcUrl}`);

// Ensure we have wallet configuration
if (!wallet?.mnemonic) {
  console.warn("⚠️  No mnemonic configured for environment:", env.name);
  console.warn("   Set STAGING_MNEMONIC or PRODUCTION_MNEMONIC in .env.local");
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
      accounts: wallet?.mnemonic
        ? {
            mnemonic: wallet.mnemonic,
            count: 20, // Generate 20 accounts: 10 reserved + test accounts
          }
        : undefined,
    },

    // Local network (external node)
    localhost: {
      type: "http",
      chainType: "l1",
      url: env.name === "local" ? network.rpcUrl : "http://127.0.0.1:8545",
      chainId: 31337,
      accounts: wallet?.mnemonic
        ? {
            mnemonic: wallet.mnemonic,
            count: 20, // Generate 20 accounts: 10 reserved + test accounts
          }
        : undefined,
    },

    // Base Sepolia (Staging)
    baseSepolia: {
      type: "http",
      chainType: "op",
      url:
        env.name === "staging"
          ? network.rpcUrl
          : `https://base-sepolia.g.alchemy.com/v2/${network.alchemyApiKey || process.env.ALCHEMY_API_KEY}`,
      chainId: 84532,
      accounts: wallet?.mnemonic
        ? {
            mnemonic: wallet.mnemonic,
            count: 20, // Generate 20 accounts: 10 reserved + test accounts
          }
        : undefined,
    },

    // Base Mainnet (Production)
    base: {
      type: "http",
      chainType: "op",
      url:
        env.name === "production"
          ? network.rpcUrl
          : `https://base-mainnet.g.alchemy.com/v2/${network.alchemyApiKey || process.env.ALCHEMY_API_KEY}`,
      chainId: 8453,
      accounts: wallet?.mnemonic
        ? {
            mnemonic: wallet.mnemonic,
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
