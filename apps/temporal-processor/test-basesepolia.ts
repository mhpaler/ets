#!/usr/bin/env tsx
/**
 * Test script to verify Temporal Processor can connect to Base Sepolia contracts
 * and has proper EVENT_PROCESSOR_ROLE permissions
 */

import { http, type Address, createPublicClient, createWalletClient } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { baseSepolia } from "viem/chains";
import { config } from "./src/config";

// Load environment for Base Sepolia
process.env.NODE_ENV = "staging";
process.env.CHAIN_ID = "84532";
process.env.RPC_URL = "https://sepolia.base.org";

// Import config after setting environment
import { HDKey } from "@scure/bip32";
import { mnemonicToSeedSync } from "@scure/bip39";

async function test() {
  console.log("\n🔍 Testing Base Sepolia Connection...");
  console.log("=====================================\n");

  // Get mnemonic from environment
  const mnemonic = process.env.STAGING_MNEMONIC || process.env.MNEMONIC;
  if (!mnemonic) {
    console.error("❌ No mnemonic found. Please set STAGING_MNEMONIC in root .env");
    process.exit(1);
  }

  // Derive ETSEventProcessor account (position 2)
  const seed = mnemonicToSeedSync(mnemonic);
  const hdKey = HDKey.fromMasterSeed(seed);
  const path = `m/44'/60'/0'/0/2`;
  const derivedKey = hdKey.derive(path);

  if (!derivedKey.privateKey) {
    throw new Error("Failed to derive private key");
  }

  const privateKey = `0x${Buffer.from(derivedKey.privateKey).toString("hex")}` as `0x${string}`;
  const account = privateKeyToAccount(privateKey);

  console.log("ETSEventProcessor Address:", account.address);

  // Create clients
  const publicClient = createPublicClient({
    chain: baseSepolia,
    transport: http("https://sepolia.base.org"),
  });

  const walletClient = createWalletClient({
    account,
    chain: baseSepolia,
    transport: http("https://sepolia.base.org"),
  });

  // Get deployed contract addresses
  const { getContractAddresses } = await import("@ethereum-tag-service/contracts/deployments");
  const addresses = getContractAddresses("baseSepolia");

  console.log("\n📋 Contract Addresses:");
  console.log("  AccessControls:", addresses.accessControls);
  console.log("  ETSToken:", addresses.token);
  console.log("  ETSTarget:", addresses.target);
  console.log("  ETSCore:", addresses.core);

  // Check EVENT_PROCESSOR_ROLE
  console.log("\n🔐 Checking Role Permissions...");

  try {
    // Import ABI
    const { ETSAccessControlsABI } = await import("@ethereum-tag-service/contracts/abis");

    // Get EVENT_PROCESSOR_ROLE hash
    const EVENT_PROCESSOR_ROLE = await publicClient.readContract({
      address: addresses.accessControls as Address,
      abi: ETSAccessControlsABI,
      functionName: "EVENT_PROCESSOR_ROLE",
    });

    // Check if our account has the role
    const hasRole = await publicClient.readContract({
      address: addresses.accessControls as Address,
      abi: ETSAccessControlsABI,
      functionName: "hasRole",
      args: [EVENT_PROCESSOR_ROLE, account.address],
    });

    if (hasRole) {
      console.log("✅ ETSEventProcessor has EVENT_PROCESSOR_ROLE");
    } else {
      console.log("❌ ETSEventProcessor does NOT have EVENT_PROCESSOR_ROLE");
      console.log("   Please run configure-ets.ts script on Base Sepolia");
    }

    // Check chain connection
    const blockNumber = await publicClient.getBlockNumber();
    console.log("\n🔗 Connected to Base Sepolia at block:", blockNumber);

    // Check if we can read from ETSTarget
    const { ETSTargetABI } = await import("@ethereum-tag-service/contracts/abis");

    try {
      // Try to read targetId (the counter for targets)
      const targetId = await publicClient.readContract({
        address: addresses.target as Address,
        abi: ETSTargetABI,
        functionName: "targetId",
      });

      console.log(`📊 Current target ID counter: ${targetId}`);
    } catch (e) {
      console.log("📊 Unable to read target count (contract may use different method)");
    }

    console.log("\n✅ Base Sepolia connection test successful!");
    console.log("\nTo start the Temporal Processor for Base Sepolia:");
    console.log("  cd apps/temporal-processor");
    console.log("  ./start-basesepolia.sh");
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

test().catch(console.error);
