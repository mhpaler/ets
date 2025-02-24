const { upgradeRelayer } = require("../utils/upgradeRelayer.js");

module.exports = async ({ deployments }) => {
  await upgradeRelayer(deployments);
};

module.exports.tags = ["upgradeAll", "upgradeETSRelayer"];
