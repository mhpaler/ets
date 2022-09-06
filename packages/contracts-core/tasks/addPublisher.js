task("addPublisher", "Add a publisher to the protocol")
  .addParam("address", "Publisher Address")
  .addParam("name", "Publisher Name")
  .setAction(async (taskArgs) => {
    const {getAccounts} = require("../test/setup.js");
    const config = require("../config/config.json");
    const ETSAccessControlsABI = require("../abi/contracts/ETSAccessControls.sol/ETSAccessControls.json");
    const chainId = hre.network.config.chainId;
    const accounts = await getAccounts();

    // Check that caller is publisher.
    const ETSAccessControlsAddress = config[chainId].contracts.ETSAccessControls.address;
    const etsAccessControls = new ethers.Contract(ETSAccessControlsAddress, ETSAccessControlsABI, accounts.ETSPlatform);
    if ((await etsAccessControls.isPublisherAdmin(accounts.ETSPlatform.address)) === false) {
      console.log("caller not a publisher admin");
      return;
    }

    const tx = await etsAccessControls.addPublisher(accounts.RandomOne.address, "RandomOne");
    await tx.wait();
  });
