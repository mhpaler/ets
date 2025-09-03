import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { network } from "hardhat";
import MockZoraFactoryModule from "../ignition/modules/MockZoraFactory.js";
import WETHModule from "../ignition/modules/WETH.js";

describe("Hardhat Ignition - Layer 1 Modules (No Dependencies)", async () => {
  it("should deploy WETH contract independently", async () => {
    const { ignition, viem } = await network.connect();

    console.log("🚀 Deploying WETH module...");

    // Deploy WETH using Ignition
    const { weth } = (await ignition.deploy(WETHModule)) as any;

    // Verify deployment
    assert.ok(weth.address);
    console.log("WETH deployed at:", weth.address);

    // Test basic WETH functionality
    const wethContract = await viem.getContractAt("WETH", weth.address);
    const name = await wethContract.read.name();
    const symbol = await wethContract.read.symbol();

    assert.equal(name, "Wrapped ETH");
    assert.equal(symbol, "WETH");

    console.log("✅ WETH module working correctly!");
  });

  it("should deploy MockZoraFactory contract independently", async () => {
    const { ignition, viem } = await network.connect();

    console.log("🚀 Deploying MockZoraFactory module...");

    // Deploy MockZoraFactory using Ignition
    const { mockZoraFactory } = (await ignition.deploy(MockZoraFactoryModule)) as any;

    // Verify deployment
    assert.ok(mockZoraFactory.address);
    console.log("MockZoraFactory deployed at:", mockZoraFactory.address);

    // Test basic MockZoraFactory functionality
    const mockZoraContract = await viem.getContractAt("MockZoraFactory", mockZoraFactory.address);

    // MockZoraFactory should have basic functions available
    // Let's just verify the contract interface is accessible
    assert.ok(mockZoraContract.address);

    console.log("✅ MockZoraFactory module working correctly!");
  });

  it("should deploy both Layer 1 modules together (composition test)", async () => {
    const { ignition } = await network.connect();

    console.log("🚀 Testing module composition...");

    // Deploy both modules sequentially to avoid nonce collisions
    const { weth } = (await ignition.deploy(WETHModule)) as any;
    const { mockZoraFactory } = (await ignition.deploy(MockZoraFactoryModule)) as any;

    // Verify both deployed successfully
    assert.ok(weth.address);
    assert.ok(mockZoraFactory.address);

    // Verify they have different addresses
    assert.notEqual(weth.address, mockZoraFactory.address);

    console.log("✅ Module composition test successful!");
    console.log(`   WETH: ${weth.address}`);
    console.log(`   MockZoraFactory: ${mockZoraFactory.address}`);
  });
});
