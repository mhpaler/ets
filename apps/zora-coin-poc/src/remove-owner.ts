import { http, type Address, type Hex, createPublicClient, createWalletClient } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base } from "viem/chains";

// CONFIGURATION - Set these values
// MHP PK: 0x675df744cc7955dd881fa75dde7f06e9e63dfdfab23814606eec2242c17917b5
// MHP Public Key: 0x147537D3bf705392A5d5f3cda8Bb784E84aC9c5

// ETS ZORA CREATOR PK 4e284d9ea4aeb9779bc0f22ffcc800c83a3643d826f324b1b2fad316e7fa3b39
// ETS ZORA CREATOR Public Key: 0xB8C76203036E02524143113fd554968f50E9bC05

// ZORA Wallet: 0x4De7c002bE724aD63d5dcA3f64126BbDDb9FD735

// CONFIGURATION - Set these values
const SIGNER_PRIVATE_KEY: Hex = "0x675df744cc7955dd881fa75dde7f06e9e63dfdfab23814606eec2242c17917b5"; // Current owner's private key
const COIN_ADDRESS: Address = "0x3d452fe44153260f84ed310083438ac992292a92"; // Replace with actual coin address
const OWNERS_TO_REMOVE: Address[] = ["0xB8C76203036E02524143113fd554968f50E9bC05"]; // Addresses to remove as owners

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
    name: "removeOwners",
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

async function removeOwners() {
  console.log("🔧 Remove Owners Utility");
  console.log("========================");
  console.log(`Coin Address: ${COIN_ADDRESS}`);
  console.log("Owners to Remove:");
  OWNERS_TO_REMOVE.forEach((addr, i) => {
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

    // Check ownership status and validate removal
    console.log("🔍 Checking ownership status:");
    const notOwners: Address[] = [];
    const validRemovals: Address[] = [];

    for (const address of OWNERS_TO_REMOVE) {
      const isCurrentlyOwner = await publicClient.readContract({
        address: COIN_ADDRESS,
        abi: ZORA_COIN_ABI,
        functionName: "isOwner",
        args: [address],
      });

      if (!isCurrentlyOwner) {
        console.log(`  ❌ ${address} - Not currently an owner`);
        notOwners.push(address);
      } else {
        console.log(`  ✅ ${address} - Will be removed`);
        validRemovals.push(address);
      }
    }

    if (validRemovals.length === 0) {
      console.log("⚠️  No valid owners to remove!");
      console.log("No action needed.");
      return;
    }

    // Check if this would remove too many owners
    const remainingOwners = ownersBefore.length - validRemovals.length;
    if (remainingOwners < 1) {
      console.log("⚠️  Warning: Cannot remove all owners!");
      console.log(`Current owners: ${ownersBefore.length}, trying to remove: ${validRemovals.length}`);
      console.log("At least one owner must remain.");
      return;
    }

    console.log(`📊 Summary: Removing ${validRemovals.length} owner(s), skipping ${notOwners.length} non-owner(s)`);
    console.log(`Remaining owners after removal: ${remainingOwners}`);
    console.log();

    // Send removeOwners transaction
    console.log("📤 Sending removeOwners transaction...");
    console.log(`Removing addresses: ${validRemovals.join(", ")}`);
    const hash = await walletClient.writeContract({
      address: COIN_ADDRESS,
      abi: ZORA_COIN_ABI,
      functionName: "removeOwners",
      args: [validRemovals],
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

    console.log(`✅ ${validRemovals.length} owner(s) successfully removed!`);
  } catch (error) {
    console.error("❌ Error removing owners:", error);
    process.exit(1);
  }
}

// Run the function
removeOwners().catch(console.error);
