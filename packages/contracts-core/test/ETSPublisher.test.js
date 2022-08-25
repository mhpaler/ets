const {setup} = require("./setup.js");
const {ethers} = require("hardhat");
const {expect} = require("chai");
const {constants, utils, BigNumber} = require("ethers");

let targetURI, targetId, taggingRecordId;

describe("ETS Publisher Tests", function () {
  beforeEach("Setup test", async () => {
    [accounts, contracts, initSettings] = await setup();

    // Add & enable ETSPublisher as a Publisher contract.
    await contracts.ETSAccessControls.connect(accounts.ETSPlatform).addPublisher(
      contracts.ETSPublisher.address,
      await contracts.ETSPublisher.getPublisherName(),
    );

    taggingFee = await contracts.ETS.taggingFee();
    taggingFee = ethers.BigNumber.from(taggingFee);
    targetURI = "https://google.com";
    tagParams = {
      targetURI: targetURI,
      tagStrings: ["#love", "#hate"],
      recordType: "bookmark",
      enrich: false,
    };
    taggingRecords = [tagParams];
    targetId = await contracts.ETSTarget.computeTargetId(targetURI);
    taggingRecordId = await contracts.ETS.computeTaggingRecordIdFromCompositeKey(
      targetId,
      "bookmark",
      contracts.ETSPublisher.address,
      accounts.RandomOne.address,
    );
  });

  describe("Creating tags", async () => {
    it("should emit TaggingRecordCreated with new tagId", async () => {
      const tagstring1 = "#Love";
      const etsTagId = await contracts.ETSToken.computeTagId(tagstring1);
      const tx = await contracts.ETSPublisher.connect(accounts.Creator).getOrCreateTagIds([tagstring1]);
      await expect(tx)
        .to.emit(contracts.ETSToken, "Transfer")
        .withArgs(constants.AddressZero, accounts.ETSPlatform.address, etsTagId);
    });
  });

  describe("Applying tags", async () => {
    it("should revert when Publisher contract is paused", async () => {
      expect(await contracts.ETSAccessControls.isPublisherAndNotPaused(contracts.ETSPublisher.address)).to.be.equal(
        true,
      );
      // Pause ETSPublisher
      await contracts.ETSAccessControls.connect(accounts.ETSPlatform).toggleIsPublisherPaused(
        contracts.ETSPublisher.address,
      );

      await expect(
        contracts.ETSPublisher.connect(accounts.RandomOne).applyTags(taggingRecords, {
          value: ethers.BigNumber.from(taggingFee).mul("2"),
        }),
      ).to.be.revertedWith("Caller not Publisher");
    });

    it('should emit "TaggingRecordCreated" with new taggingRecordId when NEW tagging record is created', async () => {
      const tx = await contracts.ETSPublisher.connect(accounts.RandomOne).applyTags(taggingRecords, {
        value: ethers.BigNumber.from(taggingFee).mul("2"),
      });
      await expect(tx).to.emit(contracts.ETS, "TaggingRecordCreated").withArgs(taggingRecordId);
    });

    it('should emit "TaggingRecordUpdated" when applying tags to existing record.', async () => {
      // Create the record.
      await contracts.ETSPublisher.connect(accounts.RandomOne).applyTags(taggingRecords, {
        value: ethers.BigNumber.from(taggingFee).mul("2"),
      });

      appendRecord = {
        targetURI: targetURI,
        tagStrings: ["#Google"],
        recordType: "bookmark",
        enrich: false,
      };
      const tx = await contracts.ETSPublisher.connect(accounts.RandomOne).applyTags([appendRecord], {
        value: ethers.BigNumber.from(taggingFee).mul("1"),
      });
      await expect(tx).to.emit(contracts.ETS, "TaggingRecordUpdated").withArgs(taggingRecordId, "append");
    });

    it('should not emit "TaggingRecordUpdated" when same tags are applied to existing record.', async () => {
      // Create the record.
      await contracts.ETSPublisher.connect(accounts.RandomOne).applyTags(taggingRecords, {
        value: ethers.BigNumber.from(taggingFee).mul("2"),
      });

      // Apply more tags...
      let calcTaggingFee = 0;
      let result;
      for (let i = 0; i < taggingRecords.length; i++) {
        result = await contracts.ETS.computeTaggingFeeFromRawInput(
          taggingRecords[i],
          contracts.ETSPublisher.address, // original publisher
          accounts.RandomOne.address, // original tagger
          "apply",
        );
        let {0: fee, 1: actualTagCount} = result;
        calcTaggingFee += fee;
      }
      const tx = await contracts.ETSPublisher.connect(accounts.RandomOne).applyTags(taggingRecords, {
        value: calcTaggingFee,
      });
      await expect(tx).to.not.emit(contracts.ETS, "TaggingRecordUpdated");
    });
  });

  describe("Removing tags", async () => {
    it("should revert when Publisher contract is paused", async () => {
      // Create the record.
      await contracts.ETSPublisher.connect(accounts.RandomOne).applyTags(taggingRecords, {
        value: ethers.BigNumber.from(taggingFee).mul("2"),
      });

      // Pause ETSPublisher
      await contracts.ETSAccessControls.connect(accounts.ETSPlatform).toggleIsPublisherPaused(
        contracts.ETSPublisher.address,
      );
      await expect(contracts.ETSPublisher.connect(accounts.RandomOne).removeTags(taggingRecords)).to.be.revertedWith(
        "Caller not authorized or record not found",
      );
    });

    it("should revert if tagging record doesn't exist", async () => {
      // Create a tagging record.
      await expect(contracts.ETSPublisher.connect(accounts.RandomOne).removeTags(taggingRecords)).to.be.revertedWith(
        "Caller not authorized or record not found",
      );
    });

    it('should emit "TaggingRecordUpdated" and reduce tag count', async () => {
      // Create the record.
      await contracts.ETSPublisher.connect(accounts.RandomOne).applyTags(taggingRecords, {
        value: ethers.BigNumber.from(taggingFee).mul("2"),
      });

      let taggingRecord = await contracts.ETS.getTaggingRecordFromId(taggingRecordId);
      expect(taggingRecord.tagIds.length).to.be.equal(2);

      removeTags = {
        targetURI: targetURI,
        tagStrings: ["#love"],
        recordType: "bookmark",
        enrich: false,
      };
      const tx = await contracts.ETSPublisher.connect(accounts.RandomOne).removeTags([removeTags]);
      await expect(tx).to.emit(contracts.ETS, "TaggingRecordUpdated").withArgs(taggingRecordId, "remove");

      taggingRecord = await contracts.ETS.getTaggingRecordFromId(taggingRecordId);
      expect(taggingRecord.tagIds.length).to.be.equal(1);
    });

    it("can work with multiple tags at once", async () => {
      // Create the record.
      await contracts.ETSPublisher.connect(accounts.RandomOne).applyTags(taggingRecords, {
        value: ethers.BigNumber.from(taggingFee).mul("2"),
      });
      await contracts.ETSPublisher.connect(accounts.RandomOne).removeTags([tagParams]);
      taggingRecord = await contracts.ETS.getTaggingRecordFromId(taggingRecordId);
      expect(taggingRecord.tagIds.length).to.be.equal(0);
    });

    it('should not emit "TaggingRecordUpdated" or reduce tag count if tags do not exist in tagging record', async () => {
      // Create the record.
      await contracts.ETSPublisher.connect(accounts.RandomOne).applyTags(taggingRecords, {
        value: ethers.BigNumber.from(taggingFee).mul("2"),
      });

      removeTags = {
        targetURI: targetURI,
        tagStrings: ["#blah"],
        recordType: "bookmark",
        enrich: false,
      };
      const tx = await contracts.ETSPublisher.connect(accounts.RandomOne).removeTags([removeTags]);
      await expect(tx).to.not.emit(contracts.ETS, "TaggingRecordUpdated");

      taggingRecord = await contracts.ETS.getTaggingRecordFromId(taggingRecordId);
      expect(taggingRecord.tagIds.length).to.be.equal(2);
    });
  });

  describe("Replacing tags", async () => {
    it("should revert when Publisher contract is paused", async () => {
      // Create the record.
      await contracts.ETSPublisher.connect(accounts.RandomOne).applyTags(taggingRecords, {
        value: ethers.BigNumber.from(taggingFee).mul("2"),
      });

      // Pause ETSPublisher
      await contracts.ETSAccessControls.connect(accounts.ETSPlatform).toggleIsPublisherPaused(
        contracts.ETSPublisher.address,
      );

      replaceTags = {
        targetURI: targetURI,
        tagStrings: ["#newtag1", "#newtag2"],
        recordType: "bookmark",
        enrich: false,
      };

      await expect(
        contracts.ETSPublisher.connect(accounts.RandomOne).replaceTags([replaceTags], {
          value: ethers.BigNumber.from(taggingFee).mul("2"),
        }),
      ).to.be.revertedWith("Caller not Publisher");
    });

    it("should revert if tagging record doesn't exist", async () => {
      // Create a tagging record.
      await expect(
        contracts.ETSPublisher.connect(accounts.RandomOne).replaceTags(taggingRecords, {
          value: ethers.BigNumber.from(taggingFee).mul("2"),
        }),
      ).to.be.revertedWith("Caller not authorized or record not found");
    });

    it('should emit "TaggingRecordUpdated" and change tag count', async () => {
      // Create the record.
      await contracts.ETSPublisher.connect(accounts.RandomOne).applyTags(taggingRecords, {
        value: ethers.BigNumber.from(taggingFee).mul("2"),
      });
      // Removing two and adding three in one step.
      replaceTags = {
        targetURI: targetURI,
        tagStrings: ["#newtag1", "#newtag2", "#newtag3"],
        recordType: "bookmark",
        enrich: false,
      };
      const tx = await contracts.ETSPublisher.connect(accounts.RandomOne).replaceTags([replaceTags], {
        value: ethers.BigNumber.from(taggingFee).mul("3"),
      });

      await expect(tx).to.emit(contracts.ETS, "TaggingRecordUpdated").withArgs(taggingRecordId, "remove");
      await expect(tx).to.emit(contracts.ETS, "TaggingRecordUpdated").withArgs(taggingRecordId, "append");

      taggingRecord = await contracts.ETS.getTaggingRecordFromId(taggingRecordId);
      expect(taggingRecord.tagIds.length).to.be.equal(3);
    });

    it('should not emit "TaggingRecordUpdated" or reduce tag count if nothing changes', async () => {
      // Create the record.
      await contracts.ETSPublisher.connect(accounts.RandomOne).applyTags(taggingRecords, {
        value: ethers.BigNumber.from(taggingFee).mul("2"),
      });

      // Estimate tagging fee
      let calcTaggingFee = 0;
      let result;
      for (let i = 0; i < taggingRecords.length; i++) {
        result = await contracts.ETS.computeTaggingFeeFromRawInput(
          taggingRecords[i],
          contracts.ETSPublisher.address, // original publisher
          accounts.RandomOne.address, // original tagger
          "replace", // action to preform
        );
        let {0: fee, 1: actualTagCount} = result;
        calcTaggingFee += fee;
      }
      const tx = await contracts.ETSPublisher.connect(accounts.RandomOne).replaceTags(taggingRecords, {
        value: calcTaggingFee,
      });

      await expect(tx).to.not.emit(contracts.ETS, "TaggingRecordUpdated");
      taggingRecord = await contracts.ETS.getTaggingRecordFromId(taggingRecordId);
      expect(taggingRecord.tagIds.length).to.be.equal(2);
    });

    it("should only charge for new tags", async () => {
      // Estimate tagging fee
      let applyTaggingFee = 0;
      let result;
      for (let i = 0; i < taggingRecords.length; i++) {
        result = await contracts.ETS.computeTaggingFeeFromRawInput(
          taggingRecords[i],
          contracts.ETSPublisher.address, // original publisher
          accounts.RandomOne.address, // original tagger
          "replace", // action to preform
        );
        let {0: fee, 1: actualTagCount} = result;
        applyTaggingFee += fee;
      }
      tx = await contracts.ETSPublisher.connect(accounts.RandomOne).applyTags(taggingRecords, {
        value: applyTaggingFee,
      });

      // keep the original two and add three in one step.
      replaceTags = {
        targetURI: targetURI,
        tagStrings: ["#love", "#hate", "#newtag1", "#newtag2", "#newtag3"],
        recordType: "bookmark",
        enrich: false,
      };

      const replaceRecords = [replaceTags];

      // Estimate tagging fee
      let replaceTaggingFee = 0;
      result;
      for (let i = 0; i < replaceRecords.length; i++) {
        result = await contracts.ETS.computeTaggingFeeFromRawInput(
          replaceRecords[i],
          contracts.ETSPublisher.address, // original publisher
          accounts.RandomOne.address, // original tagger
          "replace", // action to preform
        );
        let {0: fee, 1: actualTagCount} = result;
        replaceTaggingFee += fee;
      }
      tx = await contracts.ETSPublisher.connect(accounts.RandomOne).replaceTags(replaceRecords, {
        value: replaceTaggingFee,
      });

      receipt = await tx.wait();

      const taggingRecord = await contracts.ETS.getTaggingRecordFromId(taggingRecordId);
      expect(taggingRecord.tagIds.length).to.be.equal(5);

      // A total of 5 tags were applied.
      expect(ethers.BigNumber.from(applyTaggingFee).add(ethers.BigNumber.from(replaceTaggingFee))).to.be.equal(
        ethers.BigNumber.from(taggingFee).mul("5"),
      );
    });
  });
});
