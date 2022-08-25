const {setup, getFactories} = require("./setup.js");
const {ethers, upgrades} = require("hardhat");
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
      expect(await contracts.ETSAccessControls.getPlatformAddress()).to.be.equal(accounts.ETSPlatform.address);
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
    });
  });

  describe("Administrator role", async function () {
    const tag = "#love";
    const premiumTags = ["#apple", "#google"];

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
      await contracts.ETS.connect(accounts.ETSPlatform).createTag(tag, accounts.RandomTwo.address);
      //await contracts.ETS.connect(accounts.ETSPlatform).createTag(tag, accounts.RandomTwo.address);
      const tokenId = await contracts.ETSToken.computeTagId(tag);
      let ctag = await contracts.ETSToken.getTagById(tokenId);
      expect(ctag.premium).to.be.false;
      await contracts.ETSToken.connect(accounts.ETSPlatform).setPremiumFlag([tokenId], true);
      ctag = await contracts.ETSToken.getTagById(tokenId);
      expect(ctag.premium).to.be.true;
      expect(ctag.reserved).to.be.false;
    });

    it("Can set reserved flag on CTAG", async function () {
      await contracts.ETS.connect(accounts.ETSPlatform).createTag(tag, accounts.RandomTwo.address);
      const tokenId = await contracts.ETSToken.computeTagId(tag);
      let ctag = await contracts.ETSToken.getTagById(tokenId);
      expect(ctag.reserved).to.be.false;
      await contracts.ETSToken.connect(accounts.ETSPlatform).setReservedFlag([tokenId], true);
      ctag = await contracts.ETSToken.getTagById(tokenId);
      expect(ctag.reserved).to.be.true;
      expect(ctag.premium).to.be.false;
    });
  });

  describe("Setting access controls", async () => {
    it("should revert if set to zero address", async function () {
      await expect(
        contracts.ETS.connect(accounts.ETSPlatform).setAccessControls(constants.AddressZero),
      ).to.be.revertedWith("Address cannot be zero");
    });

    it("should revert if caller is not administrator", async function () {
      await expect(contracts.ETSToken.connect(accounts.RandomTwo).setAccessControls(accounts.RandomOne.address)).to.be
        .reverted;
    });

    it("should revert if a access controls is set to a non-access control contract", async function () {
      await expect(contracts.ETS.connect(accounts.ETSPlatform).setAccessControls(accounts.RandomTwo.address)).to.be
        .reverted;
    });

    it("should revert if caller is not set as admin in contract being set.", async function () {
      factories = await getFactories();
      const ETSAccessControlsNew = await upgrades.deployProxy(factories.ETSAccessControls, [], {kind: "uups"});

      // ETS Platform is not set as admin in access controls.
      await expect(
        contracts.ETS.connect(accounts.ETSPlatform).setAccessControls(ETSAccessControlsNew.address),
      ).to.be.revertedWith("Caller not admin in new contract");
    });

    it("should emit AccessControlsSet", async function () {
      factories = await getFactories();
      const ETSAccessControlsNew = await upgrades.deployProxy(factories.ETSAccessControls, [], {kind: "uups"});

      await expect(contracts.ETSToken.connect(accounts.ETSAdmin).setAccessControls(ETSAccessControlsNew.address))
        .to.emit(contracts.ETSToken, "AccessControlsSet")
        .withArgs(ETSAccessControlsNew.address);
      expect(await contracts.ETSToken.etsAccessControls()).to.be.equal(ETSAccessControlsNew.address);
    });
  });

  describe("Minting a CTAG", async function () {
    const tag = "#love";
    const RandomTwoTag = "asupersupersupersupersuperlongasstag";

    describe("(tag string validation)", async function () {
      // Tag string validation tests
      it("should revert if exists (case-insensitive)", async function () {
        await contracts.ETS.connect(accounts.ETSPlatform).createTag("#love", accounts.RandomTwo.address);
        await expect(
          contracts.ETS.connect(accounts.ETSPlatform).createTag("#love", accounts.RandomTwo.address),
        ).to.be.revertedWith("ERC721: token already minted");
      });

      it("should revert if tag string does not meet min length requirements", async function () {
        const tagMinStringLength = await contracts.ETSToken.tagMinStringLength();
        const shortTag = "#" + RandomTwoTag.substring(0, tagMinStringLength - 2);
        await expect(
          contracts.ETS.connect(accounts.ETSPlatform).createTag(shortTag, accounts.RandomTwo.address),
        ).to.be.revertedWith(`Invalid format: tag does not meet min/max length requirements`);
      });

      it("should revert if tag string exceeds max length requirements", async function () {
        const tagMaxStringLength = await contracts.ETSToken.tagMaxStringLength();
        const longTag = "#" + RandomTwoTag.substring(0, tagMaxStringLength);
        await expect(
          contracts.ETS.connect(accounts.ETSPlatform).createTag(longTag, accounts.RandomTwo.address),
        ).to.be.revertedWith(`Invalid format: tag does not meet min/max length requirements`);
      });

      it("should revert if tag string has spaces", async function () {
        const invalidTag = "#x art";
        await expect(
          contracts.ETS.connect(accounts.ETSPlatform).createTag(invalidTag, accounts.RandomTwo.address),
        ).to.be.revertedWith("Space found: tag may not contain spaces");
      });

      it("should revert if tag string does not start with #", async function () {
        const invalidTag = "ART";
        await expect(
          contracts.ETS.connect(accounts.ETSPlatform).createTag(invalidTag, accounts.RandomTwo.address),
        ).to.be.revertedWith("Tag must start with #");
      });

      it("should revert if tag string prefix found after first char", async function () {
        const invalidTag = "#Hash#";
        await expect(
          contracts.ETS.connect(accounts.ETSPlatform).createTag(invalidTag, accounts.RandomTwo.address),
        ).to.be.revertedWith("Tag may not contain prefix");
      });

      it("should allow a mix of upper and lowercase characters in tag string", async function () {
        await contracts.ETS.connect(accounts.ETSPlatform).createTag("#Awesome123", accounts.RandomTwo.address);
      });
    });

    // End tag string validation
    describe("(provenance & attribution)", async function () {
      it("should revert if caller is not a publisher", async function () {
        await expect(
          contracts.ETS.connect(accounts.RandomTwo).createTag("#Awesome123", accounts.RandomOne.address),
        ).to.be.revertedWith("Caller not Publisher");
      });

      it("should succeed if Platform is both creator & publisher", async function () {
        await contracts.ETS.connect(accounts.ETSPlatform).createTag(tag, accounts.ETSPlatform.address);
        assert((await contracts.ETSToken.tagExistsByString(tag)) == true);
      });
    });

    describe("(CTAG struct/token attributes)", async function () {
      it("should store msg.sender as Creator", async function () {
        await contracts.ETS.connect(accounts.ETSPlatform).createTag(tag, accounts.RandomTwo.address);
        const tagData = await contracts.ETSToken.getTagByString(tag);
        expect(tagData.creator).to.be.equal(accounts.RandomTwo.address);
      });

      it("should store the display version of the CTAG", async function () {
        const displayVersion = "#TagWithCapitals";
        await contracts.ETS.connect(accounts.ETSPlatform).createTag(displayVersion, accounts.RandomTwo.address);
        const tagData = await contracts.ETSToken.getTagByString(displayVersion);
        expect(tagData.display.toString()).to.be.equal(displayVersion);
      });

      it("should flag CTAG as premium & reserved if it's on the premium list", async function () {
        const premiumTags = ["#apple", "#google"];
        await contracts.ETSToken.connect(accounts.ETSPlatform).preSetPremiumTags(premiumTags, true);
        await contracts.ETS.connect(accounts.ETSPlatform).createTag(premiumTags[0], accounts.RandomTwo.address);
        const tagData = await contracts.ETSToken.getTagByString(premiumTags[0]);
        expect(tagData.premium).to.be.equal(true);
        expect(tagData.reserved).to.be.equal(true);
      });
    });
  });
});
