const { ethers } = require("hardhat");
const { upgradeContract } = require("../utils/upgrade.js");

module.exports = async ({ deployments }) => {
  const ETS = await ethers.getContractFactory("ETS");
  await upgradeContract("ETS", ETS, deployments);
};

module.exports.tags = ["upgradeAll", "upgradeETS"];
