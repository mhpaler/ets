/**
 * Deploy Zora Coin via Direct Factory Call (No Account Abstraction)
 *
 * This demonstrates the SIMPLE approach that ETS Temporal Processor should use:
 * - Direct wallet signing (HD wallet position 3)
 * - Direct factory contract call
 * - Deterministic salt from tag machine name
 *
 * Much simpler than the AA-based POC scripts!
 */

import { validateMetadataJSON } from "@zoralabs/coins-sdk";
import { http, createPublicClient, createWalletClient, encodeFunctionData, keccak256, parseEther, toBytes } from "viem";
import { mnemonicToAccount } from "viem/accounts";
import { base, baseSepolia } from "viem/chains";

// Configuration
const ZORA_FACTORY = "0x777777751622c0d3258f214F9DF38E35BF45baF3" as const;
const isDryRun = process.argv.includes("--dry-run");
const isTestnet = process.argv.includes("--testnet");

// Chain selection
const chain = isTestnet ? baseSepolia : base;
const chainName = isTestnet ? "Base Sepolia" : "Base Mainnet";

console.log("🚀 Direct Zora Factory Deployment Test");
console.log(`   Chain: ${chainName} (${chain.id})`);
console.log(`   Factory: ${ZORA_FACTORY}`);
if (isDryRun) console.log("   Mode: DRY RUN\n");

// Get mnemonic from environment
const mnemonic = isTestnet ? process.env.STAGING_MNEMONIC : process.env.PRODUCTION_MNEMONIC;

if (!mnemonic) {
  console.error("❌ Missing mnemonic environment variable");
  console.error(`   Set ${isTestnet ? "STAGING_MNEMONIC" : "PRODUCTION_MNEMONIC"}`);
  process.exit(1);
}

const alchemyKey = process.env.ALCHEMY_API_KEY || "TjjzoNYlIqWqZxcoufe60bhVbARhkxYX";
const rpcUrl = isTestnet
  ? `https://base-sepolia.g.alchemy.com/v2/${alchemyKey}`
  : `https://base-mainnet.g.alchemy.com/v2/${alchemyKey}`;

// Derive ETSZora account (position 3)
const zoraAccount = mnemonicToAccount(mnemonic, {
  addressIndex: 3, // Position 3: ETSZora
});

console.log(`🔑 ETSZora Account: ${zoraAccount.address}\n`);

// Create clients
const publicClient = createPublicClient({
  chain,
  transport: http(rpcUrl),
});

const walletClient = createWalletClient({
  account: zoraAccount,
  chain,
  transport: http(rpcUrl),
});

// Zora Factory ABI (deploy function)
const ZORA_FACTORY_ABI = [
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
      { name: "deployData", type: "bytes" },
    ],
    stateMutability: "payable",
    type: "function",
  },
] as const;

interface CoinMetadata {
  name: string;
  symbol: string;
  description: string;
  image: string;
}

function generateAndValidateMetadata(tagString: string): { metadata: CoinMetadata; uri: string } {
  console.log("🎨 Generating metadata...");

  // Generate SVG with hashtag text
  const svgText = tagString;
  const fontSize = tagString.length > 15 ? "60" : "80"; // Smaller font for longer tags
  const svg = `<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg"><rect width="512" height="512" fill="#6366f1"/><text x="50%" y="50%" font-size="${fontSize}" font-family="Arial, sans-serif" fill="#ffffff" text-anchor="middle" dy=".3em">${svgText}</text></svg>`;
  const svgBase64 = Buffer.from(svg).toString("base64");

  // Generate metadata structure
  const metadata: CoinMetadata = {
    name: tagString,
    symbol: "TAG",
    description: `Tradeable token for ${tagString} on Ethereum Tag Service`,
    image: `data:image/svg+xml;base64,${svgBase64}`,
  };

  // Validate with Zora SDK
  console.log("✓ Validating metadata structure with Zora SDK...");
  try {
    validateMetadataJSON(metadata);
    console.log("✅ Metadata validation PASSED");
  } catch (error: any) {
    console.error("❌ Metadata validation FAILED:", error.message);
    console.error("\nGenerated metadata:");
    console.error(JSON.stringify(metadata, null, 2));
    throw new Error(`Invalid metadata structure: ${error.message}`);
  }

  // Print metadata for preview
  console.log("\n📋 Generated Metadata:");
  console.log(JSON.stringify(metadata, null, 2));
  console.log("\n🖼️  Preview image:", metadata.image);

  // Create data URI
  const uri = `data:application/json;base64,${Buffer.from(JSON.stringify(metadata)).toString("base64")}`;
  console.log(`\n✓ Metadata URI created (${uri.length} bytes)\n`);

  return { metadata, uri };
}

