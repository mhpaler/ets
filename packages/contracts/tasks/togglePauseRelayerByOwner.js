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
    const chainId = hre.network.config.chainId;
    const config = require("../config/config.json");

    // ABIs
    const ETSAccessControlsABI = require("../abi/contracts/ETSAccessControls.sol/ETSAccessControls.json");
    const ETSRelayerV1ABI = require("../abi/contracts/relayers/ETSRelayerV1.sol/ETSRelayerV1.json");

    // Contract Addresses
    const ETSAccessControlsAddress = config[chainId].contracts.ETSAccessControls.address;

    // Contract instances
    const etsAccessControls = new ethers.Contract(
      ETSAccessControlsAddress,
      ETSAccessControlsABI,
      accounts[taskArgs.signer],
    );

    // Check that caller is using a valid relayer.
    let etsRelayerV1;
    const relayerAddress = await etsAccessControls.getRelayerAddressFromName(taskArgs.relayer);
    if ((await etsAccessControls.isRelayer(relayerAddress)) === false) {
      console.log(`"${taskArgs.relayer}" is not a relayer`);
      return;
    } else {
      etsRelayerV1 = new ethers.Contract(relayerAddress, ETSRelayerV1ABI, accounts[taskArgs.signer]);
    }

    if (accounts[taskArgs.signer].address !== (await etsRelayerV1.getOwner())) {
      console.log(`${taskArgs.signer} is not the owner of "${taskArgs.relayer}" relayer contract`);
      return;
    }

    if (await etsRelayerV1.paused()) {
      const tx = await etsRelayerV1.unpause();
      await tx.wait();
    } else {
      const tx = await etsRelayerV1.pause();
      await tx.wait();
    }

    if ((await etsRelayerV1.isPausedByOwner()) === true) {
      console.log(`${taskArgs.relayer} paused`);
    } else {
      console.log(`${taskArgs.relayer} unpaused`);
    }
  });
