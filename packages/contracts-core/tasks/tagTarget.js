task("tagTarget", 'Tag a uri. eg: hh tagTarget --tags "#another,#blah" --uri "https://google.com" --network localhost')
  .addParam("uri", 'URI being tagged eg. --uri "https://google.com"')
  .addParam("tags", 'Hashtags separated by commas. eg. --tags "#another,#blah"')
  .addParam("recordType", 'Arbitrary record type identifier. eg. "bookmark"', "bookmark")
  .setAction(async (taskArgs) => {
    const {getAccounts} = require("../test/setup.js");
    const chainId = hre.network.config.chainId;
    const accounts = await getAccounts();
    const config = require("../config/config.json");

    // ABIs
    const ETSAccessControlsABI = require("../abi/contracts/ETSAccessControls.sol/ETSAccessControls.json");
    const ETSTargetTaggerABI = require("../abi/contracts/targetTaggers/ETSTargetTagger.sol/ETSTargetTagger.json");
    const ETSTargetABI = require("../abi/contracts/ETSTarget.sol/ETSTarget.json");
    const ETSABI = require("../abi/contracts/ETS.sol/ETS.json");

    // Contract addresses
    const ETSAccessControlsAddress = config[chainId].contracts.ETSAccessControls.address;
    const ETSTargetTaggerAddress = config[chainId].contracts.ETSTargetTagger.address;
    const ETSTargetAddress = config[chainId].contracts.ETSTarget.address;
    const ETSAddress = config[chainId].contracts.ETS.address;

    // Contract instances
    const etsAccessControls = new ethers.Contract(ETSAccessControlsAddress, ETSAccessControlsABI, accounts.ETSPlatform);
    const etsTargetTagger = new ethers.Contract(ETSTargetTaggerAddress, ETSTargetTaggerABI, accounts.ETSPlatform);
    const etsTarget = new ethers.Contract(ETSTargetAddress, ETSTargetABI, accounts.ETSPlatform);
    const ets = new ethers.Contract(ETSAddress, ETSABI, accounts.ETSPlatform);

    // Check that caller is publisher.
    const targetTaggerName = await etsTargetTagger.getTaggerName();
    console.log(targetTaggerName);
    if (
      (await etsAccessControls.isPublisher(ETSTargetTaggerAddress)) === false &&
      (await etsAccessControls["isTargetTagger"](targetTaggerName)) === true
    ) {
      console.log(`${etsTargetTagger.address} is not a publisher`);
      return;
    }

    const tags = taskArgs.tags.replace(/\s+/g, "").split(","); // remove spaces & split on comma
    const targetURI = taskArgs.uri;
    const recordType = taskArgs.recordType;

    let taggingFee = await ets.taggingFee();
    //taggingFee = taggingFee.toString();
    //console.log("taggingFee", taggingFee);

    const tagParams = {
      "targetURI": targetURI,
      "tagStrings": tags,
      "recordType": recordType,
      "enrich": false,
    };
    const taggingRecords = [tagParams];
    const tx = await etsTargetTagger.tagTarget(taggingRecords, {
      value: ethers.BigNumber.from(taggingFee).mul(tags.length),
      gasPrice: ethers.utils.parseUnits("10", "gwei"),
      gasLimit: 5000000,
    });

    console.log(`started txn ${tx.hash.toString()}`);
    tx.wait();

    const targetId = await etsTarget.computeTargetId(targetURI);
    console.log("target id", targetId.toString());

    // What the heck is going on here? targetExists not found.
    //if ((await etsTarget["targetExists"](targetURI)) === false) {
    //  console.log(`${targetId} for ${targetURI} not found`);
    //  return;
    //}

    const taggingRecordId = await ets.computeTaggingRecordId(
      targetId,
      taskArgs.recordType,
      ETSTargetTaggerAddress,
      accounts.ETSPlatform.address,
    );

    console.log("taggingRecordId", taggingRecordId.toString());

    //    const taggingRecord = await ets.getTaggingRecordFromId(taggingRecordId);
    //    console.log(taggingRecord);
    //
    //    console.log("taggingRecord.targetId", taggingRecord.targetId.toString());
    //    console.log("targetId", targetId.toString());
    //
    //    if (taggingRecord.targetId.toString() !== targetId.toString()) {
    //      console.log(`tagging record not found for ${taggingRecordId}`);
    //    }
    //    console.log(`tagging record created or edited ${taggingRecordId}`);
  });
