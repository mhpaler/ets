import { http, type Address, type Hex, createPublicClient, createWalletClient } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base } from "viem/chains";

// CONFIGURATION - Set these values
// MHP PK: 0x675df744cc7955dd881fa75dde7f06e9e63dfdfab23814606eec2242c17917b5
// MHP Public Key: 0x147537D3bf705392A5d5f3cda8Bb784E84aC9c5C

// ETS ZORA CREATOR PK 4e284d9ea4aeb9779bc0f22ffcc800c83a3643d826f324b1b2fad316e7fa3b39
// ETS ZORA CREATOR Public Key: 0xB8C76203036E02524143113fd554968f50E9bC05

// ZORA Wallet: 0x4De7c002bE724aD63d5dcA3f64126BbDDb9FD735

const SIGNER_PRIVATE_KEY: Hex = "0x675df744cc7955dd881fa75dde7f06e9e63dfdfab23814606eec2242c17917b5"; // Current owner's private key
const COIN_ADDRESS: Address = "0x3d452fe44153260f84ed310083438ac992292a92"; // Replace with actual coin address
const NEW_OWNER_ADDRESSES: Address[] = [
  "0xde98c2a8182d9638f7945e17e0a0a0c94bb28c1a",
  "0x4de7c002be724ad63d5dca3f64126bbddb9fd735",
]; // Addresses to add as owners

// Zora Coin ABI - MultiOwnable functions
const ZORA_COIN_ABI = [
  {
    inputs: [],
    name: "owners",
    outputs: [{ internalType: "address[]", name: "", type: "address[]" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address[]", name: "accounts", type: "address[]" }],
    name: "addOwners",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "account", type: "address" }],
    name: "isOwner",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

async function addOwners() {
  console.log("🔧 Add Owners Utility");
  console.log("=====================");
  console.log(`Coin Address: ${COIN_ADDRESS}`);
  console.log("New Owners to Add:");
  NEW_OWNER_ADDRESSES.forEach((addr, i) => {
    console.log(`  [${i}] ${addr}`);
  });
  console.log();

  // Create clients
  const account = privateKeyToAccount(SIGNER_PRIVATE_KEY);
  console.log(`Signer Address: ${account.address}`);
  console.log();

  const publicClient = createPublicClient({
    chain: base,
    transport: http(),
  });

  const walletClient = createWalletClient({
    account,
    chain: base,
    transport: http(),
  });

  try {
    // Get current owners before
    console.log("📋 Current Owners (Before):");
    const ownersBefore = await publicClient.readContract({
      address: COIN_ADDRESS,
      abi: ZORA_COIN_ABI,
      functionName: "owners",
    });
    ownersBefore.forEach((owner, i) => {
      console.log(`  [${i}] ${owner}`);
    });
    console.log();

    // Check if any new owners are already in the list
    console.log("🔍 Checking ownership status:");
    const alreadyOwners: Address[] = [];
    const newOwners: Address[] = [];

    for (const address of NEW_OWNER_ADDRESSES) {
      const isAlreadyOwner = await publicClient.readContract({
        address: COIN_ADDRESS,
        abi: ZORA_COIN_ABI,
        functionName: "isOwner",
        args: [address],
      });

      if (isAlreadyOwner) {
        console.log(`  ❌ ${address} - Already an owner`);
        alreadyOwners.push(address);
      } else {
        console.log(`  ✅ ${address} - Will be added`);
        newOwners.push(address);
      }
    }

    if (newOwners.length === 0) {
      console.log("⚠️  All addresses are already owners!");
      console.log("No action needed.");
      return;
    }

    console.log(
      `📊 Summary: Adding ${newOwners.length} new owner(s), skipping ${alreadyOwners.length} existing owner(s)`,
    );
    console.log();

    // Send addOwners transaction
    console.log("📤 Sending addOwners transaction...");
    console.log(`Adding addresses: ${newOwners.join(", ")}`);
    const hash = await walletClient.writeContract({
      address: COIN_ADDRESS,
      abi: ZORA_COIN_ABI,
      functionName: "addOwners",
      args: [newOwners],
    });

    console.log(`Transaction Hash: ${hash}`);
    console.log("⏳ Waiting for confirmation...");

    // Wait for transaction receipt
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    console.log(`✅ Transaction confirmed in block ${receipt.blockNumber}`);
    console.log();

    // Get current owners after
    console.log("📋 Current Owners (After):");
    const ownersAfter = await publicClient.readContract({
      address: COIN_ADDRESS,
      abi: ZORA_COIN_ABI,
      functionName: "owners",
    });
    ownersAfter.forEach((owner, i) => {
      console.log(`  [${i}] ${owner}`);
    });
    console.log();

    console.log(`✅ ${newOwners.length} owner(s) successfully added!`);
  } catch (error) {
    console.error("❌ Error adding owners:", error);
    process.exit(1);
  }
}

// Run the function
addOwners().catch(console.error);
