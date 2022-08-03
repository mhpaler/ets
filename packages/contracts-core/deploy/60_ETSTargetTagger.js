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
  await deploy("ETSTargetTagger", {
    from: accounts.ETSAdmin.address,
    args: [etsAddress, etsTokenAddress, etsTargetAddress, accounts.ETSPlatform.address, accounts.ETSPlatform.address],
  });

  const deployment = await deployments.get("ETSTargetTagger");
  if (process.env.ETHERNAL_DISABLED === "false") {
    // Verify & Update network configuration file.
    await verify("ETSTargetTagger", deployment, deployment, []);
  }

  await saveNetworkConfig("ETSTargetTagger", deployment, "", false);

  log("====================================================");
  log("ETSTargetTagger deployed to -> " + deployment.address);
  log("====================================================");
};
module.exports.tags = ["ETSTargetTagger"];
module.exports.dependencies = ["ETS"];
