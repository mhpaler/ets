const {setup, getFactories} = require("./setup.js");
const {ethers, upgrades} = require("hardhat");
const {expect} = require("chai");

let targetURI, targetId, taggingRecordId;

describe("ETS Publisher Tests", function () {
  beforeEach("Setup test", async function () {
    [accounts, contracts, initSettings] = await setup();

    taggingFee = await contracts.ETS.taggingFee();
    taggingFee = taggingFee.toString();

    // Mint a tag. RandomOne is Publisher, Creator is Creator. Retained by platform.
    //    tagString1 = "#Love";
    //    await contracts.ETSToken.connect(accounts.RandomOne).createTag(tagString1, accounts.Creator.address);
    //    etsTag1 = await contracts.ETSToken.computeTagId(tagString1);
    //    etsTag1 = etsTag1.toString();
    //
    //    tagString2 = "#Hate";
    //    await contracts.ETSToken.connect(accounts.RandomOne).createTag(tagString2, accounts.Creator.address);
    //    etsTag2 = await contracts.ETSToken.computeTagId(tagString2);
    //    etsTag2 = etsTag2.toString();
    //
    //    tagString3 = "#Fear";
    //    await contracts.ETSToken.connect(accounts.RandomOne).createTag(tagString3, accounts.Creator.address);
    //    etsTag3 = await contracts.ETSToken.computeTagId(tagString3);
    //    etsTag3 = etsTag3.toString();
    //
    //    // Mint another tag. RandomOne is Publisher, Creator is Creator. Transferred to (owned by) RandomTwo.
    //    tagString4 = "#Incredible";
    //    await contracts.ETSToken.connect(accounts.RandomOne).createTag(tagString4, accounts.Creator.address);
    //    userTag1 = await contracts.ETSToken.computeTagId(tagString4);
    //    userTag1 = userTag1.toString();
    //
    //    await contracts.ETSToken.connect(accounts.ETSPlatform).transferFrom(
    //      accounts.ETSPlatform.address,
    //      accounts.RandomTwo.address,
    //      userTag1,
    //    );

    // Add a target to ETS.
    targetURI = "https://google.com";

    // Add & enable ETSPublisher as a Publisher contract.
    await contracts.ETSAccessControls.connect(accounts.ETSPlatform).addPublisher(
      contracts.ETSPublisher.address,
      await contracts.ETSPublisher.getPublisherName(),
    );
  });

  describe("Writing a tagging record via Publisher contract", async () => {
    it("should revert when Publisher contract is paused", async () => {
      expect(await contracts.ETSAccessControls.isPublisherAndNotPaused(contracts.ETSPublisher.address)).to.be.equal(
        true,
      );

      // Pause ETSPublisher
      await contracts.ETSAccessControls.connect(accounts.ETSPlatform).toggleIsPublisherPaused(
        contracts.ETSPublisher.address,
      );

      const tagParams = {
        targetURI: targetURI,
        tagStrings: ["#love", "#hate"],
        recordType: "bookmark",
        enrich: false,
      };
      const taggingRecords = [tagParams];
      await expect(
        contracts.ETSPublisher.connect(accounts.RandomOne).applyTags(taggingRecords, {
          value: ethers.BigNumber.from(taggingFee).mul("2"),
        }),
      ).to.be.revertedWith("Caller not IETSPublisher contract");
    });

    it('should emit "TargetTagged" when successful', async function () {
      const tagParams = {
        targetURI: targetURI,
        tagStrings: ["#love", "#hate"],
        recordType: "bookmark",
        enrich: false,
      };
      const taggingRecords = [tagParams];

      const tx = await contracts.ETSPublisher.connect(accounts.RandomOne).applyTags(taggingRecords, {
        value: ethers.BigNumber.from(taggingFee).mul("2"),
      });
      await expect(tx).to.emit(contracts.ETS, "TargetTagged");
    });

    it('should emit "TargetTagged" when successful', async function () {
      const tagParams = {
        targetURI: targetURI,
        tagStrings: ["#love", "#hate"],
        recordType: "bookmark",
        enrich: false,
      };
      const taggingRecords = [tagParams];

      const tx = await contracts.ETSPublisher.connect(accounts.RandomOne).applyTags(taggingRecords, {
        value: ethers.BigNumber.from(taggingFee).mul("2"),
      });
      await expect(tx).to.emit(contracts.ETS, "TargetTagged");
    });
  });
});
