const { ethers } = require("ethers");

task("transferRelayer", "Transfers relayer to a new owner")
  .addParam("relayer", "Relayer name.")
  .addParam("to", "New owner address.", "0x0000000000000000000000000000000000000000")
  .addParam(
    "signer",
    'Named wallet accounts. options are "account0", "account1", "account2", "account3", "account4", "account5". Defaults to "account0"',
    "account0",
  )
  .setAction(async (taskArgs) => {
    const { getAccounts } = require("./utils/getAccounts");
    const accounts = await getAccounts();

    // Load network configuration
    const networkConfig = require(`../export/chainConfig/${hre.network.name}.json`);

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
    let etsRelayerV1;
    const relayerAddress = await etsAccessControls.getRelayerAddressFromName(taskArgs.relayer);
    if ((await etsAccessControls.isRelayerByAddress(relayerAddress)) === false) {
      console.log(`"${taskArgs.relayer}" is not a relayer`);
      return;
    } else {
      etsRelayerV1 = new ethers.Contract(relayerAddress, ETSRelayerV1ABI, accounts[taskArgs.signer]);
    }

    if (accounts[taskArgs.signer].address !== (await etsRelayerV1.getOwner())) {
      console.log(`${taskArgs.signer} is not the owner of "${taskArgs.relayer}" relayer contract`);
      return;
    }

    if (!await etsRelayerV1.paused()) {
      console.log(`Relayer must be paused before transferring`);
      return;
    }

    const tx = await etsRelayerV1.changeOwner(taskArgs.to);
    await tx.wait();

    if ((await etsRelayerV1.getOwner()) === taskArgs.to) {
      console.log(`Relayer transferred to ${taskArgs.to}`);
    }
  });
