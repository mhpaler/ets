task("createTag", "Create a tag")
  .addParam("tag", "Hashtag string")
  .setAction(async (taskArgs) => {
    const {setup} = require("../test/setup.js");
    const config = require("../config/config.json");
    const ETSTokenAbi = require("../abi/contracts/ETSToken.sol/ETSToken.json");
    [accounts, contracts, initSettings] = await setup();
    const ETSTokenAddress = config[31337].contracts.ETSToken.address;
    const etsToken = new ethers.Contract(ETSTokenAddress, ETSTokenAbi, accounts.ETSPlatform);

    await etsToken.createTag(taskArgs.tag, accounts.ETSPlatform.address);
    const tagId = await etsToken.computeTagId(taskArgs.tag);
    if (await etsToken["tagExists(uint256)"](tagId)) {
      console.log("New tag created with id: ", tagId.toString());
    }
  });
