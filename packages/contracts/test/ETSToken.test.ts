import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { zeroAddress } from "viem";
import { loadIgnitionFixture } from "./fixtures/ignitionFixture.js";

// NOTE: ETSRelayer.test.ts for tag creation tests.

describe("ETSToken Tests", async () => {
  const { accounts, contracts } = await loadIgnitionFixture();

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

      // Create TAG through ETS core via relayer
      await contracts.ETS.write.createTag([tag, creator], { account: accounts.ETSPlatform.account });

      const coinAddress = await contracts.ETSToken.read.computeCoinAddress([tag]);
      const tagData = await contracts.ETSToken.read.getTagByAddress([coinAddress]);

      assert.equal(tagData.coinAddress.toLowerCase(), coinAddress.toLowerCase());
      assert.equal(tagData.originalInput, tag);
      assert.equal(tagData.displayVersion, tag);
      assert.equal(tagData.creator.toLowerCase(), creator.toLowerCase());
      assert.equal(tagData.relayer.toLowerCase(), accounts.ETSPlatform.account.address.toLowerCase());
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

      // Create TAG through ETS core via relayer
      await contracts.ETS.write.createTag([tag, creator], { account: accounts.ETSPlatform.account });

      const tagData = await contracts.ETSToken.read.getTagByString([tag]);

      assert.equal(tagData.originalInput, tag);
      assert.equal(tagData.displayVersion, tag);
      assert.equal(tagData.creator.toLowerCase(), creator.toLowerCase());
      assert.equal(tagData.relayer.toLowerCase(), accounts.ETSPlatform.account.address.toLowerCase());

      // Verify coin address matches computed address
      const expectedCoinAddress = await contracts.ETSToken.read.computeCoinAddress([tag]);
      assert.equal(tagData.coinAddress.toLowerCase(), expectedCoinAddress.toLowerCase());
    });
  });
});
