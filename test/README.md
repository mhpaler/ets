# ETS Integration Tests

This directory contains integration tests for the Ethereum Tag Service (ETS) ecosystem, validating end-to-end workflows that span multiple components including smart contracts, event processors, and off-chain services.

## Test Structure

```
test/
├── integration/           # End-to-end integration tests
│   ├── target-enrichment.test.ts
│   └── tag-coin-creation.test.ts (placeholder)
└── README.md
```

## Integration Test Overview

Integration tests validate complete workflows across the ETS stack, ensuring all components work together correctly. These tests differ from unit tests by:
- Testing multiple components interacting together
- Requiring external services (Hardhat, APIs, event processors)
- Validating real event flows and state changes
- Testing error handling across service boundaries

---

## Target Enrichment Integration Test

The target enrichment test (`integration/target-enrichment.test.ts`) validates the complete **target enrichment pipeline** - the process of fetching metadata for URLs and storing it on-chain.

### Architecture Components

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Target Enrichment Flow                        │
└─────────────────────────────────────────────────────────────────────┘

     [User/dApp]                [Blockchain]              [Event Processor]           [Offchain API]
         │                           │                           │                          │
         │                           │                           │                          │
    1. createTarget()                │                           │                          │
         ├──────────────────────────>│                           │                          │
         │                           │                           │                          │
         │                    2. TargetCreated                   │                          │
         │                        Event                          │                          │
         │                           ├──────────────────────────>│                          │
         │                           │                           │                          │
         │                           │                      3. Detect Event                 │
         │                           │                           │                          │
         │                           │                      4. Call API                     │
         │                           │                           ├─────────────────────────>│
         │                           │                           │                          │
         │                           │                           │    5. Fetch URL metadata │
         │                           │                           │       Store in Arweave   │
         │                           │                           │                          │
         │                           │                      6. Return metadata              │
         │                           │                           │<─────────────────────────┤
         │                           │                           │                          │
         │                           │   7. updateTarget()       │                          │
         │                           │<──────────────────────────┤                          │
         │                           │   (EVENT_PROCESSOR_ROLE)  │                          │
         │                           │                           │                          │
         │                      8. Target enriched               │                          │
         │                      (metadata stored)                │                          │
         │                           │                           │                          │
```

### What the Test Validates

#### 1. **Automatic Enrichment Flow** 
When a target is created, it should automatically be enriched:

```typescript
// User creates a target
ETSTarget.createTarget("https://example.com")
    ↓
// Emits TargetCreated event
    ↓
// Event Processor detects event
    ↓
// Calls Offchain API for metadata
    ↓
// Updates target on-chain with metadata
```

**Test validates:**
- TargetCreated event is emitted ✅
- Target gets enriched (enriched timestamp > 0) ✅
- HTTP status is recorded ✅
- Arweave TX ID is stored (if available) ✅

#### 2. **Manual Enrichment Flow**
Users can manually request enrichment for existing targets:

```typescript
// Target already exists
ETSEnrichTarget.requestEnrichTarget(targetId)
    ↓
// Emits EnrichTargetRequested event
    ↓
// Event Processor detects event
    ↓
// Same enrichment flow as automatic
```

**Test validates:**
- EnrichTargetRequested event is emitted ✅
- Manual request triggers enrichment ✅
- Target gets updated with metadata ✅

#### 3. **Error Handling Flow**
Invalid URLs should be handled gracefully:

```typescript
// Create target with invalid URL
ETSTarget.createTarget("https://invalid-domain.test")
    ↓
// Event Processor attempts enrichment
    ↓
// Offchain API returns error status
    ↓
// Target updated with error status (not 200)
```

**Test validates:**
- Invalid URLs don't break the system ✅
- Error status codes are recorded ✅
- No Arweave upload for failed fetches ✅

### Current Architecture

The target enrichment flow uses an event-driven architecture:

```
Target Created → Event Processor → Offchain API → Event Processor → ETSTarget.updateTarget()
```

**Key Components:**
1. **Event Processor** - Listens for blockchain events and orchestrates enrichment
2. **ETSEnrichTarget** - Gateway contract for manual enrichment requests
3. **EVENT_PROCESSOR_ROLE** - Permission that allows event processor to update targets
4. **Direct updates** - Event processor updates ETSTarget directly

### Test Requirements

For the test to work properly, it needs:

1. **Hardhat Network** ✅ (Running on localhost:8545)
2. **Deployed Contracts** ✅ (ETSTarget, ETSEnrichTarget, ETSAccessControls)
3. **Event Processor Service** (Started by test)
4. **Offchain API** (localhost:4000)
5. **ArLocal (Optional)** (For Arweave storage simulation)

### Running the Test

From the contracts package:
```bash
cd packages/contracts
pnpm exec hardhat test ../../test/integration/target-enrichment.test.ts
```

With all services running:
```bash
# Terminal 1: Start core stack (includes offchain API)
./scripts/start-local-stack.sh --core

# Terminal 3: Run test
cd packages/contracts
pnpm exec hardhat test ../../test/integration/target-enrichment.test.ts
```

---

## TAG Coin Creation Integration Test (Placeholder)

**File:** `integration/tag-coin-creation.test.ts` (to be implemented)

This test will validate the complete TAG coin creation flow on Zora:

### Planned Architecture

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

### What the Test Will Validate

1. **TAG Creation → Coin Deployment**
   - TagCreated event emission
   - Zora coin creation via factory
   - Deterministic address computation
   - Metadata upload to IPFS

2. **Creator Allocation**
   - Initial coin allocation to creator
   - Fee distribution mechanics
   - Platform fee handling

3. **Error Scenarios**
   - Duplicate TAG handling
   - Invalid TAG names
   - Network failures

### Test Requirements

1. **MockZoraFactory** (localhost testing)
2. **Event Processor** with Zora integration
3. **IPFS/Arweave** for metadata storage
4. **Deployed ETS contracts**

---

## Running All Integration Tests

```bash
# Run all integration tests
cd packages/contracts
pnpm exec hardhat test ../../test/integration/**/*.test.ts

# With coverage
pnpm exec hardhat coverage --testfiles "../../test/integration/**/*.test.ts"
```

## Best Practices

1. **Service Dependencies**: Always check required services are running
2. **Test Isolation**: Each test should clean up after itself
3. **Timeout Handling**: Use appropriate timeouts for async operations
4. **Event Verification**: Always verify events are emitted correctly
5. **Error Cases**: Test both success and failure scenarios

## Troubleshooting

### Tests Timing Out
- Ensure all required services are running
- Check network connectivity
- Verify contract deployments are successful

### Event Not Detected
- Confirm EVENT_PROCESSOR_ROLE is granted
- Check event processor logs for errors
- Verify correct contract addresses in config

### Service Connection Issues
- Check service URLs and ports
- Ensure no firewall blocking
- Verify service health endpoints