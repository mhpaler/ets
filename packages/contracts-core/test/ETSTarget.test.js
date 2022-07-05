const {setup} = require("./setup.js");
const {ethers} = require("hardhat");
const {expect, assert} = require("chai");
const {constants} = ethers;

//let accounts, factories, contracts.ETSAccessControls, ETSLifeCycleControls, contracts.ETSToken;

describe("ETS Target tests", function () {
  // we create a setup function that can be called by every test and setup variable for easy to read tests
  beforeEach("Setup test", async function () {
    [accounts, contracts, initSettings] = await setup();
  });

  describe("Valid setup", async function () {
    it("should have Access controls set to ETSAccessControls contract", async function () {
      const enrich = await contracts.ETSTarget.etsEnrichTarget();
      console.log(enrich);
      expect(await contracts.ETSTarget.etsAccessControls()).to.be.equal(contracts.ETSAccessControls.address);
    });
  });

  describe("Administrator role", async function () {
    it("should be able to set access controls", async function () {
      await expect(contracts.ETSTarget.connect(accounts.RandomTwo).setAccessControls(accounts.RandomOne.address)).to.be
        .reverted;
      await contracts.ETSTarget.connect(accounts.ETSPlatform).setAccessControls(accounts.RandomTwo.address);
      expect(await contracts.ETSTarget.etsAccessControls()).to.be.equal(accounts.RandomTwo.address);
    });
  });

  describe("Setting access controls", async () => {
    it("should revert when setting to zero address", async function () {
      await expect(
        contracts.ETSTarget.connect(accounts.ETSPlatform).setAccessControls(constants.AddressZero),
      ).to.be.revertedWith("Access controls cannot be zero");
    });
  });

  describe("Creating a target", async function () {});
});
