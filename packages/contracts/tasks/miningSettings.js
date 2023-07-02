task(
  "miningSettings",
  'change minings settings',
)
  .addParam("automine", 'Automine setting', false, types.boolean)
  .addParam("interval", "interval amount amount", 0, types.int)
  .setAction(async (taskArgs) => {

    await hre.network.provider.send("evm_setAutomine", [taskArgs.automine]);
    await hre.network.provider.send("evm_setIntervalMining", [taskArgs.interval]);

    let automine = await hre.network.provider.request({
      method: "hardhat_getAutomine"
    });

    console.log("automine", automine);

  });

