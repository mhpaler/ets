var randomWords = require('random-words');

task("auctionhouse", "Create and interact with an auction")
  .addOptionalParam("settings", 'List of current settings', true, types.boolean)
  .addOptionalParam("action", "Options include: createauction, createbid, settleauction, togglepause, increasemax, setreserve", "", types.string)
  .addOptionalParam("tag", "specify tag to be acted on", "", types.string)
  .addOptionalParam("bid", "bid amount in ETH/MATIC. eg. \"0.1\"", "", types.string)
  .addOptionalParam("reserve", "reserve price (min bid) in ETH/MATIC. eg. \"0.1\"", "", types.string)
  .addOptionalParam(
    "signer",
    'Named wallet accounts. options are "account0", "account1", "account2", "account3", "account4", "account5". Defaults to "account0"',
    "account0",
  )
  .setAction(async (taskArgs, hre) => {

    if (taskArgs.action == "settings") {
      await hre.run("auctionhouse:settings");
    }

    if (taskArgs.action == "status") {
      await hre.run("auctionhouse:auctionstatus", { tag: taskArgs.tag });
    }

    if (taskArgs.action == "togglepause") {
      await hre.run("auctionhouse:togglepause");
    }

    if (taskArgs.action == "setreserve") {
      await hre.run("auctionhouse:setreserve", { reserve: taskArgs.reserve });
    }

    if (taskArgs.action == "increasemax") {
      await hre.run("auctionhouse:increasemax");
    }

    if (taskArgs.action == "auction") {
      await hre.run("auctionhouse:createauction", { tag: taskArgs.tag });
    }

    if (taskArgs.action == "bid") {
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

subtask("auctionhouse:settings", "List auction settings")
  .setAction(async () => {
    [accounts, contracts, maxAuctions] = await setup();

    paused = await contracts.etsAuctionHouse.paused();
    maxAuctions = await contracts.etsAuctionHouse.maxAuctions();
    activeAuctions = await contracts.etsAuctionHouse.getActiveCount();
    totalAuctions = await contracts.etsAuctionHouse.getTotalCount();
    reserve = await contracts.etsAuctionHouse.reservePrice();
    console.log(reserve);

    console.log('Paused:', paused);
    console.log('Max Auctions:', maxAuctions.toNumber());
    console.log('Active Auctions:', activeAuctions.toNumber());
    console.log('All Time Total Auctions:', totalAuctions.toNumber());
    console.log('Reserve price:', hre.ethers.utils.formatEther(reserve) + " ETH/MATIC");
  });

subtask("auctionhouse:auctionstatus", "Shows status of a given tag auction")
  .addParam("tag", "tag being auctioned")
  .setAction(async (taskArgs) => {

    [accounts, contracts, maxAuctions] = await setup();

    const tagId = await contracts.etsToken.computeTagId(taskArgs.tag);
    if (!(await contracts.etsAuctionHouse.auctionExists(tagId))) {
      console.log("Auction not found for ", taskArgs.tag);
      return;
    }

    try {
      const auction = await contracts.etsAuctionHouse.getAuction(tagId);
      let latestBlock = (await hre.ethers.provider.getBlock()).timestamp;
      let ended = (auction.startTime.toNumber() > 0 && latestBlock > auction.endTime.toNumber()) ? "Yes" : "No";

      console.log("=================================================");
      console.log("Auction Info");
      console.log("CTAG: ", taskArgs.tag);
      console.log("auction id: ", auction.auctionId.toNumber());
      console.log("reservePrice: ", ethers.utils.formatEther(auction.reservePrice) + " ETH/MATIC");
      console.log('current high bid:', ethers.utils.formatEther(auction.amount) + " ETH/MATIC");
      console.log("startTime: ", auction.startTime.toNumber());
      console.log("endTime: ", auction.endTime.toNumber());
      console.log("current time: ", latestBlock);
      console.log("bidder: ", auction.bidder);
      console.log("auctioneer: ", auction.auctioneer);
      console.log("ended: ", ended);
      console.log("settled: ", auction.settled);
      console.log("=================================================");

    } catch (error) {
      console.error("Error fetching auction or tag information:", error);
    }

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

subtask("auctionhouse:setreserve", "Sets reserve price for all actions (eg. min first bid)")
  .addParam("reserve", "Reserve price")
  .setAction(async (taskArgs) => {

    [accounts, contracts, maxAuctions] = await setup();
    const reserveInWEI = hre.ethers.utils.parseUnits(taskArgs.reserve, "ether");
    await contracts.etsAuctionHouse.connect(accounts.account0).setReservePrice(reserveInWEI);
    console.log("Reserve set to: ", reserveInWEI + " WEI (" + taskArgs.reserve + " ETH/MATIC)");
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

    await hre.run("auctionhouse:auctionstatus", { tag: taskArgs.tag });

    // printAuctionInfo(tagId);

  });

subtask("auctionhouse:createbid", "Creates a bid on a CTAG auction")
  .addParam("tag", "tag to be bid on")
  .addParam("bid", "bid amount")
  .addParam("signer", "signer", "account2")
  .setAction(async (taskArgs) => {

    [accounts, contracts, maxAuctions] = await setup();

    const tagId = await contracts.etsToken.computeTagId(taskArgs.tag);

    if (!(await contracts.etsAuctionHouse.auctionExists(tagId))) {
      console.log("Auction not found for ", taskArgs.tag);
      return;
    }

    console.log("BEFORE BID");
    await hre.run("auctionhouse:auctionstatus", { tag: taskArgs.tag });
    // printAuctionInfo(tagId);

    const bidInWEI = hre.ethers.utils.parseUnits(taskArgs.bid, "ether");
    const txn = await contracts.etsAuctionHouse.connect(accounts[taskArgs.signer]).createBid(tagId, { value: bidInWEI });
    await txn.wait();

    console.log("AFTER BID");
    await hre.run("auctionhouse:auctionstatus", { tag: taskArgs.tag });
    // printAuctionInfo(tagId);


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

    if (auction.amount == 0) {
      console.log("No bids placed on ", taskArgs.tag);
      return;
    }

    const latestBlock = (await hre.ethers.provider.getBlock()).timestamp;

    if (auction.endTime.add(60).toNumber() > latestBlock) {
      await ethers.provider.send("evm_setNextBlockTimestamp", [auction.endTime.add(60).toNumber()]);
    }

    const txn = await contracts.etsAuctionHouse.settleCurrentAndCreateNewAuction(tagId);
    await txn.wait();

    console.log("Note: settle auction advances the blocknumber and effectively ends all active auctions.");
    console.log("Auction settled for ", taskArgs.tag);
    auction = await contracts.etsAuctionHouse.getAuction(tagId);

    await hre.run("auctionhouse:auctionstatus", { tag: taskArgs.tag });
    //printAuctionInfo(auction);
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

var printAuctionInfo = async (tagId) => {
  const { ethers, hre } = require("hardhat");

  try {
    const auction = await contracts.etsAuctionHouse.getAuction(tagId);
    const tag = await contracts.etsToken.getTagById(tagId);

    let latestBlock = (await hre.ethers.provider.getBlock()).timestamp;
    let ended = (auction.startTime.toNumber() > 0 && latestBlock > auction.endTime.toNumber()) ? "Yes" : "No";

    console.log("=================================================");
    console.log("Auction Info");
    console.log("CTAG: ", tag.display);
    console.log("auction id: ", auction.auctionId.toNumber());
    console.log('amount:', ethers.utils.formatEther(auction.amount) + " ETH/MATIC");
    console.log("startTime: ", auction.startTime.toNumber());
    console.log("endTime: ", auction.endTime.toNumber());
    console.log("reservePrice: ", ethers.utils.formatEther(auction.reservePrice) + " ETH/MATIC");
    console.log("bidder: ", auction.bidder);
    console.log("auctioneer: ", auction.auctioneer);
    console.log("ended: ", ended);
    console.log("settled: ", auction.settled);
    console.log("=================================================");

  } catch (error) {
    console.error("Error fetching auction or tag information:", error);
  }

}
exports.printAuctionInfo = printAuctionInfo;
exports.setup = setup;
