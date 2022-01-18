const { ethers } = require("hardhat");

module.exports = async ({ deployments }) => {
  const { deploy } = deployments;
  const ETSAdmin = await ethers.getNamedSigner("ETSAdmin");
  const ETSPublisher = await ethers.getNamedSigner("ETSPublisher");

  await deploy("UUPSProxy", {
    // Learn more about args here: https://www.npmjs.com/package/hardhat-deploy#deploymentsdeploy
    from: ETSAdmin.address,
    log: true,
  });

  await deploy("HashtagAccessControls", {
    // Learn more about args here: https://www.npmjs.com/package/hardhat-deploy#deploymentsdeploy
    from: ETSAdmin.address,
    proxy: {
      // owner: ETSAdmin.address,
      proxyContract: "UUPSProxy",
      execute: {
        init: {
          methodName: "initialize", // Function to call when deployed first time.
          args: [ETSAdmin.address],
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
  const hashtagAccessControls = await ethers.getContract("HashtagAccessControls", ETSAdmin);

  // Note Default admin role is set when contract is deployed.
  // See deploy/01_access_controls.js
  await hashtagAccessControls.grantRole(
    ethers.utils.id("PUBLISHER"),
    ETSPublisher.address, // PUBLISHER Address
  );
  //console.log("PUBLISHER role assigned to ", ETSPublisher.address);
};
module.exports.tags = ["HashtagAccessControls", "dev"];
