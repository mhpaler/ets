import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { network } from "hardhat";
import { loadIgnitionFixture } from "./fixtures/ignitionFixture.js";

/**
 * SKIPPED: This test reproduces a critical Hardhat Ignition bug where beacon proxy
 * contracts are not actually deployed to the blockchain, despite appearing to work.
 *
 * Bug Details:
 * - Factory/beacon/proxies all return addresses but have ZERO bytecode
 * - Function calls sometimes work (cached/mocked values) but contracts are non-functional
 * - Issue appears to be with constructor-deployed sub-contracts in Ignition
 *
 * See ETSUpgradeableRelayer.test.ts for the working manual deployment version.
 * See HARDHAT-IGNITION-BUG-REPORT.md for detailed bug report.
 *
 * To run this bug reproduction test: change `describe.skip` to `describe`
 */
describe.skip("Relayer Beacon Upgrade tests - IGNITION BUG REPRODUCTION", async () => {
  const { accounts, contracts } = await loadIgnitionFixture();

  describe("ETSRelayer", () => {
    it("is upgradeable via beacon proxy pattern", async () => {
      const { viem } = await network.connect();

      // === SETUP: Use existing relayers from fixture ===
      console.log("🚀 Setting up relayers...");

      // The fixture already creates "ETSRelayer" and "SecondTestRelayer"

      // Get beacon address from the factory
      const beaconAddress = await contracts.ETSRelayerFactory.read.getBeacon();
      console.log(`🔍 IGNITION DEBUG: Beacon address from factory: ${beaconAddress}`);

      // Check if this is the same type of address our manual test produces
      const factoryAddress = contracts.ETSRelayerFactory.address;
      console.log(`🔍 IGNITION DEBUG: Factory address: ${factoryAddress}`);

      // Check factory bytecode
      const publicClientIgnition = await viem.getPublicClient();
      const factoryCode = await publicClientIgnition.getCode({ address: factoryAddress });
      console.log(
        `🔍 IGNITION DEBUG: Factory has bytecode: ${factoryCode ? "YES" : "NO"} (length: ${factoryCode?.length || 0})`,
      );

      // Also try getting implementation directly from factory for comparison
      const implFromFactory = await contracts.ETSRelayerFactory.read.getImplementation();
      console.log(`📋 Implementation from factory: ${implFromFactory}`);

      // === PHASE 1: Verify initial relayer versions ===
      console.log("✅ Phase 1: Checking initial relayer versions...");

      // Use the working relayer instances directly from fixture
      const relayer1v1 = contracts.ETSRelayer;
      const relayer2v1 = contracts.secondRelayer;

      // CRITICAL: Check bytecode in Phase 1 BEFORE any upgrades
      const publicClientPhase1 = await viem.getPublicClient();
      const phase1Proxy1Code = await publicClientPhase1.getCode({ address: relayer1v1.address });
      const phase1Proxy2Code = await publicClientPhase1.getCode({ address: relayer2v1.address });
      console.log(`📋 PHASE 1 - Proxy 1 address: ${relayer1v1.address}`);
      console.log(
        `📋 PHASE 1 - Proxy 1 has bytecode: ${phase1Proxy1Code ? "YES" : "NO"} (length: ${phase1Proxy1Code?.length || 0})`,
      );
      console.log(`📋 PHASE 1 - Proxy 2 address: ${relayer2v1.address}`);
      console.log(
        `📋 PHASE 1 - Proxy 2 has bytecode: ${phase1Proxy2Code ? "YES" : "NO"} (length: ${phase1Proxy2Code?.length || 0})`,
      );

      const version1Initial = await relayer1v1.read.version();
      const version2Initial = await relayer2v1.read.version();

      console.log(version1Initial);

      assert.equal(version1Initial, "0.1.1");
      assert.equal(version2Initial, "0.1.1");
      console.log("✅ Both relayers initially at version 0.1.1");

      // === PHASE 2: Deploy upgrade implementation ===
      console.log("🔄 Phase 2: Deploying upgrade implementation...");

      const upgradeImplementation = await viem.deployContract("ETSRelayerUpgradeTest", []);
      console.log(`✅ ETSRelayerUpgradeTest deployed at: ${upgradeImplementation.address}`);

      // === PHASE 3: Update beacon ===
      console.log("🔧 Phase 3: Updating beacon...");

      const beacon = await viem.getContractAt("ETSRelayerBeacon", beaconAddress, {
        client: { wallet: accounts.ETSAdmin },
      });

      // Get current implementation via factory (we know this works)
      const currentImplementation = await contracts.ETSRelayerFactory.read.getImplementation();
      console.log(`📋 BEFORE: Current implementation via factory: ${currentImplementation}`);
      console.log(`📋 BEFORE: Upgrade implementation address: ${upgradeImplementation.address}`);

      // Update the beacon (should be done by admin/platform) - signer already set in client
      console.log("🔧 Calling beacon.update()...");
      await beacon.write.update([upgradeImplementation.address]);
      console.log("✅ Beacon.update() call completed");

      // Verify beacon implementation updated (using factory method since direct call fails)
      const newImplementation = await contracts.ETSRelayerFactory.read.getImplementation();
      console.log(`📋 AFTER: New implementation via factory: ${newImplementation}`);
      console.log(`📋 AFTER: Expected implementation address: ${upgradeImplementation.address}`);

      if (newImplementation.toLowerCase() === upgradeImplementation.address.toLowerCase()) {
        console.log("✅ Beacon successfully updated to new implementation");
      } else {
        console.log("❌ Beacon update failed - implementation didn't change");
      }

      assert.equal(newImplementation.toLowerCase(), upgradeImplementation.address.toLowerCase());

      // === PHASE 4: Verify all relayers upgraded ===
      console.log("🎉 Phase 4: Verifying all relayers upgraded automatically...");

      // Get relayer instances with new ABI (same addresses, no client config like working Phase 1)
      //const relayer1v2 = await viem.getContractAt("ETSRelayerUpgradeTest", contracts.ETSRelayer.address);
      // const relayer2v2 = await viem.getContractAt("ETSRelayerUpgradeTest", contracts.secondRelayer.address);

      // First test: Re-initialize viem connections to the relayers after beacon upgrade
      console.log("🧪 Re-initializing viem connections to relayers after beacon upgrade...");

      // Get the addresses from the working instances
      const firstRelayerAddress = contracts.ETSRelayer.address;
      const secondRelayerAddress = contracts.secondRelayer.address;

      // CRITICAL TEST: Original fixture instances are bound to old ABI - they should fail
      console.log("🧪 Testing if original fixture instances still work after beacon upgrade...");
      console.log("❌ Expected: Original instances should fail due to ABI mismatch");
      try {
        const originalVersion1 = await relayer1v1.read.version();
        console.log(`❌ Unexpected: Original instance 1 still works: ${originalVersion1}`);
      } catch (error: any) {
        console.log(`✅ Expected: Original instance 1 broken due to ABI mismatch: ${error.message.split("\n")[0]}`);
      }

      // DEBUG: Check what the beacon proxy is actually pointing to
      console.log("🔍 Debugging beacon proxy delegation...");

      // Check if the proxies are properly pointing to the beacon
      const publicClient = await viem.getPublicClient();
      const proxy1Code = await publicClient.getCode({ address: firstRelayerAddress });
      const proxy2Code = await publicClient.getCode({ address: secondRelayerAddress });
      console.log(`📋 Proxy 1 address: ${firstRelayerAddress}`);
      console.log(`📋 Proxy 1 has bytecode: ${proxy1Code ? "YES" : "NO"} (length: ${proxy1Code?.length || 0})`);
      console.log(`📋 Proxy 2 address: ${secondRelayerAddress}`);
      console.log(`📋 Proxy 2 has bytecode: ${proxy2Code ? "YES" : "NO"} (length: ${proxy2Code?.length || 0})`);

      // CRITICAL: Since proxies have no bytecode, let's create a NEW relayer and see if IT has bytecode
      console.log("🚨 CRITICAL DEBUG: Creating a fresh relayer to test proxy deployment...");
      await contracts.ETSRelayerFactory.write.addRelayer(["DebugTestRelayer"], {
        account: accounts.ETSPlatform.account,
      });

      const debugRelayerAddress = await contracts.ETSAccessControls.read.getRelayerAddressFromName([
        "DebugTestRelayer",
      ]);
      const debugRelayerCode = await publicClient.getCode({ address: debugRelayerAddress });
      console.log(`📋 Debug relayer address: ${debugRelayerAddress}`);
      console.log(
        `📋 Debug relayer has bytecode: ${debugRelayerCode ? "YES" : "NO"} (length: ${debugRelayerCode?.length || 0})`,
      );

      // CONFIRMED: Factory.addRelayer is broken - it's not creating actual proxy contracts!
      console.log("🚨 CONFIRMED: Factory.addRelayer is not deploying BeaconProxy contracts!");

      // Debug the beacon itself
      console.log("🔍 Debugging beacon contract...");
      const beaconAddr = await contracts.ETSRelayerFactory.read.getBeacon();
      const beaconCode = await publicClient.getCode({ address: beaconAddr });
      console.log(`📋 Beacon address: ${beaconAddr}`);
      console.log(`📋 Beacon has bytecode: ${beaconCode ? "YES" : "NO"} (length: ${beaconCode?.length || 0})`);

      // Test beacon directly
      const beaconContract = await viem.getContractAt("ETSRelayerBeacon", beaconAddr);
      try {
        const beaconImpl = await beaconContract.read.implementation();
        console.log(`📋 Beacon.implementation() works: ${beaconImpl}`);
      } catch (beaconError: any) {
        console.log(`❌ Beacon.implementation() fails: ${beaconError.message.split("\n")[0]}`);
      }

      // Get beacon address from each proxy using low-level call
      try {
        // For BeaconProxy, the beacon address is stored at a specific storage slot
        // Let's try to get the implementation directly
        const impl1 = await contracts.ETSRelayerFactory.read.getImplementation();
        console.log(`📋 Current implementation from factory: ${impl1}`);
        console.log(`📋 Expected implementation: ${upgradeImplementation.address}`);

        // Verify the implementation is actually deployed and has code
        const implCode = await publicClient.getCode({ address: impl1 });
        console.log(`📋 Implementation has bytecode: ${implCode ? "YES" : "NO"} (length: ${implCode?.length || 0})`);

        // Try calling version() directly on the implementation to see if it works
        console.log("🧪 Testing version() call directly on implementation...");
        const implContract = await viem.getContractAt("ETSRelayerUpgradeTest", impl1);
        try {
          const implVersion = await implContract.read.version();
          console.log(`📋 Implementation version() works: ${implVersion}`);
        } catch (implError: any) {
          console.log(`❌ Implementation version() fails: ${implError.message.split("\n")[0]}`);
        }
      } catch (error: any) {
        console.log(`❌ Error getting implementation info: ${error.message}`);
      }

      // SOLUTION: Create fresh contract instances with the UPGRADED ABI
      console.log("🔧 Creating fresh contract instances with ETSRelayerUpgradeTest ABI...");

      // Re-create the existing relayer instances with the new ABI
      const relayer1v2 = await viem.getContractAt("ETSRelayerUpgradeTest", firstRelayerAddress);
      const relayer2v2 = await viem.getContractAt("ETSRelayerUpgradeTest", secondRelayerAddress);

      // Test the existing relayers with new ABI
      console.log("🧪 Testing existing relayers with upgraded ABI...");
      const version1Upgraded = await relayer1v2.read.version();
      const version2Upgraded = await relayer2v2.read.version();

      console.log(`📋 Existing relayer 1 version (new ABI): ${version1Upgraded}`);
      console.log(`📋 Existing relayer 2 version (new ABI): ${version2Upgraded}`);

      assert.equal(version1Upgraded, "UPGRADE TEST");
      assert.equal(version2Upgraded, "UPGRADE TEST");
      console.log("✅ Existing relayers work with new ABI after beacon upgrade!");

      // Test new function is available
      const newFunc1 = await relayer1v2.read.newFunction();
      const newFunc2 = await relayer2v2.read.newFunction();

      assert.equal(newFunc1, true);
      assert.equal(newFunc2, true);
      console.log("✅ New function available on existing relayers");

      // ADDITIONAL TEST: Create a BRAND NEW relayer after beacon upgrade
      console.log("🎯 Creating a BRAND NEW relayer after beacon upgrade...");
      await contracts.ETSRelayerFactory.write.addRelayer(["TestUpgradedRelayer"], {
        account: accounts.ETSPlatform.account,
      });

      const newRelayerAddress = await contracts.ETSAccessControls.read.getRelayerAddressFromName([
        "TestUpgradedRelayer",
      ]);
      console.log(`📋 New relayer created at: ${newRelayerAddress}`);

      // Test with ETSRelayerUpgradeTest ABI
      const newRelayerInstance = await viem.getContractAt("ETSRelayerUpgradeTest", newRelayerAddress);
      const newRelayerVersion = await newRelayerInstance.read.version();
      const newRelayerFunction = await newRelayerInstance.read.newFunction();

      console.log(`📋 New relayer version: ${newRelayerVersion}`);
      console.log(`📋 New relayer newFunction: ${newRelayerFunction}`);

      assert.equal(newRelayerVersion, "UPGRADE TEST");
      assert.equal(newRelayerFunction, true);
      console.log("✅ Brand new relayers also work perfectly with beacon upgrade!");

      console.log("🎉 Beacon proxy upgrade successful! All relayers upgraded simultaneously.");
    });

    it("beacon is only upgradeable by owner", async () => {
      const { viem } = await network.connect();

      // Get beacon address from the factory
      const beaconAddress = await contracts.ETSRelayerFactory.read.getBeacon();
      const beacon = await viem.getContractAt("ETSRelayerBeacon", beaconAddress, {
        client: { wallet: accounts.ETSAdmin },
      });

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
