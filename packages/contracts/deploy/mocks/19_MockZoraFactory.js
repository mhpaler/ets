const { setup } = require("../utils/setup");

module.exports = async ({ deployments, network }) => {
  const { deploy } = deployments;
  const { accounts } = await setup();

  // Only deploy on localhost
  if (network.name !== "localhost") {
    console.info("MockZoraFactory deployment skipped. Using Production Zora Contract located at [production address]");
    return;
  }

  // Deploy MockZoraFactory
  const mockZoraFactory = await deploy("MockZoraFactory", {
    from: accounts.ETSAdmin.address,
    log: false, // Disable default logging
  });

  console.info("✅ MockZoraFactory deployed to:", mockZoraFactory.address);

  // Save MockZoraFactory address to chain config for localhost
  const fs = require("node:fs");
  const path = require("node:path");
  const configPath = path.join(__dirname, "../../src/chainConfig/localhost.json");

  if (fs.existsSync(configPath)) {
    const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
    config.contracts.MockZoraFactory = {
      address: mockZoraFactory.address,
      blockNumber: mockZoraFactory.receipt?.blockNumber || 0,
    };
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.info("Updated localhost chain config with MockZoraFactory address");
  }
};

module.exports.tags = ["MockZoraFactory", "deployAll"];
module.exports.dependencies = ["ETSAccessControls"]; // Deploy before ETSToken
