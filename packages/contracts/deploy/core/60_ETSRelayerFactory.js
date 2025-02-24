const { setup } = require("../utils/setup.js");
const { verify } = require("../utils/verify.js");
const { saveNetworkConfig } = require("../utils/config.js");

module.exports = async ({ deployments }) => {
  const { save, log } = deployments;
  const { factories } = await setup();

  const etsAccessControlsAddress = (await deployments.get("ETSAccessControls")).address;
  const etsTokenAddress = (await deployments.get("ETSToken")).address;
  const etsTargetAddress = (await deployments.get("ETSTarget")).address;
  const etsAddress = (await deployments.get("ETS")).address;

  // Deploy the relayer logic contract.
  // We deploy with proxy with no arguments because factory will supply them.
  const etsRelayer = await factories.ETSRelayer.deploy();
  await etsRelayer.waitForDeployment();
  etsRelayerAddress = await etsRelayer.getAddress();

  // Deploy relayer factory, which will deploy the above implementation as upgradable proxies.
  const relayerFactory = await factories.ETSRelayerFactory.deploy(
    etsRelayerAddress,
    etsAccessControlsAddress,
    etsAddress,
    etsTokenAddress,
    etsTargetAddress,
  );
  await relayerFactory.waitForDeployment();
  const relayerFactoryAddress = await relayerFactory.getAddress();

  if (process.env.VERIFY_ON_DEPLOY === "true") {
    // Verify & Update network configuration file.
    await verify("ETSRelayer", etsRelayer, etsRelayerAddress, []);
    await verify("ETSRelayerFactory", relayerFactory, relayerFactoryAddress, [
      etsRelayerAddress,
      etsAccessControlsAddress,
      etsAddress,
      etsTokenAddress,
      etsTargetAddress,
    ]);
  }

  await saveNetworkConfig("ETSRelayer", etsRelayer, etsRelayerAddress, false);
  await saveNetworkConfig("ETSRelayerFactory", relayerFactory, null, false);

  // Add to deployments.
  let artifact = await deployments.getExtendedArtifact("ETSRelayerFactory");
  let proxyDeployments = {
    address: relayerFactoryAddress,
    ...artifact,
  };
  await save("ETSRelayerFactory", proxyDeployments);

  artifact = await deployments.getExtendedArtifact("ETSRelayer");
  proxyDeployments = {
    address: etsRelayerAddress,
    ...artifact,
  };
  await save("ETSRelayer", proxyDeployments);

  log("====================================================");
  log(`ETSRelayer deployed to -> ${etsRelayerAddress}`);
  log(`ETSRelayerFactory deployed to -> ${relayerFactoryAddress}`);
  log("====================================================");
};
module.exports.tags = ["ETSRelayerFactory"];
module.exports.dependencies = ["ETS"];
