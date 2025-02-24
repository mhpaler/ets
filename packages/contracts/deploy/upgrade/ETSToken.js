const { ethers } = require("hardhat");
const { upgradeContract } = require("../utils/upgrade.js");

module.exports = async ({ deployments }) => {
  const ETSToken = await ethers.getContractFactory("ETSToken");
  await upgradeContract("ETSToken", ETSToken, deployments);
};

module.exports.tags = ["upgradeAll", "upgradeETSToken"];
