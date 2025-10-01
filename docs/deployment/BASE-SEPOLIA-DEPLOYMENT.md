# Base Sepolia Deployment Guide

## Overview

This guide walks through deploying the ETS stack to Base Sepolia testnet for staging/testing purposes. The deployment uses a **task queue switching strategy** to control whether events are processed locally (for debugging) or in the cloud (for staging).

### Current Deployment Status (October 1, 2025)

✅ **Contracts Successfully Deployed to Base Sepolia:**
- ETSAccessControls: `0xd68e3740d8722a4Dc42a66c9D35b2b78e43c90B2`
- ETSAccessControlsProxy: `0x2e1C43375F5533eF69f0D3eD66D3FBf70B607141`
- ETSToken: `0x8551e70584563896C2D7169921CAE350cA368f96`
- ETSTokenProxy: `0xDB1Be3FC9BbD6697920A91AF43df1b7ec898AA86`
- ETSTarget: `0xfD8DAd58e5F90E9bcd5aA325c2743EDE6D76e029`
- ETSTargetProxy: `0xEE0DB62a1Fde98da844A6603c71f01a854BC8523`
- ETSCore: `0x765C8D1af499627033264d54883c87CB1f3012e7`
- ETSCoreProxy: `0xe7f89C005241C86BeC6c7804C9927a14eaFc6cA0`
- ETSChannelFactory: `0x23a20DF2666c0255C5839316004B36c5df1e4101`
- MockZoraFactory: `0x1409567aABDeB09D0ee9B7B0eB0F10038B5a6f93` (unexpected)

## Prerequisites

- Node.js v22 for deployment (Hardhat 3 requirement), v20.19.4 for other operations
- pnpm v10.14.0
- Access to Base Sepolia testnet ETH for gas
- Alchemy API key for Base Sepolia RPC
- (Optional) Temporal Cloud account for cloud processing

## Configuration Approach

This guide uses a **single `.env` file per package** approach:

- Each package (`contracts`, `ets-cli`, `temporal-processor`) has its own `.env` file
- Environment-specific variables are prefixed (`LOCAL_`, `STAGING_`, `PRODUCTION_`)
- Tools automatically select the right variables based on flags (`--network baseSepolia`)

## Architecture

```text
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   ETS CLI       │────▶│  Base Sepolia    │────▶│ Temporal Queue  │
│  (Your Machine) │     │   (Chain 84532)  │     │   (Local/Cloud) │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                               │                         │
                               ▼                         ▼
                        ┌──────────────┐         ┌──────────────┐
                        │ TagCreated   │         │   Worker     │
                        │   Events     │────────▶│ (Local/Cloud)│
                        └──────────────┘         └──────────────┘
```

## Step 1: Deploy Contracts to Base Sepolia

### 1.1 Configure Environment

```bash
cd packages/contracts

# Add Base Sepolia configuration to your .env file
# (Keep your existing LOCAL_MNEMONIC and other settings)
cat >> .env << EOF

# Staging (Base Sepolia)
STAGING_MNEMONIC="your twelve word mnemonic phrase goes here for staging"
BASE_SEPOLIA_RPC_URL="https://base-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_KEY"
BASESCAN_API_KEY="your-basescan-api-key"
EOF
```

**Note about deployment**: The `deploy.ts` script will:
- Create network-specific parameters in `ignition/parameters/baseSepolia.json`
- Deploy all core contracts in sequence
- Automatically verify on BaseScan if API key is provided

Note: The `.env` file supports multiple environments. Hardhat automatically uses the correct variables based on the `--network` flag:

- `--network localhost` uses `LOCAL_MNEMONIC`
- `--network baseSepolia` uses `STAGING_MNEMONIC` and `BASE_SEPOLIA_RPC_URL`
- `--network base` uses `PRODUCTION_MNEMONIC` and `BASE_MAINNET_RPC_URL`

### 1.2 Deploy Contracts

```bash
# Ensure you have Node.js 22 for Hardhat 3
nvm use 22

# Deploy all contracts to Base Sepolia (staging)
pnpm deploy:staging

# This script (deploy.ts) automatically:
# 1. Generates parameters file at ignition/parameters/baseSepolia.json
# 2. Deploys contracts in sequence:
#    - ETSAccessControls (with proxy)
#    - ETSToken (with proxy)
#    - ETSTarget (with proxy)
#    - ETSCore (with proxy)
#    - ETSChannelFactory (no proxy)
# 3. Saves deployment addresses to ignition/deployments/chain-84532/deployed_addresses.json
# 4. Attempts to verify contracts on BaseScan (if BASESCAN_API_KEY is set)
#
# Note: MockZoraFactory is NOT deployed (localhost only)
# Note: Configuration is NOT automatic for Base Sepolia (must run manually)
```

