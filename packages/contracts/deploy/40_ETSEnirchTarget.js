const { upgrades } = require("hardhat");
const { setup } = require("./setup.ts");
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
  await deployment.waitForDeployment();

  const deploymentAddress = await deployment.getAddress();
  const implementationAddress = await upgrades.erc1967.getImplementationAddress(deploymentAddress);

  if (process.env.VERIFY_ON_DEPLOY == "true") {
    // Verify & Update network configuration file.
    await verify("ETSEnrichTarget", deployment, implementationAddress, []);
  }

  await saveNetworkConfig("ETSEnrichTarget", deployment, implementationAddress, false);

  // Add to deployments.
  let artifact = await deployments.getExtendedArtifact("ETSEnrichTarget");
  let proxyDeployments = {
    address: deploymentAddress,
    ...artifact,
  };
  await save("ETSEnrichTarget", proxyDeployments);

  log("====================================================");
  log("ETSEnrichTarget proxy deployed to -> " + deploymentAddress);
  log("ETSEnrichTarget implementation deployed to -> " + implementationAddress);
  log("====================================================");
};
module.exports.tags = ["ETSEnrichTarget"];
module.exports.dependencies = ["ETSTarget"];
