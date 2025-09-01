import { http, type Address, createPublicClient } from "viem";
import { base } from "viem/chains";

// Get coin address from command line argument
const coinAddress = process.argv[2];

if (!coinAddress) {
  console.log("❌ Error: Coin address is required");
  console.log("Usage: npx tsx apps/zora-coin-poc/src/list-owners.ts <coin-address>");
  console.log("Example: npx tsx apps/zora-coin-poc/src/list-owners.ts 0xfad9b8bf7df910f76d44562717becc5e0099c00c");
  process.exit(1);
}

// Validate address format (basic check)
if (!/^0x[a-fA-F0-9]{40}$/.test(coinAddress)) {
  console.log("❌ Error: Invalid address format");
  console.log("Address must be 42 characters starting with 0x");
  process.exit(1);
}

const COIN_ADDRESS: Address = coinAddress as Address;

// Zora Coin ABI - MultiOwnable + ERC20 functions
const ZORA_COIN_ABI = [
  {
    inputs: [],
    name: "owners",
    outputs: [{ internalType: "address[]", name: "", type: "address[]" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "account", type: "address" }],
    name: "isOwner",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "name",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "symbol",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalSupply",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "tokenURI",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "payoutRecipient",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

async function listOwners() {
  console.log("📋 List Owners Utility");
  console.log("=====================");
  console.log(`Coin Address: ${COIN_ADDRESS}`);
  console.log();

  const publicClient = createPublicClient({
    chain: base,
    transport: http(),
  });

  try {
    // Get coin metadata
    console.log("📊 Coin Information:");

    try {
      const name = await publicClient.readContract({
        address: COIN_ADDRESS,
        abi: ZORA_COIN_ABI,
        functionName: "name",
      });
      console.log(`  Name: ${name}`);
    } catch {
      console.log("  Name: [Unable to read]");
    }

    try {
      const symbol = await publicClient.readContract({
        address: COIN_ADDRESS,
        abi: ZORA_COIN_ABI,
        functionName: "symbol",
      });
      console.log(`  Symbol: ${symbol}`);
    } catch {
      console.log("  Symbol: [Unable to read]");
    }

    try {
      const totalSupply = await publicClient.readContract({
        address: COIN_ADDRESS,
        abi: ZORA_COIN_ABI,
        functionName: "totalSupply",
      });
      console.log(`  Total Supply: ${totalSupply.toString()}`);
    } catch {
      console.log("  Total Supply: [Unable to read]");
    }

    console.log();

    // Get current owners
    console.log("👥 Current Owners:");
    const owners = await publicClient.readContract({
      address: COIN_ADDRESS,
      abi: ZORA_COIN_ABI,
      functionName: "owners",
    });

    if (owners.length === 0) {
      console.log("  No owners found (this shouldn't happen!)");
    } else {
      owners.forEach((owner, i) => {
        console.log(`  [${i}] ${owner}`);

        // Highlight known addresses
        if (owner.toLowerCase() === "0x182e5583685615cc03bedcb575928eedf80e52de".toLowerCase()) {
          console.log("      ^ This is the ETS_EOA_PRIVATE_KEY address");
        } else if (owner.toLowerCase() === "0xb8c76203036e02524143113fd554968f50e9bc05".toLowerCase()) {
          console.log("      ^ This is the incorrect owner address");
        }
      });
    }

    console.log();
    console.log(`Total Owners: ${owners.length}`);
    console.log();

    // Try to get additional coin info
    try {
      const payoutRecipient = await publicClient.readContract({
        address: COIN_ADDRESS,
        abi: ZORA_COIN_ABI,
        functionName: "payoutRecipient",
      });
      console.log("💰 Payout Recipient:");
      console.log(`  ${payoutRecipient}`);
      console.log();
    } catch {
      // Ignore if not available
    }

    // Show Zora links
    console.log("🔗 View on Zora:");
    console.log(`  https://zora.co/collect/base:${COIN_ADDRESS}`);
    console.log(`  https://explorer.zora.energy/address/${COIN_ADDRESS}`);
  } catch (error) {
    console.error("❌ Error listing owners:", error);
    process.exit(1);
  }
}

// Run the function
listOwners().catch(console.error);
