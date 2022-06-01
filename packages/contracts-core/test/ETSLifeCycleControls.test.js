const { ethers, upgrades } = require("hardhat");
const { expect, assert } = require("chai");
const { BigNumber, constants } = ethers;

let accounts, factories, ETSAccessControls, ETSLifeCycleControls, ETS;

describe("ETS Lifecycle Admin Tests", function () {
  // we create a setup function that can be called by every test and setup variable for easy to read tests
  beforeEach("Setup test", async function () {
    // See namedAccounts section of hardhat.config.js
    const namedAccounts = await ethers.getNamedSigners();
    const unnamedAccounts = await ethers.getUnnamedSigners();
    accounts = {
      ETSAdmin: namedAccounts["ETSAdmin"],
      ETSPublisher: namedAccounts["ETSPublisher"],
      ETSPlatform: namedAccounts["ETSPlatform"],
      Buyer: unnamedAccounts[0],
      RandomOne: unnamedAccounts[1],
      RandomTwo: unnamedAccounts[2],
      Creator: unnamedAccounts[3],
    };

    factories = {
      ETSAccessControls: await ethers.getContractFactory("ETSAccessControls"),
      ETSLifeCycleControls: await ethers.getContractFactory("ETSLifeCycleControls"),
      ETS: await ethers.getContractFactory("ETS"),
    };

    ETSAccessControls = await upgrades.deployProxy(factories.ETSAccessControls, { kind: "uups" });
    assert((await ETSAccessControls.isAdmin(accounts.ETSAdmin.address)) === true);

    await ETSAccessControls.grantRole(
      await ETSAccessControls.SMART_CONTRACT_ROLE(),
      accounts.ETSAdmin.address,
      { from: accounts.ETSAdmin.address },
    );

    // add a publisher to the protocol
    await ETSAccessControls.grantRole(ethers.utils.id("PUBLISHER"), accounts.ETSPublisher.address);

    ETSLifeCycleControls = await upgrades.deployProxy(
      factories.ETSLifeCycleControls,
      [ETSAccessControls.address],
      { kind: "uups" },
    );

    assert((await ETSLifeCycleControls.version()) === "0.1.0");
    assert((await ETSLifeCycleControls.ets()) === constants.AddressZero);

    ETS = await upgrades.deployProxy(
      factories.ETS,
      [ETSAccessControls.address, ETSLifeCycleControls.address, accounts.ETSPlatform.address],
      { kind: "uups" },
    );

    await ETSLifeCycleControls.setETS(ETS.address);

  });

  describe("Validate setup", async function () {
    it("should have name and symbol", async function () {
      expect(await ETS.name()).to.be.equal("Ethereum Tag Service");
      expect(await ETS.symbol()).to.be.equal("CTAG");
      expect(await ETS.platform()).to.be.equal(accounts.ETSPlatform.address);
    });

    it("should have default configs", async function () {
      assert((await ETSLifeCycleControls.version()) === "0.1.0");
      assert((await ETSLifeCycleControls.ets()) === ETS.address);
      assert((await ETSLifeCycleControls.accessControls()) === ETSAccessControls.address);
      expect(await ETSLifeCycleControls.ownershipTermLength()).to.be.equal("63072000");
    });
  });

  describe("Owner/Admin functions", async function () {
    it("Admin should be able to set ownership term", async function() {
      const thirtyDays = 30 * 24 * 60 * 60;
      await ETSLifeCycleControls.setOwnershipTermLength(thirtyDays);
      expect(await ETSLifeCycleControls.ownershipTermLength()).to.be.equal(thirtyDays);
    });

    it("Only admin should be able to set ownership term", async function() {
      await expect(
        ETSLifeCycleControls.connect(accounts.RandomTwo).setOwnershipTermLength(10)).to.be.revertedWith(
        "Caller must have administrator access",
      );
    });
  });

  describe("Renewing a tag", async function () {
    let lastTransferTime, tokenId;

    beforeEach(async function () {
      const tag = "#BlockRocket";

      // RandomTwo account creates a tag.
      await ETS.connect(accounts.RandomTwo).createTag(tag, accounts.ETSPublisher.address);
      tokenId = await ETS.computeTagId(tag);

      //assert((await ETSLifeCycleControls.version()) === "0.1.0");
      //await ETSLifeCycleControls.connETSLifeCycleControls.ETSPlatform).renewTag(tokenId);
      //lastTransferTime = await ETS.lifeCycleControls.getLastTransfer(tokenId);

    });

    it("Last renewed for newly minted token should be block timestamp", async function () {

      lastRenewed = await ETSLifeCycleControls.getLastRenewed(tokenId);

      console.log(Number(lastRenewed.toString()));

      let blockNum = await ethers.provider.getBlockNumber();
      let block = await ethers.provider.getBlock(blockNum);
      let timestamp = block.timestamp;

      // Verify current block timestamp and last renewTime are equal.
      expect(timestamp).to.be.equal(lastRenewed);

      
       
//      console.log("lastTransferTime", lastTransferTime);

     //await expect(ETS.connect(accounts.RandomTwo).lifeCycleControls.renewTag(tokenId)).to.be.revertedWith(
     //  "renewTag: Invalid sender",
     //);


    });

  });
});
