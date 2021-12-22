const { ethers, upgrades } = require("hardhat");
const { expect, assert } = require("chai");
const { BigNumber, constants } = ethers;

let accounts, factories, HashtagAccessControls, HashtagProtocol;

describe("HashtagProtocol Tests", function () {
  // we create a setup function that can be called by every test and setup variable for easy to read tests
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
    };

    factories = {
      HashtagAccessControls: await ethers.getContractFactory("HashtagAccessControls"),
      HashtagProtocol: await ethers.getContractFactory("HashtagProtocol"),
      ERC721HashtagRegistry: await ethers.getContractFactory("ERC721HashtagRegistry"),
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
  });

  describe("Validate setup", async function () {
    it("should have name and symbol", async function () {
      expect(await HashtagProtocol.name()).to.be.equal("Hashtag Protocol");
      expect(await HashtagProtocol.symbol()).to.be.equal("HASHTAG");
      expect(await HashtagProtocol.platform()).to.be.equal(accounts.HashtagPlatform.address);
    });
    it("should have default configs", async function () {
      expect(await HashtagProtocol.ownershipTermLength()).to.be.equal("63072000");
    });
  });

  describe("Minting hashtags", async function () {
    describe("Validation", function () {
      const RandomTwoHashtag = "asupersupersupersupersuperlonghashtag";

      it("should revert if exists (case-insensitive)", async function () {
        await HashtagProtocol.connect(accounts.HashtagPublisher).mint(
          "#blockrocket",
          accounts.HashtagPublisher.address,
          accounts.Creator.address,
        );

        await expect(
          HashtagProtocol.connect(accounts.HashtagPublisher).mint(
            "#BlockRocket",
            accounts.HashtagPublisher.address,
            accounts.Creator.address,
          ),
        ).to.be.revertedWith("ERC721: token already minted");
      });

      it("should revert if hashtag does not meet min length requirements", async function () {
        const hashtagMinStringLength = await HashtagProtocol.hashtagMinStringLength();

        const shortHashtag = "#" + RandomTwoHashtag.substring(0, hashtagMinStringLength - 2);
        await expect(
          HashtagProtocol.connect(accounts.HashtagPublisher).mint(
            shortHashtag,
            accounts.HashtagPublisher.address,
            accounts.Creator.address,
          ),
        ).to.be.revertedWith(`Invalid format: Hashtag must not exceed length requirements`);
      });

      it("should revert if hashtag does not meet max length requirements", async function () {
        const hashtagMaxStringLength = await HashtagProtocol.hashtagMaxStringLength();
        const longHashtag = "#" + RandomTwoHashtag.substring(0, hashtagMaxStringLength);
        await expect(
          HashtagProtocol.connect(accounts.HashtagPublisher).mint(
            longHashtag,
            accounts.HashtagPublisher.address,
            accounts.Creator.address,
          ),
        ).to.be.revertedWith(`Invalid format: Hashtag must not exceed length requirements`);
      });

      it("should revert if hashtag has an invalid character", async function () {
        const invalidHashtag = "#x_art";
        await expect(
          HashtagProtocol.connect(accounts.HashtagPublisher).mint(
            invalidHashtag,
            accounts.HashtagPublisher.address,
            accounts.Creator.address,
          ),
        ).to.be.revertedWith("Invalid character found: Hashtag may only contain characters A-Z, a-z, 0-9 and #");
      });

      it("should revert if does not start with #", async function () {
        const invalidHashtag = "ART";
        await expect(
          HashtagProtocol.connect(accounts.HashtagPublisher).mint(
            invalidHashtag,
            accounts.HashtagPublisher.address,
            accounts.Creator.address,
          ),
        ).to.be.revertedWith("Must start with #");
      });

      it("should revert if hashtag after first char", async function () {
        const invalidHashtag = "#Hash#";
        await expect(
          HashtagProtocol.connect(accounts.HashtagPublisher).mint(
            invalidHashtag,
            accounts.HashtagPublisher.address,
            accounts.Creator.address,
          ),
        ).to.be.revertedWith("Invalid character found: Hashtag may only contain characters A-Z, a-z, 0-9 and #");
      });

      it("should revert if the hashtag does not have a single alpha char", async function () {
        const invalidHashtag = "#420";
        await expect(
          HashtagProtocol.connect(accounts.HashtagPublisher).mint(
            invalidHashtag,
            accounts.HashtagPublisher.address,
            accounts.Creator.address,
          ),
        ).to.be.revertedWith("Invalid format: Hashtag must contain at least 1 alphabetic character.");
      });

      it("should allow a mix of upper and lowercase characters", async function () {
        await HashtagProtocol.connect(accounts.HashtagPublisher).mint(
          "#Awesome123",
          accounts.HashtagPublisher.address,
          accounts.Creator.address,
        );
      });
    });

    it("should mint", async function () {
      expect(await HashtagProtocol.tokenPointer()).to.be.equal("0");

      const hashtag = "#BlockRocket";
      const lowerHashtag = "#blockrocket";

      await HashtagProtocol.connect(accounts.RandomTwo).mint(
        hashtag,
        accounts.HashtagPublisher.address,
        accounts.Creator.address,
      );

      expect(await HashtagProtocol.tokenPointer()).to.be.equal("1");
      expect(await HashtagProtocol.hashtagToTokenId(lowerHashtag)).to.be.equal("1");
      expect(await HashtagProtocol.exists(BigNumber.from("1"))).to.be.true;

      const hashtagData = await HashtagProtocol.tokenIdToHashtag("1");
      expect(hashtagData.displayVersion.toLowerCase()).to.be.equal(lowerHashtag);
      expect(hashtagData.displayVersion).to.be.equal(hashtag);
      expect(hashtagData.originalPublisher).to.be.equal(accounts.HashtagPublisher.address);
      expect(hashtagData.creator).to.be.equal(accounts.Creator.address);
    });

    it("should mint from owner without fee", async function () {
      await HashtagProtocol.connect(accounts.HashtagPlatform);

      expect(await HashtagProtocol.tokenPointer()).to.be.equal("0");

      await HashtagProtocol.mint("#blockrocket", accounts.HashtagPublisher.address, accounts.Creator.address);

      expect(await HashtagProtocol.tokenPointer()).to.be.equal("1");
      expect(await HashtagProtocol.hashtagToTokenId("#blockrocket")).to.be.equal("1");
      const hashtagData = await HashtagProtocol.tokenIdToHashtag("1");

      expect(hashtagData.displayVersion.toLowerCase()).to.be.equal("#blockrocket");
      expect(hashtagData.originalPublisher).to.be.equal(accounts.HashtagPublisher.address);
    });

    it("should revert if the publisher is not whitelisted", async function () {
      await expect(
        HashtagProtocol.connect(accounts.HashtagPlatform).mint(
          "#blockrocket",
          accounts.RandomTwo.address,
          accounts.Creator.address,
        ),
      ).to.be.revertedWith("Mint: The publisher must be whitelisted");
    });
  });

  describe("Platform", async function () {
    it("should be able to set platform as owner", async function () {
      expect(await HashtagProtocol.platform()).to.be.equal(accounts.HashtagPlatform.address);

      await HashtagProtocol.connect(accounts.HashtagAdmin).setPlatform(accounts.RandomOne.address);

      expect(await HashtagProtocol.platform()).to.be.equal(accounts.RandomOne.address);
    });

    it("should revert if not owner", async function () {
      await expect(HashtagProtocol.connect(accounts.Buyer).setPlatform(accounts.RandomOne.address)).to.be.revertedWith(
        "Caller must have administrator access",
      );
    });

    it("should update access controls", async function () {
      await HashtagProtocol.connect(accounts.HashtagAdmin).updateAccessControls(accounts.RandomTwo.address);
      expect(await HashtagProtocol.accessControls()).to.be.equal(accounts.RandomTwo.address);

      await expect(HashtagProtocol.connect(accounts.RandomTwo).updateAccessControls(accounts.RandomTwo.address)).to.be
        .reverted;
    });

    it("should revert when updating access controls to zero address", async function () {
      await expect(
        HashtagProtocol.connect(accounts.HashtagAdmin).updateAccessControls(constants.AddressZero),
      ).to.be.revertedWith("HashtagProtocol.updateAccessControls: Cannot be zero");
    });
  });

  describe("Metadata", async function () {
    it("should return tokenUri", async function () {
      const tokenId = constants.One;
      await HashtagProtocol.connect(accounts.RandomTwo).mint(
        "#BlockRocket",
        accounts.HashtagPublisher.address,
        accounts.Creator.address,
      );

      expect(await HashtagProtocol.tokenURI(tokenId)).to.be.equal("https://api.hashtag-protocol.io/1");

      await HashtagProtocol.connect(accounts.HashtagAdmin).setBaseURI("hashtag.io/");

      expect(await HashtagProtocol.tokenURI(tokenId)).to.be.equal(`hashtag.io/${tokenId}`);
    });
  });

  describe("renewing a hashtag", async function () {
    let lastTransferTime;
    const tokenId = constants.One;
    beforeEach(async function () {
      await HashtagProtocol.connect(accounts.RandomTwo).mint(
        "#BlockRocket",
        accounts.HashtagPublisher.address,
        accounts.Creator.address,
      );

      // This sets the last transfer time for all tests to now
      // accounts.HashtagPlatform is owner of new hashtags.
      await HashtagProtocol.connect(accounts.HashtagPlatform).renewHashtag(tokenId);
      lastTransferTime = await HashtagProtocol.tokenIdToLastTransferTime(tokenId);
    });

    it("will fail if not the owner", async function () {
      await expect(HashtagProtocol.connect(accounts.RandomTwo).renewHashtag(tokenId)).to.be.revertedWith(
        "renewHashtag: Invalid sender",
      );
    });

    it("will fail if token does not exist", async function () {
      await expect(HashtagProtocol.connect(accounts.RandomTwo).renewHashtag(constants.Two)).to.be.revertedWith(
        "ERC721: owner query for nonexistent token",
      );
    });

    it("can be reset before renewal period has passed", async function () {
      const lastRenewTime = Number(lastTransferTime.toString());

      let blockNum = await ethers.provider.getBlockNumber();
      let block = await ethers.provider.getBlock(blockNum);
      let timestamp = block.timestamp;

      // Verify current block timestamp and last renewTime are equal.
      expect(timestamp).to.be.equal(lastRenewTime);

      // Advance current time by 30 days less than ownershipTermLength (2 years).
      const thirtyDays = 30 * 24 * 60 * 60;
      let advanceTime = lastTransferTime.add((await HashtagProtocol.ownershipTermLength()) - thirtyDays);

      advanceTime = Number(advanceTime.toString());

      await ethers.provider.send("evm_increaseTime", [advanceTime]);
      await ethers.provider.send("evm_mine");

      // Renew the hashtag again.
      await expect(HashtagProtocol.connect(accounts.HashtagPlatform).renewHashtag(tokenId))
        .to.emit(HashtagProtocol, "HashtagRenewed")
        .withArgs(tokenId, accounts.HashtagPlatform.address);

      // check timestamp has increased
      blockNum = await ethers.provider.getBlockNumber();
      block = await ethers.provider.getBlock(blockNum);
      timestamp = block.timestamp;

      let newRenewTime = await HashtagProtocol.tokenIdToLastTransferTime(tokenId);

      newRenewTime = Number(newRenewTime.toString());
      expect(newRenewTime).to.be.equal(timestamp);
      // Check that newRenewTime is equal to lastRenewTime + 1year + 1microsecond.
      expect(newRenewTime).to.be.equal(lastRenewTime + advanceTime + 1 || lastRenewTime + advanceTime);
    });

    it("once reset, last transfer time reset", async function () {
      // increase by 2 years and 30 days
      const thirtyDays = 30 * 24 * 60 * 60;
      let advanceTime = lastTransferTime.add((await HashtagProtocol.ownershipTermLength()) + thirtyDays);
      advanceTime = Number(advanceTime.toString());
      // Advance current block time by ownership length (2 years) + 1 day.
      await ethers.provider.send("evm_increaseTime", [advanceTime]);
      await ethers.provider.send("evm_mine");
      // Renew the HASHTAG token.
      await expect(HashtagProtocol.connect(accounts.HashtagPlatform).renewHashtag(tokenId))
        .to.emit(HashtagProtocol, "HashtagRenewed")
        .withArgs(tokenId, accounts.HashtagPlatform.address);
      let newRenewTime = await HashtagProtocol.tokenIdToLastTransferTime(tokenId);
      newRenewTime = Number(newRenewTime.toString());
      const lastRenewTime = Number(lastTransferTime.toString());
      // There seems to be a 1 microsecond variance depending on whether test is
      // run locally or up on Github using test runner. Probably a better way to deal with this...
      expect(newRenewTime).to.be.equal(lastRenewTime + advanceTime + 1 || lastRenewTime + advanceTime);
    });
  });
  //
  describe("Admin functions", async function () {
    it("should be able to set hashtag length as admin", async function () {
      expect(await HashtagAccessControls.isAdmin(accounts.HashtagAdmin.address)).to.be.equal(true);

      const currentMaxLength = await HashtagProtocol.hashtagMaxStringLength();
      expect(currentMaxLength).to.be.equal(32);

      await HashtagProtocol.connect(accounts.HashtagAdmin).setHashtagMaxStringLength(64);

      const newMaxLength = await HashtagProtocol.hashtagMaxStringLength();
      expect(newMaxLength).to.be.equal(64);
    });

    it("should revert if setting hashtag length if not admin", async function () {
      await expect(HashtagProtocol.connect(accounts.Buyer).setHashtagMaxStringLength(55)).to.be.revertedWith(
        "Caller must have administrator access",
      );
    });
  });

  describe("Recycling a hashtag", async function () {
    let lastTransferTime;
    const tokenId = constants.One;
    beforeEach(async function () {
      await HashtagProtocol.connect(accounts.RandomTwo).mint(
        "#BlockRocket",
        accounts.HashtagPublisher.address,
        accounts.Creator.address,
      );

      // This sets the last transfer time for all tests to now
      // accounts.HashtagPlatform is owner of new hashtags.
      await HashtagProtocol.connect(accounts.HashtagPlatform).renewHashtag(tokenId);
      lastTransferTime = await HashtagProtocol.tokenIdToLastTransferTime(tokenId);
    });

    it("will fail if token does not exist", async function () {
      await expect(HashtagProtocol.connect(accounts.RandomTwo).recycleHashtag(constants.Two)).to.be.revertedWith(
        "recycleHashtag: Invalid token ID",
      );
    });

    it("will fail if already owned by the platform", async function () {
      await expect(HashtagProtocol.connect(accounts.HashtagPlatform).recycleHashtag(tokenId)).to.be.revertedWith(
        "recycleHashtag: Already owned by the platform",
      );
    });

    it("will fail if token not not eligible yet", async function () {
      // Transfer the token to a accounts.RandomTwo owner.
      await HashtagProtocol.connect(accounts.HashtagPlatform).transferFrom(
        accounts.HashtagPlatform.address,
        accounts.RandomTwo.address,
        tokenId,
      );

      // Advance current blocktime by 30 days less than ownershipTermLength (2 years).
      const thirtyDays = 30 * 24 * 60 * 60;
      let advanceTime = (await HashtagProtocol.ownershipTermLength()) - thirtyDays;
      await ethers.provider.send("evm_increaseTime", [advanceTime]);
      await ethers.provider.send("evm_mine");

      // Attempt to recycle by accounts.RandomTwo address, should fail.
      await expect(HashtagProtocol.connect(accounts.RandomTwo).recycleHashtag(tokenId)).to.be.revertedWith(
        "recycleHashtag: Token not eligible for recycling yet",
      );
    });

    it("will succeed once renewal period has passed", async function () {
      // Transfer HASHTAG to accounts.RandomTwo address, simulating ownership.
      await HashtagProtocol.connect(accounts.HashtagPlatform).transferFrom(
        accounts.HashtagPlatform.address,
        accounts.RandomTwo.address,
        tokenId,
      );

      // Advance current time by 30 days more than ownershipTermLength (2 years).
      const thirtyDays = 30 * 24 * 60 * 60;
      let advanceTime = lastTransferTime.add((await HashtagProtocol.ownershipTermLength()) + thirtyDays);
      advanceTime = Number(advanceTime.toString());
      await ethers.provider.send("evm_increaseTime", [advanceTime]);
      await ethers.provider.send("evm_mine");

      // Now attempt to recycle hashtag as accountRandomOne address.
      // This is to simulate owner missing their window to recycle
      // and accountRandomOne perspective owner wanting to recycle the token.
      await expect(HashtagProtocol.connect(accounts.RandomOne).recycleHashtag(tokenId))
        .to.emit(HashtagProtocol, "HashtagReset")
        .withArgs(tokenId, accounts.RandomOne.address);

      // check timestamp has increased
      const newTransferTime = await HashtagProtocol.tokenIdToLastTransferTime(tokenId);

      expect(Number(BigNumber.from(newTransferTime))).to.be.greaterThan(Number(lastTransferTime.toString()));
      // platform now once again owns the token
      expect(await HashtagProtocol.ownerOf(tokenId)).to.be.equal(accounts.HashtagPlatform.address);
    });

    it("when being recycled by the platform, the platforms balance increases and the owners balance decreases", async function () {
      expect((await HashtagProtocol.balanceOf(accounts.HashtagPlatform.address)).toString()).to.be.equal("1");

      // Transfer HASHTAG to accounts.RandomTwo address.
      await HashtagProtocol.connect(accounts.HashtagPlatform).transferFrom(
        accounts.HashtagPlatform.address,
        accounts.RandomTwo.address,
        tokenId,
      );

      expect((await HashtagProtocol.balanceOf(accounts.HashtagPlatform.address)).toString()).to.be.equal("0");
      expect((await HashtagProtocol.balanceOf(accounts.RandomTwo.address)).toString()).to.be.equal("1");

      // Advance current time by 30 days more than ownershipTermLength (2 years).
      const thirtyDays = 30 * 24 * 60 * 60;
      let advanceTime = lastTransferTime.add((await HashtagProtocol.ownershipTermLength()) + thirtyDays);
      advanceTime = Number(advanceTime.toString());
      await ethers.provider.send("evm_increaseTime", [advanceTime]);
      await ethers.provider.send("evm_mine");

      // Recycle the hashtag as current owner.
      await expect(HashtagProtocol.connect(accounts.RandomTwo).recycleHashtag(tokenId))
        .to.emit(HashtagProtocol, "HashtagReset")
        .withArgs(tokenId, accounts.RandomTwo.address);

      // Check that transfer time has increased
      const newTransferTime = await HashtagProtocol.tokenIdToLastTransferTime(tokenId);
      expect(Number(BigNumber.from(newTransferTime))).to.be.greaterThan(Number(lastTransferTime.toString()));

      // both balances back to zero
      expect((await HashtagProtocol.balanceOf(accounts.HashtagPlatform.address)).toString()).to.be.equal("1");
      expect((await HashtagProtocol.balanceOf(accounts.RandomTwo.address)).toString()).to.be.equal("0");
    });
  });
});
