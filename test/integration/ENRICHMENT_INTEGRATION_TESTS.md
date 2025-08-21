# Target Enrichment Integration Tests Design

## Overview

This document outlines the design for comprehensive **full-stack integration tests** located in `/test/integration/` that validate the complete target enrichment flow across all ETS services. These tests validate the entire pipeline from contract events to enriched target updates using the new Event Processor architecture.

## Test Architecture

### Local Stack Components
1. **Hardhat Network**: Local blockchain with deployed contracts
2. **Event Processor**: Watching for blockchain events
3. **Offchain API**: Processing enrichment requests
4. **ArLocal**: Local Arweave node for metadata storage

### Test Environment Setup
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Hardhat       │    │ Event Processor │    │  Offchain API   │
│   (Port 8545)   │◄──►│ (Port varies)   │◄──►│  (Port 4000)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                        │
                       ┌─────────────────┐              │
                       │    ArLocal      │◄─────────────┘
                       │  (Port 1984)    │
                       └─────────────────┘
```

## Integration Test Categories

### 1. Automatic Enrichment Flow Tests

**Test: Complete TargetCreated → Enrichment Pipeline**
```typescript
describe("Automatic Target Enrichment Integration", () => {
  it("should complete full enrichment flow from target creation", async () => {
    // 1. Create target on blockchain
    const targetURI = "https://example.com/auto-test";
    const tx = await ETSTarget.createTarget(targetURI);
    
    // 2. Wait for TargetCreated event emission
    await expect(tx).to.emit(ETSTarget, "TargetCreated");
    
    // 3. Wait for event processor to pick up event
    await waitForEventProcessing(5000);
    
    // 4. Verify target was enriched with metadata
    const target = await ETSTarget.getTargetById(targetId);
    expect(target.arweaveTxId).to.not.equal("");
    expect(target.httpStatus).to.equal(200);
    expect(target.enriched).to.not.equal(0);
    
    // 5. Verify metadata is accessible on Arweave
    const metadata = await fetchArweaveData(target.arweaveTxId);
    expect(metadata.url).to.equal(targetURI);
  });
});
```

### 2. Manual Enrichment Flow Tests

**Test: EnrichTargetRequested → Enrichment Pipeline**
```typescript
describe("Manual Target Enrichment Integration", () => {
  it("should complete full enrichment flow from manual request", async () => {
    // 1. Create target (without automatic enrichment)
    const targetURI = "https://example.com/manual-test";
    await ETSTarget.createTarget(targetURI);
    
    // 2. Request manual enrichment
    const tx = await ETSEnrichTarget.requestEnrichTarget(targetId);
    
    // 3. Wait for EnrichTargetRequested event emission
    await expect(tx).to.emit(ETSEnrichTarget, "EnrichTargetRequested");
    
    // 4. Wait for event processor to handle request
    await waitForEventProcessing(5000);
    
    // 5. Verify target was enriched
    const target = await ETSTarget.getTargetById(targetId);
    expect(target.arweaveTxId).to.not.equal("");
    expect(target.enriched).to.not.equal(0);
  });
});
```

### 3. End-to-End Content Type Tests

**Test: Different Content Types → Appropriate Metadata**
```typescript
describe("Content Type Enrichment Integration", () => {
  const contentTypes = [
    {
      url: "https://example.com/html-page",
      expectedType: "text/html",
      expectedFields: ["title", "description", "openGraph"]
    },
    {
      url: "https://example.com/api/data.json", 
      expectedType: "application/json",
      expectedFields: ["contentType"]
    },
    {
      url: "https://example.com/image.png",
      expectedType: "image",
      expectedFields: ["isImage", "title"]
    }
  ];

  contentTypes.forEach(testCase => {
    it(`should enrich ${testCase.expectedType} content correctly`, async () => {
      // Mock the HTTP responses for different content types
      await setupMockHttpResponse(testCase.url, testCase.expectedType);
      
      // Create and enrich target
      await ETSTarget.createTarget(testCase.url);
      await waitForEventProcessing(5000);
      
      // Verify enrichment
      const target = await ETSTarget.getTargetById(targetId);
      const metadata = await fetchArweaveData(target.arweaveTxId);
      
      expect(metadata.contentType).to.equal(testCase.expectedType);
      testCase.expectedFields.forEach(field => {
        expect(metadata[field]).to.exist;
      });
    });
  });
});
```

### 4. Error Handling Integration Tests

**Test: Failed HTTP Requests → Error Status Recording**
```typescript
describe("Error Handling Integration", () => {
  const errorScenarios = [
    { url: "https://nonexistent.example.com", expectedStatus: 500 },
    { url: "https://httpstat.us/404", expectedStatus: 404 },
    { url: "https://httpstat.us/403", expectedStatus: 403 },
  ];

  errorScenarios.forEach(scenario => {
    it(`should handle ${scenario.expectedStatus} errors gracefully`, async () => {
      await ETSTarget.createTarget(scenario.url);
      await waitForEventProcessing(5000);
      
      const target = await ETSTarget.getTargetById(targetId);
      expect(target.httpStatus).to.equal(scenario.expectedStatus);
      expect(target.arweaveTxId).to.equal(""); // No Arweave upload on error
      expect(target.enriched).to.not.equal(0); // Still record timestamp
    });
  });
});
```

### 5. Performance and Load Tests

**Test: Multiple Concurrent Enrichments**
```typescript
describe("Performance Integration", () => {
  it("should handle multiple concurrent enrichment requests", async () => {
    const targetCount = 10;
    const targetURIs = Array.from({length: targetCount}, (_, i) => 
      `https://example.com/concurrent-test-${i}`
    );
    
    // Create multiple targets simultaneously
    const creationPromises = targetURIs.map(uri => 
      ETSTarget.createTarget(uri)
    );
    await Promise.all(creationPromises);
    
    // Wait for all enrichments to complete
    await waitForEventProcessing(15000);
    
    // Verify all targets were enriched
    for (const uri of targetURIs) {
      const targetId = await ETSTarget.computeTargetId(uri);
      const target = await ETSTarget.getTargetById(targetId);
      expect(target.arweaveTxId).to.not.equal("");
      expect(target.httpStatus).to.equal(200);
    }
  });
});
```

### 6. Service Recovery Tests

**Test: Event Processor Restart → Historical Event Processing**
```typescript
describe("Service Recovery Integration", () => {
  it("should process missed events after restart", async () => {
    // 1. Stop event processor
    await stopEventProcessor();
    
    // 2. Create targets while processor is down
    const missedTargets = ["https://example.com/missed-1", "https://example.com/missed-2"];
    for (const uri of missedTargets) {
      await ETSTarget.createTarget(uri);
    }
    
    // 3. Restart event processor with historical processing
    await startEventProcessor({ processHistorical: true });
    
    // 4. Wait for historical processing
    await waitForEventProcessing(10000);
    
    // 5. Verify missed targets were enriched
    for (const uri of missedTargets) {
      const targetId = await ETSTarget.computeTargetId(uri);
      const target = await ETSTarget.getTargetById(targetId);
      expect(target.arweaveTxId).to.not.equal("");
    }
  });
});
```

## Test Infrastructure Requirements

### 1. Test Utilities

```typescript
// Test helper functions
export class EnrichmentTestUtils {
  static async waitForEventProcessing(timeoutMs: number): Promise<void> {
    // Poll target state until enrichment complete or timeout
  }
  
