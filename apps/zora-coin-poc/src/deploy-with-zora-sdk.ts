/**
 * Deploy Zora Content Coin using Official Zora SDK
 *
 * This uses the official SDK which handles all the complex orchestration
 * including Uniswap pool creation, ZORA token integration, and proper
 * profile attribution that we saw in the working transaction.
 */

import { createCoin } from "@zoralabs/coins-sdk";
import { http, createPublicClient, createWalletClient } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base } from "viem/chains";
import { config } from "./config.js";

async function deployWithZoraSDK() {
  const isDryRun = process.argv.includes("--dry-run");

  console.log("🚀 Deploying Zora Content Coin with Official SDK");
  console.log("===============================================\n");

  if (isDryRun) {
    console.log("🧪 DRY RUN MODE - No real transactions will be submitted");
  } else {
    console.log("⚠️  WARNING: This will spend real ETH for gas fees!");
  }
  console.log("🔍 Smart Wallet:", config.smartWallet.address);
  console.log("🌐 Network: Base Mainnet\n");

  try {
    // Create clients
    const publicClient = createPublicClient({
      chain: base,
      transport: http(config.rpcUrl),
    });

    // Create owner account from Privy private key
    const owner = privateKeyToAccount(`0x${config.smartWallet.owners.privy}` as `0x${string}`);
    console.log("🔑 Using Privy owner:", owner.address);

    // Create wallet client
    const walletClient = createWalletClient({
      account: owner,
      chain: base,
      transport: http(config.rpcUrl),
    });

    // Check balance
    console.log("\n💰 Checking owner ETH balance...");
    const balance = await publicClient.getBalance({
      address: owner.address,
    });
    const ethBalance = Number(balance) / 1e18;
    console.log(`   Balance: ${ethBalance.toFixed(6)} ETH`);

    if (ethBalance < 0.01) {
      console.warn("⚠️  Low ETH balance! You may need to fund the owner account:");
      console.warn(`   Send ETH to: ${owner.address}`);
    }

    // Create coin parameters
    const timestamp = Date.now();
    const coinName = `ETS-SDK-${timestamp}`;

    // Create basic metadata
    const metadata = {
      name: coinName,
      description: `ETS test coin created with official SDK at ${new Date(timestamp).toISOString()}`,
      image: "https://via.placeholder.com/512x512/6366f1/ffffff?text=ETS+SDK",
      attributes: [
        {
          trait_type: "Platform",
          value: "ETS",
        },
        {
          trait_type: "Created",
          value: new Date(timestamp).toISOString(),
        },
        {
          trait_type: "Method",
          value: "Official SDK",
        },
      ],
    };

    console.log("\n📋 Coin Parameters:");
    console.log(`   Name: ${coinName}`);
    console.log("   Symbol: ETS");
    console.log(`   Creator: ${owner.address}`);
    console.log(`   Image: ${metadata.image}`);

    if (isDryRun) {
      console.log("\n🧪 DRY RUN: Would create coin with Zora SDK using parameters above");
      console.log("✅ DRY RUN COMPLETE - No real transaction submitted");
      console.log("🚀 To deploy for real, run without --dry-run flag");
      process.exit(0);
    }

    // Use official Zora SDK to create coin
    console.log("\n🔨 Creating coin with official Zora SDK...");

    const result = await createCoin({
      publicClient,
      walletClient,
      coinName,
      coinSymbol: "ETS",
      metadata,
      creator: config.smartWallet.address, // Use smart wallet as creator for profile attribution
    });

    console.log("\n🎉 Content coin created successfully with Zora SDK!");
    console.log(`   Transaction Hash: ${result.transactionHash}`);
    console.log(`   Coin Address: ${result.coinAddress}`);
    console.log(`   Gas Used: ${result.gasUsed}`);

    console.log("\n✅ Deployment Complete!");
    console.log("🌐 This coin was created using the official SDK with proper orchestration");
    console.log("📊 Check your Zora profile - this should appear correctly!");
    console.log(`📊 View transaction: https://basescan.org/tx/${result.transactionHash}`);

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

deployWithZoraSDK().catch(console.error);
