/**
 * Deploy Simple Zora Content Coin - No Custom Metadata
 *
 * This script creates a Zora content coin using minimal parameters
 * to test if custom metadata is causing profile visibility issues.
 * Uses Zora's default metadata generation instead of custom IPFS.
 */

import { http, createPublicClient } from "viem";
import {
  createBundlerClient,
  sendUserOperation,
  toCoinbaseSmartAccount,
  waitForUserOperationReceipt,
} from "viem/account-abstraction";
import { privateKeyToAccount } from "viem/accounts";
import { base } from "viem/chains";
import { config } from "./config.js";

async function deploySimpleZora() {
  const isDryRun = process.argv.includes("--dry-run");

  console.log("🚀 Deploying Simple Zora Content Coin (No Custom Metadata)");
  console.log("========================================================\n");

  if (isDryRun) {
    console.log("🧪 DRY RUN MODE - No real transactions will be submitted");
  } else {
    console.log("⚠️  WARNING: This will spend real ETH for gas fees!");
  }
  console.log("🔍 Smart Wallet:", config.smartWallet.address);
  console.log("🏭 Zora Factory:", config.zoraFactory);
  console.log("🌐 Network: Base Mainnet\n");

  try {
    // Create public client
    const publicClient = createPublicClient({
      chain: base,
      transport: http(config.rpcUrl),
    });

    // Create owner account from Privy private key
    const owner = privateKeyToAccount(`0x${config.smartWallet.owners.privy}` as `0x${string}`);
    console.log("🔑 Using Privy owner:", owner.address);

    // Create Coinbase Smart Account
    console.log("📱 Creating Coinbase Smart Account...");
    const account = await toCoinbaseSmartAccount({
      client: publicClient,
      owners: [owner],
      address: config.smartWallet.address,
      version: "1.1",
    });
    console.log("   Smart Account ready:", account.address);

    // Create bundler client
    const bundlerClient = createBundlerClient({
      client: publicClient,
      transport: http(`https://base-mainnet.g.alchemy.com/v2/${config.alchemyApiKey}`),
    });

    // Check balance
    console.log("\n💰 Checking smart wallet ETH balance...");
    const balance = await publicClient.getBalance({
      address: account.address,
    });
    const ethBalance = Number(balance) / 1e18;
    console.log(`   Balance: ${ethBalance.toFixed(6)} ETH`);

    if (ethBalance < 0.001) {
      console.warn("⚠️  Low ETH balance! You may need to fund the smart wallet:");
      console.warn(`   Send ETH to: ${account.address}`);
    }

    // Create simple coin parameters with basic metadata JSON
    const timestamp = Date.now();
    const simpleName = `ETS-POC-${timestamp}`;

    // Create basic metadata JSON with required image
    const basicMetadata = {
      name: simpleName,
      symbol: "ETS",
      description: `ETS test coin created at ${new Date(timestamp).toISOString()}`,
      image: "https://via.placeholder.com/512x512/6366f1/ffffff?text=ETS", // Simple placeholder image
      attributes: [
        {
          trait_type: "Platform",
          value: "ETS",
        },
        {
          trait_type: "Created",
          value: new Date(timestamp).toISOString(),
        },
      ],
    };

    // Convert to data URI for inline metadata (simple approach)
    const metadataUri = `data:application/json;base64,${Buffer.from(JSON.stringify(basicMetadata)).toString("base64")}`;

    console.log("\n📋 Simple Coin Parameters (With Required Image):");
    console.log(`   Name: ${simpleName}`);
    console.log("   Symbol: ETS");
    console.log(`   Image: ${basicMetadata.image}`);
    console.log("   URI: data:application/json (inline metadata)");
    console.log(`   Payout Recipient: ${account.address}`);
    console.log(`   Owners: [${account.address}] (smart wallet as owner)`);

    // Define minimal Zora Factory ABI
    const zoraFactoryAbi = [
      {
        inputs: [
          { name: "payoutRecipient", type: "address" },
          { name: "owners", type: "address[]" },
          { name: "uri", type: "string" },
          { name: "name", type: "string" },
          { name: "symbol", type: "string" },
          { name: "poolConfig", type: "bytes" },
          { name: "platformReferrer", type: "address" },
          { name: "postDeployHook", type: "address" },
          { name: "postDeployHookData", type: "bytes" },
          { name: "coinSalt", type: "bytes32" },
        ],
        name: "deploy",
        outputs: [
          { name: "coin", type: "address" },
          { name: "", type: "bytes" },
        ],
        stateMutability: "payable",
        type: "function",
      },
    ] as const;

    // Simple salt based on name
    const coinSalt = `0x${Buffer.from(simpleName).toString("hex").padEnd(64, "0")}` as `0x${string}`;

    // Prepare the UserOperation parameters
    const userOpParams = {
      account,
      calls: [
        {
          abi: zoraFactoryAbi,
          functionName: "deploy",
          to: config.zoraFactory,
          args: [
            account.address, // payoutRecipient: smart wallet
            [account.address], // owners: [smart wallet]
            metadataUri, // uri: inline metadata with required image
            simpleName, // name: simple timestamped name
            "ETS", // symbol: ETS
            "0x" as `0x${string}`, // poolConfig: empty
            config.coinDefaults.platformReferrer, // platformReferrer
            "0x0000000000000000000000000000000000000000" as `0x${string}`, // postDeployHook: none
            "0x" as `0x${string}`, // postDeployHookData: empty
            coinSalt, // coinSalt: based on name
          ],
        },
      ],
    };

    console.log("\n🔍 UserOperation Parameters:");
    console.log("   Account:", userOpParams.account.address);
    console.log("   Call to:", userOpParams.calls[0].to);
    console.log("   Function:", userOpParams.calls[0].functionName);
    console.log("   Args:");
    console.log(`     payoutRecipient: ${userOpParams.calls[0].args[0]}`);
    console.log(`     owners: [${userOpParams.calls[0].args[1]}]`);
    console.log(`     uri: "${String(userOpParams.calls[0].args[2]).substring(0, 50)}..." (inline metadata)`);
    console.log(`     name: ${userOpParams.calls[0].args[3]}`);
    console.log(`     symbol: ${userOpParams.calls[0].args[4]}`);
    console.log(`     coinSalt: ${userOpParams.calls[0].args[9]}`);

    if (isDryRun) {
      console.log("\n🧪 DRY RUN: Would submit UserOperation with above parameters");
      console.log("✅ DRY RUN COMPLETE - No real transaction submitted");
      console.log("🚀 To deploy for real, run without --dry-run flag");
      process.exit(0);
    }

    // Submit UserOperation
    console.log("\n🔨 Submitting Simple UserOperation...");
    const userOpHash = await sendUserOperation(bundlerClient, userOpParams);

    console.log(`✅ UserOperation submitted: ${userOpHash}`);

    // Wait for receipt
    console.log("\n⏳ Waiting for execution...");
    const receipt = await waitForUserOperationReceipt(bundlerClient, {
      hash: userOpHash,
    });

    if (!receipt.success) {
      throw new Error("UserOperation execution failed");
    }

    console.log("\n🎉 Simple content coin deployed successfully!");
    console.log(`   Transaction: ${receipt.receipt.transactionHash}`);
    console.log(`   Gas Used: ${receipt.actualGasUsed}`);
    console.log(`   Gas Cost: ${Number(receipt.actualGasCost) / 1e18} ETH`);

    console.log("\n✅ Deployment Complete!");
    console.log("🔍 This coin uses Zora's default metadata system");
    console.log("🌐 Check your Zora profile to see if this coin appears");
    console.log(`📊 View transaction: https://basescan.org/tx/${receipt.receipt.transactionHash}`);

    // Exit cleanly to return terminal control
    process.exit(0);
  } catch (error) {
    console.error("💥 Deployment failed:", error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on("SIGINT", () => {
  console.log("\n👋 Deployment cancelled by user");
  process.exit(0);
});

deploySimpleZora().catch(console.error);
