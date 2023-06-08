const { getParsedEthersError } = require("@enzoferey/ethers-error-parser");
var randomWords = require('random-words');

task("auctionhouse", "Create and interact with an auction")
  .addOptionalParam("status", 'List of current settings', false, types.boolean)
  .addOptionalParam("action", "Options include: createauction, createbid, settleauction, togglepause, increasemax", "", types.string)
  .addOptionalParam("tag", "specify tag to be acted on", "", types.string)
  .addOptionalParam("bid", "bid amount", 0, types.int)
  .addOptionalParam(
    "signer",
    'Named wallet accounts. options are "account0", "account1", "account2", "account3", "account4", "account5". Defaults to "account0"',
    "account0",
  )
  .setAction(async (taskArgs, hre) => {

    if (taskArgs.status) {
      await hre.run("auctionhouse:status");
    }

    if (taskArgs.action == "togglepause") {
      await hre.run("auctionhouse:togglepause");
    }

    if (taskArgs.action == "increasemax") {
      await hre.run("auctionhouse:increasemax");
    }

    if (taskArgs.action == "createauction") {
      await hre.run("auctionhouse:createauction", { tag: taskArgs.tag });
    }

    if (taskArgs.action == "createbid") {
      await hre.run(
        "auctionhouse:createbid",
        {
          tag: taskArgs.tag,
          bid: taskArgs.bid,
          signer: taskArgs.signer
        }
      );
    }

    if (taskArgs.action == "settleauction") {
      await hre.run("auctionhouse:settleauction", { tag: taskArgs.tag, signer: taskArgs.signer });
    }

  });

subtask("auctionhouse:status", "Creates an auction given an existing CTAG string")
  .setAction(async () => {
    [accounts, contracts, maxAuctions] = await setup();

    // get pause status.
    paused = await contracts.etsAuctionHouse.paused();
    maxAuctions = await contracts.etsAuctionHouse.maxAuctions();
    activeAuctions = await contracts.etsAuctionHouse.getActiveCount();
    totalAuctions = await contracts.etsAuctionHouse.getTotalCount();

    console.log('Paused:', paused);
    console.log('Max Auctions:', maxAuctions.toNumber());
    console.log('Active Auctions:', activeAuctions.toNumber());
    console.log('All Time Total Auctions:', totalAuctions.toNumber());

  });

subtask("auctionhouse:togglepause", "Pause/Unpause the auctionhouse.")
  .setAction(async () => {
    [accounts, contracts, maxAuctions] = await setup();

    if (await contracts.etsAuctionHouse.paused()) {
      await contracts.etsAuctionHouse.connect(accounts.account0).unpause()
      console.log("auctionhouse unpaused");

    } else {
      await contracts.etsAuctionHouse.connect(accounts.account0).pause()
      console.log("auctionhouse paused");
    }

  });

subtask("auctionhouse:increasemax", "Increases max auctions by one.")
  .setAction(async () => {
    [accounts, contracts, maxAuctions] = await setup();
    await contracts.etsAuctionHouse.connect(accounts.account0).setMaxAuctions(maxAuctions + 1);
    console.log("max auctions increased to", maxAuctions + 1);

  });

subtask("auctionhouse:createauction", "Creates an auction given an existing CTAG string")
  .addParam("tag", "tag to be auctioned")
  .setAction(async (taskArgs) => {
    [accounts, contracts, maxAuctions] = await setup();

    let auctionCount = await contracts.etsAuctionHouse.getActiveCount();

    if (auctionCount.toNumber() >= maxAuctions) {
      console.log("No auction slots");
      return;
    }

    const tagId = await contracts.etsToken.computeTagId(taskArgs.tag);
    const txn = await contracts.etsAuctionHouse.connect(accounts.account1).fulfillRequestCreateAuction(tagId);
    await txn.wait();
    const newAuction = await contracts.etsAuctionHouse.getAuction(tagId);
    console.log("New auction created for", taskArgs.tag);
    printAuctionInfo(newAuction);

  });

subtask("auctionhouse:createbid", "Creates a bid on a CTAG auction")
  .addParam("tag", "tag to be bid on")
  .addParam("bid", "bid amount", 0, types.int)
  .addParam("signer", "signer", "account2")
  .setAction(async (taskArgs) => {

    [accounts, contracts, maxAuctions] = await setup();

    const tagId = await contracts.etsToken.computeTagId(taskArgs.tag);

    if (!(await contracts.etsAuctionHouse.auctionExists(tagId))) {
      console.log("Auction not found for ", taskArgs.tag);
      return;
    }

    const auctionPreBid = await contracts.etsAuctionHouse.getAuction(tagId);
    const txn = await contracts.etsAuctionHouse.connect(accounts[taskArgs.signer]).createBid(tagId, { value: taskArgs.bid });
    await txn.wait();
    const auctionPostBid = await contracts.etsAuctionHouse.getAuction(tagId);

    console.log("CTAG: ", taskArgs.tag);
    console.log("BEFORE BID");
    printAuctionInfo(auctionPreBid);
    console.log("AFTER BID");
    printAuctionInfo(auctionPostBid);


  });

