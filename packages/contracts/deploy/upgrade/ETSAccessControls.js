const { ethers } = require("hardhat");
const { upgradeContract } = require("../utils/upgrade.js");

module.exports = async ({ deployments }) => {
  const ETSAccessControls = await ethers.getContractFactory("ETSAccessControls");
  await upgradeContract("ETSAccessControls", ETSAccessControls, deployments);
};

module.exports.tags = ["upgradeAll", "upgradeETSAccessControls"];
