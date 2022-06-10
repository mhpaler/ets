const { setup } = require("./setup.js");
const { ethers, upgrades } = require("hardhat");
const { expect, assert } = require("chai");
const { BigNumber, constants } = ethers;

// Auction settings
// auctionSettings.TIME_BUFFER = 10 * 60; // 10 minutes
// auctionSettings.RESERVE_PRICE = 200; // 200 WEI
// auctionSettings.MIN_INCREMENT_BID_PERCENTAGE = 5;
// DURATION = 30 * 60; // 30 minutes
// PUBLISHER_PERCENTAGE = 20;
// CREATOR_PERCENTAGE = 40;
// PLATFORM_PERCENTAGE = 40;

describe("ETS Auction House Tests", function () {
  // we create a setup function that can be called by every test and setup variable for easy to read tests
  beforeEach("Setup test", async function () {
    [accounts, ETSAccessControls, ETSToken, ETSAuctionHouse, WETH, auctionSettings] = await setup();

    // Mint a tag by random user. ETS is Publisher, retained by platform.
    etsOwnedTag = "#Love";
    await ETSToken.connect(accounts.RandomTwo).createTag(etsOwnedTag, accounts.ETSPublisher.address);
    etsOwnedTagId = await ETSToken.computeTagId(etsOwnedTag);
    etsOwnedTagId = etsOwnedTagId.toString();

    // Mint a tag and transfer away from platform.
    userOwnedTag = "#Incredible";
    await ETSToken.connect(accounts.RandomTwo).createTag(userOwnedTag, accounts.ETSPublisher.address);
    userOwnedTagId = await ETSToken.computeTagId(userOwnedTag);
    userOwnedTagId = userOwnedTagId.toString();

    await ETSToken.connect(accounts.ETSPlatform).transferFrom(
      accounts.ETSPlatform.address,
      accounts.RandomTwo.address,
      userOwnedTagId
    );
  });

  describe("Valid test setup", async function () {
    it("should have the right stuff", async function () {
      expect(await ETSToken.name()).to.be.equal("Ethereum Tag Service");
      expect(await ETSToken.symbol()).to.be.equal("CTAG");
      expect(await ETSAuctionHouse.version()).to.be.equal("0.1.0");
      expect(await ETSToken.tokenIdExists(etsOwnedTagId)).to.be.equal(true);
      const addresses = await ETSToken.getPaymentAddresses(userOwnedTagId);
      assert(addresses._owner === accounts.RandomTwo.address);
      
    });

    it('should revert if a second initialization is attempted', async () => {
      const tx = ETSAuctionHouse.initialize(
        ETSAuctionHouse.address,
        ETSAccessControls.address,
        WETH.address,
        auctionSettings.TIME_BUFFER,
        auctionSettings.RESERVE_PRICE,
        auctionSettings.MIN_INCREMENT_BID_PERCENTAGE,
        auctionSettings.DURATION,
        auctionSettings.PUBLISHER_PERCENTAGE,
        auctionSettings.CREATOR_PERCENTAGE,
        auctionSettings.PLATFORM_PERCENTAGE
      );
      await expect(tx).to.be.revertedWith('Initializable: contract is already initialized');
    });
  });

  describe("Only administrators", async function () {

    it("can pause & unpause the auction", async function () {
      await expect(ETSAuctionHouse.connect(accounts.RandomOne).pause())
        .to.be.revertedWith(
          "Caller must be administrator",
        );

      await expect(ETSAuctionHouse.connect(accounts.ETSAdmin).pause())
          .to.emit(
            ETSAuctionHouse, "Paused"
          )
          .withArgs(
            accounts.ETSAdmin.address
          );
          
      await expect(ETSAuctionHouse.connect(accounts.RandomOne).unpause())
        .to.be.revertedWith(
          "Caller must be administrator",
        );
          
      await expect(ETSAuctionHouse.connect(accounts.ETSAdmin).unpause())
        .to.emit(
          ETSAuctionHouse, "Unpaused"
        )
        .withArgs(
          accounts.ETSAdmin.address
        );
    });

    it("can set the reserve price", async function () {
      await expect(ETSAuctionHouse.connect(accounts.RandomOne).setReservePrice(1000))
        .to.be.revertedWith(
          "Caller must be administrator",
        );

      await expect(ETSAuctionHouse.connect(accounts.ETSAdmin).setReservePrice(1000))
        .to.emit(
          ETSAuctionHouse, "AuctionReservePriceSet"
        )
        .withArgs(
          1000
        );
    });

    it("can set the auction proceed percentages", async function () {
      await expect(ETSAuctionHouse.connect(accounts.RandomOne).setProceedPercentages(25, 25))
      .to.be.revertedWith(
        "Caller must be administrator",
      );

      await expect(ETSAuctionHouse.connect(accounts.ETSAdmin).setProceedPercentages(25, 25))
        .to.emit(
          ETSAuctionHouse, "AuctionProceedPercentagesSet"
        )
        .withArgs(
          25, 25, 50
        );
    });

    it("can set the auction time buffer", async function () {
      await expect(ETSAuctionHouse.connect(accounts.RandomOne).setTimeBuffer(10))
      .to.be.revertedWith(
        "Caller must be administrator",
      );

      await expect(ETSAuctionHouse.connect(accounts.ETSAdmin).setTimeBuffer(10))
        .to.emit(
          ETSAuctionHouse, "AuctionTimeBufferSet"
        )
        .withArgs(
          10
        );
    });

  });

  describe("Bidding to create a new auction", async function () {
 
    it("should revert when auction is paused", async function () {
      await ETSAuctionHouse.connect(accounts.ETSAdmin).pause();
      await expect(ETSAuctionHouse.connect(accounts.RandomOne).createBid(userOwnedTagId, { value: auctionSettings.RESERVE_PRICE }))
        .to.be.revertedWith(
          "Pausable: paused",
        );
    });

    it("should revert when token doesn't exist", async function () {
      await expect(ETSAuctionHouse.connect(accounts.RandomOne).createBid(constants.Two, { value: auctionSettings.RESERVE_PRICE }))
        .to.be.revertedWith(
          "ERC721: owner query for nonexistent token",
        );
    });
 
    it("should revert when token not owned by platform", async function () {
      await expect(ETSAuctionHouse.connect(accounts.RandomOne).createBid(userOwnedTagId, { value: auctionSettings.RESERVE_PRICE }))
        .to.be.revertedWith(
          "CTAG not owned by ETS",
        );
    });
 
    it('should revert if a user creates a bid with an amount below the reserve price', async () => {
      await expect(ETSAuctionHouse.connect(accounts.RandomOne).createBid(etsOwnedTagId, { value: auctionSettings.RESERVE_PRICE - 1 }))
        .to.be.revertedWith(
          "Must send at least reservePrice",
        );
    });
 
    it ("should create new auction if token exists and active auction not found", async function () {
      await expect(ETSAuctionHouse.connect(accounts.RandomOne).createBid(etsOwnedTagId, { value: auctionSettings.RESERVE_PRICE }))
        .to.emit(
          ETSAuctionHouse, "AuctionCreated"
        )
        .withArgs(etsOwnedTagId);
      
      const auction = await ETSAuctionHouse.getAuction(etsOwnedTagId);
 
      let blockNum = await ethers.provider.getBlockNumber();
      let block = await ethers.provider.getBlock(blockNum);
      assert(auction.startTime == block.timestamp);
 
      let duration = await ETSAuctionHouse.duration();
      assert(auction.endTime == (Number(block.timestamp) + Number(duration)));
    });
 
    it('should emit an `AuctionBid` event on a successful starting bid', async () => {
      await expect(ETSAuctionHouse.connect(accounts.RandomTwo).createBid(etsOwnedTagId, { value: auctionSettings.RESERVE_PRICE }))
        .to.emit(
          ETSAuctionHouse, "AuctionBid"
        )
        .withArgs(
          etsOwnedTagId,
          accounts.RandomTwo.address,
          auctionSettings.RESERVE_PRICE,
          false
        );
    });
  });
   
   describe("Bidding on active auction", async function () {
     beforeEach(async function () {
       // Create an auction with an opening bid by RandomOne. 
       await ETSAuctionHouse.connect(accounts.RandomOne).createBid(etsOwnedTagId, { value: auctionSettings.RESERVE_PRICE });
 
     });
     it ("should revert if bid doesn't meet min bid increment", async function () {
       const auction = await ETSAuctionHouse.getAuction(etsOwnedTagId);
       const low_bid_increment = Number(auction.amount) + (Number(auction.amount) * ((auctionSettings.MIN_INCREMENT_BID_PERCENTAGE - 3)/100));
       await expect(ETSAuctionHouse.connect(accounts.RandomTwo).createBid(etsOwnedTagId, { value: low_bid_increment }))
         .to.be.revertedWith(
           "Must send more than last bid by minBidIncrementPercentage amount",
         );
     });
 
     it ("should emit an `AuctionBid` event on a successful sencond bid", async function () {
 
       // RandomTwo successfully increments the bid.
       await expect(ETSAuctionHouse.connect(accounts.RandomTwo).createBid(etsOwnedTagId, { value: auctionSettings.RESERVE_PRICE * 2 }))
         .to.emit(
           ETSAuctionHouse, "AuctionBid"
         )
         .withArgs(
           etsOwnedTagId,
           accounts.RandomTwo.address,
           auctionSettings.RESERVE_PRICE * 2,
           false
         );
     });
 
     it ("should return funds to previous bidder on good bid", async function () {
 
       const RandomOnePostBidBalance = await accounts.RandomOne.getBalance();
       // RandomTwo successfully increments the bid.
       await ETSAuctionHouse.connect(accounts.RandomTwo).createBid(etsOwnedTagId, { value: auctionSettings.RESERVE_PRICE * 2 });
       const RandomOnePostRefundBalance = await accounts.RandomOne.getBalance();
       expect(RandomOnePostRefundBalance).to.equal(RandomOnePostBidBalance.add(auctionSettings.RESERVE_PRICE));
 
     });
 
     it('should cap the maximum bid griefing cost at 30K gas + the cost to wrap and transfer WETH', async () => {
   
       const maliciousBidder = await (await (await ethers.getContractFactory("MaliciousBidder")).deploy()).deployed();
       const maliciousBid = await maliciousBidder
         .connect(accounts.RandomOne)
         .bid(ETSAuctionHouse.address, etsOwnedTagId, {
           value: auctionSettings.RESERVE_PRICE * 2,
         });
       await maliciousBid.wait();
   
       const tx = await ETSAuctionHouse.connect(accounts.RandomTwo).createBid(etsOwnedTagId, {
         value: auctionSettings.RESERVE_PRICE * 4,
         gasLimit: 1_000_000,
       });
       const result = await tx.wait();
   
       expect(result.gasUsed.toNumber()).to.be.lessThan(200_000);
       expect(await WETH.balanceOf(maliciousBidder.address)).to.equal(auctionSettings.RESERVE_PRICE * 2);
     });
 
     it('should emit an `AuctionExtended` event if the auction end time is within the time buffer', async () => {
   
       const auction = await ETSAuctionHouse.getAuction(etsOwnedTagId);
       // Advance blockchain to current end time less 5 minutes. 
       await ethers.provider.send('evm_setNextBlockTimestamp', [auction.endTime.sub(auctionSettings.TIME_BUFFER/2).toNumber()]);
       
       await expect(ETSAuctionHouse.connect(accounts.RandomTwo).createBid(etsOwnedTagId, { value: auctionSettings.RESERVE_PRICE * 2 }))
         .to.emit(
           ETSAuctionHouse, "AuctionExtended"
         )
         .withArgs(
           etsOwnedTagId,
           auction.endTime.add(auctionSettings.TIME_BUFFER/2)
         );
     });
 
   });
 
   describe("Bidding on ended, but not settled auction", async function () {
 
     beforeEach(async function () {
       // Create an auction with an opening bid. 
       await ETSAuctionHouse.connect(accounts.RandomOne).createBid(etsOwnedTagId, { value: auctionSettings.RESERVE_PRICE });
 
       // Advance the blockchain one minute past auction end time.
       const auction = await ETSAuctionHouse.getAuction(etsOwnedTagId);
       await ethers.provider.send('evm_setNextBlockTimestamp', [auction.endTime.add(60).toNumber()]);
     });
 
     it ("should revert", async function () {
       await expect(ETSAuctionHouse.connect(accounts.RandomOne).createBid(etsOwnedTagId, { value: auctionSettings.RESERVE_PRICE }))
       .to.be.revertedWith(
         "Auction ended",
       );
     });
   });
 
   describe("Settling an active auction", async function () {
     it ("should revert", async function () {
       await ETSAuctionHouse.connect(accounts.RandomOne).createBid(etsOwnedTagId, { value: auctionSettings.RESERVE_PRICE });
       await expect(ETSAuctionHouse.connect(accounts.RandomOne).settleAuction(etsOwnedTagId))
       .to.be.revertedWith(
         "Auction hasn't completed",
       );
     });
   });
 
 
   describe("Settling an ended auction", async function () {
     beforeEach(async function () {
       // Create new auction with an opening bid. 
       await ETSAuctionHouse.connect(accounts.RandomOne).createBid(etsOwnedTagId, { value: auctionSettings.RESERVE_PRICE });
       const auction = await ETSAuctionHouse.getAuction(etsOwnedTagId);
       await ethers.provider.send('evm_setNextBlockTimestamp', [auction.endTime.add(60).toNumber()]);
     });
 
     it ("should revert for non-existent auction", async function () {
 
       await expect(ETSAuctionHouse.connect(accounts.RandomOne).settleAuction(constants.Two))
       .to.be.revertedWith(
         "Auction doesn't exist",
       );
     });
 
     it ("should send CTAG token to winning bidder", async function () {
 
       const auction = await ETSAuctionHouse.getAuction(etsOwnedTagId);
       const bidder = auction.bidder;
       
       await expect(ETSAuctionHouse.connect(accounts.RandomOne).settleAuction(etsOwnedTagId))
         .to.emit(
           ETSAuctionHouse, "AuctionSettled"
         );
       assert(await ETSToken.ownerOf(etsOwnedTagId) == bidder);
     });
 
     it ("should send auction proceeds to actors", async function () {
 
       const auction = await ETSAuctionHouse.getAuction(etsOwnedTagId);
       const winner = auction.bidder;
       const totalProceeds = auction.amount;
 
       const ctag = await ETSToken.getTag(etsOwnedTagId);
       const publisherProceeds = (totalProceeds * await ETSAuctionHouse.publisherPercentage()) / 100;
       const creatorProceeds = (totalProceeds * await ETSAuctionHouse.creatorPercentage()) / 100;
 
       await expect(ETSAuctionHouse.connect(accounts.RandomOne).settleAuction(etsOwnedTagId))
         .to.emit(
           ETSAuctionHouse, "AuctionSettled"
         ).withArgs(
           etsOwnedTagId,
           winner,
           totalProceeds,
           publisherProceeds,
           creatorProceeds
         );
     });
 
     it ("should delete the auction", async function () {
       await expect(ETSAuctionHouse.connect(accounts.RandomOne).settleAuction(etsOwnedTagId))
         .to.emit(
           ETSAuctionHouse, "AuctionSettled"
         );
       
       const auction = await ETSAuctionHouse.getAuction(etsOwnedTagId);
       assert(auction.startTime == 0);
     });
   });

});
