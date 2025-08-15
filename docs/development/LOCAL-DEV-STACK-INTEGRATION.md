# Local Dev Stack Integration Plan

## Overview

Integration plan for adding event processor and Zora coin creation workflow to the existing `@scripts/start-local-stack.sh`.

## Current Local Stack

The existing stack includes:
- **Hardhat node** (localhost:8545) - Local blockchain
- **Graph Node** (localhost:8000) - Subgraph indexing  
- **ArLocal** (localhost:1984) - Local Arweave node
- **Offchain API** (localhost:4000) - Business logic & metadata
- **Airnode Oracle** (localhost:8080) - Oracle services
- **Explorer UI** (localhost:3001) - Frontend interface

## Proposed Integration

### 1. Event Processor Service

**Location**: `/apps/event-processor`
**Port**: `localhost:5000` (or next available)
**Purpose**: Monitor TagCreated events and trigger coin creation

**Integration Steps**:
- Add to `start-local-stack.sh` as new service
- Configure for `NODE_ENV=development` (localhost mode)
- Monitor Hardhat node for TagCreated events
- Call offchain API tag-coin endpoint

### 2. Mock Zora Coin Creation

**Problem**: Don't want full Zora stack locally
**Solution**: Environment-aware mocking in offchain API

**Implementation**:
```typescript
// In offchain API - /api/tag-coin/create endpoint
if (environment === 'localhost') {
  // Generate deterministic mock Zora coin address
  const mockZoraCoinAddress = generateMockZoraCoinAddress(tagData);
  
  return {
    success: true,
    zoraCoinAddress: mockZoraCoinAddress,
    transactionHash: `0x${generateMockTxHash()}`,
    message: `[MOCK] Would create Zora coin for tag: ${tagData.machineName}`
  };
}
```

### 3. Deterministic Mock Addresses

**Approach**: Generate predictable addresses for consistent testing

```typescript
function generateMockZoraCoinAddress(tagData: TagCreatedEvent): string {
  // Create deterministic address based on tag machine name
  const hash = keccak256(
    encodeAbiParameters(
      ['string', 'string'],
      ['MOCK_ZORA_COIN', tagData.machineName]
    )
  );
  return `0x${hash.slice(26)}`; // Last 20 bytes as address
}
```

**Benefits**:
- Same tag always generates same mock address
- Predictable for testing and debugging
- Clear distinction from real Zora addresses

### 4. Complete Local Workflow

```
1. User creates tag via Explorer UI
2. ETS contracts emit TagCreated event
3. Event processor detects event
4. Event processor calls offchain API
5. Offchain API returns mock Zora coin data
6. Event processor logs success
7. Subgraph indexes the tag creation
8. Explorer UI shows updated data
```

## Implementation Tasks

### Phase 1: API Endpoint (Offchain API)
- [ ] Add `/api/tag-coin/create` endpoint
- [ ] Implement environment detection (localhost vs staging/production)
- [ ] Add mock Zora coin generation for localhost
- [ ] Add deterministic address generation
- [ ] Add comprehensive logging for mock behavior

### Phase 2: Event Processor Integration
- [ ] Add event processor to `start-local-stack.sh`
- [ ] Configure proper port and logging
- [ ] Ensure proper startup order (after contracts deployment)
- [ ] Add health checks and error handling

### Phase 3: Environment Configuration
- [ ] Update environment detection in both services
- [ ] Ensure localhost mode enables mocking
- [ ] Add clear logging to distinguish mock vs real behavior
- [ ] Update service URLs display in stack script

### Phase 4: Testing & Validation
- [ ] Test complete workflow locally
- [ ] Verify event detection and processing
- [ ] Validate mock coin generation
- [ ] Ensure proper logging and debugging
- [ ] Test error handling and edge cases

## Benefits

### For Development
- **Fast iteration**: No Zora stack complexity
- **Complete workflow**: Full TagCreated → coin creation flow
- **Deterministic testing**: Predictable mock addresses
- **Clear feedback**: Logs show mock vs real behavior

### For Debugging
- **Isolated testing**: Test event processing without external dependencies
- **Predictable outcomes**: Same inputs = same outputs
- **Full observability**: All services in one stack with centralized logging

### For Team
- **Easy onboarding**: Single script starts everything
- **Consistent environment**: Everyone has same mock behavior
- **Fast feedback loops**: Immediate local testing

## Service Configuration

### Event Processor (localhost mode)
```bash
NODE_ENV=development
CHAIN_ID=31337
ALCHEMY_API_KEY=not-needed-for-localhost
OFFCHAIN_API_URL=http://localhost:4000
LOG_LEVEL=debug
```

### Offchain API (localhost mode)
```bash
NODE_ENV=development
DATABASE_URL=sqlite://localhost
ARWEAVE_URL=http://localhost:1984
ENABLE_ZORA_MOCKS=true
```

## Future Enhancements

- **Visual feedback**: Show mock coin creation in Explorer UI
- **Mock Zora trading**: Simulate coin trading for full workflow testing  
- **Performance testing**: Load testing with high event volumes
- **Integration tests**: Automated test suite for complete workflow

## Notes

- Mock behavior only active in localhost environment
- Real Zora integration unchanged for staging/production
- Deterministic mocking enables consistent testing
- Clear logging distinguishes mock from real operations