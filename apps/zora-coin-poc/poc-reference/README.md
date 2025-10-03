# POC Reference - Account Abstraction Approach

This directory contains the **original Proof of Concept** code that explored creating Zora coins using ERC-4337 Account Abstraction with Coinbase Smart Wallets.

## ⚠️ This Approach is NOT Used for ETS

The Account Abstraction approach demonstrated here is:
- **Complex**: Requires smart wallet deployment, bundler services, UserOperations
- **User-Focused**: Designed for end-user wallets with social login
- **Overkill**: Too complex for backend service automation

**ETS Temporal Processor uses the simpler direct factory approach** instead (see `../DIRECT-DEPLOYMENT-GUIDE.md`).

## What's In Here

### Core POC Files
- `src/deploy-with-viem-aa.ts` - Viem's built-in AA implementation (cleanest)
- `src/deploy-real-coin.ts` - Original POC with custom clients
- `src/smartWalletClient.ts` - Smart wallet UserOp builder
- `src/bundlerClient.ts` - Alchemy bundler interaction

### Testing & Validation Scripts
- `src/deploy-simple-zora.ts` - Simplified version testing
- `src/deploy-test-attribution.ts` - Attribution validation
- `src/test-*.ts` - Various test scripts for metadata, signing, etc.

### Supporting Files
- `src/config.ts` - Configuration for smart wallet addresses
- `src/types.ts` - TypeScript definitions
- `src/metadataClient.ts` - ETS metadata API client
- `.env.example` - Environment configuration for AA approach

### Documentation
- `CONTENT-COIN-POC.md` - Original POC overview
- `TAG-COIN-CREATION-FLOW.md` - Flow diagrams and architecture
- `ZORA-RESEARCH.md` - Research notes on Zora protocol
- `ZORA-SERVICE-SEQUENCE.md` - Sequence diagrams

## Key Learnings

### 1. Dual-Owner Smart Wallets
Zora wallets (Coinbase Smart Wallet) have two owners:
- **Owner 0**: Privy embedded wallet (social login)
- **Owner 1**: Creator's original EOA

Both can sign UserOperations.

### 2. Account Abstraction Flow
```typescript
// Create smart account
const account = await toCoinbaseSmartAccount({ owners: [owner] });

// Create bundler client
const bundler = createBundlerClient({ ... });

// Prepare UserOperation
const userOp = await prepareUserOperation({ account, calls: [...] });

// Submit via bundler
const hash = await sendUserOperation(bundler, userOp);
```

### 3. Why We Moved Away
- **Backend services don't need AA** - It's designed for user wallets
- **Direct signing is simpler** - Just use HD wallet + viem
- **No bundler dependency** - One less external service
- **Lower gas costs** - No AA overhead

## Using These Files

If you want to explore the AA approach:

```bash
cd ../
export STAGING_MNEMONIC="..."
export ALCHEMY_API_KEY="..."

# Copy POC env file
cp poc-reference/.env.example .env
# Edit .env with smart wallet details

# Test with dry run
bun poc-reference/src/deploy-with-viem-aa.ts --dry-run --testnet
```

## Why Keep This?

This code remains valuable as:
1. **Reference** - Shows working AA implementation if needed
2. **Research** - Documents Zora smart wallet architecture
3. **Alternative** - Could be useful for user-facing tools
4. **History** - Preserves the exploration process

## For ETS Integration

**Don't use these files.** Instead, see:
- `../src/deploy-direct-factory.ts` - Simple direct factory approach
- `../DIRECT-DEPLOYMENT-GUIDE.md` - Integration guide for Temporal Processor
