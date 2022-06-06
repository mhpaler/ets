const { setup } = require("./setup.js");
const { ethers, upgrades } = require("hardhat");
const { expect, assert } = require("chai");
const { BigNumber, constants } = ethers;

//let accounts, factories, ETSAccessControls, ETSLifeCycleControls, ETSToken;

describe("ETS Auction House Tests", function () {
  // we create a setup function that can be called by every test and setup variable for easy to read tests
  beforeEach("Setup test", async function () {
    [accounts, ETSAccessControls, ETSToken] = await setup();   
  });

  describe("Validate setup", async function () {
    it("should have name and symbol", async function () {
      expect(await ETSToken.name()).to.be.equal("Ethereum Tag Service");
      expect(await ETSToken.symbol()).to.be.equal("CTAG");
      expect(await ETSToken.platform()).to.be.equal(accounts.ETSPlatform.address);
    });
  });

});
