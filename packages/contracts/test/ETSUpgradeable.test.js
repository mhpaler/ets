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

  describe.only("ETSAccessControl", async function () {
    it("is upgradeable", async function () {
      // Upgrade the proxy.
      contracts.ETSAccessControls = await upgrades.upgradeProxy(
        await contracts.ETSAccessControls.getAddress(),
        factories.ETSAccessControlsUpgrade,
      );

      const upgradeTxn = await contracts.ETSAccessControls.deployTransaction.hash;
      await expectEvent.inTransaction(upgradeTxn, artifacts.ETSAccessControlsUpgrade, "Upgraded");
      // Upgraded contract has new function upgradeTest()
      assert((await contracts.ETSAccessControls.upgradeTest()) === true);
    });
  });

  describe("ETSEnrichTarget", function () {
    it("is upgradeable", async function () {
      // Upgrade the proxy.
      contracts.ETSEnrichTarget = await upgrades.upgradeProxy(
        await contracts.ETSEnrichTarget.getAddress(),
        factories.ETSEnrichTargetUpgrade,
      );

      const upgradeTxn = contracts.ETSEnrichTarget.deployTransaction.hash;
      await expectEvent.inTransaction(upgradeTxn, artifacts.ETSEnrichTargetUpgrade, "Upgraded");
      // Upgraded contract has new function upgradeTest()
      assert((await contracts.ETSEnrichTarget.upgradeTest()) === true);
    });
  });

  describe("ETSTarget", function () {
    it("is upgradeable", async function () {
      // Upgrade the proxy.
      contracts.ETSTarget = await upgrades.upgradeProxy(await contracts.ETSTarget.getAddress(), factories.ETSTargetUpgrade);

      const upgradeTxn = contracts.ETSTarget.deployTransaction.hash;
      await expectEvent.inTransaction(upgradeTxn, artifacts.ETSTargetUpgrade, "Upgraded");
      // Upgraded contract has new function upgradeTest()
      assert((await contracts.ETSTarget.upgradeTest()) === true);
    });
  });

  describe("ETSToken", function () {
    it("is upgradeable", async function () {
      // Upgrade the proxy.
      contracts.ETSToken = await upgrades.upgradeProxy(await contracts.ETSToken.getAddress(), factories.ETSTokenUpgrade);

      const upgradeTxn = contracts.ETSToken.deployTransaction.hash;
      await expectEvent.inTransaction(upgradeTxn, artifacts.ETSTokenUpgrade, "Upgraded");
      // Upgraded contract has new function upgradeTest()
      assert((await contracts.ETSToken.upgradeTest()) === true);
    });
  });

  describe("ETS", function () {
    it("is upgradeable", async function () {
      // Upgrade the proxy.
      contracts.ETS = await upgrades.upgradeProxy(await contracts.ETS.getAddress(), factories.ETSUpgrade);

      const upgradeTxn = contracts.ETS.deployTransaction.hash;
      await expectEvent.inTransaction(upgradeTxn, artifacts.ETSUpgrade, "Upgraded");
      // Upgraded contract has new function upgradeTest()
      assert((await contracts.ETS.upgradeTest()) === true);
    });
  });

  describe.only("ETSAuctionHouse", function () {
    it("is upgradeable", async function () {
      // Upgrade the proxy.
      contracts.ETSAuctionHouse = await upgrades.upgradeProxy(
        await contracts.ETSAuctionHouse.getAddress(),
        factories.ETSAuctionHouseUpgrade,
      );

      const upgradeTxn = contracts.ETSAuctionHouse.deployTransaction.hash;
      await expectEvent.inTransaction(upgradeTxn, artifacts.ETSAuctionHouseUpgrade, "Upgraded");
      // Upgraded contract has new function upgradeTest()
      assert((await contracts.ETSAuctionHouse.upgradeTest()) === true);
    });
  });
});
