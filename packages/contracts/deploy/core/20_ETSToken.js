const { upgrades } = require("hardhat");
const { setup } = require("../utils/setup.js");
const { verify } = require("../utils/verify.js");
const { saveNetworkConfig } = require("../utils/config.js");

module.exports = async ({ deployments }) => {
  const { save, log } = deployments;
  const { factories, initSettings } = await setup();

  const etsAccessControlsAddress = (await deployments.get("ETSAccessControls")).address;

  // Use initSettings for Zora factory address (will be updated in post-deployment for localhost)
  const zoraFactoryAddress = initSettings.ZORA_FACTORY_ADDRESS;
  log(`Initial Zora factory address: ${zoraFactoryAddress}`);

  // Deploy ETSToken with Zora integration parameters
  const deployment = await upgrades.deployProxy(
    factories.ETSToken,
    [
      etsAccessControlsAddress,
      initSettings.TAG_MIN_STRING_LENGTH,
      initSettings.TAG_MAX_STRING_LENGTH,
      zoraFactoryAddress,
      initSettings.ZORA_CREATOR_EOA,
      initSettings.ZORA_PLATFORM_REFERRER,
      initSettings.ZORA_POOL_CONFIG,
    ],
    { kind: "uups", pollingInterval: 3000, timeout: 0 },
  );

  await deployment.waitForDeployment();
  const deploymentAddress = await deployment.getAddress();
  const implementationAddress = await upgrades.erc1967.getImplementationAddress(deploymentAddress);

  if (process.env.VERIFY_ON_DEPLOY === "true") {
    // Verify & Update network configuration file.
    await verify("ETSToken", deployment, implementationAddress, []);
  }

  await saveNetworkConfig("ETSToken", deployment, implementationAddress, false);

  // Add to deployments.
  const artifact = await deployments.getExtendedArtifact("ETSToken");
  const proxyDeployments = {
    address: deploymentAddress,
    ...artifact,
  };
  await save("ETSToken", proxyDeployments);

  log("====================================================");
  log(`ETSToken proxy deployed to -> ${deploymentAddress}`);
  log(`ETSToken implementation deployed to -> ${implementationAddress}`);
  log("====================================================");
};
module.exports.tags = ["ETSToken"];
module.exports.dependencies = ["ETSAccessControls"];
