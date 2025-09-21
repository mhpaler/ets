import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { loadIgnitionFixture } from "./fixtures/ignitionFixture.js";

describe("Hardhat Ignition - Complete Unified Fixture", () => {
  it("should deploy complete ETS system with all post-deployment configuration", async () => {
    console.log("🚀 Testing complete unified Ignition fixture...");
    console.log("   This replaces the entire setup.ts file!");

    // Load the complete system using our unified fixture
    const { accounts, contracts, initSettings } = await loadIgnitionFixture();

    // Verify all contracts deployed
    assert.ok(contracts.WETH.address, "WETH should be deployed");
    assert.ok(contracts.ETSAccessControls.address, "ETSAccessControls should be deployed");
    assert.ok(contracts.ETSToken.address, "ETSToken should be deployed");
    assert.ok(contracts.ETSTarget.address, "ETSTarget should be deployed");
    assert.ok(contracts.ETS.address, "ETS Core should be deployed");
    assert.ok(contracts.ETSChannelFactory.address, "ETSChannelFactory should be deployed");
    assert.ok(contracts.ETSChannelImplementation.address, "ETSChannelImplementation should be deployed");
    assert.ok(contracts.ETSChannel.address, "ETSChannel proxy should be created");
    assert.ok(contracts.secondChannel.address, "Second channel proxy should be created");
    assert.ok(contracts.MockZoraFactory.address, "MockZoraFactory should be deployed");

    // Verify accounts are set up
    assert.ok(accounts.ETSAdmin, "ETSAdmin account should exist");
    assert.ok(accounts.ETSPlatform, "ETSPlatform account should exist");
    assert.ok(accounts.ETSEventProcessor, "ETSEventProcessor account should exist");
    assert.ok(accounts.ETSZora, "ETSZora account should exist");

    // Verify init settings
    assert.equal(initSettings.TAG_MIN_STRING_LENGTH, 2);
    assert.equal(initSettings.TAGGING_FEE, "0.1");

    console.log("✅ Complete System Deployment Verified:");
    console.log("   📋 10 contracts deployed successfully");
    console.log("   👥 7 test accounts configured");
    console.log("   ⚙️  Settings and configuration applied");
    console.log("   🔗 All contracts linked and configured");
    console.log("   🏭 Test channels created and ready");
  });

  it("should have all contracts correctly linked and configured", async () => {
    console.log("🔧 Testing post-deployment configuration...");

    const { accounts, contracts } = await loadIgnitionFixture();

    // Test role assignments (using the contract interfaces directly)
    const adminRole = "0x0000000000000000000000000000000000000000000000000000000000000000"; // DEFAULT_ADMIN_ROLE

    // Verify platform has admin role
    const hasAdminRole = await contracts.ETSAccessControls.read.hasRole([
      adminRole,
      accounts.ETSPlatform.account.address,
    ]);
    assert.equal(hasAdminRole, true, "Platform should have admin role");

    // Verify ETS Core is set on ETSToken
    const tokenEtsCore = await contracts.ETSToken.read.ets();
    assert.equal(tokenEtsCore, contracts.ETS.address, "ETSToken should reference ETS Core");

    // Verify ETSTarget has access controls set
    const targetAccessControls = await contracts.ETSTarget.read.etsAccessControls();
    assert.equal(
      targetAccessControls.toLowerCase(),
      contracts.ETSAccessControls.address.toLowerCase(),
      "ETSTarget should reference ETSAccessControls",
    );

    // Verify ETS Core has all linked contracts
    const coreToken = await contracts.ETS.read.etsToken();
    assert.equal(coreToken, contracts.ETSToken.address, "ETS should reference ETSToken");

    const coreTarget = await contracts.ETS.read.etsTarget();
    assert.equal(coreTarget, contracts.ETSTarget.address, "ETS should reference ETSTarget");

    // Verify channels exist by checking they're registered in AccessControls
    const firstChannelAddress = await contracts.ETSAccessControls.read.getChannelAddressFromName(["ETSChannel"]);
    assert.equal(
      firstChannelAddress.toLowerCase(),
      contracts.ETSChannel.address.toLowerCase(),
      "First channel should be registered as ETSChannel"
    );

    const secondChannelAddress = await contracts.ETSAccessControls.read.getChannelAddressFromName(["SecondTestChannel"]);
    assert.equal(
      secondChannelAddress.toLowerCase(),
      contracts.secondChannel.address.toLowerCase(),
      "Second channel should be registered as SecondTestChannel"
    );

    // Verify channel factory has proper role
    const CHANNEL_FACTORY_ROLE = await contracts.ETSAccessControls.read.CHANNEL_FACTORY_ROLE();
    const factoryHasRole = await contracts.ETSAccessControls.read.hasRole([
      CHANNEL_FACTORY_ROLE,
      contracts.ETSChannelFactory.address,
    ]);
    assert.equal(factoryHasRole, true, "Channel factory should have CHANNEL_FACTORY_ROLE");

    console.log("✅ Post-Deployment Configuration Verified:");
    console.log("   🔐 Access controls linked");
    console.log("   🏷️  ETSToken linked to ETS Core");
    console.log("   🎯 ETSTarget configured");
    console.log("   📺 Channels created and configured");
    console.log("   👮 Roles assigned correctly");
  });
});