const { setup } = require("../utils/setup.js");
const { verify } = require("../utils/verify.js");
const { saveNetworkConfig } = require("../utils/config.js");

module.exports = async ({ deployments }) => {
  const { save, log } = deployments;
  const { factories } = await setup();

  // Deploy AirnodeRrpV0Proxy using the factory pattern
  log("Deploying AirnodeRrpV0Proxy...");
  const airnodeRrp = await factories.AirnodeRrpV0Proxy.deploy();
  await airnodeRrp.waitForDeployment();

  const airnodeRrpAddress = await airnodeRrp.getAddress();

  if (process.env.VERIFY_ON_DEPLOY === "true") {
    await verify("AirnodeRrpV0Proxy", airnodeRrpAddress, []);
  }

  await saveNetworkConfig("AirnodeRrpV0Proxy", airnodeRrp, null, false);

  // THIS IS THE CRITICAL MISSING PART - add to deployments
  const artifact = await deployments.getExtendedArtifact("AirnodeRrpV0Proxy");
  const proxyDeployments = {
    address: airnodeRrpAddress,
    ...artifact,
  };

  // Save with the name that will be referenced in other scripts
  await save("AirnodeRrpV0Proxy", proxyDeployments);

  log("====================================================");
  log(`AirnodeRrpV0Proxy deployed to -> ${airnodeRrpAddress}`);
  log("====================================================");
};

module.exports.tags = ["AirnodeRrpV0Proxy"];
module.exports.dependencies = [];
