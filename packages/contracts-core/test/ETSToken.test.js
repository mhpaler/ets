const { setup } = require("./setup.js");
const { ethers, upgrades } = require("hardhat");
const { expect, assert } = require("chai");
const { BigNumber, constants } = ethers;

//let accounts, factories, ETSAccessControls, ETSLifeCycleControls, ETSToken;

describe("ETSToken Core Tests", function () {
  // we create a setup function that can be called by every test and setup variable for easy to read tests
  beforeEach("Setup test", async function () {
    [accounts, ETSAccessControls, ETSToken, ETSAuctionHouse, WETH, auctionSettings] = await setup();
  });

  describe("Valid setup", async function () {
    it("should have name and symbol", async function () {
      expect(await ETSToken.name()).to.be.equal("Ethereum Tag Service");
      expect(await ETSToken.symbol()).to.be.equal("CTAG");
      expect(await ETSToken.platform()).to.be.equal(accounts.ETSPlatform.address);
    });
  });


  describe("Only administrator", async function () {
    it("should be able to set platform as owner", async function () {
      await expect(ETSToken.connect(accounts.Buyer).setPlatform(accounts.RandomOne.address)).to.be.revertedWith(
        "Caller must have administrator access",
      );

      expect(await ETSToken.platform()).to.be.equal(accounts.ETSPlatform.address);
      await ETSToken.connect(accounts.ETSAdmin).setPlatform(accounts.RandomOne.address);
      expect(await ETSToken.platform()).to.be.equal(accounts.RandomOne.address);
    });

    it("should be able to set max tag length as admin", async function () {
      expect(await ETSAccessControls.isAdmin(accounts.ETSAdmin.address)).to.be.equal(true);
      const currentMaxLength = await ETSToken.tagMaxStringLength();
      expect(currentMaxLength).to.be.equal(32);
      await ETSToken.connect(accounts.ETSAdmin).setTagMaxStringLength(64);
      const newMaxLength = await ETSToken.tagMaxStringLength();
      expect(newMaxLength).to.be.equal(64);
    });

    it("should be able to set max tag length", async function () {
      await expect(ETSToken.connect(accounts.Buyer).setTagMaxStringLength(55)).to.be.revertedWith(
        "Caller must have administrator access",
      );
    });

    it("should be able to set access controls", async function () {
      await ETSToken.connect(accounts.ETSAdmin).setAccessControls(accounts.RandomTwo.address);
      expect(await ETSToken.etsAccessControls()).to.be.equal(accounts.RandomTwo.address);

      await expect(ETSToken.connect(accounts.RandomTwo).setAccessControls(accounts.RandomTwo.address)).to.be
        .reverted;
    });
  });

  describe("Setting access controls", async () => {
    it("should revert when setting to zero address", async function () {
      await expect(
        ETSToken.connect(accounts.ETSAdmin).setAccessControls(constants.AddressZero),
      ).to.be.revertedWith("ETS: Access controls cannot be zero");
    });
  });

  describe("Minting tags", async function () {
    describe("Validation", function () {
      const RandomTwoTag = "asupersupersupersupersuperlongasstag";

      it("should revert if exists (case-insensitive)", async function () {
        await ETSToken.connect(accounts.ETSPublisher).createTag(
          "#blockrocket",
          accounts.ETSPublisher.address
        );

        await expect(
          ETSToken.connect(accounts.ETSPublisher).createTag(
            "#BlockRocket",
            accounts.ETSPublisher.address
          ),
        ).to.be.revertedWith("ERC721: token already minted");
      });

      it("should revert if tag does not meet min length requirements", async function () {
        const tagMinStringLength = await ETSToken.tagMinStringLength();
        const shortTag = "#" + RandomTwoTag.substring(0, tagMinStringLength - 2);
        await expect(
          ETSToken.connect(accounts.ETSPublisher).createTag(
            shortTag,
            accounts.ETSPublisher.address
          ),
        ).to.be.revertedWith(`Invalid format: tag does not meet min/max length requirements`);
      });

      it("should revert if tag exceeds max length requirements", async function () {
        const tagMaxStringLength = await ETSToken.tagMaxStringLength();
        const longTag = "#" + RandomTwoTag.substring(0, tagMaxStringLength);
        await expect(
          ETSToken.connect(accounts.ETSPublisher).createTag(
            longTag,
            accounts.ETSPublisher.address
          ),
        ).to.be.revertedWith(`Invalid format: tag does not meet min/max length requirements`);
      });

      it("should revert if tag has spaces", async function () {
        const invalidTag = "#x art";
        await expect(
          ETSToken.connect(accounts.ETSPublisher).createTag(
            invalidTag,
            accounts.ETSPublisher.address
          ),
        ).to.be.revertedWith("Space found: tag may not contain spaces");
      });

      it("should revert if does not start with #", async function () {
        const invalidTag = "ART";
        await expect(
          ETSToken.connect(accounts.ETSPublisher).createTag(
            invalidTag,
            accounts.ETSPublisher.address
          ),
        ).to.be.revertedWith("Tag must start with #");
      });

      it("should revert if tag prefix found after first char", async function () {
        const invalidTag = "#Hash#";
        await expect(
          ETSToken.connect(accounts.ETSPublisher).createTag(
            invalidTag,
            accounts.ETSPublisher.address
          ),
        ).to.be.revertedWith("Tag may not contain prefix");
      });

      it("should allow a mix of upper and lowercase characters", async function () {
        await ETSToken.connect(accounts.ETSPublisher).createTag(
          "#Awesome123",
          accounts.ETSPublisher.address
        );
      });
    });

    it("should mint", async function () {
      const tag = "#BlockRocket";
      const lowerTag = "#blockrocket";
      await ETSToken.connect(accounts.RandomTwo).createTag(
        tag,
        accounts.ETSPublisher.address
      );

      const tokenId = await ETSToken.computeTagId(tag);
      const tagData = await ETSToken.tokenIdToTag(tokenId.toString());

      // The following gives ETSToken.tagExists is not a function!!
      // expect(await ETSToken.tagExists(tokenId)).to.be.equal(true);
      expect(tagData.displayVersion.toLowerCase()).to.be.equal(lowerTag);
      expect(tagData.displayVersion).to.be.equal(tag);
      expect(tagData.originalPublisher).to.be.equal(accounts.ETSPublisher.address);
      expect(tagData.creator).to.be.equal(accounts.RandomTwo.address);
    });

    it("should mint from platform", async function () {
      const tag = "#blockrocket";
      await ETSToken.connect(accounts.ETSPlatform);
      await ETSToken.createTag(tag, accounts.ETSPublisher.address);

      const tokenId = await ETSToken.computeTagId(tag);
      const tagData = await ETSToken.tokenIdToTag(tokenId.toString());

      expect(tagData.displayVersion.toLowerCase()).to.be.equal("#blockrocket");
      expect(tagData.originalPublisher).to.be.equal(accounts.ETSPublisher.address);
    });

    it("should revert if the publisher is not whitelisted", async function () {
      await expect(
        ETSToken.connect(accounts.ETSPlatform).createTag("#blockrocket", accounts.RandomTwo.address),
      ).to.be.revertedWith("ETS: Not a publisher");
    });
  });

});
