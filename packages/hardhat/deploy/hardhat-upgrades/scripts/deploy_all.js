const { network } = require("hardhat");
const { mergeNetworkConfig } = require("../utils/config");
const Deployer = require("../utils/deployer");
const ETSNetworkConfig = require("../../../config/config.json");

async function main() {
  console.log("Network:", network.name);

  const config = ETSNetworkConfig.networks[network.config.chainId];
  if (!config) {
    throw new Error(`Config not found for network ${network.config.chainId}`);
  }

  const deployer = await Deployer.create();
  // See tasks.js for deployment tasks.
  const deployConfig = await deployer.execute(["deploy_all"], config);
  mergeNetworkConfig(deployConfig);

  console.log("Deployed!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
