import { describe, it } from "node:test";
import { expect } from "chai";
import hre from "hardhat";
import type { PublicClient } from "viem";

describe("Ignition Bytecode Diagnosis", async () => {
  const { viem, ignition } = await hre.network.connect();
  const publicClient = await viem.getPublicClient();

  describe("ETSAccessControls Deployment Analysis", () => {
    it("Should deploy ETSAccessControls with ACTUAL bytecode using Ignition", async () => {
      console.log("\n=== STARTING IGNITION DEPLOYMENT ===");

      // Import the module
      const ETSAccessControlsModule = await import("../ignition/modules/ETSAccessControls.js");

      // Deploy using Ignition
      const result = await ignition.deploy(ETSAccessControlsModule.default, {
        parameters: {
          ETSAccessControls: {
            platformAddress: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
          },
        },
      });

      console.log("\n=== IGNITION DEPLOYMENT RESULT ===");
      console.log("Keys in result:", Object.keys(result));
      console.log("AccessControls proxy address:", result.accessControls?.address);
      console.log("Implementation address:", result.implementation?.address);

      // Check bytecode for BOTH proxy and implementation
      console.log("\n=== BYTECODE VERIFICATION ===");

      // Check implementation bytecode
      if (result.implementation?.address) {
        const implCode = await publicClient.getCode({
          address: result.implementation.address as `0x${string}`,
        });
        console.log(`Implementation bytecode: ${implCode ? "YES" : "NO"} (${implCode?.length || 0} bytes)`);

        // This MUST have bytecode
        expect(implCode).to.not.be.undefined;
        expect(implCode!.length).to.be.greaterThan(0);
      }

      // Check proxy bytecode
      if (result.accessControls?.address) {
        const proxyCode = await publicClient.getCode({
          address: result.accessControls.address as `0x${string}`,
        });
        console.log(`Proxy bytecode: ${proxyCode ? "YES" : "NO"} (${proxyCode?.length || 0} bytes)`);

        // This MUST have bytecode
        expect(proxyCode).to.not.be.undefined;
        expect(proxyCode!.length).to.be.greaterThan(0);
      }

      // Try to interact with the contract
      console.log("\n=== INTERACTION TEST ===");
      try {
        const accessControls = await viem.getContractAt(
          "ETSAccessControls",
          result.accessControls.address as `0x${string}`,
        );

        const version = await accessControls.read.version();
        console.log("Contract version:", version);

        const isAdmin = await accessControls.read.isPlatformAdmin(["0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"]);
        console.log("Is platform admin:", isAdmin);
      } catch (error) {
        console.error("Interaction failed:", error);
      }
    });

    it("Should compare with direct viem deployment", async () => {
      console.log("\n=== MANUAL VIEM DEPLOYMENT ===");

      // Deploy implementation directly
      const implementation = await viem.deployContract("ETSAccessControls", []);
      console.log("Implementation deployed at:", implementation.address);

      // Check bytecode
      const implCode = await publicClient.getCode({
        address: implementation.address,
      });
      console.log(`Implementation bytecode: ${implCode ? "YES" : "NO"} (${implCode?.length || 0} bytes)`);

      // Deploy proxy directly
      const initData = implementation.write.initialize.encode(["0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"]);

      const proxy = await viem.deployContract("ERC1967Proxy", [implementation.address, initData]);
      console.log("Proxy deployed at:", proxy.address);

      // Check proxy bytecode
      const proxyCode = await publicClient.getCode({
        address: proxy.address,
      });
      console.log(`Proxy bytecode: ${proxyCode ? "YES" : "NO"} (${proxyCode?.length || 0} bytes)`);

      // Both MUST have bytecode
      expect(implCode).to.not.be.undefined;
      expect(implCode!.length).to.be.greaterThan(0);
      expect(proxyCode).to.not.be.undefined;
      expect(proxyCode!.length).to.be.greaterThan(0);

      // Test interaction
      const accessControls = await viem.getContractAt("ETSAccessControls", proxy.address);

      const version = await accessControls.read.version();
      console.log("Contract version:", version);

      const isAdmin = await accessControls.read.isPlatformAdmin(["0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"]);
      console.log("Is platform admin:", isAdmin);
      expect(isAdmin).to.be.true;
    });
  });

  describe("Simple Contract Test", () => {
    it("Should deploy a simple non-proxy contract with bytecode", async () => {
      console.log("\n=== SIMPLE CONTRACT TEST ===");

      // Create a simple module inline
      const { buildModule } = await import("@nomicfoundation/hardhat-ignition/modules");

      const SimpleModule = buildModule("SimpleModule", (m) => {
        const weth = m.contract("WETH", []);
        return { weth };
      });

      // Deploy
      const result = await ignition.deploy(SimpleModule);
      console.log("WETH deployed at:", result.weth.address);

      // Check bytecode
      const wethCode = await publicClient.getCode({
        address: result.weth.address as `0x${string}`,
      });
      console.log(`WETH bytecode: ${wethCode ? "YES" : "NO"} (${wethCode?.length || 0} bytes)`);

      // This MUST have bytecode
      expect(wethCode).to.not.be.undefined;
      expect(wethCode!.length).to.be.greaterThan(0);

      // Test interaction
      const weth = await viem.getContractAt("WETH", result.weth.address as `0x${string}`);
      const name = await weth.read.name();
      console.log("WETH name:", name);
      expect(name).to.equal("Wrapped Ether");
    });
  });
});
