const { ethers } = require("hardhat");

module.exports = async ({ deployments }) => {
  const { deploy } = deployments;
  const ETSAdmin = await ethers.getNamedSigner("ETSAdmin");
  const ETSPlatform = await ethers.getNamedSigner("ETSPlatform");

  // Fetch address of HashtagAccessControls.
  const contractAccessControls = await ethers.getContract("HashtagAccessControls", ETSAdmin);

  await deploy("HashtagProtocol", {
    // Learn more about args here: https://www.npmjs.com/package/hardhat-deploy#deploymentsdeploy
    from: ETSAdmin.address,
    proxy: {
      proxyContract: "UUPSProxy",
      execute: {
        // Function to call when deployed first time.
        init: {
          methodName: "initialize",
          args: [contractAccessControls.address, ETSPlatform.address],
        },
      },
    },
    log: true,
  });
};
module.exports.tags = ["HashtagProtocol", "dev"];
