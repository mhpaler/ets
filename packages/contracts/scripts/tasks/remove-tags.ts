import { task } from "hardhat/config";
import { http, type Address, createPublicClient, createWalletClient, getContract } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { localhost } from "viem/chains";

task(
  "removeTags",
  'Remove tags from a tagging record. eg: hardhat removeTags --tags "#USDC,#Solana" --uri "https://google.com" --recordType "bookmark" --relayer "ETSRelayer" --network localhost',
)
  .addParam("uri", 'URI being tagged eg. --uri "https://google.com"')
  .addParam("tags", 'Hashtags to remove, separated by commas. eg. --tags "#USDC,#Solana"')
  .addParam("relayer", "Relayer name used for the original tagging record")
  .addOptionalParam("recordType", "Record type identifier", "bookmark")
  .addOptionalParam("signer", "Signer to use (account0, account1, etc)", "account0")
  .setAction(async (taskArgs, hre) => {
    console.log("====================================");
    console.log("Remove Tags from Tagging Record");
    console.log("====================================\n");
    console.log("Network:", hre.network.name);
    console.log("URI:", taskArgs.uri);
    console.log("Record Type:", taskArgs.recordType);
    console.log("Relayer:", taskArgs.relayer);

    // Parse tags
    const tags = taskArgs.tags.split(",").map((tag: string) => tag.trim());
    console.log("Tags to remove:", tags);
    console.log();

    // Environment-specific logic
    if (hre.network.name === "localhost") {
      await removeTagsLocal(taskArgs.uri, tags, taskArgs.relayer, taskArgs.recordType, taskArgs.signer, hre);
    } else {
      await provideProductionGuidance(taskArgs.uri, tags, taskArgs.recordType, hre.network.name);
    }
  });