async function getPoolConfig(): Promise<`0x${string}`> {
  const poolConfigUrl = new URL("https://api-sdk.zora.engineering/create/content/pool-config");
  poolConfigUrl.searchParams.append("chain_id", chain.id.toString());
  // Base Sepolia only supports ETH, Base Mainnet can use CREATOR_COIN_OR_ZORA
  const currency = isTestnet ? "ETH" : "CREATOR_COIN_OR_ZORA";
  poolConfigUrl.searchParams.append("currency", currency);
  poolConfigUrl.searchParams.append("starting_market_cap", "HIGH");

  console.log("📡 Fetching pool config from Zora API...");
  console.log(`   URL: ${poolConfigUrl.toString()}`);

  const response = await fetch(poolConfigUrl.toString());

  if (!response.ok) {
    const errorBody = await response.text();
    console.error(`   Error response: ${errorBody}`);
    throw new Error(`Pool config API failed: ${response.status} ${response.statusText}`);
  }

  const data = (await response.json()) as { poolConfig?: string };

  if (!data.poolConfig) {
    throw new Error("Pool config missing in API response");
  }

  return data.poolConfig as `0x${string}`;
}

async function deployCoin() {
  try {
    // Check balance
    const balance = await publicClient.getBalance({ address: zoraAccount.address });
    const ethBalance = Number(balance) / 1e18;
    console.log(`💰 ETSZora Balance: ${ethBalance.toFixed(6)} ETH`);

    if (ethBalance < 0.001) {
      console.warn("⚠️  Low balance! May need funding.\n");
      if (!isDryRun) {
        console.error("❌ Insufficient balance for deployment");
        process.exit(1);
      }
    }

    // Create coin parameters
    const timestamp = Date.now();
    const machineName = `ets-test-${timestamp}`;
    const tagString = `#${timestamp}`;

    // Deterministic salt from machine name (matches ETS contract logic)
    const coinSalt = keccak256(toBytes(machineName));

    // Generate and validate metadata
    const { metadata, uri: metadataUri } = generateAndValidateMetadata(tagString);

    // Fetch pool config from Zora API
    const poolConfig = await getPoolConfig();
    console.log(`✅ Pool config fetched (${poolConfig.length} bytes)\n`);

    const coinParams = {
      payoutRecipient: zoraAccount.address,
      owners: [zoraAccount.address],
      uri: metadataUri,
      name: metadata.name,
      symbol: metadata.symbol,
      poolConfig,
      platformReferrer: "0x0000000000000000000000000000000000000000" as `0x${string}`,
      postDeployHook: "0x0000000000000000000000000000000000000000" as `0x${string}`,
      postDeployHookData: "0x" as `0x${string}`,
      coinSalt,
    };

    console.log("📋 Coin Parameters:");
    console.log(`   Machine Name: ${machineName}`);
    console.log(`   Coin Name: ${coinParams.name}`);
    console.log(`   Salt: ${coinSalt}`);
    console.log(`   Owner: ${coinParams.owners[0]}`);
    console.log(`   Payout: ${coinParams.payoutRecipient}\n`);

    if (isDryRun) {
      console.log("🧪 DRY RUN: Would call Zora factory with above parameters");
      console.log("✅ Parameters validated successfully");
      console.log("🚀 To deploy for real, run without --dry-run");
      process.exit(0);
    }

    // Simulate first to catch errors
    console.log("🔍 Simulating contract call...");
    const { result } = await publicClient.simulateContract({
      account: zoraAccount,
      address: ZORA_FACTORY,
      abi: ZORA_FACTORY_ABI,
      functionName: "deploy",
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
      value: 0n,
    });

    const [predictedAddress] = result;
    console.log(`✅ Simulation successful! Predicted coin: ${predictedAddress}\n`);

    // Execute the transaction
    console.log("🔨 Executing deployment transaction...");
    const hash = await walletClient.writeContract({
      address: ZORA_FACTORY,
      abi: ZORA_FACTORY_ABI,
      functionName: "deploy",
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
      value: 0n,
    });

    console.log(`📤 Transaction submitted: ${hash}`);
    console.log("⏳ Waiting for confirmation...\n");

    // Wait for receipt
    const receipt = await publicClient.waitForTransactionReceipt({ hash });

    if (receipt.status === "success") {
      console.log("🎉 Coin deployed successfully!");
      console.log(`   Coin Address: ${predictedAddress}`);
      console.log(`   Transaction: ${receipt.transactionHash}`);
      console.log(`   Gas Used: ${receipt.gasUsed}`);
      console.log(`   Block: ${receipt.blockNumber}`);
      console.log(`\n📊 View on ${isTestnet ? "BaseScan Testnet" : "BaseScan"}:`);
      console.log(`   https://${isTestnet ? "sepolia." : ""}basescan.org/tx/${receipt.transactionHash}`);
    } else {
      console.error("❌ Transaction failed");
      process.exit(1);
    }
  } catch (error) {
    console.error("💥 Deployment failed:", error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on("SIGINT", () => {
  console.log("\n👋 Cancelled by user");
  process.exit(0);
});

deployCoin().catch(console.error);
