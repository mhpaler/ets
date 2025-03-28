const { upgrades } = require("hardhat");
const { setup } = require("../utils/setup.js");
const { verify } = require("../utils/verify.js");
const { saveNetworkConfig } = require("../utils/config.js");

module.exports = async ({ deployments }) => {
  const { save, log } = deployments;
  const { factories } = await setup();

  const etsAccessControlsAddress = (await deployments.get("ETSAccessControls")).address;
  const etsTargetAddress = (await deployments.get("ETSTarget")).address;

  // Get the AirnodeRrpV0 address - use whichever name is consistently saved in 35_AirnodeRrp.js
  const airnodeRrpAddress = (await deployments.get("AirnodeRrpV0Proxy")).address;
  log(`Using AirnodeRrpV0 at address: ${airnodeRrpAddress}`);

  // Deploy ETSEnrichTarget with composition pattern
  // Note: No constructorArgs needed anymore - we pass airnodeRrpAddress to initialize instead
  const deployment = await upgrades.deployProxy(
    factories.ETSEnrichTarget,
    [etsAccessControlsAddress, etsTargetAddress, airnodeRrpAddress], // Include airnodeRrpAddress in initialize params
    {
      kind: "uups",
      pollingInterval: 3000,
      timeout: 0,
      // constructorArgs removed since we're using composition now
    },
  );
  await deployment.waitForDeployment();

  const deploymentAddress = await deployment.getAddress();
  const implementationAddress = await upgrades.erc1967.getImplementationAddress(deploymentAddress);

  if (process.env.VERIFY_ON_DEPLOY === "true") {
    // Verify & Update network configuration file - no constructor args
    await verify("ETSEnrichTarget", deployment, implementationAddress, []);
  }

  await saveNetworkConfig("ETSEnrichTarget", deployment, implementationAddress, false);

  // Add to deployments.
  const artifact = await deployments.getExtendedArtifact("ETSEnrichTarget");
  const proxyDeployments = {
    address: deploymentAddress,
    ...artifact,
  };
  await save("ETSEnrichTarget", proxyDeployments);

  log("====================================================");
  log(`ETSEnrichTarget proxy deployed to -> ${deploymentAddress}`);
  log(`ETSEnrichTarget implementation deployed to -> ${implementationAddress}`);
  log("====================================================");
};

module.exports.tags = ["ETSEnrichTarget"];
module.exports.dependencies = ["ETSTarget", "AirnodeRrpV0Proxy"]; // Ensure dependency name matches 35_AirnodeRrp.js
