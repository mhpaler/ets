const {setup} = require("./setup.js");
const {ethers} = require("hardhat");
const {expect} = require("chai");
const {constants} = require("ethers");

let targetURI, targetId, taggingRecordId;

describe("ETS Publisher Tests", function () {
  beforeEach("Setup test", async () => {
    // Add a test publisher via Publisher factory.
    [accounts, contracts, initSettings] = await setup();

    // Add a new publisher via PublisherFactory
    await contracts.ETSPublisherFactory.connect(accounts.RandomOne).addPublisherV1("ETS Test Publisher");
    publisherAddress = await contracts.ETSAccessControls.getPublisherAddressFromName("ETS Test Publisher");
    etsPublisherV1ABI = require("../abi/contracts/publishers/ETSPublisherV1.sol/ETSPublisherV1.json");
    contracts.ETSPublisher = new ethers.Contract(publisherAddress, etsPublisherV1ABI, accounts.RandomOne);

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
    it("should emit Transfer", async () => {
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
      await expect(tx).to.emit(contracts.ETS, "TaggingRecordUpdated").withArgs(taggingRecordId, 0);
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
        result = await contracts.ETSPublisher.computeTaggingFee(
          taggingRecords[i],
          0,
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
      await expect(tx).to.emit(contracts.ETS, "TaggingRecordUpdated").withArgs(taggingRecordId, 2);

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

      await expect(tx).to.emit(contracts.ETS, "TaggingRecordUpdated").withArgs(taggingRecordId, 0);
      await expect(tx).to.emit(contracts.ETS, "TaggingRecordUpdated").withArgs(taggingRecordId, 2);

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
        result = await contracts.ETSPublisher.computeTaggingFee(
          taggingRecords[i],
          1, // action to preform
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
        result = await contracts.ETSPublisher.computeTaggingFee(
          taggingRecords[i],
          1, // action to preform
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
        result = await contracts.ETSPublisher.computeTaggingFee(
          replaceRecords[i],
          1, // action to preform
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

      await expect(tx).to.emit(contracts.ETS, "TaggingRecordUpdated").withArgs(taggingRecordId, 0);
      await expect(tx).to.emit(contracts.ETS, "TaggingRecordUpdated").withArgs(taggingRecordId, 2);

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
        result = await contracts.ETSPublisher.computeTaggingFee(
          taggingRecords[i],
          1, // action to preform
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
        result = await contracts.ETSPublisher.computeTaggingFee(
          taggingRecords[i],
          1, // action to preform
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
        result = await contracts.ETSPublisher.computeTaggingFee(
          replaceRecords[i],
          1, // action to preform
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

  describe.only("Tagging fees", async () => {
    describe("for new tagging records", async () => {
      it("should fail when providing an invalid tagging action", async () => {
        const rawInput = {
          targetURI: "https://google.com",
          tagStrings: ["#love", "#hate"],
          recordType: "bookmark",
        };

        await expect(
          contracts.ETSPublisher.computeTaggingFee(
            rawInput,
            4, // INVALID TaggingAction
          ),
        ).to.be.reverted;
      });

      it("are computed correctly with raw tagging record parts", async () => {
        const rawInput = {
          targetURI: "https://google.com",
          tagStrings: ["#love", "#hate"],
          recordType: "bookmark",
        };
        const result = await contracts.ETSPublisher.computeTaggingFee(
          rawInput,
          0,
        );

        const {0: fee, 1: tagCount} = result;
        expect(tagCount).to.be.equal(rawInput.tagStrings.length);
        expect(fee.toString()).to.be.equal((taggingFee * tagCount).toString());
      });

      
    });

    describe("for existing tagging records", async () => {
      beforeEach("Setup test", async () => {
        // Create a tagging record, ETSPlatform is publisher, accounts.RandomOne is tagger.
        await contracts.ETSPublisher.connect(accounts.RandomOne).applyTags(taggingRecords, {
          value: ethers.BigNumber.from(taggingFee).mul("2"),
        });

        tagstring1 = "#love";
        tagstring2 = "#hate";
        tagstring3 = "#Fear";
        tagstring4 = "#Incredible";
      });
      it("are computed correctly when applying new tags using raw inputs", async () => {
        // Estimate the cost of applying two new tags to an existing record, two of which are already in the tagging record.
        const rawInput = {
          targetURI: targetURI,
          tagStrings: [tagstring3, tagstring4], // appending two new tags
          recordType: "bookmark",
        };
        const result = await contracts.ETSPublisher.computeTaggingFee(
          rawInput,
          0,
        );

        const {0: fee, 1: actualTagCount} = result;
        expect(actualTagCount).to.be.equal(rawInput.tagStrings.length);
        expect(fee.toString()).to.be.equal((taggingFee * actualTagCount).toString());
      });

      it("are computed correctly when applying new tags and duplicate tags using raw inputs", async () => {
        const rawInput = {
          targetURI: targetURI,
          tagStrings: [tagstring1, tagstring1, tagstring3, tagstring4], // applying two duplicate and two new
          recordType: "bookmark",
        };
        const result = await contracts.ETSPublisher.computeTaggingFee(
          rawInput,
          0,
        );

        const {0: fee, 1: actualTagCount} = result;
        expect(actualTagCount).to.be.equal(2);
        expect(fee.toString()).to.be.equal((taggingFee * actualTagCount).toString());
      });
      it("are computed correctly when applying only duplicate tags using raw inputs", async () => {
        const rawInput = {
          targetURI: targetURI,
          tagStrings: [tagstring1, tagstring1], // applying two duplicate and two new
          recordType: "bookmark",
        };
        const result = await contracts.ETSPublisher.computeTaggingFee(
          rawInput,
          0,
        );

        const {0: fee, 1: actualTagCount} = result;
        expect(actualTagCount).to.be.equal(0);
        expect(fee.toString()).to.be.equal((0).toString());
      });

      it("are computed correctly when replacing with only new tags using raw inputs", async () => {
        const rawInput = {
          targetURI: targetURI,
          tagStrings: [tagstring3, tagstring4], // replacing with two new
          recordType: "bookmark",
        };
        const result = await contracts.ETSPublisher.computeTaggingFee(
          rawInput,
          1,
        );

        const {0: fee, 1: actualTagCount} = result;
        expect(actualTagCount).to.be.equal(2);
        expect(fee.toString()).to.be.equal((2 * taggingFee).toString());
      });

      it("are computed correctly when replacing with new & duplicate tags using raw inputs", async () => {
        const rawInput = {
          targetURI: targetURI,
          // replacing with one duplicate and two new
          // note shuffled order
          tagStrings: [tagstring4, tagstring3, tagstring1],
          recordType: "bookmark",
        };
        const result = await contracts.ETSPublisher.computeTaggingFee(
          rawInput,
          1,
        );

        const {0: fee, 1: actualTagCount} = result;
        expect(actualTagCount).to.be.equal(2);
        expect(fee.toString()).to.be.equal((2 * taggingFee).toString());
      });

      it("are computed correctly when replacing with only duplicate tags using raw inputs", async () => {
        const rawInput = {
          targetURI: targetURI,
          tagStrings: [tagstring2, tagstring1], // replacing with duplicate tags
          recordType: "bookmark",
        };
        const result = await contracts.ETSPublisher.computeTaggingFee(
          rawInput,
          1,
        );

        const {0: fee, 1: actualTagCount} = result;
        expect(actualTagCount).to.be.equal(0);
        expect(fee.toString()).to.be.equal((0).toString());
      });
    });
  });
});
