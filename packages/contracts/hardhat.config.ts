// Hardhat configuration
import type { HardhatUserConfig } from "hardhat/types";
import "hardhat-deploy";
import "solidity-docgen";
import "@solarity/hardhat-markup";
import "hardhat-abi-exporter";
import "@nomiclabs/hardhat-web3";
import "@nomicfoundation/hardhat-toolbox";
import "@nomiclabs/hardhat-truffle5";
import "@openzeppelin/hardhat-upgrades";
import "@nomicfoundation/hardhat-chai-matchers";

import fs from "node:fs";
import { resolve } from "node:path";
import { config as dotenvConfig } from "dotenv";

import "./tasks";

// Load package-specific .env file if it exists, otherwise fall back to project root .env
const packageEnvPath = resolve(__dirname, ".env");
const rootEnvPath = resolve(__dirname, "../../.env");

if (fs.existsSync(packageEnvPath)) {
  console.info("Using package-specific .env file");
  dotenvConfig({ path: packageEnvPath });
} else {
  console.info("Package-specific .env not found, using root .env file");
  dotenvConfig({ path: rootEnvPath });
}

const mnemonic = {
  local: `${process.env.MNEMONIC_LOCAL}`.replace(/_/g, " "),
  testnet_production: `${process.env.MNEMONIC_TESTNET_PRODUCTION}`.replace(/_/g, " "),
  testnet_staging: `${process.env.MNEMONIC_TESTNET_STAGING}`.replace(/_/g, " "),
  mainnet: `${process.env.MNEMONIC_MAINNET}`.replace(/_/g, " "),
};

const config: HardhatUserConfig = {
  networks: {
    hardhat: {
      chainId: 31337,
      mining: {
        auto: false,
        interval: 2000,
        mempool: {
          order: "fifo",
        },
      },
      accounts: {
        mnemonic: mnemonic.local,
      },
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
      accounts: {
        mnemonic: mnemonic.local,
      },
    },
    // PRODUCTION TESTNET NETWORKS
    baseSepolia: {
      // Get chain name from Viem: https://github.com/wevm/viem/blob/main/src/chains/index.ts
      url: `https://base-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_TESTNET}`,
      chainId: 84532,
      accounts: {
        mnemonic: mnemonic.testnet_production,
      },
      gas: 2100000,
      gasPrice: 8000000000,
    },
    // STAGING TESTNET NETWORKS
    baseSepoliaStaging: {
      url: `https://base-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_TESTNET}`,
      chainId: 84532,
      accounts: {
        mnemonic: mnemonic.testnet_staging,
      },
      gas: 2100000,
      gasPrice: 8000000000,
    },
    // MAINNET NETWORKS FOR FUTURE USE
    base: {
      url: `https://base-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_MAINNET}`,
      chainId: 8453,
      accounts: {
        mnemonic: mnemonic.mainnet,
      },
      gasPrice: 1000000000, // Adjust based on current network conditions
    },
  },
  abiExporter: {
    path: "./abi",
    runOnCompile: true,
  },
  // ETS administration accounts.
  namedAccounts: {
    ETSAdmin: { default: 0 },
    ETSPlatform: { default: 1 },
    ETSOracle: { default: 2 },
  },
  etherscan: {
    apiKey: {
      // Production networks
      base: process.env.BASESCAN_API_KEY ? process.env.BASESCAN_API_KEY : "",
      // Testnet networks - using same API keys for both production and staging
      baseSepolia: process.env.BASESCAN_API_KEY ? process.env.BASESCAN_API_KEY : "",
      baseSepoliaStaging: process.env.BASESCAN_API_KEY ? process.env.BASESCAN_API_KEY : "",
    },
  },
  markup: {
    outdir: "./docs",
    onlyFiles: [],
    skipFiles: ["./contracts/openzeppelin", "./contracts/mocks", "./contracts/test", "./contracts/utils"],
    noCompile: false,
    verbose: false,
  },
  docgen: {
    outputDir: "docs",
    pages: "items",
    templates: "./templates",
    exclude: ["mocks", "test", "utils"],
  },
  // typechain: {
  //   outDir: '../app/types',
  // },
  solidity: {
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
    // Add overrides at this level (parallel to compilers)
    overrides: {
      "@api3/airnode-protocol/contracts/rrp/AirnodeRrpV0.sol": {
        version: "0.8.9",
      },
    },
  },
  // End of configuration
};

export default config;
