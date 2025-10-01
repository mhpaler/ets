# Base Sepolia Deployment Guide

## Overview

This guide walks through deploying the ETS stack to Base Sepolia testnet for staging/testing purposes. The deployment uses a **task queue switching strategy** to control whether events are processed locally (for debugging) or in the cloud (for staging).

## Prerequisites

- Node.js v20.19.4 (as specified in .nvmrc)
- pnpm v10.14.0
- Access to Base Sepolia testnet ETH for gas
- Alchemy API key for Base Sepolia RPC
- (Optional) Temporal Cloud account for cloud processing

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

# Create staging environment file
cat > .env.sepolia << EOF
# Base Sepolia Configuration
STAGING_MNEMONIC="your twelve word mnemonic phrase goes here for staging"
BASE_SEPOLIA_RPC_URL="https://base-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_KEY"
BASESCAN_API_KEY="your-basescan-api-key"
VERIFY_ON_DEPLOY=true
EOF
```

### 1.2 Deploy Contracts

```bash
# Ensure you have the correct Node version
nvm use

# Deploy to Base Sepolia
pnpm hardhat ignition deploy ignition/modules/ETSModule.ts --network baseSepolia

# Save the deployment addresses (will be in ignition/deployments/chain-84532/)
```

### 1.3 Configure Contracts Post-Deployment

```bash
# Run the configuration script to set up roles and channels
pnpm hardhat run scripts/configure-ets.ts --network baseSepolia
```

### 1.4 Verify Deployment

```bash
# Test with CLI
cd ../../packages/ets-cli

# Create .env for CLI
cat > .env.sepolia << EOF
PRIVATE_KEY=your_private_key_from_mnemonic_position_6
NETWORK=baseSepolia
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

# Create local-staging configuration
cat > .env.local-staging << EOF
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

# Start the processor with local configuration
cd apps/temporal-processor
cp .env.local-staging .env
pnpm dev
```

### 2.2 Cloud Processing Setup (Staging)

When ready to test cloud processing:

```bash
# Create cloud-staging configuration
cat > .env.cloud-staging << EOF
# Environment
NODE_ENV=staging
LOG_LEVEL=info

# Base Sepolia Configuration
CHAIN_ID=84532
RPC_URL=https://base-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_KEY
ALCHEMY_API_KEY=YOUR_ALCHEMY_KEY

# Temporal Configuration (Cloud Processing)
TEMPORAL_SERVER_URL=your-namespace.tmprl.cloud:7233
TEMPORAL_NAMESPACE=your-namespace.account-id
TEMPORAL_TASK_QUEUE=ets-workflows-cloud-staging
TEMPORAL_CLIENT_CERT=base64_encoded_client_certificate
TEMPORAL_CLIENT_KEY=base64_encoded_client_private_key
TEMPORAL_WORKER_ID=ets-worker-cloud-staging

# Private Keys (use secure key management in production)
EVENT_PROCESSOR_PRIVATE_KEY=0x... # Position 2 from staging mnemonic
ZORA_PRIVATE_KEY=0x...            # Position 3 from staging mnemonic

# Worker Configuration
MAX_CONCURRENT_ACTIVITIES=10
MAX_CONCURRENT_WORKFLOWS=100
EOF
```

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
