const { setup, getFactories, getArtifacts } = require("./setup.js");
const { expectEvent } = require("@openzeppelin/test-helpers");
const { upgrades } = require("hardhat");
const { assert } = require("chai");

let artifacts, factories;

describe("Upgrades tests", function () {

  beforeEach("Setup test", async function () {
    artifacts = await getArtifacts();
    factories = await getFactories();
    [accounts, contracts, initSettings] = await setup();
  });

  describe("ETSAccessControl", async function () {
    it("is upgradeable", async function () {

      // Upgrade the proxy.
      contracts.ETSAccessControls = await upgrades.upgradeProxy(
        contracts.ETSAccessControls.address,
        factories.ETSAccessControlsUpgrade,
      );
  
      const deployTxn = contracts.ETSAccessControls.deployTransaction.hash;
      await expectEvent.inTransaction(deployTxn, artifacts.ETSAccessControlsUpgrade, "Upgraded");
      // Upgraded contract has new function upgradeTest()
      assert((await contracts.ETSAccessControls.upgradeTest()) === true);
    });
  });
  
  describe("ETSToken", function () {
    it("is upgradeable", async function () {

      // Upgrade the proxy.
      contracts.ETSToken = await upgrades.upgradeProxy(
        contracts.ETSToken.address,
        factories.ETSTokenUpgrade,
      );
  
      const deployTxn = contracts.ETSToken.deployTransaction.hash;
      await expectEvent.inTransaction(deployTxn, artifacts.ETSTokenUpgrade, "Upgraded");
      // Upgraded contract has new function upgradeTest()
      assert((await contracts.ETSToken.upgradeTest()) === true);
    });
  });

  describe("ETSAuctionHouse", function () {
    it("is upgradeable", async function () {

      // Upgrade the proxy.
      contracts.ETSAuctionHouse = await upgrades.upgradeProxy(
        contracts.ETSAuctionHouse.address,
        factories.ETSAuctionHouseUpgrade,
      );
  
      const deployTxn = contracts.ETSAuctionHouse.deployTransaction.hash;
      await expectEvent.inTransaction(deployTxn, artifacts.ETSAuctionHouseUpgrade, "Upgraded");
      // Upgraded contract has new function upgradeTest()
      assert((await contracts.ETSAuctionHouse.upgradeTest()) === true);
    });
  });
});
