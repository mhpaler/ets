import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { network } from "hardhat";
import ETSAccessControlsModule from "../ignition/modules/ETSAccessControls.js";
import ETSTargetModule from "../ignition/modules/ETSTarget.js";

describe("Hardhat Ignition - Layer 2 Modules (With Dependencies)", async () => {
  it("should deploy ETSTarget with ETSAccessControls dependency", async () => {
    const { ignition, viem } = await network.connect();

    console.log("🚀 Deploying ETSTarget module (with ETSAccessControls dependency)...");

    // Deploy ETSTarget using Ignition - this should automatically deploy ETSAccessControls first
    const { target, accessControls } = (await ignition.deploy(ETSTargetModule)) as any;

    // Verify both contracts deployed
    assert.ok(target.address);
    assert.ok(accessControls.address);
    console.log("ETSTarget deployed at:", target.address);
    console.log("ETSAccessControls deployed at:", accessControls.address);

    // Test basic ETSTarget functionality
    const targetContract = await viem.getContractAt("ETSTarget", target.address);
    const accessControlsContract = await viem.getContractAt("ETSAccessControls", accessControls.address);

    // Verify ETSTarget was initialized with correct ETSAccessControls address
    const targetAccessControls = await targetContract.read.etsAccessControls();
    assert.equal(targetAccessControls, accessControls.address);

    // Verify ETSAccessControls basic functionality
    const accessControlsName = await accessControlsContract.read.NAME();
    assert.equal(accessControlsName, "ETS access controls");

    console.log("✅ ETSTarget module working correctly!");
    console.log("✅ Module dependency resolution working!");
    console.log("✅ Contract initialization verified!");
  });

  it("should allow custom parameters for ETSAccessControls through ETSTarget", async () => {
    const { ignition, viem } = await network.connect();
    const [, secondAccount] = await viem.getWalletClients();

    console.log("🚀 Testing parameter passing through dependency chain...");

    // Deploy ETSTarget with custom platform address for ETSAccessControls
    const { target, accessControls } = (await ignition.deploy(ETSTargetModule, {
      parameters: {
        ETSAccessControls: {
          platformAddress: secondAccount.account.address,
        },
      },
    })) as any;

    // Verify the parameter was passed correctly
    const accessControlsContract = await viem.getContractAt("ETSAccessControls", accessControls.address);
    const hasAdminRole = await accessControlsContract.read.hasRole([
      await accessControlsContract.read.DEFAULT_ADMIN_ROLE(),
      secondAccount.account.address,
    ]);

    assert.equal(hasAdminRole, true);
    console.log("✅ Parameter passing through dependency chain working!");
  });

  it("should demonstrate module reusability", async () => {
    const { ignition } = await network.connect();

    console.log("🚀 Testing module reusability...");

    // Deploy ETSAccessControls standalone
    const { accessControls: standaloneAccessControls } = (await ignition.deploy(ETSAccessControlsModule)) as any;

    // Deploy ETSTarget (which includes ETSAccessControls)
    const { target, accessControls: targetAccessControls } = (await ignition.deploy(ETSTargetModule)) as any;

    // Both should be deployed successfully but as separate instances
    assert.ok(standaloneAccessControls.address);
    assert.ok(targetAccessControls.address);
    assert.ok(target.address);

    // They should be different deployments (Ignition creates separate instances)
    // Note: This behavior depends on Ignition's module isolation
    console.log("✅ Module reusability demonstrated!");
    console.log(`   Standalone ETSAccessControls: ${standaloneAccessControls.address}`);
    console.log(`   ETSTarget's ETSAccessControls: ${targetAccessControls.address}`);
    console.log(`   ETSTarget: ${target.address}`);
  });
});
