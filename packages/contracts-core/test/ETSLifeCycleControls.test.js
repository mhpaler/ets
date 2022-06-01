const { ethers, upgrades } = require("hardhat");
const { expect, assert } = require("chai");
const { BigNumber, constants } = ethers;

let accounts, factories, ETSAccessControls, ETSLifeCycleControls, ETS;

describe("ETS Lifecycle Tests", function () {
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
      expect(await ETSLifeCycleControls.ownershipTermLength()).to.be.equal("63072000");
    });
  });
});
