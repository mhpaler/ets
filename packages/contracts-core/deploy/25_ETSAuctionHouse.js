const {ethers, upgrades} = require("hardhat");
const {setup} = require("./setup.js");
const {verify} = require("./utils/verify.js");
const {saveNetworkConfig, readNetworkConfig} = require("./utils/config.js");

module.exports = async ({getChainId, deployments}) => {
  const {save, log} = deployments;
  [accounts, factories, initSettings] = await setup();
  const networkConfig = readNetworkConfig();
  const chainId = await getChainId();
  let etsAccessControlsAddress;
  let etsTokenAddress;
  let wmaticAddress;

  if (chainId == 31337) {
    // Hardhat
    const wmatic = await factories.WMATIC.deploy();
    await wmatic.deployed();
    await saveNetworkConfig("WMATIC", wmatic, null, false);
    wmaticAddress = wmatic.address;

    let etsAccessControls = await deployments.get("ETSAccessControls");
    let etsToken = await deployments.get("ETSToken");
    etsAccessControlsAddress = etsAccessControls.address;
    etsTokenAddress = etsToken.address;
  } else {
    // Change to WMATIC
    wmaticAddress = networkConfig[chainId].contracts["WMATIC"].address;
    etsAccessControlsAddress = networkConfig[chainId].contracts["ETSAccessControls"].address;
    etsTokenAddress = networkConfig[chainId].contracts["ETSToken"].address;
  }

  // Deploy ETS core using OpenZeppelin upgrades plugin.
  const deployment = await upgrades.deployProxy(
    factories.ETSAuctionHouse,
    [
      etsTokenAddress,
      etsAccessControlsAddress,
      wmaticAddress,
      initSettings.TIME_BUFFER,
      initSettings.RESERVE_PRICE,
      initSettings.MIN_INCREMENT_BID_PERCENTAGE,
      initSettings.DURATION,
      initSettings.PUBLISHER_PERCENTAGE,
      initSettings.CREATOR_PERCENTAGE,
      initSettings.PLATFORM_PERCENTAGE,
    ],
    {kind: "uups"},
  );
  await deployment.deployed();
  const implementation = await upgrades.erc1967.getImplementationAddress(deployment.address);

  if (process.env.ETHERNAL_DISABLED === "false") {
    // Verify & Update network configuration file.
    await verify("ETSAuctionHouse", deployment, implementation, []);
  }

  await saveNetworkConfig("ETSAuctionHouse", deployment, implementation, false);

  // Add to hardhat-deploy deployments.
  artifact = await deployments.getExtendedArtifact("ETSAuctionHouse");
  proxyDeployments = {
    address: deployment.address,
    ...artifact,
  };
  await save("ETSAuctionHouse", proxyDeployments);

  log("====================================================");
  log("ETSAuctionHouse proxy deployed to -> " + deployment.address);
  log("ETSAuctionHouse implementation deployed to -> " + implementation);
  log("====================================================");
};

module.exports.tags = ["ETSAuctionHouse"];
module.exports.dependencies = ["ETSToken"];
