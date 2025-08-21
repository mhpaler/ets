import { task } from "hardhat/config";
import { http, type Address, createPublicClient, createWalletClient, getContract } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { localhost } from "viem/chains";

task(
  "togglePauseRelayerByOwner",
  'Toggle pause state of a relayer (owner only). eg: hardhat togglePauseRelayerByOwner --relayer "MyRelayer" --signer account0 --network localhost'
)
  .addParam("relayer", "Relayer name to toggle pause state")
  .addOptionalParam("signer", "Relayer owner signer (account0, account1, etc)", "account0")
  .setAction(async (taskArgs, hre) => {
    console.log("====================================");
    console.log("Toggle Relayer Pause State");
    console.log("====================================\n");
    console.log("Network:", hre.network.name);
    console.log("Relayer:", taskArgs.relayer);
    console.log("Owner signer:", taskArgs.signer);
    console.log();

    // Environment-specific logic
    if (hre.network.name === "localhost") {
      await togglePauseRelayerLocal(taskArgs.relayer, taskArgs.signer, hre);
    } else {
      await provideProductionGuidance(taskArgs.relayer, hre.network.name);
    }
  });

async function togglePauseRelayerLocal(relayerName: string, signerName: string, hre: any) {
  console.log("🏠 LOCAL ENVIRONMENT DETECTED");
  console.log("=====================================\n");

  try {
    // Load network configuration
    const networkConfig = require(`../../src/chainConfig/${hre.network.name}.json`);

    // Create viem clients
    const chain = {
      ...localhost,
      id: 31337, // hardhat default chain ID
    };
    const rpcUrl = "http://127.0.0.1:8545";
    const publicClient = createPublicClient({
      chain,
      transport: http(rpcUrl),
    });

    // Get hardhat accounts as viem wallet clients
    const defaultPrivateKeys = [
      "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", // account0
      "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d", // account1
      "0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a", // account2
    ];

    const signerIndex = Number.parseInt(signerName.replace("account", ""));
    if (signerIndex < 0 || signerIndex >= defaultPrivateKeys.length) {
      console.log("❌ Invalid signer name. Use account0, account1, or account2");
      return;
    }

    const account = privateKeyToAccount(defaultPrivateKeys[signerIndex] as `0x${string}`);
    const walletClient = createWalletClient({
      account,
      chain,
      transport: http(rpcUrl),
    });

    console.log("Using signer:", account.address);
    const balance = await publicClient.getBalance({ address: account.address });
    console.log("Signer balance:", (Number(balance) / 1e18).toFixed(4), "ETH\n");

    // 1. Check network connectivity
    console.log("1. Checking network connectivity...");
    try {
      const blockNumber = await publicClient.getBlockNumber();
      console.log("   ✅ Network accessible, block:", blockNumber.toString());
    } catch (_error) {
      console.log("   ❌ Cannot connect to localhost network");
      console.log("   💡 Make sure hardhat node is running:");
      console.log("      ./scripts/start-core-stack.sh");
      return;
    }

    // 2. Check contract deployment
    console.log("\n2. Checking contract deployment...");
    if (!networkConfig.contracts?.ETSAccessControls?.address) {
      console.log("   ❌ Contracts not found in chainConfig");
      console.log("   💡 Deploy contracts first:");
      console.log("      ./scripts/start-core-stack.sh");
      return;
    }
    console.log("   ✅ Contracts deployed");

    // 3. Check relayer registration and ownership
    console.log("\n3. Checking relayer registration and ownership...");
    const etsAccessControls = getContract({
      address: networkConfig.contracts.ETSAccessControls.address as Address,
      abi: networkConfig.contracts.ETSAccessControls.abi,
      client: publicClient,
    });

    try {
      const relayerAddress = (await etsAccessControls.read.getRelayerAddressFromName([relayerName])) as Address;
      
      // Check if relayer exists by name (this works even if paused)
      const existsByName = await etsAccessControls.read.isRelayerByName([relayerName]);
      if (!existsByName) {
        console.log("   ❌ Relayer does not exist");
        console.log("   💡 Create relayer first:");
        console.log("      hardhat addRelayer --name", relayerName, "--network localhost");
        return;
      }
      
      console.log("   ✅ Relayer exists");
      console.log("   📍 Relayer address:", relayerAddress);
      
      // Note: isRelayer() returns false for paused relayers, but we can still toggle their pause state
      const isRelayer = await etsAccessControls.read.isRelayer([relayerAddress]);
      console.log("   📊 Active status (isRelayer):", isRelayer);

      // Get relayer contract instance
      const etsRelayer = getContract({
        address: relayerAddress,
        abi: networkConfig.contracts.ETSRelayer.abi,
        client: publicClient,
      });

      // Check ownership and admin permissions
      const currentOwner = (await etsRelayer.read.owner()) as Address;
      const isRelayerAdmin = await etsAccessControls.read.isRelayerAdmin([account.address]);

      console.log("   👤 Relayer owner:", currentOwner);
      console.log("   👤 Current signer:", account.address);
      console.log("   🔑 Is relayer admin:", isRelayerAdmin);

      const canPause = 
        currentOwner.toLowerCase() === account.address.toLowerCase() || isRelayerAdmin;

      if (!canPause) {
        console.log("   ❌ Signer cannot pause/unpause this relayer");
        console.log("   💡 Only the relayer owner or relayer admin can toggle pause state");
        return;
      }
      console.log("   ✅ Signer has permission to toggle pause state");

      // Check current pause state
      const currentPauseState = await etsRelayer.read.paused();
      const isActive = await etsAccessControls.read.isRelayerAndNotPaused([relayerAddress]);
      
      console.log("   ⏸️  Current pause state:", currentPauseState ? "PAUSED" : "ACTIVE");
      console.log("   ✅ Is active (registered + not paused):", isActive);

    } catch (error: any) {
      console.log("   ❌ Failed to check relayer:", error.message);
      return;
    }

    // 4. Execute pause toggle
    console.log("\n4. Toggling relayer pause state...");

    try {
      const relayerAddress = (await etsAccessControls.read.getRelayerAddressFromName([relayerName])) as Address;

      const etsRelayerWithWallet = getContract({
        address: relayerAddress,
        abi: networkConfig.contracts.ETSRelayer.abi,
        client: walletClient,
      });

      // Get current state to determine which action to take
      const currentPauseState = await etsRelayerWithWallet.read.paused();
      const action = currentPauseState ? "unpause" : "pause";
      
      console.log(`   🎯 Action: ${action.toUpperCase()} relayer`);

      // Simulate transaction first
      console.log("   🔍 Simulating transaction...");
      if (currentPauseState) {
        await etsRelayerWithWallet.simulate.unpause();
      } else {
        await etsRelayerWithWallet.simulate.pause();
      }
      console.log("   ✅ Simulation successful, executing transaction...");

      // Execute the appropriate function
      const txHash = currentPauseState 
        ? await etsRelayerWithWallet.write.unpause()
        : await etsRelayerWithWallet.write.pause();

      console.log("   📤 Transaction sent:", txHash);
      console.log("   ⏳ Waiting for confirmation...");

      const receipt = await publicClient.waitForTransactionReceipt({
        hash: txHash,
        confirmations: 2,
      });
      console.log("   ✅ Transaction confirmed with 2 block confirmations!");
      console.log("   ⛽ Gas used:", receipt.gasUsed.toString());

      // 5. Verify state change
      console.log("\n5. Verifying pause state change...");

      const newPauseState = await etsRelayerWithWallet.read.paused();
      const newIsActive = await etsAccessControls.read.isRelayerAndNotPaused([relayerAddress]);
      
      if (newPauseState !== currentPauseState) {
        console.log("   ✅ Pause state changed successfully!");
        console.log(`   ⏸️  New pause state: ${newPauseState ? "PAUSED" : "ACTIVE"}`);
        console.log("   ✅ Is active (registered + not paused):", newIsActive);

        if (newPauseState) {
          console.log("\n   ⚠️  Relayer is now PAUSED:");
          console.log("      • Cannot process new tagging operations");
          console.log("      • Cannot create new tags");
          console.log("      • Owner can still manage the relayer");
        } else {
          console.log("\n   🚀 Relayer is now ACTIVE:");
          console.log("      • Can process tagging operations");
          console.log("      • Can create new tags");
          console.log("      • Fully operational for users");
        }

      } else {
        console.log("   ❌ Pause state verification failed");
        console.log("   Expected change from:", currentPauseState);
        console.log("   Actual state:", newPauseState);
      }

      console.log("\n🎉 Relayer pause toggle completed!");
      console.log("\n📋 Operation Summary:");
      console.log(`   Relayer: ${relayerName}`);
      console.log(`   Action: ${action}`);
      console.log(`   Operator: ${account.address}`);
      console.log(`   Transaction: ${txHash}`);
      console.log(`   Final state: ${newPauseState ? "PAUSED" : "ACTIVE"}`);

    } catch (error: any) {
      console.log("   ❌ Transaction failed:", error.message);

      if (error.message.includes("insufficient funds")) {
        console.log("   💡 Make sure your account has enough ETH for gas fees");
      } else if (error.message.includes("owner") || error.message.includes("admin")) {
        console.log("   💡 Only the relayer owner or admin can toggle pause state");
      } else if (error.message.includes("paused")) {
        console.log("   💡 Check current pause state and permissions");
      }
    }

  } catch (error: any) {
    console.log("❌ Error:", error.message);
  }
}

