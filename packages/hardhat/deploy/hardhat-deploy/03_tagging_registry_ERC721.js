const { ethers } = require("hardhat");

module.exports = async ({ deployments }) => {
  const { deploy } = deployments;
  const accountHashtagAdmin = await ethers.getNamedSigner("accountHashtagAdmin");

  const hashtagAccessControls = await ethers.getContract("HashtagAccessControls", accountHashtagAdmin);

  const hashtagProtocol = await ethers.getContract("HashtagProtocol", accountHashtagAdmin);

  await deploy("ERC721HashtagRegistry", {
    // Learn more about args here: https://www.npmjs.com/package/hardhat-deploy#deploymentsdeploy
    from: accountHashtagAdmin.address,
    proxy: {
      proxyContract: "UUPSProxy",
      execute: {
        // Function to call when deployed first time.
        init: {
          methodName: "initialize",
          args: [hashtagAccessControls.address, hashtagProtocol.address],
        },
      },
    },
    log: true,
  });
};
module.exports.tags = ["ERC721HashtagRegistry", "dev"];
