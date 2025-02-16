const { network } = require("hardhat");
const fs = require("node:fs");
const path = require("node:path");

module.exports = async () => {
  console.info("Starting deployment process...");

  if (network.config.chainId === 31337) {
    const configPath = `./src/upgradeConfig/${network.name}.json`;
    const emptyConfig = { contracts: {} };
    const directory = path.dirname(configPath);

    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true });
    }

    fs.writeFileSync(configPath, JSON.stringify(emptyConfig, null, 2));
    console.info("Localhost config cleared");
  }
};

module.exports.tags = ["deployAll"];
module.exports.dependencies = ["PostDeployment"];
