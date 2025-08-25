# Temporal Target Enrichment Integration Tests

**File**: `../../../test/integration/target-enrichment-v2.test.ts` (updated for Temporal)  
**Pipeline**: Target creation → Temporal workflow orchestration → metadata storage  
**Framework**: Temporal workflow validation with comprehensive testing

## Pipeline Overview

The target enrichment pipeline validates the complete **URL-to-metadata** workflow using Temporal workflow orchestration spanning 5 services with resilient async processing.

### Temporal Architecture Flow

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                   Temporal Target Enrichment Flow                                          │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

  [User/dApp]      [Blockchain]      [Temporal Processor]    [Temporal Server]     [Offchain API]    [ArLocal]
      │                 │                      │                      │                    │             │
      │                 │                      │                      │                    │             │
 1. createTarget()       │                      │                      │                    │             │
      ├─────────────────>│                      │                      │                    │             │
      │                 │                      │                      │                    │             │
      │          2. TargetCreated              │                      │                    │             │
      │             Event                      │                      │                    │             │
      │                 ├─────────────────────>│                      │                    │             │
      │                 │                      │                      │                    │             │
      │                 │            3. Start Workflow                │                    │             │
      │                 │                      ├─────────────────────>│                    │             │
      │                 │                      │                      │                    │             │
      │                 │                      │              4. Execute Activities        │             │
      │                 │                      │                      ├───────────────────>│             │
      │                 │                      │                      │                    ├────────────>│
      │                 │                      │                      │                    │             │
      │                 │                      │              5. Complete Workflow         │             │
      │                 │                      │◄─────────────────────┤                    │             │
      │                 │                      │                      │                    │             │
      │                 │            6. Update Blockchain             │                    │             │
      │                 │◄─────────────────────┤                      │                    │             │
      │                 │                      │                      │                    │             │
      │                 ├─────────────────────────────────────────────────────────────────────────────────>│
      ├─────────────────────────────────────────────────────────────────────────────────────────────────>│
