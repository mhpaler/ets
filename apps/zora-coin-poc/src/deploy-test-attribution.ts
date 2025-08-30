/**
 * Test Different Attribution Scenarios for Zora Content Coins
 *
 * Based on research findings, we need to test which creator attribution
 * method results in coins appearing on the correct Zora profile.
 */

import { createCoin, createMetadataBuilder, createZoraUploaderForCreator, setApiKey } from "@zoralabs/coins-sdk";
import { http, createPublicClient, createWalletClient } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base } from "viem/chains";
import { config } from "./config.js";

async function testAttribution() {
  const scenario = process.argv[2] || "eoa";
  const isDryRun = process.argv.includes("--dry-run");

  console.log("🧪 Testing Zora Coin Attribution Scenarios");
  console.log("==========================================\n");
  console.log(`📋 Scenario: ${scenario}`);
  console.log(`🔍 Smart Wallet (Zora Identity): ${config.smartWallet.address}`);

  if (isDryRun) {
    console.log("🧪 DRY RUN MODE - No real transactions will be submitted");
  } else {
    console.log("⚠️  WARNING: This will spend real ETH for gas fees!");
  }

  try {
    // Set up Zora API key for IPFS uploads
    const zoraApiKey = process.env.ZORA_API_KEY;
    if (!zoraApiKey || zoraApiKey === "your_zora_api_key_here") {
      throw new Error("Please set ZORA_API_KEY in your .env file");
    }
    setApiKey(zoraApiKey);
    console.log("🔑 Zora API key configured");

    // Create public client
    const publicClient = createPublicClient({
      chain: base,
      transport: http(config.rpcUrl),
    });

    let walletClient: any;
    let creatorAddress: `0x${string}`;
    let signerAddress: `0x${string}`;

    // Test different scenarios
    switch (scenario) {
      case "eoa": {
        console.log("\n🔐 Scenario: EOA as signer, EOA as creator");
        const eoaAccount = privateKeyToAccount(`0x${config.smartWallet.owners.eoa}` as `0x${string}`);
        walletClient = createWalletClient({
          account: eoaAccount,
          chain: base,
          transport: http(config.rpcUrl),
        });
        creatorAddress = eoaAccount.address;
        signerAddress = eoaAccount.address;
        break;
      }

      case "privy": {
        console.log("\n🔐 Scenario: Privy as signer, Privy as creator");
        const privyAccount = privateKeyToAccount(`0x${config.smartWallet.owners.privy}` as `0x${string}`);
        walletClient = createWalletClient({
          account: privyAccount,
          chain: base,
          transport: http(config.rpcUrl),
        });
        creatorAddress = privyAccount.address;
        signerAddress = privyAccount.address;
        break;
      }

      case "eoa-smart": {
        console.log("\n🔐 Scenario: EOA as signer, Smart Wallet as creator");
        const eoaSmartAccount = privateKeyToAccount(`0x${config.smartWallet.owners.eoa}` as `0x${string}`);
        walletClient = createWalletClient({
          account: eoaSmartAccount,
          chain: base,
          transport: http(config.rpcUrl),
        });
        creatorAddress = config.smartWallet.address; // Smart wallet as creator
        signerAddress = eoaSmartAccount.address;
        break;
      }

      case "privy-smart": {
        console.log("\n🔐 Scenario: Privy as signer, Smart Wallet as creator");
        const privySmartAccount = privateKeyToAccount(`0x${config.smartWallet.owners.privy}` as `0x${string}`);
        walletClient = createWalletClient({
          account: privySmartAccount,
          chain: base,
          transport: http(config.rpcUrl),
        });
        creatorAddress = config.smartWallet.address; // Smart wallet as creator
        signerAddress = privySmartAccount.address;
        break;
      }

      default:
        throw new Error("Invalid scenario. Use: eoa, privy, eoa-smart, or privy-smart");
    }

    console.log(`   Signer Address: ${signerAddress}`);
    console.log(`   Creator Address: ${creatorAddress}`);

    // Debug: Validate addresses
    if (!signerAddress || signerAddress === "undefined") {
      throw new Error(`Invalid signer address: ${signerAddress}`);
    }
    if (!creatorAddress || creatorAddress === "undefined") {
      throw new Error(`Invalid creator address: ${creatorAddress}`);
    }

    // Check balance
    console.log("\n💰 Checking signer ETH balance...");
    const balance = await publicClient.getBalance({ address: signerAddress });
    const ethBalance = Number(balance) / 1e18;
    console.log(`   Balance: ${ethBalance.toFixed(6)} ETH`);

    if (ethBalance < 0.01) {
      console.warn("⚠️  Low ETH balance! You need to fund the signer account:");
      console.warn(`   Send ETH to: ${signerAddress}`);
      if (!isDryRun) {
        throw new Error(
          `Insufficient ETH balance (${ethBalance.toFixed(6)} ETH). Please fund ${signerAddress} with at least 0.01 ETH for gas fees.`,
        );
      }
    }

    // Create coin parameters with scenario identifier
    const timestamp = Date.now();
    const coinName = `ETS-${scenario.toUpperCase()}-${timestamp}`;

    const metadata = {
      name: coinName,
      description: `ETS attribution test: ${scenario} scenario at ${new Date(timestamp).toISOString()}`,
      image: `https://via.placeholder.com/512x512/6366f1/ffffff?text=${encodeURIComponent(scenario.toUpperCase())}`,
      attributes: [
        {
          trait_type: "Platform",
          value: "ETS",
        },
        {
          trait_type: "Scenario",
          value: scenario,
        },
        {
          trait_type: "Created",
          value: new Date(timestamp).toISOString(),
        },
        {
          trait_type: "Signer",
          value: signerAddress,
        },
        {
          trait_type: "Creator",
          value: creatorAddress,
        },
      ],
    };

    console.log("\n📋 Coin Parameters:");
    console.log(`   Name: ${coinName}`);
    console.log("   Symbol: ETS");
    console.log(`   Creator: ${creatorAddress}`);
    console.log(`   Image: ${metadata.image}`);

    if (isDryRun) {
      console.log("\n🧪 DRY RUN: Would create coin with SDK using parameters above");
      console.log("✅ DRY RUN COMPLETE - No real transaction submitted");
      console.log("🚀 To deploy for real, remove --dry-run flag");
      process.exit(0);
    }

    // Create proper metadata using Zora's builder
    console.log("\n📤 Building metadata with Zora SDK...");

    // Create a simple SVG image as a File object
    const svgContent = `<svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="400" fill="#6366f1"/>
      <text x="200" y="200" text-anchor="middle" dominant-baseline="middle"
            font-family="Arial, sans-serif" font-size="48" fill="white">
        ${scenario.toUpperCase()}
      </text>
      <text x="200" y="350" text-anchor="middle" dominant-baseline="middle"
            font-family="Arial, sans-serif" font-size="16" fill="white" opacity="0.8">
        ETS Test
      </text>
    </svg>`;

    const svgFile = new File([svgContent], `${coinName}.svg`, { type: "image/svg+xml" });

    // Create uploader for the creator
    const uploader = createZoraUploaderForCreator(creatorAddress as `0x${string}`);

    // Build metadata with Zora's official builder
    const metadataBuilder = createMetadataBuilder()
      .withName(coinName)
      .withSymbol("ETS")
      .withDescription(metadata.description)
      .withImage(svgFile);

    // Upload metadata to IPFS via Zora
    console.log("\n📤 Uploading metadata to IPFS...");
    const metadataResult = await metadataBuilder.upload(uploader);

    console.log(`   Metadata URI: ${metadataResult.url}`);

    // Use official Zora SDK to create coin
    console.log("\n🔨 Creating coin with Zora SDK...");

    // Debug: Log all parameters before SDK call
    console.log("   Debug - SDK Parameters:");
    console.log(`     creator: ${creatorAddress}`);
    console.log(`     name: ${coinName}`);
    console.log("     symbol: ETS");
    console.log(`     metadataUri: ${metadataResult.url}`);
    console.log(`     walletClient account: ${walletClient.account?.address}`);

    // Use correct SDK parameters based on documentation
    const result = await createCoin({
      call: {
        creator: creatorAddress as `0x${string}`,
        name: coinName,
        symbol: "ETS",
        metadata: {
          type: "RAW_URI",
          uri: metadataResult.url,
        },
        currency: "CREATOR_COIN", // Use CREATOR_COIN as per docs
        startingMarketCap: "LOW", // Use LOW market cap
        chainId: 8453, // Base mainnet
      },
      walletClient,
      publicClient,
    });

    console.log("\n🎉 Content coin created successfully!");
    console.log(`   Scenario: ${scenario}`);
    console.log(`   Transaction Hash: ${result.hash}`);
    console.log(`   Coin Address: ${result.address}`);
    console.log(`   Signer: ${signerAddress}`);
    console.log(`   Creator: ${creatorAddress}`);

    console.log("\n📊 Profile Visibility Test:");
    console.log("🔍 Check these profiles to see which one shows the coin:");
    console.log(`   Smart Wallet Profile: https://zora.co/${config.smartWallet.address}`);

    if (creatorAddress !== config.smartWallet.address) {
      console.log(`   Creator Profile: https://zora.co/${creatorAddress}`);
    }

    console.log(`📊 View transaction: https://basescan.org/tx/${result.hash}`);

    // Exit cleanly
    process.exit(0);
  } catch (error) {
    console.error("💥 Deployment failed:", error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on("SIGINT", () => {
  console.log("\n👋 Attribution test cancelled by user");
  process.exit(0);
});

console.log("\nUsage:");
console.log("  bun src/deploy-test-attribution.ts <scenario> [--dry-run]");
console.log("\nScenarios:");
console.log("  eoa        - EOA as signer and creator");
console.log("  privy      - Privy as signer and creator");
console.log("  eoa-smart  - EOA as signer, Smart Wallet as creator");
console.log("  privy-smart- Privy as signer, Smart Wallet as creator");
console.log("");

testAttribution().catch(console.error);
