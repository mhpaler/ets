# Direct Zora Factory Deployment Guide

## Overview

This guide explains the **simple, direct approach** to Zora coin creation that ETS Temporal Processor should use. It's much simpler than the Account Abstraction POC scripts.

## Key Differences: POC vs Temporal Processor

### POC (Account Abstraction - Complex)
```typescript
// Complex: Requires smart wallet, bundler, UserOperations
const account = await toCoinbaseSmartAccount({ owners: [owner] });
const bundlerClient = createBundlerClient({ ... });
const userOp = await prepareUserOperation({ ... });
const hash = await sendUserOperation(bundlerClient, userOp);
```

**Requirements:**
- Coinbase Smart Wallet deployed on-chain
- Two wallet owners (EOA + Privy)
- Alchemy bundler service
- ERC-4337 EntryPoint contract
- Complex signature schemes

### Temporal Processor (Direct Factory - Simple)
```typescript
// Simple: Direct wallet signing + factory call
const zoraAccount = mnemonicToAccount(mnemonic, { accountIndex: 3 });
const walletClient = createWalletClient({ account: zoraAccount });
const hash = await walletClient.writeContract({
  address: ZORA_FACTORY,
  abi: ZORA_FACTORY_ABI,
  functionName: "deploy",
  args: [/* coin params */]
});
```

**Requirements:**
- HD Wallet Position 3 (ETSZora)
- Funded with ETH for gas
- Direct RPC access

## Critical Discovery

### ❌ Wrong Factory Address in POC
The POC `.env.example` had incorrect address:
```
ZORA_FACTORY_ADDRESS=0x8D47bA07Ff9ccCCF58c7E8810eE42c0Dc8B8b123  # ❌ WRONG
```

### ✅ Real Zora Factory (Fixed)
```
ZORA_FACTORY_ADDRESS=0x777777751622c0d3258f214F9DF38E35BF45baF3  # ✅ CORRECT
```

**Important**: This is deployed via CREATE2, so it's the **same address on all chains**:
- Base Mainnet: `0x777777751622c0d3258f214F9DF38E35BF45baF3`
- Base Sepolia: `0x777777751622c0d3258f214F9DF38E35BF45baF3`
- Any future chain: Same address!

## HD Wallet Positions

ETS uses deterministic account derivation:

```
Position 0: ETSAdmin          → System admin operations
Position 1: ETSPlatform       → Platform operations, fee collection
Position 2: ETSEventProcessor → Temporal workflow callbacks
Position 3: ETSZora           → Zora coin creation ← USE THIS!
```

### Deriving ETSZora Account

**Base Sepolia (Staging):**
```typescript
import { mnemonicToAccount } from "viem/accounts";

const zoraAccount = mnemonicToAccount(process.env.STAGING_MNEMONIC, {
  accountIndex: 3,  // Position 3
  addressIndex: 0
});
```

**Base Mainnet (Production):**
```typescript
const zoraAccount = mnemonicToAccount(process.env.PRODUCTION_MNEMONIC, {
  accountIndex: 3,
  addressIndex: 0
});
```

**Current Addresses:**
- Staging ETSZora: `0x04A4B2737546F5402021fA3F7A104a6542bBFa78` (needs funding!)
- Production ETSZora: TBD (derive from PRODUCTION_MNEMONIC)

## Deterministic Salt Strategy

**Critical**: The salt MUST be deterministic based on the tag's machine name for predictable addresses.

```typescript
import { keccak256, toBytes } from "viem";

// Machine name from tag (e.g., "cats", "web3", "ets")
const machineName = tag.machineName;

// Deterministic salt
const coinSalt = keccak256(toBytes(machineName));
```

This matches ETS contract's `computeCoinAddress()` function, ensuring:
1. Same tag always produces same coin address
2. Address can be predicted before deployment
3. Prevents duplicate coin creation

## Zora Factory Deploy Function

The factory has a single `deploy()` function:

