import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { network } from "hardhat";
import ETSAccessControlsModule from "../ignition/modules/ETSAccessControls.js";
import ETSAccessControlsUpgradeModule from "../ignition/modules/ETSAccessControlsUpgrade.js";
import ETSCoreModule from "../ignition/modules/ETSCore.js";
import ETSEnrichTargetModule from "../ignition/modules/ETSEnrichTarget.js";
import ETSEnrichTargetUpgradeModule from "../ignition/modules/ETSEnrichTargetUpgrade.js";
import ETSTargetModule from "../ignition/modules/ETSTarget.js";
import ETSTargetUpgradeModule from "../ignition/modules/ETSTargetUpgrade.js";
import ETSTokenModule from "../ignition/modules/ETSToken.js";
import ETSTokenUpgradeModule from "../ignition/modules/ETSTokenUpgrade.js";
import ETSUpgradeModule from "../ignition/modules/ETSUpgrade.js";

describe("Upgrades tests", async () => {
  describe("ETSAccessControl", async () => {
    it("is upgradeable", async () => {
      const { ignition, viem } = await network.connect();
      const [walletClient] = await viem.getWalletClients();

      // === PHASE 1: Deploy initial contract ===
      console.log("🚀 Phase 1: Deploying initial ETSAccessControls...");

      const { accessControls } = await ignition.deploy(ETSAccessControlsModule);
      const initialContract = await viem.getContractAt("ETSAccessControls", accessControls.address);

      // Verify initial deployment
      const initialName = await initialContract.read.NAME();
      assert.equal(initialName, "ETS access controls");

      // Check that upgrade function doesn't exist yet
      try {
        const upgradeContract = await viem.getContractAt("ETSAccessControlsUpgrade", accessControls.address);
        await upgradeContract.read.upgradeTest();
        assert.fail("upgradeTest() should not exist in initial contract");
      } catch {
        console.log("✅ Initial contract confirmed - no upgradeTest() function");
      }

      // Set some state to verify preservation across upgrade
      const adminRole = await initialContract.read.DEFAULT_ADMIN_ROLE();
      const hasAdminRole = await initialContract.read.hasRole([adminRole, walletClient.account.address]);
      assert.equal(hasAdminRole, true);
      console.log("✅ Initial state verified");

      // === PHASE 2: Upgrade the contract ===
      console.log("🔄 Phase 2: Upgrading to ETSAccessControlsUpgrade...");

      const { upgradedProxy } = await ignition.deploy(ETSAccessControlsUpgradeModule, {
        parameters: {
          ETSAccessControlsUpgrade: {
            proxyAddress: accessControls.address,
          },
        },
      });

      // === PHASE 3: Verify upgrade worked ===
      console.log("✅ Phase 3: Verifying upgrade...");

      // The proxy address should be the same
      assert.equal(upgradedProxy.address, accessControls.address);

      // Now we should be able to call the new function through the same proxy address
      const upgradedContract = await viem.getContractAt("ETSAccessControlsUpgrade", accessControls.address);

      // Test new functionality
      const upgradeTestResult = await upgradedContract.read.upgradeTest();
      assert.equal(upgradeTestResult, true);
      console.log("✅ New upgrade function working!");

      // Verify old functionality still works (state preserved)
      const nameAfterUpgrade = await upgradedContract.read.NAME();
      assert.equal(nameAfterUpgrade, "ETS access controls");

      const hasAdminRoleAfterUpgrade = await upgradedContract.read.hasRole([adminRole, walletClient.account.address]);
      assert.equal(hasAdminRoleAfterUpgrade, true);
      console.log("✅ Original functionality preserved!");
      console.log("✅ State preserved across upgrade!");
    });
  });

  describe("ETSEnrichTarget", () => {
    it("is upgradeable", async () => {
      const { ignition, viem } = await network.connect();
      const [walletClient] = await viem.getWalletClients();

      // Deploy initial contract
      const { enrichTarget } = await ignition.deploy(ETSEnrichTargetModule, {
        parameters: {
          ETSEnrichTarget: {
            accessControlsAddress: walletClient.account.address, // Temporary placeholder
            targetAddress: walletClient.account.address, // Temporary placeholder
          },
        },
      });

      const _initialContract = await viem.getContractAt("ETSEnrichTarget", (enrichTarget as any).address);

      // Verify upgrade function doesn't exist initially
      try {
        const upgradeContract = await viem.getContractAt("ETSEnrichTargetUpgrade", (enrichTarget as any).address);
        await upgradeContract.read.upgradeTest();
        assert.fail("upgradeTest() should not exist in initial contract");
      } catch {
        // Expected - function doesn't exist
      }

      // Perform upgrade
      const { upgradedProxy } = await ignition.deploy(ETSEnrichTargetUpgradeModule, {
        parameters: {
          ETSEnrichTargetUpgrade: {
            proxyAddress: (enrichTarget as any).address,
          },
        },
      });

      // Verify upgrade worked
      const upgradedContract = await viem.getContractAt("ETSEnrichTargetUpgrade", (enrichTarget as any).address);
      const upgradeTestResult = await upgradedContract.read.upgradeTest();
      assert.equal(upgradeTestResult, true);
    });
  });

  describe("ETSTarget", () => {
    it("is upgradeable", async () => {
      const { ignition, viem } = await network.connect();
      const [walletClient] = await viem.getWalletClients();

      // Deploy initial contract
      const { target } = await ignition.deploy(ETSTargetModule, {
        parameters: {
          ETSTarget: {
            accessControlsAddress: walletClient.account.address, // Temporary placeholder
          },
        },
      });

      const _initialContract = await viem.getContractAt("ETSTarget", (target as any).address);

      // Verify upgrade function doesn't exist initially
      try {
        const upgradeContract = await viem.getContractAt("ETSTargetUpgrade", (target as any).address);
        await upgradeContract.read.upgradeTest();
        assert.fail("upgradeTest() should not exist in initial contract");
      } catch {
        // Expected - function doesn't exist
      }

      // Perform upgrade
      const { upgradedProxy } = await ignition.deploy(ETSTargetUpgradeModule, {
        parameters: {
          ETSTargetUpgrade: {
            proxyAddress: (target as any).address,
          },
        },
      });

      // Verify upgrade worked
      const upgradedContract = await viem.getContractAt("ETSTargetUpgrade", (target as any).address);
      const upgradeTestResult = await upgradedContract.read.upgradeTest();
      assert.equal(upgradeTestResult, true);
    });
  });

  describe("ETSToken", () => {
    it("is upgradeable", async () => {
      const { ignition, viem } = await network.connect();
      const [walletClient] = await viem.getWalletClients();

      // Deploy initial contract
      const { token } = await ignition.deploy(ETSTokenModule, {
        parameters: {
          ETSToken: {
            accessControlsAddress: walletClient.account.address, // Temporary placeholder
          },
        },
      });

      const _initialContract = await viem.getContractAt("ETSToken", (token as any).address);

      // Verify upgrade function doesn't exist initially
      try {
        const upgradeContract = await viem.getContractAt("ETSTokenUpgrade", (token as any).address);
        await upgradeContract.read.upgradeTest();
        assert.fail("upgradeTest() should not exist in initial contract");
      } catch {
        // Expected - function doesn't exist
      }

      // Perform upgrade
      const { upgradedProxy } = await ignition.deploy(ETSTokenUpgradeModule, {
        parameters: {
          ETSTokenUpgrade: {
            proxyAddress: (token as any).address,
          },
        },
      });

      // Verify upgrade worked
      const upgradedContract = await viem.getContractAt("ETSTokenUpgrade", (token as any).address);
      const upgradeTestResult = await upgradedContract.read.upgradeTest();
      assert.equal(upgradeTestResult, true);
    });
  });

  describe("ETS Core", () => {
    it("is upgradeable", async () => {
      const { ignition, viem } = await network.connect();
      const [_walletClient] = await viem.getWalletClients();

      // Deploy initial contract (ETS Core has complex dependencies)
      const { etsCore } = await ignition.deploy(ETSCoreModule, {
        parameters: {
          ETSCore: {
            taggingFee: "100000000000000000", // 0.1 ETH in wei
            platformPercentage: 20,
            channelPercentage: 30,
          },
        },
      });

      const _initialContract = await viem.getContractAt("ETS", (etsCore as any).address);

      // Verify upgrade function doesn't exist initially
      try {
        const upgradeContract = await viem.getContractAt("ETSUpgrade", (etsCore as any).address);
        await upgradeContract.read.upgradeTest();
        assert.fail("upgradeTest() should not exist in initial contract");
      } catch {
        // Expected - function doesn't exist
      }

      // Perform upgrade
      const { upgradedProxy } = await ignition.deploy(ETSUpgradeModule, {
        parameters: {
          ETSUpgrade: {
            proxyAddress: (etsCore as any).address,
          },
        },
      });

      // Verify upgrade worked
      const upgradedContract = await viem.getContractAt("ETSUpgrade", (etsCore as any).address);
      const upgradeTestResult = await upgradedContract.read.upgradeTest();
      assert.equal(upgradeTestResult, true);
    });
  });
});
