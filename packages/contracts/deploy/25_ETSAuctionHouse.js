const { ethers, upgrades } = require("hardhat");
const { setup } = require("./setup.ts");
const { verify } = require("./utils/verify.js");
const { saveNetworkConfig, readNetworkConfig } = require("./utils/config.js");

module.exports = async ({ getChainId, deployments }) => {
  const { save, log } = deployments;
  [accounts, factories, initSettings] = await setup();
  const networkConfig = readNetworkConfig();
  const chainId = await getChainId();
  let etsAccessControlsAddress;
  let etsTokenAddress;
  let wmaticAddress;

  if (chainId == 31337) {
    // Hardhat
    const wmatic = await factories.WMATIC.deploy();
    await wmatic.waitForDeployment();
    await saveNetworkConfig("WMATIC", wmatic, null, false);
    wmaticAddress = await wmatic.getAddress();;

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

  log("====================================================");
  log("WMATIC deployed to -> " + wmaticAddress);
  log("====================================================");

  // Deploy ETS core using OpenZeppelin upgrades plugin.
  const deployment = await upgrades.deployProxy(
    factories.ETSAuctionHouse,
    [
      etsTokenAddress,
      etsAccessControlsAddress,
      wmaticAddress,
      initSettings.MAX_AUCTIONS,
      initSettings.TIME_BUFFER,
      ethers.parseUnits(initSettings.RESERVE_PRICE, "ether"),
      initSettings.MIN_INCREMENT_BID_PERCENTAGE,
      initSettings.DURATION,
      initSettings.RELAYER_PERCENTAGE,
      initSettings.PLATFORM_PERCENTAGE,
    ],
    { kind: "uups", pollingInterval: 3000, timeout: 0 },
  );
  await deployment.waitForDeployment();

  const deploymentAddress = await deployment.getAddress();
  const implementationAddress = await upgrades.erc1967.getImplementationAddress(deploymentAddress);

  if (process.env.VERIFY_ON_DEPLOY == "true") {
    // Verify & Update network configuration file.
    await verify("ETSAuctionHouse", deployment, implementationAddress, []);
  }

  await saveNetworkConfig("ETSAuctionHouse", deployment, implementationAddress, false);

  // Add to hardhat-deploy deployments.
  artifact = await deployments.getExtendedArtifact("ETSAuctionHouse");
  proxyDeployments = {
    address: deploymentAddress,
    ...artifact,
  };
  await save("ETSAuctionHouse", proxyDeployments);

  log("====================================================");
  log("ETSAuctionHouse proxy deployed to -> " + deploymentAddress);
  log("ETSAuctionHouse implementation deployed to -> " + implementationAddress);
  log("====================================================");
};

module.exports.tags = ["ETSAuctionHouse"];
module.exports.dependencies = ["ETSToken"];
