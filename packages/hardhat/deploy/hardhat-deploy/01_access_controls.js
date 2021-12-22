const { ethers } = require("hardhat");

module.exports = async ({ deployments }) => {
  const { deploy } = deployments;
  const accountHashtagAdmin = await ethers.getNamedSigner("accountHashtagAdmin");
  const accountHashtagPublisher = await ethers.getNamedSigner("accountHashtagPublisher");

  await deploy("UUPSProxy", {
    // Learn more about args here: https://www.npmjs.com/package/hardhat-deploy#deploymentsdeploy
    from: accountHashtagAdmin.address,
    log: true,
  });

  await deploy("HashtagAccessControls", {
    // Learn more about args here: https://www.npmjs.com/package/hardhat-deploy#deploymentsdeploy
    from: accountHashtagAdmin.address,
    proxy: {
      // owner: accountHashtagAdmin.address,
      proxyContract: "UUPSProxy",
      execute: {
        init: {
          methodName: "initialize", // Function to call when deployed first time.
          args: [accountHashtagAdmin.address],
        },
        onUpgrade: {
          methodName: "postUpgrade", // method to be executed when the proxy is upgraded (not first deployment)
          args: ["hello"],
        },
      },
    },
    log: true,
  });

  // Fetch address of HashtagAccessControls.
  const hashtagAccessControls = await ethers.getContract("HashtagAccessControls", accountHashtagAdmin);

  // Note Default admin role is set when contract is deployed.
  // See deploy/01_access_controls.js
  await hashtagAccessControls.grantRole(
    ethers.utils.id("PUBLISHER"),
    accountHashtagPublisher.address, // PUBLISHER Address
  );
  //console.log("PUBLISHER role assigned to ", accountHashtagPublisher.address);
};
module.exports.tags = ["HashtagAccessControls", "dev"];
