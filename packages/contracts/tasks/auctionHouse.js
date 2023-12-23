var randomWords = require('random-words');

task("auctionhouse", "Create and interact with an auction")
  .addOptionalParam("settings", 'List of current settings', true, types.boolean)
  .addOptionalParam("action", "Options include: showactive, createauction, createbid, settleauction, togglepause, increasemax, setreserve", "", types.string)
  .addOptionalParam("tag", "specify tag to be acted on", "", types.string)
  .addOptionalParam("id", "auction id", "", types.integer)
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

    if (taskArgs.action == "showcurrent") {
      await hre.run("auctionhouse:showcurrent");
    }

    if (taskArgs.action == "status-tag") {
      await hre.run("auctionhouse:auctionstatus-tag", { tag: taskArgs.tag });
    }

    if (taskArgs.action == "status-id") {
      await hre.run("auctionhouse:auctionstatus-id", { id: taskArgs.id });
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

    if (taskArgs.action == "nextauction") {
      await hre.run("auctionhouse:nextauction");
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

    console.log('Paused:', paused);
    console.log('Max Auctions:', ethers.toNumber(maxAuctions));
    console.log('Active Auctions:', ethers.toNumber(activeAuctions));
    console.log('All Time Total Auctions:', ethers.toNumber(totalAuctions));
    console.log('Reserve price:', ethers.formatEther(reserve) + " ETH/MATIC");
  });

subtask("auctionhouse:auctionstatus-tag", "Shows status of a given tag auction")
  .addParam("tag", "tag being auctioned")
  .setAction(async (taskArgs) => {

    [accounts, contracts, maxAuctions] = await setup();

    const tagId = await contracts.etsToken.computeTagId(taskArgs.tag);
    if (!(await contracts.etsAuctionHouse.auctionExistsForTokenId(tagId))) {
      console.log("Auction not found for ", taskArgs.tag);
      return;
    }

    try {
      const auction = await contracts.etsAuctionHouse.getAuctionForTokenId(tagId);
      let latestBlock = (await hre.ethers.provider.getBlock()).timestamp;
      let ended = (ethers.toNumber(auction.startTime) > 0 && latestBlock > ethers.toNumber(auction.endTime)) ? "Yes" : "No";
      await displayAuctionDetails(auction, taskArgs.tag);

    } catch (error) {
      console.error("Error fetching auction or tag information:", error);
    }

  });

subtask("auctionhouse:auctionstatus-id", "Shows status of a given tag auction id")
  .addParam("id", "auction id")
  .setAction(async (taskArgs) => {

    [accounts, contracts, maxAuctions] = await setup();

    const auctionId = taskArgs.id;

    if (!(await contracts.etsAuctionHouse.auctionExists(auctionId))) {
      console.log("Auction not found for ", auctionId);
      return;
    }

    try {
      const auction = await contracts.etsAuctionHouse.getAuction(auctionId);
      let latestBlock = (await hre.ethers.provider.getBlock()).timestamp;
      let ended = (ethers.toNumber(auction.startTime) > 0 && latestBlock > ethers.toNumber(auction.endTime)) ? "Yes" : "No";
      const tag = await contracts.etsToken.getTagById(auction.tokenId);
      await displayAuctionDetails(auction, tag.display);

    } catch (error) {
      console.error("Error fetching auction or tag information:", error);
    }

  });

