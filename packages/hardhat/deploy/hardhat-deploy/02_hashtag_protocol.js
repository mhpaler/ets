const { ethers } = require("hardhat");

module.exports = async ({ deployments }) => {
  const { deploy } = deployments;
  const accountHashtagAdmin = await ethers.getNamedSigner("accountHashtagAdmin");
  const accountHashtagPlatform = await ethers.getNamedSigner("accountHashtagPlatform");

  // Fetch address of HashtagAccessControls.
  const contractAccessControls = await ethers.getContract("HashtagAccessControls", accountHashtagAdmin);

  await deploy("HashtagProtocol", {
    // Learn more about args here: https://www.npmjs.com/package/hardhat-deploy#deploymentsdeploy
    from: accountHashtagAdmin.address,
    proxy: {
      proxyContract: "UUPSProxy",
      execute: {
        // Function to call when deployed first time.
        init: {
          methodName: "initialize",
          args: [contractAccessControls.address, accountHashtagPlatform.address],
        },
      },
    },
    log: true,
  });
};
module.exports.tags = ["HashtagProtocol", "dev"];
