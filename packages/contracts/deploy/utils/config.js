const { network } = require("hardhat");
const fs = require("node:fs");
const path = require("node:path");

function getConfigPath() {
  return `./src/upgradeConfig/${network.name}.json`;
}

async function saveNetworkConfig(contractName, deployment, implementation, isUpgrade = false) {
  const txn = await ethers.provider.getTransaction(deployment.deploymentTransaction().hash);
  const block = txn.blockNumber;
  console.info("Deployment Block:", block);
  const address = deployment.address || (await deployment.getAddress());

  const configPath = getConfigPath();
  let config = { contracts: {} };

  if (fs.existsSync(configPath)) {
    config = JSON.parse(fs.readFileSync(configPath, "utf8"));
  }

  if (!isUpgrade) {
    config.contracts[contractName] = {
      address,
      implementation,
      deploymentBlock: block,
      upgradeHistory: [
        {
          block,
          implementation,
        },
      ],
    };
  } else {
    const currentImpl = config.contracts[contractName].implementation;
    console.info("Current implementation:", currentImpl);
    console.info("New implementation:", implementation);

    if (currentImpl !== implementation) {
      console.info("Implementation changed - recording upgrade");
      config.contracts[contractName].implementation = implementation;

      // Initialize upgradeHistory with original deployment if it doesn't exist
      if (!config.contracts[contractName].upgradeHistory) {
        config.contracts[contractName].upgradeHistory = [
          {
            block: config.contracts[contractName].deploymentBlock,
            implementation: currentImpl,
          },
        ];
      }

      config.contracts[contractName].upgradeHistory.push({
        block,
        implementation,
      });
    } else {
      console.info("Implementation unchanged - skipping upgrade record");
    }
  }

  const directory = path.dirname(configPath);
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }

  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
}

module.exports = {
  saveNetworkConfig,
};
