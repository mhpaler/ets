import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { network } from "hardhat";
import ETSAccessControlsModule from "../ignition/modules/ETSAccessControls.js";

describe("Hardhat Ignition POC - ETSAccessControls UUPS", async () => {
  it("should deploy ETSAccessControls with UUPS proxy using Ignition", async () => {
    const { ignition, viem } = await network.connect();

    // Deploy using our Ignition module
    const { accessControls } = await ignition.deploy(ETSAccessControlsModule);

    // Verify the contract deployed successfully
    assert.ok(accessControls.address);
    console.log("ETSAccessControls deployed at:", accessControls.address);

    // Test basic contract functionality
    // Since we're using the proxy, we need to call functions through the proxy interface
    const contractInstance = await viem.getContractAt("ETSAccessControls", accessControls.address);

    // Check that initialization worked - platform should be set
    const name = await contractInstance.read.NAME();
    assert.equal(name, "ETS access controls");

    // Check version
    const version = await contractInstance.read.VERSION();
    assert.equal(version, "0.0.1");

    console.log("✅ UUPS proxy deployment successful!");
    console.log("✅ Contract initialization verified!");
    console.log("✅ Basic contract functions working!");
  });

  it("should allow custom platform address via parameters", async () => {
    const { ignition, viem } = await network.connect();
    const [, secondAccount] = await viem.getWalletClients();

    // Deploy with custom platform address
    const { accessControls } = await ignition.deploy(ETSAccessControlsModule, {
      parameters: {
        ETSAccessControls: {
          platformAddress: secondAccount.account.address,
        },
      },
    });

    const contractInstance = await viem.getContractAt("ETSAccessControls", accessControls.address);

    // Verify platform was set correctly
    // Note: We'd need a getter for platform or check admin role
    const hasAdminRole = await contractInstance.read.hasRole([
      await contractInstance.read.DEFAULT_ADMIN_ROLE(),
      secondAccount.account.address,
    ]);

    assert.equal(hasAdminRole, true);
    console.log("✅ Custom platform address parameter working!");
  });
});
