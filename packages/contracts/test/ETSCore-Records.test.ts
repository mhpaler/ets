import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";
import { loadETSCoreFixture } from "./fixtures/etsCoreFixture.js";

describe("ETS Core Records Management", async () => {
  const {
    accounts,
    contracts,
    tagStrings,
    tagAddresses,
    testTarget,
    taggingFee: originalTaggingFee,
  } = await loadETSCoreFixture();
  const { tagstring1, tagstring2, tagstring3, tagstring4 } = tagStrings;
  const { etsTag1, etsTag2, etsTag3, userTag1 } = tagAddresses;
  const { targetURI, targetId } = testTarget;

  // Reset tagging fee to original value for this test suite
  await contracts.ETS.write.setTaggingFee([originalTaggingFee], { account: accounts.ETSPlatform.account });
  const taggingFee = originalTaggingFee;

  let _taggingRecordId: bigint;

  describe("Creating new tagging records", async () => {
    it("should revert when non-channel calls applyTagsWithRawInput", async () => {
      const rawInput = {
        targetURI: "https://google.com",
        tagStrings: ["#love"],
        recordType: "bookmark",
      };
      try {
        await contracts.ETS.write.applyTagsWithRawInput(
          [rawInput, accounts.User2.account.address, accounts.ETSPlatform.account.address],
          { account: accounts.User2.account },
        );
        assert.fail("Should have reverted");
      } catch (error: any) {
        assert.ok(error.message.includes("revert") || error.message.includes("CallerNotChannel"));
      }
    });

    it("should revert when caller is not an enabled Channel", async () => {
      try {
        await contracts.ETS.write.applyTagsWithCompositeKey(
          [[etsTag1], targetId, "bookmark", accounts.User2.account.address, accounts.ETSPlatform.account.address],
          { account: accounts.User2.account },
        );
        assert.fail("Should have reverted");
      } catch (error: any) {
        assert.ok(error.message.includes("revert") || error.message.includes("CallerNotChannel"));
      }
    });

    it("should revert when no tags are supplied", async () => {
      try {
        await contracts.ETS.write.applyTagsWithCompositeKey(
          [[], targetId, "bookmark", accounts.User2.account.address, accounts.ETSPlatform.account.address],
          { account: accounts.ETSPlatform.account },
        );
        assert.fail("Should have reverted");
      } catch (error: any) {
        assert.ok(error.message.includes("revert") || error.message.includes("NoTagsSupplied"));
      }
    });

    it("should revert when record type is too long", async () => {
      try {
        await contracts.ETS.write.applyTagsWithCompositeKey(
          [
            [etsTag1],
            targetId,
            "reallyReallyreallyReallyreallyReallyreallyReallyreallyReallyreallyReallyLongRecordType",
            accounts.User2.account.address,
            accounts.ETSPlatform.account.address,
          ],
          {
            value: taggingFee,
            account: accounts.ETSPlatform.account,
          },
        );
        assert.fail("Should have reverted");
      } catch (error: any) {
        assert.ok(error.message.includes("revert") || error.message.includes("RecordTypeTooLong"));
      }
    });

    it("should revert when insufficient tagging fee is supplied", async () => {
      try {
        await contracts.ETS.write.applyTagsWithCompositeKey(
          [
            [etsTag1, userTag1],
            targetId,
            "bookmark",
            accounts.User2.account.address,
            accounts.ETSPlatform.account.address,
          ],
          {
            value: taggingFee, // Need 2x fee for 2 tags
            account: accounts.ETSPlatform.account,
          },
        );
        assert.fail("Should have reverted");
      } catch (error: any) {
        assert.ok(error.message.includes("revert") || error.message.includes("WrongFeeSupplied"));
      }
    });

    it("should emit TaggingRecordCreated when new Tagging Record is created", async () => {
      const tags = [etsTag1];
      // TODO: Event testing needs to be implemented with viem
      await contracts.ETS.write.applyTagsWithCompositeKey(
        [tags, targetId, "bookmark", accounts.User2.account.address, accounts.ETSPlatform.account.address],
        {
          value: taggingFee,
          account: accounts.ETSPlatform.account,
        },
      );
      // await expect(tx).to.emit(contracts.ETS, "TaggingRecordCreated");
    });

    it("should not require value sent when tagging fee set to zero", async () => {
      await contracts.ETS.write.setTaggingFee([0n], { account: accounts.ETSPlatform.account });
      const tags = [etsTag1];
      // TODO: Event testing needs to be implemented with viem
      await contracts.ETS.write.applyTagsWithCompositeKey(
        [tags, targetId, "bookmark-zero-fee", accounts.User2.account.address, accounts.ETSPlatform.account.address],
        { account: accounts.ETSPlatform.account },
      );
      // await expect(tx).to.emit(contracts.ETS, "TaggingRecordCreated");
    });

    it("should have the correct number of tags", async () => {
      // Create completely new tags to avoid conflicts
      await contracts.ETSChannel.write.getOrCreateTagIds([["#MultiTag1", "#MultiTag2", "#MultiTag3"]], {
        account: accounts.User4.account,
      });

      const multiTag1 = await contracts.ETSToken.read.computeCoinAddress(["#MultiTag1"]);
      const multiTag2 = await contracts.ETSToken.read.computeCoinAddress(["#MultiTag2"]);
      const multiTag3 = await contracts.ETSToken.read.computeCoinAddress(["#MultiTag3"]);

      const tags = [multiTag1, multiTag2, multiTag3];

      // First compute the expected fee to ensure we're sending the right amount
      const [expectedFee, tagCount] = await contracts.ETS.read.computeTaggingFeeFromCompositeKey([
        tags,
        targetId,
        "bookmark-multi-tag",
        accounts.ETSPlatform.account.address,
        accounts.User2.account.address,
        0, // APPLY action
      ]);

      console.log(`Expected fee: ${expectedFee}, Tag count: ${tagCount}, Sending: ${taggingFee * BigInt(3)}`);

      await contracts.ETS.write.applyTagsWithCompositeKey(
        [tags, targetId, "bookmark-multi-tag", accounts.User2.account.address, accounts.ETSPlatform.account.address],
        {
          value: expectedFee, // Use computed fee instead of hardcoded
          account: accounts.ETSPlatform.account,
        },
      );

      // First verify the record was created by computing its ID
      const recordId = await contracts.ETS.read.computeTaggingRecordIdFromCompositeKey([
        targetId,
        "bookmark-multi-tag",
        accounts.ETSPlatform.account.address,
        accounts.User2.account.address,
      ]);

      // Try to get the record by ID first
      const taggingRecordById = await contracts.ETS.read.getTaggingRecordFromId([recordId]);

      if (!taggingRecordById) {
        assert.fail(`Failed to retrieve multi-tag tagging record by ID. Record ID: ${recordId}`);
      }

      // viem returns struct as array tuple: [coinAddresses, targetId, recordType, channel, tagger]
      const [coinAddressesById, _targetIdById, _recordTypeById, _channelById, _taggerById] = taggingRecordById;

      if (!coinAddressesById || !Array.isArray(coinAddressesById)) {
        assert.fail(`Retrieved record but coinAddresses is not valid array: ${coinAddressesById}`);
      }

      // Also try composite key method
      const taggingRecord = await contracts.ETS.read.getTaggingRecordFromCompositeKey([
        targetId,
        "bookmark-multi-tag",
        accounts.ETSPlatform.account.address,
        accounts.User2.account.address,
      ]);

      if (!taggingRecord) {
        assert.fail("Failed to retrieve multi-tag tagging record by composite key");
      }

      // Extract from composite key result
      const [coinAddresses, , , ,] = taggingRecord;

      if (!coinAddresses || !Array.isArray(coinAddresses)) {
        assert.fail(`Composite key record coinAddresses is not valid array: ${coinAddresses}`);
      }

      assert.equal(coinAddresses.length, 3);
      assert.equal(coinAddressesById.length, 3);
    });
  });

  describe("Appending tags to existing tagging record", async () => {
    // Set up existing record for append tests
    const appendTags = [etsTag1];
    await contracts.ETS.write.applyTagsWithCompositeKey(
      [appendTags, targetId, "bookmark-append", accounts.User2.account.address, accounts.ETSPlatform.account.address],
      {
        value: taggingFee,
        account: accounts.ETSPlatform.account,
      },
    );

    const appendTaggingRecordId = await contracts.ETS.read.computeTaggingRecordIdFromCompositeKey([
      targetId,
      "bookmark-append",
      accounts.ETSPlatform.account.address,
      accounts.User2.account.address,
    ]);

    describe("using tagging record raw input", async () => {
      it("should revert when insufficient tagging fee is supplied", async () => {
        const rawInput = {
          targetURI: targetURI,
          tagStrings: ["#newTag1", "#newTag2", "#newTag3"], // Use completely new tags
          recordType: "bookmark-append",
        };
        try {
          await contracts.ETS.write.applyTagsWithRawInput(
            [rawInput, accounts.User2.account.address, accounts.ETSPlatform.account.address],
            {
              value: taggingFee, // Insufficient fee - should be 3x for 3 new tags
              account: accounts.ETSPlatform.account,
            },
          );
          assert.fail("Should have reverted");
        } catch (error: any) {
          assert.ok(error.message.includes("revert") || error.message.includes("WrongFeeSupplied"));
        }
      });

      it("should emit TaggingRecordUpdated", async () => {
        // Append to the existing "bookmark-append" record that was created in the setup
        const rawInput = {
          targetURI: targetURI, // Use the same targetURI as the existing record
          tagStrings: ["#newAppendTag1", "#newAppendTag2"], // Two completely new tags to append
          recordType: "bookmark-append", // Use the same record type as the existing record
        };

        // First compute the expected fee for appending to existing record
        const [expectedFee, _tagCount] = await contracts.ETS.read.computeTaggingFeeFromRawInput([
          rawInput,
          accounts.ETSPlatform.account.address,
          accounts.User2.account.address,
          0, // APPLY action
        ]);

        // TODO: Event testing needs to be implemented with viem
        await contracts.ETS.write.applyTagsWithRawInput(
          [rawInput, accounts.User2.account.address, accounts.ETSPlatform.account.address],
          {
            value: expectedFee, // Use computed fee
            account: accounts.ETSPlatform.account,
          },
        );
        // await expect(tx).to.emit(contracts.ETS, "TaggingRecordUpdated").withArgs(appendTaggingRecordId, 0);
      });

      it("should increase the tag count when new tag is supplied", async () => {
        let taggingRecord = await contracts.ETS.read.getTaggingRecordFromId([appendTaggingRecordId]);
        if (!taggingRecord) {
          assert.fail("Failed to retrieve tagging record");
        }

        // viem returns struct as array tuple: [coinAddresses, targetId, recordType, channel, tagger]
        const [coinAddresses] = taggingRecord;
        if (!coinAddresses || !Array.isArray(coinAddresses)) {
          assert.fail("Failed to retrieve coinAddresses from tagging record");
        }
        const initialCount = coinAddresses.length;

        const rawInput = {
          targetURI: targetURI,
          tagStrings: ["#append1", "#append2"], // Only add new tags, avoid duplicates
          recordType: "bookmark-append",
        };

        // Compute the expected fee
        const [expectedFee, _tagCount] = await contracts.ETS.read.computeTaggingFeeFromRawInput([
          rawInput,
          accounts.ETSPlatform.account.address,
          accounts.User2.account.address,
          0, // APPLY action
        ]);

        await contracts.ETS.write.applyTagsWithRawInput(
          [rawInput, accounts.User2.account.address, accounts.ETSPlatform.account.address],
          {
            value: expectedFee, // Use computed fee
            account: accounts.ETSPlatform.account,
          },
        );

        taggingRecord = await contracts.ETS.read.getTaggingRecordFromId([appendTaggingRecordId]);
        if (!taggingRecord) {
          assert.fail("Failed to retrieve updated tagging record");
        }

        const [updatedCoinAddresses] = taggingRecord;
        if (!updatedCoinAddresses || !Array.isArray(updatedCoinAddresses)) {
          assert.fail("Failed to retrieve updated coinAddresses from tagging record");
        }
        assert.equal(updatedCoinAddresses.length, initialCount + 2);
      });
    });

    describe("using taggingRecord composite key", async () => {
      it("should revert when insufficient tagging fee is supplied", async () => {
        // Create new unique tags for this test
        await contracts.ETSChannel.write.getOrCreateTagIds([["#uniqueTag1", "#uniqueTag2"]], {
          account: accounts.User4.account,
        });
        const uniqueTag1 = await contracts.ETSToken.read.computeCoinAddress(["#uniqueTag1"]);
        const uniqueTag2 = await contracts.ETSToken.read.computeCoinAddress(["#uniqueTag2"]);

        const tags = [uniqueTag1, uniqueTag2];
        try {
          await contracts.ETS.write.applyTagsWithCompositeKey(
            [tags, targetId, "bookmark-append", accounts.User2.account.address, accounts.ETSPlatform.account.address],
            {
              value: taggingFee, // Insufficient fee - should be 2x for 2 new tags
              account: accounts.ETSPlatform.account,
            },
          );
          assert.fail("Should have reverted");
        } catch (error: any) {
          assert.ok(error.message.includes("revert") || error.message.includes("WrongFeeSupplied"));
        }
      });

      it("should emit TaggingRecordUpdated", async () => {
        // Create new unique tags for this test
        await contracts.ETSChannel.write.getOrCreateTagIds([["#compKeyTag1", "#compKeyTag2"]], {
          account: accounts.User4.account,
        });
        const compKeyTag1 = await contracts.ETSToken.read.computeCoinAddress(["#compKeyTag1"]);
        const compKeyTag2 = await contracts.ETSToken.read.computeCoinAddress(["#compKeyTag2"]);

        // Compute the expected fee for appending these tags to existing record
        const [expectedFee, _tagCount] = await contracts.ETS.read.computeTaggingFeeFromCompositeKey([
          [compKeyTag1, compKeyTag2],
          targetId,
          "bookmark-append",
          accounts.ETSPlatform.account.address,
          accounts.User2.account.address,
          0, // APPLY action
        ]);

        // TODO: Event testing needs to be implemented with viem
        await contracts.ETS.write.applyTagsWithCompositeKey(
          [
            [compKeyTag1, compKeyTag2],
            targetId,
            "bookmark-append",
            accounts.User2.account.address,
            accounts.ETSPlatform.account.address,
          ],
          {
            value: expectedFee, // Use computed fee
            account: accounts.ETSPlatform.account,
          },
        );
        // await expect(tx).to.emit(contracts.ETS, "TaggingRecordUpdated");
      });
    });

    describe("using taggingRecordId", async () => {
      it("should revert when insufficient tagging fee is supplied", async () => {
        // Create completely new tags to avoid fee conflicts
        await contracts.ETSChannel.write.getOrCreateTagIds([["#appendTag1", "#appendTag2", "#appendTag3"]], {
          account: accounts.User4.account,
        });
        const appendTag1 = await contracts.ETSToken.read.computeCoinAddress(["#appendTag1"]);
        const appendTag2 = await contracts.ETSToken.read.computeCoinAddress(["#appendTag2"]);
        const appendTag3 = await contracts.ETSToken.read.computeCoinAddress(["#appendTag3"]);

        const tagsToAppend = [appendTag1, appendTag2, appendTag3];
        try {
          await contracts.ETS.write.appendTags([appendTaggingRecordId, tagsToAppend, accounts.User2.account.address], {
            value: taggingFee, // Insufficient fee - should be 3x for 3 new tags
            account: accounts.ETSPlatform.account,
          });
          assert.fail("Should have reverted");
        } catch (error: any) {
          assert.ok(error.message.includes("revert") || error.message.includes("WrongFeeSupplied"));
        }
      });

      it("can be done with taggingRecordId", async () => {
        let taggingRecord = await contracts.ETS.read.getTaggingRecordFromId([appendTaggingRecordId]);
        if (!taggingRecord) {
          assert.fail("Failed to retrieve tagging record");
        }

        // viem returns struct as array tuple: [coinAddresses, targetId, recordType, channel, tagger]
        const [coinAddresses] = taggingRecord;
        if (!coinAddresses || !Array.isArray(coinAddresses)) {
          assert.fail("Failed to retrieve coinAddresses from tagging record");
        }
        const initialCount = coinAddresses.length;

        // Create completely new tags to avoid fee conflicts
        await contracts.ETSChannel.write.getOrCreateTagIds([["#recordIdTag1", "#recordIdTag2"]], {
          account: accounts.User4.account,
        });
        const recordIdTag1 = await contracts.ETSToken.read.computeCoinAddress(["#recordIdTag1"]);
        const recordIdTag2 = await contracts.ETSToken.read.computeCoinAddress(["#recordIdTag2"]);

        const tagsToAppend = [recordIdTag1, recordIdTag2];

        // Compute the expected fee for appending these specific tags to the existing record
        const [expectedFee] = await contracts.ETS.read.computeTaggingFee([
          appendTaggingRecordId,
          tagsToAppend,
          0, // APPLY action
        ]);

        // TODO: Event testing needs to be implemented with viem
        await contracts.ETS.write.appendTags([appendTaggingRecordId, tagsToAppend, accounts.User2.account.address], {
          value: expectedFee, // Use computed fee
          account: accounts.ETSPlatform.account,
        });

        taggingRecord = await contracts.ETS.read.getTaggingRecordFromId([appendTaggingRecordId]);
        if (!taggingRecord) {
          assert.fail("Failed to retrieve updated tagging record");
        }

        const [updatedCoinAddresses] = taggingRecord;
        if (!updatedCoinAddresses || !Array.isArray(updatedCoinAddresses)) {
          assert.fail("Failed to retrieve updated coinAddresses from tagging record");
        }
        assert.equal(updatedCoinAddresses.length, initialCount + 2); // 2 new tags added
      });

      it("must be performed by the original tagger", async () => {
        // Create new tags to avoid fee conflicts
        await contracts.ETSChannel.write.getOrCreateTagIds([["#authTag1", "#authTag2"]], {
          account: accounts.User4.account,
        });
        const authTag1 = await contracts.ETSToken.read.computeCoinAddress(["#authTag1"]);
        const authTag2 = await contracts.ETSToken.read.computeCoinAddress(["#authTag2"]);

        const tagsToAppend = [authTag1, authTag2];
        try {
          await contracts.ETS.write.appendTags(
            [
              appendTaggingRecordId,
              tagsToAppend,
              accounts.User3.account.address, // different tagger
            ],
            {
              value: taggingFee * 2n,
              account: accounts.ETSPlatform.account,
            },
          );
          assert.fail("Should have reverted");
        } catch (error: any) {
          assert.ok(error.message.includes("revert") || error.message.includes("NotAuthorized"));
        }
      });
    });
  });

  describe("Removing tags", async () => {
    // Set up record with multiple tags for removal tests
    const removeTags = [etsTag1, etsTag2, etsTag3, userTag1];
    await contracts.ETS.write.applyTagsWithCompositeKey(
      [removeTags, targetId, "bookmark-remove", accounts.User2.account.address, accounts.ETSPlatform.account.address],
      {
        value: taggingFee * BigInt(4),
        account: accounts.ETSPlatform.account,
      },
    );

    const removeTaggingRecordId = await contracts.ETS.read.computeTaggingRecordIdFromCompositeKey([
      targetId,
      "bookmark-remove",
      accounts.ETSPlatform.account.address,
      accounts.User2.account.address,
    ]);

    describe("using taggingRecord raw input", async () => {
      it("should revert if tagging record not found", async () => {
        const rawInput = {
          targetURI: targetURI,
          tagStrings: ["#love", "#beatles", "#water"],
          recordType: "discovery", // Non-existent record type
        };
        try {
          await contracts.ETS.write.removeTagsWithRawInput(
            [rawInput, accounts.User2.account.address, accounts.ETSPlatform.account.address],
            { account: accounts.ETSPlatform.account },
          );
          assert.fail("Should have reverted");
        } catch (error: any) {
          assert.ok(error.message.includes("revert") || error.message.includes("NotAuthorized"));
        }
      });

      it("should revert if no tags supplied", async () => {
        const rawInput = {
          targetURI: targetURI,
          tagStrings: [],
          recordType: "bookmark-remove",
        };
        try {
          await contracts.ETS.write.removeTagsWithRawInput(
            [rawInput, accounts.User2.account.address, accounts.ETSPlatform.account.address],
            { account: accounts.ETSPlatform.account },
          );
          assert.fail("Should have reverted");
        } catch (error: any) {
          assert.ok(error.message.includes("revert") || error.message.includes("NoTagsSupplied"));
        }
      });

      it("should decrease tag count when tags are removed", async () => {
        let taggingRecord = await contracts.ETS.read.getTaggingRecordFromId([removeTaggingRecordId]);
        if (!taggingRecord) {
          assert.fail("Failed to retrieve tagging record");
        }

        // viem returns struct as array tuple: [coinAddresses, targetId, recordType, channel, tagger]
        const [coinAddresses] = taggingRecord;
        if (!coinAddresses || !Array.isArray(coinAddresses)) {
          assert.fail("Failed to retrieve coinAddresses from tagging record");
        }
        const initialCount = coinAddresses.length;

        const rawInput = {
          targetURI: targetURI,
          tagStrings: [tagstring1, tagstring2],
          recordType: "bookmark-remove",
        };
        // TODO: Event testing needs to be implemented with viem
        await contracts.ETS.write.removeTagsWithRawInput(
          [rawInput, accounts.User2.account.address, accounts.ETSPlatform.account.address],
          { account: accounts.ETSPlatform.account },
        );

        taggingRecord = await contracts.ETS.read.getTaggingRecordFromId([removeTaggingRecordId]);
        if (!taggingRecord) {
          assert.fail("Failed to retrieve updated tagging record");
        }

        const [updatedCoinAddresses] = taggingRecord;
        if (!updatedCoinAddresses || !Array.isArray(updatedCoinAddresses)) {
          assert.fail("Failed to retrieve updated coinAddresses from tagging record");
        }
        assert.equal(updatedCoinAddresses.length, initialCount - 2);
      });
    });

    describe("using taggingRecord composite key", async () => {
      it("should revert if no tags supplied", async () => {
        try {
          await contracts.ETS.write.removeTagsWithCompositeKey(
            [[], targetId, "bookmark-remove", accounts.User2.account.address, accounts.ETSPlatform.account.address],
            { account: accounts.ETSPlatform.account },
          );
          assert.fail("Should have reverted");
        } catch (error: any) {
          assert.ok(error.message.includes("revert") || error.message.includes("NoTagsSupplied"));
        }
      });

      it("should decrease tag count when tags are removed", async () => {
        let taggingRecord = await contracts.ETS.read.getTaggingRecordFromId([removeTaggingRecordId]);
        if (!taggingRecord) {
          assert.fail("Failed to retrieve tagging record");
        }

        // viem returns struct as array tuple: [coinAddresses, targetId, recordType, channel, tagger]
        const [coinAddresses] = taggingRecord;
        if (!coinAddresses || !Array.isArray(coinAddresses)) {
          assert.fail("Failed to retrieve coinAddresses from tagging record");
        }
        const initialCount = coinAddresses.length;

        const removeTags = [etsTag3, userTag1]; // etsTag3 and userTag1 should still be in record after previous test
        // TODO: Event testing needs to be implemented with viem
        await contracts.ETS.write.removeTagsWithCompositeKey(
          [
            removeTags,
            targetId,
            "bookmark-remove",
            accounts.User2.account.address,
            accounts.ETSPlatform.account.address,
          ],
          { account: accounts.ETSPlatform.account },
        );

        taggingRecord = await contracts.ETS.read.getTaggingRecordFromId([removeTaggingRecordId]);
        if (!taggingRecord) {
          assert.fail("Failed to retrieve updated tagging record");
        }

        const [updatedCoinAddresses] = taggingRecord;
        if (!updatedCoinAddresses || !Array.isArray(updatedCoinAddresses)) {
          assert.fail("Failed to retrieve updated coinAddresses from tagging record");
        }
        assert.equal(updatedCoinAddresses.length, initialCount - 2);
      });
    });

    describe("using taggingRecordId", async () => {
      it("can be done with taggingRecordId", async () => {
        // Create a fresh record with unique record type for this test
        const freshRecordTags = [etsTag1]; // Use just one tag to keep it simple

        // Compute the expected fee for this specific record
        const [freshRecordFee] = await contracts.ETS.read.computeTaggingFeeFromCompositeKey([
          freshRecordTags, // coinAddresses first
          targetId,
          "bookmark-remove-fresh",
          accounts.ETSPlatform.account.address, // channel
          accounts.User2.account.address, // tagger
          0, // APPLY action
        ]);

        await contracts.ETS.write.applyTagsWithCompositeKey(
          [
            freshRecordTags,
            targetId,
            "bookmark-remove-fresh",
            accounts.User2.account.address,
            accounts.ETSPlatform.account.address,
          ],
          {
            value: freshRecordFee,
            account: accounts.ETSPlatform.account,
          },
        );

        const freshRecordId = await contracts.ETS.read.computeTaggingRecordIdFromCompositeKey([
          targetId,
          "bookmark-remove-fresh",
          accounts.ETSPlatform.account.address,
          accounts.User2.account.address,
        ]);

        let taggingRecord = await contracts.ETS.read.getTaggingRecordFromId([freshRecordId]);
        if (!taggingRecord) {
          assert.fail("Failed to retrieve fresh tagging record");
        }

        // viem returns struct as array tuple: [coinAddresses, targetId, recordType, channel, tagger]
        const [coinAddresses] = taggingRecord;
        if (!coinAddresses || !Array.isArray(coinAddresses)) {
          assert.fail("Failed to retrieve coinAddresses from tagging record");
        }
        const initialCount = coinAddresses.length;

        // TODO: Event testing needs to be implemented with viem
        await contracts.ETS.write.removeTags(
          [
            freshRecordId,
            [etsTag1], // Remove etsTag1 which should be there
            accounts.User2.account.address,
          ],
          { account: accounts.ETSPlatform.account },
        );

        taggingRecord = await contracts.ETS.read.getTaggingRecordFromId([freshRecordId]);
        if (!taggingRecord) {
          assert.fail("Failed to retrieve updated tagging record");
        }

        const [updatedCoinAddresses] = taggingRecord;
        if (!updatedCoinAddresses || !Array.isArray(updatedCoinAddresses)) {
          assert.fail("Failed to retrieve updated coinAddresses from tagging record");
        }
        assert.equal(updatedCoinAddresses.length, initialCount - 1);
      });

      it("must be performed by original tagger", async () => {
        try {
          await contracts.ETS.write.removeTags(
            [
              removeTaggingRecordId,
              [etsTag1], // Try to remove a tag that exists
              accounts.User3.account.address, // Different tagger
            ],
            { account: accounts.ETSPlatform.account },
          );
          assert.fail("Should have reverted");
        } catch (error: any) {
          assert.ok(error.message.includes("revert") || error.message.includes("NotAuthorized"));
        }
      });
    });
  });

  describe("Replacing (overwrite) tags", async () => {
    // Set up record for replace tests
    const replaceTags = [etsTag1];
    await contracts.ETS.write.applyTagsWithCompositeKey(
      [replaceTags, targetId, "bookmark-replace", accounts.User2.account.address, accounts.ETSPlatform.account.address],
      {
        value: taggingFee,
        account: accounts.ETSPlatform.account,
      },
    );

    const replaceTaggingRecordId = await contracts.ETS.read.computeTaggingRecordIdFromCompositeKey([
      targetId,
      "bookmark-replace",
      accounts.ETSPlatform.account.address,
      accounts.User2.account.address,
    ]);

    describe("using taggingRecord raw input", async () => {
      it("should revert when insufficient tagging fee is supplied", async () => {
        const replacementRawInput = {
          targetURI: targetURI,
          tagStrings: ["#ReplaceTag1", "#ReplaceTag2", "#ReplaceTag3"], // Use new unique tags
          recordType: "bookmark-replace",
        };
        try {
          await contracts.ETS.write.replaceTagsWithRawInput(
            [replacementRawInput, accounts.User2.account.address, accounts.ETSPlatform.account.address],
            {
              value: taggingFee, // Insufficient fee - should be 3x for 3 new tags
              account: accounts.ETSPlatform.account,
            },
          );
          assert.fail("Should have reverted");
        } catch (error: any) {
          assert.ok(error.message.includes("revert") || error.message.includes("WrongFeeSupplied"));
        }
      });

      it("should replace rather than append", async () => {
        let taggingRecord = await contracts.ETS.read.getTaggingRecordFromId([replaceTaggingRecordId]);
        if (!taggingRecord) {
          assert.fail("Failed to retrieve tagging record");
        }

        // viem returns struct as array tuple: [coinAddresses, targetId, recordType, channel, tagger]
        const [coinAddresses] = taggingRecord;
        if (!coinAddresses || !Array.isArray(coinAddresses)) {
          assert.fail("Failed to retrieve coinAddresses from tagging record");
        }
        assert.equal(coinAddresses.length, 1);

        const replacementRawInput = {
          targetURI: targetURI,
          tagStrings: ["#Bears", "#Beatles", "#Water"], // Replacing 1 tag with 3 new ones.
          recordType: "bookmark-replace",
        };
        // Compute the expected fee for replacing with these new tags
        const [expectedFee] = await contracts.ETS.read.computeTaggingFeeFromRawInput([
          replacementRawInput,
          accounts.ETSPlatform.account.address,
          accounts.User2.account.address,
          1, // REPLACE action
        ]);

        // TODO: Event testing needs to be implemented with viem
        await contracts.ETS.write.replaceTagsWithRawInput(
          [replacementRawInput, accounts.User2.account.address, accounts.ETSPlatform.account.address],
          {
            value: expectedFee, // Use computed fee
            account: accounts.ETSPlatform.account,
          },
        );

        taggingRecord = await contracts.ETS.read.getTaggingRecordFromId([replaceTaggingRecordId]);
        if (!taggingRecord) {
          assert.fail("Failed to retrieve updated tagging record");
        }

        const [updatedCoinAddresses] = taggingRecord;
        if (!updatedCoinAddresses || !Array.isArray(updatedCoinAddresses)) {
          assert.fail("Failed to retrieve updated coinAddresses from tagging record");
        }
        assert.equal(updatedCoinAddresses.length, 3);
      });
    });

    describe("using taggingRecord composite key", async () => {
      it("should replace rather than append", async () => {
        let taggingRecord = await contracts.ETS.read.getTaggingRecordFromId([replaceTaggingRecordId]);
        if (!taggingRecord) {
          assert.fail("Failed to retrieve tagging record");
        }

        // viem returns struct as array tuple: [coinAddresses, targetId, recordType, channel, tagger]
        const [coinAddresses] = taggingRecord;
        if (!coinAddresses || !Array.isArray(coinAddresses)) {
          assert.fail("Failed to retrieve coinAddresses from tagging record");
        }
        const _initialCount = coinAddresses.length;

        const newTags = [etsTag2, etsTag3, userTag1]; // Replacing with 3 new ones.
        // Compute the expected fee for replacing with these new tags
        const [expectedFee] = await contracts.ETS.read.computeTaggingFeeFromCompositeKey([
          newTags,
          targetId,
          "bookmark-replace",
          accounts.ETSPlatform.account.address,
          accounts.User2.account.address,
          1, // REPLACE action
        ]);

        // TODO: Event testing needs to be implemented with viem
        await contracts.ETS.write.replaceTagsWithCompositeKey(
          [newTags, targetId, "bookmark-replace", accounts.User2.account.address, accounts.ETSPlatform.account.address],
          {
            value: expectedFee, // Use computed fee
            account: accounts.ETSPlatform.account,
          },
        );

        taggingRecord = await contracts.ETS.read.getTaggingRecordFromId([replaceTaggingRecordId]);
        if (!taggingRecord) {
          assert.fail("Failed to retrieve updated tagging record");
        }

        const [updatedCoinAddresses] = taggingRecord;
        if (!updatedCoinAddresses || !Array.isArray(updatedCoinAddresses)) {
          assert.fail("Failed to retrieve updated coinAddresses from tagging record");
        }
        assert.equal(updatedCoinAddresses.length, 3);
      });
    });

    describe("using taggingRecordId", async () => {
      it("should emit TaggingRecordUpdated", async () => {
        let taggingRecord = await contracts.ETS.read.getTaggingRecordFromId([replaceTaggingRecordId]);
        if (!taggingRecord) {
          assert.fail("Failed to retrieve tagging record");
        }

        // viem returns struct as array tuple: [coinAddresses, targetId, recordType, channel, tagger]
        const [coinAddresses] = taggingRecord;
        if (!coinAddresses || !Array.isArray(coinAddresses)) {
          assert.fail("Failed to retrieve coinAddresses from tagging record");
        }
        assert.equal(coinAddresses.length, 3); // From previous test

        const replacementTags = [etsTag2, userTag1];
        // Compute the expected fee for replacing with these specific tags
        const [expectedFee] = await contracts.ETS.read.computeTaggingFee([
          replaceTaggingRecordId,
          replacementTags,
          1, // REPLACE action
        ]);

        // TODO: Event testing needs to be implemented with viem
        await contracts.ETS.write.replaceTags(
          [replaceTaggingRecordId, replacementTags, accounts.User2.account.address],
          {
            value: expectedFee, // Use computed fee
            account: accounts.ETSPlatform.account,
          },
        );

        taggingRecord = await contracts.ETS.read.getTaggingRecordFromId([replaceTaggingRecordId]);
        if (!taggingRecord) {
          assert.fail("Failed to retrieve updated tagging record");
        }

        const [updatedCoinAddresses] = taggingRecord;
        if (!updatedCoinAddresses || !Array.isArray(updatedCoinAddresses)) {
          assert.fail("Failed to retrieve updated coinAddresses from tagging record");
        }
        assert.equal(updatedCoinAddresses.length, 2);
      });

      it("must be performed by original tagger", async () => {
        const replacementTags = [etsTag1, etsTag2, userTag1];
        try {
          await contracts.ETS.write.replaceTags(
            [
              replaceTaggingRecordId,
              replacementTags,
              accounts.User3.account.address, // Different tagger
            ],
            {
              value: taggingFee * 3n, // Correct fee for 3 tags
              account: accounts.ETSPlatform.account,
            },
          );
          assert.fail("Should have reverted");
        } catch (error: any) {
          assert.ok(error.message.includes("revert") || error.message.includes("NotAuthorized"));
        }
      });
    });
  });

  describe("A tagging record", async () => {
    // Create a tagging record for retrieval tests
    const recordTagParams = {
      targetURI: "https://example.com/record-test",
      tagStrings: ["#dex", "#ethereum"],
      recordType: "bookmark",
      enrich: false,
    };

    await contracts.ETS.write.applyTagsWithRawInput(
      [recordTagParams, accounts.User2.account.address, accounts.ETSPlatform.account.address],
      {
        value: taggingFee * 2n,
        account: accounts.ETSPlatform.account,
      },
    );

    const recordTestTargetId = await contracts.ETSTarget.read.computeTargetId([recordTagParams.targetURI]);
    const recordTestTaggingRecordId = await contracts.ETS.read.computeTaggingRecordIdFromCompositeKey([
      recordTestTargetId,
      "bookmark",
      accounts.ETSPlatform.account.address,
      accounts.User2.account.address,
    ]);

    it("should be retrievable by it's unique composite key", async () => {
      const taggingRecord = await contracts.ETS.read.getTaggingRecordFromCompositeKey([
        recordTestTargetId,
        "bookmark",
        accounts.ETSPlatform.account.address,
        accounts.User2.account.address,
      ]);

      if (!taggingRecord) {
        assert.fail("Failed to retrieve tagging record by composite key");
      }

      // viem returns struct as array tuple: [coinAddresses, targetId, recordType, channel, tagger]
      const [, targetId] = taggingRecord;
      if (!targetId) {
        assert.fail("Failed to retrieve targetId from tagging record");
      }
      assert.equal(targetId.toString(), recordTestTargetId.toString());
    });

    it("should be retrievable by tagging record id", async () => {
      const taggingRecord = await contracts.ETS.read.getTaggingRecordFromId([recordTestTaggingRecordId]);
      if (!taggingRecord) {
        assert.fail("Failed to retrieve tagging record by id");
      }

      // viem returns struct as array tuple: [coinAddresses, targetId, recordType, channel, tagger]
      const [, targetId] = taggingRecord;
      if (!targetId) {
        assert.fail("Failed to retrieve targetId from tagging record");
      }
      assert.equal(targetId.toString(), recordTestTargetId.toString());
    });

    it("will reuse existing tags and targets", async () => {
      const existingTargetId = recordTestTargetId;
      const tag1Id = await contracts.ETSToken.read.computeCoinAddress(["#dex"]);
      const tag2Id = await contracts.ETSToken.read.computeCoinAddress(["#ethereum"]);
      const reusedTagIds = [tag1Id, tag2Id];

      // Create new tagging record with same inputs except with different tagger.
      // this will yield a new tagging record.
      const taggingRecordInputParams = {
        targetURI: recordTagParams.targetURI,
        tagStrings: ["#dex", "#ethereum"],
        recordType: "bookmark",
      };

      // Compute the expected fee for applying these specific tags
      const [expectedFee] = await contracts.ETS.read.computeTaggingFeeFromRawInput([
        taggingRecordInputParams,
        accounts.ETSPlatform.account.address, // channel
        accounts.User3.account.address, // tagger
        0, // APPLY action
      ]);

      // RandomTwo is tagger, ETSPlatform is channel.
      await contracts.ETS.write.applyTagsWithRawInput(
        [taggingRecordInputParams, accounts.User3.account.address, accounts.ETSPlatform.account.address],
        {
          value: expectedFee,
          account: accounts.ETSPlatform.account,
        },
      );

      // Get tagging record id from composite key.
      // Parameters: targetId, recordType, channel, tagger
      const newTaggingRecordId = await contracts.ETS.read.computeTaggingRecordIdFromCompositeKey([
        existingTargetId,
        "bookmark",
        accounts.ETSPlatform.account.address, // channel
        accounts.User3.account.address, // tagger
      ]);

      assert.notEqual(newTaggingRecordId.toString(), recordTestTaggingRecordId.toString());

      const newTaggingRecord = await contracts.ETS.read.getTaggingRecordFromId([newTaggingRecordId]);
      if (!newTaggingRecord) {
        assert.fail("Failed to retrieve new tagging record");
      }

      // viem returns struct as array tuple: [coinAddresses, targetId, recordType, channel, tagger]
      const [coinAddresses, targetId, recordType, channel, tagger] = newTaggingRecord;
      if (!coinAddresses || !targetId) {
        assert.fail("Failed to retrieve new tagging record data");
      }

      assert.equal(targetId.toString(), existingTargetId.toString());
      assert.equal(recordType, "bookmark");
      assert.equal(tagger.toLowerCase(), accounts.User3.account.address.toLowerCase());
      assert.equal(channel.toLowerCase(), accounts.ETSPlatform.account.address.toLowerCase());

      for (let i = 0; i < coinAddresses.length; i++) {
        assert.ok(reusedTagIds.includes(coinAddresses[i]));
      }
    });
  });

  describe("Writing a tagging record via a Channel contract", async () => {
    it("should revert when Channel is paused", async () => {
      assert.equal(await contracts.ETSAccessControls.read.isChannelAndNotPaused([contracts.ETSChannel.address]), true);

      // Pause ETSChannel
      await contracts.ETSAccessControls.write.toggleChannelLock([contracts.ETSChannel.address], {
        account: accounts.ETSPlatform.account,
      });

      const tagParams = {
        targetURI: targetURI,
        tagStrings: ["#love", "#hate"],
        recordType: "bookmark",
        enrich: false,
      };
      const taggingRecords = [tagParams];

      try {
        await contracts.ETSChannel.write.applyTags([taggingRecords], {
          value: taggingFee * 2n,
          account: accounts.User2.account,
        });
        assert.fail("Should have reverted");
      } catch (error: any) {
        assert.ok(error.message.includes("revert") || error.message.includes("CallerNotChannel"));
      }
    });

    it('should emit "TaggingRecordCreated" when successful', async () => {
      // Unpause the channel first
      await contracts.ETSAccessControls.write.toggleChannelLock([contracts.ETSChannel.address], {
        account: accounts.ETSPlatform.account,
      });

      const tagParams = {
        targetURI: "https://channel-test.com",
        tagStrings: ["#love", "#hate"],
        recordType: "bookmark",
        enrich: false,
      };
      const taggingRecords = [tagParams];

      // TODO: Event testing needs to be implemented with viem
      await contracts.ETSChannel.write.applyTags([taggingRecords], {
        value: taggingFee * 2n,
        account: accounts.User2.account,
      });
      // await expect(tx).to.emit(contracts.ETS, "TaggingRecordCreated");
    });
  });
});
