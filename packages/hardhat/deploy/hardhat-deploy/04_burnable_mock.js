const { ethers } = require("hardhat");

module.exports = async ({ deployments }) => {
  const { deploy } = deployments;
  const ETSAdmin = await ethers.getNamedSigner("ETSAdmin");

  await deploy("ERC721BurnableMock", {
    // Learn more about args here: https://www.npmjs.com/package/hardhat-deploy#deploymentsdeploy
    from: ETSAdmin.address,
    args: ["NFT", "NFT"],
    log: true,
  });
};
module.exports.tags = ["ERC721BurnableMock", "dev"];