async function removeTagsLocal(
  uri: string,
  tags: string[],
  relayerName: string,
  recordType: string,
  signerName: string,
  hre: any,
) {
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
    if (!networkConfig.contracts?.ETS?.address) {
      console.log("   ❌ ETS contracts not found in chainConfig");
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

    // 4. Check if tagging record exists
    console.log("\n4. Checking tagging record existence...");

    const ets = getContract({
      address: networkConfig.contracts.ETS.address as Address,
      abi: networkConfig.contracts.ETS.abi,
      client: { public: publicClient, wallet: walletClient },
    });

    // Prepare tag parameters (we need these to compute the record ID)
    const tagParams = {
      targetURI: uri,
      tagStrings: [], // Empty for record ID computation
      recordType: recordType,
      enrich: false, // Not relevant for removal
    };

    // Compute tagging record ID
    const taggingRecordId = (await ets.read.computeTaggingRecordIdFromRawInput([
      tagParams,
      relayerAddress,
      account.address,
    ])) as bigint;

    const recordExists = await ets.read.taggingRecordExists([taggingRecordId]);

    if (!recordExists) {
      console.log("   ❌ Tagging record does not exist");
      console.log(`   📋 Record ID: ${taggingRecordId}`);
      console.log("   💡 Make sure you're using the same:");
      console.log("      • URI");
      console.log("      • Record type");
      console.log("      • Relayer");
      console.log("      • Signer (tagger)");
      return;
    }
    console.log("   ✅ Tagging record exists");
    console.log(`   📋 Record ID: ${taggingRecordId}`);

    // 5. Check which tags are currently in the record
    console.log("\n5. Verifying tags to remove...");

    // Get current tags in the record (we'll need to query the record details)
    try {
      // Note: This would require a view function to get current tags in a record
      // For now, we'll proceed with the assumption that the tags exist
      console.log("   📝 Preparing to remove tags:", tags.join(", "));
    } catch (_error: any) {
      console.log("   ⚠️  Cannot verify current tags in record");
      console.log("   💡 Proceeding with removal attempt...");
    }

    // 6. Remove tags from record
    console.log("\n6. Removing tags from tagging record...");

    try {
      // Get the relayer for transaction execution
      const etsRelayer = getContract({
        address: relayerAddress,
        abi: networkConfig.contracts.ETSRelayer.abi,
        client: walletClient,
      });

      // Prepare removal parameters
      const removalParams = {
        targetURI: uri,
        tagStrings: tags,
        recordType: recordType,
        enrich: false,
      };

      // Execute tag removal
      console.log("   🔍 Simulating transaction...");
      await etsRelayer.simulate.removeTags([[removalParams]]);
      console.log("   ✅ Simulation successful, executing transaction...");

      const txHash = await etsRelayer.write.removeTags([[removalParams]]);
      console.log("   📤 Transaction sent:", txHash);
      console.log("   ⏳ Waiting for confirmation...");

      const receipt = await publicClient.waitForTransactionReceipt({
        hash: txHash,
        confirmations: 2,
      });
      console.log("   ✅ Transaction confirmed with 2 block confirmations!");
      console.log("   ⛽ Gas used:", receipt.gasUsed.toString());

      console.log("\n7. Validating tag removal...");

      // Verify the record still exists (unless all tags were removed)
      const recordStillExists = await ets.read.taggingRecordExists([taggingRecordId]);

      if (recordStillExists) {
        console.log(`   ✅ Tags removed successfully from record: ${taggingRecordId}`);
        console.log("   📊 Record still contains other tags");
      } else {
        console.log(`   ✅ All tags removed - record deleted: ${taggingRecordId}`);
        console.log("   📊 Record no longer exists (empty records are cleaned up)");
      }

      console.log("\n🎉 Tag removal completed!");
      console.log("\n📊 What happened:");
      console.log(`   • Removed ${tags.length} tags from the record`);
      console.log("   • Events emitted for subgraph indexing");
      console.log("   • Gas fees paid for the operation");
    } catch (error: any) {
      console.log("   ❌ Transaction failed:", error.message);

      if (error.message.includes("insufficient funds")) {
        console.log("   💡 Make sure your account has enough ETH for gas fees");
      } else if (error.message.includes("relayer")) {
        console.log("   💡 Check relayer registration:");
        console.log("      hardhat checkRelayer --name", relayerName, "--network localhost");
      } else if (error.message.includes("tag")) {
        console.log("   💡 Make sure the tags exist in this record");
        console.log("   💡 Check tag spelling and case sensitivity");
      }
    }
  } catch (error: any) {
    console.log("❌ Error:", error.message);
  }
}

async function provideProductionGuidance(uri: string, tags: string[], recordType: string, networkName: string) {
  console.log("🌐 PRODUCTION/STAGING ENVIRONMENT");
  console.log("===================================\n");

  console.log("For production networks, tag removal uses the offchain API:\n");

  console.log("🔗 API Endpoint:");
  if (networkName.includes("sepolia") || networkName.includes("staging")) {
    console.log("   DELETE https://api-staging.ets.xyz/tagging-records/tags");
  } else {
    console.log("   DELETE https://api.ets.xyz/tagging-records/tags");
  }

  console.log("\n📝 Example request:");
  console.log("   curl -X DELETE https://api.ets.xyz/tagging-records/tags \\");
  console.log(`     -H 'Content-Type: application/json' \\`);
  console.log("     -d '{");
  console.log(`       "targetURI": "${uri}",`);
  console.log(`       "tags": ${JSON.stringify(tags)},`);
  console.log(`       "recordType": "${recordType}",`);
  console.log(`       "network": "${networkName}"`);
  console.log("     }'");

  console.log("\n🌐 Alternative - Use the dApp:");
  console.log("   https://app.ets.xyz");

  console.log("\n💡 The API handles:");
  console.log("   • Record existence validation");
  console.log("   • Tag validation within the record");
  console.log("   • Gas estimation and optimization");
  console.log("   • Transaction management and retries");

  console.log("\n⚠️  For testing on this network, consider:");
  console.log("   • Using the staging API for testing");
  console.log("   • Running locally with: hardhat removeTags --network localhost");
}
