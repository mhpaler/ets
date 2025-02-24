const { ethers } = require("hardhat");
const { saveNetworkConfig } = require("./config.js");
const { verify } = require("./verify.js");

async function upgradeRelayer(deployments) {
  const { log } = deployments;

  // Get beacon address from factory
  const factory = await ethers.getContractAt("ETSRelayerFactory", (await deployments.get("ETSRelayerFactory")).address);
  const beaconAddress = await factory.getBeacon();
  const beacon = await ethers.getContractAt("ETSRelayerBeacon", beaconAddress);

  // Get current version and bytecode
  const currentImplementation = await ethers.getContractAt("ETSRelayer", await beacon.implementation());
  const currentVersion = await currentImplementation.VERSION();
  const currentBytecode = await ethers.provider.getCode(await currentImplementation.getAddress());
  console.info("Current VERSION:", currentVersion);
  console.info("Pre-upgrade implementation:", await beacon.implementation());

  // Deploy new implementation
  const ETSRelayer = await ethers.getContractFactory("ETSRelayer");
  const newImplementation = await ETSRelayer.deploy();
  await newImplementation.waitForDeployment();
  const newBytecode = await ethers.provider.getCode(await newImplementation.getAddress());

  // Compare bytecode
  if (currentBytecode === newBytecode) {
    log("====================================================");
    log("No upgrade needed - implementation unchanged");
    log("====================================================");
    return;
  }

  const newImplementationAddress = await newImplementation.getAddress();
  // Update beacon
  await beacon.update(newImplementationAddress);
  const newVersion = await newImplementation.VERSION();

  if (process.env.VERIFY_ON_DEPLOY && network.name !== "localhost") {
    await verify("ETSRelayer", newImplementation, newImplementationAddress, []);
  }

  await saveNetworkConfig("ETSRelayer", newImplementation, newImplementationAddress, true);

  log("====================================================");
  log("ETSRelayer implementation upgraded");
  log(`VERSION changed from ${currentVersion} to ${newVersion}`);
  log(`New implementation -> ${newImplementationAddress}`);
  log("====================================================");
}

module.exports = {
  upgradeRelayer,
};
