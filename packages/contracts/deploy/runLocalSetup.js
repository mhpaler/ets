const { network } = require("hardhat");
const runLocalSetup = require("./localSetup.js");

module.exports = async ({ deployments }) => {

  const automine = await network.provider.send("hardhat_getAutomine");

  if (network.config["chainId"] == 31337) {
    // if automine is off, enable it to apply these settings faster.
    if (automine == false) {
      await network.provider.send("evm_setAutomine", [true]);
      console.log("automine set to", await network.provider.send("hardhat_getAutomine"));
    }

    await runLocalSetup();

    // Disable automine if it was originally disabled.
    if (automine == false && await network.provider.send("hardhat_getAutomine")) {
      await network.provider.send("evm_setAutomine", [false]);
      console.log("automine set to", await network.provider.send("hardhat_getAutomine"));
    }
  }
};

module.exports.tags = ["localSetup"];
//module.exports.dependencies = ["ETSRelayerFactory"];
