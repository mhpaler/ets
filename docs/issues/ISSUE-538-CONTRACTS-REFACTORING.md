# ISSUE #538: Major Contracts Package Refactoring

## Summary
**Epic**: #528 TAG Coins Implementation  
**Priority**: CRITICAL - BLOCKS ALL DOWNSTREAM WORK  
**Status**: NOT_STARTED  
**Estimated Effort**: 1-2 weeks  
**Dependencies**: Must complete before any end-to-end testing or production deployment

## Problem Statement

The `packages/contracts` package is the foundation of the entire ETS system, but it currently uses outdated patterns that don't align with our new HD wallet key management strategy and operational architecture. All downstream services depend on contracts configuration, making this refactoring critical before proceeding with integration testing.

## Current State Issues

1. **Outdated Infrastructure**: Using Hardhat 2.x and ethers.js patterns
2. **Legacy Naming**: References to "Oracle" instead of "EventProcessor"
3. **Single Key Architecture**: Setup assumes single EOA instead of HD wallet roles
4. **JavaScript Deployments**: Deployment scripts in JS instead of TypeScript
5. **Ethers.js Dependencies**: All tooling uses ethers instead of viem

## High-Level Refactoring Goals

### 1. Infrastructure Modernization
- **Upgrade to Hardhat 3.0** with necessary plugin updates
- **Convert entire suite to viem** (deployments, tests, tasks)
- **TypeScript deployment scripts** for type safety and consistency

### 2. HD Wallet Integration
- **Mnemonic-based key derivation** per KEY-MANAGEMENT-STRATEGY.md
- **Role-based account assignment**:
  - Position 0: ETSAdmin (deployment + admin)
  - Position 1: ETSPlatform (platform operations)
  - Position 2: ETSEventProcessor (workflow callbacks)
  - Position 3: ETSZora (coin creation)

### 3. Operational Naming Alignment
- **Rename Oracle → EventProcessor** across all contracts and references
- **Update test setup** to reflect new role structure
- **Align deployment scripts** with operational naming conventions

## Detailed Refactoring Tasks

### SUB-538.1: Infrastructure Upgrade
```yaml
status: NOT_STARTED
priority: HIGH
completion: 0
estimated_duration: 2-3 days
```

**Deliverables:**
- [ ] Upgrade hardhat to 3.0.x with plugin compatibility audit
- [ ] Update all dependencies for Hardhat 3.0 compatibility  
- [ ] Migrate hardhat.config.js to hardhat.config.ts
- [ ] Update package.json scripts for new Hardhat patterns
- [ ] Validate all existing functionality works with upgraded stack

**Key Changes:**
- Research Hardhat 3.0 breaking changes and migration requirements
- Update @nomicfoundation plugin dependencies
- Ensure viem compatibility with new Hardhat version
- Test local development workflow after upgrade

### SUB-538.2: Viem Migration
```yaml
status: NOT_STARTED  
priority: HIGH
completion: 0
dependencies: ["SUB-538.1"]
estimated_duration: 3-4 days
```

**Deliverables:**
- [ ] Convert all test files from ethers to viem
- [ ] Update Hardhat tasks to use viem instead of ethers
- [ ] Migrate deployment scripts to viem patterns
- [ ] Update contract interaction utilities for viem
- [ ] Ensure all existing functionality preserved

**Key Areas:**
```typescript
// Before (ethers)
const signer = await ethers.getSigner(address)
const contract = await ethers.getContractAt("ETS", address)

// After (viem) 
const account = mnemonicToAccount(mnemonic, { addressIndex: 0 })
const contract = getContract({
  address,
  abi: ETSAbi,
  publicClient,
  walletClient
})
```

### SUB-538.3: HD Wallet Integration
```yaml
status: NOT_STARTED
priority: HIGH  
completion: 0
dependencies: ["SUB-538.2"]
estimated_duration: 3-4 days
```

**Deliverables:**
- [ ] Update deploy/utils/setup.js → setup.ts with HD wallet derivation
- [ ] Refactor test suite setup to use mnemonic-based accounts
- [ ] Update hardhat.config.ts for HD wallet account configuration
- [ ] Create environment-specific account derivation utilities
- [ ] Validate all role-based operations work correctly