### 1.3 Configure Contracts Post-Deployment

```bash
# Configuration is NOT automatic for Base Sepolia (only for localhost)
# You must run this manually to set up roles and channels:
HARDHAT_NETWORK=baseSepolia bash -c "source ~/.nvm/nvm.sh && nvm use 22 && npx hardhat run scripts/configure-ets.ts --network baseSepolia"

# Note: The configure script expects proper initial role setup. If it fails with
# "AccessControl: account is missing role", you may need to manually grant roles
# using the CLI or a custom script that handles initial admin setup.

# This script will attempt to:
# 1. Grant roles to accounts derived from your STAGING_MNEMONIC:
#    - DEFAULT_ADMIN_ROLE to ETSPlatform
#    - CHANNEL_ADMIN_ROLE to ETSAdmin and ETSPlatform
#    - EVENT_PROCESSOR_ROLE to ETSPlatform and ETSEventProcessor
#    - SMART_CONTRACT_ROLE to ETSAdmin
#    - CHANNEL_FACTORY_ROLE to the ChannelFactory contract
# 2. Link contracts (set ETS Core on Token contract)
# 3. Create the default ETSChannel
```

### 1.4 Verify Deployment

```bash
# Test with CLI
cd ../../packages/ets-cli

# Add to your CLI .env file (or create if it doesn't exist)
cat >> .env << EOF
# Use private key from position 6 of your staging mnemonic
PRIVATE_KEY=your_private_key_from_mnemonic_position_6
RPC_URL_BASESEPOLIA=https://base-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_KEY
EOF

# Test contract interaction
pnpm ets info --network baseSepolia
```

## Step 2: Configure Temporal Processor

### 2.1 Local Processing Setup (Development/Debugging)

For testing and debugging, run the Temporal Processor locally to process Base Sepolia events:

```bash
cd apps/temporal-processor

# Configure for local processing of Base Sepolia events
# Update your .env file with these settings:
cat > .env << EOF
# Environment
NODE_ENV=staging
LOG_LEVEL=info

# Base Sepolia Configuration
CHAIN_ID=84532
RPC_URL=https://base-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_KEY
ALCHEMY_API_KEY=YOUR_ALCHEMY_KEY

# Temporal Configuration (Local Processing)
TEMPORAL_SERVER_URL=localhost:7233
TEMPORAL_NAMESPACE=default
TEMPORAL_TASK_QUEUE=ets-workflows-local-staging
TEMPORAL_WORKER_ID=ets-worker-local-staging

# Private Keys (from mnemonic positions)
EVENT_PROCESSOR_PRIVATE_KEY=0x... # Position 2 from staging mnemonic
ZORA_PRIVATE_KEY=0x...            # Position 3 from staging mnemonic

# Worker Configuration
MAX_CONCURRENT_ACTIVITIES=10
MAX_CONCURRENT_WORKFLOWS=100
EOF

# Start local Temporal infrastructure (if not running)
cd ../../
./scripts/start-temporal-infrastructure.sh

# Start the processor
cd apps/temporal-processor
pnpm dev
```

### 2.2 Cloud Processing Setup (Staging)

When ready to test cloud processing, update your configuration:

```bash
# Update .env for cloud processing
# Change these values in your existing .env:

# Temporal Configuration (Cloud Processing)
TEMPORAL_SERVER_URL=your-namespace.tmprl.cloud:7233
TEMPORAL_NAMESPACE=your-namespace.account-id
TEMPORAL_TASK_QUEUE=ets-workflows-cloud-staging  # Different queue name
TEMPORAL_CLIENT_CERT=base64_encoded_client_certificate
TEMPORAL_CLIENT_KEY=base64_encoded_client_private_key
TEMPORAL_WORKER_ID=ets-worker-cloud-staging

# Deploy to your cloud provider (e.g., Railway, Render, etc.)
# The cloud deployment will use the same .env configuration
```

**Note:** The key difference between local and cloud processing is:

- **Task Queue Name**: `ets-workflows-local-staging` vs `ets-workflows-cloud-staging`
- **Temporal Server**: `localhost:7233` vs `your-namespace.tmprl.cloud:7233`
- **Certificates**: Not needed locally, required for Temporal Cloud

## Step 3: Test TAG Creation

### 3.1 Local Processing Test

With local Temporal Processor running:

