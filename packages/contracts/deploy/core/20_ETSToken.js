const { upgrades } = require("hardhat");
const { setup } = require("../utils/setup.js");
const { verify } = require("../utils/verify.js");
const { saveNetworkConfig } = require("../utils/config.js");

module.exports = async ({ deployments, network }) => {
  const { save, log } = deployments;
  const { factories, initSettings } = await setup();

  const etsAccessControlsAddress = (await deployments.get("ETSAccessControls")).address;

  // For localhost, get the MockZoraFactory address
  let zoraFactoryAddress = initSettings.ZORA_FACTORY_ADDRESS;
  if (network.name === "localhost") {
    try {
      const mockFactory = await deployments.get("MockZoraFactory");
      zoraFactoryAddress = mockFactory.address;
      log(`Using MockZoraFactory at ${zoraFactoryAddress} for localhost`);
    } catch (_error) {
      log("Warning: MockZoraFactory not found, using zero address");
      zoraFactoryAddress = ethers.ZeroAddress;
    }
  }

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
module.exports.dependencies = ["ETSAccessControls", "MockZoraFactory"];
