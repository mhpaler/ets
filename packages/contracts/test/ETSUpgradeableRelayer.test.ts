import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { network } from "hardhat";
import { loadIgnitionFixture } from "./fixtures/ignitionFixture.js";

describe("Relayer Beacon Upgrade tests", async () => {
  const { accounts, contracts } = await loadIgnitionFixture();

  describe("ETSRelayer", () => {
    it("is upgradeable via beacon proxy pattern", async () => {
      const { viem } = await network.connect();

      // === SETUP: Use existing relayers from fixture ===
      console.log("🚀 Setting up relayers...");

      // The fixture already creates "ETSRelayer" and "SecondTestRelayer"
      // Get their addresses
      const relayer1Address = await contracts.ETSAccessControls.read.getRelayerAddressFromName(["ETSRelayer"]);
      const relayer2Address = await contracts.ETSAccessControls.read.getRelayerAddressFromName(["SecondTestRelayer"]);

      // Get beacon address from the factory
      const beaconAddress = await contracts.ETSRelayerFactory.read.getBeacon();

      // === PHASE 1: Verify initial relayer versions ===
      console.log("✅ Phase 1: Checking initial relayer versions...");

      const relayer1v1 = await viem.getContractAt("ETSRelayer", relayer1Address);
      const relayer2v1 = await viem.getContractAt("ETSRelayer", relayer2Address);

      const version1Initial = await relayer1v1.read.version();
      const version2Initial = await relayer2v1.read.version();

      assert.equal(version1Initial, "0.1.1");
      assert.equal(version2Initial, "0.1.1");
      console.log("✅ Both relayers initially at version 0.1.1");

      // === PHASE 2: Deploy upgrade implementation ===
      console.log("🔄 Phase 2: Deploying upgrade implementation...");

      const upgradeImplementation = await viem.deployContract("ETSRelayerUpgradeTest", []);
      console.log("✅ ETSRelayerUpgradeTest deployed");

      // === PHASE 3: Update beacon ===
      console.log("🔧 Phase 3: Updating beacon...");

      const beacon = await viem.getContractAt("ETSRelayerBeacon", beaconAddress);

      // Update the beacon (should be done by admin/platform)
      await beacon.write.update([upgradeImplementation.address], { account: accounts.ETSAdmin.account });

      // Verify beacon implementation updated
      const newImplementation = await beacon.read.implementation();
      assert.equal(newImplementation, upgradeImplementation.address);
      console.log("✅ Beacon successfully updated to new implementation");

      // === PHASE 4: Verify all relayers upgraded ===
      console.log("🎉 Phase 4: Verifying all relayers upgraded automatically...");

      // Get relayer instances with new ABI
      const relayer1v2 = await viem.getContractAt("ETSRelayerUpgradeTest", relayer1Address);
      const relayer2v2 = await viem.getContractAt("ETSRelayerUpgradeTest", relayer2Address);

      // Check versions (should be upgraded)
      const version1Upgraded = await relayer1v2.read.version();
      const version2Upgraded = await relayer2v2.read.version();

      assert.equal(version1Upgraded, "UPGRADE TEST");
      assert.equal(version2Upgraded, "UPGRADE TEST");
      console.log("✅ Both relayers automatically upgraded to 'UPGRADE TEST'");

      // Check new function is available
      const newFunc1 = await relayer1v2.read.newFunction();
      const newFunc2 = await relayer2v2.read.newFunction();

      assert.equal(newFunc1, true);
      assert.equal(newFunc2, true);
      console.log("✅ New function available on both relayers");

      console.log("🎉 Beacon proxy upgrade successful! All relayers upgraded simultaneously.");
    });

    it("beacon is only upgradeable by owner", async () => {
      const { viem } = await network.connect();

      // Get beacon address from the factory
      const beaconAddress = await contracts.ETSRelayerFactory.read.getBeacon();
      const beacon = await viem.getContractAt("ETSRelayerBeacon", beaconAddress);

      // Deploy upgrade implementation
      const upgradeImplementation = await viem.deployContract("ETSRelayerUpgradeTest", []);

      // Try to update beacon with non-owner account (should fail)
      try {
        await beacon.write.update([upgradeImplementation.address], { account: accounts.RandomTwo.account });
        assert.fail("Expected transaction to revert with 'Ownable: caller is not the owner'");
      } catch (error: any) {
        assert.ok(error.message.includes("Ownable: caller is not the owner"), "Should revert with ownership error");
      }

      console.log("✅ Beacon correctly protected - only owner can upgrade");
    });
  });
});
