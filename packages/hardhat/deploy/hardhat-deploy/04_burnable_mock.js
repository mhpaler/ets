const { ethers } = require("hardhat");

module.exports = async ({ deployments }) => {
  const { deploy } = deployments;
  const accountHashtagAdmin = await ethers.getNamedSigner("accountHashtagAdmin");

  await deploy("ERC721BurnableMock", {
    // Learn more about args here: https://www.npmjs.com/package/hardhat-deploy#deploymentsdeploy
    from: accountHashtagAdmin.address,
    args: ["NFT", "NFT"],
    log: true,
  });
};
module.exports.tags = ["ERC721BurnableMock", "dev"];
