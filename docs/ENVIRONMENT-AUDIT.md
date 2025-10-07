# Environment Configuration Audit - ETS Monorepo

> **Status**: Issue #540 - Environment Configuration Consolidation
> **Date**: 2025-10-06
> **Objective**: Document current state and plan unified configuration system

## Executive Summary

The ETS monorepo has **14 active .env files** across 5 packages with significant duplication and conflicts. This audit documents the current state and proposes a unified `@ethereum-tag-service/config` package to resolve these issues.

## Current State Analysis

### 1. Environment Files Distribution

```
Root Level:           1 file  (.env)
Contracts Package:    1 file  (.env)
CLI Package:         1 file  (.env)
Temporal Processor:   2 files (.env, .env.basesepolia)
Zora POC:            1 file  (.env)
Total:               6 active configuration files
```

### 2. Variable Duplication & Conflicts

#### RPC URLs (duplicated 4x)
- **Root .env**: Uses `NETWORK` and `NEXT_PUBLIC_ETS_ENVIRONMENT`
- **contracts/.env**: Uses `BASE_SEPOLIA_RPC_URL`, `BASE_MAINNET_RPC_URL`
- **ets-cli/.env**: Uses `RPC_URL_LOCALHOST`, `RPC_URL_BASESEPOLIA`, `RPC_URL_BASE`
- **temporal-processor/.env**: Uses `RPC_URL` (commented) and `ALCHEMY_API_KEY`

**Problem**: Same RPC endpoint defined 4 different ways with different variable names

#### Alchemy API Keys (duplicated 4x)
- **Root**: `NEXT_PUBLIC_ALCHEMY_KEY`
- **contracts**: Embedded in RPC URLs
- **ets-cli**: `ALCHEMY_API_KEY`
- **temporal-processor**: `ALCHEMY_API_KEY`

**Problem**: Same API key with different names, some exposed with `NEXT_PUBLIC_`

#### Network/Environment Names (3 different patterns)
- **Root**: `NETWORK=localhost`, `NEXT_PUBLIC_ETS_ENVIRONMENT=localhost`
- **ets-cli**: `NETWORK=baseSepolia`
- **temporal-processor**: `NODE_ENV=staging`, `CHAIN_ID=84532`
- **Tests**: `ENVIRONMENT` or `TEST_ENV`

**Problem**: No consistent way to specify environment

#### Mnemonics/Private Keys (security risk)
- **contracts/.env**: Contains production mnemonics (EXPOSED!)
- **ets-cli/.env**: Contains private keys (EXPOSED!)
- **temporal-processor/.env**: Contains mnemonic with HD position

**Critical Security Issue**: Production credentials in committed files

### 3. Package-Specific Variables

#### Root (.env)
```
Purpose: Next.js app and changesets
Variables:
- GITHUB_TOKEN (CI/CD)
- NETWORK, NEXT_PUBLIC_ETS_ENVIRONMENT (environment)
- NEXT_PUBLIC_ALCHEMY_KEY (blockchain)
- OZ Defender credentials (legacy)
- NEXT_PUBLIC_UNSPLASH_KEY (app feature)
```

#### contracts/.env
```
Purpose: Hardhat deployment
Variables:
- LOCAL_MNEMONIC, STAGING_MNEMONIC, PRODUCTION_MNEMONIC
- BASE_SEPOLIA_RPC_URL, BASE_MAINNET_RPC_URL
- BASESCAN_API_KEY, ARBISCAN_API_KEY
- VERIFY_ON_DEPLOY
```

#### ets-cli/.env
```
Purpose: CLI operations
Variables:
- PRIVATE_KEY (wallet)
- NETWORK (target network)
- RPC_URL_* (network endpoints)
- ALCHEMY_API_KEY
- DEBUG
```

#### temporal-processor/.env
```
Purpose: Event processing
Variables:
- NODE_ENV, LOG_LEVEL
- CHAIN_ID, ALCHEMY_API_KEY
- TEMPORAL_* (server, namespace, queue, worker)
- OFFCHAIN_API_URL, ARWEAVE_GATEWAY
- MNEMONIC, HD_WALLET_POSITION
- Worker configuration
```

