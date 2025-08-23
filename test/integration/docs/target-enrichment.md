# Target Enrichment Integration Tests

**File**: `../target-enrichment-v2.test.ts`  
**Pipeline**: Target creation → metadata extraction → decentralized storage  
**Framework**: Test-driven MVP with tiered approach

## Pipeline Overview

The target enrichment pipeline validates the complete **URL-to-metadata** workflow spanning 6 services with 11-step async processing.

### Architecture Flow

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                      Target Enrichment Flow                                                 │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

  [User/dApp]        [Blockchain]        [Event Processor]      [Offchain API]      [Arweave/ArLocal]    [Subgraph]
      │                   │                       │                     │                     │              │
      │                   │                       │                     │                     │              │
 1. createTarget()        │                       │                     │                     │              │
      ├──────────────────>│                       │                     │                     │              │
      │                   │                       │                     │                     │              │
      │            2. TargetCreated               │                     │                     │              │
      │                Event                      │                     │                     │              │
      │                   ├──────────────────────>│                     │                     │              │
      │                   │                       │                     │                     │              │
      │                   │              3. Detect Event                │                     │              │
      │                   │                       │                     │                     │              │
      │                   │              4. Call API                    │                     │              │
      │                   │                       ├────────────────────>│                     │              │
      │                   │                       │                     │                     │              │
      │                   │                       │           5. Fetch URL metadata           │              │
      │                   │                       │                     │                     │              │
      │                   │                       │           6. Store metadata               │              │
      │                   │                       │                     ├────────────────────>│              │
      │                   │                       │                     │                     │              │
      │                   │                       │           7. Return metadata + txId       │              │
      │                   │                       │                     │<────────────────────┤              │
      │                   │                       │<────────────────────┤                     │              │
      │                   │                       │                     │                     │              │
      │                   │     8. updateTarget() │                     │                     │              │
      │                   │<──────────────────────┤                     │                     │              │
      │                   │   (EVENT_PROCESSOR_   │                     │                     │              │
      │                   │        ROLE)          │                     │                     │              │
      │                   │                       │                     │                     │              │
      │              9. Target enriched           │                     │                     │              │
      │              (metadata stored)            │                     │                     │              │
      │                   │                       │                     │                     │              │
      │                   │                       │                     │                     │    10. Index │
      │                   │                       │                     │                     │     Events & │
      │                   │                       │                     │                     │   State +    │
      │                   │                       │                     │                     │   Metadata   │
      │                   ├─────────────────────────────────────────────────────────────────────────────────>│
      │                   │                       │                     │                     │              │
      │   11. Query enriched targets + metadata   │                     │                     │              │
      ├─────────────────────────────────────────────────────────────────────────────────────────────────────>│
      │                   │                       │                     │                     │              │
```

## Test Validation Areas

### 1. Automatic Enrichment Flow

**Trigger**: User creates target → `TargetCreated` event emission  
**Process**: Event Processor detects → calls Offchain API → updates target  
**Validation**:
- ✅ TargetCreated event emitted correctly
- ✅ Target enriched timestamp updated (> 0)
- ✅ HTTP status recorded appropriately
- ✅ Arweave TX ID stored when available

### 2. Manual Enrichment Flow

**Trigger**: User calls `requestEnrichTarget()` → `EnrichTargetRequested` event  
**Process**: Same as automatic but initiated manually  
**Validation**:
- ✅ EnrichTargetRequested event emitted
- ✅ Manual request triggers enrichment pipeline
- ✅ Target metadata updated correctly

### 3. Error Handling & Recovery

**Scenarios**: Invalid URLs, network failures, service outages  
**Process**: Graceful degradation with status recording  
**Validation**:
- ✅ Invalid URLs handled without system failure
- ✅ Error status codes recorded correctly
- ✅ No Arweave uploads for failed fetches
- ✅ System remains responsive during failures

## MVP Test Framework

### Tier 1: Essential Tests (8 tests)

#### Happy Path Tests
- [ ] **happy-path-html**: Standard webpage with OpenGraph metadata
- [ ] **happy-path-github**: GitHub repository URL (structured data)
- [ ] **happy-path-image**: Direct image URL (content-type detection)

#### Critical Failure Tests
- [ ] **event-processor-down**: Event processor service unavailable
- [ ] **offchain-api-down**: API service returns 500/503
- [ ] **arweave-unavailable**: Storage fails but target still gets updated
- [ ] **network-partition**: Event processor can't reach API (timeout)
- [ ] **partial-failure-recovery**: Service comes back online, processes backlog

### Tier 2: Post-MVP Robustness (12 additional tests)

#### Edge Case Coverage
- [ ] **subgraph-lag**: Indexing delays don't break queries
- [ ] **cascade-failures**: Multiple services down simultaneously
- [ ] **data-consistency**: Target state consistent after recovery
- [ ] **rate-limiting**: API throttling handled gracefully
- [ ] **timeout-escalation**: Progressive timeout handling
- [ ] **malformed-urls**: Invalid URL formats handled safely
- [ ] **large-metadata**: Oversized content handled appropriately
- [ ] **redirect-chains**: URL redirects followed correctly
- [ ] **auth-required**: Password-protected content handled
- [ ] **content-type-edge-cases**: Unusual MIME types
- [ ] **concurrent-processing**: Multiple targets processed simultaneously
- [ ] **service-restart-recovery**: Services restart mid-processing

## Current Architecture Details

### Event-Driven Workflow
```typescript
Target Created → Event Processor → Offchain API → Event Processor → ETSTarget.updateTarget()
```

### Key Components
1. **Event Processor**: Orchestrates enrichment pipeline
2. **ETSEnrichTarget**: Gateway contract for manual requests  
3. **EVENT_PROCESSOR_ROLE**: Permission for blockchain updates
4. **Direct Updates**: Event processor updates ETSTarget contract

### Service Requirements

**Required Services:**
1. Hardhat Network (localhost:8545) - Smart contracts
2. Event Processor Service - Event detection & orchestration
3. Offchain API (localhost:4000) - Metadata extraction
4. ETSTarget, ETSEnrichTarget, ETSAccessControls contracts deployed

**Optional Services:**
- ArLocal - Arweave storage simulation
- Subgraph (localhost:8000) - Blockchain indexing

## Running Target Enrichment Tests

```bash
# Full test suite
cd packages/contracts
pnpm exec hardhat test ../../test/integration/target-enrichment-v2.test.ts

# With all services running
./scripts/start-local-stack.sh --core  # Terminal 1
pnpm exec hardhat test ../../test/integration/target-enrichment-v2.test.ts  # Terminal 2
```

## Troubleshooting

### Common Issues
- **Tests timeout**: Verify all required services running
- **Events not detected**: Check EVENT_PROCESSOR_ROLE granted
- **API connection failures**: Confirm Offchain API on localhost:4000
- **Contract not found**: Verify deployment addresses in config

### Debug Commands
```bash
# Check service health
curl http://localhost:4000/health

# Verify contract deployments
pnpm exec hardhat run scripts/check-deployments.js --network localhost

# Monitor event processor logs
tail -f apps/event-processor/logs/app.log
```

---

**Related Documentation:**
- [MVP Framework](../../../docs/session/MVP-FRAMEWORK.md) - Overall testing strategy
- [TAG Coin Tests](./tag-coin-creation.md) - Related test suite
- [Integration Tests Overview](../README.md) - High-level architecture