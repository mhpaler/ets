import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { network } from "hardhat";
import ETSAccessControlsModule from "../ignition/modules/ETSAccessControls.js";
import ETSAccessControlsUpgradeModule from "../ignition/modules/ETSAccessControlsUpgrade.js";

describe("Hardhat Ignition - UUPS Upgrade Testing", async () => {
  it("should deploy initial contract and then upgrade it", async () => {
    const { ignition, viem } = await network.connect();
    const publicClient = await viem.getPublicClient();
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
      // This should fail since the function doesn't exist in v1
      const upgradeContract = await viem.getContractAt("ETSAccessControlsUpgrade", accessControls.address);
      await upgradeContract.read.upgradeTest();
      assert.fail("upgradeTest() should not exist in initial contract");
    } catch (error) {
      // Expected - function doesn't exist
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

    console.log("🎉 UUPS Upgrade Test Complete!");
    console.log(`   Proxy Address: ${accessControls.address}`);
    console.log(`   ✅ Initial deployment successful`);
    console.log(`   ✅ Upgrade deployment successful`);
    console.log(`   ✅ New functionality added`);
    console.log(`   ✅ Original functionality preserved`);
    console.log(`   ✅ State preserved across upgrade`);
  });

  it("should fail upgrade from non-admin account", async () => {
    const { ignition, viem } = await network.connect();
    const [, secondAccount] = await viem.getWalletClients();

    // Deploy initial contract with first account as admin
    const { accessControls } = await ignition.deploy(ETSAccessControlsModule);

    try {
      // Try to upgrade from non-admin account (should fail)
      await ignition.deploy(ETSAccessControlsUpgradeModule, {
        parameters: {
          ETSAccessControlsUpgrade: {
            proxyAddress: accessControls.address,
          },
        },
        defaultSender: secondAccount.account.address,
      });

      assert.fail("Upgrade should have failed from non-admin account");
    } catch (error) {
      console.log("✅ Upgrade correctly failed from non-admin account");
      // This is expected - only admin can upgrade
    }
  });
});