**Configuration Changes:**
```typescript
// hardhat.config.ts - HD wallet integration
import { mnemonicToAccount } from 'viem/accounts'

const getMnemonic = (network: string): string => {
  if (network === 'localhost') return process.env.LOCAL_MNEMONIC || DEFAULT_MNEMONIC
  if (network === 'baseSepolia') return process.env.STAGING_MNEMONIC!
  if (network === 'base') return process.env.PRODUCTION_MNEMONIC!
  throw new Error(`Unsupported network: ${network}`)
}

// Derive accounts for each role
const getAccounts = (network: string) => {
  const mnemonic = getMnemonic(network)
  return {
    admin: mnemonicToAccount(mnemonic, { addressIndex: 0 }),
    platform: mnemonicToAccount(mnemonic, { addressIndex: 1 }),
    eventProcessor: mnemonicToAccount(mnemonic, { addressIndex: 2 }),
    zora: mnemonicToAccount(mnemonic, { addressIndex: 3 })
  }
}
```

### SUB-538.4: Oracle → EventProcessor Renaming
```yaml
status: NOT_STARTED
priority: HIGH
completion: 0  
dependencies: ["SUB-538.3"]
estimated_duration: 2-3 days
```

**Deliverables:**
- [ ] Rename all contract references from Oracle to EventProcessor
- [ ] Update deployment scripts with new naming convention
- [ ] Update test files to use EventProcessor terminology
- [ ] Update contract interfaces and events as needed
- [ ] Ensure no breaking changes to external integrations

**Key Files to Update:**
- `deploy/utils/setup.js` → `setup.ts`: `ETSOracle` → `ETSEventProcessor`
- All test files referencing Oracle role
- Contract deployment scripts
- Documentation and comments

### SUB-538.5: TypeScript Deployment Migration
```yaml
status: NOT_STARTED
priority: MEDIUM
completion: 0
dependencies: ["SUB-538.4"]  
estimated_duration: 2-3 days
```

**Deliverables:**
- [ ] Convert deploy/utils/setup.js to TypeScript
- [ ] Convert all deployment scripts to TypeScript
- [ ] Add proper typing for all deployment functions
- [ ] Integrate with hardhat-deploy TypeScript patterns
- [ ] Validate deployment process across all environments

**Benefits:**
- Type safety in deployment scripts
- Better IDE support and error catching
- Consistency with rest of TypeScript codebase
- Easier maintenance and refactoring

### SUB-538.6: Integration Validation
```yaml
status: NOT_STARTED
priority: HIGH
completion: 0
dependencies: ["SUB-538.5"]
estimated_duration: 1-2 days  
```

**Deliverables:**
- [ ] Full test suite passes with all changes
- [ ] Local deployment works with new HD wallet structure
- [ ] Validate integration with downstream services
- [ ] Performance testing to ensure no regressions
- [ ] Documentation updates for new patterns

## Impact Assessment

### Immediate Benefits
- **Foundation for Integration Testing**: Enables end-to-end testing with proper key management
- **Operational Alignment**: Contracts match operational naming and role structure  
- **Modern Tooling**: Latest Hardhat and viem for better development experience
- **Type Safety**: TypeScript throughout entire contracts package

### Downstream Service Impact
- **apps/offchain-api**: Must update to use new EventProcessor naming
- **apps/temporal-processor**: Must use HD wallet derivation for contract interactions
- **All integration tests**: Must update for new role structure
- **Deployment procedures**: Must update for new HD wallet patterns

### Risk Mitigation
- **Comprehensive Testing**: Full test suite validation at each step
- **Incremental Approach**: Each sub-task builds on the previous
- **Rollback Plan**: Git-based rollback points after each major change
- **Staging Validation**: Test all changes in staging environment before production

## Definition of Done

- [ ] Hardhat 3.0 successfully integrated with all plugins working
- [ ] All contracts code converted to viem (tests, tasks, deployments)
- [ ] HD wallet derivation working for all four operational roles
- [ ] All Oracle references renamed to EventProcessor
- [ ] All deployment scripts converted to TypeScript
- [ ] Full test suite passes without regressions
- [ ] Local development workflow validated
- [ ] Documentation updated for new patterns
- [ ] Integration points with downstream services verified

## Next Steps After Completion

1. **Update Downstream Services**: Modify offchain-api and temporal-processor to use new patterns
2. **Integration Testing**: Begin end-to-end testing with proper HD wallet key management
3. **Staging Deployment**: Deploy to Base Sepolia with new operational structure
4. **Production Readiness**: Prepare for Base Mainnet deployment with HD wallet security

---

**Created**: September 1, 2025  
**Assigned**: Development Team  
**Epic**: #528 TAG Coins Implementation  
**Blocks**: End-to-end testing, staging deployment, production readiness