```

### Temporal Workflow Activities

1. **fetchTargetMetadata**: Extract metadata from target URI
2. **uploadToArweave**: Store metadata on decentralized storage  
3. **updateTargetOnChain**: Record Arweave transaction ID on blockchain

## Integration Test Categories

### 1. Happy Path Workflow Tests

**Objective**: Validate successful end-to-end workflow execution

```typescript
describe("Temporal Target Enrichment - Happy Path", () => {
  it("should complete TargetEnrichmentWorkflow successfully", async () => {
    // Arrange
    const targetURI = "https://example.com/test-page";
    
    // Act
    const targetId = await contracts.etsTarget.createTarget(targetURI);
    const workflowResult = await waitForWorkflowCompletion(
      "TargetEnrichmentWorkflow",
      10000,
      { targetId }
    );
    
    // Assert - Workflow completed
    expect(workflowResult.status).to.equal("completed");
    expect(workflowResult.steps.fetchMetadata).to.be.true;
    expect(workflowResult.steps.uploadToArweave).to.be.true;
    expect(workflowResult.steps.updateBlockchain).to.be.true;
    
    // Assert - Blockchain state updated
    const target = await contracts.etsTarget.getTargetById(targetId);
    expect(target.arweaveTxId).to.not.be.empty;
    expect(target.enriched).to.be.greaterThan(0);
    
    // Assert - Arweave data accessible
    const metadata = await fetchArweaveData(target.arweaveTxId);
    expect(metadata.url).to.equal(targetURI);
    expect(metadata.title).to.be.a("string");
  });
});
```

### 2. Activity Retry Tests

**Objective**: Validate Temporal retry policies handle transient failures

```typescript
describe("Temporal Target Enrichment - Retry Logic", () => {
  it("should retry failed activities and eventually succeed", async () => {
    // Arrange - Configure API to fail initially
    await mockServer.configureFailures("fetchTargetMetadata", 2);
    
    const targetURI = "https://example.com/retry-test";
    
    // Act
    const targetId = await contracts.etsTarget.createTarget(targetURI);
    const workflowResult = await waitForWorkflowCompletion(
      "TargetEnrichmentWorkflow", 
      20000, // Longer timeout for retries
      { targetId }
    );
    
    // Assert - Workflow eventually succeeded
    expect(workflowResult.status).to.equal("completed");
    
    // Assert - Retries occurred
    const workflowHistory = await getWorkflowHistory(workflowResult.workflowId);
    const failedAttempts = workflowHistory.filter(e => 
      e.eventType === "ActivityTaskFailed" && 
      e.activityName === "fetchTargetMetadata"
    );
    expect(failedAttempts.length).to.equal(2);
  });
});
```

### 3. Partial Failure Tests

**Objective**: Test graceful degradation when some activities fail

```typescript
describe("Temporal Target Enrichment - Partial Failures", () => {
  it("should handle permanent activity failures gracefully", async () => {
    // Arrange - Configure permanent failure for blockchain update
    await mockContracts.configureFailure("updateTarget", true);
    
    const targetURI = "https://example.com/partial-failure";
    
    // Act
    const targetId = await contracts.etsTarget.createTarget(targetURI);
    const workflowResult = await waitForWorkflowCompletion(
      "TargetEnrichmentWorkflow",
      15000,
      { targetId }
    );
    
    // Assert - Workflow marked as partial success
    expect(workflowResult.status).to.equal("partial");
    expect(workflowResult.steps.fetchMetadata).to.be.true;
    expect(workflowResult.steps.uploadToArweave).to.be.true;
    expect(workflowResult.steps.updateBlockchain).to.be.false;
    
    // Assert - Arweave data still accessible
    expect(workflowResult.arweaveTransactionId).to.not.be.empty;
  });
});
```

### 4. Workflow Monitoring Tests

**Objective**: Validate workflow visibility and tracking

```typescript
describe("Temporal Target Enrichment - Monitoring", () => {
  it("should provide complete workflow visibility", async () => {
    const targetURI = "https://example.com/monitoring-test";
    
    // Act
    const targetId = await contracts.etsTarget.createTarget(targetURI);
    const workflowId = await getWorkflowIdForTarget(targetId);
    
    // Assert - Workflow is trackable
    const workflowHandle = await temporalClient.workflow.getHandle(workflowId);
    const workflowInfo = await workflowHandle.describe();
    
    expect(workflowInfo.workflowId).to.equal(workflowId);
    expect(workflowInfo.workflowType).to.equal("TargetEnrichmentWorkflow");
    expect(workflowInfo.taskQueue).to.equal("ets-workflows");
    
    // Wait for completion and verify
    const result = await workflowHandle.result();
    expect(result.status).to.equal("completed");
  });
});
```

### 5. Concurrent Workflow Tests

**Objective**: Validate multiple workflows execute without interference

```typescript
describe("Temporal Target Enrichment - Concurrency", () => {
  it("should handle multiple concurrent workflows", async () => {
    const concurrentCount = 10;
    const testURIs = Array.from({length: concurrentCount}, (_, i) => 
      `https://example.com/concurrent-${i}`
    );
    
    // Act - Trigger multiple workflows
    const workflowPromises = testURIs.map(async (uri) => {
      const targetId = await contracts.etsTarget.createTarget(uri);
      return waitForWorkflowCompletion("TargetEnrichmentWorkflow", 30000, { targetId });
    });
    
    const results = await Promise.all(workflowPromises);
    
    // Assert - All workflows completed successfully
    results.forEach((result, index) => {
      expect(result.status).to.equal("completed");
      expect(result.targetURI).to.equal(testURIs[index]);
    });
  });
});
```

### 6. Workflow Recovery Tests

**Objective**: Validate workflow continuation after service restarts

```typescript
describe("Temporal Target Enrichment - Recovery", () => {
  it("should continue workflows after Temporal server restart", async () => {
    // Only test in local environment
    if (process.env.ENVIRONMENT !== "local") return;
    
    const targetURI = "https://example.com/recovery-test";
    
    // Act - Start workflow
    const targetId = await contracts.etsTarget.createTarget(targetURI);
    const workflowId = await getWorkflowIdForTarget(targetId);
    
    // Restart Temporal server
    await restartTemporalServer();
    
    // Wait for workflow to continue and complete
    const workflowResult = await waitForWorkflowCompletion(
      "TargetEnrichmentWorkflow", 
      30000,
      { workflowId }
    );
    
    // Assert - Workflow completed despite restart
    expect(workflowResult.status).to.equal("completed");
  });
});
```

## Test Environment Setup

### Prerequisites
- Hardhat network running on localhost:8545
- Temporal server with PostgreSQL backend
- Temporal processor (worker + event listener) 
- Offchain API running on localhost:4000
- ArLocal running on localhost:1984

### Test Configuration

```typescript
export const targetEnrichmentTestConfig = {
  temporal: {
    serverUrl: "localhost:7233",
    namespace: "test",
    taskQueue: "ets-workflows-test",
    ui: "http://localhost:8080"
  },
  timeouts: {
    workflowCompletion: 10000,
    activityTimeout: 5000,
    workflowRetry: 20000,
    concurrent: 30000,
    recovery: 30000
  },
  testData: {
    validUrls: [
      "https://example.com",
      "https://github.com/ethereum-tag-service",
      "https://docs.temporal.io"
    ],
    invalidUrls: [
      "https://nonexistent.domain.invalid",
      "http://localhost:9999/not-found"
    ]
  }
};
```

### Mock Server Setup

```typescript
export class TargetEnrichmentMockServer {
  static async configureFailures(activityName: string, failureCount: number) {
    // Configure specific activity to fail specified number of times
  }
  
  static async setupResponseMocks(url: string, mockResponse: any) {
    // Setup HTTP response mocks for testing different content types
  }
  
  static async simulateSlowResponse(url: string, delayMs: number) {
    // Simulate slow API responses for timeout testing
  }
}
```

## Success Criteria

### Functional Requirements
- ✅ Happy path workflow completes in < 10 seconds
- ✅ Retry logic handles transient failures (2-3 attempts)
- ✅ Partial failures record available data  
- ✅ Concurrent workflows execute without conflicts
- ✅ Workflows survive service restarts

### Performance Requirements  
- ✅ Single workflow: < 10 seconds end-to-end
- ✅ 10 concurrent workflows: < 30 seconds total
- ✅ 100 workflows: < 5 minutes total
- ✅ Memory usage stable under load

### Observability Requirements
- ✅ All workflows visible in Temporal UI
- ✅ Activity execution history available
- ✅ Failed workflow debugging information accessible
- ✅ Workflow metrics collected for monitoring

### Reliability Requirements
- ✅ 99%+ success rate for valid URLs
- ✅ Graceful handling of invalid URLs
- ✅ Data consistency between blockchain and Arweave
- ✅ No workflow state corruption

This Temporal-based target enrichment integration test suite ensures reliable, observable, and maintainable workflow orchestration for the ETS target metadata pipeline.