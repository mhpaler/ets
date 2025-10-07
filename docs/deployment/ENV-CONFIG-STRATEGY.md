# Environment Configuration Strategy for ETS Monorepo

## Current State Analysis

### Problem Statement
The ETS monorepo currently has fragmented environment configuration with `.env` files scattered across multiple packages, leading to:
- **Configuration duplication** - RPC URLs, API keys repeated across packages
- **Module initialization issues** - dotenv loading timing problems
- **No type safety** - Runtime errors from missing/invalid env vars
- **Poor developer experience** - Unclear which env vars are needed where
- **Maintenance burden** - Updating configs across multiple files

### Current .env File Locations
```
Root Level:
├── .env                    # Root config (partial)
├── .env.sample            # Example template

Apps:
├── apps/temporal-processor/.env              # Local config
├── apps/temporal-processor/.env.basesepolia  # Staging config
├── apps/zora-coin-poc/.env                   # POC config

Packages:
├── packages/contracts/.env                   # Contract deployment
├── packages/ets-cli/.env                     # CLI config
```

### Identified Issues

1. **Duplicated Configuration**
   - RPC URLs defined in contracts, CLI, and temporal-processor
   - Mnemonics/private keys scattered across packages
   - Network configurations inconsistent

2. **Environment-Specific Confusion**
   - No clear separation of dev/staging/prod configs
   - Manual switching between environments error-prone
   - Different naming conventions (.env.basesepolia vs .env.staging)

3. **Security Concerns**
   - Secrets mixed with configuration
   - Some .env files accidentally committed
   - No clear distinction between public config and secrets

## Proposed Solution

### Phase 1: Immediate Improvements (Quick Wins)

#### 1.1 Standardize Environment Naming
```bash
# Consistent naming pattern
.env.localhost     # Local development (Hardhat)
.env.basesepolia   # Staging (Base Sepolia testnet)
.env.base          # Production (Base mainnet)
```

#### 1.2 Create Root-Level Environment Templates
```bash
# /Users/User/Sites/ets/.env.localhost
ENVIRONMENT=localhost
CHAIN_ID=31337
RPC_URL=http://localhost:8545
MNEMONIC="test test test test test test test test test test test junk"

# Temporal Configuration
TEMPORAL_ADDRESS=localhost:7233
TEMPORAL_NAMESPACE=default
TEMPORAL_TASK_QUEUE=ets-workflows-local

# Contract Addresses (auto-loaded from deployments)
# These are populated by deployment scripts
```

#### 1.3 Package-Specific Overrides
Each package can have a `.env.local` (gitignored) for developer-specific overrides:
```bash
packages/ets-cli/.env.local       # Personal CLI settings
apps/temporal-processor/.env.local # Local TP overrides
```

### Phase 2: Centralized Configuration Package (EPIC #540)

#### 2.1 Create @ethereum-tag-service/config Package
```typescript
// packages/config/src/index.ts
import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';

// Load environment-specific config
const environment = process.env.ENVIRONMENT || 'localhost';
dotenv.config({ path: path.resolve(process.cwd(), `.env.${environment}`) });

// Define schema with validation
const ConfigSchema = z.object({
  environment: z.enum(['localhost', 'basesepolia', 'base']),
  chainId: z.number(),
  rpcUrl: z.string().url(),
  mnemonic: z.string().optional(),
  temporal: z.object({
    address: z.string(),
    namespace: z.string(),
    taskQueue: z.string(),
  }),
  contracts: z.object({
    etsCore: z.string().optional(),
    etsToken: z.string().optional(),
    etsTarget: z.string().optional(),
  }),
});

export const config = ConfigSchema.parse({
  environment: process.env.ENVIRONMENT,
  chainId: parseInt(process.env.CHAIN_ID || '31337'),
  rpcUrl: process.env.RPC_URL,
  // ... etc
});
```

#### 2.2 Usage in Packages
```typescript
// packages/ets-cli/src/config.ts
import { config } from '@ethereum-tag-service/config';

// Type-safe access
const rpcUrl = config.rpcUrl;
const chainId = config.chainId;
```

### Phase 3: Migration Plan

#### Step 1: Audit Current Configurations
- [x] List all .env files
- [ ] Document all environment variables by package
- [ ] Identify duplicates and conflicts
- [ ] Map dependencies between packages

#### Step 2: Create Unified Templates
- [ ] Create .env.localhost template
- [ ] Create .env.basesepolia template
- [ ] Create .env.base template
- [ ] Document required vs optional variables

