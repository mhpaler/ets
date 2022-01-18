const { ethers } = require("hardhat");

module.exports = async ({ deployments }) => {
  const { deploy } = deployments;
  const ETSAdmin = await ethers.getNamedSigner("ETSAdmin");

  const hashtagAccessControls = await ethers.getContract("HashtagAccessControls", ETSAdmin);

  const hashtagProtocol = await ethers.getContract("HashtagProtocol", ETSAdmin);

  await deploy("ERC721HashtagRegistry", {
    // Learn more about args here: https://www.npmjs.com/package/hardhat-deploy#deploymentsdeploy
    from: ETSAdmin.address,
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
