import hardhatToolboxViemPlugin from "@nomicfoundation/hardhat-toolbox-viem";
import type { HardhatUserConfig } from "hardhat/config";
import { configVariable } from "hardhat/config";

const config: HardhatUserConfig = {
  plugins: [hardhatToolboxViemPlugin],
  solidity: {
    npmFilesToBuild: [
      "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol",
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
        count: 10, // Generate 10 accounts from mnemonic
      },
    },
    localhost: {
      type: "http",
      chainType: "l1",
      url: "http://127.0.0.1:8545",
      chainId: 31337,
      accounts: {
        mnemonic: configVariable("LOCAL_MNEMONIC"),
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
      },
    },
  },
};

export default config;
