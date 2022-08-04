const {expect} = require("chai");

task("tagTarget", 'Tag a uri. eg: hh tagTarget --tags "#another,#blah" --uri "https://google.com" --network localhost')
  .addParam("uri", 'URI being tagged eg. --uri "https://google.com"')
  .addParam("tags", 'Hashtags separated by commas. eg. --tags "#another,#blah"')
  .addParam("recordType", 'Arbitrary record type identifier. eg. "bookmark"', "bookmark")
  .setAction(async (taskArgs) => {
    const {setup} = require("../test/setup.js");
    const config = require("../config/config.json");
    const etsAbi = require("../abi/contracts/ETS.sol/ETS.json");
    const etsTargetTaggerAbi = require("../abi/contracts/targetTaggers/ETSTargetTagger.sol/ETSTargetTagger.json");

    [accounts, contracts, initSettings] = await setup();
    const etsTargetTaggerAddress = config[31337].contracts.ETSTargetTagger.address;
    const etsTargetTagger = new ethers.Contract(etsTargetTaggerAddress, etsTargetTaggerAbi, accounts.ETSPlatform);

    const etsAddress = config[31337].contracts.ETS.address;
    const ets = new ethers.Contract(etsAddress, etsAbi, accounts.ETSPlatform);

    console.log(taskArgs.uri);
    console.log(taskArgs.tags);

    const tags = taskArgs.tags.replace(/\s+/g, "").split(",");

    let taggingFee = await ets.taggingFee();
    taggingFee = taggingFee.toString();
    console.log("taggingFee", taggingFee);

    const tagParams = {
      targetURI: taskArgs.uri,
      tagStrings: tags,
      recordType: taskArgs.recordType,
      enrich: false,
    };
    const taggingRecords = [tagParams];

    const targetTaggerName = await etsTargetTagger.getTaggerName();
    console.log(targetTaggerName);

    const tx = await etsTargetTagger.tagTarget(taggingRecords, {
      value: ethers.BigNumber.from(taggingFee).mul(tags.length),
      gasPrice: ethers.utils.parseUnits("100", "gwei"),
      gasLimit: 500000,
      nonce: nonce || undefined,
    });
  });
