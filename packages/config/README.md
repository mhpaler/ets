# @ethereum-tag-service/config

> Unified configuration system for the ETS monorepo

## Overview

This internal package provides a single source of truth for all configuration across the ETS monorepo. It replaces scattered `.env` files with a unified, type-safe configuration system.

## Features

- 🔧 **Type-safe configuration** with TypeScript interfaces
- 🌍 **Three environments**: local, staging, production
- 🔄 **Automatic environment detection** from multiple sources
- 📦 **Contract address management** integrated with deployments
- ⚡ **Hierarchical configuration** with environment overrides
- ✅ **Validation** with Zod schemas
- 🔒 **Secure credential handling** with clear separation

## Installation

This is a private package available only within the monorepo:

```json
// In your package.json
"dependencies": {
  "@ethereum-tag-service/config": "workspace:*"
}
```

Then run `pnpm install` from the monorepo root.

## Basic Usage

```typescript
import { getEnvironment, getNetwork, getContracts } from "@ethereum-tag-service/config";

// Get current environment configuration
const env = getEnvironment();
console.log(env.displayName); // "Local Development"
console.log(env.network.chainId); // 31337

// Get network configuration
const network = getNetwork();
console.log(network.rpcUrl); // "http://localhost:8545"

// Get contract addresses
const contracts = await getContracts();
console.log(contracts.token); // "0x..."
```

## Environment Detection

The package automatically detects the environment from (in priority order):
1. `ENVIRONMENT` env variable
2. `NODE_ENV` env variable
3. `HARDHAT_NETWORK` env variable
4. `NETWORK` env variable
5. Defaults to `"local"`

### Environment Mappings

| Environment | Chain | Chain ID | Network Name |
|------------|-------|----------|--------------|
| `local` | Localhost | 31337 | localhost |
| `staging` | Base Sepolia | 84532 | baseSepolia |
| `production` | Base Mainnet | 8453 | base |

## Configuration Hierarchy

Configuration is loaded in this order (later overrides earlier):

1. **Default values** (in code)
2. **Root `.env`** (shared configuration)
3. **Environment-specific** (`.env.staging`, `.env.production`)
4. **Local overrides** (`.env.local` - gitignored)
5. **Runtime variables** (process.env)

## API Reference

### Core Functions

#### `getEnvironment(options?)`
Get the complete environment configuration.

```typescript
const env = getEnvironment();
// or with override
const env = getEnvironment({ environment: "staging" });
```

#### `getNetwork(options?)`
Get network configuration for the current environment.

```typescript
const network = getNetwork();
console.log(network.chainId); // 31337
```

#### `getContracts(options?)`
Get contract addresses for the current environment.

```typescript
const contracts = await getContracts();
console.log(contracts.token); // ETSToken address
```

#### `getTestConfig(options?)`
Get test-specific configuration.

```typescript
const testConfig = getTestConfig();
console.log(testConfig.timeouts.transaction); // 5000
```

### Validation

#### `validateEnvironment(env)`
Validate an environment configuration.

```typescript
import { validateEnvironment } from "@ethereum-tag-service/config";

const validation = validateEnvironment(env);
if (!validation.valid) {
  console.error(validation.errors);
}
```

#### `validateEnvVars(required)`
Check for required environment variables.

```typescript
import { validateEnvVars } from "@ethereum-tag-service/config";

const validation = validateEnvVars(["ALCHEMY_API_KEY", "MNEMONIC"]);
if (!validation.valid) {
  throw new Error(`Missing: ${validation.errors.join(", ")}`);
}
```

### Utility Functions

#### `logEnvironment(env?)`
Pretty-print environment configuration.

```typescript
import { logEnvironment } from "@ethereum-tag-service/config";
logEnvironment(); // Logs current environment
```

#### `isCI()`, `isDevelopment()`, `isProduction()`, `isTest()`
Check execution context.

```typescript
import { isCI, isDevelopment } from "@ethereum-tag-service/config";

if (isCI()) {
  // Running in CI environment
}
```

### Class Usage

For more control, use the `ETSConfig` class:

```typescript
import { ETSConfig } from "@ethereum-tag-service/config";

const config = ETSConfig.getInstance();

// Check feature flags
if (config.isFeatureEnabled("tagCoins")) {
  // TAG coins feature is enabled
}

// Log full configuration
config.logConfig();
```

