# Zora Content Coin Creation POC

This proof of concept demonstrates programmatic creation of Zora content coins using Coinbase Smart Wallet dual-owner architecture through ERC-4337 Account Abstraction.

## Overview

The POC validates that creators can build their own tools, bots, or integrations to create content coins while maintaining their Zora identity and proper attribution to their creator profile.

### Key Discovery: Dual-Owner Smart Wallets

Zora smart wallets (Coinbase Smart Wallet implementation) have **two owners**:
- **Owner 0**: The Privy embedded wallet (controlled by social login)
- **Owner 1**: The creator's original EOA (external wallet)

Both owners can sign UserOperations to control the smart wallet through ERC-4337 Account Abstraction.

## Architecture

```
┌─────────────────┐
│   Creator EOA   │──────Controls──────┐
└─────────────────┘                    │
                                        ▼
                              ┌──────────────────┐      ┌─────────────────┐
                              │ Coinbase Smart   │─────▶│  Zora Factory   │
┌─────────────────┐          │    Wallet        │      │    Contract     │
│  Privy Wallet   │──────────│  (Zora Wallet)   │      └─────────────────┘
└─────────────────┘          └──────────────────┘               │
     Owner 0                                                    │
                                                                ▼
                                                      ┌──────────────┐
                                                      │ Content Coin │
                                                      │   Contract   │
                                                      └──────────────┘
```

## Setup

### 1. Environment Configuration

Copy the example environment file and fill in your details:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```bash
# Private Keys (NEVER COMMIT THIS FILE)
EOA_PRIVATE_KEY=0x... # Your EOA private key
PRIVY_PRIVATE_KEY=0x... # Exported from Privy

# RPC and API Keys
BASE_RPC_URL=https://base.llamarpc.com
ALCHEMY_API_KEY=your_alchemy_key # For future bundler integration

# Contract Addresses (Base Mainnet)
SMART_WALLET_ADDRESS=0x4de7c002be724ad63d5dca3f64126bbddb9fd735
ENTRY_POINT_ADDRESS=0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789
ZORA_FACTORY_ADDRESS=0x8D47bA07Ff9ccCCF58c7E8810eE42c0Dc8B8b123
```

### 2. Install Dependencies

From the ETS monorepo root:

```bash
pnpm install
```

## Usage

### Run Full Demo

Test both EOA and Privy signing:

```bash
cd apps/zora-coin-poc
pnpm dev
```

### Test Individual Components

Test EOA signing only:
```bash
pnpm test:eoa
```

Test Privy signing only:
```bash
pnpm test:privy
```

Test complete flow with metadata generation:
```bash
# Requires offchain-api to be running
cd ../offchain-api && pnpm dev  # In separate terminal
cd ../zora-coin-poc && pnpm test:metadata
```

## Current Implementation Status

### ✅ Completed
- [x] TypeScript project structure
- [x] Viem-based Account Abstraction integration
- [x] UserOperation creation for coin deployment
- [x] Dual-owner signing (EOA + Privy)
- [x] Zora Factory contract interface
- [x] Smart wallet execute call wrapping
- [x] Gas estimation and fee calculation
- [x] **Zora metadata generation via ETS offchain-api**
- [x] **Integration with existing ETS metadata service**
- [x] **Complete end-to-end workflow with real metadata URIs**

### 🚧 Next Steps (Not in POC Scope)
- [ ] Extract `poolConfig` from existing content coin
- [ ] Bundler integration (Alchemy/Pimlico/Stackup)
- [ ] Real coin deployment and validation
- [ ] Attribution verification on Zora profile
- [ ] Error handling for bundler failures
- [ ] Production gas optimization

## Technical Details

### UserOperation Flow

1. **Build UserOperation**: Create a UserOp that calls Zora Factory's `deploy()` function via the smart wallet's `execute()` function
2. **Sign**: Sign the UserOp with either the EOA or Privy private key
3. **Submit**: Send signed UserOp to bundler service (future step)
4. **Execute**: Bundler → Entry Point → Smart Wallet → Zora Factory → New Content Coin

### Smart Wallet Integration

The smart wallet acts as a proxy that:
- Validates signatures from either owner (EOA or Privy)
- Executes the coin deployment transaction
- Ensures `msg.sender` is the smart wallet for proper Zora attribution

### Viem Account Abstraction

Uses Viem's built-in AA support instead of external SDKs:
- Clean TypeScript types
- Native UserOperation handling  
- Integrated gas estimation
- Simplified signing workflow

## Files Structure

```
src/
├── config.ts              # Environment and configuration management
├── types.ts               # TypeScript type definitions
├── smartWalletClient.ts   # Core smart wallet and UserOp logic
├── main.ts                # Main demo script
├── test-eoa-signer.ts     # EOA signing test
└── test-privy-signer.ts   # Privy signing test
```

## Expected Outcome

After running this POC successfully, you should be able to:

- ✅ Create UserOperations programmatically
- ✅ Sign with either EOA or Privy wallet
- 🚀 **Next**: Submit through bundler to create real content coins
- 🚀 **Next**: Verify proper attribution in Zora creator profile

This unlocks the ability to create a programmatic layer on top of Zora's creator economy while maintaining the identity and attribution system that makes creator profiles valuable.

## Integration with ETS

This POC validates the complete approach that ETS will use when TagCreated events fire from the Temporal processor:

1. **Tag Created** → ETS Core emits TagCreated event
2. **Temporal Workflow** → Detects event, triggers coin creation workflow
3. **Metadata Generation** → Calls offchain-api to generate Zora-compatible metadata with IPFS URIs
4. **Smart Wallet UserOp** → Creates UserOperation with generated metadata URI
5. **Dual Signing** → Signs with either EOA or Privy wallet for flexibility
6. **Bundler Submission** → Submits to AA bundler for execution
7. **Zora Attribution** → Coin appears in creator's profile with proper attribution

### Key Architecture Benefits

- **Real Metadata**: Uses ETS's existing Zora metadata service with proper IPFS uploads
- **Dual-Owner Flexibility**: ETS can use either creator's EOA or manage Privy keys for automation
- **ETS Branding**: Generated coins have ETS properties and consistent visual identity
- **Production Ready**: Leverages existing ETS infrastructure (offchain-api) instead of rebuilding