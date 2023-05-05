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
  let etsTargetAddress;

  if (chainId == 31337) {
    let etsAccessControls = await deployments.get("ETSAccessControls");
    let etsTarget = await deployments.get("ETSTarget");
    etsAccessControlsAddress = etsAccessControls.address;
    etsTargetAddress = etsTarget.address;
  } else {
    etsAccessControlsAddress = networkConfig[chainId].contracts["ETSAccessControls"].address;
    etsTargetAddress = networkConfig[chainId].contracts["ETSTarget"].address;
  }

  // Deploy ETSEnrichTarget
  const deployment = await upgrades.deployProxy(
    factories.ETSEnrichTarget,
    [etsAccessControlsAddress, etsTargetAddress],
    { kind: "uups", pollingInterval: 3000, timeout: 0 },
  );
  await deployment.deployed();
  const implementation = await upgrades.erc1967.getImplementationAddress(deployment.address);

  if (process.env.ETHERNAL_DISABLED === "false" || process.env.VERIFY_ON_DEPLOY) {
    // Verify & Update network configuration file.
    await verify("ETSEnrichTarget", deployment, implementation, []);
  }

  await saveNetworkConfig("ETSEnrichTarget", deployment, implementation, false);

  // Add to deployments.
  let artifact = await deployments.getExtendedArtifact("ETSEnrichTarget");
  let proxyDeployments = {
    address: deployment.address,
    ...artifact,
  };
  await save("ETSEnrichTarget", proxyDeployments);

  log("====================================================");
  log("ETSEnrichTarget proxy deployed to -> " + deployment.address);
  log("ETSEnrichTarget implementation deployed to -> " + implementation);
  log("====================================================");
};
module.exports.tags = ["ETSEnrichTarget"];
module.exports.dependencies = ["ETSTarget"];
