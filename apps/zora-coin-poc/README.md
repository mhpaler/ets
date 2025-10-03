# Zora Coin Deployment Testing

Testing ground for programmatic Zora content coin creation on Base.

## Project Organization

### Current Work (Direct Factory Approach)
**For ETS Temporal Processor integration:**

```
src/
└── deploy-direct-factory.ts    ✨ NEW - Simple, direct factory deployment
DIRECT-DEPLOYMENT-GUIDE.md      ✨ NEW - Complete integration guide
.env.example                     ✨ Simplified for HD wallet approach
```

**Key Features:**
- ✅ Direct Zora factory calls (no Account Abstraction)
- ✅ HD Wallet Position 3 (ETSZora account)
- ✅ Deterministic salts via `keccak256(machineName)`
- ✅ Works on Base Sepolia and Base Mainnet
- ✅ Dry-run mode for safe testing

**Quick Start:**
```bash
# Setup environment
cp .env.example .env
# Edit .env with STAGING_MNEMONIC and ALCHEMY_API_KEY

# Test on Base Sepolia (dry-run)
export STAGING_MNEMONIC="your mnemonic here"
bun src/deploy-direct-factory.ts --testnet --dry-run

# Real deployment (requires funded ETSZora account)
bun src/deploy-direct-factory.ts --testnet
```

See **`DIRECT-DEPLOYMENT-GUIDE.md`** for complete details.

---

### Reference Material (Account Abstraction POC)
**Original exploration - kept for reference:**

```
poc-reference/
├── src/                         📚 Old POC scripts using AA
├── *.md                         📚 Research notes & documentation
└── .env.example                 📚 Smart wallet configuration
```

The original POC explored ERC-4337 Account Abstraction with Coinbase Smart Wallets. While functional, it's **too complex for backend services**. This approach is better suited for user-facing applications.

See **`poc-reference/README.md`** for details on what's preserved and why.

---

## Key Insights

### ✅ What Works for ETS
**Direct Factory Pattern** (`src/deploy-direct-factory.ts`)
- Simple HD wallet signing (Position 3: ETSZora)
- Direct `writeContract()` to Zora factory
- Deterministic addresses via salt
- No external dependencies beyond RPC

### ❌ What's Overkill for ETS
**Account Abstraction Pattern** (`poc-reference/`)
- Requires smart wallet deployment
- Needs Alchemy bundler service
- Complex UserOperation signing
- Designed for end-user wallets, not automation

### 🎯 Critical Discovery
**Wrong factory address in original POC:**
- ❌ Old: `0x8D47bA07Ff9ccCCF58c7E8810eE42c0Dc8B8b123`
- ✅ Real: `0x777777751622c0d3258f214F9DF38E35BF45baF3` (CREATE2, same on all chains)

---

## Testing Scripts

### Current (Direct Factory)
```bash
# Base Sepolia dry-run
bun src/deploy-direct-factory.ts --testnet --dry-run

# Base Sepolia real deployment
bun src/deploy-direct-factory.ts --testnet

# Base Mainnet dry-run
bun src/deploy-direct-factory.ts --dry-run

# Base Mainnet real deployment
bun src/deploy-direct-factory.ts
```

### Reference (Account Abstraction)
See `poc-reference/README.md` for POC testing instructions.

---

## Next Steps for ETS Integration

1. **Fund ETSZora account** on Base Sepolia
   - Address: `0x04A4B2737546F5402021fA3F7A104a6542bBFa78`
   - Get testnet ETH from [Base Faucet](https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet)

2. **Test direct deployment**
   ```bash
   export STAGING_MNEMONIC="three toddler enjoy good finish there bracket home machine habit hat useful"
   bun src/deploy-direct-factory.ts --testnet
   ```

3. **Update Temporal Processor**
   - Apply direct factory pattern to `apps/temporal-processor/src/activities/tagCoinActivities.ts`
   - See `DIRECT-DEPLOYMENT-GUIDE.md` for integration details

4. **E2E testing**
   - Test TAG coin creation via Temporal workflow
   - Verify deterministic addresses
   - Validate Zora profile attribution

---

## Documentation

- **`DIRECT-DEPLOYMENT-GUIDE.md`** - Complete guide for ETS integration
- **`poc-reference/README.md`** - Background on AA exploration
- **`poc-reference/CONTENT-COIN-POC.md`** - Original POC documentation
- **`poc-reference/ZORA-RESEARCH.md`** - Zora protocol research notes

---

## Resources

- **Zora Factory Contract**: `0x777777751622c0d3258f214F9DF38E35BF45baF3`
- **Base Sepolia Explorer**: https://sepolia.basescan.org
- **Base Mainnet Explorer**: https://basescan.org
- **HD Wallet Strategy**: `../../docs/deployment/KEY-MANAGEMENT-STRATEGY.md`
