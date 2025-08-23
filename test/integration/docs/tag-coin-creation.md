# TAG Coin Creation Integration Tests

**File**: `../zora-tag-coin-v2.test.ts`  
**Pipeline**: TAG creation → Zora coin deployment → creator allocation  
**Status**: Placeholder implementation (test-driven development ready)

## Pipeline Overview

The TAG coin creation pipeline validates the complete **TAG-to-Zora-coin** workflow, integrating ETS TAG creation with Zora's coin deployment protocol for creator economics.

### Architecture Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                        TAG Coin Creation Flow                        │
└─────────────────────────────────────────────────────────────────────┘

     [User/dApp]                [ETS Contracts]           [Event Processor]           [Zora Protocol]
         │                           │                           │                          │
         │                           │                           │                          │
    1. createTags()                  │                           │                          │
         ├──────────────────────────>│                           │                          │
         │                           │                           │                          │
         │                    2. TagCreated                      │                          │
         │                        Event                          │                          │
         │                           ├──────────────────────────>│                          │
         │                           │                           │                          │
         │                           │                      3. Process Event                │
         │                           │                           │                          │
         │                           │                      4. Create Coin                  │
         │                           │                           ├─────────────────────────>│
         │                           │                           │                          │
         │                           │                           │    5. Deploy 1155 Token  │
         │                           │                           │                          │
         │                           │                      6. Coin Address                 │
         │                           │                           │<─────────────────────────┤
         │                           │                           │                          │
         │                           │   7. Store mapping        │                          │
         │                           │<──────────────────────────┤                          │
         │                           │                           │                          │
         │                      8. TAG coin ready                │                          │
         │                           │                           │                          │
