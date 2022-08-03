const {upgrades} = require("hardhat");
const {setup} = require("./setup.js");
const {verify} = require("./utils/verify.js");
const {saveNetworkConfig, readNetworkConfig} = require("./utils/config.js");

module.exports = async ({getChainId, deployments}) => {
  const {save, log} = deployments;
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

  // Deploy ETSToken
  const deployment = await upgrades.deployProxy(
    factories.ETSToken,
    [
      etsAccessControlsAddress,
      initSettings.TAG_MIN_STRING_LENGTH,
      initSettings.TAG_MAX_STRING_LENGTH,
      initSettings.OWNERSHIP_TERM_LENGTH,
    ],
    {kind: "uups"},
  );
  await deployment.deployed();
  const implementation = await upgrades.erc1967.getImplementationAddress(deployment.address);

  if (process.env.ETHERNAL_DISABLED === "false") {
    // Verify & Update network configuration file.
    await verify("ETSToken", deployment, implementation, []);
  }

  await saveNetworkConfig("ETSToken", deployment, implementation, false);

  // Add to deployments.
  let artifact = await deployments.getExtendedArtifact("ETSToken");
  let proxyDeployments = {
    address: deployment.address,
    ...artifact,
  };
  await save("ETSToken", proxyDeployments);

  log("====================================================");
  log("ETSToken proxy deployed to -> " + deployment.address);
  log("ETSToken implementation deployed to -> " + implementation);
  log("====================================================");
};
module.exports.tags = ["ETSToken"];
module.exports.dependencies = ["ETSAccessControls"];
