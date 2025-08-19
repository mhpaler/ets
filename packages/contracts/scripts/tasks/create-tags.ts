import { task } from "hardhat/config";
import { http, type Address, createPublicClient, createWalletClient, getContract } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { localhost } from "viem/chains";

task(
  "createTags",
  "Create TAGs in the ETS system. Environment-aware: localhost uses contracts, staging/production provides API guidance.",
)
  .addParam("tags", 'Hashtags to create, separated by commas. eg. --tags "#USDC,#Solana"')
  .addOptionalParam("relayer", "Relayer name to use", "ETSRelayer")
  .addOptionalParam("signer", "Signer to use (account0, account1, etc)", "account0")
  .setAction(async (taskArgs, hre) => {
    console.log("====================================");
    console.log("TAG Creation");
    console.log("====================================\n");
    console.log("Network:", hre.network.name);
    console.log("Relayer:", taskArgs.relayer);

    // Parse tags
    const tags = taskArgs.tags.split(",").map((tag: string) => tag.trim());
    console.log("Tags to create:", tags);
    console.log();

    // Environment-specific logic
    if (hre.network.name === "localhost") {
      await createTagsLocal(tags, taskArgs.relayer, taskArgs.signer, hre);
    } else {
      await provideProductionGuidance(tags, hre.network.name);
    }
  });

async function createTagsLocal(tags: string[], relayerName: string, signerName: string, hre: any) {
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
    if (!networkConfig.contracts?.ETSRelayer?.address) {
      console.log("   ❌ ETSRelayer not found in chainConfig");
      console.log("   💡 Deploy contracts first:");
      console.log("      ./scripts/start-core-stack.sh");
      return;
    }
    console.log("   ✅ Contracts deployed");

    // 3. Check relayer registration
    console.log("\n3. Checking relayer registration...");
    const etsAccessControls = getContract({
      address: networkConfig.contracts.ETSAccessControls.address as Address,
      abi: networkConfig.contracts.ETSAccessControls.abi,
      client: publicClient,
    });

    const relayerAddress = (await etsAccessControls.read.getRelayerAddressFromName([relayerName])) as Address;
    const isRelayer = await etsAccessControls.read.isRelayer([relayerAddress]);

    if (!isRelayer) {
      console.log("   ❌ Relayer not properly registered");
      console.log("   💡 Check relayer status:");
      console.log("      hardhat checkRelayer --name", relayerName, "--network localhost");
      return;
    }
    console.log("   ✅ Relayer registered and active");

    // 4. Create TAGs
    console.log("\n4. Creating TAGs...");

    // Check which tags already exist
    const etsToken = getContract({
      address: networkConfig.contracts.ETSToken.address as Address,
      abi: networkConfig.contracts.ETSToken.abi,
      client: publicClient,
    });

    const tagsToCreate = [];
    for (const tag of tags) {
      const coinAddress = (await etsToken.read.computeCoinAddress([tag])) as Address;
      const exists = await etsToken.read.tagExistsByAddress([coinAddress]);

      if (exists) {
        console.log(`   ⚠️  "${tag}" already exists at ${coinAddress}`);
      } else {
        tagsToCreate.push(tag);
        console.log(`   📝 "${tag}" will be created at ${coinAddress}`);
      }
    }

    if (tagsToCreate.length === 0) {
      console.log("\n✅ All tags already exist!");
      return;
    }

    // Execute TAG creation
    console.log(`\n   Creating ${tagsToCreate.length} new tags...`);
    try {
      // Use viem for transaction simulation and execution
      const etsRelayerWithWallet = getContract({
        address: relayerAddress,
        abi: networkConfig.contracts.ETSRelayer.abi,
        client: walletClient,
      });

      console.log("   🔍 Simulating transaction...");
      await etsRelayerWithWallet.simulate.getOrCreateTagIds([tagsToCreate]);
      console.log("   ✅ Simulation successful, executing transaction...");

      const txHash = await etsRelayerWithWallet.write.getOrCreateTagIds([tagsToCreate]);
      console.log("   📤 Transaction sent:", txHash);
      console.log("   ⏳ Waiting for confirmation...");

      const receipt = await publicClient.waitForTransactionReceipt({
        hash: txHash,
        confirmations: 2, // Wait for 2 block confirmations
      });
      console.log("   ✅ Transaction confirmed with 2 block confirmations!");
      console.log("   ⛽ Gas used:", receipt.gasUsed.toString());

      console.log("\n5. Validating TAG creation...");

      for (const tag of tagsToCreate) {
        const coinAddress = (await etsToken.read.computeCoinAddress([tag])) as Address;

        // Check if TAG now exists (this was the bug we fixed)
        const existsByAddress = await etsToken.read.tagExistsByAddress([coinAddress]);
        const existsByString = await etsToken.read.tagExistsByString([tag]);

        if (existsByAddress && existsByString) {
          console.log(`   ✅ "${tag}" created successfully!`);
          console.log(`      Coin address: ${coinAddress}`);
          console.log("      Validation: Address ✅ String ✅");

          // Get TAG data to show full details
          const tagData = await etsToken.read.getTagByAddress([coinAddress]);
          console.log(`      Original input: ${tagData.originalInput}`);
          console.log(`      Display version: ${tagData.displayVersion}`);
          console.log(`      Machine name: ${tagData.machineName}`);
        } else {
          console.log(`   ❌ "${tag}" validation failed!`);
          console.log(`      Coin address: ${coinAddress}`);
          console.log(
            `      Validation: Address ${existsByAddress ? "✅" : "❌"} String ${existsByString ? "✅" : "❌"}`,
          );
          console.log("      This indicates a problem with our contract fixes");
        }
      }

      console.log("\n🎉 On-chain TAG creation completed!");
      console.log("\n📊 Track full pipeline completion:");
      console.log("   • TagCreated events emitted ✅");
      console.log("   • Event processor will detect and create Zora coins");
      console.log("   • The Graph will track correlation between events");
      console.log("   • Check status: Query Graph for tagCoins by address");
      console.log("\n⏰ Expected pipeline completion: 2-5 minutes");
      console.log("💡 For integration testing, use: pnpm test:integration");
    } catch (error: any) {
      console.log("   ❌ Transaction failed:", error.message);

      if (error.message.includes("insufficient funds")) {
        console.log("   💡 Make sure your account has enough ETH");
      } else if (error.message.includes("relayer")) {
        console.log("   💡 Check relayer registration:");
        console.log("      hardhat checkRelayer --name", relayerName, "--network localhost");
      }
    }
  } catch (error: any) {
    console.log("❌ Error:", error.message);
  }
}

