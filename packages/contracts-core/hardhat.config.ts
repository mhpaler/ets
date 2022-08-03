import "hardhat-deploy";
import "hardhat-ethernal";
// import '@typechain/hardhat';
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
import {HardhatUserConfig} from "hardhat/types";

import "./tasks/accounts";
import "./tasks/signers";
import "./tasks/tagTarget";
import "./tasks/createTag";

dotenvConfig({path: resolve(__dirname, "../../.env")});

// Ensure that we have all the environment variables we need.
const mnemonic: string | undefined = process.env.MNEMONIC;

if (!mnemonic) {
  throw new Error("Please set your MNEMONIC in a .env file");
}

const config: HardhatUserConfig = {
  networks: {
    hardhat: {
      accounts: mnemonic ? {mnemonic} : undefined,
      chainId: 31337,
    },
    localhost: {
      url: "http://localhost:8545",
      accounts: mnemonic ? {mnemonic} : undefined,
      chainId: 31337,
    },
    mumbai: {
      url: `https://polygon-mumbai.infura.io/v3/${process.env.INFURA_API_KEY}`,
      chainId: 80001,
      accounts: mnemonic ? {mnemonic} : undefined,
      gas: 2100000,
      gasPrice: 8000000000,
    },
  },
  //paths: {
  //  artifacts: '../app/artifacts',
  //},
  abiExporter: {
    path: "./abi",
    runOnCompile: true,
  },
  // ETS administration accounts.
  namedAccounts: {
    ETSAdmin: {
      default: 0,
      mumbai: "0x93A5f58566D436Cae0711ED4d2815B85A26924e6",
    },
    ETSPlatform: {
      default: 1,
      mumbai: "0x60F2760f0D99330A555c5fc350099b634971C6Eb",
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
  docgen: {
    pages: "files",
    templates: "./templates",
    exclude: ["libraries", "mocks", "test", "utils"],
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
  ethernal: {
    disableSync: false,
    disableTrace: true,
    workspace: process.env.ETHERNAL_WORKSPACE ? process.env.ETHERNAL_WORKSPACE : undefined,
    uploadAst: false,
    disabled: process.env.ETHERNAL_DISABLED == "true" ? true : false,
    resetOnStart: process.env.ETHERNAL_WORKSPACE ? process.env.ETHERNAL_WORKSPACE : undefined,
  },
};

export default config;
