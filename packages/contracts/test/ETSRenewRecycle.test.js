const { setup } = require("./setup.js");
const { ethers } = require("hardhat");
const { expect, assert } = require("chai");

describe("CTAG ownership lifecycle tests", () => {
  // we create a setup function that can be called by every test and setup variable for easy to read tests
  beforeEach("Setup test", async () => {
    [accounts, contracts, initSettings] = await setup();
  });

  describe("Validate setup", async () => {
    it("should have name and symbol", async () => {
      expect(await contracts.ETSToken.name()).to.be.equal("Ethereum Tag Service");
      expect(await contracts.ETSToken.symbol()).to.be.equal("CTAG");
    });

    it("should have default configs", async () => {
      expect(await contracts.ETSToken.ownershipTermLength()).to.be.equal("730");
    });
  });

  describe("Owner/Admin functions", async () => {
    it("Admin should be able to set ownership term", async () => {
      const thirtyDays = 30 * 24 * 60 * 60;
      await contracts.ETSToken.setOwnershipTermLength(thirtyDays);
      expect(await contracts.ETSToken.ownershipTermLength()).to.be.equal(thirtyDays);
    });

    it("Only admin should be able to set ownership term", async () => {
      await expect(contracts.ETSToken.connect(accounts.RandomTwo).setOwnershipTermLength(10)).to.be.revertedWith(
        "Access denied",
      );
    });
  });

  describe("Renewing a tag", async () => {
    let lastRenewed;
    let tokenId;

    beforeEach(async () => {
      const tag = "#BlockRocket";

      // RandomTwo account creates a tag.
      await contracts.ETSRelayer.connect(accounts.RandomTwo).getOrCreateTagIds([tag]);
      tokenId = await contracts.ETSToken.computeTagId(tag);
    });

    it("for newly minted tag should have last renewed be zero", async () => {
      lastRenewed = await contracts.ETSToken.getLastRenewed(tokenId);
      assert(Number(lastRenewed.toString()) === 0);
    });

    it("will occur only when token is transferred away from platform", async () => {
      await contracts.ETSToken.connect(accounts.ETSPlatform).transferFrom(
        accounts.ETSPlatform.address,
        accounts.RandomTwo.address,
        tokenId,
      );
      lastRenewed = await contracts.ETSToken.getLastRenewed(tokenId);
      const blockNum = await ethers.provider.getBlockNumber();
      const block = await ethers.provider.getBlock(blockNum);
      const timestamp = block.timestamp;
      // Verify current block timestamp and last renewTime are equal.
      expect(timestamp).to.be.equal(lastRenewed);
    });

    it("is reset when transferred back to platform", async () => {
      // Transfer tag away from platform.
      await contracts.ETSToken.connect(accounts.ETSPlatform).transferFrom(
        accounts.ETSPlatform.address,
        accounts.RandomTwo.address,
        tokenId,
      );

      // Send back to platform.
      await contracts.ETSToken.connect(accounts.RandomTwo).transferFrom(
        accounts.RandomTwo.address,
        accounts.ETSPlatform.address,
        tokenId,
      );

      lastRenewed = await contracts.ETSToken.getLastRenewed(tokenId);
      assert(Number(lastRenewed) === 0);
    });

    it("will not fail if renewer not the owner", async () => {
      // Tag owned by platform.
      await expect(contracts.ETSToken.connect(accounts.RandomTwo).renewTag(tokenId)).to.not.be.reverted;
    });

    it("will fail if token does not exist", async () => {
      await expect(contracts.ETSToken.connect(accounts.RandomTwo).renewTag(Number(2))).to.be.revertedWith(
        "ETS: CTAG not found",
      );
    });

    it("can be done before renewal period has passed", async () => {
      // Transfer tag away from platform.
      await contracts.ETSToken.connect(accounts.ETSPlatform).transferFrom(
        accounts.ETSPlatform.address,
        accounts.RandomTwo.address,
        tokenId,
      );

      lastRenewed = await contracts.ETSToken.getLastRenewed(tokenId);

      // Advance current time by 30 days less than ownershipTermLength (2 years).
      const thirtyDays = 30 * 24 * 60 * 60;
      const advanceTime = lastRenewed + ((await contracts.ETSToken.ownershipTermLength()) - BigInt(thirtyDays));

      const advanceTimeNumber = Number(advanceTime.toString());

      await ethers.provider.send("evm_increaseTime", [advanceTimeNumber]);
      await ethers.provider.send("evm_mine");

      // Renew the tag as the new owner.
      await expect(contracts.ETSToken.connect(accounts.RandomTwo).renewTag(tokenId))
        .to.emit(contracts.ETSToken, "TagRenewed")
        .withArgs(tokenId, accounts.RandomTwo.address);

      // check renew time has increased
      blockNum = await ethers.provider.getBlockNumber();
      block = await ethers.provider.getBlock(blockNum);
      timestamp = block.timestamp;

      const newRenewTime = await contracts.ETSToken.getLastRenewed(tokenId);

      expect(newRenewTime).to.be.equal(timestamp);
      // Check that newRenewTime is equal to lastRenewed + 1year + 1microsecond.
      expect(newRenewTime).to.be.equal(
        Number(lastRenewed) + Number(advanceTime) + 1 || Number(lastRenewed) + Number(advanceTime),
      );
    });

    it("can be done after renewal period has passed", async () => {
      // Transfer tag away from platform.
      await contracts.ETSToken.connect(accounts.ETSPlatform).transferFrom(
        accounts.ETSPlatform.address,
        accounts.RandomTwo.address,
        tokenId,
      );

      lastRenewed = await contracts.ETSToken.getLastRenewed(tokenId);

      // Advance current time by 30 days more than ownershipTermLength (2 years).
      const thirtyDays = 30 * 24 * 60 * 60;
      const advanceTime = lastRenewed + ((await contracts.ETSToken.ownershipTermLength()) + BigInt(thirtyDays));

      const advanceTimeNumber = Number(advanceTime.toString());

      await ethers.provider.send("evm_increaseTime", [advanceTimeNumber]);
      await ethers.provider.send("evm_mine");

      // Renew the tag as the new owner.
      await expect(contracts.ETSToken.connect(accounts.RandomTwo).renewTag(tokenId))
        .to.emit(contracts.ETSToken, "TagRenewed")
        .withArgs(tokenId, accounts.RandomTwo.address);

      // check renew time has increased
      blockNum = await ethers.provider.getBlockNumber();
      block = await ethers.provider.getBlock(blockNum);
      timestamp = block.timestamp;

      const newRenewTime = await contracts.ETSToken.getLastRenewed(tokenId);

      expect(newRenewTime).to.be.equal(timestamp);
      // Check that newRenewTime is equal to lastRenewed + 1year + 1microsecond.
      expect(newRenewTime).to.be.equal(
        Number(lastRenewed) + Number(advanceTime) + 1 || Number(lastRenewed) + Number(advanceTime),
      );
    });
  });

  describe("Recycling a tag", async () => {
    let lastRenewed;
    let tokenId;

    beforeEach(async () => {
      const tag = "#BlockRocket";

      // RandomTwo account creates a tag.
      await contracts.ETSRelayer.connect(accounts.RandomTwo).getOrCreateTagIds([tag]);
      tokenId = await contracts.ETSToken.computeTagId(tag);

      // Transfer to RandomTwo (simulates sale).
      await contracts.ETSToken.connect(accounts.ETSPlatform).transferFrom(
        accounts.ETSPlatform.address,
        accounts.RandomTwo.address,
        tokenId,
      );
    });

    it("will fail if token does not exist", async () => {
      await expect(contracts.ETSToken.connect(accounts.RandomTwo).recycleTag(Number(2))).to.be.revertedWith(
        "ETS: CTAG not found",
      );
    });

    it("will fail if already owned by the platform", async () => {
      // Send back to platform.
      await contracts.ETSToken.connect(accounts.RandomTwo).transferFrom(
        accounts.RandomTwo.address,
        accounts.ETSPlatform.address,
        tokenId,
      );
      await expect(contracts.ETSToken.connect(accounts.RandomTwo).recycleTag(tokenId)).to.be.revertedWith(
        "Tag owned by platform",
      );
    });

    it("will fail if token not not eligible yet", async () => {
      // Attempt to recycle by accounts.RandomTwo address, should fail.
      // Notice non-owner is connected.
      await expect(contracts.ETSToken.connect(accounts.RandomOne).recycleTag(tokenId)).to.be.revertedWith(
        "recycling not available",
      );
    });

    it("will succeed once renewal period has passed", async () => {
      lastRenewed = await contracts.ETSToken.getLastRenewed(tokenId);

      // Advance current time by 30 days more than ownershipTermLength (2 years).
      const thirtyDays = 30 * 24 * 60 * 60;
      let advanceTime = lastRenewed + ((await contracts.ETSToken.ownershipTermLength()) + BigInt(thirtyDays));
      advanceTime = Number(advanceTime.toString());
      await ethers.provider.send("evm_increaseTime", [advanceTime]);
      await ethers.provider.send("evm_mine");

      // Now attempt to recycle tag as accountRandomOne address.
      // This is to simulate accountRandomTwo missing their window to renew
      // and accountRandomOne recycling the token.
      await expect(contracts.ETSToken.connect(accounts.RandomOne).recycleTag(tokenId))
        .to.emit(contracts.ETSToken, "TagRecycled")
        .withArgs(tokenId, accounts.RandomOne.address);

      // Recycling tag resets last transfer time to zero.
      lastRenewed = await contracts.ETSToken.getLastRenewed(tokenId);

      assert(Number(lastRenewed) === 0);
      // platform now once again owns the token
      expect(await contracts.ETSToken.ownerOf(tokenId)).to.be.equal(accounts.ETSPlatform.address);
    });

    it("will increase platform balance and decrease owner balance", async () => {
      expect((await contracts.ETSToken.balanceOf(accounts.ETSPlatform.address)).toString()).to.be.equal("0");
      expect((await contracts.ETSToken.balanceOf(accounts.RandomTwo.address)).toString()).to.be.equal("1");

      // Advance current time by 30 days more than ownershipTermLength (2 years).
      lastRenewed = await contracts.ETSToken.getLastRenewed(tokenId);
      const thirtyDays = 30 * 24 * 60 * 60;
      let advanceTime = lastRenewed + ((await contracts.ETSToken.ownershipTermLength()) + BigInt(thirtyDays));
      advanceTime = Number(advanceTime.toString());
      await ethers.provider.send("evm_increaseTime", [advanceTime]);
      await ethers.provider.send("evm_mine");

      // Recycle the tag as accounts.RandomOne.
      await expect(contracts.ETSToken.connect(accounts.RandomOne).recycleTag(tokenId))
        .to.emit(contracts.ETSToken, "TagRecycled")
        .withArgs(tokenId, accounts.RandomOne.address);

      // Flip balances.
      expect((await contracts.ETSToken.balanceOf(accounts.ETSPlatform.address)).toString()).to.be.equal("1");
      expect((await contracts.ETSToken.balanceOf(accounts.RandomTwo.address)).toString()).to.be.equal("0");
    });
  });
});
