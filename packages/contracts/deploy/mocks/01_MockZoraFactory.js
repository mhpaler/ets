module.exports = async ({ getNamedAccounts, deployments, network }) => {
  const { deploy, log, save } = deployments;
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

  // Save deployment to hardhat-deploy's deployment folder
  // This ensures it can be referenced by other contracts
  
  log("====================================================");
  log(`MockZoraFactory deployed to -> ${deployment.address}`);
  log("====================================================");
};

module.exports.tags = ["MockZoraFactory", "mocks"];
module.exports.dependencies = [];
