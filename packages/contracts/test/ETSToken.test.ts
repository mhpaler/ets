import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { zeroAddress } from "viem";
import { loadIgnitionFixture } from "./fixtures/ignitionFixture.js";

// NOTE: ETSChannel.test.ts for tag creation tests.

describe("ETSToken Tests", async () => {
  const { accounts, contracts, publicClient } = await loadIgnitionFixture();

  describe("Valid setup", () => {
    it("should have Access controls set to ETSAccessControls contract", async () => {
      const accessControls = await contracts.ETSToken.read.etsAccessControls();
      assert.equal(accessControls.toLowerCase(), contracts.ETSAccessControls.address.toLowerCase());
    });

    it("should have correct Zora configuration", async () => {
      // Check that Zora factory address is set
      const zoraFactory = await contracts.ETSToken.read.zoraFactoryAddress();
      assert.notEqual(zoraFactory, zeroAddress);

      // Check that Zora creator EOA is set
      const zoraCreatorEOA = await contracts.ETSToken.read.zoraCreatorEOA();
      assert.notEqual(zoraCreatorEOA, zeroAddress);

      // Check that Zora platform referrer is set
      const zoraPlatformReferrer = await contracts.ETSToken.read.zoraPlatformReferrer();
      assert.notEqual(zoraPlatformReferrer, zeroAddress);
    });
  });

  describe("Administrator role", () => {
    it("should be able to set max tag length", async () => {
      // Test that non-admin cannot set max tag length
      try {
        await contracts.ETSToken.write.setTagMaxStringLength([55], { account: accounts.User1.account });
        assert.fail("Should have reverted");
      } catch (error: any) {
        assert.ok(error.message.includes("revert") || error.message.includes("AccessDenied"));
      }

      const currentMaxLength = await contracts.ETSToken.read.tagMaxStringLength();
      assert.equal(currentMaxLength, 32n);

      await contracts.ETSToken.write.setTagMaxStringLength([64], { account: accounts.ETSPlatform.account });
      const newMaxLength = await contracts.ETSToken.read.tagMaxStringLength();
      assert.equal(newMaxLength, 64n);
    });

    it("should be able to set min tag length", async () => {
      // Test that non-admin cannot set min tag length
      try {
        await contracts.ETSToken.write.setTagMinStringLength([5], { account: accounts.User1.account });
        assert.fail("Should have reverted");
      } catch (error: any) {
        assert.ok(error.message.includes("revert") || error.message.includes("AccessDenied"));
      }

      const currentMinLength = await contracts.ETSToken.read.tagMinStringLength();
      assert.equal(currentMinLength, 2n);

      await contracts.ETSToken.write.setTagMinStringLength([3], { account: accounts.ETSPlatform.account });
      const newMinLength = await contracts.ETSToken.read.tagMinStringLength();
      assert.equal(newMinLength, 3n);
    });
  });

  describe("computeCoinAddress", () => {
    it("should compute deterministic addresses for tag strings", async () => {
      const tag1 = "#Bitcoin";
      const tag2 = "#Ethereum";

      const address1 = await contracts.ETSToken.read.computeCoinAddress([tag1]);
      const address2 = await contracts.ETSToken.read.computeCoinAddress([tag2]);

      // Addresses should be different for different tags
      assert.notEqual(address1, address2);

      // Same tag should always produce same address
      const address1Again = await contracts.ETSToken.read.computeCoinAddress([tag1]);
      assert.equal(address1, address1Again);

      // Addresses should be valid Ethereum addresses (start with 0x and be 42 chars)
      assert.ok(address1.startsWith("0x") && address1.length === 42);
      assert.ok(address2.startsWith("0x") && address2.length === 42);
    });

    it("should be case-insensitive (normalized)", async () => {
      const tag1 = "#Bitcoin";
      const tag2 = "#bitcoin";
      const tag3 = "#BITCOIN";

      const address1 = await contracts.ETSToken.read.computeCoinAddress([tag1]);
      const address2 = await contracts.ETSToken.read.computeCoinAddress([tag2]);
      const address3 = await contracts.ETSToken.read.computeCoinAddress([tag3]);

      // All should produce the same address due to normalization
      assert.equal(address1, address2);
      assert.equal(address2, address3);
    });
  });

  describe("tagExistsByAddress", () => {
    it("should return false for non-existent TAG", async () => {
      const tag = "#NonExistentTag";
      const coinAddress = await contracts.ETSToken.read.computeCoinAddress([tag]);

      const exists = await contracts.ETSToken.read.tagExistsByAddress([coinAddress]);
      assert.equal(exists, false);
    });

    it("should return true for existing TAG", async () => {
      const tag = "#TestTagExists";

      // Create TAG through ETS core (using write with account)
      await contracts.ETS.write.createTag([tag, accounts.User3.account.address], {
        account: accounts.ETSPlatform.account,
      });

      const coinAddress = await contracts.ETSToken.read.computeCoinAddress([tag]);
      const exists = await contracts.ETSToken.read.tagExistsByAddress([coinAddress]);

      assert.equal(exists, true);
    });
  });

  describe("tagExistsByString", () => {
    it("should return false for non-existent TAG", async () => {
      const tag = "#NonExistentTag";

      const exists = await contracts.ETSToken.read.tagExistsByString([tag]);
      assert.equal(exists, false);
    });

    it("should return true for existing TAG", async () => {
      const tag = "#TestTagString";

      // Create TAG through ETS core (using write with account)
      await contracts.ETS.write.createTag([tag, accounts.User3.account.address], {
        account: accounts.ETSPlatform.account,
      });

      const exists = await contracts.ETSToken.read.tagExistsByString([tag]);
      assert.equal(exists, true);
    });

    it("should be case-insensitive", async () => {
      const tag = "#TestTagCase";

      // Create TAG through ETS core (using write with account)
      await contracts.ETS.write.createTag([tag, accounts.User3.account.address], {
        account: accounts.ETSPlatform.account,
      });

      // Should find the tag regardless of case
      assert.equal(await contracts.ETSToken.read.tagExistsByString(["#testtagcase"]), true);
      assert.equal(await contracts.ETSToken.read.tagExistsByString(["#TESTTAGCASE"]), true);
      assert.equal(await contracts.ETSToken.read.tagExistsByString(["#TestTagCase"]), true);
    });
  });

  describe("getTagByAddress", () => {
    it("should return empty struct for non-existent TAG", async () => {
      const tag = "#NonExistentTag";
      const coinAddress = await contracts.ETSToken.read.computeCoinAddress([tag]);

      const tagData = await contracts.ETSToken.read.getTagByAddress([coinAddress]);

      assert.equal(tagData.coinAddress, zeroAddress);
      assert.equal(tagData.originalInput, "");
      assert.equal(tagData.displayVersion, "");
      assert.equal(tagData.machineName, "");
    });

    it("should return correct TAG data for existing TAG", async () => {
      const tag = "#TestTagByAddress";
      const creator = accounts.User3.account.address;

      // Create TAG through ETS core via channel
      await contracts.ETS.write.createTag([tag, creator], { account: accounts.ETSPlatform.account });

      const coinAddress = await contracts.ETSToken.read.computeCoinAddress([tag]);
      const tagData = await contracts.ETSToken.read.getTagByAddress([coinAddress]);

      assert.equal(tagData.coinAddress.toLowerCase(), coinAddress.toLowerCase());
      assert.equal(tagData.originalInput, tag);
      assert.equal(tagData.displayVersion, tag);
      assert.equal(tagData.creator.toLowerCase(), creator.toLowerCase());
      assert.equal(tagData.channel.toLowerCase(), accounts.ETSPlatform.account.address.toLowerCase());
    });
  });

  describe("getTagByString", () => {
    it("should return empty struct for non-existent TAG", async () => {
      const tag = "#NonExistentTag";

      const tagData = await contracts.ETSToken.read.getTagByString([tag]);

      assert.equal(tagData.coinAddress, zeroAddress);
      assert.equal(tagData.originalInput, "");
      assert.equal(tagData.displayVersion, "");
      assert.equal(tagData.machineName, "");
    });

    it("should return correct TAG data for existing TAG", async () => {
      const tag = "#TestTagByString";
      const creator = accounts.User3.account.address;

      // Create TAG through ETS core via channel
      await contracts.ETS.write.createTag([tag, creator], { account: accounts.ETSPlatform.account });

      const tagData = await contracts.ETSToken.read.getTagByString([tag]);

      assert.equal(tagData.originalInput, tag);
      assert.equal(tagData.displayVersion, tag);
      assert.equal(tagData.creator.toLowerCase(), creator.toLowerCase());
      assert.equal(tagData.channel.toLowerCase(), accounts.ETSPlatform.account.address.toLowerCase());

      // Verify coin address matches computed address
      const expectedCoinAddress = await contracts.ETSToken.read.computeCoinAddress([tag]);
      assert.equal(tagData.coinAddress.toLowerCase(), expectedCoinAddress.toLowerCase());
    });
  });

  describe("Tag Counter", () => {
    it("should initialize totalTagsCreated to 0", async () => {
      const totalTags = await contracts.ETSToken.read.totalTagsCreated();
      assert.ok(totalTags >= 0n, "totalTagsCreated should be initialized");
    });

    it("should increment totalTagsCreated when creating a tag", async () => {
      const initialCount = await contracts.ETSToken.read.totalTagsCreated();
      const tag = "#CounterTest1";
      const creator = accounts.User1.account.address;

      // Create TAG through ETS core
      await contracts.ETS.write.createTag([tag, creator], { account: accounts.ETSPlatform.account });

      const newCount = await contracts.ETSToken.read.totalTagsCreated();
      assert.equal(newCount, initialCount + 1n, "totalTagsCreated should increment by 1");
    });

    it("should emit TagCreated event with sequential tagId", async () => {
      const initialCount = await contracts.ETSToken.read.totalTagsCreated();
      const tag = "#CounterTest2";
      const creator = accounts.User2.account.address;

      // Create TAG and get transaction receipt
      const hash = await contracts.ETS.write.createTag([tag, creator], { account: accounts.ETSPlatform.account });
      const receipt = await publicClient.waitForTransactionReceipt({ hash });

      // Parse all logs from the transaction
      const logs = await publicClient.getContractEvents({
        abi: contracts.ETSToken.abi,
        address: contracts.ETSToken.address,
        fromBlock: receipt.blockNumber,
        toBlock: receipt.blockNumber,
      });

      // Find the TagCreated event
      const tagCreatedEvent = logs.find((log) => log.eventName === "TagCreated");
      assert.ok(tagCreatedEvent, "TagCreated event should be emitted");

      // Verify tagId
      const eventArgs = tagCreatedEvent.args as any;
      assert.equal(eventArgs.tagId, initialCount + 1n, "tagId should match expected counter value");
    });

    it("should maintain sequential tagIds across multiple tag creations", async () => {
      const startCount = await contracts.ETSToken.read.totalTagsCreated();

      // Create 3 tags
      const tags = ["#Sequential1", "#Sequential2", "#Sequential3"];
      const creator = accounts.User3.account.address;

      for (const tag of tags) {
        await contracts.ETS.write.createTag([tag, creator], { account: accounts.ETSPlatform.account });
      }

      const endCount = await contracts.ETSToken.read.totalTagsCreated();
      assert.equal(endCount, startCount + 3n, "totalTagsCreated should increment by 3");
    });

    it("should not increment counter for duplicate tag creation attempts", async () => {
      const tag = "#DuplicateTest";
      const creator = accounts.User4.account.address;

      // Create tag first time
      await contracts.ETS.write.createTag([tag, creator], { account: accounts.ETSPlatform.account });
      const countAfterFirst = await contracts.ETSToken.read.totalTagsCreated();

      // Try to create same tag again (should fail)
      try {
        await contracts.ETS.write.createTag([tag, creator], { account: accounts.ETSPlatform.account });
        assert.fail("Should have reverted for duplicate tag");
      } catch (error: any) {
        assert.ok(error.message.includes("revert") || error.message.includes("TagAlreadyExists"));
      }

      const countAfterSecond = await contracts.ETSToken.read.totalTagsCreated();
      assert.equal(countAfterSecond, countAfterFirst, "Counter should not increment for failed tag creation");
    });
  });
});
