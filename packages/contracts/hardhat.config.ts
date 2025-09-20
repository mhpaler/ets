import hardhatToolboxViem from "@nomicfoundation/hardhat-toolbox-viem";
import * as dotenv from "dotenv";
import type { HardhatUserConfig } from "hardhat/config";
import { configVariable } from "hardhat/config";

// Load environment variables from .env file
dotenv.config();

// Tasks would go here but the API has changed in Hardhat 3
// Use scripts instead (see scripts/ directory)

const config: HardhatUserConfig = {
  plugins: [hardhatToolboxViem],
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
    hardhat: {
      type: "edr-simulated",
      chainType: "l1",
      chainId: 31337,
      accounts: {
        mnemonic: configVariable("LOCAL_MNEMONIC"),
        count: 20, // Generate 20 accounts: 10 reserved + test accounts
      },
    },
    localhost: {
      type: "http",
      chainType: "l1",
      url: "http://127.0.0.1:8545",
      chainId: 31337,
      accounts: {
        mnemonic: configVariable("LOCAL_MNEMONIC"),
        count: 20, // Generate 20 accounts: 10 reserved + test accounts
      },
    },
    // Base Sepolia (Staging)
    baseSepolia: {
      type: "http",
      chainType: "op",
      url: configVariable("BASE_SEPOLIA_RPC_URL"),
      chainId: 84532,
      accounts: {
        mnemonic: configVariable("STAGING_MNEMONIC"),
        count: 20, // Generate 20 accounts: 10 reserved + test accounts
      },
    },
    // Base Mainnet (Production)
    base: {
      type: "http",
      chainType: "op",
      url: configVariable("BASE_MAINNET_RPC_URL"),
      chainId: 8453,
      accounts: {
        mnemonic: configVariable("PRODUCTION_MNEMONIC"),
        count: 20, // Generate 20 accounts: 10 reserved + test accounts
      },
    },
  },
};

export default config;