```solidity
function deploy(
    address payoutRecipient,    // Who receives payouts
    address[] owners,           // Owner addresses
    string uri,                 // Metadata URI
    string name,                // Coin name
    string symbol,              // Coin symbol
    bytes poolConfig,           // Uniswap V4 pool config
    address platformReferrer,   // Referrer for attribution
    address postDeployHook,     // Hook contract (0x0 for none)
    bytes postDeployHookData,   // Hook data (0x for none)
    bytes32 coinSalt            // Deterministic salt
) payable returns (address coin, bytes deployData)
```

### Parameter Details

**payoutRecipient**: Where coin sale proceeds go
- For ETS: `ETSZora` account (position 3)
- Same as coin creator for consistent attribution

**owners**: Array of addresses that can manage the coin
- For ETS: `[ETSZora]` (single owner)
- Multiple owners supported but unnecessary

**uri**: Metadata JSON URI
- Must follow Zora metadata schema
- Should be IPFS URI from ETS metadata service
- Example: `ipfs://QmXxx.../metadata.json`

**name**: Display name of the coin
- Format: `TAG: #tagString`
- Example: `TAG: #Cats`

**symbol**: Ticker symbol
- For ETS: Always `"TAG"`
- Consistent across all TAG coins

**poolConfig**: Uniswap V4 pool configuration
- `0x` for empty (default pool)
- OR specific config bytes for custom pools
- TODO: Extract from existing successful coin

**platformReferrer**: Attribution address
- For ETS: ETSPlatform account (position 1)
- Shows ETS as the platform in Zora UI
- OR `0x0` address for no referrer

**postDeployHook**: Optional hook contract
- For ETS: `0x0000000000000000000000000000000000000000`
- No post-deployment logic needed

**postDeployHookData**: Hook call data
- For ETS: `0x`
- Empty since no hook

**coinSalt**: CREATE2 salt for deterministic addresses
- MUST be `keccak256(machineName)`
- Critical for address prediction

## Testing the Direct Deployment Script

### 1. Dry Run on Base Sepolia (Test Network)

```bash
cd apps/zora-coin-poc

# Export mnemonic
export STAGING_MNEMONIC="three toddler enjoy good finish there bracket home machine habit hat useful"

# Dry run (no real transaction)
bun src/deploy-direct-factory.ts --testnet --dry-run
```

**Expected Output:**
```
🚀 Direct Zora Factory Deployment Test
   Chain: Base Sepolia (84532)
   Factory: 0x777777751622c0d3258f214F9DF38E35BF45baF3

🔑 ETSZora Account: 0x04A4B2737546F5402021fA3F7A104a6542bBFa78

💰 ETSZora Balance: 0.000000 ETH
⚠️  Low balance! May need funding.

📋 Coin Parameters:
   Machine Name: ets-test-1759444932741
   Coin Name: TAG: #ets-test-1759444932741
   Salt: 0xbfcc...ebb5a
   Owner: 0x04A4B2737546F5402021fA3F7A104a6542bBFa78

🧪 DRY RUN: Would call Zora factory with above parameters
✅ Parameters validated successfully
```

### 2. Fund ETSZora Account (If Needed)

The account needs ETH for gas. Check balance first:

```bash
# Check ETSZora balance on Base Sepolia
cast balance 0x04A4B2737546F5402021fA3F7A104a6542bBFa78 --rpc-url https://sepolia.base.org
```

If balance is low, fund it:
- Base Sepolia Faucet: https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet
- Or send from another funded account

### 3. Real Deployment on Base Sepolia

**⚠️ WARNING**: This will spend real testnet ETH!

```bash
export STAGING_MNEMONIC="three toddler enjoy good finish there bracket home machine habit hat useful"

# Real deployment (no --dry-run flag)
bun src/deploy-direct-factory.ts --testnet
```

