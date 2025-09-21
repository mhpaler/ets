# ETS Integration Tests

This directory contains integration tests for the Ethereum Tag Service (ETS) ecosystem, validating end-to-end workflows across our **Temporal-orchestrated distributed architecture**.

## Architecture Overview

ETS operates with **Temporal workflow orchestration**, providing reliable async workflows spanning blockchain events and off-chain processing. Our integration tests validate these critical cross-service interactions with built-in observability.

### System Components

```
test/
├── integration/                    # End-to-end integration tests
│   ├── target-enrichment-v2.test.ts     # Target metadata enrichment via Temporal workflows
│   └── zora-tag-coin-v2.test.ts         # TAG → Zora coin pipeline (Temporal workflows)
└── README.md                       # This file
```

## Testing Philosophy

Our integration tests validate complete **Temporal workflow orchestration** across the ETS stack, ensuring all components work together correctly with built-in retry policies and monitoring. These tests differ from unit tests by:

- **Temporal Workflow Validation**: Testing workflow orchestration with activities
- **Multi-Service Coordination**: Testing 5 services + Temporal server working together
- **Real Event Flows**: Validating blockchain events trigger correct Temporal workflows
- **Async Workflow Completion**: End-to-end pipeline completion with observability
- **Resilience Testing**: Workflow retry policies and error boundary validation

For detailed testing strategy and comprehensive documentation, see: [`../docs/testing/`](../docs/testing/)

## Core Service Architecture with Temporal

ETS operates with Temporal workflow orchestration for reliable async processing:

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    ETS Temporal System                                                     │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

  [User/dApp]        [Blockchain]        [Temporal Server]     [Temporal Processor]        [The Graph]
      │                   │                       │                     │                        │
      │             Event-driven                  │                     │                        │
      │              workflows                    │                     │                        │
      ├──────────────────>│                       │                     │                        │
      │                   │                       │                     │                        │
      │                   ├───────────────────────┼─────────────────────>│                        │
      │                   │                       │                     │                        │
      │                   │                       │◄────────────────────┤                        │
      │                   │                       │                     ├──────────────────────>│
      │                   │◄──────────────────────┤                     │                        │
      │                   ├───────────────────────┼─────────────────────┼──────────────────────>│
```

### Primary Workflows

**TargetEnrichmentWorkflow**: URL creation → metadata extraction → event emission for indexing
**TagCreatedWorkflow**: TAG creation → Zora coin deployment → creator allocation → reward distribution

For complete architecture details, see: [`../docs/testing/TEMPORAL-INTEGRATION-TESTS.md`](../docs/testing/TEMPORAL-INTEGRATION-TESTS.md)

---

## Integration Test Suites

### Temporal Target Enrichment Tests
**File**: [`integration/target-enrichment-v2.test.ts`](integration/target-enrichment-v2.test.ts)
**Workflow**: `requestEnrichTarget()` → `EnrichTargetRequested` event → `TargetEnrichmentWorkflow` → metadata fetch → `TargetEnriched` event emission
**Details**: [`../docs/testing/temporal-target-enrichment.md`](../docs/testing/temporal-target-enrichment.md)

### Temporal TAG Coin Creation Tests  
**File**: [`integration/zora-tag-coin-v2.test.ts`](integration/zora-tag-coin-v2.test.ts)  
**Workflow**: `createTags()` → `TagCreated` event → `TagCreatedWorkflow` → Zora coin creation → creator rewards  
**Details**: [`../docs/testing/temporal-tag-coin-creation.md`](../docs/testing/temporal-tag-coin-creation.md)

### Core Temporal Workflow Tests
**File**: [`integration/temporal-workflows.test.ts`](integration/temporal-workflows.test.ts) *(Coming Soon)*  
**Focus**: Workflow orchestration, activity retry policies, monitoring, and resilience testing  
**Details**: [`../docs/testing/TEMPORAL-WORKFLOW-TESTING-PLAN.md`](../docs/testing/TEMPORAL-WORKFLOW-TESTING-PLAN.md)

---

## Testing Documentation

All comprehensive testing documentation has been organized under [`../docs/testing/`](../docs/testing/):

- **[Temporal Integration Tests Design](../docs/testing/TEMPORAL-INTEGRATION-TESTS.md)** - Complete test architecture and categories
- **[Temporal Workflow Testing Plan](../docs/testing/TEMPORAL-WORKFLOW-TESTING-PLAN.md)** - Implementation strategy and environment configs
- **[Target Enrichment Tests](../docs/testing/temporal-target-enrichment.md)** - Detailed test cases for metadata workflows
- **[TAG Coin Creation Tests](../docs/testing/temporal-tag-coin-creation.md)** - Comprehensive Zora integration testing

---

## MVP Testing Framework

Our testing follows a **3-tier MVP approach** to manage distributed system complexity with Temporal observability:

- **Tier 1**: Happy Path + Critical Failures (8 essential Temporal workflow tests)
- **Tier 2**: Post-MVP Robustness (12 additional workflow resilience tests)  
- **Tier 3**: Production Readiness (15 comprehensive workflow monitoring tests)

**Strategy**: Temporal Workflow Validation + Activity Retry Testing + Monitoring Verification

---

## Running Tests

### Prerequisites
Start the complete Temporal stack:

```bash
# Start full local stack with Temporal server
./scripts/start-local-stack.sh --temporal

# Verify all services are healthy
curl http://localhost:8080  # Temporal UI
curl http://localhost:4000  # Offchain API
curl http://localhost:1984  # ArLocal
curl http://localhost:8545  # Hardhat
```

### Test Execution

```bash
# All integration tests (from project root)
cd packages/contracts
pnpm exec hardhat test ../../test/integration/**/*.test.ts

# Specific Temporal workflow tests  
pnpm exec hardhat test ../../test/integration/target-enrichment-v2.test.ts
pnpm exec hardhat test ../../test/integration/zora-tag-coin-v2.test.ts

# With environment configuration
ENVIRONMENT=local pnpm exec hardhat test ../../test/integration/
```

### Temporal Monitoring

During test execution, monitor workflows via:

- **Temporal UI**: http://localhost:8080
- **Workflow Status**: View running/completed workflows
- **Activity History**: Debug failed activities and retry attempts
- **Test Logs**: Structured JSON logging with workflow IDs

## Service Dependencies

**Required for all Temporal tests:**
- Hardhat Network (localhost:8545)
- **Temporal Server** (localhost:7233) with PostgreSQL backend
- **Temporal Processor** (Event listener + Worker)
- The Graph (for indexing enriched data)

---

## Migration from Event Processor

These integration tests have been **completely updated** to validate our **Event Processor → Temporal Workflow migration**:

| Event Processor Tests | Temporal Workflow Tests |
|----------------------|-------------------------|
| Custom retry validation | Temporal retry policy testing |
| Manual state checking | Workflow completion verification |
| Error log parsing | Temporal UI workflow monitoring |
| Service coordination testing | Activity orchestration validation |
| Custom recovery scenarios | Built-in workflow recovery testing |

The test structure remains the same, but now validates **Temporal workflow orchestration** rather than custom event processing logic.

---

For troubleshooting, detailed test implementation guides, and development strategy, see the comprehensive documentation in [`../docs/testing/`](../docs/testing/).

**Next Steps**: Complete Temporal workflow test implementation using the detailed plans in the testing documentation.