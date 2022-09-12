task(
  "addPublisher",
  'Add a publisher to the protocol. eg hh addPublisher --name "#Uniswap" --owner "RandomOne" --network localhost',
)
  .addParam("name", 'Publisher Name eg. "Uniswap"')
  .addParam(
    "signer",
    'Named wallets. options are "Buyer", "RandomOne", "RandomTwo", "Creator". Defaults to "Creator"',
    "RandomOne",
  )
  .setAction(async (taskArgs) => {
    const {getAccounts} = require("../test/setup.js");
    const config = require("../config/config.json");
    const ETSAccessControlsABI = require("../abi/contracts/ETSAccessControls.sol/ETSAccessControls.json");
    const ETSPublisherFactoryABI = require("../abi/contracts/ETSPublisherFactory.sol/ETSPublisherFactory.json");
    const chainId = hre.network.config.chainId;
    const accounts = await getAccounts();

    const ETSAccessControlsAddress = config[chainId].contracts.ETSAccessControls.address;
    const etsAccessControls = new ethers.Contract(
      ETSAccessControlsAddress,
      ETSAccessControlsABI,
      accounts[taskArgs.signer],
    );

    const ETSPublisherFactoryAddress = config[chainId].contracts.ETSPublisherFactory.address;
    const etsPublisherFactory = new ethers.Contract(
      ETSPublisherFactoryAddress,
      ETSPublisherFactoryABI,
      accounts[taskArgs.signer],
    );
    if ((await etsAccessControls.isPublisherByName(taskArgs.name)) === true) {
      console.log("Publisher name exists");
      return;
    }

    let tx = await etsPublisherFactory.addPublisherV1(taskArgs.name);
    await tx.wait();

    const publisherAddress = await etsAccessControls.getPublisherAddressFromName(taskArgs.name);
    console.log(`New publisher contract deployed at ${publisherAddress} by ${taskArgs.signer}`);
  });
