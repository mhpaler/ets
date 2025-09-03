import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { loadETSCoreFixture } from "./fixtures/etsCoreFixture.js";

describe("ETS Core Tagging Fees", async () => {
  const { accounts, contracts, tagStrings, tagAddresses, testTarget, taggingFee } = await loadETSCoreFixture();
  const { tagstring1, tagstring2, tagstring3, tagstring4 } = tagStrings;
  const { etsTag1, etsTag2, etsTag3, userTag1 } = tagAddresses;
  const { targetURI, targetId } = testTarget;
  
  let taggingRecordId: bigint;

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
      await contracts.ETS.write.applyTagsWithCompositeKey([
        tags,
        targetId,
        "bookmark",
        accounts.RandomOne.account.address,
        accounts.ETSPlatform.account.address,
      ], {
        value: taggingFee * BigInt(2),
        account: accounts.ETSPlatform.account,
      });

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

  describe("Tagging fees should accrue", async () => {
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

      await contracts.ETS.write.applyTagsWithRawInput([
        rawInput,
        accounts.RandomTwo.account.address,
        accounts.ETSPlatform.account.address,
      ], {
        value: taggingFee,
        account: accounts.ETSPlatform.account,
      });

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
      await contracts.ETS.write.applyTagsWithRawInput([
        rawInput,
        accounts.RandomTwo.account.address,
        accounts.ETSPlatform.account.address,
      ], {
        value: taggingFee,
        account: accounts.ETSPlatform.account,
      });

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
});