// Note this task only works if there is one active action at a time.
subtask("auctionhouse:showcurrent", "Shows status of a current active auction")
  .setAction(async () => {

    [accounts, contracts, maxAuctions] = await setup();

    if (await contracts.etsAuctionHouse.getActiveCount() > 1) {
      console.log("Command not possible when more than one active auction");
      return;
    }

    const auctionId = await contracts.etsAuctionHouse.getTotalCount();

    if (!(await contracts.etsAuctionHouse.auctionExists(auctionId))) {
      console.log("Auction not found for ", auctionId);
      return;
    }

    try {
      const auction = await contracts.etsAuctionHouse.getAuction(auctionId);
      let latestBlock = (await hre.ethers.provider.getBlock()).timestamp;
      let ended = (ethers.toNumber(auction.startTime) > 0 && latestBlock > ethers.toNumber(auction.endTime)) ? "Yes" : "No";
      const tag = await contracts.etsToken.getTagById(auction.tokenId);
      await displayAuctionDetails(auction, tag.display);

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
    const reserveInWEI = ethers.parseUnits(taskArgs.reserve, "ether");
    await contracts.etsAuctionHouse.connect(accounts.account0).setReservePrice(reserveInWEI);
    console.log("Reserve set to: ", reserveInWEI + " WEI (" + taskArgs.reserve + " ETH/MATIC)");
  });

subtask("auctionhouse:increasemax", "Increases max auctions by one.")
  .setAction(async () => {
    [accounts, contracts, maxAuctions] = await setup();
    await contracts.etsAuctionHouse.connect(accounts.account0).setMaxAuctions(maxAuctions + 1);
    console.log("max auctions increased to", maxAuctions + 1);

  });

subtask("auctionhouse:nextauction", "Creates next auction using ETS Oracle")

  .setAction(async () => {
    [accounts, contracts, maxAuctions] = await setup();

    let auctionCount = await contracts.etsAuctionHouse.getActiveCount();
    console.log("auctionCount", auctionCount);
    if (ethers.toNumber(auctionCount) >= maxAuctions) {
      console.log("No auction slots");
      return;
    }

    const txn = await contracts.etsAuctionHouse.createNextAuction();
    await txn.wait();
    await hre.run("auctionhouse:showcurrent");

  });

subtask("auctionhouse:createauction", "Creates an auction given an existing CTAG string")
  .addParam("tag", "tag to be auctioned")
  .setAction(async (taskArgs) => {
    [accounts, contracts, maxAuctions] = await setup();

    let auctionCount = await contracts.etsAuctionHouse.getActiveCount();

    if (ethers.toNumber(auctionCount) >= maxAuctions) {
      console.log("No auction slots");
      return;
    }

    const tagId = await contracts.etsToken.computeTagId(taskArgs.tag);
    const txn = await contracts.etsAuctionHouse.connect(accounts.account1).fulfillRequestCreateAuction(tagId);
    await txn.wait();

    await hre.run("auctionhouse:auctionstatus-tag", { tag: taskArgs.tag });

    // printAuctionInfo(tagId);

  });

subtask("auctionhouse:createbid", "Creates a bid on a CTAG auction")
  .addParam("tag", "tag to be bid on")
  .addParam("bid", "bid amount")
  .addParam("signer", "signer", "account2")
  .setAction(async (taskArgs) => {

    [accounts, contracts, maxAuctions] = await setup();

    const tagId = await contracts.etsToken.computeTagId(taskArgs.tag);

    if (!(await contracts.etsAuctionHouse.auctionExistsForTokenId(tagId))) {
      console.log("Auction not found for ", taskArgs.tag);
      return;
    }

    const auction = await contracts.etsAuctionHouse.getAuctionForTokenId(tagId);

    console.log("BEFORE BID");
    await hre.run("auctionhouse:auctionstatus-tag", { tag: taskArgs.tag });
    // printAuctionInfo(tagId);

    const bidInWEI = ethers.parseUnits(taskArgs.bid, "ether");
    const txn = await contracts.etsAuctionHouse.connect(accounts[taskArgs.signer]).createBid(auction.auctionId, { value: bidInWEI });
    await txn.wait();

    console.log("AFTER BID");
    await hre.run("auctionhouse:auctionstatus-tag", { tag: taskArgs.tag });
    // printAuctionInfo(tagId);


  });

subtask("auctionhouse:settleauction", "Settles a CTAG auction for a given tag")
  .addParam("tag", "tag to settled")
  .addParam("signer", "signer", "account2")
  .setAction(async (taskArgs) => {
    [accounts, contracts, maxAuctions] = await setup();
    const tagId = await contracts.etsToken.computeTagId(taskArgs.tag);

    if (!(await contracts.etsAuctionHouse.auctionExistsForTokenId(tagId))) {
      console.log("Auction not found for ", taskArgs.tag);
      return;
    }

    let auction = await contracts.etsAuctionHouse.getAuctionForTokenId(tagId);

    if (auction.amount == 0) {
      console.log("No bids placed on ", taskArgs.tag);
      return;
    }

    const latestBlock = (await hre.ethers.provider.getBlock()).timestamp;
    const auctionEndTime = ethers.toNumber(auction.endTime);

    if (auctionEndTime + 60 > latestBlock) {
      await ethers.provider.send("evm_setNextBlockTimestamp", [auctionEndTime + 60]);
    }

    const txn = await contracts.etsAuctionHouse.settleCurrentAndCreateNewAuction(auction.auctionId);
    await txn.wait();

    console.log("Note: settle auction advances the blocknumber and effectively ends all active auctions.");
    console.log("Auction settled for ", taskArgs.tag);
    auction = await contracts.etsAuctionHouse.getAuction(auction.auctionId);

    await hre.run("auctionhouse:auctionstatus-tag", { tag: taskArgs.tag });

  });

// Define a function to display auction details
async function displayAuctionDetails(auction, tag) {
  let latestBlock = (await hre.ethers.provider.getBlock()).timestamp;
  let ended = (ethers.toNumber(auction.startTime) > 0 && latestBlock > ethers.toNumber(auction.endTime)) ? "Yes" : "No";
  const started = auction.startTime > 0 ? "Yes" : "No";

  console.log("=================================================");
  console.log("    Auction Details for", tag);
  console.log("-------------------------------------------------")
  console.log("      auction id: ", ethers.toNumber(auction.auctionId));
  console.log("    reservePrice: ", ethers.formatEther(auction.reservePrice) + " ETH/MATIC");
  console.log("current high bid: ", ethers.formatEther(auction.amount) + " ETH/MATIC");
  console.log("       startTime: ", ethers.toNumber(auction.startTime));
  console.log("         endTime: ", ethers.toNumber(auction.endTime));
  console.log("    current time: ", latestBlock);
  console.log("          bidder: ", auction.bidder);
  console.log("      auctioneer: ", auction.auctioneer);
  console.log("         started: ", started);
  console.log("           ended: ", ended);
  console.log("         settled: ", auction.settled);
  console.log("=================================================");
}


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
  maxAuctions = ethers.toNumber(maxAuctions);

  return [accounts, contracts, maxAuctions];
}

exports.setup = setup;