## TypeScript Types

The package exports all configuration types:

```typescript
import type {
  Environment,
  EnvironmentName,
  NetworkConfig,
  ContractAddresses,
  ServiceConfig,
  TestConfig,
  WalletConfig
} from "@ethereum-tag-service/config";
```

## Testing

Different configurations for testing:

```typescript
// Unit tests (local)
const env = getEnvironment({ environment: "local" });

// Integration tests (staging)
const env = getEnvironment({ environment: "staging" });

// E2E tests (production read-only)
const env = getEnvironment({ environment: "production" });
```

## Migration Guide

### From scattered .env files:

**Before:**
```typescript
// In packages/temporal-processor
require('dotenv').config();
const chainId = process.env.CHAIN_ID;
const rpcUrl = process.env.RPC_URL;
```

**After:**
```typescript
import { getEnvironment } from "@ethereum-tag-service/config";

const env = getEnvironment();
const { chainId, rpcUrl } = env.network;
```

### From hardcoded values:

**Before:**
```typescript
const ALCHEMY_KEY = "TjjzoNYlIqWqZxcoufe60bhVbARhkxYX";
const rpcUrl = `https://base-sepolia.g.alchemy.com/v2/${ALCHEMY_KEY}`;
```

**After:**
```typescript
import { getNetwork } from "@ethereum-tag-service/config";

const network = getNetwork();
const rpcUrl = network.rpcUrl; // Already includes API key
```

### For contract addresses:

**Before:**
```typescript
import { getContractAddresses } from "@ethereum-tag-service/contracts/deployments";
const addresses = getContractAddresses("localhost");
```

**After:**
```typescript
import { getContracts } from "@ethereum-tag-service/config";

const contracts = await getContracts(); // Auto-detects environment
```

## Environment Variables

### Required Variables

Set these in your `.env.local` (gitignored):

```bash
# Wallet configuration
LOCAL_MNEMONIC="your localhost mnemonic phrase" # (optional, see below)
STAGING_MNEMONIC="your staging mnemonic phrase"
PRODUCTION_MNEMONIC="your production mnemonic"

# API Keys
ALCHEMY_API_KEY="your-alchemy-key"
EVENT_PROCESSOR_API_KEY="your-secret-key"
```

### Wallet Mnemonic Resolution

The wallet mnemonic comes from the config package, which for each environment looks for:

**Local Environment:**

1. `LOCAL_MNEMONIC` environment variable
2. Or the default test mnemonic: `"test test test test test test test test test test test junk"`

**Staging Environment:**

1. `STAGING_MNEMONIC` environment variable (required)

**Production Environment:**

1. `PRODUCTION_MNEMONIC` environment variable (required)

### Optional Overrides

```bash
# Override detected environment
ENVIRONMENT=staging

# Override RPC URLs
RPC_URL=http://localhost:8545
STAGING_RPC_URL=https://custom-rpc.example.com

# Temporal configuration
TEMPORAL_SERVER_URL=localhost:7233
TEMPORAL_CLOUD_URL=cloud.tmprl.cloud:7233
```

## Security Notes

⚠️ **IMPORTANT**:

- Never commit `.env.local` or any file with real credentials
- Production mnemonics should use secure key management
- API keys should be kept secret and rotated regularly
- Use read-only mode for production testing

## Development

```bash
# Build the package
cd packages/config
pnpm build

# Test usage
node test-basic.js

# Test with different environment
ENVIRONMENT=staging node test-basic.js
```

## Troubleshooting

### Environment not detected correctly

Check environment variables in priority order:

```bash
echo $ENVIRONMENT
echo $NODE_ENV
echo $HARDHAT_NETWORK
echo $NETWORK
```

### Contract addresses not loading

Ensure contracts are deployed:

```bash
cd packages/contracts
pnpm deploy:localhost
```

### Missing environment variables

Check validation:

```typescript
import { validateEnvVars } from "@ethereum-tag-service/config";

const result = validateEnvVars(["ALCHEMY_API_KEY"]);
console.log(result.errors); // Shows what's missing
```

## Support

This is an internal package for the ETS monorepo. For issues or questions, contact the ETS development team.

---

*Part of the [Ethereum Tag Service](https://ets.xyz) monorepo*