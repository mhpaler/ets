# ETS Oracle Multi-Chain Deployment

This document provides instructions for deploying the ETS Oracle service to multiple chains using a single Airnode deployment.

## Implementation Checklist

### Core Implementation Tasks

- [x] Docker status checking in `deploy-staging-oracle.ts`
- [ ] Create chain configuration utility in `utils/chainConfig.ts`
- [ ] Update `staging.template.json` for multi-chain structure
- [ ] Modify `20-generate-staging-config.ts` to handle multiple chains
- [ ] Update `30-setup-staging-sponsorship.ts` to be chain-specific
- [ ] Update `40-configure-staging-requester.ts` to be chain-specific
- [ ] Ensure `50-deploy-staging-airnode.ts` works with multi-chain config
- [ ] Update `60-verify-staging-oracle.ts` to verify all chains
- [ ] Add multi-chain scripts to package.json

### Additional Tasks

- [ ] Add error handling for chain-specific issues
- [ ] Add chain parameter validation
- [ ] Create documentation for multi-chain operations

## Overview

The ETS Oracle service uses [API3's Airnode](https://docs.api3.org/reference/airnode/latest/) to provide decentralized oracle functionality. This implementation supports multiple EVM chains with a single Airnode deployment, simplifying management and reducing infrastructure costs.

## Supported Chains

The Oracle currently supports the following chains:

- Arbitrum Sepolia (Chain ID: 421614)
- Base Sepolia (Chain ID: 84532)

Additional chains can be added by updating the `chainConfig.ts` utility.

## Prerequisites

Before deploying:

1. Ensure all dependencies are installed:

   ``` zsh
   pnpm install
   ```

2. Configure AWS credentials in your environment:

   ``` zsh
   export AWS_ACCESS_KEY_ID=your_access_key
   export AWS_SECRET_ACCESS_KEY=your_secret_key
   export AWS_REGION=us-east-1
   ```

3. Set SPONSOR_PK environment variable (wallet with ETH on all chains):

   ``` zsh
   export SPONSOR_PK=your_private_key
   ```

4. Ensure contracts are deployed to all target chains:
   - ETSEnrichTarget
   - AirnodeRrpV0Proxy

## Deployment Commands

The Oracle scripts handle all chains internally without exposing chain-specific commands. Each operation is performed as "all or none" - affecting all configured chains.

``` zsh
# Deploy Oracle to all configured chains
pnpm run deploy-staging-oracle

# Verify Oracle is working correctly on all chains
pnpm run verify-staging-oracle

# Run test requests on all chains
pnpm run test-staging-oracle

# Remove Oracle deployment (affects all chains)
pnpm run remove-staging-oracle
```

For local development:

``` zsh
# Start local Oracle
pnpm run start-local-oracle

# Verify local Oracle
pnpm run verify-local-oracle
```

## Testing with Real Requests

To test the Oracle with real requests:

1. Set environment variables in `.env.staging`:

   ``` zsh
   TEST_TARGET_ID=<target_id>
   MAKE_TEST_REQUEST=true
   SPONSOR_PK=<private_key>
   ```

2. Run the test script:

   ```bash
   pnpm run test-staging-oracle
   ```

This will test Oracle requests on all configured chains.

## Adding New Chains

To add support for a new chain:

1. Update the `ORACLE_CHAIN_CONFIGS` in `apps/oracle/utils/chainConfig.ts`:

   ```typescript
   "new_chain_id": {
     chainId: "new_chain_id",
     name: "NewChainName",
     networkName: "newchainname",
     rpcUrl: process.env.NEW_CHAIN_URL || "https://rpc.example.com",
     rpcEnvKey: "NEW_CHAIN_URL",
     deploymentPath: "newChainStaging",
     providerName: "newChainProvider"
   }
   ```

2. Ensure contracts are deployed to the new chain

3. Redeploy the Oracle with the updated configuration:

   ```bash
   # First remove existing deployment
   pnpm run remove-staging-oracle

   # Then deploy with the new chain configuration
   pnpm run deploy-staging-oracle
   ```

This process updates all chains simultaneously.

## Architecture

- A single Airnode is deployed that listens to events from all supported chains
- Each chain has its own requester contract configuration
- The HTTP Gateway endpoint is shared across all chains
- The same Airnode wallet address is used for all chains, but separate sponsor wallets are used per chain

## Troubleshooting

- **Contract Not Found**: Ensure contracts are deployed to the correct staging path (check deploymentPath in chainConfig.ts)
- **HTTP Gateway Not Working**: Verify AWS deployment was successful
- **Sponsorship Issues**: Check that the sponsor wallet has enough ETH on each chain
- **RPC Issues**: Verify RPC URLs are correct and accessible in environment variables

## Implementation Details

- `chainConfig.ts`: Centralized configuration for all supported chains
- `20-generate-staging-config.ts`: Creates a multi-chain config.json with all chains in the "chains" array
- `30-setup-staging-sponsorship.ts`: Sets up sponsorship for all configured chains
- `40-configure-staging-requester.ts`: Configures requester contracts on all configured chains
- `50-deploy-staging-airnode.ts`: Deploys a single Airnode that supports all configured chains
- `60-verify-staging-oracle.ts`: Verifies oracle functionality on all configured chains
