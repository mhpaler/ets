/**
 * Deploy Real Zora Content Coin using Viem's AA Infrastructure
 *
 * This script uses Viem's proper Account Abstraction flow:
 * - toCoinbaseSmartAccount for the smart account
 * - prepareUserOperation to build the UserOp
 * - sendUserOperation to submit via bundler
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
import { MetadataClient } from "./metadataClient.js";
import type { CoinDeployParams } from "./types.js";

async function deployWithViemAA() {
  const isDryRun = process.argv.includes("--dry-run");

  console.log("🚀 Deploying Zora Content Coin with Viem AA");
  console.log("==========================================\n");

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
      version: "1.1", // Use version 1.1 as recommended in docs
    });
    console.log("   Smart Account ready:", account.address);

    // Create bundler client (following guide pattern)
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

    // Generate metadata
    console.log("\n🎨 Generating coin metadata...");
    const metadataClient = new MetadataClient(config.offchainApiUrl);
    const timestamp = Date.now();
    const tagString = `#ZoraPOC${timestamp}`;

    let metadataUri: string;
    const isApiHealthy = await metadataClient.checkHealth();

    if (isApiHealthy) {
      console.log(`🎨 Generating metadata for tag: ${tagString}`);
      const metadataResult = await metadataClient.generateTagMetadata({
        tagString,
        machineName: tagString.slice(1).toLowerCase(),
        creator: config.smartWallet.address,
        relayer: config.smartWallet.address,
      });

      console.log("🔍 Metadata API Response:", JSON.stringify(metadataResult, null, 2));

      if (metadataResult.success && metadataResult.metadataUri) {
        metadataUri = metadataResult.metadataUri;
        console.log(`✅ Metadata generated successfully: ${metadataUri}`);
      } else {
        metadataUri = config.coinDefaults.uri;
        console.log(`⚠️  Metadata generation failed, using default: ${metadataUri}`);
        console.log(`   Reason: success=${metadataResult.success}, metadataUri=${metadataResult.metadataUri}`);
      }
    } else {
      metadataUri = config.coinDefaults.uri;
      console.log("⚠️  Offchain-api not available, using default metadata");
    }

    // Create coin parameters
    const coinParams: CoinDeployParams = {
      payoutRecipient: config.smartWallet.address,
      owners: [config.smartWallet.address], // Smart wallet is the owner
      uri: metadataUri,
      name: `TAG: ${tagString.slice(1).charAt(0).toUpperCase() + tagString.slice(2).toLowerCase()}`,
      symbol: config.coinDefaults.symbol,
      poolConfig: "0x" as `0x${string}`, // Empty pool config
      platformReferrer: config.coinDefaults.platformReferrer,
      postDeployHook: "0x0000000000000000000000000000000000000000" as `0x${string}`,
      postDeployHookData: "0x" as `0x${string}`,
      coinSalt: `0x${Buffer.from(tagString).toString("hex").padEnd(64, "0")}` as `0x${string}`,
    };

    console.log("\n📋 Coin Parameters:");
    console.log(`   Name: ${coinParams.name}`);
    console.log(`   Symbol: ${coinParams.symbol}`);
    console.log(`   URI: ${coinParams.uri}`);
    console.log(`   Payout Recipient: ${coinParams.payoutRecipient}`);

    // Define Zora Factory ABI for the deploy function
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

    // Prepare the UserOperation parameters for debugging
    const userOpParams = {
      account,
      calls: [
        {
          abi: zoraFactoryAbi,
          functionName: "deploy",
          to: config.zoraFactory,
          args: [
            coinParams.payoutRecipient,
            coinParams.owners,
            coinParams.uri,
            coinParams.name,
            coinParams.symbol,
            coinParams.poolConfig,
            coinParams.platformReferrer,
            coinParams.postDeployHook,
            coinParams.postDeployHookData,
            coinParams.coinSalt,
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
    console.log(`     uri: ${userOpParams.calls[0].args[2]}`);
    console.log(`     name: ${userOpParams.calls[0].args[3]}`);
    console.log(`     symbol: ${userOpParams.calls[0].args[4]}`);
    console.log(`     coinSalt: ${userOpParams.calls[0].args[9]}`);

    if (isDryRun) {
      console.log("\n🧪 DRY RUN: Would submit UserOperation with above parameters");
      console.log("✅ DRY RUN COMPLETE - No real transaction submitted");
      console.log("🚀 To deploy for real, run without --dry-run flag");
      process.exit(0);
    }

    // Submit UserOperation directly using sendUserOperation (following guide pattern)
    console.log("\n🔨 Submitting UserOperation directly...");
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

    console.log("\n🎉 Content coin deployed successfully!");
    console.log(`   Transaction: ${receipt.receipt.transactionHash}`);
    console.log(`   Gas Used: ${receipt.actualGasUsed}`);
    console.log(`   Gas Cost: ${Number(receipt.actualGasCost) / 1e18} ETH`);

    console.log("\n✅ Deployment Complete!");
    console.log("🌐 Check your Zora profile to see the new content coin");
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

deployWithViemAA().catch(console.error);
