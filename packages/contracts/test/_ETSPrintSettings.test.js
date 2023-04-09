const { setup } = require("./setup.js");
const { ethers } = require("hardhat");
const { expect, assert } = require("chai");
const { constants } = ethers;

//let accounts, factories, contracts.ETSAccessControls, ETSLifeCycleControls, contracts.ETSToken;
let targetURI;

describe("============= ETS TEST SUITE SETTINGS =============", function () {
  // we create a setup function that can be called by every test and setup variable for easy to read tests
  it("is running with the preceding settings", async function () {
    [accounts, contracts, initSettings] = await setup();
    console.log("======================== ACCOUNTS ============================");
    console.log("ETSAdmin:", accounts.ETSAdmin.address);
    console.log("ETSPlatform:", accounts.ETSPlatform.address);
    console.log("Buyer:", accounts.Buyer.address);
    console.log("RandomOne:", accounts.RandomOne.address);
    console.log("RandomTwo:", accounts.RandomTwo.address);
    console.log("Creator:", accounts.Creator.address);
    console.log("======================== CONTRACTS ============================");
    console.log("WMATIC:", contracts.WMATIC.address);
    console.log("ETSAccessControls:", contracts.ETSAccessControls.address);
    console.log("ETSToken:", contracts.ETSToken.address);
    console.log("ETSAuctionHouse:", contracts.ETSAuctionHouse.address);
    console.log("ETSTarget:", contracts.ETSTarget.address);
    console.log("ETSEnrichTarget:", contracts.ETSEnrichTarget.address);
    console.log("ETS:", contracts.ETS.address);
    console.log("ETSRelayer:", contracts.ETSRelayer.address);
    console.log("======================== INIT SETTINGS ============================");
    console.log(initSettings);
  });
});
