# ETS Environment Configuration - Ultra Simplified 🚀

## Quick Start

**For local development, you need ZERO configuration!**

```bash
./scripts/start-stack.sh
```

That's it! Everything runs with smart defaults.

## The One Script to Rule Them All

```bash
# Local development (default)
./scripts/start-stack.sh

# Against Base Sepolia testnet
./scripts/start-stack.sh --network staging

# Production monitoring
./scripts/start-stack.sh --network production --services temporal

# See all options
./scripts/start-stack.sh --help
```

## The One .env File

Copy `.env.template` to `.env` and add only what you need:

```bash
# For local dev: NOTHING needed!

# For staging (Base Sepolia):
ALCHEMY_API_KEY=your-key
STAGING_MNEMONIC="your twelve words..."

# For production (be careful!):
ALCHEMY_API_KEY=your-key
PRODUCTION_MNEMONIC="your twelve words..."
TEMPORAL_CLOUD_URL=your-instance.tmprl.cloud:7233
```

## Common Scenarios

### 🏠 Local Development
```bash
# Just run it - zero config needed
./scripts/start-stack.sh
```

### 🌐 Testing Against Base Sepolia
```bash
# Add to .env:
ALCHEMY_API_KEY=xxx
STAGING_MNEMONIC="xxx xxx xxx..."

# Run:
./scripts/start-stack.sh --network staging
```

### ☁️ Production Monitoring
```bash
# Add to .env:
TEMPORAL_CLOUD_URL=xxx
PRODUCTION_MNEMONIC="xxx xxx xxx..."

# Run:
./scripts/start-stack.sh --network production --services temporal
```

## Script Options

| Flag | Options | Description |
|------|---------|-------------|
| `--network` | local, staging, production | Which blockchain to connect to |
| `--services` | all, core, temporal | Which services to start |

### Networks
- **local**: Hardhat node (chain 31337)
- **staging**: Base Sepolia testnet (chain 84532)
- **production**: Base mainnet (chain 8453)

### Service Groups
- **all**: Full stack (Hardhat + Temporal + Explorer UI)
- **core**: Core services (Hardhat + Temporal)
- **temporal**: Just Temporal processor & worker

## How It Works

The magic happens through:
1. **One unified script** (`start-stack.sh`) that handles all scenarios
2. **Smart defaults** in the config package
3. **Hierarchical config loading** (defaults → .env → runtime flags)

The config package automatically:
- Detects your environment
- Sets appropriate RPC endpoints
- Configures Temporal task queues
- Manages wallet positions for different roles

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Cannot connect to blockchain" | Check ALCHEMY_API_KEY is set |
| "Transaction failed - insufficient funds" | Add testnet ETH to your staging wallet |
| "Temporal not connecting" | Run `./scripts/start-temporal-infrastructure.sh` |
| "Port already in use" | The script will offer to kill conflicting processes |

## That's It! 🎉

No more confusion with multiple .env files and scripts. Just:
1. Copy `.env.template` to `.env`
2. Add only what you need (often nothing!)
3. Run `./scripts/start-stack.sh` with appropriate flags

The system handles the rest with intelligent defaults.