async function provideProductionGuidance(tags: string[], networkName: string) {
  console.log("🌐 PRODUCTION/STAGING ENVIRONMENT");
  console.log("===================================\n");

  console.log("For production networks, TAG creation uses the offchain API:\n");

  console.log("🔗 API Endpoint:");
  if (networkName.includes("sepolia") || networkName.includes("staging")) {
    console.log("   POST https://api-staging.ets.xyz/tag-coins");
  } else {
    console.log("   POST https://api.ets.xyz/tag-coins");
  }

  console.log("\n📝 Example request:");
  console.log("   curl -X POST https://api.ets.xyz/tag-coins \\");
  console.log(`     -H 'Content-Type: application/json' \\`);
  console.log("     -d '{");
  console.log(`       "tags": ${JSON.stringify(tags)},`);
  console.log(`       "network": "${networkName}"`);
  console.log("     }'");

  console.log("\n🌐 Alternative - Use the dApp:");
  console.log("   https://app.ets.xyz");

  console.log("\n💡 The API handles:");
  console.log("   • Gas estimation and optimization");
  console.log("   • Zora coin creation and metadata");
  console.log("   • IPFS uploads");
  console.log("   • Transaction management and retries");

  console.log("\n⚠️  For testing on this network, consider:");
  console.log("   • Using the staging API for testing");
  console.log("   • Running locally with: hardhat createTags --network localhost");
}
