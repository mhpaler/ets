import { expect } from "chai";
import { ethers } from "hardhat";
import type { Accounts, Contracts } from "./setup";
import { setup } from "./setup";

// NOTE: ETSRelayer.test.ts for tag creation tests.

describe("ETSToken Tests", () => {
  let accounts: Accounts;
  let contracts: Contracts;

  beforeEach("Setup test", async () => {
    const result = await setup();
    ({ accounts, contracts } = result);
  });

  describe("Valid setup", () => {
    it("should have Access controls set to ETSAccessControls contract", async () => {
      expect(await contracts.ETSToken.etsAccessControls()).to.be.equal(await contracts.ETSAccessControls.getAddress());
    });

    it("should have correct Zora configuration", async () => {
      // Check that Zora factory address is set
      const zoraFactory = await contracts.ETSToken.zoraFactoryAddress();
      expect(zoraFactory).to.not.equal(ethers.ZeroAddress);

      // Check that Zora creator EOA is set
      const zoraCreatorEOA = await contracts.ETSToken.zoraCreatorEOA();
      expect(zoraCreatorEOA).to.not.equal(ethers.ZeroAddress);

      // Check that Zora platform referrer is set
      const zoraPlatformReferrer = await contracts.ETSToken.zoraPlatformReferrer();
      expect(zoraPlatformReferrer).to.not.equal(ethers.ZeroAddress);
    });
  });

  describe("Administrator role", () => {
    it("should be able to set max tag length", async () => {
      await expect(contracts.ETSToken.connect(accounts.Buyer).setTagMaxStringLength(55)).to.be.revertedWithCustomError(
        contracts.ETSToken,
        "AccessDenied",
      );

      const currentMaxLength = await contracts.ETSToken.tagMaxStringLength();
      expect(currentMaxLength).to.be.equal(32);

      await contracts.ETSToken.connect(accounts.ETSPlatform).setTagMaxStringLength(64);
      const newMaxLength = await contracts.ETSToken.tagMaxStringLength();
      expect(newMaxLength).to.be.equal(64);
    });

    it("should be able to set min tag length", async () => {
      await expect(contracts.ETSToken.connect(accounts.Buyer).setTagMinStringLength(5)).to.be.revertedWithCustomError(
        contracts.ETSToken,
        "AccessDenied",
      );

      const currentMinLength = await contracts.ETSToken.tagMinStringLength();
      expect(currentMinLength).to.be.equal(2);

      await contracts.ETSToken.connect(accounts.ETSPlatform).setTagMinStringLength(3);
      const newMinLength = await contracts.ETSToken.tagMinStringLength();
      expect(newMinLength).to.be.equal(3);
    });
  });

  describe("computeCoinAddress", () => {
    it("should compute deterministic addresses for tag strings", async () => {
      const tag1 = "#Bitcoin";
      const tag2 = "#Ethereum";

      const address1 = await contracts.ETSToken.computeCoinAddress(tag1);
      const address2 = await contracts.ETSToken.computeCoinAddress(tag2);

      // Addresses should be different for different tags
      expect(address1).to.not.equal(address2);

      // Same tag should always produce same address
      const address1Again = await contracts.ETSToken.computeCoinAddress(tag1);
      expect(address1).to.equal(address1Again);

      // Addresses should be valid Ethereum addresses
      expect(ethers.isAddress(address1)).to.be.true;
      expect(ethers.isAddress(address2)).to.be.true;
    });

    it("should be case-insensitive (normalized)", async () => {
      const tag1 = "#Bitcoin";
      const tag2 = "#bitcoin";
      const tag3 = "#BITCOIN";

      const address1 = await contracts.ETSToken.computeCoinAddress(tag1);
      const address2 = await contracts.ETSToken.computeCoinAddress(tag2);
      const address3 = await contracts.ETSToken.computeCoinAddress(tag3);

      // All should produce the same address due to normalization
      expect(address1).to.equal(address2);
      expect(address2).to.equal(address3);
    });
  });

  describe("tagExistsByAddress", () => {
    it("should return false for non-existent TAG", async () => {
      const tag = "#NonExistentTag";
      const coinAddress = await contracts.ETSToken.computeCoinAddress(tag);

      const exists = await contracts.ETSToken.tagExistsByAddress(coinAddress);
      expect(exists).to.be.false;
    });

    it("should return true for existing TAG", async () => {
      const tag = "#TestTag";

      // Create TAG through ETS core via relayer
      await contracts.ETS.connect(accounts.ETSPlatform).createTag(tag, accounts.RandomTwo.address);

      const coinAddress = await contracts.ETSToken.computeCoinAddress(tag);
      const exists = await contracts.ETSToken.tagExistsByAddress(coinAddress);

      expect(exists).to.be.true;
    });
  });

  describe("tagExistsByString", () => {
    it("should return false for non-existent TAG", async () => {
      const tag = "#NonExistentTag";

      const exists = await contracts.ETSToken.tagExistsByString(tag);
      expect(exists).to.be.false;
    });

    it("should return true for existing TAG", async () => {
      const tag = "#TestTag";

      // Create TAG through ETS core via relayer
      await contracts.ETS.connect(accounts.ETSPlatform).createTag(tag, accounts.RandomTwo.address);

      const exists = await contracts.ETSToken.tagExistsByString(tag);
      expect(exists).to.be.true;
    });

    it("should be case-insensitive", async () => {
      const tag = "#TestTag";

      // Create TAG through ETS core via relayer
      await contracts.ETS.connect(accounts.ETSPlatform).createTag(tag, accounts.RandomTwo.address);

      // Should find the tag regardless of case
      expect(await contracts.ETSToken.tagExistsByString("#testtag")).to.be.true;
      expect(await contracts.ETSToken.tagExistsByString("#TESTTAG")).to.be.true;
      expect(await contracts.ETSToken.tagExistsByString("#TestTag")).to.be.true;
    });
  });

  describe("getTagByAddress", () => {
    it("should return empty struct for non-existent TAG", async () => {
      const tag = "#NonExistentTag";
      const coinAddress = await contracts.ETSToken.computeCoinAddress(tag);

      const tagData = await contracts.ETSToken.getTagByAddress(coinAddress);

      expect(tagData.coinAddress).to.equal(ethers.ZeroAddress);
      expect(tagData.originalInput).to.equal("");
      expect(tagData.displayVersion).to.equal("");
      expect(tagData.machineName).to.equal("");
    });

    it("should return correct TAG data for existing TAG", async () => {
      const tag = "#TestTag";
      const creator = accounts.RandomTwo.address;

      // Create TAG through ETS core via relayer
      await contracts.ETS.connect(accounts.ETSPlatform).createTag(tag, creator);

      const coinAddress = await contracts.ETSToken.computeCoinAddress(tag);
      const tagData = await contracts.ETSToken.getTagByAddress(coinAddress);

      expect(tagData.coinAddress).to.equal(coinAddress);
      expect(tagData.originalInput).to.equal(tag);
      expect(tagData.displayVersion).to.equal(tag);
      expect(tagData.creator).to.equal(creator);
      expect(tagData.relayer).to.equal(accounts.ETSPlatform.address);
    });
  });

  describe("getTagByString", () => {
    it("should return empty struct for non-existent TAG", async () => {
      const tag = "#NonExistentTag";

      const tagData = await contracts.ETSToken.getTagByString(tag);

      expect(tagData.coinAddress).to.equal(ethers.ZeroAddress);
      expect(tagData.originalInput).to.equal("");
      expect(tagData.displayVersion).to.equal("");
      expect(tagData.machineName).to.equal("");
    });

    it("should return correct TAG data for existing TAG", async () => {
      const tag = "#TestTag";
      const creator = accounts.RandomTwo.address;

      // Create TAG through ETS core via relayer
      await contracts.ETS.connect(accounts.ETSPlatform).createTag(tag, creator);

      const tagData = await contracts.ETSToken.getTagByString(tag);

      expect(tagData.originalInput).to.equal(tag);
      expect(tagData.displayVersion).to.equal(tag);
      expect(tagData.creator).to.equal(creator);
      expect(tagData.relayer).to.equal(accounts.ETSPlatform.address);

      // Verify coin address matches computed address
      const expectedCoinAddress = await contracts.ETSToken.computeCoinAddress(tag);
      expect(tagData.coinAddress).to.equal(expectedCoinAddress);
    });
  });
});
