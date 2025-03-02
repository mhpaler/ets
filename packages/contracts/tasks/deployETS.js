const path = require("node:path");

task("deployETS", "Deploys ETS contracts")
  .addOptionalParam("export", "Path to export deployment information", "")
  .addParam("tags", "Deployment tags to run")
  .setAction(async (taskArgs, hre) => {
    const { network, config } = hre;

    // Check network
    const configuredNetworks = Object.keys(config.networks);

    if (!network.name || network.name === "hardhat") {
      throw new Error(
        `Please specify a network using the --network flag. Configured networks are: ${configuredNetworks.join(", ")}`,
      );
    }
    if (!configuredNetworks.includes(network.name)) {
      throw new Error(
        `Network '${network.name}' is not configured. Configured networks are: ${configuredNetworks.join(", ")}`,
      );
    }
    console.info(`Deploying to network: ${network.name}`);

    // Validate that the specified network matches the HRE network
    if (network.name !== hre.network.name) {
      throw new Error(`Network mismatch: Specified network is ${network.name}, but HRE network is ${hre.network.name}`);
    }

    // Set export path
    let exportPath = taskArgs.export;
    if (!exportPath) {
      exportPath = path.join("src", "chainConfig", `${network.name}.json`);
    }

    // Run deployments with specified tags
    await hre.run("deploy", {
      tags: taskArgs.tags,
      export: exportPath,
    });

    console.info("Deployment process completed.");
  });