#### Step 3: Package Migration (One at a Time)
1. **contracts** - Simplest, mostly RPC and mnemonic
2. **ets-cli** - Depends on contracts config
3. **temporal-processor** - Most complex, multiple dependencies
4. **app** - Next.js specific requirements

#### Step 4: Documentation
- [ ] Update README with new config approach
- [ ] Create ENV-SETUP.md guide
- [ ] Add troubleshooting section
- [ ] Document migration for existing developers

## Implementation Checklist

### Immediate Actions (Today)
- [x] Document current state
- [x] Define strategy
- [ ] Create .env.localhost template
- [ ] Create .env.basesepolia template
- [ ] Update .gitignore patterns

### Short Term (This Week)
- [ ] Migrate contracts package
- [ ] Migrate ets-cli package
- [ ] Test localhost deployment flow
- [ ] Test basesepolia deployment flow

### Medium Term (Next Sprint)
- [ ] Create @ethereum-tag-service/config package
- [ ] Add type safety with Zod
- [ ] Migrate temporal-processor
- [ ] Update CI/CD pipelines

### Long Term
- [ ] Full migration to centralized config
- [ ] Remove all package-level .env files
- [ ] Implement secret management (AWS Secrets, etc.)
- [ ] Add config validation to build process

## Benefits of This Approach

1. **Single Source of Truth** - One place to configure each environment
2. **Type Safety** - Compile-time checking of env vars
3. **Better DX** - Clear errors when config is missing
4. **Easier Onboarding** - New devs only configure once
5. **Reduced Errors** - No more mismatched configs
6. **Security** - Clear separation of config vs secrets

## Example: Developer Setup After Migration

```bash
# 1. Clone repo
git clone https://github.com/ethereum-tag-service/ets

# 2. Install dependencies
pnpm install

# 3. Copy environment template
cp .env.localhost.example .env.localhost

# 4. (Optional) Add personal overrides
echo "ALCHEMY_API_KEY=your_key" >> .env.local

# 5. Start development
pnpm dev

# Everything just works! 🎉
```

## Environment Variables Reference

### Core Configuration
| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| ENVIRONMENT | Target environment | Yes | localhost, basesepolia, base |
| CHAIN_ID | Blockchain chain ID | Yes | 31337, 84532, 8453 |
| RPC_URL | JSON-RPC endpoint | Yes | http://localhost:8545 |
| MNEMONIC | HD wallet mnemonic | Yes* | test test... |

### Network-Specific RPC URLs
| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| LOCALHOST_RPC_URL | Local Hardhat node | No | http://localhost:8545 |
| BASESEPOLIA_RPC_URL | Base Sepolia testnet | No | https://base-sepolia.g.alchemy.com/v2/... |
| BASE_RPC_URL | Base mainnet | No | https://base.g.alchemy.com/v2/... |

### Temporal Configuration
| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| TEMPORAL_ADDRESS | Temporal server address | Yes | localhost:7233 |
| TEMPORAL_NAMESPACE | Temporal namespace | Yes | default |
| TEMPORAL_TASK_QUEUE | Task queue name | Yes | ets-workflows-local |

### API Keys & Secrets
| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| ALCHEMY_API_KEY | Alchemy API key | No* | TjjzoNYl... |
| EVENT_PROCESSOR_API_KEY | Event processor auth | Yes | secret123 |
| ETHERSCAN_API_KEY | Contract verification | No | ABC123... |

*Required for specific environments

## Migration Timeline

### Week 1 (Current)
- ✅ Document strategy
- ⏳ Create environment templates
- ⏳ Test with contracts package

### Week 2
- [ ] Migrate CLI and test e2e
- [ ] Update documentation
- [ ] Team review and feedback

### Week 3
- [ ] Create config package
- [ ] Add type safety
- [ ] Begin temporal-processor migration

### Week 4
- [ ] Complete migration
- [ ] Update CI/CD
- [ ] Team training

## Success Criteria

1. **No Duplicate Configs** - Each env var defined once
2. **Type Safety** - No runtime config errors
3. **Clear Hierarchy** - Root → Environment → Local overrides
4. **Easy Switching** - `ENVIRONMENT=basesepolia pnpm test`
5. **Secure Defaults** - Secrets never in templates
6. **Great DX** - New dev setup in < 5 minutes

## Related Issues

- **EPIC #540**: Environment Configuration Consolidation
- **#539.5**: Multi-Environment Configuration for Temporal Processor
- **#538**: Contracts Package Refactoring

## Notes

- This is a living document that will evolve as we implement
- Feedback welcome via GitHub issues or Slack
- Breaking changes will be communicated in advance
- Gradual migration to minimize disruption