**Expected Flow:**
1. ✅ Checks ETSZora balance
2. ✅ Generates coin parameters with deterministic salt
3. ✅ Simulates contract call to catch errors
4. ✅ Executes deployment transaction
5. ✅ Waits for confirmation
6. ✅ Returns deployed coin address

### 4. Production Deployment on Base Mainnet

**⚠️ CRITICAL**: This spends real ETH! Test on Sepolia first!

```bash
# Export production mnemonic
export PRODUCTION_MNEMONIC="always hobby dismiss alarm nation romance around spring rebel cereal olympic faculty"

# Dry run first
bun src/deploy-direct-factory.ts --dry-run

# Real deployment (only after thorough testing!)
bun src/deploy-direct-factory.ts
```

## Integrating into Temporal Processor

The `deploy-direct-factory.ts` script demonstrates the exact pattern needed for `tagCoinActivities.ts`.

### Current Issue in tagCoinActivities.ts

```typescript
// ❌ Problem: Hardcoded for localhost only
const chainConfig = config.blockchain.chainId === 31337 ? hardhat : localhost;

// ❌ Problem: Only uses MockZoraFactory
const factoryAddress = config.blockchain.contracts.mockZoraFactory;
```

### Required Fix

```typescript
import { baseSepolia, base } from "viem/chains";
import { mnemonicToAccount } from "viem/accounts";

// ✅ Solution: Support all chains
const getChainConfig = (chainId: number) => {
  switch (chainId) {
    case 31337: return localhost;
    case 84532: return baseSepolia;
    case 8453: return base;
    default: throw new Error(`Unsupported chain: ${chainId}`);
  }
};

// ✅ Solution: Environment-aware factory selection
const REAL_ZORA_FACTORY = "0x777777751622c0d3258f214F9DF38E35BF45baF3";
const factoryAddress = chainId === 31337
  ? config.blockchain.contracts.mockZoraFactory  // Localhost only
  : REAL_ZORA_FACTORY;                           // All real chains

// ✅ Solution: Use ETSZora account (position 3)
const getMnemonic = () => {
  if (chainId === 31337) return process.env.LOCAL_MNEMONIC;
  if (chainId === 84532) return process.env.STAGING_MNEMONIC;
  if (chainId === 8453) return process.env.PRODUCTION_MNEMONIC;
  throw new Error(`No mnemonic for chain ${chainId}`);
};

const zoraAccount = mnemonicToAccount(getMnemonic(), {
  accountIndex: 3,  // ETSZora position
  addressIndex: 0
});
```

## Next Steps

1. **✅ Fixed POC factory address** - Correct address in `.env.example`
2. **✅ Created direct deployment script** - Simple pattern without AA
3. **✅ Tested dry-run mode** - Validates parameters successfully
4. **⏳ Fund ETSZora account** - Send testnet ETH to `0x04A4B2737546F5402021fA3F7A104a6542bBFa78`
5. **⏳ Test real deployment on Sepolia** - Verify coin creation works
6. **⏳ Update tagCoinActivities.ts** - Apply direct factory pattern
7. **⏳ Test Temporal Processor** - E2E test of TAG coin creation
8. **⏳ Production deployment** - After thorough Sepolia testing

## Key Takeaways

1. **Don't use Account Abstraction for backend services** - It's designed for user wallets, not server automation
2. **The Zora factory address is universal** - Same on all chains via CREATE2
3. **Use HD Wallet Position 3** - Dedicated ETSZora account for coin creation
4. **Deterministic salts are critical** - `keccak256(machineName)` for predictable addresses
5. **Test on Sepolia first** - Always validate before mainnet deployment

## Resources

- **Direct Factory Script**: `src/deploy-direct-factory.ts`
- **Zora Factory Research**: `../../research/zora-protocol/packages/coins/`
- **HD Wallet Positions**: `../../docs/deployment/KEY-MANAGEMENT-STRATEGY.md`
- **Temporal Processor**: `../../apps/temporal-processor/src/activities/tagCoinActivities.ts`
