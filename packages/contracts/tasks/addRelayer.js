task(
  "addRelayer",
  'Add a relayer to the protocol. eg hh addRelayer --name "#Uniswap" --owner "RandomOne" --network localhost',
)
  .addParam("name", 'Relayer Name eg. "Uniswap"')
  .addParam(
    "signer",
    'Named wallet accounts. options are "account0", "account1", "account2", "account3", "account4", "account5". Defaults to "account0"',
    "account0",
  )
  .setAction(async (taskArgs) => {
    const { getAccounts } = require("./utils/getAccounts");
    const config = require("../config/config.json");
    const ETSAccessControlsABI = require("../abi/contracts/ETSAccessControls.sol/ETSAccessControls.json");
    const ETSRelayerFactoryABI = require("../abi/contracts/ETSRelayerFactory.sol/ETSRelayerFactory.json");
    const chainId = hre.network.config.chainId;
    const accounts = await getAccounts();

    const ETSAccessControlsAddress = config[chainId].contracts.ETSAccessControls.address;
    const etsAccessControls = new ethers.Contract(
      ETSAccessControlsAddress,
      ETSAccessControlsABI,
      accounts[taskArgs.signer],
    );

    const ETSRelayerFactoryAddress = config[chainId].contracts.ETSRelayerFactory.address;
    const etsRelayerFactory = new ethers.Contract(
      ETSRelayerFactoryAddress,
      ETSRelayerFactoryABI,
      accounts[taskArgs.signer],
    );
    if ((await etsAccessControls.isRelayerByName(taskArgs.name)) === true) {
      console.log("Relayer name exists");
      return;
    }

    let tx = await etsRelayerFactory.addRelayer(taskArgs.name);
    console.log(`started txn ${tx.hash.toString()}`);
    await tx.wait();

    const relayerAddress = await etsAccessControls.getRelayerAddressFromName(taskArgs.name);
    console.log(`New relayer contract deployed at ${relayerAddress} by ${taskArgs.signer}`);
  });
