const { setup } = require("./setup.js");
const { ethers, upgrades } = require("hardhat");
const { expect, assert } = require("chai");
const { BigNumber, constants } = ethers;

describe("contracts.ETSToken CTAG ownership lifecycle tests", function () {
  // we create a setup function that can be called by every test and setup variable for easy to read tests
  beforeEach("Setup test", async function () {
    [accounts, contracts, initSettings] = await setup();
  });

  describe("Validate setup", async function () {
    it("should have name and symbol", async function () {
      expect(await contracts.ETSToken.name()).to.be.equal("Ethereum Tag Service");
      expect(await contracts.ETSToken.symbol()).to.be.equal("CTAG");
      expect(await contracts.ETSToken.platform()).to.be.equal(accounts.ETSPlatform.address);
    });

    it("should have default configs", async function () {
      expect(await contracts.ETSToken.ownershipTermLength()).to.be.equal("730");
    });
  });

  describe("Owner/Admin functions", async function () {
    it("Admin should be able to set ownership term", async function() {
      const thirtyDays = 30 * 24 * 60 * 60;
      await contracts.ETSToken.setOwnershipTermLength(thirtyDays);
      expect(await contracts.ETSToken.ownershipTermLength()).to.be.equal(thirtyDays);
    });

    it("Only admin should be able to set ownership term", async function() {
      await expect(
        contracts.ETSToken.connect(accounts.RandomTwo).setOwnershipTermLength(10)).to.be.revertedWith(
        "Caller must have administrator access",
      );
    });
  });

  describe("Renewing a tag", async function () {
    let lastRenewed, tokenId;

    beforeEach(async function () {
      const tag = "#BlockRocket";

      // RandomTwo account creates a tag.
      //console.log("contracts.ETSToken.address", contracts.ETSToken.address);
      //console.log("accounts.RandomTwo",accounts.RandomTwo.address);
      //console.log("accounts.ETSPlatform", accounts.ETSPlatform.address);

      await contracts.ETSToken.connect(accounts.RandomTwo).createTag(tag, accounts.ETSPlatform.address);
      tokenId = await contracts.ETSToken.computeTagId(tag);

    });

    it("for newly minted tag should have last renewed be zero", async function () {
      lastRenewed = await contracts.ETSToken.getLastRenewed(tokenId);
      assert(Number(lastRenewed.toString()) === 0);
    });

    it("will occur only when token is transferred away from platform", async function() {
      await contracts.ETSToken.connect(accounts.ETSPlatform).transferFrom(
        accounts.ETSPlatform.address,
        accounts.RandomTwo.address,
        tokenId
      );
      lastRenewed = await contracts.ETSToken.getLastRenewed(tokenId);
      let blockNum = await ethers.provider.getBlockNumber();
      let block = await ethers.provider.getBlock(blockNum);
      let timestamp = block.timestamp;
      // Verify current block timestamp and last renewTime are equal.
      expect(timestamp).to.be.equal(lastRenewed);
    });

    it("is reset when transferred back to platform", async function () {

      // Transfer tag away from platform.
      await contracts.ETSToken.connect(accounts.ETSPlatform).transferFrom(
        accounts.ETSPlatform.address,
        accounts.RandomTwo.address,
        tokenId
      );

      // Send back to platform.
      await contracts.ETSToken.connect(accounts.RandomTwo).transferFrom(
        accounts.RandomTwo.address,
        accounts.ETSPlatform.address,
        tokenId
      );

      lastRenewed = await contracts.ETSToken.getLastRenewed(tokenId);
      assert(Number(lastRenewed) === 0);

    });

    it("will not fail if renewer not the owner", async function () {
      // Tag owned by platform.
      await expect(contracts.ETSToken.connect(accounts.RandomTwo).renewTag(tokenId)).to.not.be.reverted;
    });

    it("will fail if token does not exist", async function () {
      await expect(contracts.ETSToken.connect(accounts.RandomTwo).renewTag(constants.Two)).to.be.revertedWith(
        "ETS: CTAG not found",
      );
    });

    it("can be done before renewal period has passed", async function () {

      // Transfer tag away from platform.
      await contracts.ETSToken.connect(accounts.ETSPlatform).transferFrom(
        accounts.ETSPlatform.address,
        accounts.RandomTwo.address,
        tokenId
      );

      lastRenewed = await contracts.ETSToken.getLastRenewed(tokenId);

      // Advance current time by 30 days less than ownershipTermLength (2 years).
      const thirtyDays = 30 * 24 * 60 * 60;
      let advanceTime = lastRenewed.add((await contracts.ETSToken.ownershipTermLength()) - thirtyDays);

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

      let newRenewTime = await contracts.ETSToken.getLastRenewed(tokenId);

      expect(newRenewTime).to.be.equal(timestamp);
      // Check that newRenewTime is equal to lastRenewed + 1year + 1microsecond.
      expect(newRenewTime).to.be.equal(Number(lastRenewed) + Number(advanceTime) + 1 || Number(lastRenewed) + Number(advanceTime));
    });

    it("can be done after renewal period has passed", async function () {

      // Transfer tag away from platform.
      await contracts.ETSToken.connect(accounts.ETSPlatform).transferFrom(
        accounts.ETSPlatform.address,
        accounts.RandomTwo.address,
        tokenId
      );

      lastRenewed = await contracts.ETSToken.getLastRenewed(tokenId);

      // Advance current time by 30 days more than ownershipTermLength (2 years).
      const thirtyDays = 30 * 24 * 60 * 60;
      let advanceTime = lastRenewed.add((await contracts.ETSToken.ownershipTermLength()) + thirtyDays);

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

      let newRenewTime = await contracts.ETSToken.getLastRenewed(tokenId);

      expect(newRenewTime).to.be.equal(timestamp);
      // Check that newRenewTime is equal to lastRenewed + 1year + 1microsecond.
      expect(newRenewTime).to.be.equal(Number(lastRenewed) + Number(advanceTime) + 1 || Number(lastRenewed) + Number(advanceTime));
    });

  });

  describe("Recycling a tag", async function () {
    let lastRenewed, tokenId;

    beforeEach(async function () {
      const tag = "#BlockRocket";

      // RandomTwo account creates a tag.
      await contracts.ETSToken.connect(accounts.RandomTwo).createTag(tag, accounts.ETSPlatform.address);
      tokenId = await contracts.ETSToken.computeTagId(tag);

      // Transfer to RandomTwo (simulates sale).
      await contracts.ETSToken.connect(accounts.ETSPlatform).transferFrom(
        accounts.ETSPlatform.address,
        accounts.RandomTwo.address,
        tokenId
      );

    });

    it("will fail if token does not exist", async function () {
      await expect(contracts.ETSToken.connect(accounts.RandomTwo).recycleTag(constants.Two)).to.be.revertedWith(
        "ETS: CTAG not found",
      );
    });

    it("will fail if already owned by the platform", async function () {
      // Send back to platform.
      await contracts.ETSToken.connect(accounts.RandomTwo).transferFrom(
        accounts.RandomTwo.address,
        accounts.ETSPlatform.address,
        tokenId
      );
      await expect(contracts.ETSToken.connect(accounts.RandomTwo).recycleTag(tokenId)).to.be.revertedWith(
        "ETS: CTAG owned by platform",
      );
    });

    it("will fail if token not not eligible yet", async function () {
      // Advance current blocktime by 30 days less than ownershipTermLength (2 years).
      const thirtyDays = 30 * 24 * 60 * 60;
      let advanceTime = (await contracts.ETSToken.ownershipTermLength()) - thirtyDays;
      await ethers.provider.send("evm_increaseTime", [advanceTime]);
      await ethers.provider.send("evm_mine");

      // Attempt to recycle by accounts.RandomTwo address, should fail.
      // Notice non-owner is connected.
      await expect(contracts.ETSToken.connect(accounts.RandomOne).recycleTag(tokenId)).to.be.revertedWith(
        "ETS: CTAG not eligible for recycling",
      );
    });

    it("will succeed once renewal period has passed", async function () {

      lastRenewed = await contracts.ETSToken.getLastRenewed(tokenId);

      // Advance current time by 30 days more than ownershipTermLength (2 years).
      const thirtyDays = 30 * 24 * 60 * 60;
      let advanceTime = lastRenewed.add((await contracts.ETSToken.ownershipTermLength()) + thirtyDays);
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

    it("will increase platform balance and decrease owner balance", async function () {

      expect((await contracts.ETSToken.balanceOf(accounts.ETSPlatform.address)).toString()).to.be.equal("0");
      expect((await contracts.ETSToken.balanceOf(accounts.RandomTwo.address)).toString()).to.be.equal("1");

      // Advance current time by 30 days more than ownershipTermLength (2 years).
      lastRenewed = await contracts.ETSToken.getLastRenewed(tokenId);
      const thirtyDays = 30 * 24 * 60 * 60;
      let advanceTime = lastRenewed.add((await contracts.ETSToken.ownershipTermLength()) + thirtyDays);
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
