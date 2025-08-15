const { verify } = require("../utils/verify.js");
const { saveNetworkConfig } = require("../utils/config.js");

module.exports = async ({ getNamedAccounts, deployments, network }) => {
  const { deploy, log } = deployments;
  const { ETSAdmin } = await getNamedAccounts();

  // Only deploy mock factory on localhost
  if (network.name !== "localhost") {
    log("Skipping MockZoraFactory deployment - not on localhost");
    return;
  }

  log("====================================================");
  log("Deploying MockZoraFactory for localhost testing...");

  const deployment = await deploy("MockZoraFactory", {
    from: ETSAdmin,
    args: [],
    log: true,
    deterministicDeployment: false,
  });

  if (process.env.VERIFY_ON_DEPLOY === "true") {
    await verify("MockZoraFactory", deployment, deployment.address, []);
  }

  await saveNetworkConfig("MockZoraFactory", deployment, deployment.address, false);

  log("====================================================");
  log(`MockZoraFactory deployed to -> ${deployment.address}`);
  log("====================================================");
};

module.exports.tags = ["MockZoraFactory", "mocks"];
module.exports.dependencies = [];
