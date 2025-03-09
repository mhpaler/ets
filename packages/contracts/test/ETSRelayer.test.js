const { setup } = require("./setup.js");
const { ethers } = require("hardhat");
const { expect } = require("chai");

let targetURI;
let targetId;
let taggingRecordId;

describe("ETS Relayer Tests", () => {
  beforeEach("Setup test", async () => {
    // Add a test relayer via Relayer factory.
    [accounts, contracts, initSettings] = await setup();

    // Add a new relayer via RelayerFactory
    //await contracts.ETSRelayerFactory.connect(accounts.RandomOne).addRelayer("ETS Test Relayer");
    //relayerAddress = await contracts.ETSAccessControls.getRelayerAddressFromName("ETS Test Relayer");
    //etsRelayerABI = require("../abi/contracts/relayers/ETSRelayer.sol/ETSRelayer.json");
    //contracts.ETSRelayer = new ethers.Contract(relayerAddress, etsRelayerABI);

    taggingFee = await contracts.ETS.taggingFee();
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
      await contracts.ETSRelayer.getAddress(),
      accounts.RandomOne.address,
    );
  });

  describe("Creating tags", async () => {
    it("should emit Transfer", async () => {
      const tagstring1 = "#Love";
      const etsTagId = await contracts.ETSToken.computeTagId(tagstring1);
      const tx = await contracts.ETSRelayer.connect(accounts.Creator).getOrCreateTagIds([tagstring1]);
      await expect(tx)
        .to.emit(contracts.ETSToken, "Transfer")
        .withArgs(ethers.ZeroAddress, accounts.ETSPlatform.address, etsTagId);
    });
  });

  describe("Applying tags", async () => {
    it("should revert when Relayer contract is paused", async () => {
      expect(
        await contracts.ETSAccessControls.isRelayerAndNotPaused(await contracts.ETSRelayer.getAddress()),
      ).to.be.equal(true);
      // Pause ETSRelayer
      await contracts.ETSAccessControls.connect(accounts.ETSPlatform).toggleRelayerLock(
        await contracts.ETSRelayer.getAddress(),
      );

      await expect(
        contracts.ETSRelayer.connect(accounts.RandomOne).applyTags(taggingRecords, {
          value: taggingFee * BigInt(2),
        }),
      ).to.be.revertedWith("Caller not Relayer");
    });

    it('should emit "TaggingRecordCreated" with new taggingRecordId when NEW tagging record is created', async () => {
      const tx = await contracts.ETSRelayer.connect(accounts.RandomOne).applyTags(taggingRecords, {
        value: taggingFee * BigInt(2),
      });
      await expect(tx).to.emit(contracts.ETS, "TaggingRecordCreated").withArgs(taggingRecordId);
    });

    it('should emit "TaggingRecordUpdated" when applying tags to existing record.', async () => {
      // Create the record.
      await contracts.ETSRelayer.connect(accounts.RandomOne).applyTags(taggingRecords, {
        value: taggingFee * BigInt(2),
      });

      appendRecord = {
        targetURI: targetURI,
        tagStrings: ["#Google"],
        recordType: "bookmark",
        enrich: false,
      };
      const tx = await contracts.ETSRelayer.connect(accounts.RandomOne).applyTags([appendRecord], {
        value: taggingFee * BigInt(1),
      });
      await expect(tx).to.emit(contracts.ETS, "TaggingRecordUpdated").withArgs(taggingRecordId, 0);
    });

    it('should not emit "TaggingRecordUpdated" when same tags are applied to existing record.', async () => {
      // Create the record.
      await contracts.ETSRelayer.connect(accounts.RandomOne).applyTags(taggingRecords, {
        value: taggingFee * BigInt(2),
      });

      // Apply more tags...
      let _calcTaggingFee = BigInt(0);
      let result;

      for (let i = 0; i < taggingRecords.length; i++) {
        result = await contracts.ETSRelayer.computeTaggingFee(taggingRecords[i], 0);
        const { 0: fee, 1: _actualTagCount } = result;
        _calcTaggingFee += fee;
      }
      //const tx = await contracts.ETSRelayer.connect(accounts.RandomOne).applyTags(taggingRecords, {
      //  value: calcTaggingFee,
      //});
      //await expect(tx).to.not.emit(contracts.ETS, "TaggingRecordUpdated");
    });
  });

  describe("Removing tags", async () => {
    it("should revert when Relayer contract is paused", async () => {
      // Create the record.
      await contracts.ETSRelayer.connect(accounts.RandomOne).applyTags(taggingRecords, {
        value: taggingFee * BigInt(2),
      });

      // Pause ETSRelayer
      await contracts.ETSAccessControls.connect(accounts.ETSPlatform).toggleRelayerLock(
        await contracts.ETSRelayer.getAddress(),
      );
      await expect(contracts.ETSRelayer.connect(accounts.RandomOne).removeTags(taggingRecords)).to.be.revertedWith(
        "Caller not Relayer",
      );
    });

    it("should revert if tagging record doesn't exist", async () => {
      // Create a tagging record.
      await expect(contracts.ETSRelayer.connect(accounts.RandomOne).removeTags(taggingRecords)).to.be.revertedWith(
        "Not authorized",
      );
    });

    it('should emit "TaggingRecordUpdated" and reduce tag count', async () => {
      // Create the record.
      await contracts.ETSRelayer.connect(accounts.RandomOne).applyTags(taggingRecords, {
        value: taggingFee * BigInt(2),
      });

      let taggingRecord = await contracts.ETS.getTaggingRecordFromId(taggingRecordId);
      expect(taggingRecord.tagIds.length === 2);

      removeTags = {
        targetURI: targetURI,
        tagStrings: ["#love"],
        recordType: "bookmark",
        enrich: false,
      };
      const tx = await contracts.ETSRelayer.connect(accounts.RandomOne).removeTags([removeTags]);
      await expect(tx).to.emit(contracts.ETS, "TaggingRecordUpdated").withArgs(taggingRecordId, 2);

      taggingRecord = await contracts.ETS.getTaggingRecordFromId(taggingRecordId);
      expect(taggingRecord.tagIds.length === 1);
    });

    it("can work with multiple tags at once", async () => {
      // Create the record.
      await contracts.ETSRelayer.connect(accounts.RandomOne).applyTags(taggingRecords, {
        value: taggingFee * BigInt(2),
      });
      await contracts.ETSRelayer.connect(accounts.RandomOne).removeTags([tagParams]);
      taggingRecord = await contracts.ETS.getTaggingRecordFromId(taggingRecordId);
      expect(taggingRecord.tagIds.length).to.be.equal(0);
    });

    it('should not emit "TaggingRecordUpdated" or reduce tag count if tags do not exist in tagging record', async () => {
      // Create the record.
      await contracts.ETSRelayer.connect(accounts.RandomOne).applyTags(taggingRecords, {
        value: taggingFee * BigInt(2),
      });

      removeTags = {
        targetURI: targetURI,
        tagStrings: ["#blah"],
        recordType: "bookmark",
        enrich: false,
      };
      const tx = await contracts.ETSRelayer.connect(accounts.RandomOne).removeTags([removeTags]);
      await expect(tx).to.not.emit(contracts.ETS, "TaggingRecordUpdated");

      taggingRecord = await contracts.ETS.getTaggingRecordFromId(taggingRecordId);
      expect(taggingRecord.tagIds.length).to.be.equal(2);
    });
  });

  describe("Replacing tags", async () => {
    it("should revert when Relayer contract is paused", async () => {
      // Create the record.
      await contracts.ETSRelayer.connect(accounts.RandomOne).applyTags(taggingRecords, {
        value: taggingFee * BigInt(2),
      });

      // Pause ETSRelayer
      await contracts.ETSAccessControls.connect(accounts.ETSPlatform).toggleRelayerLock(
        await contracts.ETSRelayer.getAddress(),
      );

      replaceTags = {
        targetURI: targetURI,
        tagStrings: ["#newtag1", "#newtag2"],
        recordType: "bookmark",
        enrich: false,
      };

      await expect(
        contracts.ETSRelayer.connect(accounts.RandomOne).replaceTags([replaceTags], {
          value: taggingFee * BigInt(2),
        }),
      ).to.be.revertedWith("Caller not Relayer");
    });

    it("should revert if tagging record doesn't exist", async () => {
      // Create a tagging record.
      await expect(
        contracts.ETSRelayer.connect(accounts.RandomOne).replaceTags(taggingRecords, {
          value: taggingFee * BigInt(2),
        }),
      ).to.be.revertedWith("Not authorized");
    });

    it('should emit "TaggingRecordUpdated" and change tag count', async () => {
      // Create the record.
      await contracts.ETSRelayer.connect(accounts.RandomOne).applyTags(taggingRecords, {
        value: taggingFee * BigInt(2),
      });
      // Removing two and adding three in one step.
      replaceTags = {
        targetURI: targetURI,
        tagStrings: ["#newtag1", "#newtag2", "#newtag3"],
        recordType: "bookmark",
        enrich: false,
      };
      const tx = await contracts.ETSRelayer.connect(accounts.RandomOne).replaceTags([replaceTags], {
        value: taggingFee * BigInt(3),
      });

      await expect(tx).to.emit(contracts.ETS, "TaggingRecordUpdated").withArgs(taggingRecordId, 0);
      await expect(tx).to.emit(contracts.ETS, "TaggingRecordUpdated").withArgs(taggingRecordId, 2);

      taggingRecord = await contracts.ETS.getTaggingRecordFromId(taggingRecordId);
      expect(taggingRecord.tagIds.length === 3);
    });

    it('should not emit "TaggingRecordUpdated" or reduce tag count if nothing changes', async () => {
      // Create the record.
      await contracts.ETSRelayer.connect(accounts.RandomOne).applyTags(taggingRecords, {
        value: taggingFee * BigInt(2),
      });

      // Estimate tagging fee
      let calcTaggingFee = BigInt(0);
      let result;
      for (let i = 0; i < taggingRecords.length; i++) {
        result = await contracts.ETSRelayer.computeTaggingFee(
          taggingRecords[i],
          1, // action to preform
        );
        const { 0: fee, 1: _actualTagCount } = result;
        calcTaggingFee += fee;
      }
      const tx = await contracts.ETSRelayer.connect(accounts.RandomOne).replaceTags(taggingRecords, {
        value: calcTaggingFee,
      });

      await expect(tx).to.not.emit(contracts.ETS, "TaggingRecordUpdated");
      taggingRecord = await contracts.ETS.getTaggingRecordFromId(taggingRecordId);
      expect(taggingRecord.tagIds.length === 2);
    });

    it("should only charge for new tags", async () => {
      // Estimate tagging fee
      let applyTaggingFee = BigInt(0);
      let result;
      for (let i = 0; i < taggingRecords.length; i++) {
        result = await contracts.ETSRelayer.computeTaggingFee(
          taggingRecords[i],
          1, // action to preform
        );
        const { 0: fee, 1: _actualTagCount } = result;
        applyTaggingFee += fee;
      }
      tx = await contracts.ETSRelayer.connect(accounts.RandomOne).applyTags(taggingRecords, {
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
      let replaceTaggingFee = BigInt(0);
      result;
      for (let i = 0; i < replaceRecords.length; i++) {
        result = await contracts.ETSRelayer.computeTaggingFee(
          replaceRecords[i],
          1, // action to preform
        );
        const { 0: fee, 1: _actualTagCount } = result;
        replaceTaggingFee += fee;
      }
      tx = await contracts.ETSRelayer.connect(accounts.RandomOne).replaceTags(replaceRecords, {
        value: replaceTaggingFee,
      });

      receipt = await tx.wait();

      const taggingRecord = await contracts.ETS.getTaggingRecordFromId(taggingRecordId);
      expect(taggingRecord.tagIds.length === 5);

      // A total of 5 tags were applied.
      expect(applyTaggingFee + replaceTaggingFee === taggingFee * BigInt(5));
    });
  });

  describe("Tagging fees", async () => {
    describe("for new tagging records", async () => {
      it("should fail when providing an invalid tagging action", async () => {
        const rawInput = {
          targetURI: "https://google.com",
          tagStrings: ["#love", "#hate"],
          recordType: "bookmark",
        };

        await expect(
          contracts.ETSRelayer.computeTaggingFee(
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
        const result = await contracts.ETSRelayer.computeTaggingFee(rawInput, 0);

        const { 0: fee, 1: tagCount } = result;
        expect(tagCount === rawInput.tagStrings.length);
        expect(fee === taggingFee * tagCount);
      });
    });

    describe("for existing tagging records", async () => {
      beforeEach("Setup test", async () => {
        // Create a tagging record, ETSPlatform is relayer, accounts.RandomOne is tagger.
        await contracts.ETSRelayer.connect(accounts.RandomOne).applyTags(taggingRecords, {
          value: taggingFee * BigInt(2),
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
        const result = await contracts.ETSRelayer.computeTaggingFee(rawInput, 0);

        const { 0: fee, 1: _actualTagCount } = result;
        expect(_actualTagCount === rawInput.tagStrings.length);
        expect(fee === taggingFee * _actualTagCount);
      });

      it("are computed correctly when applying new tags and duplicate tags using raw inputs", async () => {
        const rawInput = {
          targetURI: targetURI,
          tagStrings: [tagstring1, tagstring1, tagstring3, tagstring4], // applying two duplicate and two new
          recordType: "bookmark",
        };
        const result = await contracts.ETSRelayer.computeTaggingFee(rawInput, 0);

        const { 0: fee, 1: _actualTagCount } = result;
        expect(_actualTagCount === 2);
        expect(fee === taggingFee * _actualTagCount);
      });

      it("are computed correctly when applying only duplicate tags using raw inputs", async () => {
        const rawInput = {
          targetURI: targetURI,
          tagStrings: [tagstring1, tagstring1], // applying two duplicate and two new
          recordType: "bookmark",
        };
        const result = await contracts.ETSRelayer.computeTaggingFee(rawInput, 0);

        const { 0: fee, 1: _actualTagCount } = result;
        expect(_actualTagCount === 0);
        expect(fee === 0);
      });

      it("are computed correctly when replacing with only new tags using raw inputs", async () => {
        const rawInput = {
          targetURI: targetURI,
          tagStrings: [tagstring3, tagstring4], // replacing with two new
          recordType: "bookmark",
        };
        const result = await contracts.ETSRelayer.computeTaggingFee(rawInput, 1);

        const { 0: fee, 1: _actualTagCount } = result;
        expect(_actualTagCount === 2);
        expect(fee === BigInt(2) * taggingFee);
      });

      it("are computed correctly when replacing with new & duplicate tags using raw inputs", async () => {
        const rawInput = {
          targetURI: targetURI,
          // replacing with one duplicate and two new
          // note shuffled order
          tagStrings: [tagstring4, tagstring3, tagstring1],
          recordType: "bookmark",
        };
        const result = await contracts.ETSRelayer.computeTaggingFee(rawInput, 1);

        const { 0: fee, 1: _actualTagCount } = result;
        expect(_actualTagCount === 2);
        expect(fee === BigInt(2) * taggingFee);
      });

      it("are computed correctly when replacing with only duplicate tags using raw inputs", async () => {
        const rawInput = {
          targetURI: targetURI,
          tagStrings: [tagstring2, tagstring1], // replacing with duplicate tags
          recordType: "bookmark",
        };
        const result = await contracts.ETSRelayer.computeTaggingFee(rawInput, 1);

        const { 0: fee, 1: _actualTagCount } = result;
        expect(_actualTagCount === 0);
        expect(fee === 0);
      });
    });
  });

  describe("Cross-relayer operations", () => {
    beforeEach(async () => {
      // Create initial tagging record using first relayer
      await contracts.ETSRelayer.connect(accounts.RandomOne).applyTags(taggingRecords, {
        value: taggingFee * BigInt(2),
      });
    });

    it("attributes new tagging records to calling relayer regardless of relayer parameter", async () => {
      const newRecord = {
        targetURI: "https://newsite.com",
        tagStrings: ["#newtag1"],
        recordType: "bookmark",
        enrich: false,
      };

      // Create record through secondRelayer but try to attribute it to firstRelayer
      await contracts.secondRelayer
        .connect(accounts.RandomOne)
        .applyTagsViaRelayer([newRecord], await contracts.ETSRelayer.getAddress(), {
          value: taggingFee,
        });

      // Verify the record was created with secondRelayer as the relayer
      const taggingRecordId = await contracts.ETS.computeTaggingRecordIdFromRawInput(
        newRecord,
        await contracts.secondRelayer.getAddress(),
        accounts.RandomOne.address,
      );

      const record = await contracts.ETS.getTaggingRecordFromId(taggingRecordId);
      expect(record.relayer).to.equal(await contracts.secondRelayer.getAddress());
    });

    it("allows tagger to add tags to their record through second relayer", async () => {
      const appendRecord = {
        targetURI: targetURI,
        tagStrings: ["#newtag1"],
        recordType: "bookmark",
        enrich: false,
      };

      const tx = await contracts.secondRelayer
        .connect(accounts.RandomOne)
        .applyTagsViaRelayer([appendRecord], await contracts.ETSRelayer.getAddress(), {
          value: taggingFee,
        });

      await expect(tx).to.emit(contracts.ETS, "TaggingRecordUpdated");
    });

    it("allows tagger to replace tags through second relayer", async () => {
      const replaceRecord = {
        targetURI: targetURI,
        tagStrings: ["#replacedtag"],
        recordType: "bookmark",
        enrich: false,
      };

      const tx = await contracts.secondRelayer
        .connect(accounts.RandomOne)
        .replaceTagsViaRelayer([replaceRecord], await contracts.ETSRelayer.getAddress(), {
          value: taggingFee,
        });

      await expect(tx).to.emit(contracts.ETS, "TaggingRecordUpdated");
    });

    it("allows tagger to remove tags through second relayer", async () => {
      const removeRecord = {
        targetURI: targetURI,
        tagStrings: ["#love"],
        recordType: "bookmark",
        enrich: false,
      };

      const tx = await contracts.secondRelayer
        .connect(accounts.RandomOne)
        .removeTagsViaRelayer([removeRecord], await contracts.ETSRelayer.getAddress());

      await expect(tx).to.emit(contracts.ETS, "TaggingRecordUpdated");
    });
  });
});
