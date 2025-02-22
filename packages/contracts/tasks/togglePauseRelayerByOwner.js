const { ethers } = require("ethers");

task("togglePauseRelayerByOwner", "Pauses/Unpauses a Relayer contract by owner")
  .addParam("relayer", "Relayer name.")
  .addParam(
    "signer",
    'Named wallet accounts. options are "account0", "account1", "account2", "account3", "account4", "account5". Defaults to "account0"',
    "account0",
  )
  .setAction(async (taskArgs) => {
    const { getAccounts } = require("./utils/getAccounts");
    const accounts = await getAccounts();

    // Load network configuration
    const networkConfig = require(`../src/chainConfig/${hre.network.name}.json`);

    // ABIs and Contract addresses from network configuration
    const ETSAccessControlsABI = networkConfig.contracts.ETSAccessControls.abi;
    const ETSAccessControlsAddress = networkConfig.contracts.ETSAccessControls.address;
    const ETSRelayerV1ABI = networkConfig.contracts.ETSRelayerV1.abi;

    // Contract instances
    const etsAccessControls = new hre.ethers.Contract(
      ETSAccessControlsAddress,
      ETSAccessControlsABI,
      accounts[taskArgs.signer],
    );

    // Check that caller is using a valid relayer.
    let etsRelayer;
    const relayerAddress = await etsAccessControls.getRelayerAddressFromName(taskArgs.relayer);
    if ((await etsAccessControls.isRelayerByAddress(relayerAddress)) === false) {
      console.info(`"${taskArgs.relayer}" is not a relayer`);
      return;
    }
    etsRelayer = new ethers.Contract(relayerAddress, ETSRelayerV1ABI, accounts[taskArgs.signer]);

    if (accounts[taskArgs.signer].address !== (await etsRelayer.getOwner())) {
      console.info(`${taskArgs.signer} is not the owner of "${taskArgs.relayer}" relayer contract`);
      return;
    }

    if (await etsRelayer.paused()) {
      const tx = await etsRelayer.unpause();
      await tx.wait();
    } else {
      const tx = await etsRelayer.pause();
      await tx.wait();
    }

    if ((await etsRelayer.isPaused()) === true) {
      console.info(`${taskArgs.relayer} paused`);
    } else {
      console.info(`${taskArgs.relayer} unpaused`);
    }
  });
