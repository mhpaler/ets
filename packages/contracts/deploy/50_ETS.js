const { ethers, upgrades } = require("hardhat");
const { utils } = require("ethers");
const { setup } = require("./setup.js");
const { verify } = require("./utils/verify.js");
const { saveNetworkConfig, readNetworkConfig } = require("./utils/config.js");

module.exports = async ({ getChainId, deployments }) => {
  const { save, log } = deployments;
  [accounts, factories, initSettings] = await setup();
  const networkConfig = readNetworkConfig();
  const chainId = await getChainId();
  let etsAccessControlsAddress, etsTokenAddress, etsTargetAddress;

  if (chainId == 31337) {
    const etsAccessControls = await deployments.get("ETSAccessControls");
    const etsToken = await deployments.get("ETSToken");
    const etsTarget = await deployments.get("ETSTarget");
    etsAccessControlsAddress = etsAccessControls.address;
    etsTokenAddress = etsToken.address;
    etsTargetAddress = etsTarget.address;
  } else {
    etsAccessControlsAddress = networkConfig[chainId].contracts["ETSAccessControls"].address;
    etsTokenAddress = networkConfig[chainId].contracts["ETSToken"].address;
    etsTargetAddress = networkConfig[chainId].contracts["ETSTarget"].address;
  }

  // Deploy ETS
  const deployment = await upgrades.deployProxy(
    factories.ETS,
    [
      etsAccessControlsAddress,
      etsTokenAddress,
      etsTargetAddress,
      utils.parseEther(initSettings.TAGGING_FEE),
      initSettings.TAGGING_FEE_PLATFORM_PERCENTAGE,
      initSettings.TAGGING_FEE_RELAYER_PERCENTAGE,
    ],
    { kind: "uups", pollingInterval: 3000, timeout: 0 },
  );

  await deployment.waitForDeployment();
  const deploymentAddress = await deployment.getAddress();
  const implementationAddress = await upgrades.erc1967.getImplementationAddress(deploymentAddress);

  if (process.env.VERIFY_ON_DEPLOY == "true") {
    // Verify & Update network configuration file.
    await verify("ETS", deployment, implementationAddress, []);
  }

  await saveNetworkConfig("ETS", deployment, implementationAddress, false);

  // Add to deployments.
  let artifact = await deployments.getExtendedArtifact("ETS");
  let proxyDeployments = {
    address: deploymentAddress,
    ...artifact,
  };
  await save("ETS", proxyDeployments);

  log("====================================================");
  log("ETS proxy deployed to -> " + deploymentAddress);
  log("ETS implementation deployed to -> " + implementationAddress);
  log("====================================================");
};
module.exports.tags = ["ETS"];
module.exports.dependencies = ["ETSEnrichTarget"];
