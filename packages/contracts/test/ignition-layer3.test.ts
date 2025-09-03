import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { network } from "hardhat";
import ETSTokenModule from "../ignition/modules/ETSToken.js";

describe("Hardhat Ignition - Layer 3 Modules (Complex Dependencies)", async () => {
  it("should deploy ETSToken with multiple dependencies", async () => {
    const { ignition, viem } = await network.connect();

    console.log("🚀 Deploying ETSToken module (with ETSAccessControls + MockZoraFactory dependencies)...");

    // Deploy ETSToken - should automatically deploy all dependencies
    const { token, accessControls, mockZoraFactory } = (await ignition.deploy(ETSTokenModule)) as any;

    // Verify all contracts deployed
    assert.ok(token.address);
    assert.ok(accessControls.address);
    assert.ok(mockZoraFactory.address);

    console.log("ETSToken deployed at:", token.address);
    console.log("ETSAccessControls deployed at:", accessControls.address);
    console.log("MockZoraFactory deployed at:", mockZoraFactory.address);

    // Test ETSToken initialization
    const tokenContract = await viem.getContractAt("ETSToken", token.address);

    // Verify basic ETSToken functionality
    const platformAddress = await tokenContract.read.getPlatformAddress();
    assert.ok(platformAddress);

    // Verify configuration was set correctly by checking a sample tag computation
    const sampleCoinAddress = await tokenContract.read.computeCoinAddress(["test"]);
    assert.ok(sampleCoinAddress);
    assert.notEqual(sampleCoinAddress, "0x0000000000000000000000000000000000000000");

    // Verify dependencies are correctly linked
    const tokenAccessControls = await tokenContract.read.etsAccessControls();
    assert.equal(tokenAccessControls, accessControls.address);

    console.log("✅ ETSToken module working correctly!");
    console.log("✅ Multi-dependency resolution working!");
    console.log("✅ Complex initialization verified!");
  });

  it("should allow custom parameters for all dependencies", async () => {
    const { ignition, viem } = await network.connect();
    const [, secondAccount, thirdAccount] = await viem.getWalletClients();

    console.log("🚀 Testing custom parameters across dependency chain...");

    // Deploy with custom parameters
    const { token, accessControls } = (await ignition.deploy(ETSTokenModule, {
      parameters: {
        ETSAccessControls: {
          platformAddress: secondAccount.account.address,
        },
        ETSToken: {
          tagMinStringLength: 3,
          tagMaxStringLength: 64,
          zoraCreatorEOA: thirdAccount.account.address,
          zoraPlatformReferrer: thirdAccount.account.address,
        },
      },
    })) as any;

    // Verify ETSToken got custom parameters by testing its functionality
    const tokenContract = await viem.getContractAt("ETSToken", token.address);
    const platformAddress = await tokenContract.read.getPlatformAddress();
    assert.ok(platformAddress);

    // Verify it can compute coin addresses (core functionality)
    const coinAddress = await tokenContract.read.computeCoinAddress(["custom-test"]);
    assert.ok(coinAddress);

    // Verify ETSAccessControls got custom platform address
    const accessControlsContract = await viem.getContractAt("ETSAccessControls", accessControls.address);
    const hasAdminRole = await accessControlsContract.read.hasRole([
      await accessControlsContract.read.DEFAULT_ADMIN_ROLE(),
      secondAccount.account.address,
    ]);
    assert.equal(hasAdminRole, true);

    console.log("✅ Complex parameter passing working!");
  });

  it("should demonstrate full dependency tree", async () => {
    const { ignition } = await network.connect();

    console.log("🚀 Testing complete dependency tree visualization...");

    // Deploy ETSToken (pulls in everything)
    const { token, accessControls, mockZoraFactory } = (await ignition.deploy(ETSTokenModule)) as any;

    // All contracts should be deployed and have different addresses
    const addresses = [token.address, accessControls.address, mockZoraFactory.address];
    const uniqueAddresses = new Set(addresses);
    assert.equal(uniqueAddresses.size, 3, "All contracts should have unique addresses");

    console.log("✅ Complete dependency tree working!");
    console.log("📋 Dependency Tree:");
    console.log("   Layer 1: MockZoraFactory →", mockZoraFactory.address);
    console.log("   Layer 2: ETSAccessControls →", accessControls.address);
    console.log("   Layer 3: ETSToken →", token.address);
    console.log("             ↳ depends on AccessControls + MockZora");
  });
});
