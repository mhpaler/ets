import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";
import { zeroAddress } from "viem";
import { loadIgnitionFixture } from "./fixtures/ignitionFixture.js";

describe("ETS Core tests", async () => {
  const { accounts, contracts } = await loadIgnitionFixture();
  let targetURI: string;
  let targetId: bigint;
  let taggingRecordId: bigint;
  let taggingFee: bigint;
  let etsTag1: string; // Now coin addresses instead of token IDs
  let etsTag2: string;
  let etsTag3: string;
  let userTag1: string;

  // Constants that don't change can be initialized here
  const tagstring1 = "#Love";
  const tagstring2 = "#Hate";
  const tagstring3 = "#Fear";
  const tagstring4 = "#Incredible";

  // Set up test data - this runs once at module level
  taggingFee = await contracts.ETS.read.taggingFee();

  // Create tags via ETSRelayer. Creator is Creator.
  await contracts.ETSRelayer.write.getOrCreateTagIds([[tagstring1]], { account: accounts.Creator.account });
  etsTag1 = await contracts.ETSToken.read.computeCoinAddress([tagstring1]);

  await contracts.ETSRelayer.write.getOrCreateTagIds([[tagstring2, tagstring3]], { account: accounts.Creator.account });
  etsTag2 = await contracts.ETSToken.read.computeCoinAddress([tagstring2]);
  etsTag3 = await contracts.ETSToken.read.computeCoinAddress([tagstring3]);

  // Create another tag.
  await contracts.ETSRelayer.write.getOrCreateTagIds([[tagstring4]], { account: accounts.Creator.account });
  userTag1 = await contracts.ETSToken.read.computeCoinAddress([tagstring4]);

  // Add a target to ETS.
  targetURI = "https://google.com";
  await contracts.ETSTarget.write.getOrCreateTargetId([targetURI], { account: accounts.RandomOne.account });
  assert.equal(await contracts.ETSTarget.read.targetExistsByURI([targetURI]), true);
  targetId = await contracts.ETSTarget.read.computeTargetId([targetURI]);

  describe("Valid setup", async () => {
    it("should have Access controls set to ETSAccessControls contract", async () => {
      assert.equal(
        (await contracts.ETS.read.etsAccessControls()).toLowerCase(),
        contracts.ETSAccessControls.address.toLowerCase(),
      );
    });
    it("should have Token set to ETSToken contract", async () => {
      assert.equal((await contracts.ETS.read.etsToken()).toLowerCase(), contracts.ETSToken.address.toLowerCase());
    });
    it("should have Target set to ETSTarget contract", async () => {
      assert.equal((await contracts.ETS.read.etsTarget()).toLowerCase(), contracts.ETSTarget.address.toLowerCase());
    });
    it("should have an active relayer contract (ETSRelayer)", async () => {
      assert.equal(await contracts.ETSAccessControls.read.isRelayerAndNotPaused([contracts.ETSRelayer.address]), true);
    });

    it("should have a testing relayer (ETSPlatform)", async () => {
      assert.equal(await contracts.ETSAccessControls.read.isRelayer([accounts.ETSPlatform.account.address]), true);
    });
  });

  describe("Setting access controls", async () => {
    it("should revert if set to zero address", async () => {
      try {
        await contracts.ETS.write.setAccessControls([zeroAddress], { account: accounts.ETSPlatform.account });
        assert.fail("Should have reverted");
      } catch (error: any) {
        assert.ok(error.message.includes("revert") || error.message.includes("AddressCannotBeZero"));
      }
    });

    it("should revert if caller is not administrator", async () => {
      try {
        await contracts.ETS.write.setAccessControls([accounts.RandomOne.account.address], {
          account: accounts.RandomTwo.account,
        });
        assert.fail("Should have reverted");
      } catch (error: any) {
        assert.ok(error.message.includes("revert") || error.message.includes("AccessDenied"));
      }
    });

    it("should revert if a access controls is set to a non-access control contract", async () => {
      try {
        await contracts.ETS.write.setAccessControls([accounts.RandomTwo.account.address], {
          account: accounts.ETSPlatform.account,
        });
        assert.fail("Should have reverted");
      } catch (error: any) {
        assert.ok(error.message.includes("revert"));
      }
    });

    // TODO: Complex test requiring new contract deployment - skip for now
    // it("should revert if caller is not set as admin in contract being set.", async () => {
    //   const factories = await getFactories();
    //   const ETSAccessControlsNew = await upgrades.deployProxy(
    //     factories.ETSAccessControls,
    //     [accounts.RandomOne.address],
    //     { kind: "uups" },
    //   );
    //
    //   // ETS Platform is not set as admin in access controls.
    //   await expect(
    //     contracts.ETS.connect(accounts.ETSPlatform).setAccessControls(await ETSAccessControlsNew.getAddress()),
    //   ).to.be.revertedWithCustomError(contracts.ETS, "CallerNotAdminInNewContract");
    // });

    // TODO: Complex test requiring new contract deployment - skip for now
    // it("should emit AccessControlsSet", async () => {
    //   const factories = await getFactories();
    //   const ETSAccessControlsNew = await upgrades.deployProxy(
    //     factories.ETSAccessControls,
    //     [accounts.ETSPlatform.address],
    //     { kind: "uups" },
    //   );
    //
    //   await expect(contracts.ETS.connect(accounts.ETSAdmin).setAccessControls(await ETSAccessControlsNew.getAddress()))
    //     .to.emit(contracts.ETS, "AccessControlsSet")
    //     .withArgs(await ETSAccessControlsNew.getAddress());
    //   expect(await contracts.ETS.etsAccessControls()).to.be.equal(await ETSAccessControlsNew.getAddress());
    // });
  });

  describe("Setting tagging fee", async () => {
    it("should revert if caller is not administrator", async () => {
      try {
        await contracts.ETS.write.setTaggingFee([0n], { account: accounts.RandomTwo.account });
        assert.fail("Should have reverted");
      } catch (error: any) {
        assert.ok(error.message.includes("revert") || error.message.includes("AccessDenied"));
      }
    });

    it("should emit TaggingFeeSet", async () => {
      // TODO: Event testing needs to be implemented with viem
      await contracts.ETS.write.setTaggingFee([1n], { account: accounts.ETSPlatform.account });
      // await expect(contracts.ETS.connect(accounts.ETSPlatform).setTaggingFee(1))
      //   .to.emit(contracts.ETS, "TaggingFeeSet")
      //   .withArgs(1);

      assert.equal(await contracts.ETS.read.taggingFee(), 1n);
    });
  });

  describe("Setting tagging fee distribution percentages", async () => {
    it("should revert if caller is not administrator", async () => {
      try {
        await contracts.ETS.write.setPercentages([10n, 10n], { account: accounts.RandomTwo.account });
        assert.fail("Should have reverted");
      } catch (error: any) {
        assert.ok(error.message.includes("revert") || error.message.includes("AccessDenied"));
      }
    });
    it("should revert if total percentage is over 100%", async () => {
      try {
        await contracts.ETS.write.setPercentages([60n, 60n], { account: accounts.ETSPlatform.account });
        assert.fail("Should have reverted");
      } catch (error: any) {
        assert.ok(error.message.includes("revert") || error.message.includes("PercentagesMustNotBeOver100"));
      }
    });

    it("should emit PercentagesSet", async () => {
      // TODO: Event testing needs to be implemented with viem
      await contracts.ETS.write.setPercentages([30n, 30n], { account: accounts.ETSPlatform.account });
      // await expect(contracts.ETS.connect(accounts.ETSPlatform).setPercentages(30, 30))
      //   .to.emit(contracts.ETS, "PercentagesSet")
      //   .withArgs(30, 30);

      assert.equal(await contracts.ETS.read.platformPercentage(), 30n);
      assert.equal(await contracts.ETS.read.relayerPercentage(), 30n);
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

        try {
          await contracts.ETS.read.computeTaggingFeeFromRawInput([
            rawInput,
            contracts.ETSRelayer.address,
            accounts.RandomOne.account.address,
            4, // INVALID TaggingAction
          ]);
          assert.fail("Should have reverted");
        } catch (error: any) {
          assert.ok(error.message.includes("revert"));
        }
      });

      it("are computed correctly with raw tagging record parts", async () => {
        const rawInput = {
          targetURI: "https://google.com",
          tagStrings: ["#love", "#hate"],
          recordType: "bookmark",
        };
        const result = await contracts.ETS.read.computeTaggingFeeFromRawInput([
          rawInput,
          contracts.ETSRelayer.address,
          accounts.RandomOne.account.address,
          0,
        ]);

        const [fee, tagCount] = result;
        assert.equal(tagCount, BigInt(rawInput.tagStrings.length));
        assert.equal(fee, taggingFee * tagCount);
      });
      it("are computed correctly with composite key inputs", async () => {
        // Use actual tag addresses instead of numeric IDs
        const tagAddresses = [etsTag1, etsTag2, etsTag3];
        const result = await contracts.ETS.read.computeTaggingFeeFromCompositeKey([
          tagAddresses,
          targetId,
          "bookmark",
          contracts.ETSRelayer.address,
          accounts.RandomOne.account.address,
          0,
        ]);

        const [fee, tagCount] = result;
        assert.equal(tagCount, BigInt(tagAddresses.length));
        assert.equal(fee, taggingFee * tagCount);
      });
    });

    describe("for existing tagging records", async () => {
      // Set up existing tagging record at module level
      const tags = [etsTag1, etsTag2];
      await contracts.ETS.write.applyTagsWithCompositeKey(
        [tags, targetId, "bookmark", accounts.RandomOne.account.address, accounts.ETSPlatform.account.address],
        {
          value: taggingFee * BigInt(2),
          account: accounts.ETSPlatform.account,
        },
      );

      taggingRecordId = await contracts.ETS.read.computeTaggingRecordIdFromCompositeKey([
        targetId,
        "bookmark",
        accounts.ETSPlatform.account.address,
        accounts.RandomOne.account.address,
      ]);
      it("are computed correctly when applying new tags using raw inputs", async () => {
        // Estimate the cost of applying two new tags to an existing record, two of which are already in the tagging record.
        const rawInput = {
          targetURI: targetURI,
          tagStrings: [tagstring3, tagstring4], // appending two new tags
          recordType: "bookmark",
        };
        const result = await contracts.ETS.read.computeTaggingFeeFromRawInput([
          rawInput,
          accounts.ETSPlatform.account.address, // original relayer
          accounts.RandomOne.account.address, // original tagger
          0,
        ]);

        const [fee, actualTagCount] = result;
        assert.equal(actualTagCount, BigInt(rawInput.tagStrings.length));
        assert.equal(fee, taggingFee * actualTagCount);
      });

      it("are computed correctly when applying new tags and duplicate tags using raw inputs", async () => {
        const rawInput = {
          targetURI: targetURI,
          tagStrings: [tagstring1, tagstring1, tagstring3, tagstring4], // applying two duplicate and two new
          recordType: "bookmark",
        };
        const result = await contracts.ETS.read.computeTaggingFeeFromRawInput([
          rawInput,
          accounts.ETSPlatform.account.address, // original relayer
          accounts.RandomOne.account.address, // original tagger
          0,
        ]);

        const [fee, actualTagCount] = result;
        assert.equal(actualTagCount, 2n);
        assert.equal(fee, taggingFee * actualTagCount);
      });
      it("are computed correctly when applying only duplicate tags using raw inputs", async () => {
        const rawInput = {
          targetURI: targetURI,
          tagStrings: [tagstring1, tagstring1], // applying two duplicate tags
          recordType: "bookmark",
        };
        const result = await contracts.ETS.read.computeTaggingFeeFromRawInput([
          rawInput,
          accounts.ETSPlatform.account.address, // original relayer
          accounts.RandomOne.account.address, // original tagger
          0,
        ]);

        const [fee, actualTagCount] = result;
        assert.equal(actualTagCount, 0n);
        assert.equal(fee, 0n);
      });
      it("are computed correctly when replacing with only new tags using raw inputs", async () => {
        const rawInput = {
          targetURI: targetURI,
          tagStrings: [tagstring3, tagstring4], // replacing with two new
          recordType: "bookmark",
        };
        const result = await contracts.ETS.read.computeTaggingFeeFromRawInput([
          rawInput,
          accounts.ETSPlatform.account.address, // original relayer
          accounts.RandomOne.account.address, // original tagger
          1,
        ]);

        const [fee, actualTagCount] = result;
        assert.equal(actualTagCount, 2n);
        assert.equal(fee, taggingFee * 2n);
      });
      it("are computed correctly when replacing with new & duplicate tags using raw inputs", async () => {
        const rawInput = {
          targetURI: targetURI,
          // replacing with one duplicate and two new
          // note shuffled order
          tagStrings: [tagstring4, tagstring3, tagstring1],
          recordType: "bookmark",
        };
        const result = await contracts.ETS.read.computeTaggingFeeFromRawInput([
          rawInput,
          accounts.ETSPlatform.account.address, // original relayer
          accounts.RandomOne.account.address, // original tagger
          1,
        ]);

        const [fee, actualTagCount] = result;
        assert.equal(actualTagCount, 2n);
        assert.equal(fee, 2n * taggingFee);
      });
      it("are computed correctly when replacing with only duplicate tags using raw inputs", async () => {
        const rawInput = {
          targetURI: targetURI,
          tagStrings: [tagstring2, tagstring1], // replacing with duplicate tags
          recordType: "bookmark",
        };
        const result = await contracts.ETS.read.computeTaggingFeeFromRawInput([
          rawInput,
          accounts.ETSPlatform.account.address, // original relayer
          accounts.RandomOne.account.address, // original tagger
          1,
        ]);

        const [fee, actualTagCount] = result;
        assert.equal(actualTagCount, 0n);
        assert.equal(fee, 0n);
      });
    });
  });

  describe("Creating new tagging records", async () => {
    it("should revert when non-relayer calls applyTagsWithRawInput", async () => {
      const rawInput = {
        targetURI: "https://google.com",
        tagStrings: ["#love"],
        recordType: "bookmark",
      };
      try {
        await contracts.ETS.write.applyTagsWithRawInput(
          [rawInput, accounts.RandomOne.account.address, accounts.ETSPlatform.account.address],
          { account: accounts.RandomOne.account },
        );
        assert.fail("Should have reverted");
      } catch (error: any) {
        assert.ok(error.message.includes("revert") || error.message.includes("CallerNotRelayer"));
      }
    });

    it("should revert when caller is not an enabled Relayer", async () => {
      try {
        await contracts.ETS.write.applyTagsWithCompositeKey(
          [[etsTag1], targetId, "bookmark", accounts.RandomOne.account.address, accounts.ETSPlatform.account.address],
          { account: accounts.RandomOne.account },
        );
        assert.fail("Should have reverted");
      } catch (error: any) {
        assert.ok(error.message.includes("revert") || error.message.includes("CallerNotRelayer"));
      }
    });

    it("should revert when no tags are supplied", async () => {
      try {
        await contracts.ETS.write.applyTagsWithCompositeKey(
          [[], targetId, "bookmark", accounts.RandomOne.account.address, accounts.ETSPlatform.account.address],
          { account: accounts.ETSPlatform.account },
        );
        assert.fail("Should have reverted");
      } catch (error: any) {
        assert.ok(error.message.includes("revert") || error.message.includes("NoTagsSupplied"));
      }
    });

    it("should revert when record type is too long", async () => {
      await expect(
        contracts.ETS.connect(accounts.ETSPlatform).applyTagsWithCompositeKey(
          [etsTag1],
          targetId,
          "reallyReallyreallyReallyreallyReallyreallyReallyreallyReallyLongRecordType",
          accounts.RandomOne.address,
          accounts.ETSPlatform.address,
          {
            value: taggingFee,
          },
        ),
      ).to.be.revertedWithCustomError(contracts.ETS, "RecordTypeTooLong");
    });

    it("should revert when insufficient tagging fee is supplied", async () => {
      await expect(
        contracts.ETS.connect(accounts.ETSPlatform).applyTagsWithCompositeKey(
          [etsTag1, userTag1],
          targetId,
          "bookmark",
          accounts.RandomOne.address,
          accounts.ETSPlatform.address,
          {
            value: taggingFee,
          },
        ),
      ).to.be.revertedWithCustomError(contracts.ETS, "WrongFeeSupplied");
    });

    it("should emit TaggingRecordCreated when new Tagging Record is created", async () => {
      const tags = [etsTag1];
      const tx = await contracts.ETS.connect(accounts.ETSPlatform).applyTagsWithCompositeKey(
        tags,
        targetId,
        "bookmark",
        accounts.RandomOne.address,
        accounts.ETSPlatform.address,
        {
          value: taggingFee,
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
        accounts.ETSPlatform.address,
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
        accounts.ETSPlatform.address,
        {
          value: taggingFee * BigInt(3),
        },
      );

      const taggingRecord = await contracts.ETS.getTaggingRecordFromCompositeKey(
        targetId,
        "bookmark",
        accounts.ETSPlatform.address,
        accounts.RandomOne.address,
      );

      expect(taggingRecord.coinAddresses.length).to.be.equal(3);
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
        accounts.ETSPlatform.address,
        {
          value: taggingFee,
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
          contracts.ETS.connect(accounts.ETSPlatform).applyTagsWithRawInput(
            rawInput,
            accounts.RandomOne.address,
            accounts.ETSPlatform.address,
            {
              value: taggingFee,
            },
          ),
        ).to.be.revertedWithCustomError(contracts.ETS, "WrongFeeSupplied");
      });

      it("should emit TaggingRecordUpdated", async () => {
        const rawInput = {
          targetURI: "https://google.com",
          tagStrings: ["#love", "#beatles", "#water"], // Appending two new tags
          recordType: "bookmark",
        };
        const tx = await contracts.ETS.connect(accounts.ETSPlatform).applyTagsWithRawInput(
          rawInput,
          accounts.RandomOne.address,
          accounts.ETSPlatform.address,
          {
            value: taggingFee * BigInt(2),
          },
        );

        await expect(tx).to.emit(contracts.ETS, "TaggingRecordUpdated").withArgs(taggingRecordId, 0);
      });

      it("should increase the tag count when new tag is supplied", async () => {
        let taggingRecord = await contracts.ETS.getTaggingRecordFromId(taggingRecordId);
        expect(taggingRecord.coinAddresses.length).to.be.equal(1);

        // Should filter out etsTag1 cause it already exists.
        const rawInput = {
          targetURI: "https://google.com",
          tagStrings: ["#love", "#beatles", "#water"], // Appending two new tags
          recordType: "bookmark",
        };
        const _tx = await contracts.ETS.connect(accounts.ETSPlatform).applyTagsWithRawInput(
          rawInput,
          accounts.RandomOne.address,
          accounts.ETSPlatform.address,
          {
            value: taggingFee * BigInt(2),
          },
        );
        taggingRecord = await contracts.ETS.getTaggingRecordFromId(taggingRecordId);
        expect(taggingRecord.coinAddresses.length).to.be.equal(3);
      });

      it("should not increase the tag count when duplicate tag is supplied", async () => {
        let taggingRecord = await contracts.ETS.getTaggingRecordFromId(taggingRecordId);
        expect(taggingRecord.coinAddresses.length).to.be.equal(1);

        const rawInput = {
          targetURI: "https://google.com",
          tagStrings: ["#love"], // Appending one duplicate tag
          recordType: "bookmark",
        };
        const _tx = await contracts.ETS.connect(accounts.ETSPlatform).applyTagsWithRawInput(
          rawInput,
          accounts.RandomOne.address,
          accounts.ETSPlatform.address,
          {
            value: taggingFee * BigInt(2),
          },
        );
        taggingRecord = await contracts.ETS.getTaggingRecordFromId(taggingRecordId);
        expect(taggingRecord.coinAddresses.length).to.be.equal(1);
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
            accounts.ETSPlatform.address,
            {
              value: taggingFee,
            },
          ),
        ).to.be.revertedWithCustomError(contracts.ETS, "WrongFeeSupplied");
      });

      it("should emit TaggingRecordUpdated", async () => {
        const tx = await contracts.ETS.connect(accounts.ETSPlatform).applyTagsWithCompositeKey(
          [etsTag2, userTag1],
          targetId,
          "bookmark",
          accounts.RandomOne.address,
          accounts.ETSPlatform.address,
          {
            value: taggingFee * BigInt(2),
          },
        );
        await expect(tx).to.emit(contracts.ETS, "TaggingRecordUpdated").withArgs(taggingRecordId, 0);
      });

      it("should increase the tag count when new tag is supplied", async () => {
        let taggingRecord = await contracts.ETS.getTaggingRecordFromId(taggingRecordId);
        expect(taggingRecord.coinAddresses.length).to.be.equal(1);

        // Should filter out etsTag1 cause it already exists.
        const newTags = [etsTag1, etsTag2, userTag1];
        const _tx = await contracts.ETS.connect(accounts.ETSPlatform).applyTagsWithCompositeKey(
          newTags,
          targetId,
          "bookmark",
          accounts.RandomOne.address,
          accounts.ETSPlatform.address,
          {
            value: taggingFee * BigInt(2),
          },
        );
        taggingRecord = await contracts.ETS.getTaggingRecordFromId(taggingRecordId);
        expect(taggingRecord.coinAddresses.length).to.be.equal(3);
      });

      it("should not increase the tag count when duplicate tag is supplied", async () => {
        let taggingRecord = await contracts.ETS.getTaggingRecordFromId(taggingRecordId);
        expect(taggingRecord.coinAddresses.length).to.be.equal(1);

        const sameTag = [etsTag1];
        const _tx = await contracts.ETS.connect(accounts.ETSPlatform).applyTagsWithCompositeKey(
          sameTag,
          targetId,
          "bookmark",
          accounts.RandomOne.address,
          accounts.ETSPlatform.address,
          {
            value: taggingFee,
          },
        );
        taggingRecord = await contracts.ETS.getTaggingRecordFromId(taggingRecordId);
        expect(taggingRecord.coinAddresses.length).to.be.equal(1);
      });
    });

    describe("using taggingRecordId", async () => {
      it("should revert when insufficient tagging fee is supplied", async () => {
        // Passing in 3 tags, two of which are new, so fee should be 2x tagging fee.
        // we supply 1x.
        const tagsToAppend = [etsTag1, etsTag2, userTag1];
        await expect(
          contracts.ETS.connect(accounts.ETSPlatform).appendTags(
            taggingRecordId,
            tagsToAppend,
            accounts.RandomOne.address,
            {
              value: taggingFee,
            },
          ),
        ).to.be.revertedWithCustomError(contracts.ETS, "WrongFeeSupplied");
      });

      it("can be done with taggingRecordId", async () => {
        let taggingRecord = await contracts.ETS.getTaggingRecordFromId(taggingRecordId);
        expect(taggingRecord.coinAddresses.length).to.be.equal(1);
        const tagsToAppend = [etsTag1, etsTag2, userTag1];
        const tx = await contracts.ETS.connect(accounts.ETSPlatform).appendTags(
          taggingRecordId,
          tagsToAppend,
          accounts.RandomOne.address,
          {
            value: taggingFee * BigInt(2),
          },
        );
        //await expect(tx).to.emit(contracts.ETS, "TaggingRecordCreated");
        await expect(tx).to.emit(contracts.ETS, "TaggingRecordUpdated");
        taggingRecord = await contracts.ETS.getTaggingRecordFromId(taggingRecordId);
        expect(taggingRecord.coinAddresses.length).to.be.equal(3);
      });

      it("can be performed by original tagger", async () => {
        // accounts.RandomOne is original tagger.
        const tagsToAppend = [etsTag1, etsTag2, userTag1];
        const tx = await contracts.ETS.connect(accounts.ETSPlatform).appendTags(
          taggingRecordId,
          tagsToAppend,
          accounts.RandomOne.address,
          {
            value: taggingFee * BigInt(2),
          },
        );
        await expect(tx).to.emit(contracts.ETS, "TaggingRecordUpdated");
        const taggingRecord = await contracts.ETS.getTaggingRecordFromId(taggingRecordId);
        expect(taggingRecord.coinAddresses.length).to.be.equal(3);
      });

      it("must be performed by the original tagger", async () => {
        const tagsToAppend = [etsTag1, etsTag2, userTag1];
        await expect(
          contracts.ETS.connect(accounts.ETSPlatform).appendTags(
            taggingRecordId,
            tagsToAppend,
            accounts.RandomTwo.address, // different tagger
            {
              value: taggingFee * BigInt(2),
            },
          ),
        ).to.be.revertedWithCustomError(contracts.ETS, "NotAuthorized");
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
        accounts.ETSPlatform.address,
        {
          value: taggingFee * BigInt(4),
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
          contracts.ETS.connect(accounts.ETSPlatform).removeTagsWithRawInput(
            rawInput,
            accounts.RandomOne.address,
            accounts.ETSPlatform.address,
          ),
        ).to.be.revertedWithCustomError(contracts.ETS, "NotAuthorized");
      });

      it("should revert if no tags supplied", async () => {
        const rawInput = {
          targetURI: "https://google.com",
          tagStrings: [],
          recordType: "bookmark",
        };
        await expect(
          contracts.ETS.connect(accounts.ETSPlatform).removeTagsWithRawInput(
            rawInput,
            accounts.RandomOne.address,
            accounts.ETSPlatform.address,
          ),
        ).to.be.revertedWithCustomError(contracts.ETS, "NoTagsSupplied");
      });
      it("should emit TaggingRecordUpdated", async () => {
        const rawInput = {
          targetURI: "https://google.com",
          tagStrings: ["#love", "#beatles", "#water"],
          recordType: "bookmark",
        };
        const tx = await contracts.ETS.connect(accounts.ETSPlatform).removeTagsWithRawInput(
          rawInput,
          accounts.RandomOne.address,
          accounts.ETSPlatform.address,
        );
        await expect(tx).to.emit(contracts.ETS, "TaggingRecordUpdated").withArgs(taggingRecordId, 2);
      });

      it("should emit TaggingRecordUpdated if the same tag is supplied twice", async () => {
        const rawInput = {
          targetURI: "https://google.com",
          tagStrings: ["#love", "love"],
          recordType: "bookmark",
        };
        const tx = await contracts.ETS.connect(accounts.ETSPlatform).removeTagsWithRawInput(
          rawInput,
          accounts.RandomOne.address,
          accounts.ETSPlatform.address,
        );
        await expect(tx).to.emit(contracts.ETS, "TaggingRecordUpdated");
      });

      it("can remove all tags", async () => {
        const rawInput = {
          targetURI: "https://google.com",
          tagStrings: [tagstring1, tagstring2, tagstring3, tagstring4],
          recordType: "bookmark",
        };
        const tx = await contracts.ETS.connect(accounts.ETSPlatform).removeTagsWithRawInput(
          rawInput,
          accounts.RandomOne.address,
          accounts.ETSPlatform.address,
        );
        await expect(tx).to.emit(contracts.ETS, "TaggingRecordUpdated");
        const taggingRecord = await contracts.ETS.getTaggingRecordFromId(taggingRecordId);
        expect(taggingRecord.coinAddresses.length).to.be.equal(0);
      });

      it("should decrease tag count by two when two tags are removed", async () => {
        let taggingRecord = await contracts.ETS.getTaggingRecordFromId(taggingRecordId);
        expect(taggingRecord.coinAddresses.length).to.be.equal(4);

        const rawInput = {
          targetURI: "https://google.com",
          tagStrings: [tagstring1, tagstring2],
          recordType: "bookmark",
        };
        await contracts.ETS.connect(accounts.ETSPlatform).removeTagsWithRawInput(
          rawInput,
          accounts.RandomOne.address,
          accounts.ETSPlatform.address,
        );
        taggingRecord = await contracts.ETS.getTaggingRecordFromId(taggingRecordId);
        expect(taggingRecord.coinAddresses.length).to.be.equal(2);
      });

      it("should remove the correct tags", async () => {
        let taggingRecord = await contracts.ETS.getTaggingRecordFromId(taggingRecordId);
        expect(taggingRecord.coinAddresses.length).to.be.equal(4);

        const rawInput = {
          targetURI: "https://google.com",
          tagStrings: [tagstring4, tagstring2],
          recordType: "bookmark",
        };
        await contracts.ETS.connect(accounts.ETSPlatform).removeTagsWithRawInput(
          rawInput,
          accounts.RandomOne.address,
          accounts.ETSPlatform.address,
        );
        taggingRecord = await contracts.ETS.getTaggingRecordFromId(taggingRecordId);
        const remainingTags = [etsTag1, etsTag3];
        for (let i = 0; i < taggingRecord.coinAddresses.length; i++) {
          expect(remainingTags.includes(taggingRecord.coinAddresses[i])).to.be.true;
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
          contracts.ETS.connect(accounts.ETSPlatform).removeTagsWithRawInput(
            rawInput,
            accounts.RandomOne.address,
            accounts.ETSPlatform.address,
          ),
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
          accounts.ETSPlatform.address,
        );
        await expect(tx).to.emit(contracts.ETS, "TaggingRecordUpdated");

        // Try removing the same tag (no longer in record).
        tx = await contracts.ETS.connect(accounts.ETSPlatform).removeTagsWithRawInput(
          rawInput,
          accounts.RandomOne.address,
          accounts.ETSPlatform.address,
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
            accounts.ETSPlatform.address,
          ),
        ).to.be.revertedWithCustomError(contracts.ETS, "NotAuthorized");
      });

      it("should revert if no tags supplied", async () => {
        await expect(
          contracts.ETS.connect(accounts.ETSPlatform).removeTagsWithCompositeKey(
            [],
            targetId,
            "bookmark",
            accounts.RandomOne.address,
            accounts.ETSPlatform.address,
          ),
        ).to.be.revertedWithCustomError(contracts.ETS, "NoTagsSupplied");
      });
      it("should emit TaggingRecordUpdated", async () => {
        const tx = await contracts.ETS.connect(accounts.ETSPlatform).removeTagsWithCompositeKey(
          [etsTag2],
          targetId,
          "bookmark",
          accounts.RandomOne.address,
          accounts.ETSPlatform.address,
        );
        await expect(tx).to.emit(contracts.ETS, "TaggingRecordUpdated").withArgs(taggingRecordId, 2);
      });

      it("should emit TaggingRecordUpdated if the same tag is supplied twice", async () => {
        const tx = await contracts.ETS.connect(accounts.ETSPlatform).removeTagsWithCompositeKey(
          [etsTag2, etsTag2],
          targetId,
          "bookmark",
          accounts.RandomOne.address,
          accounts.ETSPlatform.address,
        );
        await expect(tx).to.emit(contracts.ETS, "TaggingRecordUpdated");
      });

      it("can remove all tags", async () => {
        const tx = await contracts.ETS.connect(accounts.ETSPlatform).removeTagsWithCompositeKey(
          [etsTag1, etsTag2, etsTag3, userTag1],
          targetId,
          "bookmark",
          accounts.RandomOne.address,
          accounts.ETSPlatform.address,
        );
        await expect(tx).to.emit(contracts.ETS, "TaggingRecordUpdated");
      });

      it("should decrease tag count by two when two tags are removed", async () => {
        let taggingRecord = await contracts.ETS.getTaggingRecordFromId(taggingRecordId);
        expect(taggingRecord.coinAddresses.length).to.be.equal(4);

        const removeTags = [etsTag2, userTag1];
        await contracts.ETS.connect(accounts.ETSPlatform).removeTagsWithCompositeKey(
          removeTags,
          targetId,
          "bookmark",
          accounts.RandomOne.address,
          accounts.ETSPlatform.address,
        );
        taggingRecord = await contracts.ETS.getTaggingRecordFromId(taggingRecordId);
        expect(taggingRecord.coinAddresses.length).to.be.equal(2);
      });

      it("should remove the correct tags", async () => {
        let taggingRecord = await contracts.ETS.getTaggingRecordFromId(taggingRecordId);
        expect(taggingRecord.coinAddresses.length).to.be.equal(4);

        const removeTags = [etsTag2, userTag1];
        await contracts.ETS.connect(accounts.ETSPlatform).removeTagsWithCompositeKey(
          removeTags,
          targetId,
          "bookmark",
          accounts.RandomOne.address,
          accounts.ETSPlatform.address,
        );
        taggingRecord = await contracts.ETS.getTaggingRecordFromId(taggingRecordId);
        const remainingTags = [etsTag1, etsTag3];
        for (let i = 0; i < taggingRecord.coinAddresses.length; i++) {
          expect(remainingTags.includes(taggingRecord.coinAddresses[i])).to.be.true;
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
            accounts.ETSPlatform.address,
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
          accounts.ETSPlatform.address,
        );
        await expect(tx).to.emit(contracts.ETS, "TaggingRecordUpdated");

        // Try removing the same tag (no longer in record).
        tx = await contracts.ETS.connect(accounts.ETSPlatform).removeTagsWithCompositeKey(
          removeTags,
          targetId,
          "bookmark",
          accounts.RandomOne.address,
          accounts.ETSPlatform.address,
        );
        await expect(tx).to.not.emit(contracts.ETS, "TaggingRecordUpdated");
      });
    });

    describe("using taggingRecordId", async () => {
      it("can be done with taggingRecordId", async () => {
        let taggingRecord = await contracts.ETS.getTaggingRecordFromId(taggingRecordId);
        expect(taggingRecord.coinAddresses.length).to.be.equal(4);
        const tx = await contracts.ETS.connect(accounts.ETSPlatform).removeTags(
          taggingRecordId,
          [userTag1], // Remove userTag1
          accounts.RandomOne.address,
        );
        //await expect(tx).to.emit(contracts.ETS, "TaggingRecordCreated");
        await expect(tx).to.emit(contracts.ETS, "TaggingRecordUpdated");
        taggingRecord = await contracts.ETS.getTaggingRecordFromId(taggingRecordId);
        expect(taggingRecord.coinAddresses.length).to.be.equal(3);
      });

      it("can be performed by original tagger", async () => {
        // accounts.RandomOne is original tagger.
        const tx = await contracts.ETS.connect(accounts.ETSPlatform).removeTags(
          taggingRecordId,
          [userTag1], // Remove userTag1
          accounts.RandomOne.address,
        );
        await expect(tx).to.emit(contracts.ETS, "TaggingRecordUpdated");
        const taggingRecord = await contracts.ETS.getTaggingRecordFromId(taggingRecordId);
        expect(taggingRecord.coinAddresses.length).to.be.equal(3);
      });

      it("must be performed by original tagger", async () => {
        await expect(
          contracts.ETS.connect(accounts.ETSPlatform).removeTags(
            taggingRecordId,
            [userTag1],
            accounts.RandomTwo.address, // Different tagger
          ),
        ).to.be.revertedWithCustomError(contracts.ETS, "NotAuthorized");
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
        accounts.ETSPlatform.address,
        {
          value: taggingFee,
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
            accounts.ETSPlatform.address,
            {
              value: taggingFee,
            },
          ),
        ).to.be.revertedWithCustomError(contracts.ETS, "WrongFeeSupplied");
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
            accounts.ETSPlatform.address,
          ),
        ).to.be.revertedWithCustomError(contracts.ETS, "NoTagsSupplied");
      });

      it("should emit TaggingRecordUpdated", async () => {
        const replacementRawInput = {
          targetURI: "https://google.com",
          tagStrings: ["#Love", "#Beatles", "#Water"], // Two new tags
          recordType: "bookmark",
        };
        const tx = await contracts.ETS.connect(accounts.ETSPlatform).replaceTagsWithRawInput(
          replacementRawInput,
          accounts.RandomOne.address,
          accounts.ETSPlatform.address,
          {
            value: taggingFee * BigInt(2),
          },
        );
        await expect(tx).to.emit(contracts.ETS, "TaggingRecordUpdated").withArgs(taggingRecordId, 0);
      });

      it("should replace rather than append", async () => {
        let taggingRecord = await contracts.ETS.getTaggingRecordFromId(taggingRecordId);
        expect(taggingRecord.coinAddresses.length).to.be.equal(1);

        const replacementRawInput = {
          targetURI: "https://google.com",
          tagStrings: ["#Bears", "#Beatles", "#Water"], // Replacing 1 tag with 3 new ones.
          recordType: "bookmark",
        };
        const tx = await contracts.ETS.connect(accounts.ETSPlatform).replaceTagsWithRawInput(
          replacementRawInput,
          accounts.RandomOne.address,
          accounts.ETSPlatform.address,
          {
            value: taggingFee * BigInt(3),
          },
        );
        taggingRecord = await contracts.ETS.getTaggingRecordFromId(taggingRecordId);
        expect(taggingRecord.coinAddresses.length).to.be.equal(3);

        // Should emit two events, one for removal and one for append.
        await expect(tx).to.emit(contracts.ETS, "TaggingRecordUpdated").withArgs(taggingRecordId, 0);
        await expect(tx).to.emit(contracts.ETS, "TaggingRecordUpdated").withArgs(taggingRecordId, 2);
      });

      it("should not increase the tag count when duplicate tag is supplied", async () => {
        let taggingRecord = await contracts.ETS.getTaggingRecordFromId(taggingRecordId);
        expect(taggingRecord.coinAddresses.length).to.be.equal(1);

        const replacementRawInput = {
          targetURI: "https://google.com",
          tagStrings: ["#Love"], // Duplicate tag
          recordType: "bookmark",
        };
        const _tx = await contracts.ETS.connect(accounts.ETSPlatform).replaceTagsWithRawInput(
          replacementRawInput,
          accounts.RandomOne.address,
          accounts.ETSPlatform.address,
        );
        taggingRecord = await contracts.ETS.getTaggingRecordFromId(taggingRecordId);
        expect(taggingRecord.coinAddresses.length).to.be.equal(1);
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
            accounts.ETSPlatform.address,
            {
              value: taggingFee,
            },
          ),
        ).to.be.revertedWithCustomError(contracts.ETS, "WrongFeeSupplied");
      });

      it("should emit TaggingRecordUpdated", async () => {
        const tx = await contracts.ETS.connect(accounts.ETSPlatform).replaceTagsWithCompositeKey(
          [etsTag2, userTag1], // remove etsTag1 and replace with etsTag2 & userTag1
          targetId,
          "bookmark",
          accounts.RandomOne.address,
          accounts.ETSPlatform.address,
          {
            value: taggingFee * BigInt(2),
          },
        );
        await expect(tx).to.emit(contracts.ETS, "TaggingRecordUpdated").withArgs(taggingRecordId, 0);
        await expect(tx).to.emit(contracts.ETS, "TaggingRecordUpdated").withArgs(taggingRecordId, 2);
      });

      it("should replace rather than append", async () => {
        let taggingRecord = await contracts.ETS.getTaggingRecordFromId(taggingRecordId);
        expect(taggingRecord.coinAddresses.length).to.be.equal(1);

        const newTags = [etsTag2, etsTag3, userTag1]; // Replacing 1 tag with 3 new ones.
        const _tx = await contracts.ETS.connect(accounts.ETSPlatform).replaceTagsWithCompositeKey(
          newTags,
          targetId,
          "bookmark",
          accounts.RandomOne.address,
          accounts.ETSPlatform.address,
          {
            value: taggingFee * BigInt(3),
          },
        );
        taggingRecord = await contracts.ETS.getTaggingRecordFromId(taggingRecordId);
        expect(taggingRecord.coinAddresses.length).to.be.equal(3);
      });

      it("should not increase the tag count when duplicate tag is supplied", async () => {
        let taggingRecord = await contracts.ETS.getTaggingRecordFromId(taggingRecordId);
        expect(taggingRecord.coinAddresses.length).to.be.equal(1);

        const sameTag = [etsTag1];
        const _tx = await contracts.ETS.connect(accounts.ETSPlatform).replaceTagsWithCompositeKey(
          sameTag,
          targetId,
          "bookmark",
          accounts.RandomOne.address,
          accounts.ETSPlatform.address,
        );
        taggingRecord = await contracts.ETS.getTaggingRecordFromId(taggingRecordId);
        expect(taggingRecord.coinAddresses.length).to.be.equal(1);
      });
    });

    describe("using taggingRecordId", async () => {
      it("should revert when insufficient tagging fee is supplied", async () => {
        // Passing in 3 tags, two of which are new, so fee should be 2x tagging fee.
        // we supply 1x.
        const replacementTags = [etsTag1, etsTag2, userTag1];
        await expect(
          contracts.ETS.connect(accounts.ETSPlatform).replaceTags(
            taggingRecordId,
            replacementTags,
            accounts.RandomOne.address,
            {
              value: taggingFee,
            },
          ),
        ).to.be.revertedWithCustomError(contracts.ETS, "WrongFeeSupplied");
      });

      it("should emit TaggingRecordUpdated", async () => {
        let taggingRecord = await contracts.ETS.getTaggingRecordFromId(taggingRecordId);
        expect(taggingRecord.coinAddresses.length).to.be.equal(1);
        const replacementTags = [etsTag2, userTag1];
        const tx = await contracts.ETS.connect(accounts.ETSPlatform).replaceTags(
          taggingRecordId,
          replacementTags,
          accounts.RandomOne.address,
          {
            value: taggingFee * BigInt(2),
          },
        );
        await expect(tx).to.emit(contracts.ETS, "TaggingRecordUpdated");
        taggingRecord = await contracts.ETS.getTaggingRecordFromId(taggingRecordId);
        expect(taggingRecord.coinAddresses.length).to.be.equal(2);
      });

      it("can be performed by original tagger", async () => {
        // accounts.RandomOne is original tagger.
        const replacementTags = [etsTag1, etsTag2, userTag1];
        const tx = await contracts.ETS.connect(accounts.ETSPlatform).replaceTags(
          taggingRecordId,
          replacementTags,
          accounts.RandomOne.address,
          {
            value: taggingFee * BigInt(2),
          },
        );
        await expect(tx).to.emit(contracts.ETS, "TaggingRecordUpdated");
        const taggingRecord = await contracts.ETS.getTaggingRecordFromId(taggingRecordId);
        expect(taggingRecord.coinAddresses.length).to.be.equal(3);
      });

      it("must be performed by original tagger", async () => {
        const replacementTags = [etsTag1, etsTag2, userTag1];
        await expect(
          contracts.ETS.connect(accounts.ETSPlatform).replaceTags(
            taggingRecordId,
            replacementTags,
            accounts.RandomTwo.address, // Different tagger
            {
              value: taggingFee * BigInt(2),
            },
          ),
        ).to.be.revertedWithCustomError(contracts.ETS, "NotAuthorized");
      });

      it("can be performed by original relayer", async () => {
        // accounts.ETSPlatform is original relayer.
        const replacementTags = [etsTag1, etsTag2, userTag1];
        const tx = await contracts.ETS.connect(accounts.ETSPlatform).replaceTags(
          taggingRecordId,
          replacementTags,
          accounts.RandomOne.address,
          {
            value: taggingFee * BigInt(2),
          },
        );
        await expect(tx).to.emit(contracts.ETS, "TaggingRecordUpdated");
        const taggingRecord = await contracts.ETS.getTaggingRecordFromId(taggingRecordId);
        expect(taggingRecord.coinAddresses.length).to.be.equal(3);
      });
    });
  });

  describe("Writing a tagging record via a Relayer contract", async () => {
    it("should revert when Relayer is paused", async () => {
      expect(
        await contracts.ETSAccessControls.isRelayerAndNotPaused(await contracts.ETSRelayer.getAddress()),
      ).to.be.equal(true);

      // Pause ETSRelayer
      await contracts.ETSAccessControls.connect(accounts.ETSPlatform).toggleRelayerLock(
        await contracts.ETSRelayer.getAddress(),
      );

      const tagParams = {
        targetURI: targetURI,
        tagStrings: ["#love", "#hate"],
        recordType: "bookmark",
        enrich: false,
      };
      const taggingRecords = [tagParams];
      await expect(
        contracts.ETSRelayer.connect(accounts.RandomOne).applyTags(taggingRecords, {
          value: taggingFee * BigInt(2),
        }),
      ).to.be.revertedWithCustomError(contracts.ETS, "CallerNotRelayer");
    });

    it('should emit "TaggingRecordCreated" when successful', async () => {
      const tagParams = {
        targetURI: targetURI,
        tagStrings: ["#love", "#hate"],
        recordType: "bookmark",
        enrich: false,
      };
      const taggingRecords = [tagParams];

      const tx = await contracts.ETSRelayer.connect(accounts.RandomOne).applyTags(taggingRecords, {
        value: taggingFee * BigInt(2),
      });
      await expect(tx).to.emit(contracts.ETS, "TaggingRecordCreated");
    });
  });

  describe("A tagging record", async () => {
    beforeEach("create a tagging record", async () => {
      // Create new tagging record.
      // RandomOne is tagger, ETSPlatform is relayer.
      const tagParams = {
        targetURI: targetURI, // "https://google.com"
        tagStrings: ["#dex", "#ethereum"],
        recordType: "bookmark",
        enrich: false,
      };
      await contracts.ETS.connect(accounts.ETSPlatform).applyTagsWithRawInput(
        tagParams,
        accounts.RandomOne.address,
        accounts.ETSPlatform.address,
        {
          value: taggingFee * BigInt(2),
        },
      );
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
      const tag1Id = await contracts.ETSToken.computeCoinAddress("#dex");
      const tag2Id = await contracts.ETSToken.computeCoinAddress("#ethereum");
      const reusedTagIds = [tag1Id, tag2Id];

      // Create new tagging record with same inputs except with different tagger.
      // this will yield a new tagging record.
      const taggingRecordInputParams = {
        targetURI: targetURI, // "https://google.com"
        tagStrings: ["#dex", "#ethereum"],
        recordType: "bookmark",
        enrich: false,
      };
      // RandomTwo is tagger, ETSPlatform is relayer.
      await contracts.ETS.connect(accounts.ETSPlatform).applyTagsWithRawInput(
        taggingRecordInputParams,
        accounts.RandomTwo.address,
        accounts.ETSPlatform.address,
        {
          value: taggingFee * BigInt(2),
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
      expect(newTaggingRecord.relayer).to.be.equal(accounts.ETSPlatform.address);
      for (let i = 0; i < newTaggingRecord.coinAddresses.length; i++) {
        expect(reusedTagIds.includes(newTaggingRecord.coinAddresses[i])).to.be.equal(true);
      }
    });
  });

  describe("Tagging fees should accrue", async () => {
    let _platformPreTagAccrued: bigint;
    let _relayerPreTagAccrued: bigint;
    let _creatorPreTagAccrued: bigint;
    let _ownerPreTagAccrued: bigint;

    // For post-tagging values
    let _platformPostTagAccrued: bigint;
    let _relayerPostTagAccrued: bigint;
    let _creatorPostTagAccrued: bigint;
    let _ownerPostTagAccrued: bigint;

    // Get initial accrued amounts at module level
    _platformPreTagAccrued = await contracts.ETS.read.accrued([accounts.ETSPlatform.account.address]);
    _relayerPreTagAccrued = await contracts.ETS.read.accrued([accounts.RandomOne.account.address]);
    _creatorPreTagAccrued = await contracts.ETS.read.accrued([accounts.Creator.account.address]);
    _ownerPreTagAccrued = await contracts.ETS.read.accrued([accounts.RandomTwo.account.address]);

    it("to the token creator when the tag used is platform owned (pre-auction)", async () => {
      // Get fresh pre-tag amounts for this test
      const platformPreTest = await contracts.ETS.read.accrued([accounts.ETSPlatform.account.address]);
      const relayerPreTest = await contracts.ETS.read.accrued([contracts.ETSRelayer.address]);
      const creatorPreTest = await contracts.ETS.read.accrued([accounts.Creator.account.address]);

      const rawInput = {
        targetURI: "https://uniswap.org-test1", // Unique URI to avoid conflicts
        tagStrings: ["#Love"],
        recordType: "bookmark",
        enrich: false,
      };

      await contracts.ETS.write.applyTagsWithRawInput(
        [rawInput, accounts.RandomTwo.account.address, accounts.ETSPlatform.account.address],
        {
          value: taggingFee,
          account: accounts.ETSPlatform.account,
        },
      );

      // Get post-tag amounts
      const platformPostTest = await contracts.ETS.read.accrued([accounts.ETSPlatform.account.address]);
      const relayerPostTest = await contracts.ETS.read.accrued([contracts.ETSRelayer.address]);
      const creatorPostTest = await contracts.ETS.read.accrued([accounts.Creator.account.address]);

      const platformPercentage = await contracts.ETS.read.platformPercentage();
      const relayerPercentage = await contracts.ETS.read.relayerPercentage();

      // Calculate the expected amounts based on percentage splits
      const platformAmount = (taggingFee * platformPercentage) / 100n;
      const relayerAmount = (taggingFee * relayerPercentage) / 100n;
      const creatorAmount = taggingFee - platformAmount - relayerAmount;

      assert.equal(platformPostTest, platformPreTest + platformAmount);
      assert.equal(relayerPostTest, relayerPreTest + relayerAmount);
      assert.equal(creatorPostTest, creatorPreTest + creatorAmount);
    });

    it("to the token owner when the tag used is user owned (post-auction)", async () => {
      // The #Incredible tag was created by accounts.Creator, so they should get the owner portion
      const platformPreTest = await contracts.ETS.read.accrued([accounts.ETSPlatform.account.address]);
      const relayerPreTest = await contracts.ETS.read.accrued([contracts.ETSRelayer.address]);
      const creatorPreTest = await contracts.ETS.read.accrued([accounts.Creator.account.address]); // Creator owns the tag

      const rawInput = {
        targetURI: "https://uniswap.org-test2", // Unique URI to avoid conflicts
        tagStrings: ["#Incredible"],
        recordType: "bookmark",
        enrich: false,
      };

      // RandomTwo is tagger, ETSPlatform is relayer.
      await contracts.ETS.write.applyTagsWithRawInput(
        [rawInput, accounts.RandomTwo.account.address, accounts.ETSPlatform.account.address],
        {
          value: taggingFee,
          account: accounts.ETSPlatform.account,
        },
      );

      // Get post-tag amounts
      const platformPostTest = await contracts.ETS.read.accrued([accounts.ETSPlatform.account.address]);
      const relayerPostTest = await contracts.ETS.read.accrued([contracts.ETSRelayer.address]);
      const creatorPostTest = await contracts.ETS.read.accrued([accounts.Creator.account.address]); // Creator owns the tag

      const platformPercentage = await contracts.ETS.read.platformPercentage();
      const relayerPercentage = await contracts.ETS.read.relayerPercentage();

      // Calculate the expected amounts based on percentage splits
      const platformAmount = (taggingFee * platformPercentage) / 100n;
      const relayerAmount = (taggingFee * relayerPercentage) / 100n;
      const creatorAmount = taggingFee - platformAmount - relayerAmount;

      assert.equal(platformPostTest, platformPreTest + platformAmount);
      assert.equal(relayerPostTest, relayerPreTest + relayerAmount);
      assert.equal(creatorPostTest, creatorPreTest + creatorAmount);
    });
  });

  describe("Drawing down", async () => {
    let platformPostTagAccrued: bigint;

    beforeEach(async () => {
      const rawInput = {
        targetURI: "https://uniswap.org",
        tagStrings: ["#Love"],
        recordType: "bookmark",
        enrich: false,
      };

      // RandomTwo is tagger, ETSRelayer is relayer.
      await contracts.ETS.connect(accounts.ETSPlatform).applyTagsWithRawInput(
        rawInput,
        accounts.RandomTwo.address,
        accounts.ETSPlatform.address,
        {
          value: taggingFee,
        },
      );
      // Check that tagging fee for one tag is divided up and distributed correctly.
      // Platform accrued.
      platformPostTagAccrued = await contracts.ETS.accrued(accounts.ETSPlatform.address);
      //relayerPostTagAccrued = await contracts.ETS.accrued(accounts.RandomOne.address);
      //creatorPostTagAccrued = await contracts.ETS.accrued(accounts.Creator.address);
    });

    it("can be performed on behalf of the platform", async () => {
      // Account A can draw down accumulated funds of
      // Account B to wallet of Account B.
      const platformBalanceBefore = await ethers.provider.getBalance(accounts.ETSPlatform.address);

      // accountRandomOne is triggering the drawdown of ETH accrued in
      // accounts.ETSPlatform.
      await contracts.ETS.connect(accounts.RandomOne).drawDown(accounts.ETSPlatform.address);

      const platformBalanceAfter = await ethers.provider.getBalance(accounts.ETSPlatform.address);

      // In this case we are expecting the value drawn down to be the
      // platform percentage cut of one tagging event.
      expect(platformBalanceAfter - platformBalanceBefore === platformPostTagAccrued);
      expect((await contracts.ETS.paid(accounts.ETSPlatform.address)) === platformBalanceAfter);
    });

    it("does nothing after a double draw down", async () => {
      const platformBalanceBefore = await ethers.provider.getBalance(accounts.ETSPlatform.address);
      await contracts.ETS.connect(accounts.RandomOne).drawDown(accounts.ETSPlatform.address);
      const platformBalanceAfter = await ethers.provider.getBalance(accounts.ETSPlatform.address);

      expect(platformBalanceAfter - platformBalanceBefore).to.equal(platformPostTagAccrued);

      const balanceBeforeSecondDraw = await ethers.provider.getBalance(accounts.ETSPlatform.address);
      await contracts.ETS.connect(accounts.RandomOne).drawDown(accounts.ETSPlatform.address);
      const balanceAfterSecondDraw = await ethers.provider.getBalance(accounts.ETSPlatform.address);

      expect(balanceAfterSecondDraw - balanceBeforeSecondDraw).to.equal(BigInt(0));
    });
  });
});
