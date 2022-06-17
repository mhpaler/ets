const { setup } = require("./setup.js");
const { ethers, upgrades } = require("hardhat");
const { expect, assert } = require("chai");
const { BigNumber, constants } = ethers;

//let accounts, factories, contracts.ETSAccessControls, ETSLifeCycleControls, contracts.ETSToken;

describe("ETSToken Core Tests", function () {
  // we create a setup function that can be called by every test and setup variable for easy to read tests
  beforeEach("Setup test", async function () {
    [accounts, contracts, initSettings] = await setup();
  });

  describe("Valid setup", async function () {
    it("should have name and symbol", async function () {
      expect(await contracts.ETSToken.name()).to.be.equal("Ethereum Tag Service");
      expect(await contracts.ETSToken.symbol()).to.be.equal("CTAG");
      expect(await contracts.ETSToken.platform()).to.be.equal(accounts.ETSPlatform.address);
    });
  });


  describe("Only administrator", async function () {
    it("should be able to set platform as owner", async function () {
      await expect(contracts.ETSToken.connect(accounts.Buyer).setPlatform(accounts.RandomOne.address)).to.be.revertedWith(
        "Caller must have administrator access",
      );

      expect(await contracts.ETSToken.platform()).to.be.equal(accounts.ETSPlatform.address);
      await contracts.ETSToken.connect(accounts.ETSAdmin).setPlatform(accounts.RandomOne.address);
      expect(await contracts.ETSToken.platform()).to.be.equal(accounts.RandomOne.address);
    });

    it("should be able to set max tag length as admin", async function () {
      expect(await contracts.ETSAccessControls.isAdmin(accounts.ETSAdmin.address)).to.be.equal(true);
      const currentMaxLength = await contracts.ETSToken.tagMaxStringLength();
      expect(currentMaxLength).to.be.equal(32);
      await contracts.ETSToken.connect(accounts.ETSAdmin).setTagMaxStringLength(64);
      const newMaxLength = await contracts.ETSToken.tagMaxStringLength();
      expect(newMaxLength).to.be.equal(64);
    });

    it("should be able to set max tag length", async function () {
      await expect(contracts.ETSToken.connect(accounts.Buyer).setTagMaxStringLength(55)).to.be.revertedWith(
        "Caller must have administrator access",
      );
    });

    it("should be able to set access controls", async function () {
      await contracts.ETSToken.connect(accounts.ETSAdmin).setAccessControls(accounts.RandomTwo.address);
      expect(await contracts.ETSToken.etsAccessControls()).to.be.equal(accounts.RandomTwo.address);

      await expect(contracts.ETSToken.connect(accounts.RandomTwo).setAccessControls(accounts.RandomTwo.address)).to.be
        .reverted;
    });
  });

  describe("Setting access controls", async () => {
    it("should revert when setting to zero address", async function () {
      await expect(
        contracts.ETSToken.connect(accounts.ETSAdmin).setAccessControls(constants.AddressZero),
      ).to.be.revertedWith("ETS: Access controls cannot be zero");
    });
  });

  describe("Minting tags", async function () {
    describe("Validation", function () {
      const RandomTwoTag = "asupersupersupersupersuperlongasstag";

      it("should revert if exists (case-insensitive)", async function () {
        await contracts.ETSToken.connect(accounts.ETSPlatform).createTag(
          "#blockrocket",
          accounts.ETSPlatform.address
        );

        await expect(
          contracts.ETSToken.connect(accounts.ETSPlatform).createTag(
            "#BlockRocket",
            accounts.ETSPlatform.address
          ),
        ).to.be.revertedWith("ERC721: token already minted");
      });

      it("should revert if tag does not meet min length requirements", async function () {
        const tagMinStringLength = await contracts.ETSToken.tagMinStringLength();
        const shortTag = "#" + RandomTwoTag.substring(0, tagMinStringLength - 2);
        await expect(
          contracts.ETSToken.connect(accounts.ETSPlatform).createTag(
            shortTag,
            accounts.ETSPlatform.address
          ),
        ).to.be.revertedWith(`Invalid format: tag does not meet min/max length requirements`);
      });

      it("should revert if tag exceeds max length requirements", async function () {
        const tagMaxStringLength = await contracts.ETSToken.tagMaxStringLength();
        const longTag = "#" + RandomTwoTag.substring(0, tagMaxStringLength);
        await expect(
          contracts.ETSToken.connect(accounts.ETSPlatform).createTag(
            longTag,
            accounts.ETSPlatform.address
          ),
        ).to.be.revertedWith(`Invalid format: tag does not meet min/max length requirements`);
      });

      it("should revert if tag has spaces", async function () {
        const invalidTag = "#x art";
        await expect(
          contracts.ETSToken.connect(accounts.ETSPlatform).createTag(
            invalidTag,
            accounts.ETSPlatform.address
          ),
        ).to.be.revertedWith("Space found: tag may not contain spaces");
      });

      it("should revert if does not start with #", async function () {
        const invalidTag = "ART";
        await expect(
          contracts.ETSToken.connect(accounts.ETSPlatform).createTag(
            invalidTag,
            accounts.ETSPlatform.address
          ),
        ).to.be.revertedWith("Tag must start with #");
      });

      it("should revert if tag prefix found after first char", async function () {
        const invalidTag = "#Hash#";
        await expect(
          contracts.ETSToken.connect(accounts.ETSPlatform).createTag(
            invalidTag,
            accounts.ETSPlatform.address
          ),
        ).to.be.revertedWith("Tag may not contain prefix");
      });

      it("should allow a mix of upper and lowercase characters", async function () {
        await contracts.ETSToken.connect(accounts.ETSPlatform).createTag(
          "#Awesome123",
          accounts.ETSPlatform.address
        );
      });
    });

    it("should mint", async function () {
      const tag = "#BlockRocket";
      const lowerTag = "#blockrocket";
      await contracts.ETSToken.connect(accounts.RandomTwo).createTag(
        tag,
        accounts.ETSPlatform.address
      );

      const tokenId = await contracts.ETSToken.computeTagId(tag);
      const tagData = await contracts.ETSToken.tokenIdToTag(tokenId.toString());

      // The following gives contracts.ETSToken.tagExists is not a function!!
      // expect(await contracts.ETSToken.tagExists(tokenId)).to.be.equal(true);
      expect(tagData.displayVersion.toLowerCase()).to.be.equal(lowerTag);
      expect(tagData.displayVersion).to.be.equal(tag);
      expect(tagData.originalPublisher).to.be.equal(accounts.ETSPlatform.address);
      expect(tagData.creator).to.be.equal(accounts.RandomTwo.address);
    });

    it("should mint from platform", async function () {
      const tag = "#blockrocket";
      await contracts.ETSToken.connect(accounts.ETSPlatform);
      await contracts.ETSToken.createTag(tag, accounts.ETSPlatform.address);

      const tokenId = await contracts.ETSToken.computeTagId(tag);
      const tagData = await contracts.ETSToken.tokenIdToTag(tokenId.toString());

      expect(tagData.displayVersion.toLowerCase()).to.be.equal("#blockrocket");
      expect(tagData.originalPublisher).to.be.equal(accounts.ETSPlatform.address);
    });

    it("should revert if the publisher is not whitelisted", async function () {
      await expect(
        contracts.ETSToken.connect(accounts.ETSPlatform).createTag("#blockrocket", accounts.RandomTwo.address),
      ).to.be.revertedWith("ETS: Not a publisher");
    });
  });

  describe("Platform", async function () {
    it("should be able to set platform as owner", async function () {
      expect(await contracts.ETSToken.platform()).to.be.equal(accounts.ETSPlatform.address);

      await contracts.ETSToken.connect(accounts.ETSAdmin).setPlatform(accounts.RandomOne.address);

      expect(await contracts.ETSToken.platform()).to.be.equal(accounts.RandomOne.address);
    });

    it("should revert if not owner", async function () {
      await expect(contracts.ETSToken.connect(accounts.Buyer).setPlatform(accounts.RandomOne.address)).to.be.revertedWith(
        "Caller must have administrator access",
      );
    });

    it("should set access controls", async function () {
      await contracts.ETSToken.connect(accounts.ETSAdmin).setAccessControls(accounts.RandomTwo.address);
      expect(await contracts.ETSToken.etsAccessControls()).to.be.equal(accounts.RandomTwo.address);

      await expect(contracts.ETSToken.connect(accounts.RandomTwo).setAccessControls(accounts.RandomTwo.address)).to.be
        .reverted;
    });

    it("should revert when updating access controls to zero address", async function () {
      await expect(
        contracts.ETSToken.connect(accounts.ETSAdmin).setAccessControls(constants.AddressZero),
      ).to.be.revertedWith("ETS: Access controls cannot be zero");
    });
  });

  describe("Admin functions", async function () {
    it("should be able to set max tag length as admin", async function () {
      expect(await contracts.ETSAccessControls.isAdmin(accounts.ETSAdmin.address)).to.be.equal(true);
      const currentMaxLength = await contracts.ETSToken.tagMaxStringLength();
      expect(currentMaxLength).to.be.equal(32);
      await contracts.ETSToken.connect(accounts.ETSAdmin).setTagMaxStringLength(64);
      const newMaxLength = await contracts.ETSToken.tagMaxStringLength();
      expect(newMaxLength).to.be.equal(64);
    });

    it("should revert if setting max tag length if not admin", async function () {
      await expect(contracts.ETSToken.connect(accounts.Buyer).setTagMaxStringLength(55)).to.be.revertedWith(
        "Caller must have administrator access",
      );
    });
  });

  describe("Premium tags", function () {
    const premiumTags = ["#apple", "#google"]

    describe("preSetPremiumTags", function () {
      it('Can set up premium tags pre-minting as admin', async function () {
        for(let i = 0; i < premiumTags.length; i++) {
          expect(
            await contracts.ETSToken.isTagPremium(premiumTags[i])
          ).to.be.false
        }

        await contracts.ETSToken.connect(accounts.ETSAdmin).preSetPremiumTags(
          premiumTags,
          true
        )

        for(let j = 0; j < premiumTags.length; j++) {
          expect(
            await contracts.ETSToken.isTagPremium(premiumTags[j])
          ).to.be.true
        }
      })

      it('Pre-minting, premium status can be revoked', async function () {
        await contracts.ETSToken.connect(accounts.ETSAdmin).preSetPremiumTags(
          premiumTags,
          true
        )

        for(let j = 0; j < premiumTags.length; j++) {
          expect(
            await contracts.ETSToken.isTagPremium(premiumTags[j])
          ).to.be.true
        }

        await contracts.ETSToken.connect(accounts.ETSAdmin).preSetPremiumTags(
          premiumTags,
          false
        )

        for(let i = 0; i < premiumTags.length; i++) {
          expect(
            await contracts.ETSToken.isTagPremium(premiumTags[i])
          ).to.be.false
        }
      })

      it('Cannot set up if not admin', async function () {
        await expect(
          contracts.ETSToken.connect(accounts.RandomTwo).preSetPremiumTags(
            premiumTags,
            true
          )
        ).to.be.revertedWith("Caller must have administrator access")
      })
    })

    describe("setPremiumFlag", function () {
      it('Can update premium flag for minted tag as admin', async function () {
        await contracts.ETSToken.connect(accounts.ETSAdmin).preSetPremiumTags(
          premiumTags,
          true
        )

        const tagString = premiumTags[0]
        await contracts.ETSToken.connect(accounts.RandomTwo).createTag(
          tagString,
          accounts.ETSPlatform.address
        )

        const tokenId = await contracts.ETSToken.computeTagId(tagString)
        const tag = await contracts.ETSToken.getTag(tokenId)
        expect(tag.premium).to.be.true
        expect(tag.reserved).to.be.true

        await contracts.ETSToken.connect(accounts.ETSAdmin).setPremiumFlag(
          [tokenId],
          false
        )

        const tagAfter = await contracts.ETSToken.getTag(tokenId)
        expect(tagAfter.premium).to.be.false
        expect(tagAfter.reserved).to.be.true
      })
    })

    describe("setReservedFlag", function () {
      it('Can update released flag for minted tag as admin', async function () {
        await contracts.ETSToken.connect(accounts.ETSAdmin).preSetPremiumTags(
          premiumTags,
          true
        )

        const tagString = premiumTags[0]
        await contracts.ETSToken.connect(accounts.RandomTwo).createTag(
          tagString,
          accounts.ETSPlatform.address
        )

        const tokenId = await contracts.ETSToken.computeTagId(tagString)
        const tag = await contracts.ETSToken.getTag(tokenId)
        expect(tag.premium).to.be.true
        expect(tag.reserved).to.be.true

        await contracts.ETSToken.connect(accounts.ETSAdmin).setReservedFlag(
          [tokenId],
          true
        )

        const tagAfter = await contracts.ETSToken.getTag(tokenId)
        expect(tagAfter.premium).to.be.true
        expect(tagAfter.reserved).to.be.true
      })
    })
  })
});
