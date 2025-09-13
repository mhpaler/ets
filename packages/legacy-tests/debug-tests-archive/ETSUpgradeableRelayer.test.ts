import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { network } from "hardhat";
import { encodeFunctionData } from "viem";

/**
 * Beacon Proxy Upgrade Tests
 *
 * Tests the beacon proxy upgrade pattern using manual viem deployment.
 * This approach bypasses Hardhat Ignition due to a critical bug where
 * beacon proxy contracts are not actually deployed to the blockchain.
 *
 * See ETSUpgradeableRelayer.ignition-bug.test.ts for bug reproduction.
 */
describe("Beacon Proxy Upgrade tests", async () => {
  const { viem } = await network.connect();

  describe("ETSRelayer", () => {
    it("is upgradeable via beacon proxy pattern", async () => {
      // Get wallet clients
      const walletClients = await viem.getWalletClients();
      const admin = walletClients[0];
      const platform = walletClients[1];
      const publicClient = await viem.getPublicClient();

      // === Deploy core contracts ===
      console.log("📦 Deploying core contracts...");

      // Deploy ETSAccessControls as upgradeable proxy
      const accessControlsImpl = await viem.deployContract("ETSAccessControls", []);

      const initializeCalldata = encodeFunctionData({
        abi: [
          {
            inputs: [{ internalType: "address", name: "_platformAddress", type: "address" }],
            name: "initialize",
            outputs: [],
            stateMutability: "nonpayable",
            type: "function",
          },
        ],
        functionName: "initialize",
        args: [platform.account.address],
      });

      const accessControlsProxy = await viem.deployContract("ERC1967Proxy", [
        accessControlsImpl.address,
        initializeCalldata,
      ]);

      const accessControls = { address: accessControlsProxy.address };

      // Verify proxy deployment
      const accessControlsCode = await publicClient.getCode({ address: accessControls.address });
      assert.ok(accessControlsCode && accessControlsCode.length > 0, "AccessControls proxy should have bytecode");

      // Deploy minimal core contracts (simplified for testing)
      const etsToken = await viem.deployContract("ETSToken", []);
      const etsTarget = await viem.deployContract("ETSTarget", []);
      const ets = await viem.deployContract("ETS", []);

      console.log("✅ Core contracts deployed");

      // === Deploy relayer factory and beacon ===
      console.log("📦 Deploying relayer factory...");

      const relayerImpl = await viem.deployContract("ETSRelayer", []);
      const factory = await viem.deployContract("ETSRelayerFactory", [
        relayerImpl.address,
        accessControls.address,
        ets.address,
        etsToken.address,
        etsTarget.address,
      ]);

      // Verify beacon deployment
      const beaconAddress = (await factory.read.getBeacon()) as `0x${string}`;
      const beaconCode = await publicClient.getCode({ address: beaconAddress });
      assert.ok(beaconCode && beaconCode.length > 0, "Beacon should have bytecode");

      const beacon = await viem.getContractAt("ETSRelayerBeacon", beaconAddress);
      const initialImpl = (await beacon.read.implementation()) as `0x${string}`;
      assert.equal(
        initialImpl.toLowerCase(),
        relayerImpl.address.toLowerCase(),
        "Beacon should point to relayer implementation",
      );

      console.log("✅ Factory and beacon deployed correctly");

      // === Setup permissions and create relayer ===
      console.log("📦 Setting up permissions...");

      const factoryContract = await viem.getContractAt("ETSRelayerFactory", factory.address);
      const accessControlsContract = await viem.getContractAt("ETSAccessControls", accessControls.address);

      // Get role constants
      const relayerAdminRole = await accessControlsContract.read.RELAYER_ADMIN_ROLE();
      const relayerFactoryRole = await accessControlsContract.read.RELAYER_FACTORY_ROLE();
      const relayerRole = await accessControlsContract.read.RELAYER_ROLE();

      // Set up role hierarchy (following Ignition fixture pattern)
      await accessControlsContract.write.setRoleAdmin([relayerFactoryRole, relayerAdminRole], {
        account: platform.account,
      });
      await accessControlsContract.write.setRoleAdmin([relayerRole, relayerFactoryRole], {
        account: platform.account,
      });

      // Grant roles
      await accessControlsContract.write.grantRole([relayerAdminRole, platform.account.address], {
        account: platform.account,
      });
      await accessControlsContract.write.grantRole([relayerFactoryRole, factory.address], {
        account: platform.account,
      });

      // Create and test relayer
      await factoryContract.write.addRelayer(["TestRelayer"], {
        account: platform.account,
      });

      const relayerAddress = (await accessControlsContract.read.getRelayerAddressFromName([
        "TestRelayer",
      ])) as `0x${string}`;
      const relayerCode = await publicClient.getCode({ address: relayerAddress });
      assert.ok(relayerCode && relayerCode.length > 0, "Relayer should have bytecode");

      const relayer = await viem.getContractAt("ETSRelayer", relayerAddress);
      const version = await relayer.read.version();
      assert.equal(version, "0.1.1", "Initial relayer version should be 0.1.1");

      console.log("✅ Relayer created and tested successfully");

      // === Test beacon upgrade ===
      console.log("📦 Testing beacon upgrade...");

      // Deploy upgrade implementation
      const upgradeImpl = await viem.deployContract("ETSRelayerUpgradeTest", []);
      const upgradeImplCode = await publicClient.getCode({ address: upgradeImpl.address });
      assert.ok(upgradeImplCode && upgradeImplCode.length > 0, "Upgrade implementation should have bytecode");

      // Update beacon (admin account has ownership)
      const beaconContract = await viem.getContractAt("ETSRelayerBeacon", beaconAddress as `0x${string}`, {
        client: { wallet: admin },
      });

      await beaconContract.write.update([upgradeImpl.address]);

      // Verify beacon upgrade
      const newImpl = (await factoryContract.read.getImplementation()) as `0x${string}`;
      assert.equal(
        newImpl.toLowerCase(),
        upgradeImpl.address.toLowerCase(),
        "Beacon should point to upgrade implementation",
      );

      // Test upgraded relayer functionality
      const upgradedRelayer = await viem.getContractAt("ETSRelayerUpgradeTest", relayerAddress as `0x${string}`);
      const upgradedVersion = await upgradedRelayer.read.version();
      const newFunction = await upgradedRelayer.read.newFunction();

      assert.equal(upgradedVersion, "UPGRADE TEST", "Upgraded version should be 'UPGRADE TEST'");
      assert.equal(newFunction, true, "New function should return true");

      console.log("🎉 Beacon proxy upgrade completed successfully!");
    });
  });
});
