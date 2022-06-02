const { ethers, upgrades } = require("hardhat");
const { expect, assert } = require("chai");
const { BigNumber, constants } = ethers;

let accounts, factories, ETSAccessControls, ETSLifeCycleControls, ETS;

describe("ETS Core Tests", function () {
  // we create a setup function that can be called by every test and setup variable for easy to read tests
  beforeEach("Setup test", async function () {
    // See namedAccounts section of hardhat.config.js
    const namedAccounts = await ethers.getNamedSigners();
    const unnamedAccounts = await ethers.getUnnamedSigners();
    accounts = {
      ETSAdmin: namedAccounts["ETSAdmin"],
      ETSPublisher: namedAccounts["ETSPublisher"],
      ETSPlatform: namedAccounts["ETSPlatform"],
      Buyer: unnamedAccounts[0],
      RandomOne: unnamedAccounts[1],
      RandomTwo: unnamedAccounts[2],
      Creator: unnamedAccounts[3],
    };

    factories = {
      ETSAccessControls: await ethers.getContractFactory("ETSAccessControls"),
      ETSLifeCycleControls: await ethers.getContractFactory("ETSLifeCycleControls"),
      ETS: await ethers.getContractFactory("ETS"),
    };

    // Deploy the initial proxy contract.
    ETSAccessControls = await upgrades.deployProxy(factories.ETSAccessControls, { kind: "uups" });
    assert((await ETSAccessControls.isAdmin(accounts.ETSAdmin.address)) === true);

    await ETSAccessControls.grantRole(
      await ETSAccessControls.SMART_CONTRACT_ROLE(),
      accounts.ETSAdmin.address,
      { from: accounts.ETSAdmin.address },
    );

    // add a publisher to the protocol
    await ETSAccessControls.grantRole(ethers.utils.id("PUBLISHER"), accounts.ETSPublisher.address);

    ETSLifeCycleControls = await upgrades.deployProxy(
      factories.ETSLifeCycleControls,
      [ETSAccessControls.address],
      { kind: "uups" },
    );

    assert((await ETSLifeCycleControls.version()) === "0.1.0");
    assert((await ETSLifeCycleControls.ets()) === constants.AddressZero);

    // Deploy the initial proxy contract.
    ETS = await upgrades.deployProxy(
      factories.ETS,
      [ETSAccessControls.address, ETSLifeCycleControls.address, accounts.ETSPlatform.address],
      { kind: "uups" },
    );

    await ETSLifeCycleControls.setETS(ETS.address);
   
  });

  describe("Validate setup", async function () {
    it("should have name and symbol", async function () {
      expect(await ETS.name()).to.be.equal("Ethereum Tag Service");
      expect(await ETS.symbol()).to.be.equal("CTAG");
      expect(await ETS.platform()).to.be.equal(accounts.ETSPlatform.address);
    });
    it("should have default configs", async function () {
      assert((await ETSLifeCycleControls.ets()) === ETS.address);
      assert((await ETS.lifeCycleControls()) === ETSLifeCycleControls.address);
    });

  });

  describe("Minting tags", async function () {
    describe("Validation", function () {
      const RandomTwoTag = "asupersupersupersupersuperlongasstag";

      it("should revert if exists (case-insensitive)", async function () {
        await ETS.connect(accounts.ETSPublisher).createTag(
          "#blockrocket",
          accounts.ETSPublisher.address
        );

        await expect(
          ETS.connect(accounts.ETSPublisher).createTag(
            "#BlockRocket",
            accounts.ETSPublisher.address
          ),
        ).to.be.revertedWith("ERC721: token already minted");
      });

      it("should revert if tag does not meet min length requirements", async function () {
        const tagMinStringLength = await ETS.tagMinStringLength();
        const shortTag = "#" + RandomTwoTag.substring(0, tagMinStringLength - 2);
        await expect(
          ETS.connect(accounts.ETSPublisher).createTag(
            shortTag,
            accounts.ETSPublisher.address
          ),
        ).to.be.revertedWith(`Invalid format: tag does not meet min/max length requirements`);
      });

      it("should revert if tag exceeds max length requirements", async function () {
        const tagMaxStringLength = await ETS.tagMaxStringLength();
        const longTag = "#" + RandomTwoTag.substring(0, tagMaxStringLength);
        await expect(
          ETS.connect(accounts.ETSPublisher).createTag(
            longTag,
            accounts.ETSPublisher.address
          ),
        ).to.be.revertedWith(`Invalid format: tag does not meet min/max length requirements`);
      });

      it("should revert if tag has spaces", async function () {
        const invalidTag = "#x art";
        await expect(
          ETS.connect(accounts.ETSPublisher).createTag(
            invalidTag,
            accounts.ETSPublisher.address
          ),
        ).to.be.revertedWith("Space found: tag may not contain spaces");
      });

      it("should revert if does not start with #", async function () {
        const invalidTag = "ART";
        await expect(
          ETS.connect(accounts.ETSPublisher).createTag(
            invalidTag,
            accounts.ETSPublisher.address
          ),
        ).to.be.revertedWith("Tag must start with #");
      });

      it("should revert if tag prefix found after first char", async function () {
        const invalidTag = "#Hash#";
        await expect(
          ETS.connect(accounts.ETSPublisher).createTag(
            invalidTag,
            accounts.ETSPublisher.address
          ),
        ).to.be.revertedWith("Tag may not contain prefix");
      });

      it("should allow a mix of upper and lowercase characters", async function () {
        await ETS.connect(accounts.ETSPublisher).createTag(
          "#Awesome123",
          accounts.ETSPublisher.address
        );
      });
    });

    it("should mint", async function () {
      const tag = "#BlockRocket";
      const lowerTag = "#blockrocket";
      await ETS.connect(accounts.RandomTwo).createTag(
        tag,
        accounts.ETSPublisher.address
      );

      const tokenId = await ETS.computeTagId(tag);
      const tagData = await ETS.tokenIdToTag(tokenId.toString());

      // The following gives ETS.tagExists is not a function!!
      // expect(await ETS.tagExists(tokenId)).to.be.equal(true);
      expect(tagData.displayVersion.toLowerCase()).to.be.equal(lowerTag);
      expect(tagData.displayVersion).to.be.equal(tag);
      expect(tagData.originalPublisher).to.be.equal(accounts.ETSPublisher.address);
      expect(tagData.creator).to.be.equal(accounts.RandomTwo.address);
    });

    it("should mint from platform", async function () {
      const tag = "#blockrocket";
      await ETS.connect(accounts.ETSPlatform);
      await ETS.createTag(tag, accounts.ETSPublisher.address);

      const tokenId = await ETS.computeTagId(tag);
      const tagData = await ETS.tokenIdToTag(tokenId.toString());

      expect(tagData.displayVersion.toLowerCase()).to.be.equal("#blockrocket");
      expect(tagData.originalPublisher).to.be.equal(accounts.ETSPublisher.address);
    });

    it("should revert if the publisher is not whitelisted", async function () {
      await expect(
        ETS.connect(accounts.ETSPlatform).createTag("#blockrocket", accounts.RandomTwo.address),
      ).to.be.revertedWith("Mint: The publisher must be whitelisted");
    });
  });

  describe("Platform", async function () {
    it("should be able to set platform as owner", async function () {
      expect(await ETS.platform()).to.be.equal(accounts.ETSPlatform.address);

      await ETS.connect(accounts.ETSAdmin).setPlatform(accounts.RandomOne.address);

      expect(await ETS.platform()).to.be.equal(accounts.RandomOne.address);
    });

    it("should revert if not owner", async function () {
      await expect(ETS.connect(accounts.Buyer).setPlatform(accounts.RandomOne.address)).to.be.revertedWith(
        "Caller must have administrator access",
      );
    });

    it("should set access controls", async function () {
      await ETS.connect(accounts.ETSAdmin).setAccessControls(accounts.RandomTwo.address);
      expect(await ETS.accessControls()).to.be.equal(accounts.RandomTwo.address);

      await expect(ETS.connect(accounts.RandomTwo).setAccessControls(accounts.RandomTwo.address)).to.be
        .reverted;
    });

    it("should revert when updating access controls to zero address", async function () {
      await expect(
        ETS.connect(accounts.ETSAdmin).setAccessControls(constants.AddressZero),
      ).to.be.revertedWith("ETS: Access controls cannot be zero");
    });
  });

  describe("Admin functions", async function () {
    it("should be able to set max tag length as admin", async function () {
      expect(await ETSAccessControls.isAdmin(accounts.ETSAdmin.address)).to.be.equal(true);

      const currentMaxLength = await ETS.tagMaxStringLength();
      expect(currentMaxLength).to.be.equal(32);

      await ETS.connect(accounts.ETSAdmin).setTagMaxStringLength(64);

      const newMaxLength = await ETS.tagMaxStringLength();
      expect(newMaxLength).to.be.equal(64);
    });

    it("should revert if setting max tag length if not admin", async function () {
      await expect(ETS.connect(accounts.Buyer).setTagMaxStringLength(55)).to.be.revertedWith(
        "Caller must have administrator access",
      );
    });
  });

});
