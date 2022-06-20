const { setup } = require("./setup.js");
const { ethers } = require("hardhat");
const { expect, assert } = require("chai");
const { constants } = ethers;

// Auction settings
// initSettings.TIME_BUFFER = 10 * 60; // 10 minutes
// initSettings.RESERVE_PRICE = 200; // 200 WEI
// initSettings.MIN_INCREMENT_BID_PERCENTAGE = 5;
// DURATION = 30 * 60; // 30 minutes
// PUBLISHER_PERCENTAGE = 20;
// CREATOR_PERCENTAGE = 40;
// PLATFORM_PERCENTAGE = 40;

describe("ETS Auction House Tests", function () {
  // we create a setup function that can be called by every test and setup variable for easy to read tests
  beforeEach("Setup test", async function () {
    [accounts, contracts, initSettings] = await setup();

    //[accounts, contracts.ETSAccessControls, contracts.ETSToken, contracts.ETSAuctionHouse, contracts.WETH, initSettings] = await setup();

    // Mint a tag by random user. ETS is Publisher, retained by platform.
    etsOwnedTag = "#Love";
    await contracts.ETSToken.connect(accounts.RandomTwo)["createTag(string)"](etsOwnedTag);
    etsOwnedTagId = await contracts.ETSToken.computeTagId(etsOwnedTag);
    etsOwnedTagId = etsOwnedTagId.toString();

    // Mint a tag and transfer away from platform.
    userOwnedTag = "#Incredible";
    await contracts.ETSToken.connect(accounts.RandomTwo)["createTag(string)"](userOwnedTag);
    userOwnedTagId = await contracts.ETSToken.computeTagId(userOwnedTag);
    userOwnedTagId = userOwnedTagId.toString();

    await contracts.ETSToken.connect(accounts.ETSPlatform).transferFrom(
      accounts.ETSPlatform.address,
      accounts.RandomTwo.address,
      userOwnedTagId,
    );
  });

  describe("Valid test setup", async function () {
    it("should have the right stuff", async function () {
      expect(await contracts.ETSToken.name()).to.be.equal("Ethereum Tag Service");
      expect(await contracts.ETSToken.symbol()).to.be.equal("CTAG");
      expect(await contracts.ETSAuctionHouse.version()).to.be.equal("0.1.0");
      expect(await contracts.ETSToken["tagExists(uint256)"](etsOwnedTagId)).to.be.equal(true);
      const addresses = await contracts.ETSToken.getPaymentAddresses(userOwnedTagId);
      assert(addresses._owner === accounts.RandomTwo.address);
    });

    it("should revert if a second initialization is attempted", async () => {
      const tx = contracts.ETSAuctionHouse.initialize(
        contracts.ETSAuctionHouse.address,
        contracts.ETSAccessControls.address,
        contracts.WETH.address,
        initSettings.TIME_BUFFER,
        initSettings.RESERVE_PRICE,
        initSettings.MIN_INCREMENT_BID_PERCENTAGE,
        initSettings.DURATION,
        initSettings.PUBLISHER_PERCENTAGE,
        initSettings.CREATOR_PERCENTAGE,
        initSettings.PLATFORM_PERCENTAGE,
      );
      await expect(tx).to.be.revertedWith("Initializable: contract is already initialized");
    });
  });

  describe("Only administrators", async function () {
    it("can pause & unpause the auction", async function () {
      await expect(contracts.ETSAuctionHouse.connect(accounts.RandomOne).pause()).to.be.revertedWith(
        "Caller must be administrator",
      );

      await expect(contracts.ETSAuctionHouse.connect(accounts.ETSAdmin).pause())
        .to.emit(contracts.ETSAuctionHouse, "Paused")
        .withArgs(accounts.ETSAdmin.address);

      await expect(contracts.ETSAuctionHouse.connect(accounts.RandomOne).unpause()).to.be.revertedWith(
        "Caller must be administrator",
      );

      await expect(contracts.ETSAuctionHouse.connect(accounts.ETSAdmin).unpause())
        .to.emit(contracts.ETSAuctionHouse, "Unpaused")
        .withArgs(accounts.ETSAdmin.address);
    });

    it("can set the reserve price", async function () {
      await expect(contracts.ETSAuctionHouse.connect(accounts.RandomOne).setReservePrice(1000)).to.be.revertedWith(
        "Caller must be administrator",
      );

      await expect(contracts.ETSAuctionHouse.connect(accounts.ETSAdmin).setReservePrice(1000))
        .to.emit(contracts.ETSAuctionHouse, "AuctionReservePriceSet")
        .withArgs(1000);
    });

    it("can set the auction proceed percentages", async function () {
      await expect(
        contracts.ETSAuctionHouse.connect(accounts.RandomOne).setProceedPercentages(25, 25),
      ).to.be.revertedWith("Caller must be administrator");

      await expect(contracts.ETSAuctionHouse.connect(accounts.ETSAdmin).setProceedPercentages(25, 25))
        .to.emit(contracts.ETSAuctionHouse, "AuctionProceedPercentagesSet")
        .withArgs(25, 25, 50);
    });

    it("can set the auction time buffer", async function () {
      await expect(contracts.ETSAuctionHouse.connect(accounts.RandomOne).setTimeBuffer(10)).to.be.revertedWith(
        "Caller must be administrator",
      );

      await expect(contracts.ETSAuctionHouse.connect(accounts.ETSAdmin).setTimeBuffer(10))
        .to.emit(contracts.ETSAuctionHouse, "AuctionTimeBufferSet")
        .withArgs(10);
    });
  });

  describe("Bidding to create a new auction", async function () {
    it("should revert when auction is paused", async function () {
      await contracts.ETSAuctionHouse.connect(accounts.ETSAdmin).pause();
      await expect(
        contracts.ETSAuctionHouse.connect(accounts.RandomOne).createBid(userOwnedTagId, {
          value: initSettings.RESERVE_PRICE,
        }),
      ).to.be.revertedWith("Pausable: paused");
    });

    it("should revert when token doesn't exist", async function () {
      await expect(
        contracts.ETSAuctionHouse.connect(accounts.RandomOne).createBid(constants.Two, {
          value: initSettings.RESERVE_PRICE,
        }),
      ).to.be.revertedWith("ERC721: owner query for nonexistent token");
    });

    it("should revert when token not owned by platform", async function () {
      await expect(
        contracts.ETSAuctionHouse.connect(accounts.RandomOne).createBid(userOwnedTagId, {
          value: initSettings.RESERVE_PRICE,
        }),
      ).to.be.revertedWith("CTAG not owned by ETS");
    });

    it("should revert if a user creates a bid with an amount below the reserve price", async () => {
      await expect(
        contracts.ETSAuctionHouse.connect(accounts.RandomOne).createBid(etsOwnedTagId, {
          value: initSettings.RESERVE_PRICE - 1,
        }),
      ).to.be.revertedWith("Must send at least reservePrice");
    });

    it("should create new auction if token exists and active auction not found", async function () {
      await expect(
        contracts.ETSAuctionHouse.connect(accounts.RandomOne).createBid(etsOwnedTagId, {
          value: initSettings.RESERVE_PRICE,
        }),
      )
        .to.emit(contracts.ETSAuctionHouse, "AuctionCreated")
        .withArgs(etsOwnedTagId);

      const auction = await contracts.ETSAuctionHouse.getAuction(etsOwnedTagId);

      let blockNum = await ethers.provider.getBlockNumber();
      let block = await ethers.provider.getBlock(blockNum);
      assert(auction.startTime == block.timestamp);

      let duration = await contracts.ETSAuctionHouse.duration();
      assert(auction.endTime == Number(block.timestamp) + Number(duration));
    });

    it("should emit an `AuctionBid` event on a successful starting bid", async () => {
      await expect(
        contracts.ETSAuctionHouse.connect(accounts.RandomTwo).createBid(etsOwnedTagId, {
          value: initSettings.RESERVE_PRICE,
        }),
      )
        .to.emit(contracts.ETSAuctionHouse, "AuctionBid")
        .withArgs(etsOwnedTagId, accounts.RandomTwo.address, initSettings.RESERVE_PRICE, false);
    });
  });

  describe("Bidding on active auction", async function () {
    beforeEach(async function () {
      // Create an auction with an opening bid by RandomOne.
      await contracts.ETSAuctionHouse.connect(accounts.RandomOne).createBid(etsOwnedTagId, {
        value: initSettings.RESERVE_PRICE,
      });
    });
    it("should revert if bid doesn't meet min bid increment", async function () {
      const auction = await contracts.ETSAuctionHouse.getAuction(etsOwnedTagId);
      const low_bid_increment =
        Number(auction.amount) + Number(auction.amount) * ((initSettings.MIN_INCREMENT_BID_PERCENTAGE - 3) / 100);
      await expect(
        contracts.ETSAuctionHouse.connect(accounts.RandomTwo).createBid(etsOwnedTagId, { value: low_bid_increment }),
      ).to.be.revertedWith("Must send more than last bid by minBidIncrementPercentage amount");
    });

    it("should emit an `AuctionBid` event on a successful second bid", async function () {
      // RandomTwo successfully increments the bid.
      await expect(
        contracts.ETSAuctionHouse.connect(accounts.RandomTwo).createBid(etsOwnedTagId, {
          value: initSettings.RESERVE_PRICE * 2,
        }),
      )
        .to.emit(contracts.ETSAuctionHouse, "AuctionBid")
        .withArgs(etsOwnedTagId, accounts.RandomTwo.address, initSettings.RESERVE_PRICE * 2, false);
    });

    it("should return funds to previous bidder on good bid", async function () {
      const RandomOnePostBidBalance = await accounts.RandomOne.getBalance();
      // RandomTwo successfully increments the bid.
      await contracts.ETSAuctionHouse.connect(accounts.RandomTwo).createBid(etsOwnedTagId, {
        value: initSettings.RESERVE_PRICE * 2,
      });
      const RandomOnePostRefundBalance = await accounts.RandomOne.getBalance();
      expect(RandomOnePostRefundBalance).to.equal(RandomOnePostBidBalance.add(initSettings.RESERVE_PRICE));
    });

    it("should cap the maximum bid griefing cost at 30K gas + the cost to wrap and transfer contracts.WETH", async () => {
      const maliciousBidder = await (await (await ethers.getContractFactory("MaliciousBidder")).deploy()).deployed();
      const maliciousBid = await maliciousBidder
        .connect(accounts.RandomOne)
        .bid(contracts.ETSAuctionHouse.address, etsOwnedTagId, {
          value: initSettings.RESERVE_PRICE * 2,
        });
      await maliciousBid.wait();

      const tx = await contracts.ETSAuctionHouse.connect(accounts.RandomTwo).createBid(etsOwnedTagId, {
        value: initSettings.RESERVE_PRICE * 4,
        gasLimit: 1_000_000,
      });
      const result = await tx.wait();

      expect(result.gasUsed.toNumber()).to.be.lessThan(200_000);
      expect(await contracts.WETH.balanceOf(maliciousBidder.address)).to.equal(initSettings.RESERVE_PRICE * 2);
    });

    it("should emit an `AuctionExtended` event if the auction end time is within the time buffer", async () => {
      const auction = await contracts.ETSAuctionHouse.getAuction(etsOwnedTagId);
      // Advance blockchain to current end time less 5 minutes.
      await ethers.provider.send("evm_setNextBlockTimestamp", [
        auction.endTime.sub(initSettings.TIME_BUFFER / 2).toNumber(),
      ]);

      await expect(
        contracts.ETSAuctionHouse.connect(accounts.RandomTwo).createBid(etsOwnedTagId, {
          value: initSettings.RESERVE_PRICE * 2,
        }),
      )
        .to.emit(contracts.ETSAuctionHouse, "AuctionExtended")
        .withArgs(etsOwnedTagId, auction.endTime.add(initSettings.TIME_BUFFER / 2));
    });
  });

  describe("Bidding on ended, but not settled auction", async function () {
    beforeEach(async function () {
      // Create an auction with an opening bid.
      await contracts.ETSAuctionHouse.connect(accounts.RandomOne).createBid(etsOwnedTagId, {
        value: initSettings.RESERVE_PRICE,
      });

      // Advance the blockchain one minute past auction end time.
      const auction = await contracts.ETSAuctionHouse.getAuction(etsOwnedTagId);
      await ethers.provider.send("evm_setNextBlockTimestamp", [auction.endTime.add(60).toNumber()]);
    });

    it("should revert", async function () {
      await expect(
        contracts.ETSAuctionHouse.connect(accounts.RandomOne).createBid(etsOwnedTagId, {
          value: initSettings.RESERVE_PRICE,
        }),
      ).to.be.revertedWith("Auction ended");
    });
  });

  describe("Settling an active auction", async function () {
    it("should revert", async function () {
      await contracts.ETSAuctionHouse.connect(accounts.RandomOne).createBid(etsOwnedTagId, {
        value: initSettings.RESERVE_PRICE,
      });
      await expect(
        contracts.ETSAuctionHouse.connect(accounts.RandomOne).settleAuction(etsOwnedTagId),
      ).to.be.revertedWith("Auction hasn't completed");
    });
  });

  describe("Settling an ended auction", async function () {
    beforeEach(async function () {
      // Create new auction with an opening bid.
      await contracts.ETSAuctionHouse.connect(accounts.RandomOne).createBid(etsOwnedTagId, {
        value: initSettings.RESERVE_PRICE,
      });
      const auction = await contracts.ETSAuctionHouse.getAuction(etsOwnedTagId);
      await ethers.provider.send("evm_setNextBlockTimestamp", [auction.endTime.add(60).toNumber()]);
    });

    it("should revert for non-existent auction", async function () {
      await expect(
        contracts.ETSAuctionHouse.connect(accounts.RandomOne).settleAuction(constants.Two),
      ).to.be.revertedWith("Auction doesn't exist");
    });

    it("should send CTAG token to winning bidder", async function () {
      const auction = await contracts.ETSAuctionHouse.getAuction(etsOwnedTagId);
      const bidder = auction.bidder;

      await expect(contracts.ETSAuctionHouse.connect(accounts.RandomOne).settleAuction(etsOwnedTagId)).to.emit(
        contracts.ETSAuctionHouse,
        "AuctionSettled",
      );
      assert((await contracts.ETSToken.ownerOf(etsOwnedTagId)) == bidder);
    });

    it("should send auction proceeds to actors", async function () {
      const auction = await contracts.ETSAuctionHouse.getAuction(etsOwnedTagId);
      const winner = auction.bidder;
      const totalProceeds = auction.amount;
      const publisherProceeds = (totalProceeds * (await contracts.ETSAuctionHouse.publisherPercentage())) / 100;
      const creatorProceeds = (totalProceeds * (await contracts.ETSAuctionHouse.creatorPercentage())) / 100;

      await expect(contracts.ETSAuctionHouse.connect(accounts.RandomOne).settleAuction(etsOwnedTagId))
        .to.emit(contracts.ETSAuctionHouse, "AuctionSettled")
        .withArgs(etsOwnedTagId, winner, totalProceeds, publisherProceeds, creatorProceeds);
    });

    it("should delete the auction", async function () {
      await expect(contracts.ETSAuctionHouse.connect(accounts.RandomOne).settleAuction(etsOwnedTagId)).to.emit(
        contracts.ETSAuctionHouse,
        "AuctionSettled",
      );

      const auction = await contracts.ETSAuctionHouse.getAuction(etsOwnedTagId);
      assert(auction.startTime == 0);
    });
  });
});
