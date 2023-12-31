const { ethers, upgrades } = require("hardhat");
const { verify } = require("./utils/verify.js");
const { saveNetworkConfig } = require("./utils/config.js");

module.exports = async ({ deployments }) => {
  const { log, save } = deployments;
  const ETSTag = await ethers.getContractFactory("ETSTag");
  const etsTagAddress = (await deployments.get("ETSTag")).address;

  const upgrade = await upgrades.upgradeProxy(etsTagAddress, ETSTag);
  await upgrade.deployTransaction.wait();
  const implementation = await upgrades.erc1967.getImplementationAddress(upgrade.address);

  // Verify & Update network configuration file.
  if (process.env.ETHERNAL_DISABLED === "false" || process.env.VERIFY_ON_DEPLOY) {
    await verify("ETSTag", upgrade, implementation, []);
  }
  await saveNetworkConfig("ETSTag", upgrade, implementation, true);

  const artifact = await deployments.getExtendedArtifact("ETSTag");
  let proxyDeployments = {
    address: upgrade.address,
    ...artifact,
  };
  await save("ETSTag", proxyDeployments);

  log("====================================================");
  log("ETSTag upgraded proxy -> " + upgrade.address);
  log("ETSTag upgraded implementation -> " + implementation);
  log("====================================================");
};

module.exports.tags = ["upgrade_all", "upgrade_ets_tag"];
