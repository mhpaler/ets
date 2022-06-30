const {setup} = require("./setup.js");
const {ethers} = require("hardhat");
const {expect, assert} = require("chai");
const {constants} = ethers;

//let accounts, factories, contracts.ETSAccessControls, ETSLifeCycleControls, contracts.ETSToken;

describe("ETSToken Core Tests", function () {
  // we create a setup function that can be called by every test and setup variable for easy to read tests
  beforeEach("Setup test", async function () {
    [accounts, contracts, initSettings] = await setup();
  });

  describe("Valid setup", async function () {
    it("should have Platform address set to named account ETSPlatform", async function () {
      expect(await contracts.ETSToken.getPlatformAddress()).to.be.equal(accounts.ETSPlatform.address);
    });

    it("should have Platform address granted administrator role", async function () {
      expect(await contracts.ETSAccessControls.isAdmin(accounts.ETSPlatform.address)).to.be.equal(true);
    });

    it("should have Access controls set to ETSAccessControls contract", async function () {
      expect(await contracts.ETSToken.etsAccessControls()).to.be.equal(contracts.ETSAccessControls.address);
    });

    it("should have name and symbol", async function () {
      expect(await contracts.ETSToken.name()).to.be.equal("Ethereum Tag Service");
      expect(await contracts.ETSToken.symbol()).to.be.equal("CTAG");
      expect(await contracts.ETSToken.platform()).to.be.equal(accounts.ETSPlatform.address);
    });
  });

  describe("Administrator role", async function () {
    const tag = "#love";
    const premiumTags = ["#apple", "#google"];

    it("should be able to set Platform address", async function () {
      await expect(
        contracts.ETSToken.connect(accounts.Buyer).setPlatform(accounts.RandomOne.address),
      ).to.be.revertedWith("Caller must have administrator access");

      await contracts.ETSToken.connect(accounts.ETSPlatform).setPlatform(accounts.RandomOne.address);
      expect(await contracts.ETSToken.platform()).to.be.equal(accounts.RandomOne.address);
    });

    it("should be able to set max tag length", async function () {
      await expect(contracts.ETSToken.connect(accounts.Buyer).setTagMaxStringLength(55)).to.be.revertedWith(
        "Caller must have administrator access",
      );

      const currentMaxLength = await contracts.ETSToken.tagMaxStringLength();
      expect(currentMaxLength).to.be.equal(32);
      await contracts.ETSToken.connect(accounts.ETSPlatform).setTagMaxStringLength(64);
      const newMaxLength = await contracts.ETSToken.tagMaxStringLength();
      expect(newMaxLength).to.be.equal(64);
    });

    it("should be able to set access controls", async function () {
      await expect(contracts.ETSToken.connect(accounts.RandomTwo).setAccessControls(accounts.RandomOne.address)).to.be
        .reverted;
      await contracts.ETSToken.connect(accounts.ETSPlatform).setAccessControls(accounts.RandomTwo.address);
      expect(await contracts.ETSToken.etsAccessControls()).to.be.equal(accounts.RandomTwo.address);
    });

    it("Can create & edit premium tag pre-mint list", async function () {
      await expect(
        contracts.ETSToken.connect(accounts.RandomTwo).preSetPremiumTags(premiumTags, true),
      ).to.be.revertedWith("Caller must have administrator access");

      for (let i = 0; i < premiumTags.length; i++) {
        expect(await contracts.ETSToken.isTagPremium(premiumTags[i])).to.be.false;
      }
      await contracts.ETSToken.connect(accounts.ETSPlatform).preSetPremiumTags(premiumTags, true);

      for (let j = 0; j < premiumTags.length; j++) {
        expect(await contracts.ETSToken.isTagPremium(premiumTags[j])).to.be.true;
      }

      await contracts.ETSToken.connect(accounts.ETSPlatform).preSetPremiumTags(premiumTags, false);
      for (let i = 0; i < premiumTags.length; i++) {
        expect(await contracts.ETSToken.isTagPremium(premiumTags[i])).to.be.false;
      }
    });

    it("can set premium flag on CTAG", async function () {
      await contracts.ETSToken.connect(accounts.RandomTwo)["createTag(string)"](tag);
      const tokenId = await contracts.ETSToken.computeTagId(tag);
      let ctag = await contracts.ETSToken["getTag(uint256)"](tokenId);
      expect(ctag.premium).to.be.false;
      await contracts.ETSToken.connect(accounts.ETSPlatform).setPremiumFlag([tokenId], true);
      ctag = await contracts.ETSToken["getTag(uint256)"](tokenId);
      expect(ctag.premium).to.be.true;
      expect(ctag.reserved).to.be.false;
    });

    it("Can set reserved flag on CTAG", async function () {
      await contracts.ETSToken.connect(accounts.RandomTwo)["createTag(string)"](tag);
      const tokenId = await contracts.ETSToken.computeTagId(tag);
      let ctag = await contracts.ETSToken["getTag(uint256)"](tokenId);
      expect(ctag.reserved).to.be.false;
      await contracts.ETSToken.connect(accounts.ETSPlatform).setReservedFlag([tokenId], true);
      ctag = await contracts.ETSToken["getTag(uint256)"](tokenId);
      expect(ctag.reserved).to.be.true;
      expect(ctag.premium).to.be.false;
    });
  });

  describe("Setting access controls", async () => {
    it("should revert when setting to zero address", async function () {
      await expect(
        contracts.ETSToken.connect(accounts.ETSPlatform).setAccessControls(constants.AddressZero),
      ).to.be.revertedWith("Access controls cannot be zero");
    });
  });

  describe("Minting a CTAG", async function () {
    const tag = "#love";
    const RandomTwoTag = "asupersupersupersupersuperlongasstag";

    describe("(tag string validation)", async function () {
      // Tag string validation tests
      it("should revert if exists (case-insensitive)", async function () {
        await contracts.ETSToken.connect(accounts.RandomTwo)["createTag(string)"]("#love");
        await expect(contracts.ETSToken.connect(accounts.RandomTwo)["createTag(string)"]("#love")).to.be.revertedWith(
          "ERC721: token already minted",
        );
      });

      it("should revert if tag string does not meet min length requirements", async function () {
        const tagMinStringLength = await contracts.ETSToken.tagMinStringLength();
        const shortTag = "#" + RandomTwoTag.substring(0, tagMinStringLength - 2);
        await expect(
          contracts.ETSToken.connect(accounts.ETSPlatform)["createTag(string)"](shortTag),
        ).to.be.revertedWith(`Invalid format: tag does not meet min/max length requirements`);
      });

      it("should revert if tag string exceeds max length requirements", async function () {
        const tagMaxStringLength = await contracts.ETSToken.tagMaxStringLength();
        const longTag = "#" + RandomTwoTag.substring(0, tagMaxStringLength);
        await expect(contracts.ETSToken.connect(accounts.ETSPlatform)["createTag(string)"](longTag)).to.be.revertedWith(
          `Invalid format: tag does not meet min/max length requirements`,
        );
      });

      it("should revert if tag string has spaces", async function () {
        const invalidTag = "#x art";
        await expect(
          contracts.ETSToken.connect(accounts.ETSPlatform)["createTag(string)"](invalidTag),
        ).to.be.revertedWith("Space found: tag may not contain spaces");
      });

      it("should revert if tag string does not start with #", async function () {
        const invalidTag = "ART";
        await expect(
          contracts.ETSToken.connect(accounts.ETSPlatform)["createTag(string)"](invalidTag),
        ).to.be.revertedWith("Tag must start with #");
      });

      it("should revert if tag string prefix found after first char", async function () {
        const invalidTag = "#Hash#";
        await expect(
          contracts.ETSToken.connect(accounts.ETSPlatform)["createTag(string)"](invalidTag),
        ).to.be.revertedWith("Tag may not contain prefix");
      });

      it("should allow a mix of upper and lowercase characters in tag string", async function () {
        await contracts.ETSToken.connect(accounts.ETSPlatform)["createTag(string)"]("#Awesome123");
      });
    });

    // End tag string validation
    describe("(provenance & attribution)", async function () {
      it("should revert if the publisher has not activated", async function () {
        await expect(
          contracts.ETSToken.connect(accounts.RandomTwo)["createTag(string,address)"](
            "#love",
            accounts.RandomOne.address,
          ),
        ).to.be.revertedWith("ETS: Not a publisher");
      });

      it("should succeed if the publisher has activated their address", async function () {
        await contracts.ETSAccessControls.connect(accounts.RandomOne).togglePublisher();
        const tokenId = await contracts.ETSToken.computeTagId("#love");
        tx = await contracts.ETSToken.connect(accounts.RandomTwo)["createTag(string,address)"](
          "#love",
          accounts.RandomOne.address,
        );
        await expect(tx)
          .to.emit(contracts.ETSToken, "Transfer")
          .withArgs(constants.AddressZero, accounts.ETSPlatform.address, tokenId);
      });

      it("should set Platform as publisher if no publisher is supplied", async function () {
        await contracts.ETSToken.connect(accounts.RandomTwo)["createTag(string)"](tag);
        const tagData = await contracts.ETSToken["getTag(string)"](tag);
        expect(tagData.publisher).to.be.equal(accounts.ETSPlatform.address);
      });

      it("should succeed if Platform is both creator & publisher", async function () {
        await contracts.ETSToken.connect(accounts.ETSPlatform)["createTag(string)"](tag);
        assert((await contracts.ETSToken["tagExists(string)"](tag)) == true);
      });
    });

    describe("(CTAG struct/token attributes)", async function () {
      it("should store msg.sender as Creator", async function () {
        await contracts.ETSToken.connect(accounts.RandomTwo)["createTag(string)"](tag);
        const tagData = await contracts.ETSToken["getTag(string)"](tag);
        expect(tagData.creator).to.be.equal(accounts.RandomTwo.address);
      });

      it("should store the display version of the CTAG", async function () {
        const displayVersion = "#TagWithCapitals";
        const machineVersion = "#tagwithcapitals";
        await contracts.ETSToken.connect(accounts.RandomTwo)["createTag(string)"](displayVersion);
        const tagData = await contracts.ETSToken["getTag(string)"](machineVersion);
        expect(tagData.display).to.be.equal(displayVersion);
      });

      it("should flag CTAG as premium & reserved if it's on the premium list", async function () {
        const premiumTags = ["#apple", "#google"];
        await contracts.ETSToken.connect(accounts.ETSPlatform).preSetPremiumTags(premiumTags, true);
        await contracts.ETSToken.connect(accounts.RandomTwo)["createTag(string)"](premiumTags[0]);
        const tagData = await contracts.ETSToken["getTag(string)"](premiumTags[0]);
        expect(tagData.premium).to.be.equal(true);
        expect(tagData.reserved).to.be.equal(true);
      });
    });
  });
});
