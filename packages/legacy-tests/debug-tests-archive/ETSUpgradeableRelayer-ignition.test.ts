import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { network } from "hardhat";
import { parseEther } from "viem";
import ETSRelayerFactoryModule from "../ignition/modules/ETSRelayerFactory.js";

/**
 * Beacon Proxy Upgrade Tests - Ignition Version
 *
 * Tests the beacon proxy upgrade pattern using Hardhat Ignition.
 * With the updated factory that deploys beacon separately, this should work properly.
 */
describe("Beacon Proxy Upgrade tests - Ignition", async () => {
  const { viem, ignition } = await network.connect();
  const publicClient = await viem.getPublicClient();
  const [admin, platform] = await viem.getWalletClients();

  describe("ETSRelayer", () => {
    it("is upgradeable via beacon proxy pattern", async () => {
      // Deploy the complete system using Ignition
      const deployment = await ignition.deploy(ETSRelayerFactoryModule, {
        parameters: {
          ETSAccessControls: {
            platformAddress: platform.account.address,
          },
          ETSCore: {
            taggingFee: parseEther("0.1"),
            platformPercentage: 20,
            relayerPercentage: 30,
          },
        },
      });

      // Verify beacon has bytecode
      const beaconCode = await publicClient.getCode({
        address: deployment.relayerBeacon.address,
      });
      assert.ok(beaconCode && beaconCode.length > 0, "Beacon should have bytecode");

      // Get contracts
      const accessControls = await viem.getContractAt("ETSAccessControls", deployment.accessControls.address);

      const factory = await viem.getContractAt("ETSRelayerFactory", deployment.relayerFactory.address);

      const beacon = await viem.getContractAt("ETSRelayerBeacon", deployment.relayerBeacon.address);

      // Set up roles for factory to create relayers
      const relayerFactoryRole = await accessControls.read.RELAYER_FACTORY_ROLE();
      const relayerAdminRole = await accessControls.read.RELAYER_ADMIN_ROLE();
      const relayerRole = await accessControls.read.RELAYER_ROLE();

      // Critical: Set RELAYER_FACTORY_ROLE as admin of RELAYER_ROLE
      // This allows the factory to grant RELAYER_ROLE to new relayers
      await accessControls.write.setRoleAdmin([relayerRole, relayerFactoryRole], {
        account: platform.account,
      });

      // Grant factory role to the factory contract
      await accessControls.write.grantRole([relayerFactoryRole, factory.address], {
        account: platform.account,
      });

      // Grant relayer admin role to platform (needed to create relayers)
      await accessControls.write.grantRole([relayerAdminRole, platform.account.address], {
        account: platform.account,
      });

      // Create relayers via factory
      await factory.write.addRelayer(["ETSRelayer1"], {
        account: platform.account,
      });

      await factory.write.addRelayer(["ETSRelayer2"], {
        account: platform.account,
      });

      // Get relayer addresses
      const relayer1Address = await accessControls.read.getRelayerAddressFromName(["ETSRelayer1"]);
      const relayer2Address = await accessControls.read.getRelayerAddressFromName(["ETSRelayer2"]);

      // Verify relayers have bytecode
      const relayer1Code = await publicClient.getCode({
        address: relayer1Address as `0x${string}`,
      });
      assert.ok(relayer1Code && relayer1Code.length > 0, "Relayer 1 should have bytecode");

      // Get relayer instances
      const _relayer1 = await viem.getContractAt("ETSRelayer", relayer1Address as `0x${string}`);
      const _relayer2 = await viem.getContractAt("ETSRelayer", relayer2Address as `0x${string}`);

      // Check initial implementation
      const initialImpl = await factory.read.getImplementation();
      assert.equal(initialImpl.toLowerCase(), deployment.relayerImplementation.address.toLowerCase());

      // Deploy upgrade implementation
      const upgradeImpl = await viem.deployContract("ETSRelayerUpgradeTest", []);

      // Perform upgrade
      await beacon.write.update([upgradeImpl.address], {
        account: admin.account,
      });

      // Verify upgrade
      const newImpl = await factory.read.getImplementation();
      assert.equal(newImpl.toLowerCase(), upgradeImpl.address.toLowerCase());

      // Test upgraded functionality
      // Get upgraded relayer instance with new ABI
      const upgradedRelayer1 = await viem.getContractAt("ETSRelayerUpgradeTest", relayer1Address as `0x${string}`);

      // Test new function
      const version = await upgradedRelayer1.read.version();
      assert.equal(version, "UPGRADE TEST", "Should return upgraded version");

      // Verify both relayers are upgraded
      const upgradedRelayer2 = await viem.getContractAt("ETSRelayerUpgradeTest", relayer2Address as `0x${string}`);

      const version2 = await upgradedRelayer2.read.version();
      assert.equal(version2, "UPGRADE TEST", "Second relayer should also be upgraded");
    });
  });
});
