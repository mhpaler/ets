const {upgrades} = require("hardhat");
const {setup} = require("./setup.js");
const {verify} = require("./utils/verify.js");
const {saveNetworkConfig} = require("./utils/config.js");

module.exports = async ({deployments}) => {
  const {save, log} = deployments;
  [accounts, factories, initSettings] = await setup();

  // Deploy ETS Access Controls.
  const deployment = await upgrades.deployProxy(factories.ETSAccessControls, [], {
    kind: "uups",
    pollingInterval: 3000,
    timeout: 0,
  });
  await deployment.deployed();
  const implementation = await upgrades.erc1967.getImplementationAddress(deployment.address);

  if (process.env.ETHERNAL_DISABLED === "false") {
    // Verify & Update network configuration file.
    await verify("ETSAccessControls", deployment, implementation, []);
  }

  await saveNetworkConfig("ETSAccessControls", deployment, implementation, false);

  // Add to hardhat-deploy deployments.
  let artifact = await deployments.getExtendedArtifact("ETSAccessControls");
  let proxyDeployments = {
    address: deployment.address,
    ...artifact,
  };
  await save("ETSAccessControls", proxyDeployments);

  log("====================================================");
  log("ETSAccessControls proxy deployed to -> " + deployment.address);
  log("ETSAccessControls implementation deployed to -> " + implementation);
  log("====================================================");
};

module.exports.tags = ["ETSAccessControls"];
