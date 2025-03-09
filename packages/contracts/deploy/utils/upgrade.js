const { ethers, upgrades } = require("hardhat");
const { saveNetworkConfig } = require("./config.js");
const { verify } = require("./verify.js");

async function upgradeContract(contractName, contractFactory, deployments) {
  const { log, save } = deployments;
  const proxyAddress = (await deployments.get(contractName)).address;

  // Get current version
  const currentContract = await ethers.getContractAt(contractName, proxyAddress);
  let currentVersion = "0.0.0";
  try {
    currentVersion = await currentContract.VERSION();
  } catch {
    console.info("VERSION not found in current implementation");
  }
  const preImplementation = await upgrades.erc1967.getImplementationAddress(proxyAddress);

  console.info(`Starting upgrade process for ${contractName}...`);
  console.info("Proxy address:", proxyAddress);
  console.info("Current VERSION:", currentVersion);
  console.info("Pre-upgrade implementation:", preImplementation);
  console.info("Attempting upgrade...");

  const deployment = await upgrades.upgradeProxy(proxyAddress, contractFactory);
  await deployment.waitForDeployment();

  // Only use evm_mine on localhost
  if (network.name === "localhost") {
    await ethers.provider.send("evm_mine");
  } else {
    // For live networks, wait for the next block
    await ethers.provider.getBlock("latest");
  }

  const deploymentAddress = await deployment.getAddress();
  const implementationAddress = await upgrades.erc1967.getImplementationAddress(deploymentAddress);
  const upgradedContract = await ethers.getContractAt(contractName, deploymentAddress);
  const newVersion = await upgradedContract.VERSION();

  if (preImplementation === implementationAddress) {
    log("====================================================");
    log("No upgrade needed - implementation unchanged");
    log("====================================================");
    return;
  }

  if (process.env.VERIFY_ON_DEPLOY && network.name !== "localhost") {
    await verify(contractName, deployment, implementationAddress, []);
  }

  await saveNetworkConfig(contractName, deployment, implementationAddress, true);

  const artifact = await deployments.getExtendedArtifact(contractName);
  const proxyDeployments = {
    address: deploymentAddress,
    ...artifact,
  };
  await save(contractName, proxyDeployments);

  log("====================================================");
  log(`${contractName} upgraded proxy -> ${deploymentAddress}`);
  log(`${contractName} upgraded implementation -> ${implementationAddress}`);
  log(`VERSION changed from ${currentVersion} to ${newVersion}`);
  log("====================================================");
}

module.exports = {
  upgradeContract,
};
