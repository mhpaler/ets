const { setup } = require("./setup.js");
const { ethers, upgrades } = require("hardhat");
const { expect, assert } = require("chai");
const { BigNumber, constants } = ethers;

// let tag1Id;

describe("ETS Auction House Tests", function () {
  // we create a setup function that can be called by every test and setup variable for easy to read tests
  beforeEach("Setup test", async function () {
    [accounts, ETSAccessControls, ETSToken, ETSAuctionHouse] = await setup();

    // Mint a tag by random user. ETS is Publisher, retained by platform.
    tag1 = "#Love";
    await ETSToken.connect(accounts.RandomTwo).createTag(tag1, accounts.ETSPublisher.address);
    tag1Id = await ETSToken.computeTagId(tag1);
    tag1Id = tag1Id.toString();

    // Mint a tag and transfer away from platform.
    tag2 = "#Incredible";
    await ETSToken.connect(accounts.RandomTwo).createTag(tag2, accounts.ETSPublisher.address);
    tag2Id = await ETSToken.computeTagId(tag2);
    tag2Id = tag2Id.toString();

    await ETSToken.connect(accounts.ETSPlatform).transferFrom(
      accounts.ETSPlatform.address,
      accounts.RandomTwo.address,
      tag2Id
    );
  });

  describe("Valid test setup", async function () {
    it("should have the right stuff", async function () {
      expect(await ETSToken.name()).to.be.equal("Ethereum Tag Service");
      expect(await ETSToken.symbol()).to.be.equal("CTAG");
      expect(await ETSAuctionHouse.version()).to.be.equal("0.1.0");
      expect(await ETSToken.tokenIdExists(tag1Id)).to.be.equal(true);
      const addresses = await ETSToken.getPaymentAddresses(tag2Id);
      assert(addresses._owner === accounts.RandomTwo.address);
      
    });
  });

  describe("Bidding to create an auction", async function () {
    it("should fail when token doesn't exist", async function () {
      await expect(ETSAuctionHouse.connect(accounts.RandomOne).createBid(constants.Two, constants.Two)).to.be.revertedWith(
        "ERC721: owner query for nonexistent token",
      );
    });

    it("should fail when token not owned by platform", async function () {
      await expect(ETSAuctionHouse.connect(accounts.RandomOne).createBid(tag2Id, constants.Two)).to.be.revertedWith(
        "CTAG not owned by ETS",
      );
    });

    it ("should create new auction if token exists and active auction not found", async function () {

    });
  });
  
  describe("Bidding on active auction", async function () {
    it ("should increment bid for active auction", async function () {
      
    });

    it ("should return funds to previous bidder", async function () {
      
    });

    it ("should extend auction if bid is within timeBuffer", async function () {
      
    });

  });

  describe("Bidding on ended, but not settled auction", async function () {
    it ("should fail", async function () {
      
    });

    it ("should extend auction if bid is within timeBuffer", async function () {
      
    });

  });

});
