import { task } from "hardhat/config";
import { http, type Address, createPublicClient, createWalletClient, getContract, isAddress } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { localhost } from "viem/chains";

task(
  "transferRelayer",
  'Transfer relayer ownership. eg: hardhat transferRelayer --relayer "MyRelayer" --to "0x..." --signer account0 --network localhost'
)
  .addParam("relayer", "Relayer name to transfer")
  .addParam("to", "New owner address")
  .addOptionalParam("signer", "Current owner signer (account0, account1, etc)", "account0")
  .setAction(async (taskArgs, hre) => {
    console.log("====================================");
    console.log("Transfer Relayer Ownership");
    console.log("====================================\n");
    console.log("Network:", hre.network.name);
    console.log("Relayer:", taskArgs.relayer);
    console.log("New owner:", taskArgs.to);
    console.log("Current owner signer:", taskArgs.signer);
    console.log();

    // Validate new owner address
    if (!isAddress(taskArgs.to)) {
      console.log("❌ Invalid new owner address");
      console.log("💡 Provide a valid Ethereum address");
      return;
    }

    // Environment-specific logic
    if (hre.network.name === "localhost") {
      await transferRelayerLocal(taskArgs.relayer, taskArgs.to, taskArgs.signer, hre);
    } else {
      await provideProductionGuidance(taskArgs.relayer, taskArgs.to, hre.network.name);
    }
  });

async function transferRelayerLocal(relayerName: string, newOwner: Address, signerName: string, hre: any) {
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

    console.log("Current owner:", account.address);
    const balance = await publicClient.getBalance({ address: account.address });
    console.log("Current owner balance:", (Number(balance) / 1e18).toFixed(4), "ETH\n");

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
      const isRelayer = await etsAccessControls.read.isRelayer([relayerAddress]);

      if (!isRelayer) {
        console.log("   ❌ Relayer not properly registered");
        console.log("   💡 Check relayer status:");
        console.log("      hardhat checkRelayer --name", relayerName, "--network localhost");
        return;
      }
      console.log("   ✅ Relayer is registered");
      console.log("   📍 Relayer address:", relayerAddress);

      // Check ownership
      const etsRelayer = getContract({
        address: relayerAddress,
        abi: networkConfig.contracts.ETSRelayer.abi,
        client: publicClient,
      });

      const currentOwner = (await etsRelayer.read.owner()) as Address;
      console.log("   👤 Current owner:", currentOwner);

      if (currentOwner.toLowerCase() !== account.address.toLowerCase()) {
        console.log("   ❌ Signer is not the current owner of this relayer");
        console.log("   💡 Only the current owner can transfer the relayer");
        return;
      }
      console.log("   ✅ Signer is the current owner");

      // Check if relayer is paused (required for transfer)
      const isPaused = await etsRelayer.read.paused();
      if (!isPaused) {
        console.log("   ❌ Relayer must be paused before transfer");
        console.log("   💡 Pause the relayer first:");
        console.log("      hardhat togglePauseRelayerByOwner --relayer", relayerName, "--signer", signerName, "--network localhost");
        return;
      }
      console.log("   ✅ Relayer is paused (required for transfer)");

    } catch (error: any) {
      console.log("   ❌ Failed to check relayer:", error.message);
      return;
    }

    // 4. Check new owner constraints
    console.log("\n4. Checking new owner constraints...");

    // Check if new owner already owns a relayer (unless they're a relayer admin)
    const newOwnerIsAdmin = await etsAccessControls.read.isRelayerAdmin([newOwner]);
    
    if (!newOwnerIsAdmin) {
      const newOwnerOwnsRelayer = await etsAccessControls.read.isRelayerByOwner([newOwner]);
      if (newOwnerOwnsRelayer) {
        console.log("   ❌ New owner already owns a relayer");
        console.log("   💡 Each account can only own one relayer (unless they're a relayer admin)");
        return;
      }
    }
    console.log("   ✅ New owner can receive the relayer");

    // Check new owner balance (they'll need gas for future operations)
    const newOwnerBalance = await publicClient.getBalance({ address: newOwner });
    console.log(`   💰 New owner balance: ${(Number(newOwnerBalance) / 1e18).toFixed(4)} ETH`);

    if (Number(newOwnerBalance) < 1e15) { // Less than 0.001 ETH
      console.log("   ⚠️  New owner has very low balance - they may need ETH for future operations");
    }

    // 5. Execute transfer
    console.log("\n5. Executing relayer ownership transfer...");

    try {
      const relayerAddress = (await etsAccessControls.read.getRelayerAddressFromName([relayerName])) as Address;

      const etsRelayerWithWallet = getContract({
        address: relayerAddress,
        abi: networkConfig.contracts.ETSRelayer.abi,
        client: walletClient,
      });

      // Simulate transaction first
      console.log("   🔍 Simulating transaction...");
      await etsRelayerWithWallet.simulate.changeOwner([newOwner]);
      console.log("   ✅ Simulation successful, executing transaction...");

      const txHash = await etsRelayerWithWallet.write.changeOwner([newOwner]);
      console.log("   📤 Transaction sent:", txHash);
      console.log("   ⏳ Waiting for confirmation...");

      const receipt = await publicClient.waitForTransactionReceipt({
        hash: txHash,
        confirmations: 2,
      });
      console.log("   ✅ Transaction confirmed with 2 block confirmations!");
      console.log("   ⛽ Gas used:", receipt.gasUsed.toString());

      // 6. Verify transfer
      console.log("\n6. Verifying ownership transfer...");

      const newOwnerFromContract = (await etsRelayerWithWallet.read.owner()) as Address;
      
      if (newOwnerFromContract.toLowerCase() === newOwner.toLowerCase()) {
        console.log("   ✅ Ownership transfer successful!");
        console.log("   👤 New owner:", newOwnerFromContract);

        // Update access controls tracking
        const oldOwnerOwnsRelayer = await etsAccessControls.read.isRelayerByOwner([account.address]);
        const newOwnerOwnsRelayer = await etsAccessControls.read.isRelayerByOwner([newOwner]);

        console.log("   📊 Ownership tracking updated:");
        console.log(`      Old owner (${account.address}): ${oldOwnerOwnsRelayer ? "Still owns relayer" : "No longer owns relayer"}`);
        console.log(`      New owner (${newOwner}): ${newOwnerOwnsRelayer ? "Now owns relayer" : "ERROR: Not recognized as owner"}`);

      } else {
        console.log("   ❌ Ownership transfer verification failed");
        console.log("   Expected:", newOwner);
        console.log("   Actual:", newOwnerFromContract);
      }

      console.log("\n🎉 Relayer ownership transfer completed!");
      console.log("\n📋 Transfer Summary:");
      console.log(`   Relayer: ${relayerName}`);
      console.log(`   Old owner: ${account.address}`);
      console.log(`   New owner: ${newOwner}`);
      console.log(`   Transaction: ${txHash}`);
      
      console.log("\n💡 Next steps for new owner:");
      console.log("   • Relayer remains paused after transfer");
      console.log("   • New owner can unpause when ready:");
      console.log(`     hardhat togglePauseRelayerByOwner --relayer "${relayerName}" --signer <new_owner_account> --network localhost`);
      console.log("   • New owner can now manage the relayer operations");

    } catch (error: any) {
      console.log("   ❌ Transaction failed:", error.message);

      if (error.message.includes("insufficient funds")) {
        console.log("   💡 Make sure your account has enough ETH for gas fees");
      } else if (error.message.includes("not paused")) {
        console.log("   💡 Relayer must be paused before transfer");
      } else if (error.message.includes("owner")) {
        console.log("   💡 Only the current owner can transfer the relayer");
      }
    }

  } catch (error: any) {
    console.log("❌ Error:", error.message);
  }
}

