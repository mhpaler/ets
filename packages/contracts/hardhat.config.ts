//import "hardhat-ethernal";
import "@typechain/hardhat";
import {HardhatUserConfig} from "hardhat/types";
import "hardhat-deploy";
import "solidity-docgen";
import "solidity-coverage";
import "hardhat-abi-exporter";
import "@nomiclabs/hardhat-web3";
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-truffle5";
import "@nomiclabs/hardhat-etherscan";
import "@openzeppelin/hardhat-upgrades";

import {resolve} from "path";
import {config as dotenvConfig} from "dotenv";
//import {HttpNetworkAccountsUserConfig} from "hardhat/types";

import "./tasks";

dotenvConfig({path: resolve(__dirname, "../../.env")});

const mnemonic = {
  local: `${process.env.MNEMONIC_LOCAL}`.replace(/_/g, " "),
  mumbai: `${process.env.MNEMONIC_MUMBAI}`.replace(/_/g, " "),
};

const config: HardhatUserConfig = {
  networks: {
    hardhat: {
      mining: {
        auto: true,
        interval: 5000,
        mempool: {
          order: "fifo",
        },
      },
      accounts: {
        mnemonic: mnemonic.local,
      },
      chainId: 31337,
    },
    localhost: {
      url: "http://localhost:8545",
      accounts: {
        mnemonic: mnemonic.local,
      },
      chainId: 31337,
    },
    mumbai: {
      url: `https://polygon-mumbai.g.alchemy.com/v2/${process.env.ALCHEMY_MUMBAI}`,
      //url: `https://polygon-mumbai.infura.io/v3/${process.env.INFURA_API_KEY}`,
      chainId: 80001,
      accounts: {
        mnemonic: mnemonic.mumbai,
      },
      gas: 2100000,
      gasPrice: 8000000000,
    },
  },
  abiExporter: {
    path: "./abi",
    runOnCompile: true,
  },
  // ETS administration accounts.
  namedAccounts: {
    ETSAdmin: {default: 0},
    ETSPlatform: {default: 1},
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
  docgen: {
    outputDir: "docs",
    pages: "files",
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
  //  ethernal: {
  //    disableSync: false,
  //    disableTrace: true,
  //    workspace: process.env.ETHERNAL_WORKSPACE ? process.env.ETHERNAL_WORKSPACE : undefined,
  //    uploadAst: false,
  //    disabled: process.env.ETHERNAL_DISABLED == "true" ? true : false,
  //    resetOnStart: process.env.ETHERNAL_WORKSPACE ? process.env.ETHERNAL_WORKSPACE : undefined,
  //  },
};

export default config;