```

## Test Validation Areas

### 1. TAG Creation → Coin Deployment

**Trigger**: User calls `createTags()` with hashtag array  
**Process**: TagCreated event → Event Processor → Zora factory interaction  
**Validation**:
- [ ] TagCreated event emitted with coinAddress parameter
- [ ] Event Processor detects TagCreated event correctly
- [ ] Zora factory createCoin() called with proper parameters
- [ ] Deterministic address computation matches actual deployment
- [ ] Coin metadata uploaded to IPFS successfully

### 2. Creator Economics & Allocation

**Trigger**: TAG coin deployment completes  
**Process**: Creator receives initial allocation based on platform rules  
**Validation**:
- [ ] Creator receives appropriate coin allocation
- [ ] Platform fees distributed correctly
- [ ] Fee percentages match expected configuration
- [ ] Creator economics preserved across deployments

### 3. System Integration & Error Handling

**Scenarios**: Network failures, duplicate TAGs, gas issues  
**Process**: Graceful handling with retry mechanisms  
**Validation**:
- [ ] Duplicate TAG creation handled appropriately
- [ ] Gas estimation failures don't break system
- [ ] Network partitions handled with retry logic
- [ ] Invalid TAG names rejected gracefully

## MVP Test Framework

### Tier 1: Happy Path Tests (5 tests)

#### Current Working Test
- [ ] **pipeline-integration**: Complete TAG → Zora coin pipeline validation

#### Essential Happy Path Tests
- [ ] **happy-path-simple-tag**: Single hashtag (#DeFi) Zora coin creation
- [ ] **happy-path-multi-tag**: Multiple hashtags batch processing
- [ ] **happy-path-creator-allocation**: Verify creator fee allocation

### Tier 2: Critical Failure Tests (3 tests)

#### System Resilience Tests
- [ ] **zora-factory-failure**: Zora coin creation fails gracefully
- [ ] **duplicate-tag-handling**: Handle duplicate TAG creation attempts
- [ ] **insufficient-gas**: Handle gas estimation failures

### Tier 3: System Recovery Tests (2 tests)

#### Recovery & Consistency Tests
- [ ] **blockchain-recovery**: Replay unprocessed TagCreated events
- [ ] **address-reconciliation**: Sync predicted vs actual coin addresses

## Current Implementation Status

### Test Structure (Placeholder)
```typescript
describe("Zora Tag Coin Creation Integration Tests", () => {
  // Environment detection (local/staging/production)
  // Service health checking
  
  describe("Current Working Test", () => {
    test.skip("should create TAG and verify Zora coin creation pipeline")
  });
  
  describe("MVP Framework - Tier 1: Happy Path Tests", () => {
    // 3 essential happy path tests
  });
  
  describe("MVP Framework - Tier 2: Critical Failure Tests", () => {
    // 3 critical failure scenarios
  });
  
  describe("MVP Framework - Tier 3: System Recovery Tests", () => {
    // 2 recovery mechanism tests
  });
});
```

### Next Implementation Steps
1. **Environment Detection**: Implement service health checking similar to target-enrichment-v2.test.ts
2. **Zora Integration**: Connect to MockZoraFactory for local testing
3. **Event Processing**: Validate TagCreated event handling in Event Processor
4. **Pipeline Validation**: End-to-end TAG creation to coin deployment

## Architecture Components

### ETS TAG System
- **ETSToken Contract**: Core TAG creation and management
- **TagCreated Event**: 7-parameter signature with coinAddress
- **Relayer System**: Permission management for TAG creation

### Zora Integration
- **MockZoraFactory** (localhost): Simulated Zora coin factory
- **Real Zora Protocol** (staging/production): Actual Zora deployment
- **1155 Token Standard**: Zora coin implementation
- **Creator Economics**: Fee distribution and allocation

### Event Processing
- **TagCreated Watcher**: Detects new TAG creation events
- **TagCreatedHandler**: Orchestrates Zora coin creation workflow
- **Offchain API Integration**: Metadata preparation and IPFS upload

## Service Requirements

### Required Services
1. **Hardhat Network** (localhost:8545) - Smart contracts
2. **Event Processor Service** - TAG event detection
3. **Offchain API** (localhost:4000) - Metadata & Zora integration
4. **MockZoraFactory** (localhost) - Coin deployment simulation

### Optional Services
- **IPFS Node** - Metadata storage
- **Real Zora Protocol** (testnet/mainnet)
- **Subgraph** - TAG coin indexing

## Environment Configuration

### Local Development
```bash
# Uses MockZoraFactory for testing
# All services run on localhost
# Hardhat network with deployed ETS contracts
```

### Staging (Sepolia)
```bash
# Uses real Zora protocol on Sepolia
# Staging infrastructure
# Testnet ETH for transactions
```

### Production (Base)
```bash
# Real Zora protocol on Base mainnet
# Production infrastructure (read-only for tests)
```

## Running TAG Coin Tests

```bash
# Full test suite (when implemented)
cd packages/contracts
pnpm exec hardhat test ../../test/integration/zora-tag-coin-v2.test.ts

# With all services running
./scripts/start-local-stack.sh --core  # Terminal 1
pnpm exec hardhat test ../../test/integration/zora-tag-coin-v2.test.ts  # Terminal 2

# Specific test tier
pnpm exec hardhat test ../../test/integration/zora-tag-coin-v2.test.ts --grep "Tier 1"
```

## Integration with Target Enrichment

### Coordinated Processing
- **Shared Event Processor**: Handles both TAG and Target events
- **No Interference**: Both pipelines run independently
- **Common Infrastructure**: Same logging, health checks, recovery

### Full Pipeline Test
```typescript
// Future test: Create TAG with target URI
// Validates both TagCreated and TargetCreated events
// Confirms both Zora coin creation and target enrichment
```

---

**Related Documentation:**
- [MVP Framework](../../../docs/session/MVP-FRAMEWORK.md) - Overall testing strategy
- [Target Enrichment Tests](./target-enrichment.md) - Related pipeline
- [Integration Tests Overview](../README.md) - High-level architecture

**Implementation Status**: 🚧 Placeholder - Ready for test-driven development