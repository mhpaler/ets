const {utils} = require("ethers");
const {setup} = require("./setup.js");
const {verify} = require("./utils/verify.js");
const {saveNetworkConfig, readNetworkConfig} = require("./utils/config.js");

module.exports = async ({getChainId, deployments}) => {
  const {deploy, save, log} = deployments;
  [accounts, factories, initSettings] = await setup();
  const networkConfig = readNetworkConfig();
  const chainId = await getChainId();
  let etsAddress, etsTokenAddress, etsTargetAddress;

  if (chainId == 31337) {
    const ets = await deployments.get("ETS");
    const etsToken = await deployments.get("ETSToken");
    const etsTarget = await deployments.get("ETSTarget");
    etsAddress = ets.address;
    etsTokenAddress = etsToken.address;
    etsTargetAddress = etsTarget.address;
  } else {
    etsAddress = networkConfig[chainId].contracts["ETS"].address;
    etsTokenAddress = networkConfig[chainId].contracts["ETSToken"].address;
    etsTargetAddress = networkConfig[chainId].contracts["ETSTarget"].address;
  }

  // Deploy ETSEnrichTarget
  //
  await deploy("ETSPublisher", {
    from: accounts.ETSAdmin.address,
    args: [etsAddress, etsTokenAddress, etsTargetAddress, accounts.ETSPlatform.address, accounts.ETSPlatform.address],
  });

  const deployment = await deployments.get("ETSPublisher");
  if (process.env.ETHERNAL_DISABLED === "false") {
    // Verify & Update network configuration file.
    await verify("ETSPublisher", deployment, deployment, [
      etsAddress,
      etsTokenAddress,
      etsTargetAddress,
      accounts.ETSPlatform.address,
      accounts.ETSPlatform.address,
    ]);
  }

  await saveNetworkConfig("ETSPublisher", deployment, "", false);

  log("====================================================");
  log("ETSPublisher deployed to -> " + deployment.address);
  log("====================================================");
};
module.exports.tags = ["ETSPublisher"];
module.exports.dependencies = ["ETS"];
