const { setup } = require("./setup.ts");
const { verify } = require("./utils/verify.js");
const { saveNetworkConfig, readNetworkConfig } = require("./utils/config.js");

module.exports = async ({ getChainId, deployments }) => {
  const { save, log } = deployments;
  [accounts, factories, initSettings] = await setup();
  const networkConfig = readNetworkConfig();
  const chainId = await getChainId();
  let etsAccessControlsAddress, etsAddress, etsTokenAddress, etsTargetAddress;

  if (chainId == 31337) {
    const etsAccessControls = await deployments.get("ETSAccessControls");
    const etsToken = await deployments.get("ETSToken");
    const etsTarget = await deployments.get("ETSTarget");
    const ets = await deployments.get("ETS");
    etsAccessControlsAddress = etsAccessControls.address;
    etsTokenAddress = etsToken.address;
    etsTargetAddress = etsTarget.address;
    etsAddress = ets.address;
  } else {
    etsAccessControlsAddress = networkConfig[chainId].contracts["ETSAccessControls"].address;
    etsTokenAddress = networkConfig[chainId].contracts["ETSToken"].address;
    etsTargetAddress = networkConfig[chainId].contracts["ETSTarget"].address;
    etsAddress = networkConfig[chainId].contracts["ETS"].address;
  }

  // Deploy the relayer logic contract.
  // We deploy with proxy with no arguments because factory will supply them.
  const relayerV1 = await factories.ETSRelayerV1.deploy();
  await relayerV1.waitForDeployment();
  relayerV1Address = await relayerV1.getAddress();

  // Deploy relayer factory, which will deploy the above implementation as upgradable proxies.
  const relayerFactory = await factories.ETSRelayerFactory.deploy(
    relayerV1Address,
    etsAccessControlsAddress,
    etsAddress,
    etsTokenAddress,
    etsTargetAddress,
  );
  await relayerFactory.waitForDeployment();
  const relayerFactoryAddress = await relayerFactory.getAddress();

  if (process.env.VERIFY_ON_DEPLOY == "true") {
    // Verify & Update network configuration file.
    await verify("ETSRelayerV1", relayerV1, relayerV1Address, []);
    await verify("ETSRelayerFactory", relayerFactory, relayerFactoryAddress, []);
  }

  await saveNetworkConfig("ETSRelayerV1", relayerV1, null, false);
  await saveNetworkConfig("ETSRelayerFactory", relayerFactory, null, false);

  // Add to deployments.
  let artifact = await deployments.getExtendedArtifact("ETSRelayerFactory");
  let proxyDeployments = {
    address: relayerFactoryAddress,
    ...artifact,
  };
  await save("ETSRelayerFactory", proxyDeployments);

  artifact = await deployments.getExtendedArtifact("ETSRelayerV1");
  proxyDeployments = {
    address: relayerV1Address,
    ...artifact,
  };
  await save("ETSRelayerV1", proxyDeployments);

  log("====================================================");
  log("ETSRelayerV1 deployed to -> " + relayerV1Address);
  log("ETSRelayerFactory deployed to -> " + relayerFactoryAddress);
  log("====================================================");
};
module.exports.tags = ["ETSRelayerFactory"];
module.exports.dependencies = ["ETS"];
