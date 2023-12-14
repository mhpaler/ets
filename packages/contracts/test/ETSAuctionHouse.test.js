const { setup } = require("./setup.js");
const { ethers } = require("hardhat");
const { expect, assert } = require("chai");
const { constants } = ethers;

// Auction settings
// initSettings.TIME_BUFFER = 10 * 60; // 10 minutes
// initSettings.RESERVE_PRICE = 200; // 200 WEI
// initSettings.MIN_INCREMENT_BID_PERCENTAGE = 5;
// DURATION = 30 * 60; // 30 minutes
// RELAYER_PERCENTAGE = 20;
// CREATOR_PERCENTAGE = 40;
// PLATFORM_PERCENTAGE = 40;

describe("ETS Auction House Tests", function () {
  // we create a setup function that can be called by every test and setup variable for easy to read tests
  beforeEach("Setup test", async function () {
    [accounts, contracts, initSettings] = await setup();

    await contracts.ETSAuctionHouse.connect(accounts.ETSAdmin).unpause();
    // Mint a tag by random user. ETS is Relayer, retained by platform.
    etsOwnedTag = "#LOVE";
    await contracts.ETS.connect(accounts.ETSPlatform).createTag(etsOwnedTag, accounts.RandomTwo.address);
    etsOwnedTagId = await contracts.ETSToken.computeTagId(etsOwnedTag);
    etsOwnedTagId = etsOwnedTagId.toString();

    etsOwnedTag2 = "#HATE";
    await contracts.ETS.connect(accounts.ETSPlatform).createTag(etsOwnedTag2, accounts.RandomTwo.address);
    etsOwnedTagId2 = await contracts.ETSToken.computeTagId(etsOwnedTag2);
    etsOwnedTagId2 = etsOwnedTagId2.toString();

    // Mint a tag and transfer away from platform.
    userOwnedTag = "#Incredible";
    await contracts.ETS.connect(accounts.ETSPlatform).createTag(userOwnedTag, accounts.RandomTwo.address);
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
      expect(await contracts.ETSToken.tagExistsById(etsOwnedTagId)).to.be.equal(true);
      const owner = await contracts.ETSToken.ownerOf(userOwnedTagId);
      assert(owner === accounts.RandomTwo.address);
      const maxAuctions = await contracts.ETSAuctionHouse.maxAuctions();
      const activeAuctions = await contracts.ETSAuctionHouse.getActiveCount();
      const totalAuctions = await contracts.ETSAuctionHouse.getTotalCount();
      assert(maxAuctions.toNumber() == 1);
      assert(activeAuctions.toNumber() == 0);
      assert(totalAuctions.toNumber() == 0);
    });

    it("should revert if a second initialization is attempted", async () => {
      const tx = contracts.ETSAuctionHouse.initialize(
        contracts.ETSToken.address,
        contracts.ETSAccessControls.address,
        contracts.WMATIC.address,
        initSettings.MAX_AUCTIONS,
        initSettings.TIME_BUFFER,
        initSettings.RESERVE_PRICE,
        initSettings.MIN_INCREMENT_BID_PERCENTAGE,
        initSettings.DURATION,
        initSettings.RELAYER_PERCENTAGE,
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

    it("can set max auctions", async function () {
      await expect(contracts.ETSAuctionHouse.connect(accounts.RandomOne).setMaxAuctions(1000)).to.be.revertedWith(
        "Caller must be administrator",
      );

      await expect(contracts.ETSAuctionHouse.connect(accounts.ETSAdmin).setMaxAuctions(1000))
        .to.emit(contracts.ETSAuctionHouse, "AuctionsMaxSet")
        .withArgs(1000);
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

  describe("Creating auctions", async function () {
    it("should revert when auction house is paused", async function () {
      await contracts.ETSAuctionHouse.connect(accounts.ETSAdmin).pause();
      await expect(
        contracts.ETSAuctionHouse.connect(accounts.RandomOne).createNextAuction(),
      ).to.be.revertedWith("Pausable: paused");
    });

    it("should revert when no slots are available", async function () {
      await contracts.ETSAuctionHouse.connect(accounts.ETSPlatform).setMaxAuctions(0);
      await expect(
        contracts.ETSAuctionHouse.connect(accounts.RandomOne).createNextAuction(),
      ).to.be.revertedWith("No open auction slots");
    });

    it("should emit \"RequestCreateAuction\"", async function () {
      await expect(
        contracts.ETSAuctionHouse.connect(accounts.RandomOne).createNextAuction(),
      )
        .to.emit(contracts.ETSAuctionHouse, "RequestCreateAuction");
    });

    it("should revert when fulfillRequestCreateAuction is not called by AuctionOracle", async function () {
      await expect(
        contracts.ETSAuctionHouse.connect(accounts.RandomOne).fulfillRequestCreateAuction(etsOwnedTagId),
      ).to.be.revertedWith("Caller not auction oracle");
    });

    it("should emit \"AuctionCreated\"", async function () {
      await expect(
        contracts.ETSAuctionHouse.connect(accounts.ETSPlatform).fulfillRequestCreateAuction(etsOwnedTagId),
      )
        .to.emit(contracts.ETSAuctionHouse, "AuctionCreated").withArgs(etsOwnedTagId);
    });

    it("should increment the activeActions and auctionId counter", async function () {

      let activeAuctions = await contracts.ETSAuctionHouse.getActiveCount();
      let totalAuctions = await contracts.ETSAuctionHouse.getTotalCount();
      assert(activeAuctions.toNumber() == 0);
      assert(totalAuctions.toNumber() == 0);

      await contracts.ETSAuctionHouse.connect(accounts.ETSPlatform).fulfillRequestCreateAuction(etsOwnedTagId);

      activeAuctions = await contracts.ETSAuctionHouse.getActiveCount();
      totalAuctions = await contracts.ETSAuctionHouse.getTotalCount();
      assert(activeAuctions.toNumber() == 1);
      assert(totalAuctions.toNumber() == 1);
    });

    it("should revert when max auctions is met", async function () {

      let maxAuctions = await contracts.ETSAuctionHouse.maxAuctions();
      assert(maxAuctions.toNumber() == 1);

      await contracts.ETSAuctionHouse.connect(accounts.ETSPlatform).fulfillRequestCreateAuction(etsOwnedTagId);
      await expect(
        contracts.ETSAuctionHouse.connect(accounts.ETSPlatform).fulfillRequestCreateAuction(etsOwnedTagId2),
      ).to.be.revertedWith("No open auction slots");

    });

    it("should revert when if token auction exists", async function () {
      await contracts.ETSAuctionHouse.connect(accounts.ETSAdmin).setMaxAuctions(2);
      await contracts.ETSAuctionHouse.connect(accounts.ETSPlatform).fulfillRequestCreateAuction(etsOwnedTagId);
      await expect(
        contracts.ETSAuctionHouse.connect(accounts.ETSPlatform).fulfillRequestCreateAuction(etsOwnedTagId),
      ).to.be.revertedWith("Auction exists");
    });

    it("should revert if platform doesn't own token", async function () {
      await expect(
        contracts.ETSAuctionHouse.connect(accounts.ETSPlatform).fulfillRequestCreateAuction(userOwnedTagId),
      ).to.be.revertedWith("CTAG not owned by ETS");
    });

    it("should revert if token doesn't exist", async function () {
      const badTokenId = await contracts.ETSToken.computeTagId("#badTokenId");
      await expect(
        contracts.ETSAuctionHouse.connect(accounts.ETSPlatform).fulfillRequestCreateAuction(badTokenId),
      ).to.be.revertedWith("ERC721: invalid token ID");
    });

  });

  describe("Bidding on active auction", async function () {
    beforeEach(async function () {
      // Create an auction.
      await contracts.ETSAuctionHouse.connect(accounts.ETSPlatform).fulfillRequestCreateAuction(etsOwnedTagId);
    });

    it("should revert if auction house is paused", async function () {
      await contracts.ETSAuctionHouse.connect(accounts.ETSAdmin).pause();
      const bid = (initSettings.RESERVE_PRICE + 10);
      // First bid.
      await expect(
        contracts.ETSAuctionHouse.connect(accounts.RandomTwo).createBid(etsOwnedTagId, { value: bid }),
      ).to.be.revertedWith("Pausable: paused");
    });

    it("should revert with \"Auction not found\" if bid is on non-existent auction", async function () {
      // First bid.
      await expect(
        contracts.ETSAuctionHouse.connect(accounts.RandomTwo).createBid(etsOwnedTagId2, { value: initSettings.RESERVE_PRICE }),
      ).to.be.revertedWith("Auction not found");
    });

    it("should revert if bid doesn't meet reserve price", async function () {
      await contracts.ETSAuctionHouse.getAuction(etsOwnedTagId);
      const less_than_reserve = (initSettings.RESERVE_PRICE - 1);

      console.log("less_than_reserve", less_than_reserve);
      // First bid.
      await expect(
        contracts.ETSAuctionHouse.connect(accounts.RandomTwo).createBid(etsOwnedTagId, { value: less_than_reserve }),
      ).to.be.revertedWith("Must send at least reservePrice");
    });

    it("should revert if bid doesn't meet min bid increment", async function () {
      let auction = await contracts.ETSAuctionHouse.getAuction(etsOwnedTagId);
      const first_bid = initSettings.RESERVE_PRICE;
      // First bid + 50.
      //console.log("first_bid", first_bid);

      await contracts.ETSAuctionHouse.connect(accounts.RandomTwo).createBid(etsOwnedTagId, { value: ethers.utils.parseEther(first_bid) });
      auction = await contracts.ETSAuctionHouse.getAuction(etsOwnedTagId);

      const low_bid_increment =
        Number(auction.amount) + Number(auction.amount) * ((initSettings.MIN_INCREMENT_BID_PERCENTAGE - 1) / 100);

      await expect(
        contracts.ETSAuctionHouse.connect(accounts.RandomTwo).createBid(etsOwnedTagId, { value: low_bid_increment.toString() }),
      ).to.be.revertedWith("Bid too low");
    });

    it("should emit an `AuctionBid` event on successful bids", async function () {
      // First bid.
      await expect(
        contracts.ETSAuctionHouse.connect(accounts.RandomTwo).createBid(etsOwnedTagId, {
          value: ethers.utils.parseEther(initSettings.RESERVE_PRICE),
        }),
      )
        .to.emit(contracts.ETSAuctionHouse, "AuctionBid")
        .withArgs(etsOwnedTagId, accounts.RandomTwo.address, ethers.utils.parseEther(initSettings.RESERVE_PRICE), false);

      // Second bid
      let auction = await contracts.ETSAuctionHouse.getAuction(etsOwnedTagId);
      const second_bid =
        Number(auction.amount) + Number(auction.amount) * ((initSettings.MIN_INCREMENT_BID_PERCENTAGE) / 100);
      await expect(
        contracts.ETSAuctionHouse.connect(accounts.RandomOne).createBid(etsOwnedTagId, {
          value: second_bid.toString(),
        }),
      )
        .to.emit(contracts.ETSAuctionHouse, "AuctionBid");

    });

    it("should return funds to previous bidder on good bid", async function () {

      // RandomOne Bids
      const randomOneBid = ethers.utils.parseEther(initSettings.RESERVE_PRICE);

      await contracts.ETSAuctionHouse.connect(accounts.RandomOne).createBid(etsOwnedTagId, {
        value: randomOneBid.toString(),
      })
      const RandomOnePostBidBalance = await accounts.RandomOne.getBalance();

      // RandomTwo successfully increments the bid.
      const randomTwoBid = randomOneBid.mul(2);

      await contracts.ETSAuctionHouse.connect(accounts.RandomTwo).createBid(etsOwnedTagId, {
        value: randomTwoBid.toString(),
      });

      // RandomOne is successfully refunded their original bid.
      const RandomOnePostRefundBalance = await accounts.RandomOne.getBalance();
      expect(RandomOnePostRefundBalance).to.equal(RandomOnePostBidBalance.add(randomOneBid));
    });

    it("should cap the maximum bid griefing cost at 30K gas + the cost to wrap and transfer WMATIC", async () => {
      const maliciousBidder = await (await (await ethers.getContractFactory("MaliciousBidder")).deploy()).deployed();

      const maliciousOneBidAmount = ethers.utils.parseEther(initSettings.RESERVE_PRICE);
      const maliciousBid = await maliciousBidder
        .connect(accounts.RandomOne)
        .bid(contracts.ETSAuctionHouse.address, etsOwnedTagId, {
          value: maliciousOneBidAmount.toString(),
        });
      await maliciousBid.wait();

      // increment bid:
      const incrementBid = maliciousOneBidAmount.mul(4)
      const tx = await contracts.ETSAuctionHouse.connect(accounts.RandomTwo).createBid(etsOwnedTagId, {
        value: incrementBid.toString(),
        gasLimit: 1_000_000,
      });
      const result = await tx.wait();

      expect(result.gasUsed.toNumber()).to.be.lessThan(200_000);
      expect(await contracts.WMATIC.balanceOf(maliciousBidder.address)).to.equal(maliciousOneBidAmount);
    });

  });

  describe("Bidding on ended, but not settled auction", async function () {
    beforeEach(async function () {
      // Create an auction.
      const bid = ethers.utils.parseEther(initSettings.RESERVE_PRICE);

      await contracts.ETSAuctionHouse.connect(accounts.ETSPlatform).fulfillRequestCreateAuction(etsOwnedTagId);
      await contracts.ETSAuctionHouse.connect(accounts.RandomOne).createBid(etsOwnedTagId, {
        value: bid.toString(),
      });

      // Advance the blockchain one minute past auction end time.
      const auction = await contracts.ETSAuctionHouse.getAuction(etsOwnedTagId);
      await ethers.provider.send("evm_setNextBlockTimestamp", [auction.endTime.add(60).toNumber()]);
    });

    it("should revert with \"Auction ended\"", async function () {

      let bid = ethers.utils.parseEther(initSettings.RESERVE_PRICE);
      bid = bid.mul(2);

      await expect(
        contracts.ETSAuctionHouse.connect(accounts.RandomOne).createBid(etsOwnedTagId, {
          value: bid.toString(),
        }),
      ).to.be.revertedWith("Auction ended");
    });
  });

  describe("Settling an auction via settleCurrentAndCreateNewAuction()", async function () {
    beforeEach(async function () {
      await contracts.ETSAuctionHouse.connect(accounts.ETSPlatform).fulfillRequestCreateAuction(etsOwnedTagId);
    });

    it("should revert with \"Pausable: paused\" if auction house is paused", async function () {
      await contracts.ETSAuctionHouse.connect(accounts.ETSAdmin).pause();
      await expect(
        contracts.ETSAuctionHouse.connect(accounts.RandomOne).settleCurrentAndCreateNewAuction(etsOwnedTagId),
      ).to.be.revertedWith("Pausable: paused");
    });

    it("should revert with \"Auction does not exist\" if auction doesn't exist", async function () {
      await expect(
        contracts.ETSAuctionHouse.connect(accounts.RandomOne).settleCurrentAndCreateNewAuction(etsOwnedTagId2),
      ).to.be.revertedWith("Auction does not exist");
    });

    it("should revert with \"Auction has not begun\" if auction exists but has hasn't started", async function () {
      await expect(
        contracts.ETSAuctionHouse.connect(accounts.RandomOne).settleCurrentAndCreateNewAuction(etsOwnedTagId),
      ).to.be.revertedWith("Auction has not begun");
    });

    it("should revert with \"Auction hasn't completed\" if auction hasn't ended", async function () {

      const bid = ethers.utils.parseEther(initSettings.RESERVE_PRICE);

      await contracts.ETSAuctionHouse.connect(accounts.RandomOne).createBid(etsOwnedTagId, {
        value: bid.toString(),
      });
      await expect(
        contracts.ETSAuctionHouse.connect(accounts.RandomOne).settleCurrentAndCreateNewAuction(etsOwnedTagId),
      ).to.be.revertedWith("Auction has not ended");
    });

    it("should emit \"AuctionSettled\" when successfully settled", async function () {
      const bid = ethers.utils.parseEther(initSettings.RESERVE_PRICE);
      await contracts.ETSAuctionHouse.connect(accounts.RandomOne).createBid(etsOwnedTagId, {
        value: bid.toString(),
      });
      const auction = await contracts.ETSAuctionHouse.getAuction(etsOwnedTagId);
      await ethers.provider.send("evm_setNextBlockTimestamp", [auction.endTime.add(60).toNumber()]);

      await expect(contracts.ETSAuctionHouse.connect(accounts.RandomOne).settleCurrentAndCreateNewAuction(etsOwnedTagId)).to.emit(
        contracts.ETSAuctionHouse,
        "AuctionSettled",
      );
    });

    it("can be settled by anyone", async function () {
      // RandomOne is high bidder
      const bid = ethers.utils.parseEther(initSettings.RESERVE_PRICE)
      await contracts.ETSAuctionHouse.connect(accounts.RandomOne).createBid(etsOwnedTagId, {
        value: bid.toString(),
      });
      const auction = await contracts.ETSAuctionHouse.getAuction(etsOwnedTagId);
      await ethers.provider.send("evm_setNextBlockTimestamp", [auction.endTime.add(60).toNumber()]);

      // settled by RandomTwo
      await expect(contracts.ETSAuctionHouse.connect(accounts.RandomTwo).settleCurrentAndCreateNewAuction(etsOwnedTagId)).to.emit(
        contracts.ETSAuctionHouse,
        "AuctionSettled",
      );
    });

    it("initiates request to create next auction (emits \"RequestCreateAuction\")", async function () {
      const bid = ethers.utils.parseEther(initSettings.RESERVE_PRICE)
      await contracts.ETSAuctionHouse.connect(accounts.RandomOne).createBid(etsOwnedTagId, {
        value: bid.toString(),
      });
      const auction = await contracts.ETSAuctionHouse.getAuction(etsOwnedTagId);
      await ethers.provider.send("evm_setNextBlockTimestamp", [auction.endTime.add(60).toNumber()]);

      // settled by RandomTwo
      await expect(contracts.ETSAuctionHouse.connect(accounts.RandomTwo).settleCurrentAndCreateNewAuction(etsOwnedTagId)).to.emit(
        contracts.ETSAuctionHouse,
        "RequestCreateAuction",
      );
    });

    it("should revert with \"Auction already settled\" when already settled", async function () {

      const bid = ethers.utils.parseEther(initSettings.RESERVE_PRICE)
      await contracts.ETSAuctionHouse.connect(accounts.RandomOne).createBid(etsOwnedTagId, {
        value: bid.toString(),
      });
      const auction = await contracts.ETSAuctionHouse.getAuction(etsOwnedTagId);
      await ethers.provider.send("evm_setNextBlockTimestamp", [auction.endTime.add(60).toNumber()]);

      await contracts.ETSAuctionHouse.connect(accounts.RandomTwo).settleCurrentAndCreateNewAuction(etsOwnedTagId);
      await expect(
        contracts.ETSAuctionHouse.connect(accounts.RandomOne).settleCurrentAndCreateNewAuction(etsOwnedTagId),
      ).to.be.revertedWith("Auction already settled");
    });

    it("should send CTAG token to winning bidder", async function () {

      const bid = ethers.utils.parseEther(initSettings.RESERVE_PRICE)
      await contracts.ETSAuctionHouse.connect(accounts.RandomOne).createBid(etsOwnedTagId, {
        value: bid.toString(),
      });
      const auction = await contracts.ETSAuctionHouse.getAuction(etsOwnedTagId);
      await ethers.provider.send("evm_setNextBlockTimestamp", [auction.endTime.add(60).toNumber()]);
      await contracts.ETSAuctionHouse.connect(accounts.RandomTwo).settleCurrentAndCreateNewAuction(etsOwnedTagId);

      assert((await contracts.ETSToken.ownerOf(etsOwnedTagId)) == auction.bidder);
    });

  });

  describe("Auction Proceeds", async function () {
    beforeEach(async function () {

      // RandomTwo sets up as a relayer (they own a tag already from overall test setup):
      await contracts.ETSRelayerFactory.connect(accounts.RandomTwo).addRelayer("RandomTwo Relayer");
      relayerAddress = await contracts.ETSAccessControls.getRelayerAddressFromName("RandomTwo Relayer");
      etsRelayerV1ABI = require("../abi/contracts/relayers/ETSRelayerV1.sol/ETSRelayerV1.json");
      randomTwoRelayer = new ethers.Contract(relayerAddress, etsRelayerV1ABI, accounts.RandomTwo);

      relayerPreAuctionAccrued = await contracts.ETSAuctionHouse.accrued(relayerAddress);
      creatorPreAuctionAccrued = await contracts.ETSAuctionHouse.accrued(accounts.Creator.address);
      platformPreAuctionAccrued = await contracts.ETSAuctionHouse.accrued(accounts.ETSPlatform.address);

      // "Creator" creates a CTAG using RandomTwo Owned Relayer.
      tagString = "#AUCTIONPROCEEDS";
      tagId = await contracts.ETSToken.computeTagId(tagString);
      await randomTwoRelayer.connect(accounts.Creator).getOrCreateTagIds([tagString]);

      // Create new auction for tagId
      await contracts.ETSAuctionHouse.connect(accounts.ETSPlatform).fulfillRequestCreateAuction(tagId);

      const bid = ethers.utils.parseEther(initSettings.RESERVE_PRICE)
      await contracts.ETSAuctionHouse.connect(accounts.RandomOne).createBid(tagId, {
        value: bid.toString(),
      });

      auction = await contracts.ETSAuctionHouse.getAuction(tagId);
      await ethers.provider.send("evm_setNextBlockTimestamp", [auction.endTime.add(60).toNumber()]);
      await contracts.ETSAuctionHouse.connect(accounts.RandomTwo).settleCurrentAndCreateNewAuction(tagId);
    });

    it("should be held in the auction house", async function () {
      const totalProceeds = auction.amount;
      const auctionHouseBalance = await contracts.ETSAuctionHouse.getBalance();
      expect(auctionHouseBalance).to.equal(totalProceeds);
    });

    it("should accrue correctly to actors", async function () {

      const winner = auction.bidder;
      const totalProceeds = auction.amount;

      expect(winner).to.equal(accounts.RandomOne.address);
      const bid = ethers.utils.parseEther(initSettings.RESERVE_PRICE);
      expect(totalProceeds).to.equal(bid);

      const relayerProceeds = (totalProceeds * (await contracts.ETSAuctionHouse.relayerPercentage())) / 100;
      const creatorProceeds = (totalProceeds * (await contracts.ETSAuctionHouse.creatorPercentage())) / 100;

      relayerPostAuctionAccrued = await contracts.ETSAuctionHouse.accrued(relayerAddress);
      creatorPostAuctionAccrued = await contracts.ETSAuctionHouse.accrued(accounts.Creator.address);
      platformPostAuctionAccrued = await contracts.ETSAuctionHouse.accrued(accounts.ETSPlatform.address);

      expect(relayerPostAuctionAccrued).to.equal(relayerPreAuctionAccrued + relayerProceeds);
      expect(creatorPostAuctionAccrued).to.equal(creatorPreAuctionAccrued + creatorProceeds);
      expect(platformPostAuctionAccrued).to.equal(platformPreAuctionAccrued + (totalProceeds - (relayerProceeds + creatorProceeds)));

    });


    it("can be drawn down to creator", async function () {

      creatorAccrued = await contracts.ETSAuctionHouse.accrued(accounts.Creator.address);
      expect(await contracts.ETSAuctionHouse.totalDue(accounts.Creator.address)).to.equal(creatorAccrued);

      await expect(
        contracts.ETSAuctionHouse.connect(accounts.Creator).drawDown(accounts.Creator.address),
      )
        .to.emit(contracts.ETSAuctionHouse, "AuctionProceedsWithdrawn").withArgs(accounts.Creator.address, creatorAccrued);

      expect(await contracts.ETSAuctionHouse.totalDue(accounts.Creator.address)).to.equal(0);
      expect(await contracts.ETSAuctionHouse.paid(accounts.Creator.address)).to.equal(creatorAccrued);

    });

    it("can be drawn down to relayer", async function () {

      relayerAccrued = await contracts.ETSAuctionHouse.accrued(relayerAddress);
      expect(await contracts.ETSAuctionHouse.totalDue(relayerAddress)).to.equal(relayerAccrued);

      await expect(
        contracts.ETSAuctionHouse.connect(accounts.Creator).drawDown(relayerAddress),
      )
        .to.emit(contracts.ETSAuctionHouse, "AuctionProceedsWithdrawn").withArgs(relayerAddress, relayerAccrued);

      expect(await contracts.ETSAuctionHouse.totalDue(relayerAddress)).to.equal(0);
      expect(await contracts.ETSAuctionHouse.paid(relayerAddress)).to.equal(relayerAccrued);

    });

    it("can be drawn down to platform", async function () {

      platformAccrued = await contracts.ETSAuctionHouse.accrued(accounts.ETSPlatform.address);
      expect(await contracts.ETSAuctionHouse.totalDue(accounts.ETSPlatform.address)).to.equal(platformAccrued);

      await expect(
        contracts.ETSAuctionHouse.connect(accounts.Creator).drawDown(accounts.ETSPlatform.address),
      )
        .to.emit(contracts.ETSAuctionHouse, "AuctionProceedsWithdrawn").withArgs(accounts.ETSPlatform.address, platformAccrued);

      expect(await contracts.ETSAuctionHouse.totalDue(accounts.ETSPlatform.address)).to.equal(0);
      expect(await contracts.ETSAuctionHouse.paid(accounts.ETSPlatform.address)).to.equal(platformAccrued);

    });
  });
});
