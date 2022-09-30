const {setup, getFactories} = require("./setup.js");
const {ethers, upgrades} = require("hardhat");
const {expect} = require("chai");
const {constants} = ethers;

let targetURI, targetId, taggingRecordId;

describe("ETS Core tests", function () {
  beforeEach("Setup test", async () => {
    [accounts, contracts, initSettings] = await setup();

    taggingFee = await contracts.ETS.taggingFee();
    taggingFee = taggingFee.toString();

    tagstring1 = "#Love";
    tagstring2 = "#Hate";
    tagstring3 = "#Fear";
    tagstring4 = "#Incredible";

    // Add & unpause ETSPlatform as a Publisher. Using a wallet address as a publisher
    // is only for testing all ETS core public functions that don't necessarily need to be
    // included in a proper publisher (IETSPublisher) contract
    await contracts.ETSAccessControls.connect(accounts.ETSPlatform).addPublisher(
      accounts.ETSPlatform.address,
      "ETSPlatform",
    );

    // Add the ETSPublisherV1 contract that was deployed in the setup as a Publisher.
    await contracts.ETSAccessControls.connect(accounts.ETSPlatform).addPublisher(
      contracts.ETSPublisher.address,
      "ETSPublisher",
    );

    // Mint some tags via ETSPublisher. Creator is Creator. Retained by platform.
    await contracts.ETSPublisher.connect(accounts.Creator).getOrCreateTagIds([tagstring1]);
    etsTag1 = await contracts.ETSToken.computeTagId(tagstring1);
    etsTag1 = etsTag1.toString();

    await contracts.ETSPublisher.connect(accounts.Creator).getOrCreateTagIds([tagstring2, tagstring3]);
    etsTag2 = await contracts.ETSToken.computeTagId(tagstring2);
    etsTag2 = etsTag2.toString();
    etsTag3 = await contracts.ETSToken.computeTagId(tagstring3);
    etsTag3 = etsTag3.toString();

    // Mint another tag. RandomOne is Publisher, Creator is Creator. Transferred to (owned by) RandomTwo.
    await contracts.ETSPublisher.connect(accounts.Creator).getOrCreateTagIds([tagstring4]);
    userTag1 = await contracts.ETSToken.computeTagId(tagstring4);
    userTag1 = userTag1.toString();

    await contracts.ETSToken.connect(accounts.ETSPlatform).transferFrom(
      accounts.ETSPlatform.address,
      accounts.RandomTwo.address,
      userTag1,
    );

    // Add a target to ETS.
    targetURI = "https://google.com";
    await contracts.ETSTarget.connect(accounts.RandomOne).getOrCreateTargetId(targetURI);
    expect(await contracts.ETSTarget.targetExistsByURI(targetURI)).to.be.equal(true);
    targetId = await contracts.ETSTarget.computeTargetId(targetURI);
    //targetId = targetId.toString();
  });

  describe("Valid setup", async () => {
    it("should have Access controls set to ETSAccessControls contract", async () => {
      expect(await contracts.ETS.etsAccessControls()).to.be.equal(contracts.ETSAccessControls.address);
    });
    it("should have Token set to ETSToken contract", async () => {
      expect(await contracts.ETS.etsToken()).to.be.equal(contracts.ETSToken.address);
    });
    it("should have Target set to ETSTarget contract", async () => {
      expect(await contracts.ETS.etsTarget()).to.be.equal(contracts.ETSTarget.address);
    });
    it("should have an active publisher contract (ETSPublisher)", async () => {
      expect(await contracts.ETSAccessControls.isPublisherAndNotPaused(contracts.ETSPublisher.address)).to.be.equal(
        true,
      );
    });
    it("should have a testing publisher (ETSPlatform)", async () => {
      expect(await contracts.ETSAccessControls.isPublisherAndNotPaused(accounts.ETSPlatform.address)).to.be.equal(true);
    });
  });

  describe("Setting access controls", async () => {
    it("should revert if set to zero address", async () => {
      await expect(
        contracts.ETS.connect(accounts.ETSPlatform).setAccessControls(constants.AddressZero),
      ).to.be.revertedWith("Address cannot be zero");
    });

    it("should revert if caller is not administrator", async () => {
      await expect(contracts.ETS.connect(accounts.RandomTwo).setAccessControls(accounts.RandomOne.address)).to.be
        .reverted;
    });

    it("should revert if a access controls is set to a non-access control contract", async () => {
      await expect(contracts.ETS.connect(accounts.ETSPlatform).setAccessControls(accounts.RandomTwo.address)).to.be
        .reverted;
    });

    it("should revert if caller is not set as admin in contract being set.", async () => {
      factories = await getFactories();
      const ETSAccessControlsNew = await upgrades.deployProxy(
        factories.ETSAccessControls,
        [accounts.RandomOne.address],
        {kind: "uups"},
      );

      // ETS Platform is not set as admin in access controls.
      await expect(
        contracts.ETS.connect(accounts.ETSPlatform).setAccessControls(ETSAccessControlsNew.address),
      ).to.be.revertedWith("Caller not admin in new contract");
    });

    it("should emit AccessControlsSet", async () => {
      factories = await getFactories();
      const ETSAccessControlsNew = await upgrades.deployProxy(
        factories.ETSAccessControls,
        [accounts.ETSPlatform.address],
        {kind: "uups"},
      );

      await expect(contracts.ETS.connect(accounts.ETSAdmin).setAccessControls(ETSAccessControlsNew.address))
        .to.emit(contracts.ETS, "AccessControlsSet")
        .withArgs(ETSAccessControlsNew.address);
      expect(await contracts.ETS.etsAccessControls()).to.be.equal(ETSAccessControlsNew.address);
    });
  });

  describe("Setting tagging fee", async () => {
    it("should revert if caller is not administrator", async () => {
      await expect(contracts.ETS.connect(accounts.RandomTwo).setTaggingFee(0)).to.be.reverted;
    });

    it("should emit TaggingFeeSet", async () => {
      await expect(contracts.ETS.connect(accounts.ETSPlatform).setTaggingFee(1))
        .to.emit(contracts.ETS, "TaggingFeeSet")
        .withArgs(1);

      expect(await contracts.ETS.taggingFee()).to.be.equal(1);
    });
  });

  describe("Setting tagging fee distribution percentages", async () => {
    it("should revert if caller is not administrator", async () => {
      await expect(contracts.ETS.connect(accounts.RandomTwo).setPercentages(10, 10)).to.be.reverted;
    });
    it("should revert if total percentage is over 100%", async () => {
      await expect(contracts.ETS.connect(accounts.ETSPlatform).setPercentages(60, 60)).to.be.revertedWith(
        "percentages must not be over 100",
      );
    });

    it("should emit PercentagesSet", async () => {
      await expect(contracts.ETS.connect(accounts.ETSPlatform).setPercentages(30, 30))
        .to.emit(contracts.ETS, "PercentagesSet")
        .withArgs(30, 30);

      expect(await contracts.ETS.platformPercentage()).to.be.equal(30);
      expect(await contracts.ETS.publisherPercentage()).to.be.equal(30);
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
          contracts.ETS.computeTaggingFeeFromRawInput(
            rawInput,
            contracts.ETSPublisher.address,
            accounts.RandomOne.address,
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
        const result = await contracts.ETS.computeTaggingFeeFromRawInput(
          rawInput,
          contracts.ETSPublisher.address,
          accounts.RandomOne.address,
          0,
        );

        const {0: fee, 1: tagCount} = result;
        expect(tagCount).to.be.equal(rawInput.tagStrings.length);
        expect(fee.toString()).to.be.equal((taggingFee * tagCount).toString());
      });

      it("are computed correctly with composite key inputs", async () => {
        const tagIds = [12345, 12356, 88843];
        const result = await contracts.ETS.computeTaggingFeeFromCompositeKey(
          tagIds,
          123456,
          "bookmark",
          contracts.ETSPublisher.address,
          accounts.RandomOne.address,
          0,
        );

        const {0: fee, 1: tagCount} = result;
        expect(tagCount).to.be.equal(tagIds.length);
        expect(fee.toString()).to.be.equal((taggingFee * tagCount).toString());
      });
    });

    describe("for existing tagging records", async () => {
      beforeEach("Setup test", async () => {
        // Create a tagging record, ETSPlatform is publisher, accounts.RandomOne is tagger.
        const tags = [etsTag1, etsTag2];
        await contracts.ETS.connect(accounts.ETSPlatform).applyTagsWithCompositeKey(
          tags,
          targetId,
          "bookmark",
          accounts.RandomOne.address,
          {
            value: ethers.BigNumber.from(taggingFee).mul("2"),
          },
        );

        taggingRecordId = await contracts.ETS.computeTaggingRecordIdFromCompositeKey(
          targetId,
          "bookmark",
          accounts.ETSPlatform.address,
          accounts.RandomOne.address,
        );
      });
      it("are computed correctly when applying new tags using raw inputs", async () => {
        // Estimate the cost of applying two new tags to an existing record, two of which are already in the tagging record.
        const rawInput = {
          targetURI: targetURI,
          tagStrings: [tagstring3, tagstring4], // appending two new tags
          recordType: "bookmark",
        };
        const result = await contracts.ETS.computeTaggingFeeFromRawInput(
          rawInput,
          accounts.ETSPlatform.address, // original publisher
          accounts.RandomOne.address, // original tagger
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
        const result = await contracts.ETS.computeTaggingFeeFromRawInput(
          rawInput,
          accounts.ETSPlatform.address, // original publisher
          accounts.RandomOne.address, // original tagger
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
        const result = await contracts.ETS.computeTaggingFeeFromRawInput(
          rawInput,
          accounts.ETSPlatform.address, // original publisher
          accounts.RandomOne.address, // original tagger
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
        const result = await contracts.ETS.computeTaggingFeeFromRawInput(
          rawInput,
          accounts.ETSPlatform.address, // original publisher
          accounts.RandomOne.address, // original tagger
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
        const result = await contracts.ETS.computeTaggingFeeFromRawInput(
          rawInput,
          accounts.ETSPlatform.address, // original publisher
          accounts.RandomOne.address, // original tagger
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
        const result = await contracts.ETS.computeTaggingFeeFromRawInput(
          rawInput,
          accounts.ETSPlatform.address, // original publisher
          accounts.RandomOne.address, // original tagger
          1,
        );

        const {0: fee, 1: actualTagCount} = result;
        expect(actualTagCount).to.be.equal(0);
        expect(fee.toString()).to.be.equal((0).toString());
      });
    });
  });

  describe("Creating new tagging records", async () => {
    it("should revert when caller is not an enabled Publisher", async () => {
      await expect(
        contracts.ETS.connect(accounts.RandomOne).applyTagsWithCompositeKey(
          [12345],
          12345,
          "bookmark",
          accounts.RandomOne.address,
        ),
      ).to.be.revertedWith("Caller not Publisher");
    });

    it("should revert when no tags are supplied", async () => {
      await expect(
        contracts.ETS.connect(accounts.ETSPlatform).applyTagsWithCompositeKey(
          [],
          targetId,
          "bookmark",
          accounts.RandomOne.address,
        ),
      ).to.be.revertedWith("No tags supplied");
    });

    it("should revert when record type is too long", async () => {
      await expect(
        contracts.ETS.connect(accounts.ETSPlatform).applyTagsWithCompositeKey(
          [etsTag1],
          targetId,
          "reallyReallyreallyReallyreallyReallyreallyReallyreallyReallyLongRecordType",
          accounts.RandomOne.address,
          {
            value: ethers.BigNumber.from(taggingFee).mul("1"),
          },
        ),
      ).to.be.revertedWith("Record type too long");
    });

    it("should revert when insufficient tagging fee is supplied", async () => {
      await expect(
        contracts.ETS.connect(accounts.ETSPlatform).applyTagsWithCompositeKey(
          [etsTag1, userTag1],
          targetId,
          "bookmark",
          accounts.RandomOne.address,
          {
            value: ethers.BigNumber.from(taggingFee).mul("1"),
          },
        ),
      ).to.be.revertedWith("Insufficient tagging fee supplied");
    });

    it("should emit TaggingRecordCreated when new Tagging Record is created", async () => {
      const tags = [etsTag1];
      const tx = await contracts.ETS.connect(accounts.ETSPlatform).applyTagsWithCompositeKey(
        tags,
        targetId,
        "bookmark",
        accounts.RandomOne.address,
        {
          value: ethers.BigNumber.from(taggingFee).mul("1"),
        },
      );
      await expect(tx).to.emit(contracts.ETS, "TaggingRecordCreated");
    });

    it("should not require value sent when tagging fee set to zero", async () => {
      await contracts.ETS.connect(accounts.ETSPlatform).setTaggingFee(0);
      const tags = [etsTag1];
      const tx = await contracts.ETS.connect(accounts.ETSPlatform).applyTagsWithCompositeKey(
        tags,
        targetId,
        "bookmark",
        accounts.RandomOne.address,
      );
      await expect(tx).to.emit(contracts.ETS, "TaggingRecordCreated");
    });

    it("should have the correct number of tags", async () => {
      const tags = [etsTag1, etsTag2, userTag1];
      await contracts.ETS.connect(accounts.ETSPlatform).applyTagsWithCompositeKey(
        tags,
        targetId,
        "bookmark",
        accounts.RandomOne.address,
        {
          value: ethers.BigNumber.from(taggingFee).mul("3"),
        },
      );

      const taggingRecord = await contracts.ETS.getTaggingRecordFromCompositeKey(
        targetId,
        "bookmark",
        accounts.ETSPlatform.address,
        accounts.RandomOne.address,
      );

      expect(taggingRecord.tagIds.length).to.be.equal(3);
    });
  });

  describe("Appending tags to existing tagging record", async () => {
    beforeEach("Setup test", async () => {
      const tags = [etsTag1];
      await contracts.ETS.connect(accounts.ETSPlatform).applyTagsWithCompositeKey(
        tags,
        targetId,
        "bookmark",
        accounts.RandomOne.address,
        {
          value: ethers.BigNumber.from(taggingFee).mul("1"),
        },
      );

      taggingRecordId = await contracts.ETS.computeTaggingRecordIdFromCompositeKey(
        targetId,
        "bookmark",
        accounts.ETSPlatform.address,
        accounts.RandomOne.address,
      );
    });

    describe("using tagging record raw input", async () => {
      it("should revert when insufficient tagging fee is supplied", async () => {
        // Passing in 3 tags, two of which are new, so fee should be 2x tagging fee.
        // we supply 1x.
        const rawInput = {
          targetURI: "https://google.com",
          tagStrings: ["#love", "#beatles", "#water"],
          recordType: "bookmark",
        };
        await expect(
          contracts.ETS.connect(accounts.ETSPlatform).applyTagsWithRawInput(rawInput, accounts.RandomOne.address, {
            value: ethers.BigNumber.from(taggingFee).mul("1"),
          }),
        ).to.be.revertedWith("Insufficient tagging fee supplied");
      });

      it("should emit TaggingRecordUpdated", async () => {
        const rawInput = {
          targetURI: "https://google.com",
          tagStrings: ["#love", "#beatles", "#water"], // Appending two new tags
          recordType: "bookmark",
        };
        let tx = await contracts.ETS.connect(accounts.ETSPlatform).applyTagsWithRawInput(
          rawInput,
          accounts.RandomOne.address,
          {
            value: ethers.BigNumber.from(taggingFee).mul("2"),
          },
        );

        await expect(tx).to.emit(contracts.ETS, "TaggingRecordUpdated").withArgs(taggingRecordId, 0);
      });

      it("should increase the tag count when new tag is supplied", async () => {
        let taggingRecord = await contracts.ETS.getTaggingRecordFromId(taggingRecordId);
        expect(taggingRecord.tagIds.length).to.be.equal(1);

        // Should filter out etsTag1 cause it already exists.
        const rawInput = {
          targetURI: "https://google.com",
          tagStrings: ["#love", "#beatles", "#water"], // Appending two new tags
          recordType: "bookmark",
        };
        let tx = await contracts.ETS.connect(accounts.ETSPlatform).applyTagsWithRawInput(
          rawInput,
          accounts.RandomOne.address,
          {
            value: ethers.BigNumber.from(taggingFee).mul("2"),
          },
        );
        taggingRecord = await contracts.ETS.getTaggingRecordFromId(taggingRecordId);
        expect(taggingRecord.tagIds.length).to.be.equal(3);
      });

      it("should not increase the tag count when duplicate tag is supplied", async () => {
        let taggingRecord = await contracts.ETS.getTaggingRecordFromId(taggingRecordId);
        expect(taggingRecord.tagIds.length).to.be.equal(1);

        const rawInput = {
          targetURI: "https://google.com",
          tagStrings: ["#love"], // Appending one duplicate tag
          recordType: "bookmark",
        };
        let tx = await contracts.ETS.connect(accounts.ETSPlatform).applyTagsWithRawInput(
          rawInput,
          accounts.RandomOne.address,
          {
            value: ethers.BigNumber.from(taggingFee).mul("2"),
          },
        );
        taggingRecord = await contracts.ETS.getTaggingRecordFromId(taggingRecordId);
        expect(taggingRecord.tagIds.length).to.be.equal(1);
      });
    });

    describe("using taggingRecord composite key", async () => {
      it("should revert when insufficient tagging fee is supplied", async () => {
        // Passing in 3 tags, two of which are new, so fee should be 2x tagging fee.
        // we supply 1x.
        const tags = [etsTag1, etsTag2, userTag1];
        await expect(
          contracts.ETS.connect(accounts.ETSPlatform).applyTagsWithCompositeKey(
            tags,
            targetId,
            "bookmark",
            accounts.RandomOne.address,
            {
              value: ethers.BigNumber.from(taggingFee).mul("1"),
            },
          ),
        ).to.be.revertedWith("Insufficient tagging fee supplied");
      });

      it("should emit TaggingRecordUpdated", async () => {
        let tx = await contracts.ETS.connect(accounts.ETSPlatform).applyTagsWithCompositeKey(
          [etsTag2, userTag1],
          targetId,
          "bookmark",
          accounts.RandomOne.address,
          {
            value: ethers.BigNumber.from(taggingFee).mul("2"),
          },
        );
        await expect(tx).to.emit(contracts.ETS, "TaggingRecordUpdated").withArgs(taggingRecordId, 0);
      });

      it("should increase the tag count when new tag is supplied", async () => {
        let taggingRecord = await contracts.ETS.getTaggingRecordFromId(taggingRecordId);
        expect(taggingRecord.tagIds.length).to.be.equal(1);

        // Should filter out etsTag1 cause it already exists.
        const newTags = [etsTag1, etsTag2, userTag1];
        tx = await contracts.ETS.connect(accounts.ETSPlatform).applyTagsWithCompositeKey(
          newTags,
          targetId,
          "bookmark",
          accounts.RandomOne.address,
          {
            value: ethers.BigNumber.from(taggingFee).mul("2"),
          },
        );
        taggingRecord = await contracts.ETS.getTaggingRecordFromId(taggingRecordId);
        expect(taggingRecord.tagIds.length).to.be.equal(3);
      });

      it("should not increase the tag count when duplicate tag is supplied", async () => {
        let taggingRecord = await contracts.ETS.getTaggingRecordFromId(taggingRecordId);
        expect(taggingRecord.tagIds.length).to.be.equal(1);

        const sameTag = [etsTag1];
        tx = await contracts.ETS.connect(accounts.ETSPlatform).applyTagsWithCompositeKey(
          sameTag,
          targetId,
          "bookmark",
          accounts.RandomOne.address,
          {
            value: ethers.BigNumber.from(taggingFee).mul("1"),
          },
        );
        taggingRecord = await contracts.ETS.getTaggingRecordFromId(taggingRecordId);
        expect(taggingRecord.tagIds.length).to.be.equal(1);
      });
    });

    describe("using taggingRecordId", async () => {
      it("should revert when insufficient tagging fee is supplied", async () => {
        // Passing in 3 tags, two of which are new, so fee should be 2x tagging fee.
        // we supply 1x.
        const tagsToAppend = [etsTag1, etsTag2, userTag1];
        await expect(
          contracts.ETS.connect(accounts.ETSPlatform).appendTags(taggingRecordId, tagsToAppend, {
            value: ethers.BigNumber.from(taggingFee).mul("1"),
          }),
        ).to.be.revertedWith("Insufficient tagging fee supplied");
      });

      it("can be done with taggingRecordId", async () => {
        taggingRecord = await contracts.ETS.getTaggingRecordFromId(taggingRecordId);
        expect(taggingRecord.tagIds.length).to.be.equal(1);
        const tagsToAppend = [etsTag1, etsTag2, userTag1];
        let tx = await contracts.ETS.connect(accounts.ETSPlatform).appendTags(taggingRecordId, tagsToAppend, {
          value: ethers.BigNumber.from(taggingFee).mul("2"),
        });
        //await expect(tx).to.emit(contracts.ETS, "TaggingRecordCreated");
        await expect(tx).to.emit(contracts.ETS, "TaggingRecordUpdated");
        taggingRecord = await contracts.ETS.getTaggingRecordFromId(taggingRecordId);
        expect(taggingRecord.tagIds.length).to.be.equal(3);
      });

      it("can be performed by original tagger", async () => {
        // accounts.RandomOne is original tagger.
        const tagsToAppend = [etsTag1, etsTag2, userTag1];
        let tx = await contracts.ETS.connect(accounts.RandomOne).appendTags(taggingRecordId, tagsToAppend, {
          value: ethers.BigNumber.from(taggingFee).mul("2"),
        });
        await expect(tx).to.emit(contracts.ETS, "TaggingRecordUpdated");
        taggingRecord = await contracts.ETS.getTaggingRecordFromId(taggingRecordId);
        expect(taggingRecord.tagIds.length).to.be.equal(3);
      });

      it("can be performed by original publisher", async () => {
        // accounts.ETSPlatform is original publisher.
        const tagsToAppend = [etsTag1, etsTag2, userTag1];
        let tx = await contracts.ETS.connect(accounts.ETSPlatform).appendTags(taggingRecordId, tagsToAppend, {
          value: ethers.BigNumber.from(taggingFee).mul("2"),
        });
        await expect(tx).to.emit(contracts.ETS, "TaggingRecordUpdated");
        taggingRecord = await contracts.ETS.getTaggingRecordFromId(taggingRecordId);
        expect(taggingRecord.tagIds.length).to.be.equal(3);
      });

      it("can only be performed by original publisher or tagger", async () => {
        // accounts.RandomTwo is neither original publisher or tagger.
        const tagsToAppend = [etsTag1, etsTag2, userTag1];
        await expect(
          contracts.ETS.connect(accounts.RandomTwo).appendTags(taggingRecordId, tagsToAppend, {
            value: ethers.BigNumber.from(taggingFee).mul("2"),
          }),
        ).to.be.revertedWith("Caller not authorized or record not found");
      });
    });
  });

  describe("Removing tags", async () => {
    beforeEach("Setup test", async () => {
      const tags = [etsTag1, etsTag2, etsTag3, userTag1];
      await contracts.ETS.connect(accounts.ETSPlatform).applyTagsWithCompositeKey(
        tags,
        targetId,
        "bookmark",
        accounts.RandomOne.address,
        {
          value: ethers.BigNumber.from(taggingFee).mul("4"),
        },
      );

      taggingRecordId = await contracts.ETS.computeTaggingRecordIdFromCompositeKey(
        targetId,
        "bookmark",
        accounts.ETSPlatform.address,
        accounts.RandomOne.address,
      );
    });

    describe("using taggingRecord raw input", async () => {
      it("should revert if tagging record not found", async () => {
        const rawInput = {
          targetURI: "https://google.com",
          tagStrings: ["#love", "#beatles", "#water"],
          recordType: "discovery",
        };
        await expect(
          contracts.ETS.connect(accounts.ETSPlatform).removeTagsWithRawInput(rawInput, accounts.RandomOne.address),
        ).to.be.revertedWith("Caller not authorized or record not found");
      });

      it("should revert if no tags supplied", async () => {
        const rawInput = {
          targetURI: "https://google.com",
          tagStrings: [],
          recordType: "bookmark",
        };
        await expect(
          contracts.ETS.connect(accounts.ETSPlatform).removeTagsWithRawInput(rawInput, accounts.RandomOne.address),
        ).to.be.revertedWith("No tags supplied");
      });
      it("should emit TaggingRecordUpdated", async () => {
        const rawInput = {
          targetURI: "https://google.com",
          tagStrings: ["#love", "#beatles", "#water"],
          recordType: "bookmark",
        };
        let tx = await contracts.ETS.connect(accounts.ETSPlatform).removeTagsWithRawInput(
          rawInput,
          accounts.RandomOne.address,
        );
        await expect(tx).to.emit(contracts.ETS, "TaggingRecordUpdated").withArgs(taggingRecordId, 2);
      });

      it("should emit TaggingRecordUpdated if the same tag is supplied twice", async () => {
        const rawInput = {
          targetURI: "https://google.com",
          tagStrings: ["#love", "love"],
          recordType: "bookmark",
        };
        let tx = await contracts.ETS.connect(accounts.ETSPlatform).removeTagsWithRawInput(
          rawInput,
          accounts.RandomOne.address,
        );
        await expect(tx).to.emit(contracts.ETS, "TaggingRecordUpdated");
      });

      it("can remove all tags", async () => {
        const rawInput = {
          targetURI: "https://google.com",
          tagStrings: [tagstring1, tagstring2, tagstring3, tagstring4],
          recordType: "bookmark",
        };
        let tx = await contracts.ETS.connect(accounts.ETSPlatform).removeTagsWithRawInput(
          rawInput,
          accounts.RandomOne.address,
        );
        await expect(tx).to.emit(contracts.ETS, "TaggingRecordUpdated");
        let taggingRecord = await contracts.ETS.getTaggingRecordFromId(taggingRecordId);
        expect(taggingRecord.tagIds.length).to.be.equal(0);
      });

      it("should decrease tag count by two when two tags are removed", async () => {
        let taggingRecord = await contracts.ETS.getTaggingRecordFromId(taggingRecordId);
        expect(taggingRecord.tagIds.length).to.be.equal(4);

        const rawInput = {
          targetURI: "https://google.com",
          tagStrings: [tagstring1, tagstring2],
          recordType: "bookmark",
        };
        await contracts.ETS.connect(accounts.ETSPlatform).removeTagsWithRawInput(rawInput, accounts.RandomOne.address);
        taggingRecord = await contracts.ETS.getTaggingRecordFromId(taggingRecordId);
        expect(taggingRecord.tagIds.length).to.be.equal(2);
      });

      it("should remove the correct tags", async () => {
        let taggingRecord = await contracts.ETS.getTaggingRecordFromId(taggingRecordId);
        expect(taggingRecord.tagIds.length).to.be.equal(4);

        const rawInput = {
          targetURI: "https://google.com",
          tagStrings: [tagstring4, tagstring2],
          recordType: "bookmark",
        };
        await contracts.ETS.connect(accounts.ETSPlatform).removeTagsWithRawInput(rawInput, accounts.RandomOne.address);
        taggingRecord = await contracts.ETS.getTaggingRecordFromId(taggingRecordId);
        remainingTags = [tagstring1, tagstring3];
        for (let i = 0; i < taggingRecord.tagIds; i++) {
          expect(remainingTags.includes(taggingRecord.tagIds[i])).to.be.true;
        }
      });

      it("should not revert when more tags are supplied to remove than exist on record", async () => {
        const removeTags = [tagstring1, tagstring2, tagstring3, tagstring4, tagstring2, tagstring4];
        const rawInput = {
          targetURI: "https://google.com",
          tagStrings: removeTags,
          recordType: "bookmark",
        };

        await expect(
          contracts.ETS.connect(accounts.ETSPlatform).removeTagsWithRawInput(rawInput, accounts.RandomOne.address),
        ).to.not.be.reverted;
      });

      it("should emit nothing if supplied tag is not in tagging record", async () => {
        const rawInput = {
          targetURI: "https://google.com",
          tagStrings: [tagstring1],
          recordType: "bookmark",
        };
        let tx = await contracts.ETS.connect(accounts.ETSPlatform).removeTagsWithRawInput(
          rawInput,
          accounts.RandomOne.address,
        );
        await expect(tx).to.emit(contracts.ETS, "TaggingRecordUpdated");

        // Try removing the same tag (no longer in record).
        tx = await contracts.ETS.connect(accounts.ETSPlatform).removeTagsWithRawInput(
          rawInput,
          accounts.RandomOne.address,
        );
        await expect(tx).to.not.emit(contracts.ETS, "TaggingRecordUpdated");
      });
    });

    describe("using taggingRecord composite key", async () => {
      it("should revert if tagging record not found", async () => {
        await expect(
          contracts.ETS.connect(accounts.ETSPlatform).removeTagsWithCompositeKey(
            [etsTag2],
            targetId,
            "discovery",
            accounts.RandomOne.address,
          ),
        ).to.be.revertedWith("Caller not authorized or record not found");
      });

      it("should revert if no tags supplied", async () => {
        await expect(
          contracts.ETS.connect(accounts.ETSPlatform).removeTagsWithCompositeKey(
            [],
            targetId,
            "bookmark",
            accounts.RandomOne.address,
          ),
        ).to.be.revertedWith("No tags supplied");
      });
      it("should emit TaggingRecordUpdated", async () => {
        let tx = await contracts.ETS.connect(accounts.ETSPlatform).removeTagsWithCompositeKey(
          [etsTag2],
          targetId,
          "bookmark",
          accounts.RandomOne.address,
        );
        await expect(tx).to.emit(contracts.ETS, "TaggingRecordUpdated").withArgs(taggingRecordId, 2);
      });

      it("should emit TaggingRecordUpdated if the same tag is supplied twice", async () => {
        let tx = await contracts.ETS.connect(accounts.ETSPlatform).removeTagsWithCompositeKey(
          [etsTag2, etsTag2],
          targetId,
          "bookmark",
          accounts.RandomOne.address,
        );
        await expect(tx).to.emit(contracts.ETS, "TaggingRecordUpdated");
      });

      it("can remove all tags", async () => {
        let tx = await contracts.ETS.connect(accounts.ETSPlatform).removeTagsWithCompositeKey(
          [etsTag1, etsTag2, etsTag3, userTag1],
          targetId,
          "bookmark",
          accounts.RandomOne.address,
        );
        await expect(tx).to.emit(contracts.ETS, "TaggingRecordUpdated");
      });

      it("should decrease tag count by two when two tags are removed", async () => {
        let taggingRecord = await contracts.ETS.getTaggingRecordFromId(taggingRecordId);
        expect(taggingRecord.tagIds.length).to.be.equal(4);

        const removeTags = [etsTag2, userTag1];
        await contracts.ETS.connect(accounts.ETSPlatform).removeTagsWithCompositeKey(
          removeTags,
          targetId,
          "bookmark",
          accounts.RandomOne.address,
        );
        taggingRecord = await contracts.ETS.getTaggingRecordFromId(taggingRecordId);
        expect(taggingRecord.tagIds.length).to.be.equal(2);
      });

      it("should remove the correct tags", async () => {
        let taggingRecord = await contracts.ETS.getTaggingRecordFromId(taggingRecordId);
        expect(taggingRecord.tagIds.length).to.be.equal(4);

        const removeTags = [etsTag2, userTag1];
        await contracts.ETS.connect(accounts.ETSPlatform).removeTagsWithCompositeKey(
          removeTags,
          targetId,
          "bookmark",
          accounts.RandomOne.address,
        );
        taggingRecord = await contracts.ETS.getTaggingRecordFromId(taggingRecordId);
        remainingTags = [etsTag1, etsTag3];
        for (let i = 0; i < taggingRecord.tagIds; i++) {
          expect(remainingTags.includes(taggingRecord.tagIds[i])).to.be.true;
        }
      });

      it("should not revert when more tags are supplied to remove than exist on record", async () => {
        const removeTags = [etsTag1, etsTag2, etsTag3, userTag1, etsTag2, userTag1];

        await expect(
          contracts.ETS.connect(accounts.ETSPlatform).removeTagsWithCompositeKey(
            removeTags,
            targetId,
            "bookmark",
            accounts.RandomOne.address,
          ),
        ).to.not.be.reverted;
      });

      it("should emit nothing if supplied tag is not in tagging record", async () => {
        const removeTags = [etsTag1];
        let tx = await contracts.ETS.connect(accounts.ETSPlatform).removeTagsWithCompositeKey(
          removeTags,
          targetId,
          "bookmark",
          accounts.RandomOne.address,
        );
        await expect(tx).to.emit(contracts.ETS, "TaggingRecordUpdated");

        // Try removing the same tag (no longer in record).
        tx = await contracts.ETS.connect(accounts.ETSPlatform).removeTagsWithCompositeKey(
          removeTags,
          targetId,
          "bookmark",
          accounts.RandomOne.address,
        );
        await expect(tx).to.not.emit(contracts.ETS, "TaggingRecordUpdated");
      });
    });

    describe("using taggingRecordId", async () => {
      it("can be done with taggingRecordId", async () => {
        taggingRecord = await contracts.ETS.getTaggingRecordFromId(taggingRecordId);
        expect(taggingRecord.tagIds.length).to.be.equal(4);
        let tx = await contracts.ETS.connect(accounts.ETSPlatform).removeTags(
          taggingRecordId,
          [userTag1], // Remove userTag1
        );
        //await expect(tx).to.emit(contracts.ETS, "TaggingRecordCreated");
        await expect(tx).to.emit(contracts.ETS, "TaggingRecordUpdated");
        taggingRecord = await contracts.ETS.getTaggingRecordFromId(taggingRecordId);
        expect(taggingRecord.tagIds.length).to.be.equal(3);
      });

      it("can be performed by original tagger", async () => {
        // accounts.RandomOne is original tagger.
        let tx = await contracts.ETS.connect(accounts.RandomOne).removeTags(
          taggingRecordId,
          [userTag1], // Remove userTag1
        );
        await expect(tx).to.emit(contracts.ETS, "TaggingRecordUpdated");
        taggingRecord = await contracts.ETS.getTaggingRecordFromId(taggingRecordId);
        expect(taggingRecord.tagIds.length).to.be.equal(3);
      });

      it("can be performed by original publisher", async () => {
        // accounts.RandomOne is original tagger.
        let tx = await contracts.ETS.connect(accounts.ETSPlatform).removeTags(
          taggingRecordId,
          [userTag1], // Remove userTag1
        );
        await expect(tx).to.emit(contracts.ETS, "TaggingRecordUpdated");
        taggingRecord = await contracts.ETS.getTaggingRecordFromId(taggingRecordId);
        expect(taggingRecord.tagIds.length).to.be.equal(3);
      });

      it("will revert if not original publisher or tagger", async () => {
        // accounts.RandomTwo is neither original publisher or tagger.
        await expect(
          contracts.ETS.connect(accounts.RandomTwo).removeTags(
            taggingRecordId,
            [userTag1], // Remove userTag1
          ),
        ).to.be.revertedWith("Caller not authorized or record not found");
      });
    });
  });

  describe("Replacing (overwrite) tags", async () => {
    beforeEach("Setup test", async () => {
      const tags = [etsTag1];
      await contracts.ETS.connect(accounts.ETSPlatform).applyTagsWithCompositeKey(
        tags,
        targetId,
        "bookmark",
        accounts.RandomOne.address,
        {
          value: ethers.BigNumber.from(taggingFee).mul("1"),
        },
      );

      taggingRecordId = await contracts.ETS.computeTaggingRecordIdFromCompositeKey(
        targetId,
        "bookmark",
        accounts.ETSPlatform.address,
        accounts.RandomOne.address,
      );
    });

    describe("using taggingRecord raw input", async () => {
      it("should revert when insufficient tagging fee is supplied", async () => {
        // Passing in 3 tags, two of which are new, so fee should be 2x tagging fee.
        // we supply 1x.
        const replacementRawInput = {
          targetURI: "https://google.com",
          tagStrings: ["#Love", "#Beatles", "#Water"],
          recordType: "bookmark",
        };
        await expect(
          contracts.ETS.connect(accounts.ETSPlatform).replaceTagsWithRawInput(
            replacementRawInput,
            accounts.RandomOne.address,
            {
              value: ethers.BigNumber.from(taggingFee).mul("1"),
            },
          ),
        ).to.be.revertedWith("Insufficient tagging fee supplied");
      });

      it("should revert when no tags are supplied", async () => {
        const replacementRawInput = {
          targetURI: "https://google.com",
          tagStrings: [],
          recordType: "bookmark",
        };
        await expect(
          contracts.ETS.connect(accounts.ETSPlatform).replaceTagsWithRawInput(
            replacementRawInput,
            accounts.RandomOne.address,
          ),
        ).to.be.revertedWith("No tags supplied");
      });

      it("should emit TaggingRecordUpdated", async () => {
        const replacementRawInput = {
          targetURI: "https://google.com",
          tagStrings: ["#Love", "#Beatles", "#Water"], // Two new tags
          recordType: "bookmark",
        };
        let tx = await contracts.ETS.connect(accounts.ETSPlatform).replaceTagsWithRawInput(
          replacementRawInput,
          accounts.RandomOne.address,
          {
            value: ethers.BigNumber.from(taggingFee).mul("2"),
          },
        );
        await expect(tx).to.emit(contracts.ETS, "TaggingRecordUpdated").withArgs(taggingRecordId, 0);
      });

      it("should replace rather than append", async () => {
        let taggingRecord = await contracts.ETS.getTaggingRecordFromId(taggingRecordId);
        expect(taggingRecord.tagIds.length).to.be.equal(1);

        const replacementRawInput = {
          targetURI: "https://google.com",
          tagStrings: ["#Bears", "#Beatles", "#Water"], // Replacing 1 tag with 3 new ones.
          recordType: "bookmark",
        };
        tx = await contracts.ETS.connect(accounts.ETSPlatform).replaceTagsWithRawInput(
          replacementRawInput,
          accounts.RandomOne.address,
          {
            value: ethers.BigNumber.from(taggingFee).mul("3"),
          },
        );
        taggingRecord = await contracts.ETS.getTaggingRecordFromId(taggingRecordId);
        expect(taggingRecord.tagIds.length).to.be.equal(3);

        // Should emit two events, one for removal and one for append.
        await expect(tx).to.emit(contracts.ETS, "TaggingRecordUpdated").withArgs(taggingRecordId, 0);
        await expect(tx).to.emit(contracts.ETS, "TaggingRecordUpdated").withArgs(taggingRecordId, 2);
      });

      it("should not increase the tag count when duplicate tag is supplied", async () => {
        let taggingRecord = await contracts.ETS.getTaggingRecordFromId(taggingRecordId);
        expect(taggingRecord.tagIds.length).to.be.equal(1);

        const replacementRawInput = {
          targetURI: "https://google.com",
          tagStrings: ["#Love"], // Duplicate tag
          recordType: "bookmark",
        };
        tx = await contracts.ETS.connect(accounts.ETSPlatform).replaceTagsWithRawInput(
          replacementRawInput,
          accounts.RandomOne.address,
        );
        taggingRecord = await contracts.ETS.getTaggingRecordFromId(taggingRecordId);
        expect(taggingRecord.tagIds.length).to.be.equal(1);
      });
    });

    describe("using taggingRecord composite key", async () => {
      it("should revert when insufficient tagging fee is supplied", async () => {
        // Passing in 3 tags, two of which are new, so fee should be 2x tagging fee.
        // we supply 1x.
        const tags = [etsTag1, etsTag2, userTag1];
        await expect(
          contracts.ETS.connect(accounts.ETSPlatform).replaceTagsWithCompositeKey(
            tags,
            targetId,
            "bookmark",
            accounts.RandomOne.address,
            {
              value: ethers.BigNumber.from(taggingFee).mul("1"),
            },
          ),
        ).to.be.revertedWith("Insufficient tagging fee supplied");
      });

      it("should emit TaggingRecordUpdated", async () => {
        let tx = await contracts.ETS.connect(accounts.ETSPlatform).replaceTagsWithCompositeKey(
          [etsTag2, userTag1], // remove etsTag1 and replace with etsTag2 & userTag1
          targetId,
          "bookmark",
          accounts.RandomOne.address,
          {
            value: ethers.BigNumber.from(taggingFee).mul("2"),
          },
        );
        await expect(tx).to.emit(contracts.ETS, "TaggingRecordUpdated").withArgs(taggingRecordId, 0);
        await expect(tx).to.emit(contracts.ETS, "TaggingRecordUpdated").withArgs(taggingRecordId, 2);
      });

      it("should replace rather than append", async () => {
        let taggingRecord = await contracts.ETS.getTaggingRecordFromId(taggingRecordId);
        expect(taggingRecord.tagIds.length).to.be.equal(1);

        const newTags = [etsTag2, etsTag3, userTag1]; // Replacing 1 tag with 3 new ones.
        tx = await contracts.ETS.connect(accounts.ETSPlatform).replaceTagsWithCompositeKey(
          newTags,
          targetId,
          "bookmark",
          accounts.RandomOne.address,
          {
            value: ethers.BigNumber.from(taggingFee).mul("3"),
          },
        );
        taggingRecord = await contracts.ETS.getTaggingRecordFromId(taggingRecordId);
        expect(taggingRecord.tagIds.length).to.be.equal(3);
      });

      it("should not increase the tag count when duplicate tag is supplied", async () => {
        let taggingRecord = await contracts.ETS.getTaggingRecordFromId(taggingRecordId);
        expect(taggingRecord.tagIds.length).to.be.equal(1);

        const sameTag = [etsTag1];
        tx = await contracts.ETS.connect(accounts.ETSPlatform).replaceTagsWithCompositeKey(
          sameTag,
          targetId,
          "bookmark",
          accounts.RandomOne.address,
        );
        taggingRecord = await contracts.ETS.getTaggingRecordFromId(taggingRecordId);
        expect(taggingRecord.tagIds.length).to.be.equal(1);
      });
    });

    describe("using taggingRecordId", async () => {
      it("should revert when insufficient tagging fee is supplied", async () => {
        // Passing in 3 tags, two of which are new, so fee should be 2x tagging fee.
        // we supply 1x.
        const replacementTags = [etsTag1, etsTag2, userTag1];
        await expect(
          contracts.ETS.connect(accounts.ETSPlatform).replaceTags(taggingRecordId, replacementTags, {
            value: ethers.BigNumber.from(taggingFee).mul("1"),
          }),
        ).to.be.revertedWith("Insufficient tagging fee supplied");
      });

      it("should emit TaggingRecordUpdated", async () => {
        taggingRecord = await contracts.ETS.getTaggingRecordFromId(taggingRecordId);
        expect(taggingRecord.tagIds.length).to.be.equal(1);
        const replacementTags = [etsTag2, userTag1];
        let tx = await contracts.ETS.connect(accounts.ETSPlatform).replaceTags(taggingRecordId, replacementTags, {
          value: ethers.BigNumber.from(taggingFee).mul("2"),
        });
        await expect(tx).to.emit(contracts.ETS, "TaggingRecordUpdated");
        taggingRecord = await contracts.ETS.getTaggingRecordFromId(taggingRecordId);
        expect(taggingRecord.tagIds.length).to.be.equal(2);
      });

      it("can be performed by original tagger", async () => {
        // accounts.RandomOne is original tagger.
        const replacementTags = [etsTag1, etsTag2, userTag1];
        let tx = await contracts.ETS.connect(accounts.RandomOne).replaceTags(taggingRecordId, replacementTags, {
          value: ethers.BigNumber.from(taggingFee).mul("2"),
        });
        await expect(tx).to.emit(contracts.ETS, "TaggingRecordUpdated");
        taggingRecord = await contracts.ETS.getTaggingRecordFromId(taggingRecordId);
        expect(taggingRecord.tagIds.length).to.be.equal(3);
      });

      it("can be performed by original publisher", async () => {
        // accounts.ETSPlatform is original publisher.
        const replacementTags = [etsTag1, etsTag2, userTag1];
        let tx = await contracts.ETS.connect(accounts.ETSPlatform).replaceTags(taggingRecordId, replacementTags, {
          value: ethers.BigNumber.from(taggingFee).mul("2"),
        });
        await expect(tx).to.emit(contracts.ETS, "TaggingRecordUpdated");
        taggingRecord = await contracts.ETS.getTaggingRecordFromId(taggingRecordId);
        expect(taggingRecord.tagIds.length).to.be.equal(3);
      });

      it("can only be performed by original publisher or tagger", async () => {
        // accounts.RandomTwo is neither original publisher or tagger.
        const replacementTags = [etsTag1, etsTag2, userTag1];
        await expect(
          contracts.ETS.connect(accounts.RandomTwo).replaceTags(taggingRecordId, replacementTags, {
            value: ethers.BigNumber.from(taggingFee).mul("2"),
          }),
        ).to.be.revertedWith("Caller not authorized or record not found");
      });
    });
  });

  describe("Writing a tagging record via a Publisher contract", async () => {
    it("should revert when Publisher is paused", async () => {
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
      ).to.be.revertedWith("Caller not Publisher");
    });

    it('should emit "TaggingRecordCreated" when successful', async () => {
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
      await expect(tx).to.emit(contracts.ETS, "TaggingRecordCreated");
    });
  });

  describe("A tagging record", async () => {
    beforeEach("create a tagging record", async () => {
      // First confirm there's no pre-existing tagging record for this composite key.
      let taggingRecord = await contracts.ETS.getTaggingRecordFromCompositeKey(
        targetId,
        "bookmark",
        contracts.ETSPublisher.address,
        accounts.RandomOne.address,
      );
      expect(taggingRecord.targetId).to.be.equal(0);

      // Create new tagging record.
      const tagParams = {
        targetURI: targetURI, // "https://google.com"
        tagStrings: ["#dex", "#ethereum"],
        recordType: "bookmark",
        enrich: false,
      };

      // RandomOne is tagger, ETSPlatform is publisher.
      await contracts.ETS.connect(accounts.ETSPlatform).applyTagsWithRawInput(tagParams, accounts.RandomOne.address, {
        value: ethers.BigNumber.from(taggingFee).mul("2"),
      });

      // Store tagging record Id for use in tests.
      taggingRecordId = await contracts.ETS.computeTaggingRecordIdFromCompositeKey(
        targetId,
        "bookmark",
        accounts.ETSPlatform.address,
        accounts.RandomOne.address,
      );
    });

    it("should properly record the input values", async () => {
      // check that new tagging record values are same as input values (tagParams).
      const taggingRecord = await contracts.ETS.getTaggingRecordFromId(taggingRecordId);
      expect(taggingRecord.targetId.toString()).to.be.equal(targetId);
      expect(taggingRecord.recordType).to.be.equal("bookmark");
      expect(taggingRecord.tagger).to.be.equal(accounts.RandomOne.address);
      expect(taggingRecord.publisher).to.be.equal(accounts.ETSPlatform.address);
      for (i = 0; i < taggingRecord.tagIds; i++) {
        const tag = contracts.ETSToken.getTagByString(taggingRecord.tagIds[i].toString());
        expect(tagParams.tagStrings.includes(tag.display.toString())).to.be.equal(true);
      }
    });

    it("should be retrievable by it's unique composite key", async () => {
      const taggingRecord = await contracts.ETS.getTaggingRecordFromCompositeKey(
        targetId,
        "bookmark",
        accounts.ETSPlatform.address,
        accounts.RandomOne.address,
      );

      expect(taggingRecord.targetId.toString()).to.be.equal(targetId);
    });

    it("should be retrievable by tagging record id", async () => {
      const taggingRecord = await contracts.ETS.getTaggingRecordFromId(taggingRecordId);
      expect(taggingRecord.targetId.toString()).to.be.equal(targetId);
    });

    it("will reuse existing tags and targets", async () => {
      const existingTargetId = targetId;
      const tag1Id = await contracts.ETSToken.computeTagId("#dex");
      const tag2Id = await contracts.ETSToken.computeTagId("#ethereum");
      const reusedTagIds = [tag1Id, tag2Id];

      // Create new tagging record with same inputs except with different tagger.
      // this will yield a new tagging record.
      const taggingRecordInputParams = {
        targetURI: targetURI, // "https://google.com"
        tagStrings: ["#dex", "#ethereum"],
        recordType: "bookmark",
        enrich: false,
      };
      // RandomTwo is tagger, ETSPlatform is publisher.
      await contracts.ETS.connect(accounts.ETSPlatform).applyTagsWithRawInput(
        taggingRecordInputParams,
        accounts.RandomTwo.address,
        {
          value: ethers.BigNumber.from(taggingFee).mul("2"),
        },
      );

      // Get tagging record id from composite key.
      const newTaggingRecordId = await contracts.ETS.computeTaggingRecordIdFromCompositeKey(
        existingTargetId,
        "bookmark",
        accounts.ETSPlatform.address,
        accounts.RandomTwo.address,
      );
      expect(newTaggingRecordId).to.not.be.equal(taggingRecordId);
      const newTaggingRecord = await contracts.ETS.getTaggingRecordFromId(newTaggingRecordId);
      expect(newTaggingRecord.targetId.toString()).to.be.equal(existingTargetId);
      expect(newTaggingRecord.recordType).to.be.equal("bookmark");
      expect(newTaggingRecord.tagger).to.be.equal(accounts.RandomTwo.address);
      expect(newTaggingRecord.publisher).to.be.equal(accounts.ETSPlatform.address);
      for (i = 0; i < newTaggingRecord.tagIds; i++) {
        expect(reusedTagIds.includes(newTaggingRecord.tagIds[i])).to.be.equal(true);
      }
    });
  });

  describe("Tagging fees should accrue", async () => {
    beforeEach("create a tagging record", async () => {
      platformPreTagAccrued = await contracts.ETS.accrued(accounts.ETSPlatform.address);
      publisherPreTagAccrued = await contracts.ETS.accrued(accounts.RandomOne.address);
      creatorPreTagAccrued = await contracts.ETS.accrued(accounts.Creator.address);
      ownerPreTagAccrued = await contracts.ETS.accrued(accounts.RandomTwo.address);
    });

    it("to the token creator when the tag used is platform owned (pre-auction)", async () => {
      // In this test, we are creating a tagging record using a platform owned tag (#Love). #Love already
      // exists as a Platform owned token (hasn't been auctioned yet; see the "test setup" step at the beginning
      // of this test suite.) Tagging fees are distributed to Platform (accounts.ETSPlatform), Token Publisher
      // (contracts.ETSPlatform) and Creator (accounts.Creator).
      const rawInput = {
        targetURI: "https://uniswap.org",
        tagStrings: ["#Love"],
        recordType: "bookmark",
        enrich: false,
      };

      await contracts.ETS.connect(accounts.ETSPlatform).applyTagsWithRawInput(rawInput, accounts.RandomTwo.address, {
        value: ethers.BigNumber.from(taggingFee),
      });
      // Check that tagging fee for one tag is divided up and distributed correctly.
      // Platform accrued.
      platformPostTagAccrued = await contracts.ETS.accrued(accounts.ETSPlatform.address);
      publisherPostTagAccrued = await contracts.ETS.accrued(contracts.ETSPublisher.address);
      creatorPostTagAccrued = await contracts.ETS.accrued(accounts.Creator.address);

      const platformPercentage = (await contracts.ETS.platformPercentage()) / 100;
      const publisherPercentage = (await contracts.ETS.publisherPercentage()) / 100;

      expect(platformPostTagAccrued).to.equal(platformPreTagAccrued + taggingFee * platformPercentage);

      // Publisher accrued.
      expect(publisherPostTagAccrued).to.equal(publisherPreTagAccrued + taggingFee * publisherPercentage);

      // Token creator
      expect(creatorPostTagAccrued).to.equal(
        creatorPreTagAccrued + taggingFee * (1 - (platformPercentage + publisherPercentage)),
      );
    });

    it("to the token owner when the tag used is user owned (post-auction)", async () => {
      // In this test, is the same as the previous test, except this time we are using an "owned" token.
      let rawInput = {
        targetURI: "https://uniswap.org",
        tagStrings: ["#Incredible"],
        recordType: "bookmark",
        enrich: false,
      };

      // RandomTwo is tagger, ETSPublisher is publisher.
      await contracts.ETS.connect(accounts.ETSPlatform).applyTagsWithRawInput(rawInput, accounts.RandomTwo.address, {
        value: ethers.BigNumber.from(taggingFee),
      });
      // Check that tagging fee for one tag is divided up and distributed correctly.
      // Platform accrued.
      platformPostTagAccrued = await contracts.ETS.accrued(accounts.ETSPlatform.address);
      publisherPostTagAccrued = await contracts.ETS.accrued(contracts.ETSPublisher.address);
      ownerPostTagAccrued = await contracts.ETS.accrued(accounts.RandomTwo.address);

      const platformPercentage = (await contracts.ETS.platformPercentage()) / 100;
      const publisherPercentage = (await contracts.ETS.publisherPercentage()) / 100;

      expect(platformPostTagAccrued).to.equal(platformPreTagAccrued + taggingFee * platformPercentage);

      // Publisher accrued.
      expect(publisherPostTagAccrued).to.equal(publisherPreTagAccrued + taggingFee * publisherPercentage);

      // Token creator
      expect(ownerPostTagAccrued).to.equal(
        ownerPreTagAccrued + taggingFee * (1 - (platformPercentage + publisherPercentage)),
      );
    });
  });

  describe("Drawing down", async () => {
    beforeEach(async () => {
      const rawInput = {
        targetURI: "https://uniswap.org",
        tagStrings: ["#Love"],
        recordType: "bookmark",
        enrich: false,
      };

      // RandomTwo is tagger, ETSPublisher is publisher.
      await contracts.ETS.connect(accounts.ETSPlatform).applyTagsWithRawInput(rawInput, accounts.RandomTwo.address, {
        value: ethers.BigNumber.from(taggingFee),
      });
      // Check that tagging fee for one tag is divided up and distributed correctly.
      // Platform accrued.
      platformPostTagAccrued = await contracts.ETS.accrued(accounts.ETSPlatform.address);
      publisherPostTagAccrued = await contracts.ETS.accrued(accounts.RandomOne.address);
      creatorPostTagAccrued = await contracts.ETS.accrued(accounts.Creator.address);
    });

    it("can be performed on behalf of the platform", async () => {
      // Account A can draw down accumulated funds of
      // Account B to wallet of Account B.

      const platformBalanceBefore = await accounts.ETSPlatform.getBalance();

      // accountRandomOne is triggering the drawdown of ETH accrued in
      // accounts.ETSPlatform.
      await contracts.ETS.connect(accounts.RandomOne).drawDown(accounts.ETSPlatform.address);
      const platformBalanceAfter = await accounts.ETSPlatform.getBalance();

      // In this case we are expecting the value drawn down to be the
      // platform percentage cut of one tagging event.
      expect(platformBalanceAfter.sub(platformBalanceBefore)).to.be.equal(platformPostTagAccrued);
      expect((await contracts.ETS.paid(accounts.ETSPlatform.address)) == platformBalanceAfter);
    });

    it("does nothing after a double draw down", async () => {
      const platformBalanceBefore = await accounts.ETSPlatform.getBalance();
      await contracts.ETS.connect(accounts.RandomOne).drawDown(accounts.ETSPlatform.address);
      const platformBalanceAfter = await accounts.ETSPlatform.getBalance();

      expect(platformBalanceAfter.sub(platformBalanceBefore)).to.be.equal(platformPostTagAccrued);

      const balanceBeforeSecondDraw = await accounts.ETSPlatform.getBalance();
      await contracts.ETS.connect(accounts.RandomOne).drawDown(accounts.ETSPlatform.address);
      const balanceAfterSecondDraw = await accounts.ETSPlatform.getBalance();

      expect(balanceAfterSecondDraw.sub(balanceBeforeSecondDraw)).to.be.equal("0");
    });
  });
});
