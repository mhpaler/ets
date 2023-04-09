const { setup } = require("./setup.js");
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

  // Deploy ETS
  const deployment = await upgrades.deployProxy(
    factories.ETSRelayerFactory,
    [etsAccessControlsAddress, etsAddress, etsTokenAddress, etsTargetAddress],
    {
      kind: "uups",
      pollingInterval: 3000,
      timeout: 0,
    },
  );
  await deployment.deployed();
  const implementation = await upgrades.erc1967.getImplementationAddress(deployment.address);

  if (process.env.ETHERNAL_DISABLED === "false") {
    // Verify & Update network configuration file.
    await verify("ETSRelayerFactory", deployment, implementation, []);
  }

  await saveNetworkConfig("ETSRelayerFactory", deployment, implementation, false);

  // Add to deployments.
  let artifact = await deployments.getExtendedArtifact("ETSRelayerFactory");
  let proxyDeployments = {
    address: deployment.address,
    ...artifact,
  };
  await save("ETSRelayerFactory", proxyDeployments);

  log("====================================================");
  log("ETSRelayerFactory deployed to -> " + deployment.address);
  log("====================================================");
};
module.exports.tags = ["ETSRelayerFactory"];
module.exports.dependencies = ["ETS"];
