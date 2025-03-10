const { expectEvent } = require("@openzeppelin/test-helpers");
import { assert } from "chai";
import { upgrades } from "hardhat";
import { getArtifacts, getFactories, setup } from "./setup";
import type { Artifacts, Contracts, Factories } from "./setup";

// Define interfaces for the upgraded contracts with the new methods
interface ETSAccessControlsUpgraded {
  upgradeTest(): Promise<boolean>;
}

interface ETSEnrichTargetUpgraded {
  upgradeTest(): Promise<boolean>;
}

interface ETSTargetUpgraded {
  upgradeTest(): Promise<boolean>;
}

interface ETSTokenUpgraded {
  upgradeTest(): Promise<boolean>;
}

interface ETSUpgraded {
  upgradeTest(): Promise<boolean>;
}

describe("Upgrades tests", () => {
  let contracts: Contracts;
  let artifacts: Artifacts;
  let factories: Factories;

  beforeEach("Setup test", async () => {
    artifacts = await getArtifacts();
    factories = await getFactories();
    const result = await setup();
    ({ contracts } = result);
  });

  describe("ETSAccessControl", async () => {
    it("is upgradeable", async () => {
      // Upgrade the proxy.
      const upgradedContract = await upgrades.upgradeProxy(
        await contracts.ETSAccessControls.getAddress(),
        factories.ETSAccessControlsUpgrade,
      );

      // Replace the contract in our contracts object
      contracts.ETSAccessControls = upgradedContract as any;

      const upgradeTxn = (upgradedContract as any).deployTransaction.hash;
      await expectEvent.inTransaction(upgradeTxn, artifacts.ETSAccessControlsUpgrade, "Upgraded");
      // Upgraded contract has new function upgradeTest()
      assert((await (upgradedContract as unknown as ETSAccessControlsUpgraded).upgradeTest()) === true);
    });
  });

  describe("ETSEnrichTarget", () => {
    it("is upgradeable", async () => {
      // Upgrade the proxy.
      const upgradedContract = await upgrades.upgradeProxy(
        await contracts.ETSEnrichTarget.getAddress(),
        factories.ETSEnrichTargetUpgrade,
      );

      // Replace the contract in our contracts object
      contracts.ETSEnrichTarget = upgradedContract as any;

      const upgradeTxn = (upgradedContract as any).deployTransaction.hash;
      await expectEvent.inTransaction(upgradeTxn, artifacts.ETSEnrichTargetUpgrade, "Upgraded");
      // Upgraded contract has new function upgradeTest()
      assert((await (upgradedContract as unknown as ETSEnrichTargetUpgraded).upgradeTest()) === true);
    });
  });

  describe("ETSTarget", () => {
    it("is upgradeable", async () => {
      // Upgrade the proxy.
      const upgradedContract = await upgrades.upgradeProxy(
        await contracts.ETSTarget.getAddress(),
        factories.ETSTargetUpgrade,
      );

      // Replace the contract in our contracts object
      contracts.ETSTarget = upgradedContract as any;

      const upgradeTxn = (upgradedContract as any).deployTransaction.hash;
      await expectEvent.inTransaction(upgradeTxn, artifacts.ETSTargetUpgrade, "Upgraded");
      // Upgraded contract has new function upgradeTest()
      assert((await (upgradedContract as unknown as ETSTargetUpgraded).upgradeTest()) === true);
    });
  });

  describe("ETSToken", () => {
    it("is upgradeable", async () => {
      // Upgrade the proxy.
      const upgradedContract = await upgrades.upgradeProxy(
        await contracts.ETSToken.getAddress(),
        factories.ETSTokenUpgrade,
      );

      // Replace the contract in our contracts object
      contracts.ETSToken = upgradedContract as any;

      const upgradeTxn = (upgradedContract as any).deployTransaction.hash;
      await expectEvent.inTransaction(upgradeTxn, artifacts.ETSTokenUpgrade, "Upgraded");
      // Upgraded contract has new function upgradeTest()
      assert((await (upgradedContract as unknown as ETSTokenUpgraded).upgradeTest()) === true);
    });
  });

  describe("ETS", () => {
    it("is upgradeable", async () => {
      // Upgrade the proxy.
      const upgradedContract = await upgrades.upgradeProxy(await contracts.ETS.getAddress(), factories.ETSUpgrade);

      // Replace the contract in our contracts object
      contracts.ETS = upgradedContract as any;

      const upgradeTxn = (upgradedContract as any).deployTransaction.hash;
      await expectEvent.inTransaction(upgradeTxn, artifacts.ETSUpgrade, "Upgraded");
      // Upgraded contract has new function upgradeTest()
      assert((await (upgradedContract as unknown as ETSUpgraded).upgradeTest()) === true);
    });
  });

  //  describe("ETSAuctionHouse", function () {
  //    it("is upgradeable", async function () {
  //      // Upgrade the proxy.
  //      contracts.ETSAuctionHouse = await upgrades.upgradeProxy(
  //        await contracts.ETSAuctionHouse.getAddress(),
  //        factories.ETSAuctionHouseUpgrade,
  //      );
  //
  //      const upgradeTxn = contracts.ETSAuctionHouse.deployTransaction.hash;
  //      await expectEvent.inTransaction(upgradeTxn, artifacts.ETSAuctionHouseUpgrade, "Upgraded");
  //      // Upgraded contract has new function upgradeTest()
  //      assert((await contracts.ETSAuctionHouse.upgradeTest()) === true);
  //    });
  //  });
});
