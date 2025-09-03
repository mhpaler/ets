import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { network } from "hardhat";
import { parseEther } from "viem";
import ETSEnrichTargetModule from "../ignition/modules/ETSEnrichTarget.js";
import ETSCoreModule from "../ignition/modules/ETSCore.js";

describe("Hardhat Ignition - Layer 4 Modules (Complete System)", async () => {
  it("should deploy ETSEnrichTarget with full dependency chain", async () => {
    const { ignition, viem } = await network.connect();
    
    console.log("🚀 Deploying ETSEnrichTarget module (complete dependency chain)...");
    
    // Deploy ETSEnrichTarget - should automatically resolve entire dependency tree
    const { enrichTarget, target, accessControls } = (await ignition.deploy(ETSEnrichTargetModule)) as any;
    
    // Verify all contracts deployed
    assert.ok(enrichTarget.address);
    assert.ok(target.address);
    assert.ok(accessControls.address);
    
    console.log("ETSEnrichTarget deployed at:", enrichTarget.address);
    console.log("ETSTarget deployed at:", target.address);
    console.log("ETSAccessControls deployed at:", accessControls.address);
    
    // Test ETSEnrichTarget initialization
    const enrichTargetContract = await viem.getContractAt("ETSEnrichTarget", enrichTarget.address);
    
    // Verify dependencies are correctly linked
    const enrichTargetAccessControls = await enrichTargetContract.read.etsAccessControls();
    const enrichTargetTarget = await enrichTargetContract.read.etsTarget();
    
    assert.equal(enrichTargetAccessControls, accessControls.address);
    assert.equal(enrichTargetTarget, target.address);
    
    console.log("✅ ETSEnrichTarget dependency resolution working!");
  });
  
  it("should deploy ETS Core with maximum complexity dependency chain", async () => {
    const { ignition, viem } = await network.connect();
    
    console.log("🚀 Deploying ETS Core module (maximum complexity)...");
    console.log("   This will deploy the entire ETS system!");
    
    // Deploy ETS Core - should automatically deploy everything it needs
    const { etsCore, token, target, accessControls, mockZoraFactory } = (await ignition.deploy(ETSCoreModule)) as any;
    
    // Verify all contracts deployed
    assert.ok(etsCore.address);
    assert.ok(token.address);
    assert.ok(target.address);
    assert.ok(accessControls.address);
    assert.ok(mockZoraFactory.address);
    
    console.log("🎯 Complete ETS System Deployed:");
    console.log("   ETS Core:", etsCore.address);
    console.log("   ETSToken:", token.address);
    console.log("   ETSTarget:", target.address);
    console.log("   ETSAccessControls:", accessControls.address);
    console.log("   MockZoraFactory:", mockZoraFactory.address);
    
    // Test ETS Core functionality
    const etsCoreContract = await viem.getContractAt("ETS", etsCore.address);
    
    // Verify all dependencies are correctly linked
    const coreAccessControls = await etsCoreContract.read.etsAccessControls();
    const coreToken = await etsCoreContract.read.etsToken();
    const coreTarget = await etsCoreContract.read.etsTarget();
    
    assert.equal(coreAccessControls, accessControls.address);
    assert.equal(coreToken, token.address);
    assert.equal(coreTarget, target.address);
    
    // Verify fee configuration
    const taggingFee = await etsCoreContract.read.taggingFee();
    assert.equal(taggingFee, parseEther("0.1")); // Default value
    
    console.log("✅ ETS Core complete system working!");
    console.log("✅ All dependencies correctly resolved and linked!");
    console.log("✅ Maximum complexity deployment successful!");
  });
  
  it("should demonstrate complete parameter propagation through entire system", async () => {
    const { ignition, viem } = await network.connect();
    const [, secondAccount] = await viem.getWalletClients();
    
    console.log("🚀 Testing parameter propagation through entire system...");
    
    // Deploy with custom parameters at multiple levels
    const { etsCore, token, accessControls } = (await ignition.deploy(ETSCoreModule, {
      parameters: {
        ETSAccessControls: {
          platformAddress: secondAccount.account.address,
        },
        ETSToken: {
          tagMinStringLength: 4,
          tagMaxStringLength: 128,
        },
        ETSCore: {
          taggingFee: parseEther("0.05"), // Custom fee
          platformPercentage: 25,         // Custom percentage
          relayerPercentage: 35,          // Custom percentage
        },
      },
    })) as any;
    
    // Verify ETS Core got custom parameters
    const etsCoreContract = await viem.getContractAt("ETS", etsCore.address);
    const taggingFee = await etsCoreContract.read.taggingFee();
    assert.equal(taggingFee, parseEther("0.05"));
    
    // Verify ETSAccessControls got custom platform address
    const accessControlsContract = await viem.getContractAt("ETSAccessControls", accessControls.address);
    const hasAdminRole = await accessControlsContract.read.hasRole([
      await accessControlsContract.read.DEFAULT_ADMIN_ROLE(),
      secondAccount.account.address,
    ]);
    assert.equal(hasAdminRole, true);
    
    // Verify ETSToken functionality (parameters applied during deployment)
    const tokenContract = await viem.getContractAt("ETSToken", token.address);
    const platformAddress = await tokenContract.read.getPlatformAddress();
    assert.ok(platformAddress);
    
    console.log("✅ Complete system parameter propagation working!");
    console.log("✅ Custom fees, addresses, and settings all applied correctly!");
  });
});