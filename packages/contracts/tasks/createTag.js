const {ethers} = require("ethers");

task("createTag", "Create a tag")
  .addParam("tag", "Hashtag string")
  .addParam("publisher", "Publisher name")
  .setAction(async (taskArgs) => {
    const {getAccounts} = require("../test/setup.js");
    const accounts = await getAccounts();
    const chainId = hre.network.config.chainId;
    const config = require("../config/config.json");
    const ETSABI = require("../abi/contracts/ETS.sol/ETS.json");
    const ETSTokenABI = require("../abi/contracts/ETSToken.sol/ETSToken.json");
    const ETSAccessControlsABI = require("../abi/contracts/ETSAccessControls.sol/ETSAccessControls.json");
    const ETSPublisherV1ABI = require("../abi/contracts/publishers/ETSPublisherV1.sol/ETSPublisherV1.json");

    const ETSAccessControlsAddress = config[chainId].contracts.ETSAccessControls.address;
    const etsAccessControls = new ethers.Contract(ETSAccessControlsAddress, ETSAccessControlsABI, accounts.ETSPlatform);
    const publisherAddress = await etsAccessControls.getPublisherAddressFromName(taskArgs.publisher);
    let etsPublisherV1;
    // Check that caller is publisher.
    if ((await etsAccessControls.isPublisher(publisherAddress)) === false) {
      console.log(`"${taskArgs.publisher}" is not a publisher`);
      return;
    } else {
      etsPublisherV1 = new ethers.Contract(publisherAddress, ETSPublisherV1ABI, accounts.RandomOne);
    }

    const ETSTokenAddress = config[chainId].contracts.ETSToken.address;
    const etsToken = new ethers.Contract(ETSTokenAddress, ETSTokenABI, accounts.ETSPlatform);
    const tagId = await etsToken.computeTagId(taskArgs.tag);

    if (await etsToken.tagExistsById(tagId)) {
      console.log(`Tag already exists with ID: ${tagId.toString()}`);
    } else {
      console.log(`Minting "${taskArgs.tag}"`);
      const tx = await etsPublisherV1.getOrCreateTagIds([taskArgs.tag]);
      await tx.wait();
      if (await etsToken.tagExistsById(tagId)) {
        console.log("Tag minted with ID: ", tagId.toString());
      }
    }
  });
