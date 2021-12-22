const { ethers, network, ethernal, run } = require("hardhat");
const path = require("path");
const fs = require("fs");
const merge = require("lodash.merge");
const debug = require("debug");

const tasks = require("./tasks");

const log = debug("HTP:deployer");

const defaultOptions = {
  basePath: "./.deployments",
  proxy: true,
};

async function _getArtifacts() {
  return {
    HashtagAccessControls: await ethers.getContractFactory("HashtagAccessControls"),
    HashtagProtocol: await ethers.getContractFactory("HashtagProtocol"),
    ERC721HashtagRegistry: await ethers.getContractFactory("ERC721HashtagRegistry"),
  };
}

async function _getAccounts() {
  const namedAccounts = await ethers.getNamedSigners();
  return {
    accountHashtagAdmin: namedAccounts["accountHashtagAdmin"],
    accountHashtagPublisher: namedAccounts["accountHashtagPublisher"],
    accountHashtagPlatform: namedAccounts["accountHashtagPlatform"],
  };
}

class Deployer {
  static async create(options) {
    return new Deployer(options, await _getArtifacts(), await _getAccounts());
  }

  constructor(options, artifacts, accounts) {
    this.options = {
      ...defaultOptions,
      ...options,
    };
    this.artifacts = artifacts;
    this.accounts = accounts;
    this.network = network.config;
    this.networkName = network.name;

    this.log = log;
    debug.enable("HTP:deployer");

    const { basePath } = this.options;
    if (!fs.existsSync(basePath)) {
      fs.mkdirSync(basePath);
    }

    this.log("Initialized deployer", {
      options: this.options,
      artifacts: Object.keys(artifacts),
      accounts: Object.values(accounts)
        .filter((a) => !!a)
        .map((a) => a.address),
      network: network.config,
    });
  }

  async execute(tags, config) {
    tags = tags || [];

    this.log("Execution started");
    for (const task of tasks.sort((a, b) => a.priority - b.priority)) {
      if (!tags.some((t) => task.tags.includes(t.toLowerCase()))) continue;

      this.log("Executing task", { tags: task.tags });
      const dependencies = task.ensureDependencies(this, config);
      await task.run(this, dependencies);
    }

    const _config = this.getNetworkConfig();
    this.log("Execution completed", JSON.stringify(_config));
    return _config;
  }

  getNetworkConfig() {
    const config = this.getDeployConfig();

    const emptyConfig = {
      address: "0x0000000000000000000000000000000000000000",
      legacyAddresses: [],
      deploymentBlock: "0x0",
    };

    const contracts = {};
    for (const [key, value] of Object.entries(config.contracts || {})) {
      contracts[key] = {
        ...emptyConfig,
        address: value.address,
        implementation: value.implementation,
        deploymentBlock: value.transaction && ethers.BigNumber.from(value.transaction.blockNumber).toHexString(),
      };
    }

    return {
      networks: {
        [this.network.chainId]: {
          contracts,
        },
      },
    };
  }

  getDeployConfig() {
    const configPath = path.resolve(this.options.basePath, `${this.network.chainId}.json`);
    const file = fs.existsSync(configPath) ? fs.readFileSync(configPath) : "{}";
    return JSON.parse(file.length ? file : "{}");
  }

  async saveContractConfig(name, contract, implAddress) {
    const config = this.getDeployConfig();

    const _config = merge(config, {
      contracts: {
        [name]: {
          address: contract.address,
          implementation: implAddress,
          transaction: contract.deployTransaction && (await contract.deployTransaction.wait()),
        },
      },
    });

    this._saveConfig(_config);
  }

  async _saveConfig(config) {
    const configPath = path.resolve(this.options.basePath, `${this.network.chainId}.json`);
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  }

  async verify(name, proxy, implementation, args) {
    this.log("Verifying contract", {
      name,
      networkName: this.networkName,
      chainId: this.network.chainId,
      proxy,
      args,
    });

    // If we are on hardhat local chain.
    if (this.network.chainId == 31337) {
      try {
        // Verify on ethernal.
        // await ethernal.push({
        //   name: name,
        //   address: proxy,
        // });
      } catch (err) {
        this.log("Verification failed", { name, chainId: this.network.chainId, proxy, args, err });
      }
    } else {
      try {
        await run("verify:verify", {
          network: this.networkName,
          implementation,
          constructorArguments: args,
        });
      } catch (err) {
        this.log("Verification failed", { name, chainId: this.network.chainId, implementation, args, err });
      }
    }
  }
}

module.exports = Deployer;
