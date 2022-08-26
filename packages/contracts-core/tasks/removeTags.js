task(
  "removeTags",
  'Remove tags in a tagging record. eg: hh removeTags --tags "#Like" --uri "https://google.com" --network localhost',
)
  .addParam("uri", 'URI being tagged eg. --uri "https://google.com"')
  .addParam("tags", 'Hashtags separated by commas. eg. --tags "#another,#blah"')
  .addParam("recordType", 'Arbitrary record type identifier. eg. "bookmark"', "bookmark")
  .setAction(async (taskArgs) => {
    const {getAccounts} = require("../test/setup.js");
    const chainId = hre.network.config.chainId;
    const accounts = await getAccounts();
    const config = require("../config/config.json");

    // ABIs
    const etsPublisherABI = require("../abi/contracts/examples/ETSPublisher.sol/ETSPublisher.json");
    const etsABI = require("../abi/contracts/ETS.sol/ETS.json");

    // Contract addresses
    const etsPublisherAddress = config[chainId].contracts.ETSPublisher.address;
    const etsAddress = config[chainId].contracts.ETS.address;

    // Contract instances
    const etsPublisher = new ethers.Contract(etsPublisherAddress, etsPublisherABI, accounts.ETSPlatform);
    const ets = new ethers.Contract(etsAddress, etsABI, accounts.ETSPlatform);

    const tags = taskArgs.tags.replace(/\s+/g, "").split(","); // remove spaces & split on comma
    const targetURI = taskArgs.uri;
    const recordType = taskArgs.recordType;

    const tagParams = {
      "targetURI": targetURI,
      "tagStrings": tags,
      "recordType": recordType,
    };

    const taggingRecordId = await ets.computeTaggingRecordIdFromRawInput(
      tagParams,
      etsPublisherAddress,
      accounts.RandomOne.address,
    );
    const existingRecord = await ets.taggingRecordExists(taggingRecordId);
    if (!existingRecord) {
      console.log("Tagging record not found");
      return;
    }

    // Calculate tagging fees
    let taggingFee = 0;
    let result = await ets.computeTaggingFeeFromRawInput(
      tagParams,
      etsPublisher.address, // original publisher
      accounts.RandomOne.address, // original tagger
      "remove",
    );

    let {0: fee, 1: actualTagCount} = result;
    taggingFee = fee;

    const tx = await etsPublisher.connect(accounts.RandomOne).removeTags([tagParams], {
      value: taggingFee,
      gasPrice: ethers.utils.parseUnits("10", "gwei"), // do we need this?
      gasLimit: 5000000, // do we need this?
    });
    console.log(`started txn ${tx.hash.toString()}`);
    tx.wait();
    console.log(`${actualTagCount} tag(s) removed from ${taggingRecordId}`);
  });
