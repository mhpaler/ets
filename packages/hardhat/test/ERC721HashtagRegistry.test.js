const { expectEvent } = require("@openzeppelin/test-helpers");

const { ethers, upgrades, artifacts } = require("hardhat");
const { expect, assert } = require("chai");

const { utils, constants } = ethers;

let accounts, factories, artifact, HashtagAccessControls, HashtagProtocol, ERC721HashtagRegistry, ERC721Mock;
let taggingFee, platformPercentage, publisherPercentage, taggerPercentage;

describe("ERC721HashtagRegistry", function () {
  beforeEach("Setup test", async function () {
    // See namedAccounts section of hardhat.config.js
    const namedAccounts = await ethers.getNamedSigners();
    const unnamedAccounts = await ethers.getUnnamedSigners();
    accounts = {
      HashtagAdmin: namedAccounts["accountHashtagAdmin"],
      HashtagPublisher: namedAccounts["accountHashtagPublisher"],
      HashtagPlatform: namedAccounts["accountHashtagPlatform"],
      Buyer: unnamedAccounts[0],
      RandomOne: unnamedAccounts[1],
      RandomTwo: unnamedAccounts[2],
      Creator: unnamedAccounts[3],
      Tagger: unnamedAccounts[4],
    };

    factories = {
      HashtagAccessControls: await ethers.getContractFactory("HashtagAccessControls"),
      HashtagProtocol: await ethers.getContractFactory("HashtagProtocol"),
      ERC721HashtagRegistry: await ethers.getContractFactory("ERC721HashtagRegistry"),
      ERC721BurnableMock: await ethers.getContractFactory("ERC721BurnableMock"),
    };

    artifact = {
      ERC721HashtagRegistry: await artifacts.readArtifactSync("ERC721HashtagRegistry"),
    };

    // Deploy the initial proxy contract.
    HashtagAccessControls = await upgrades.deployProxy(factories.HashtagAccessControls, { kind: "uups" });
    assert((await HashtagAccessControls.isAdmin(accounts.HashtagAdmin.address)) === true);

    await HashtagAccessControls.grantRole(
      await HashtagAccessControls.SMART_CONTRACT_ROLE(),
      accounts.HashtagAdmin.address,
      { from: accounts.HashtagAdmin.address },
    );

    // add a publisher to the protocol
    await HashtagAccessControls.grantRole(ethers.utils.id("PUBLISHER"), accounts.HashtagPublisher.address);

    // Deploy the initial proxy contract.
    HashtagProtocol = await upgrades.deployProxy(
      factories.HashtagProtocol,
      [HashtagAccessControls.address, accounts.HashtagPlatform.address],
      { kind: "uups" },
    );

    ERC721HashtagRegistry = await upgrades.deployProxy(
      factories.ERC721HashtagRegistry,
      [HashtagAccessControls.address, HashtagProtocol.address],
      { kind: "uups" },
    );

    ERC721Mock = await factories.ERC721BurnableMock.deploy("NFT", "NFT");
    await ERC721Mock.deployed();

    // Fetch tags fee
    taggingFee = await ERC721HashtagRegistry.tagFee();
    taggingFee = taggingFee.toString();

    platformPercentage = await ERC721HashtagRegistry.platformPercentage();
    platformPercentage = platformPercentage.toString();

    publisherPercentage = await ERC721HashtagRegistry.publisherPercentage();
    publisherPercentage = publisherPercentage.toString();

    taggerPercentage = await ERC721HashtagRegistry.remainingPercentage();
    taggerPercentage = taggerPercentage.toString();

    // Set permitted target NFT chain id.
    await ERC721HashtagRegistry.setPermittedNftChainId(constants.One, true);

    // Mint a HASHTAG token for tagging.
    await HashtagProtocol.mint("#kittypower", accounts.HashtagPublisher.address, accounts.Tagger.address);
    //await HashtagProtocol.hashtagToTokenId("#kittypower");

    // Mint two target nfts.
    const nftOneId = constants.One;
    const nftTwoId = constants.Two;
    await ERC721Mock.mint(accounts.RandomOne.address, nftOneId); //#1
    await ERC721Mock.mint(accounts.RandomOne.address, nftTwoId); //#2
  });

  describe("Validate setup", function () {
    describe("Initial state", async function () {
      it("should have total tags of zero", async function () {
        expect(await ERC721HashtagRegistry.totalTags()).to.be.equal("0");
      });

      it("should have Eth mainnet (chain id 1) permitted", async function () {
        expect((await ERC721HashtagRegistry.getPermittedNftChainId(1)) == true);
      });

      it("should have Polygon mainnet (chain id 137) not permitted", async function () {
        expect((await ERC721HashtagRegistry.getPermittedNftChainId(137)) == false);
      });
    });
  });

  describe("Only addresses with Admin access", async function () {
    it("can set tag fee", async function () {
      expect(await ERC721HashtagRegistry.tagFee()).to.be.equal(taggingFee);
      await ERC721HashtagRegistry.connect(accounts.HashtagAdmin).setTagFee(utils.parseEther("1"));
      expect(await ERC721HashtagRegistry.tagFee()).to.be.equal(utils.parseEther("1"));

      await expect(ERC721HashtagRegistry.connect(accounts.RandomTwo).setTagFee(utils.parseEther("1"))).to.be.reverted;
    });

    it("should update access controls", async function () {
      await ERC721HashtagRegistry.connect(accounts.HashtagAdmin).updateAccessControls(accounts.RandomTwo.address);
      expect(await ERC721HashtagRegistry.accessControls()).to.be.equal(accounts.RandomTwo.address);

      await expect(ERC721HashtagRegistry.connect(accounts.RandomTwo).updateAccessControls(accounts.RandomTwo.address))
        .to.be.reverted;
    });

    it("should revert when updating access controls to zero address", async function () {
      await expect(
        ERC721HashtagRegistry.connect(accounts.HashtagAdmin).updateAccessControls(constants.AddressZero),
      ).to.be.revertedWith("ERC721HashtagRegistry.updateAccessControls: Cannot be zero");
    });
  });

  describe("Tagging", async function () {
    it("should be able to mint and tag", async function () {
      const targetNftId = constants.One;
      const targetNftChainId = constants.One;

      // Try tagging with a new hashtag.
      const receipt = await ERC721HashtagRegistry.connect(accounts.Tagger).tag(
        "#macbook",
        ERC721Mock.address,
        targetNftId,
        accounts.HashtagPublisher.address,
        accounts.Tagger.address,
        targetNftChainId,
        { value: taggingFee },
      );

      await expectEvent.inTransaction(receipt.hash, artifact.ERC721HashtagRegistry, "HashtagRegistered", {
        tagger: accounts.Tagger.address,
        nftContract: ERC721Mock.address,
        publisher: accounts.HashtagPublisher.address,
        hashtagId: constants.Two,
        nftId: targetNftId,
        tagId: constants.One,
        tagFee: taggingFee,
        nftChainId: targetNftChainId,
      });

      expect(await ERC721HashtagRegistry.totalTags()).to.be.equal(1);

      const {
        _hashtagId,
        _nftContract,
        _nftId,
        _tagger,
        _tagstamp,
        _publisher,
        _nftChainId,
      } = await ERC721HashtagRegistry.getTagInfo(constants.One);

      // The newly minted HASHTAG should have id = 2
      // because HASHTAG #1 was minted in the setup script.
      expect(_hashtagId).to.be.equal(constants.Two);
      expect(_nftContract).to.be.equal(ERC721Mock.address);
      expect(_nftId).to.be.equal(targetNftId);
      expect(_tagger).to.be.equal(accounts.Tagger.address);
      expect(_tagstamp).to.exist;
      expect(Number(_tagstamp.toString())).to.be.gt(0);
      expect(_publisher).to.be.equal(accounts.HashtagPublisher.address);
      expect(_nftChainId).to.be.equal(targetNftChainId);

      // Check accrued values
      // Only one tag event happened, so it's tagging fee/participant %
      expect(await ERC721HashtagRegistry.accrued(accounts.HashtagPublisher.address)).to.be.equal(
        taggingFee * (publisherPercentage / 100),
      );
      expect(await ERC721HashtagRegistry.accrued(accounts.HashtagPlatform.address)).to.be.equal(
        taggingFee * (platformPercentage / 100),
      );
      expect(await ERC721HashtagRegistry.accrued(accounts.Tagger.address)).to.be.equal(
        taggingFee * (taggerPercentage / 100),
      );
    });

    it("should be able to tag a cryptokittie with #kittypower (pre-auction of #kittypower)", async function () {
      const targetNftId = constants.One;
      const targetNftChainId = constants.One;
      const tagId = constants.One; // the id of the tagging event.

      const receipt = await ERC721HashtagRegistry.connect(accounts.Tagger).tag(
        "#kittypower",
        ERC721Mock.address,
        targetNftId,
        accounts.HashtagPublisher.address,
        accounts.Tagger.address,
        targetNftChainId,
        { value: taggingFee },
      );

      await expectEvent.inTransaction(receipt.hash, artifact.ERC721HashtagRegistry, "HashtagRegistered", {
        tagger: accounts.Tagger.address,
        nftContract: ERC721Mock.address,
        publisher: accounts.HashtagPublisher.address,
        hashtagId: constants.One,
        nftId: targetNftId,
        tagId: constants.One,
        tagFee: taggingFee,
        nftChainId: targetNftChainId,
      });

      expect(await ERC721HashtagRegistry.totalTags()).to.be.equal(1);

      const {
        _hashtagId,
        _nftContract,
        _nftId,
        _tagger,
        _tagstamp,
        _publisher,
        _nftChainId,
      } = await ERC721HashtagRegistry.getTagInfo(tagId);

      expect(_hashtagId).to.be.equal(constants.One);
      expect(_nftContract).to.be.equal(ERC721Mock.address);
      expect(_nftId).to.be.equal(targetNftId);
      expect(_tagger).to.be.equal(accounts.Tagger.address);
      expect(_tagstamp).to.exist;
      expect(Number(_tagstamp.toString())).to.be.gt(0);
      expect(_publisher).to.be.equal(accounts.HashtagPublisher.address);
      expect(_nftChainId).to.be.equal(targetNftChainId);

      // check accrued values
      expect(await ERC721HashtagRegistry.accrued(accounts.HashtagPublisher.address)).to.be.equal(
        taggingFee * (publisherPercentage / 100),
      );
      expect(await ERC721HashtagRegistry.accrued(accounts.HashtagPlatform.address)).to.be.equal(
        taggingFee * (platformPercentage / 100),
      );
      expect(await ERC721HashtagRegistry.accrued(accounts.Tagger.address)).to.be.equal(
        taggingFee * (taggerPercentage / 100),
      );
    });

    it("should be able to tag a Polygon NFT with #kittycat (pre-auction of #kittycat)", async function () {
      // Attempt to tag this actual Matic NFT
      // https://opensea.io/assets/matic/0xd5a5ddd6f4e7d839db2978e8a4ee9923ac088cb3/9268
      const targetNftAddress = utils.getAddress("0xd5a5ddd6f4e7d839db2978e8a4ee9923ac088cb3");
      const targetNftId = "9368";
      const matic = "137";

      // Permit tagging of assets on chain id 137.
      await ERC721HashtagRegistry.connect(accounts.HashtagAdmin).setPermittedNftChainId(matic, true);
      expect((await ERC721HashtagRegistry.getPermittedNftChainId(matic)) == true);

      const receipt = await ERC721HashtagRegistry.connect(accounts.Tagger).tag(
        "#kittypower",
        targetNftAddress,
        targetNftId,
        accounts.HashtagPublisher.address,
        accounts.Tagger.address,
        matic,
        { value: taggingFee },
      );

      await expectEvent.inTransaction(receipt.hash, artifact.ERC721HashtagRegistry, "HashtagRegistered", {
        tagger: accounts.Tagger.address,
        nftContract: targetNftAddress,
        publisher: accounts.HashtagPublisher.address,
        hashtagId: constants.One,
        nftId: targetNftId,
        tagId: constants.One,
        tagFee: taggingFee,
        nftChainId: matic,
      });
    });

    it("should be able to tag a cryptokittie on mainnet with #kittypower (pre and post auction of #kittypower)", async function () {
      const targetNftChainId = constants.One;
      const targetNftId = constants.One;

      // Tag pre auction and make sure that accrued values are correct
      await ERC721HashtagRegistry.connect(accounts.Tagger).tag(
        "#kittypower",
        ERC721Mock.address,
        targetNftId,
        accounts.HashtagPublisher.address,
        accounts.Tagger.address,
        targetNftChainId,
        { value: taggingFee },
      );

      expect(await ERC721HashtagRegistry.totalTags()).to.be.equal(1);

      const {
        _hashtagId,
        _nftContract,
        _nftId,
        _tagger,
        _tagstamp,
        _publisher,
        _nftChainId,
      } = await ERC721HashtagRegistry.getTagInfo(constants.One);

      expect(_hashtagId).to.be.equal(constants.One);
      expect(_nftContract).to.be.equal(ERC721Mock.address);
      expect(_nftId).to.be.equal(targetNftId);
      expect(_tagger).to.be.equal(accounts.Tagger.address);
      expect(_tagstamp).to.exist;
      expect(Number(_tagstamp.toString())).to.be.gt(0);
      expect(_publisher).to.be.equal(accounts.HashtagPublisher.address);
      expect(_nftChainId).to.be.equal(targetNftChainId);

      // check accrued values
      expect(await ERC721HashtagRegistry.accrued(accounts.HashtagPublisher.address)).to.be.equal(
        taggingFee * (publisherPercentage / 100),
      );
      expect(await ERC721HashtagRegistry.accrued(accounts.HashtagPlatform.address)).to.be.equal(
        taggingFee * (platformPercentage / 100),
      );
      expect(await ERC721HashtagRegistry.accrued(accounts.Tagger.address)).to.be.equal(
        taggingFee * (taggerPercentage / 100),
      );
    });

    it("should be able to tag a cryptokittie on mainnet with #kittycat (pre and post auction of #kittycat)", async function () {
      // Tag pre auction and make sure that accrued values are correct
      const targetNftId = constants.One;
      const targetNftChainId = constants.One;

      // Tag targetNft #1.
      await ERC721HashtagRegistry.connect(accounts.Tagger).tag(
        "#kittypower",
        ERC721Mock.address,
        targetNftId,
        accounts.HashtagPublisher.address,
        accounts.Tagger.address,
        targetNftChainId,
        { value: taggingFee },
      );

      expect(await ERC721HashtagRegistry.totalTags()).to.be.equal(1);

      // check accrued values
      expect(await ERC721HashtagRegistry.accrued(accounts.HashtagPublisher.address)).to.be.equal(
        taggingFee * (publisherPercentage / 100),
      );
      expect(await ERC721HashtagRegistry.accrued(accounts.HashtagPlatform.address)).to.be.equal(
        taggingFee * (platformPercentage / 100),
      );
      expect(await ERC721HashtagRegistry.accrued(accounts.Tagger.address)).to.be.equal(
        taggingFee * (taggerPercentage / 100),
      );

      // Transfer #kittypower to accountBuyer. Simulates purchase.
      await HashtagProtocol.connect(accounts.HashtagPlatform).transferFrom(
        accounts.HashtagPlatform.address,
        accounts.Buyer.address,
        constants.One,
      );

      // Tag targetNFT #2 with #kittypower.
      const targetNftTwo = constants.Two;
      await ERC721HashtagRegistry.connect(accounts.Tagger).tag(
        "#kittypower",
        ERC721Mock.address,
        targetNftTwo,
        accounts.HashtagPublisher.address,
        accounts.Tagger.address,
        targetNftChainId,
        { value: taggingFee },
      );

      expect(await ERC721HashtagRegistry.totalTags()).to.be.equal(2);

      // Now check accrued for all players. Publisher 2x tags, Platform 2x tags,
      // accounts.Tagger and accountBuyer 1x tag each.
      expect(await ERC721HashtagRegistry.totalDue(accounts.HashtagPublisher.address)).to.be.equal(
        2 * (taggingFee * (publisherPercentage / 100)),
      );
      expect(await ERC721HashtagRegistry.totalDue(accounts.HashtagPlatform.address)).to.be.equal(
        2 * (taggingFee * (platformPercentage / 100)),
      );
      expect(await ERC721HashtagRegistry.totalDue(accounts.Tagger.address)).to.be.equal(
        taggingFee * (taggerPercentage / 100),
      );
      expect(await ERC721HashtagRegistry.totalDue(accounts.Buyer.address)).to.be.equal(
        taggingFee * (taggerPercentage / 100),
      );
    });

    it("mints new HASHTAG when it does not exist", async function () {
      const targetNftChainId = constants.One;
      const targetNftId = constants.One;

      const receipt = await ERC721HashtagRegistry.connect(accounts.HashtagPublisher).tag(
        "#unknowntag", // Non-existent HASHTAG
        ERC721Mock.address,
        constants.One,
        accounts.HashtagPublisher.address,
        accounts.Tagger.address,
        targetNftChainId,
        { value: taggingFee },
      );

      await expectEvent.inTransaction(receipt.hash, artifact.ERC721HashtagRegistry, "HashtagRegistered", {
        tagger: accounts.Tagger.address,
        nftContract: ERC721Mock.address,
        publisher: accounts.HashtagPublisher.address,
        hashtagId: "2",
        nftId: targetNftId,
        tagId: constants.One,
        tagFee: taggingFee,
        nftChainId: targetNftChainId,
      });
    });

    it("Reverts when new hashtag is invalid.", async function () {
      const targetNftChainId = constants.One;

      await expect(
        ERC721HashtagRegistry.tag(
          "#bad hashtag",
          HashtagProtocol.address,
          constants.One,
          accounts.HashtagPublisher.address,
          accounts.Tagger.address,
          targetNftChainId,
          { value: taggingFee },
        ),
      ).to.be.revertedWith("Invalid character found: Hashtag may only contain characters A-Z, a-z, 0-9 and #");
    });

    it("Reverts when target NFT is HASHTAG token.", async function () {
      const targetNftChainId = constants.One;

      await expect(
        ERC721HashtagRegistry.tag(
          "#kittypower",
          HashtagProtocol.address,
          constants.One,
          accounts.HashtagPublisher.address,
          accounts.Tagger.address,
          targetNftChainId,
          { value: taggingFee },
        ),
      ).to.be.revertedWith("Invalid tag - you are attempting to tag another hashtag");
    });

    it("Reverts when missing tagging fee during mint and tag.", async function () {
      const targetNftChainId = constants.One;

      await expect(
        ERC721HashtagRegistry.mintAndTag(
          "#hello",
          ERC721Mock.address,
          constants.One,
          accounts.HashtagPublisher.address,
          accounts.Tagger.address,
          targetNftChainId,
        ),
      ).to.be.revertedWith("Mint and tag: You must send the tag fee");
    });

    it("Reverts when missing tagging fee during tagging", async function () {
      const targetNftChainId = constants.One;

      await expect(
        ERC721HashtagRegistry.tag(
          "#kittypower",
          ERC721Mock.address,
          constants.One,
          accounts.HashtagPublisher.address,
          accounts.Tagger.address,
          targetNftChainId,
        ),
      ).to.be.revertedWith("Tag: You must send the fee");
    });

    it("Reverts when non-whitelisted publisher attempts mint and tag", async function () {
      const targetNftChainId = constants.One;

      await expect(
        ERC721HashtagRegistry.mintAndTag(
          "#hullo",
          ERC721Mock.address,
          constants.One,
          accounts.RandomOne.address, // Non publisher account.
          accounts.Tagger.address,
          targetNftChainId,
          { value: taggingFee },
        ),
      ).to.be.revertedWith("Mint and tag: The publisher must be whitelisted");
    });

    it("Reverts when non-whitelisted publisher attempts tagging", async function () {
      const targetNftChainId = constants.One;

      await expect(
        ERC721HashtagRegistry.tag(
          "#kittypower",
          ERC721Mock.address,
          constants.One,
          accounts.RandomOne.address,
          accounts.Tagger.address,
          targetNftChainId,
          { value: taggingFee },
        ),
      ).to.be.revertedWith("Tag: The publisher must be whitelisted");
    });

    it("Reverts when target chain id is not permitted when mint and tagging", async function () {
      const nonPermittedNftChainId = 5;

      await expect(
        ERC721HashtagRegistry.mintAndTag(
          "#hullo",
          ERC721Mock.address,
          constants.One,
          accounts.HashtagPublisher.address,
          accounts.Tagger.address,
          nonPermittedNftChainId,
          { value: taggingFee },
        ),
      ).to.be.revertedWith("Mint and tag: Tagging target chain not permitted");
    });

    it("Reverts when target chain id is not permitted during tagging", async function () {
      const nonPermittedNftChainId = 5;

      await expect(
        ERC721HashtagRegistry.tag(
          "#kittypower",
          ERC721Mock.address,
          constants.One,
          accounts.HashtagPublisher.address,
          accounts.Tagger.address,
          nonPermittedNftChainId,
          { value: taggingFee },
        ),
      ).to.be.revertedWith("Tag: Tagging target chain not permitted");
    });

    it("Reverts when previously permitted target chain id is no longer permitted", async function () {
      const revertedNftChainId = 1;

      await ERC721HashtagRegistry.connect(accounts.HashtagAdmin).setPermittedNftChainId(revertedNftChainId, false);
      expect((await ERC721HashtagRegistry.getPermittedNftChainId(revertedNftChainId)) == false);

      await expect(
        ERC721HashtagRegistry.tag(
          "#kittypower",
          ERC721Mock.address,
          constants.One,
          accounts.HashtagPublisher.address,
          accounts.Tagger.address,
          revertedNftChainId,
          { value: taggingFee },
        ),
      ).to.be.revertedWith("Tag: Tagging target chain not permitted");
    });
  });

  describe("Drawing down", async function () {
    beforeEach(async function () {
      await ERC721HashtagRegistry.connect(accounts.Tagger).tag(
        "#macbook",
        ERC721Mock.address, // Target nft contract
        constants.One, // Target nft id
        accounts.HashtagPublisher.address,
        accounts.Tagger.address,
        constants.One, // Target chain id.
        { value: taggingFee },
      );
    });

    it("Can draw down on behalf of the platform", async function () {
      // Account A can draw down accumulated funds of
      // Account B to wallet of Account B.

      const platformBalanceBefore = await accounts.HashtagPlatform.getBalance();

      // accountRandomOne is triggering the drawdown of ETH accrued in
      // accounts.HashtagPlatform.
      await ERC721HashtagRegistry.connect(accounts.RandomOne).drawDown(accounts.HashtagPlatform.address);
      const platformBalanceAfter = await accounts.HashtagPlatform.getBalance();

      // In this case we are expecting the value drawn down to be the
      // platform percentage cut of one tagging event.
      expect(platformBalanceAfter.sub(platformBalanceBefore)).to.be.equal(taggingFee * (platformPercentage / 100));
    });

    it("Can draw down as the platform", async function () {
      const platformBalanceBefore = await accounts.HashtagPlatform.getBalance();
      await ERC721HashtagRegistry.connect(accounts.RandomOne).drawDown(accounts.HashtagPlatform.address);
      const platformBalanceAfter = await accounts.HashtagPlatform.getBalance();
      expect(platformBalanceAfter.sub(platformBalanceBefore)).to.be.equal(taggingFee * (platformPercentage / 100));
    });

    it("Does nothing after a double draw down", async function () {
      const platformBalanceBefore = await accounts.HashtagPlatform.getBalance();
      await ERC721HashtagRegistry.connect(accounts.RandomOne).drawDown(accounts.HashtagPlatform.address);
      const platformBalanceAfter = await accounts.HashtagPlatform.getBalance();

      expect(platformBalanceAfter.sub(platformBalanceBefore)).to.be.equal(taggingFee * (platformPercentage / 100));

      const balanceBeforeSecondDraw = await accounts.HashtagPlatform.getBalance();
      await ERC721HashtagRegistry.connect(accounts.RandomOne).drawDown(accounts.HashtagPlatform.address);
      const balanceAfterSecondDraw = await accounts.HashtagPlatform.getBalance();

      expect(balanceAfterSecondDraw.sub(balanceBeforeSecondDraw)).to.be.equal("0");
    });
  });

  describe("Updating percentages", async function () {
    it("Reverts if not admin", async function () {
      await expect(ERC721HashtagRegistry.connect(accounts.Tagger).updatePercentages(10, 10)).to.be.revertedWith(
        "Caller must be admin",
      );
    });

    it("Reverts if greater than 100", async function () {
      await expect(ERC721HashtagRegistry.connect(accounts.HashtagAdmin).updatePercentages(90, 11)).to.be.revertedWith(
        "ERC721HashtagRegistry.updatePercentages: percentages must not be over 100",
      );
    });

    it("With correct credentials can update percentages", async function () {
      await ERC721HashtagRegistry.connect(accounts.HashtagAdmin).updatePercentages(30, 20);

      expect(await ERC721HashtagRegistry.platformPercentage()).to.be.equal(30);
      expect(await ERC721HashtagRegistry.publisherPercentage()).to.be.equal(20);
      expect(await ERC721HashtagRegistry.remainingPercentage()).to.be.equal(50);
    });
  });
});
