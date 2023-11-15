const { upgrades } = require("hardhat");
const { setup } = require("./setup.js");
const { verify } = require("./utils/verify.js");
const { saveNetworkConfig, readNetworkConfig } = require("./utils/config.js");

module.exports = async ({ getChainId, deployments }) => {
  const { save, log } = deployments;
  [accounts, factories, initSettings] = await setup();
  const networkConfig = readNetworkConfig();
  const chainId = await getChainId();
  let etsAccessControlsAddress;

  if (chainId == 31337) {
    let etsAccessControls = await deployments.get("ETSAccessControls");
    etsAccessControlsAddress = etsAccessControls.address;
  } else {
    etsAccessControlsAddress = networkConfig[chainId].contracts["ETSAccessControls"].address;
  }

  // Deploy ETSTarget
  const deployment = await upgrades.deployProxy(factories.ETSTarget, [etsAccessControlsAddress], {
    kind: "uups",
    pollingInterval: 3000,
    timeout: 0,
  });

  await deployment.waitForDeployment();

  const deploymentAddress = await deployment.getAddress();
  const implementationAddress = await upgrades.erc1967.getImplementationAddress(deploymentAddress);

  if (process.env.VERIFY_ON_DEPLOY == "true") {
    // Verify & Update network configuration file.
    await verify("ETSTarget", deployment, implementationAddress, []);
  }

  await saveNetworkConfig("ETSTarget", deployment, implementationAddress, false);

  // Add to deployments.
  let artifact = await deployments.getExtendedArtifact("ETSTarget");
  let proxyDeployments = {
    address: deploymentAddress,
    ...artifact,
  };
  await save("ETSTarget", proxyDeployments);

  log("====================================================");
  log("ETSTarget proxy deployed to -> " + deploymentAddress);
  log("ETSTarget implementation deployed to -> " + implementationAddress);
  log("====================================================");
};
module.exports.tags = ["ETSTarget"];
module.exports.dependencies = ["ETSAuctionHouse"];
