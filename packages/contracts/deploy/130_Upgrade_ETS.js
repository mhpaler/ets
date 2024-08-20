const { ethers, upgrades } = require("hardhat");
const { verify } = require("./utils/verify.js");
const { saveNetworkConfig } = require("./utils/config.js");

module.exports = async ({ deployments }) => {
  const { log, save } = deployments;
  const ETS = await ethers.getContractFactory("ETS");
  const etsAddress = await deployments.get("ETS");

  const upgrade = await upgrades.upgradeProxy(etsAddress, ETS);
  await upgrade.deployTransaction.wait();
  const implementation = await upgrades.erc1967.getImplementationAddress(upgrade.address);

  // Verify & Update network configuration file.
  if (process.env.ETHERNAL_DISABLED === "false" || process.env.VERIFY_ON_DEPLOY) {
    await verify("ETS", upgrade, implementation, []);
  }
  await saveNetworkConfig("ETS", upgrade, implementation, true);

  const artifact = await deployments.getExtendedArtifact("ETS");
  const proxyDeployments = {
    address: upgrade.address,
    ...artifact,
  };
  await save("ETS", proxyDeployments);

  log("====================================================");
  log(`ETS upgraded proxy -> ${upgrade.address}`);
  log(`ETS upgraded implementation -> ${implementation}`);
  log("====================================================");
};

module.exports.tags = ["upgrade_all", "upgrade_ets"];
