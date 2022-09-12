task(
  "replaceTags",
  'Replace tags in a tagging record. eg: hh removeTags --tags "#USDC, #Solana" --uri "https://google.com" --network localhost',
)
  .addParam("uri", 'URI being tagged eg. --uri "https://google.com"')
  .addParam("tags", 'Hashtags separated by commas. eg. --tags "#USDC, #Solana"')
  .addParam("recordType", 'Arbitrary record type identifier. eg. "bookmark"', "bookmark")
  .addParam("publisher", "Publisher name")
  .addParam(
    "tagger",
    'Named wallets. options are "Buyer", "RandomOne", "RandomTwo", "Creator". Defaults to "RandomOne"',
    "RandomOne",
  )
  .setAction(async (taskArgs) => {
    const {getAccounts} = require("../test/setup.js");
    const chainId = hre.network.config.chainId;
    const accounts = await getAccounts();
    const config = require("../config/config.json");

    // ABIs
    const etsAccessControlsABI = require("../abi/contracts/ETSAccessControls.sol/ETSAccessControls.json");
    const etsPublisherV1ABI = require("../abi/contracts/publishers/ETSPublisherV1.sol/ETSPublisherV1.json");
    const etsABI = require("../abi/contracts/ETS.sol/ETS.json");

    // Contract addresses
    const etsAccessControlsAddress = config[chainId].contracts.ETSAccessControls.address;
    const etsAddress = config[chainId].contracts.ETS.address;

    // Contract instances
    const etsAccessControls = new ethers.Contract(
      etsAccessControlsAddress,
      etsAccessControlsABI,
      accounts[taskArgs.tagger],
    );
    const ets = new ethers.Contract(etsAddress, etsABI, accounts[taskArgs.tagger]);

    // Check that Publisher that caller (tagger) is using exists.
    let etsPublisherV1;
    const publisherAddress = await etsAccessControls.getPublisherAddressFromName(taskArgs.publisher);
    if ((await etsAccessControls.isPublisher(publisherAddress)) === false) {
      console.log(`"${taskArgs.publisher}" is not a publisher`);
      return;
    } else {
      etsPublisherV1 = new ethers.Contract(publisherAddress, etsPublisherV1ABI, accounts[taskArgs.tagger]);
    }

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
      publisherAddress,
      accounts[taskArgs.tagger].address,
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
      publisherAddress, // original publisher
      accounts[taskArgs.tagger].address, // original tagger
      1, // 1 = replace
    );

    let {0: fee, 1: actualTagCount} = result;
    taggingFee = fee;

    const tx = await etsPublisherV1.replaceTags([tagParams], {
      value: taggingFee,
      // gasPrice: ethers.utils.parseUnits("10", "gwei"), // do we need this?
      // gasLimit: 5000000, // do we need this?
    });
    console.log(`started txn ${tx.hash.toString()}`);
    tx.wait();
    console.log(`${actualTagCount} tag(s) replaced in ${taggingRecordId}`);
    console.log(`${taskArgs.tagger} charged for ${actualTagCount} tags`);
  });
