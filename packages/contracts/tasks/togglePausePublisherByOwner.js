const {ethers} = require("ethers");

task("togglePausePublisherByOwner", "Pauses/Unpauses a Publisher contract by owner")
  .addParam("publisher", "Publisher name.")
  .addParam(
    "signer",
    'Owner of publisher. Options are "Buyer", "RandomOne", "RandomTwo", "Creator". Defaults to "Creator"',
    "Creator",
  )
  .setAction(async (taskArgs) => {
    const {getAccounts} = require("../test/setup.js");
    const accounts = await getAccounts();
    const chainId = hre.network.config.chainId;
    const config = require("../config/config.json");

    // ABIs
    const ETSAccessControlsABI = require("../abi/contracts/ETSAccessControls.sol/ETSAccessControls.json");
    const ETSPublisherV1ABI = require("../abi/contracts/publishers/ETSPublisherV1.sol/ETSPublisherV1.json");

    // Contract Addresses
    const ETSAccessControlsAddress = config[chainId].contracts.ETSAccessControls.address;

    // Contract instances
    const etsAccessControls = new ethers.Contract(
      ETSAccessControlsAddress,
      ETSAccessControlsABI,
      accounts[taskArgs.signer],
    );

    // Check that caller is using a valid publisher.
    let etsPublisherV1;
    const publisherAddress = await etsAccessControls.getPublisherAddressFromName(taskArgs.publisher);
    if ((await etsAccessControls.isPublisher(publisherAddress)) === false) {
      console.log(`"${taskArgs.publisher}" is not a publisher`);
      return;
    } else {
      etsPublisherV1 = new ethers.Contract(publisherAddress, ETSPublisherV1ABI, accounts[taskArgs.signer]);
    }

    if (accounts[taskArgs.signer].address !== (await etsPublisherV1.getOwner())) {
      console.log(`${taskArgs.signer} is not the owner of "${taskArgs.publisher}" publisher contract`);
      return;
    }

    if (await etsPublisherV1.paused()) {
      const tx = await etsPublisherV1.unpause();
      await tx.wait();
    } else {
      const tx = await etsPublisherV1.pause();
      await tx.wait();
    }

    if ((await etsPublisherV1.isPausedByOwner()) === true) {
      console.log(`${taskArgs.publisher} paused`);
    } else {
      console.log(`${taskArgs.publisher} unpaused`);
    }
  });
