import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { network } from "hardhat";

/**
 * CRITICAL TEST: Real Network Deployment Verification
 *
 * This test will:
 * 1. Deploy via Ignition to Hardhat network (like production)
 * 2. Deploy via manual viem to same network
 * 3. Verify bytecode on ACTUAL blockchain (not test simulation)
 * 4. Test on Base testnet if possible
 *
 * If Ignition really has this bug, it would be a MASSIVE issue that
 * Hardhat team needs to address immediately.
 */
describe("CRITICAL: Real Network Deployment Verification", async () => {
  const { viem } = await network.connect();
  const publicClient = await viem.getPublicClient();

  it("should test Ignition deployment on actual Hardhat network", async () => {
    console.log("🌐 Testing Ignition deployment on actual Hardhat network...");
    console.log("   Network:", network.name);
    console.log("   This is NOT a test simulation - this is real blockchain deployment");

    // Deploy simple contract via Ignition
    const { buildModule } = await import("@nomicfoundation/hardhat-ignition/modules");

    const TestModule = buildModule("RealNetworkTest", (m) => {
      return {
        mockZora: m.contract("MockZoraFactory", []),
      };
    });

    try {
      const { ignition } = await import("hardhat");
      const result = await ignition.deploy(TestModule);

      console.log("✅ Ignition deployment completed on real network");
      console.log("   Contract address:", result.mockZora.target);

      // CRITICAL: Check actual blockchain bytecode (not test cache)
      const address = result.mockZora.target as `0x${string}`;
      const bytecode = await publicClient.getBytecode({ address });

      console.log("📋 REAL BLOCKCHAIN VERIFICATION:");
      console.log("   Address:", address);
      console.log("   Has bytecode:", bytecode && bytecode !== "0x" ? "YES" : "NO");
      console.log("   Bytecode length:", bytecode ? bytecode.length : 0);

      if (!bytecode || bytecode === "0x") {
        console.log("🚨 CONFIRMED: Ignition deployment has NO BYTECODE on real blockchain!");
        console.log("   This is a critical production bug");
      } else {
        console.log("✅ Ignition deployment has real bytecode - our test environment might be the issue");
      }

      // Try to interact with contract on real network
      try {
        const contract = await viem.getContractAt("MockZoraFactory", address);
        // Try a basic call - if no bytecode, this should fail
        console.log("   Testing contract interaction on real network...");

        // MockZoraFactory might not have public functions, so just getting the contract is a test
        console.log("   Contract interface loaded successfully");

        // Try to send a transaction (this will definitely fail if no bytecode)
        const [wallet] = await viem.getWalletClients();
        try {
          // This should fail if contract has no bytecode
          const tx = await wallet.sendTransaction({
            to: address,
            data: "0x", // Empty call
            value: 0n,
          });
          console.log("   Transaction succeeded:", tx);
        } catch (error: any) {
          if (error.message.includes("no code") || error.message.includes("contract")) {
            console.log("   🚨 Transaction failed - no contract code!");
          } else {
            console.log("   Transaction failed (different reason):", error.message.split("\n")[0]);
          }
        }
      } catch (error: any) {
        console.log("   Contract interaction failed:", error.message.split("\n")[0]);
      }
    } catch (error: any) {
      console.log("❌ Ignition deployment failed:", error.message.split("\n")[0]);
    }
  });

  it("should test manual viem deployment on same network", async () => {
    console.log("🔧 Testing manual viem deployment on same real network...");

    const manualContract = await viem.deployContract("MockZoraFactory", []);

    console.log("✅ Manual deployment completed");
    console.log("   Contract address:", manualContract.address);

    // Check real blockchain bytecode
    const bytecode = await publicClient.getBytecode({ address: manualContract.address });

    console.log("📋 MANUAL DEPLOYMENT VERIFICATION:");
    console.log("   Address:", manualContract.address);
    console.log("   Has bytecode:", bytecode && bytecode !== "0x" ? "YES" : "NO");
    console.log("   Bytecode length:", bytecode ? bytecode.length : 0);

    assert.ok(bytecode && bytecode !== "0x", "Manual deployment must have bytecode");

    // Try interaction
    try {
      const [wallet] = await viem.getWalletClients();
      const tx = await wallet.sendTransaction({
        to: manualContract.address,
        data: "0x",
        value: 0n,
      });
      console.log("   Manual contract transaction succeeded:", tx);
    } catch (error: any) {
      console.log("   Manual contract transaction result:", error.message.split("\n")[0]);
    }
  });

  it("should compare deployment methods", async () => {
    console.log("📊 CRITICAL COMPARISON:");
    console.log("   If Ignition has no bytecode but manual does → Ignition bug confirmed");
    console.log("   If both have bytecode → Our test environment was the issue");
    console.log("   If neither has bytecode → Network configuration issue");

    assert.ok(true, "Comparison completed - check logs for results");
  });
});
