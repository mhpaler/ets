import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { network } from "hardhat";

/**
 * DEFINITIVE TEST: Hardhat Network Bytecode Verification
 *
 * This test will settle the question once and for all by:
 * 1. Using our existing Ignition fixture (which "works" in tests)
 * 2. Making direct RPC calls to verify actual blockchain state
 * 3. Comparing with manual deployments on same network
 *
 * This isolates whether the issue is:
 * - Test simulation vs real blockchain
 * - Our specific setup vs Ignition itself
 */
describe("DEFINITIVE: Hardhat Network Bytecode Verification", async () => {
  const { viem } = await network.connect();
  const publicClient = await viem.getPublicClient();

  it("should verify if our Ignition fixture contracts exist on actual blockchain", async () => {
    console.log("🔍 DEFINITIVE TEST: Checking if Ignition contracts have real bytecode...");
    console.log("   This tests the actual blockchain state, not test simulation");

    // Load our existing fixture
    const { loadIgnitionFixture } = await import("./fixtures/ignitionFixture.js");
    const { contracts } = await loadIgnitionFixture();

    console.log("✅ Ignition fixture loaded successfully");

    // Get the actual network info
    const chainId = await publicClient.getChainId();
    const blockNumber = await publicClient.getBlockNumber();

    console.log(`📋 Network Info:`);
    console.log(`   Chain ID: ${chainId}`);
    console.log(`   Block Number: ${blockNumber}`);

    // Test multiple contracts to see if it's consistent
    const contractsToTest = [
      { name: "MockZoraFactory", address: contracts.MockZoraFactory.address },
      { name: "ETSAccessControls", address: contracts.ETSAccessControls.address },
      { name: "ETS", address: contracts.ETS.address },
      { name: "ETSToken", address: contracts.ETSToken.address },
      { name: "ETSRelayer", address: contracts.ETSRelayer.address },
    ];

    let contractsWithBytecode = 0;
    let contractsWithoutBytecode = 0;

    for (const { name, address } of contractsToTest) {
      console.log(`\n🔍 Checking ${name}:`);
      console.log(`   Address: ${address}`);

      // Make direct RPC call to get bytecode
      const bytecode = await publicClient.getBytecode({ address: address as `0x${string}` });
      const hasBytecode = bytecode && bytecode !== "0x";

      console.log(`   Has bytecode: ${hasBytecode ? "YES" : "NO"}`);
      console.log(`   Bytecode length: ${bytecode ? bytecode.length : 0}`);

      if (hasBytecode) {
        contractsWithBytecode++;
        console.log(`   ✅ ${name} has real bytecode`);
      } else {
        contractsWithoutBytecode++;
        console.log(`   ❌ ${name} has NO bytecode`);
      }

      // Test if we can make a function call vs send a transaction
      try {
        if (name === "ETS") {
          const fee = await contracts.ETS.read.taggingFee();
          console.log(`   Read call works: taggingFee = ${fee}`);

          // Try to make a state-changing call (this should fail if no bytecode)
          try {
            const [wallet] = await viem.getWalletClients();
            // This is a no-op transaction to test if contract exists
            const tx = await wallet.sendTransaction({
              to: address as `0x${string}`,
              data: "0x", // Empty data
              value: 0n,
            });
            console.log(`   Transaction succeeded: ${tx}`);
          } catch (txError: any) {
            if (
              txError.message.includes("no code") ||
              txError.message.includes("execution reverted") ||
              txError.message.includes("contract")
            ) {
              console.log(`   ❌ Transaction failed (no contract code)`);
            } else {
              console.log(`   Transaction failed (other reason): ${txError.message.split("\n")[0]}`);
            }
          }
        }
      } catch (error: any) {
        console.log(`   Function call failed: ${error.message.split("\n")[0]}`);
      }
    }

    console.log(`\n📊 IGNITION RESULTS SUMMARY:`);
    console.log(`   Contracts with bytecode: ${contractsWithBytecode}`);
    console.log(`   Contracts without bytecode: ${contractsWithoutBytecode}`);
    console.log(`   Total contracts tested: ${contractsToTest.length}`);
  });

  it("should deploy identical contracts manually and compare", async () => {
    console.log("\n🔧 MANUAL DEPLOYMENT COMPARISON:");
    console.log("   Deploying same contracts manually to same network...");

    // Deploy some of the same contracts manually
    const manualMockZora = await viem.deployContract("MockZoraFactory", []);
    const manualAccessControls = await viem.deployContract("ETSAccessControls", []);

    const manualContracts = [
      { name: "MockZoraFactory", address: manualMockZora.address },
      { name: "ETSAccessControls", address: manualAccessControls.address },
    ];

    let manualContractsWithBytecode = 0;

    for (const { name, address } of manualContracts) {
      console.log(`\n🔧 Manual ${name}:`);
      console.log(`   Address: ${address}`);

      const bytecode = await publicClient.getBytecode({ address });
      const hasBytecode = bytecode && bytecode !== "0x";

      console.log(`   Has bytecode: ${hasBytecode ? "YES" : "NO"}`);
      console.log(`   Bytecode length: ${bytecode ? bytecode.length : 0}`);

      if (hasBytecode) {
        manualContractsWithBytecode++;
      }
    }

    console.log(`\n📊 MANUAL DEPLOYMENT RESULTS:`);
    console.log(`   Manual contracts with bytecode: ${manualContractsWithBytecode}/${manualContracts.length}`);

    assert.equal(manualContractsWithBytecode, manualContracts.length, "All manual deployments should have bytecode");
  });

  it("should provide definitive conclusion", async () => {
    console.log("\n🎯 DEFINITIVE CONCLUSION:");
    console.log("   Based on the results above:");
    console.log("   • If Ignition contracts have NO bytecode but manual ones do → Ignition bug confirmed");
    console.log("   • If both have bytecode → Our test environment was creating false positives");
    console.log("   • If neither have bytecode → Network/setup issue");
    console.log("");
    console.log("   This test uses the SAME network and blockchain state for both methods");
    console.log("   So any difference must be due to the deployment method itself");

    assert.ok(true, "Definitive test completed - check results above");
  });
});