```bash
cd packages/ets-cli

# Create a test tag (processed by local machine)
pnpm ets tags create "#base-sepolia-test" --network baseSepolia

# Monitor logs in Temporal Processor terminal
# Check Temporal UI at http://localhost:8080
```

### 3.2 Switching Between Local and Cloud

To switch processing location:

**Local → Cloud:**

1. Stop local Temporal Processor (Ctrl+C)
2. Deploy/start cloud worker with `ets-workflows-cloud-staging` queue
3. New events will be processed by cloud

**Cloud → Local:**

1. Stop cloud worker
2. Start local processor with `ets-workflows-local-staging` queue
3. New events will be processed locally

### 3.3 Verify TAG Coin Creation

```bash
# Check TAG creation status
pnpm ets tags list --network baseSepolia

# View TAG metadata (once created)
pnpm ets tags get "#base-sepolia-test" --network baseSepolia
```

## Step 4: Monitoring and Debugging

### Local Debugging

When running locally, you have full control:

- Hot reload with code changes
- Direct log access
- Temporal UI at `http://localhost:8080`
- Can set breakpoints in VS Code

### Cloud Monitoring

For cloud deployments:

- Temporal Cloud UI for workflow visualization
- Cloud provider logs (Railway/Render/AWS CloudWatch)
- Checkpoint system ensures no missed events

## Environment-Specific Notes

### Task Queue Strategy

We use different task queues for different environments:

| Environment | Chain | Task Queue | Purpose |
|------------|-------|------------|---------|
| Local Dev | Hardhat (31337) | `ets-workflows` | Local development |
| Local Staging | Base Sepolia (84532) | `ets-workflows-local-staging` | Debug staging locally |
| Cloud Staging | Base Sepolia (84532) | `ets-workflows-cloud-staging` | Staging validation |
| Production | Base (8453) | `ets-workflows-prod` | Production processing |

### Private Key Derivation

From your staging mnemonic, derive keys for specific roles:

```javascript
// Position 0: ETSAdmin
// Position 1: ETSPlatform
// Position 2: ETSEventProcessor (EVENT_PROCESSOR_PRIVATE_KEY)
// Position 3: ETSZora (ZORA_PRIVATE_KEY)
// Position 4: ETSChannelAdmin
// Position 5: ETSChannel
// Position 6: CLIUser (for CLI operations)
```

## Known Issues from Initial Deployment

### Successfully Resolved

1. **Missing Airnode dependencies**: Removed vestigial Airnode contract files from `contracts/vendor/airnode/` and `contracts/mocks/MockAirnodeRrp.sol`

2. **Node.js version conflicts**: Hardhat 3 requires Node.js 22 - use `nvm use 22` before running commands

3. **Deployment confirmation prompts**: Modified deploy.ts to auto-confirm with `echo "y"` for non-localhost deployments

4. **MockZoraFactory deployment**: Unexpectedly deployed to Base Sepolia (intended for localhost only)

### Pending Resolution

1. **Role configuration**: The configure-ets.ts script may fail with "AccessControl: account is missing role" - initial admin setup may need manual intervention

## Troubleshooting

### Common Issues

**1. Events not being processed:**

- Check Temporal Server is running
- Verify correct task queue name
- Check RPC connection to Base Sepolia
- Review processor logs for errors

**2. TAG coins not deploying:**

- Verify Zora Factory address for Base Sepolia
- Check ZORA_PRIVATE_KEY has sufficient ETH
- Review Temporal workflow history in UI

**3. Contract interaction failures:**

- Ensure contracts are deployed to Base Sepolia
- Verify contract addresses in deployment files
- Check account has Base Sepolia ETH for gas

### Useful Commands

```bash
# Check deployment addresses
cat packages/contracts/ignition/deployments/chain-84532/deployed_addresses.json

# View Temporal Processor logs
tail -f logs/temporal-processor.log

# Check blockchain events
cast logs --chain base-sepolia --address <ETS_TOKEN_ADDRESS>

# Test RPC connection
cast client --rpc-url https://base-sepolia.g.alchemy.com/v2/YOUR_KEY
```

## Next Steps

Once Base Sepolia deployment is working:

1. **Performance Testing**: Load test with multiple TAG creations
2. **Cloud Deployment**: Deploy Temporal Processor to Railway/Render
3. **Production Prep**: Set up Base Mainnet configuration
4. **Monitoring**: Configure alerts and dashboards

## Security Considerations

⚠️ **For Staging/Production:**

- Never commit private keys or mnemonics
- Use secure key management (AWS KMS, HashiCorp Vault)
- Rotate keys regularly
- Monitor for suspicious activity
- Set up rate limiting on RPC endpoints