  static async fetchArweaveData(txId: string): Promise<any> {
    // Fetch metadata from local Arweave node
  }
  
  static async setupMockHttpResponse(url: string, contentType: string): Promise<void> {
    // Configure mock HTTP server for testing
  }
  
  static async startEventProcessor(options?: EventProcessorOptions): Promise<void> {
    // Start event processor with test configuration
  }
  
  static async stopEventProcessor(): Promise<void> {
    // Gracefully stop event processor
  }
}
```

### 2. Test Configuration

```typescript
// Integration test configuration
export const integrationConfig = {
  hardhat: {
    url: "http://localhost:8545",
    timeout: 30000
  },
  eventProcessor: {
    binary: "./dist/index.js",
    env: {
      CHAIN_ID: "31337",
      RPC_URL: "http://localhost:8545",
      OFFCHAIN_API_URL: "http://localhost:4000",
      PRIVATE_KEY: process.env.TEST_PRIVATE_KEY
    }
  },
  offchainApi: {
    url: "http://localhost:4000",
    timeout: 10000
  },
  arweave: {
    url: "http://localhost:1984",
    timeout: 5000
  }
};
```

### 3. Test Setup Scripts

**before-integration-tests.ts**
```typescript
export async function setupIntegrationEnvironment() {
  // 1. Start Hardhat network
  await startHardhatNode();
  
  // 2. Deploy contracts
  await deployContracts();
  
  // 3. Start ArLocal
  await startArLocal();
  
  // 4. Start Offchain API
  await startOffchainApi();
  
  // 5. Start Event Processor
  await startEventProcessor();
  
  // 6. Wait for all services to be healthy
  await waitForServicesReady();
}
```

## Test Execution Strategy

### 1. Test Isolation
- Each test gets fresh contract deployments
- Event processor restarts between test suites
- Arweave data is isolated per test

### 2. Test Ordering
1. **Unit Tests**: Contract-only tests (already implemented)
2. **Component Tests**: Single service integration tests  
3. **Integration Tests**: Full stack tests
4. **Performance Tests**: Load and stress tests

### 3. CI/CD Integration
```yaml
# GitHub Actions workflow
name: Integration Tests
on: [push, pull_request]

jobs:
  integration-tests:
    runs-on: ubuntu-latest
    services:
      arlocal:
        image: textileio/arlocal:latest
        ports:
          - 1984:1984
    
    steps:
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Start Hardhat network
        run: pnpm hardhat node &
      
      - name: Start Offchain API
        run: pnpm --filter offchain-api start &
      
      - name: Run integration tests
        run: pnpm test:integration
```

## Success Criteria

### Functional Requirements
- ✅ Automatic enrichment completes within 10 seconds
- ✅ Manual enrichment completes within 10 seconds  
- ✅ All content types are handled correctly
- ✅ Error conditions are recorded properly
- ✅ Historical event processing works after restarts

### Performance Requirements
- ✅ Handle 10 concurrent enrichments without issues
- ✅ Process 100 targets within 2 minutes
- ✅ Memory usage stays under 512MB per service
- ✅ No memory leaks during long-running tests

### Reliability Requirements
- ✅ 99% enrichment success rate for valid URLs
- ✅ Graceful handling of service failures
- ✅ Data consistency between blockchain and Arweave
- ✅ Event ordering preserved under load

This comprehensive integration test suite will validate that our target enrichment migration from Airnode to Event Processor works reliably in production-like conditions.