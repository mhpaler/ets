# ETS Environment Configuration Guide

This document explains how ETS handles environment-aware configuration across its stack.

## Overview

ETS is **Base-only** - we are 100% committed to Base blockchain. However, our deployment strategy uses different environments:

- **Staging**: Base Sepolia testnet
- **Production**: Base Sepolia (until Base mainnet launch)
- **Localhost**: Local hardhat/anvil development

## Key Architecture Decision

Until Base mainnet launch, **both staging and production environments run on Base Sepolia** with different contract deployments. This allows us to test production workflows on testnet before mainnet deployment.

## Environment Configuration System

### Contract Addresses (`@ethereum-tag-service/contracts`)

Located in `/packages/contracts/src/contracts.ts`:

```typescript
export const etsTokenAddress = {
  31337: "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9",                    // Localhost
  84532: "0x72C3B6df276e082e352Ab1d23CBb329475ed93A8",                    // Base Sepolia (default)
  "84532_production": "0x72C3B6df276e082e352Ab1d23CBb329475ed93A8",       // Base Sepolia (production deployment)
  "84532_staging": "0x2F341353f562D53E76e018A0d529BF5cEf8bd4a9",          // Base Sepolia (staging deployment)
  "31337_localhost": "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9",        // Localhost
} as const;
```

**Key insight**: Different contract addresses on the **same chain** for different environments.

### Subgraph Endpoints (`@ethereum-tag-service/subgraph-endpoints`)

Located in `/packages/subgraph-endpoints/src/index.ts`:

```typescript
const subgraphEndpoints: Record<string, SubgraphEndpointMapping | string> = {
  baseSepolia_env: {
    production: "https://api.studio.thegraph.com/query/87165/ets-base-sepolia/version/latest",
    staging: "https://api.studio.thegraph.com/query/87165/ets-base-sepolia-staging/version/latest", 
    localhost: "http://localhost:8000/subgraphs/name/ets-local",
  },
};

export function getSubgraphEndpoint(chainId: number, environment: Environment = "production"): string
```

**Environment types**: `"production" | "staging" | "localhost"`

## Chain Configuration

### Supported Chains
- **84532**: Base Sepolia (primary testnet)
- **31337**: Localhost/Hardhat (development)

### Environment Resolution

```typescript
// Chain ID = 84532 (Base Sepolia)
environment = "staging"   → contracts: 0x2F34..., subgraph: ets-base-sepolia-staging
environment = "production" → contracts: 0x72C3..., subgraph: ets-base-sepolia
environment = "localhost"  → contracts: 0xCf7E..., subgraph: localhost:8000
```

## Usage in Applications

### Event Processor

```typescript
import { etsTokenAddress } from '@ethereum-tag-service/contracts';
import { getSubgraphEndpoint } from '@ethereum-tag-service/subgraph-endpoints';

const environment = process.env.NODE_ENV === 'production' ? 'production' : 'staging';
const chainId = 84532; // Base Sepolia

// Get environment-specific contract address
const contractAddress = etsTokenAddress[`${chainId}_${environment}`] || etsTokenAddress[chainId];

// Get environment-specific subgraph endpoint  
const subgraphUrl = getSubgraphEndpoint(chainId, environment);
```

### SDK Usage

```typescript
import { getAlchemyRpcUrlById } from '@ethereum-tag-service/contracts';

const rpcUrl = getAlchemyRpcUrlById("84532", process.env.ALCHEMY_API_KEY);
```

## Environment Variables

### Required Variables

```bash
# Environment designation
NODE_ENV=staging|production|development

# RPC Configuration
ALCHEMY_API_KEY=your_alchemy_key

# Application-specific
OFFCHAIN_API_URL=https://api-staging.ets.xyz  # or production URL
```

### Per-Service Configuration

**Event Processor**:
```bash
ETS_TOKEN_ADDRESS=  # Auto-resolved from environment
SUBGRAPH_URL=       # Auto-resolved from environment  
CHAIN_ID=84532      # Always Base Sepolia for now
```

## Deployment Strategy

### Current (Pre-Mainnet)
- **Staging**: Base Sepolia contracts set A + staging subgraph
- **Production**: Base Sepolia contracts set B + production subgraph

### Future (Post-Mainnet)
- **Staging**: Base Sepolia contracts + staging subgraph
- **Production**: Base mainnet contracts + production subgraph

## Benefits of This Architecture

1. **Environment Isolation**: Different contract deployments prevent staging/production cross-contamination
2. **Testnet Safety**: Production workflows tested on testnet before mainnet
3. **Smooth Migration**: Easy switch to mainnet when ready
4. **Configuration Simplicity**: Single chainId (84532) with environment-specific overrides

## Migration Considerations

When moving to Base mainnet:

1. Add chainId `8453` to configuration
2. Deploy contracts to Base mainnet
3. Update production environment to use mainnet
4. Keep staging on Base Sepolia

## Common Patterns

### Environment Detection
```typescript
const environment = process.env.NODE_ENV === 'production' ? 'production' : 'staging';
```

### Contract Address Resolution
```typescript
const getContractAddress = (contractAddresses: any, chainId: number, environment: string) => {
  const envKey = `${chainId}_${environment}`;
  return contractAddresses[envKey] || contractAddresses[chainId];
};
```

### RPC URL Generation
```typescript
const rpcUrl = `${getAlchemyRpcUrl(chainId.toString())}${alchemyApiKey}`;
```

This system provides flexibility for multi-environment deployment while maintaining the Base-only focus.