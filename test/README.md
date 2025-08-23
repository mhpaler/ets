# ETS Integration Tests

This directory contains integration tests for the Ethereum Tag Service (ETS) ecosystem, validating end-to-end workflows across our distributed architecture.

## Architecture Overview

ETS operates as a **6-service distributed system** with complex async workflows spanning blockchain events, off-chain processing, and decentralized storage. Our integration tests validate these critical cross-service interactions.

### System Components

```
test/
├── integration/                    # End-to-end integration tests
│   ├── target-enrichment-v2.test.ts     # Target metadata pipeline
│   ├── zora-tag-coin-v2.test.ts         # TAG → Zora coin pipeline  
│   └── docs/                       # Test documentation
│       ├── target-enrichment.md
│       └── tag-coin-creation.md
└── README.md                       # This file
```

## Testing Philosophy

Our integration tests validate complete workflows across the ETS stack, ensuring all components work together correctly. These tests differ from unit tests by:

- **Multi-Service Coordination**: Testing 6 services working together
- **Real Event Flows**: Validating blockchain events trigger correct responses
- **Async Workflow Validation**: End-to-end pipeline completion
- **Error Boundary Testing**: Graceful degradation across service failures

For detailed testing strategy and MVP framework, see: [`../docs/session/MVP-FRAMEWORK.md`](../docs/session/MVP-FRAMEWORK.md)

## 6-Service Distributed Architecture

ETS operates across six coordinated services with complex async workflows:

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    ETS Distributed System                                                   │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

  [User/dApp]        [Blockchain]        [Event Processor]      [Offchain API]      [Arweave/ArLocal]    [Subgraph]
      │                   │                       │                     │                     │              │
      │             Event-driven                  │                     │                     │              │
      │              workflows                    │                     │                     │              │
      ├──────────────────>│                       │                     │                     │              │
      │                   ├──────────────────────>│                     │                     │              │
      │                   │                       ├────────────────────>│                     │              │
      │                   │                       │                     ├────────────────────>│              │
      │                   │                       │                     │                     │              │
      │                   │<──────────────────────┤                     │                     │              │
      │                   ├─────────────────────────────────────────────────────────────────────────────────>│
      ├─────────────────────────────────────────────────────────────────────────────────────────────────────>│
```

### Primary Workflows

**Target Enrichment Pipeline**: URL creation → metadata extraction → decentralized storage  
**TAG Coin Pipeline**: TAG creation → Zora coin deployment → creator allocation

For complete architecture details, see: [`../docs/session/MVP-FRAMEWORK.md`](../docs/session/MVP-FRAMEWORK.md)

---

## Integration Test Suites

### Target Enrichment Tests
**File**: [`integration/target-enrichment-v2.test.ts`](integration/target-enrichment-v2.test.ts)  
**Pipeline**: `createTarget()` → `TargetCreated` event → Event Processor → Offchain API → Arweave storage  
**Details**: [`integration/docs/target-enrichment.md`](integration/docs/target-enrichment.md)

### TAG Coin Creation Tests  
**File**: [`integration/zora-tag-coin-v2.test.ts`](integration/zora-tag-coin-v2.test.ts)  
**Pipeline**: `createTags()` → `TagCreated` event → Event Processor → Zora coin creation  
**Details**: [`integration/docs/tag-coin-creation.md`](integration/docs/tag-coin-creation.md)

---

## MVP Testing Framework

Our testing follows a **3-tier MVP approach** to manage distributed system complexity:

- **Tier 1**: Happy Path + Critical Failures (8 essential tests)
- **Tier 2**: Post-MVP Robustness (12 additional tests)  
- **Tier 3**: Production Readiness (15 comprehensive tests)

**Strategy**: Happy Path + Catchall + Blockchain Recovery

---

## Running Tests

```bash
# All integration tests
cd packages/contracts
pnpm exec hardhat test ../../test/integration/**/*.test.ts

# Specific test suite
pnpm exec hardhat test ../../test/integration/target-enrichment-v2.test.ts
pnpm exec hardhat test ../../test/integration/zora-tag-coin-v2.test.ts

# With services running
./scripts/start-local-stack.sh --core  # Terminal 1
pnpm exec hardhat test ../../test/integration/  # Terminal 2
```

## Service Dependencies

**Required for all tests:**
- Hardhat Network (localhost:8545)
- Event Processor Service
- Offchain API (localhost:4000)

**Optional:**
- ArLocal (Arweave simulation)
- Subgraph (localhost:8000)

---

For troubleshooting, test details, and development strategy, see the individual test documentation files linked above.