subtask("auctionhouse:settleauction", "Settles a CTAG auction for a given tag")
  .addParam("tag", "tag to settled")
  .addParam("signer", "signer", "account2")
  .setAction(async (taskArgs) => {
    [accounts, contracts, maxAuctions] = await setup();
    const tagId = await contracts.etsToken.computeTagId(taskArgs.tag);

    if (!(await contracts.etsAuctionHouse.auctionExists(tagId))) {
      console.log("Auction not found for ", taskArgs.tag);
      return;
    }

    let auction = await contracts.etsAuctionHouse.getAuction(tagId);

    if (auction.amount.toNumber() == 0) {
      console.log("No bids placed on ", taskArgs.tag);
      return;
    }
    await ethers.provider.send("evm_setNextBlockTimestamp", [auction.endTime.add(60).toNumber()]);
    const txn = await contracts.etsAuctionHouse.settleCurrentAndCreateNewAuction(tagId);
    await txn.wait();

    console.log("Note: settle auction advances the blocknumber and effectively ends all active auctions.");
    console.log("Auction settled for ", taskArgs.tag);
    auction = await contracts.etsAuctionHouse.getAuction(tagId);
    printAuctionInfo(auction);
    //settleCurrentAndCreateNewAuction

    console.log("Simulating creating next auction...")
    // Create a new auction:
    let nextTag = randomWords(1);
    nextTag = "#" + nextTag[0];
    let tagsToMint = [nextTag];
    const tx = await contracts.etsRelayer.connect(accounts.account3).getOrCreateTagIds(tagsToMint);
    await tx.wait();
    await hre.run("auctionhouse:createauction", { tag: nextTag });

  });

var setup = async () => {
  const { getAccounts } = require("./utils/getAccounts");
  const config = require("../config/config.json");

  const chainId = hre.network.config.chainId;
  const accounts = await getAccounts();

  const ETSAccessControlsABI = require("../abi/contracts/ETSAccessControls.sol/ETSAccessControls.json");
  const ETSAuctionHouseABI = require("../abi/contracts/ETSAuctionHouse.sol/ETSAuctionHouse.json");
  const ETSTokenABI = require("../abi/contracts/ETSToken.sol/ETSToken.json");
  const ETSRelayerV1ABI = require("../abi/contracts/relayers/ETSRelayerV1.sol/ETSRelayerV1.json");

  const ETSAccessControlsAddress = config[chainId].contracts.ETSAccessControls.address;
  const ETSAuctionHouseAddress = config[chainId].contracts.ETSAuctionHouse.address;
  const ETSTokenAddress = config[chainId].contracts.ETSToken.address;

  const etsAccessControls = new ethers.Contract(
    ETSAccessControlsAddress,
    ETSAccessControlsABI,
    accounts.account0,
  );

  const etsAuctionHouse = new ethers.Contract(
    ETSAuctionHouseAddress,
    ETSAuctionHouseABI,
    accounts.account0,
  );
  const etsToken = new ethers.Contract(ETSTokenAddress, ETSTokenABI, accounts.account0);
  const relayerAddress = await etsAccessControls.getRelayerAddressFromName("ETSRelayer");
  const etsRelayer = new ethers.Contract(relayerAddress, ETSRelayerV1ABI, accounts.account0);

  const contracts = {
    etsToken: etsToken,
    etsRelayer: etsRelayer,
    etsAuctionHouse: etsAuctionHouse,
  };


  let maxAuctions = await contracts.etsAuctionHouse.maxAuctions();
  maxAuctions = maxAuctions.toNumber();

  return [accounts, contracts, maxAuctions];
}

var printAuctionInfo = async (auction) => {
  console.log("auction id: ", auction.auctionId.toNumber());
  console.log("amount: ", auction.amount.toNumber());
  console.log("startTime: ", auction.startTime.toNumber());
  console.log("endTime: ", auction.endTime.toNumber());
  console.log("reservePrice: ", auction.reservePrice.toNumber());
  console.log("bidder: ", auction.bidder);
  console.log("auctioneer: ", auction.auctioneer);
  console.log("settled: ", auction.settled);
  console.log("=================================================");
}
exports.printAuctionInfo = printAuctionInfo;
exports.setup = setup;
