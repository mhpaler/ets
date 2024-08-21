const { ethers, upgrades } = require("hardhat");
const { verify } = require("./utils/verify.js");
const { saveNetworkConfig } = require("./utils/config.js");

module.exports = async ({ deployments }) => {
  const { log, save } = deployments;
  const ETSAccessControls = await ethers.getContractFactory("ETSAccessControls");
  const etsAccessControlsAddress = (await deployments.get("ETSAccessControls")).address;

  const upgrade = await upgrades.upgradeProxy(etsAccessControlsAddress, ETSAccessControls);
  await upgrade.deployTransaction.wait();
  implementation = await upgrades.erc1967.getImplementationAddress(upgrade.address);

  // Verify & Update network configuration file.
  if (process.env.ETHERNAL_DISABLED === "false" || process.env.VERIFY_ON_DEPLOY) {
    await verify("ETSAccessControls", upgrade, implementation, []);
  }
  await saveNetworkConfig("ETSAccessControls", upgrade, implementation, true);

  const artifact = await deployments.getExtendedArtifact("ETSAccessControls");
  const proxyDeployments = {
    address: upgrade.address,
    ...artifact,
  };
  await save("ETSAccessControls", proxyDeployments);

  log("====================================================");
  log(`ETSAccessControls upgraded proxy -> ${upgrade.address}`);
  log(`ETSAccessControls upgraded implementation -> ${implementation}`);
  log("====================================================");
};

module.exports.tags = ["upgrade_all", "upgrade_access_controls"];
