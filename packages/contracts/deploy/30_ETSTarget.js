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
  await deployment.deployed();
  const implementation = await upgrades.erc1967.getImplementationAddress(deployment.address);

  if (process.env.ETHERNAL_DISABLED === "false" || process.env.VERIFY_ON_DEPLOY) {
    // Verify & Update network configuration file.
    await verify("ETSTarget", deployment, implementation, []);
  }

  await saveNetworkConfig("ETSTarget", deployment, implementation, false);

  // Add to deployments.
  let artifact = await deployments.getExtendedArtifact("ETSTarget");
  let proxyDeployments = {
    address: deployment.address,
    ...artifact,
  };
  await save("ETSTarget", proxyDeployments);

  log("====================================================");
  log("ETSTarget proxy deployed to -> " + deployment.address);
  log("ETSTarget implementation deployed to -> " + implementation);
  log("====================================================");
};
module.exports.tags = ["ETSTarget"];
module.exports.dependencies = ["ETSAuctionHouse"];