async function provideProductionGuidance(relayerName: string, networkName: string) {
  console.log("🌐 PRODUCTION/STAGING ENVIRONMENT");
  console.log("===================================\n");

  console.log("For production networks, relayer pause management requires careful consideration:\n");

  console.log("⚠️  Important Considerations:");
  console.log("   • Pausing a relayer stops all user operations");
  console.log("   • Active tagging records remain but no new ones can be created");
  console.log("   • Only pause for maintenance or emergencies");
  console.log("   • Users will receive errors until relayer is unpaused");

  console.log("\n🔧 Maintenance Windows:");
  console.log("   • Announce maintenance in advance");
  console.log("   • Pause during low-usage periods");
  console.log("   • Monitor for completion of in-flight transactions");
  console.log("   • Resume as quickly as possible");

  console.log("\n💡 API Alternative:");
  if (networkName.includes("sepolia") || networkName.includes("staging")) {
    console.log("   Manage via: https://api-staging.ets.xyz/relayers");
  } else {
    console.log("   Manage via: https://api.ets.xyz/relayers");
  }

  console.log("\n🌐 Web Interface:");
  console.log("   Use the dApp: https://app.ets.xyz/relayers");

  console.log("\n📊 Before pausing, consider:");
  console.log("   • Current user activity levels");
  console.log("   • Pending transactions");
  console.log("   • Scheduled maintenance windows");
  console.log("   • Communication to users");

  console.log("\n⚠️  For testing on this network, consider:");
  console.log("   • Using test relayers for practice");
  console.log("   • Running locally with: hardhat togglePauseRelayerByOwner --network localhost");
  console.log("   • Monitoring impact on test applications");
}