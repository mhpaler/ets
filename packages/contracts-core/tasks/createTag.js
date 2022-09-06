task("createTag", "Create a tag")
  .addParam("tag", "Hashtag string")
  .setAction(async (taskArgs) => {
    const {getAccounts} = require("../test/setup.js");
    const config = require("../config/config.json");
    const ETSABI = require("../abi/contracts/ETS.sol/ETS.json");
    const ETSTokenABI = require("../abi/contracts/ETSToken.sol/ETSToken.json");
    const ETSAccessControlsABI = require("../abi/contracts/ETSAccessControls.sol/ETSAccessControls.json");
    const chainId = hre.network.config.chainId;
    const accounts = await getAccounts();

    // Check that caller is publisher.
    const ETSAccessControlsAddress = config[chainId].contracts.ETSAccessControls.address;
    const etsAccessControls = new ethers.Contract(ETSAccessControlsAddress, ETSAccessControlsABI, accounts.ETSPlatform);
    if ((await etsAccessControls.isPublisher(accounts.ETSPlatform.address)) === false) {
      console.log("caller not a publisher");
      return;
    }

    const ETSTokenAddress = config[chainId].contracts.ETSToken.address;
    const etsToken = new ethers.Contract(ETSTokenAddress, ETSTokenABI, accounts.ETSPlatform);

    const ETSAddress = config[chainId].contracts.ETS.address;
    const ets = new ethers.Contract(ETSAddress, ETSABI, accounts.ETSPlatform);

    console.log(`Minting "${taskArgs.tag}" at ${ETSAddress}`);
    const tagId = await etsToken.computeTagId(taskArgs.tag);

    if (await etsToken.tagExistsById(tagId)) {
      console.log("Tag already exists with ID: ", tagId.toString());
    } else {
      const tx = await ets.createTag(taskArgs.tag, accounts.Buyer.address);
      await tx.wait();
      if (await etsToken.tagExistsById(tagId)) {
        console.log("Tag minted with ID: ", tagId.toString());
      }
    }
  });