## Pain Points Identified

### 1. **Developer Experience**
- Must update 4+ files to change RPC endpoint
- Confusion between NETWORK, NODE_ENV, ENVIRONMENT
- Module initialization errors from missing env vars
- No IDE autocomplete for env variables

### 2. **Security Issues**
- Production mnemonics in version control
- API keys exposed in multiple places
- No clear separation of secrets vs config
- NEXT_PUBLIC exposes keys to browser

### 3. **Testing Complexity**
- Tests use `process.env.ENVIRONMENT || "local"` everywhere
- Integration tests have own environment detection
- No shared test configuration utilities
- Timeouts and limits scattered across test files

### 4. **Operational Issues**
- No validation - errors only at runtime
- Cannot share configuration between packages
- Each package loads env independently
- No type safety on environment variables

## Proposed Solution: @ethereum-tag-service/config

### Package Structure
```
packages/config/
├── src/
│   ├── index.ts           # Main exports
│   ├── environments.ts    # Environment definitions
│   ├── networks.ts        # Network configurations
│   ├── contracts.ts       # Contract address orchestration
│   ├── services.ts        # External service URLs
│   ├── secrets.ts         # Secret validation (not values)
│   └── loader.ts          # Hierarchical env loading
├── schemas/              # Zod validation schemas
└── types/               # TypeScript definitions
```

### Configuration Hierarchy
```
1. Defaults (in code)
   ↓
2. Root .env (shared config)
   ↓
3. Network-specific (.env.staging, .env.production)
   ↓
4. Local overrides (.env.local - gitignored)
```

### Unified Environment Names
```typescript
type Environment = "local" | "staging" | "production"
// Maps to:
// local      → localhost (31337)
// staging    → Base Sepolia (84532)
// production → Base Mainnet (8453)
```

### Variable Consolidation Plan

#### Phase 1: Create Config Package
1. Build @ethereum-tag-service/config with types and validation
2. Create consolidated root .env.example
3. Add network-specific configs (.env.staging, .env.production)
4. Implement hierarchical loading

#### Phase 2: Migrate Packages (one at a time)
1. **contracts**: Use config for network detection
2. **ets-cli**: Replace custom env loading with config
3. **temporal-processor**: Use config for all settings
4. **tests**: Use config for environment detection
5. **app**: Migrate Next.js to use config

#### Phase 3: Security & Documentation
1. Remove all secrets from version control
2. Create .env.local.example for secrets template
3. Update all READMEs with new config approach
4. Add configuration guide to docs

## Implementation Checklist

- [ ] Create @ethereum-tag-service/config package
- [ ] Define TypeScript interfaces for all config
- [ ] Implement hierarchical env loading
- [ ] Add Zod schemas for validation
- [ ] Create migration guide for each package
- [ ] Remove duplicated env variables
- [ ] Secure all production credentials
- [ ] Update CI/CD for new structure
- [ ] Document configuration approach
- [ ] Test across all environments

## Benefits After Implementation

1. **Single source of truth** for all configuration
2. **Type-safe** environment access with autocomplete
3. **Validation** at startup (fail fast)
4. **Secure** credential management
5. **Simplified** testing with shared utilities
6. **Consistent** environment naming
7. **Reduced** configuration files (6 → 1 + overrides)
8. **Better** developer experience

## Next Steps

1. Review and approve this audit
2. Create @ethereum-tag-service/config package structure
3. Begin Phase 1 implementation
4. Migrate packages incrementally
5. Update documentation

## Risk Mitigation

- **Backward Compatibility**: Keep old .env files during migration
- **Gradual Migration**: Update one package at a time
- **Testing**: Comprehensive tests for each migration
- **Rollback Plan**: Git tags before each major change
- **Documentation**: Update as we go, not at the end

---

*This audit is part of Issue #540: Environment Configuration Consolidation*