const {ethers} = require("ethers");

task("createTags", "Create CTAGs")
  .addParam("tags", 'Hashtags separated by commas. eg. --tags "#USDC, #Solana"')
  .addParam("publisher", "Publisher name.")
  .addParam(
    "creator",
    'Named wallets. options are "Buyer", "RandomOne", "RandomTwo", "Creator". Defaults to "Creator"',
    "Creator",
  )
  .setAction(async (taskArgs) => {
    const {getAccounts} = require("../test/setup.js");
    const accounts = await getAccounts();
    const chainId = hre.network.config.chainId;
    const config = require("../config/config.json");

    // ABIs
    const ETSTokenABI = require("../abi/contracts/ETSToken.sol/ETSToken.json");
    const ETSAccessControlsABI = require("../abi/contracts/ETSAccessControls.sol/ETSAccessControls.json");
    const ETSPublisherV1ABI = require("../abi/contracts/publishers/ETSPublisherV1.sol/ETSPublisherV1.json");

    // Contract Addresses
    const ETSAccessControlsAddress = config[chainId].contracts.ETSAccessControls.address;
    const ETSTokenAddress = config[chainId].contracts.ETSToken.address;

    // Contract instances
    const etsAccessControls = new ethers.Contract(
      ETSAccessControlsAddress,
      ETSAccessControlsABI,
      accounts[taskArgs.creator],
    );
    const etsToken = new ethers.Contract(ETSTokenAddress, ETSTokenABI, accounts[taskArgs.creator]);

    // Check that caller is using a valid publisher.
    let etsPublisherV1;
    const publisherAddress = await etsAccessControls.getPublisherAddressFromName(taskArgs.publisher);
    if ((await etsAccessControls.isPublisher(publisherAddress)) === false) {
      console.log(`"${taskArgs.publisher}" is not a publisher`);
      return;
    } else {
      etsPublisherV1 = new ethers.Contract(publisherAddress, ETSPublisherV1ABI, accounts[taskArgs.creator]);
    }

    const tags = taskArgs.tags.replace(/\s+/g, "").split(","); // remove spaces & split on comma
    let tagsToMint = [];

    for (let i = 0; i < tags.length; i++) {
      const tagId = await etsToken.computeTagId(tags[i]);
      if (await etsToken.tagExistsById(tagId)) {
        console.log(`${tags[i]} already exists`);
      } else {
        tagsToMint.push(tags[i]);
      }
    }

    if (tagsToMint.length > 0) {
      console.log(`Minting CTAGs "${tagsToMint.toString()}"`);
      const tx = await etsPublisherV1.getOrCreateTagIds(tagsToMint);
      await tx.wait();

      for (let i = 0; i < tagsToMint.length; i++) {
        const tagId = await etsToken.computeTagId(tags[i]);
        if (await etsToken.tagExistsById(tagId)) {
          console.log(`${tagsToMint[i]} minted by ${taskArgs.creator} with id ${tagId}`);
        }
      }
    }
  });