async function provideProductionGuidance(relayerName: string, newOwner: Address, networkName: string) {
  console.log("🌐 PRODUCTION/STAGING ENVIRONMENT");
  console.log("===================================\n");

  console.log("For production networks, relayer transfer requires careful coordination:\n");

  console.log("⚠️  Important Considerations:");
  console.log("   • Relayer transfers are irreversible");
  console.log("   • Current owner loses all control over the relayer");
  console.log("   • New owner inherits all responsibilities and revenue");
  console.log("   • Relayer must be paused before transfer");

  console.log("\n📋 Manual Transfer Process:");
  console.log("1. Coordinate with new owner (verify address is correct)");
  console.log("2. Pause relayer operations");
  console.log("3. Execute transfer transaction");
  console.log("4. Verify transfer completion");
  console.log("5. New owner can resume operations");

  console.log("\n💡 API Alternative:");
  if (networkName.includes("sepolia") || networkName.includes("staging")) {
    console.log("   Contact support via: https://api-staging.ets.xyz/support");
  } else {
    console.log("   Contact support via: https://api.ets.xyz/support");
  }

  console.log("\n🌐 Web Interface:");
  console.log("   Use the dApp: https://app.ets.xyz");

  console.log("\n⚠️  For testing on this network, consider:");
  console.log("   • Using test accounts for practice transfers");
  console.log("   • Running locally with: hardhat transferRelayer --network localhost");
  console.log("   • Double-checking all addresses before executing");
}