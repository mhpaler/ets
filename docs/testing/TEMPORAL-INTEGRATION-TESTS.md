# Temporal Workflow Integration Tests Design

## Overview

This document outlines the design for comprehensive **full-stack integration tests** located in `/test/integration/` that validate the complete workflow orchestration across all ETS services. These tests validate the entire pipeline from contract events to enriched targets using the **Temporal Workflow architecture**.

## Test Architecture

### Local Stack Components
1. **Hardhat Network**: Local blockchain with deployed contracts
2. **Temporal Server**: Workflow orchestration with PostgreSQL backend  
3. **Temporal Processor**: Event listening and workflow execution
4. **Offchain API**: Processing enrichment requests
5. **ArLocal**: Local Arweave node for metadata storage

### Test Environment Setup
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Hardhat       │    │ Temporal Server │    │Temporal Processor│
│   (Port 8545)   │    │ (Port 7233)     │    │ (Event Listener) │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐    ┌─────────────────┐
                    │  Offchain API   │    │    ArLocal      │
                    │  (Port 4000)    │◄──►│  (Port 1984)    │
                    └─────────────────┘    └─────────────────┘
                                 │
                    ┌─────────────────┐
                    │  Temporal UI    │
                    │  (Port 8080)    │
                    └─────────────────┘
```

## Integration Test Categories

### 1. Temporal Workflow Orchestration Tests

**Test: TargetCreated Event → TargetEnrichmentWorkflow**
```typescript
describe("Temporal Target Enrichment Integration", () => {
  it("should complete TargetEnrichmentWorkflow from blockchain event", async () => {
    // 1. Create target on blockchain
    const targetURI = "https://example.com/temporal-test";
    const tx = await ETSTarget.createTarget(targetURI);
    
    // 2. Wait for TargetCreated event emission
    await expect(tx).to.emit(ETSTarget, "TargetCreated");
    
    // 3. Wait for Temporal workflow to complete
    await waitForWorkflowCompletion("TargetEnrichmentWorkflow", 10000);
    
    // 4. Verify target was enriched via workflow activities
    const target = await ETSTarget.getTargetById(targetId);
    expect(target.arweaveTxId).to.not.equal("");
    expect(target.httpStatus).to.equal(200);
    expect(target.enriched).to.not.equal(0);
    
    // 5. Verify workflow completed successfully in Temporal
    const workflowResult = await getWorkflowResult(workflowId);
    expect(workflowResult.status).to.equal("completed");
    expect(workflowResult.steps.fetchMetadata).to.be.true;
    expect(workflowResult.steps.uploadToArweave).to.be.true;
    expect(workflowResult.steps.updateBlockchain).to.be.true;
  });
});
```

### 2. TAG Coin Workflow Integration Tests

**Test: TagCreated Event → TagCreatedWorkflow**
```typescript
describe("Temporal TAG Coin Integration", () => {
  it("should complete TagCreatedWorkflow with Zora deployment", async () => {
    // 1. Create TAG on blockchain
    const tagString = "#TemporalTest";
    const tx = await ETSToken.createTags([tagString], relayerAddress);
    
    // 2. Wait for TagCreated event emission
    await expect(tx).to.emit(ETSToken, "TagCreated");
    
    // 3. Wait for Temporal workflow to complete
    await waitForWorkflowCompletion("TagCreatedWorkflow", 15000);
    
    // 4. Verify TAG coin was created via workflow activities
    const workflowResult = await getWorkflowResult(workflowId);
    expect(workflowResult.status).to.equal("completed");
    expect(workflowResult.steps.createMetadata).to.be.true;
    expect(workflowResult.steps.deployOnZora).to.be.true;
    expect(workflowResult.coinAddress).to.match(/^0x[a-fA-F0-9]{40}$/);
  });
});
```

### 3. Workflow Resilience Tests

**Test: Activity Failures → Temporal Retry Policies**
```typescript
describe("Temporal Workflow Resilience", () => {
  it("should retry failed activities according to retry policies", async () => {
    // 1. Configure API to fail initially then succeed
    await configureFailingAPI({ failuresBeforeSuccess: 2 });
    
    // 2. Trigger workflow
    await ETSTarget.createTarget("https://example.com/retry-test");
    
    // 3. Wait for workflow completion despite initial failures
    await waitForWorkflowCompletion("TargetEnrichmentWorkflow", 20000);
    
    // 4. Verify workflow eventually succeeded
    const workflowResult = await getWorkflowResult(workflowId);
    expect(workflowResult.status).to.equal("completed");
    
    // 5. Verify retry attempts in workflow history
    const workflowHistory = await getWorkflowHistory(workflowId);
    const retryAttempts = workflowHistory.filter(event => 
      event.type === "ActivityTaskFailed"
    );
    expect(retryAttempts).to.have.length(2);
  });
});
```

### 4. Temporal UI Monitoring Integration

**Test: Workflow Visibility → Temporal UI**
```typescript
describe("Temporal Workflow Monitoring", () => {
  it("should provide workflow visibility via Temporal UI", async () => {
    // 1. Start workflow
    const workflowId = await triggerTargetEnrichment("https://example.com/monitor-test");
    
    // 2. Query workflow status via Temporal client
    const workflowHandle = await temporalClient.workflow.getHandle(workflowId);
    const workflowInfo = await workflowHandle.describe();
    
    // 3. Verify workflow is visible and trackable
    expect(workflowInfo.workflowId).to.equal(workflowId);
    expect(workflowInfo.status.name).to.be.oneOf(["Running", "Completed"]);
    
    // 4. Wait for completion and verify final state
    const result = await workflowHandle.result();
    expect(result.status).to.equal("completed");
  });
});
```

### 5. Multi-Workflow Orchestration Tests

**Test: Concurrent Workflows → Resource Management**
```typescript
describe("Concurrent Temporal Workflows", () => {
  it("should handle multiple workflows without resource conflicts", async () => {
    const concurrentWorkflows = 10;
    const testTargets = Array.from({length: concurrentWorkflows}, (_, i) => 
      `https://example.com/concurrent-${i}`
    );
    
    // 1. Trigger multiple workflows simultaneously
    const workflowPromises = testTargets.map(async (uri) => {
      await ETSTarget.createTarget(uri);
      return waitForWorkflowCompletion("TargetEnrichmentWorkflow", 30000);
    });
    
    // 2. Wait for all workflows to complete
    const results = await Promise.all(workflowPromises);
    
    // 3. Verify all workflows completed successfully
    results.forEach(result => {
      expect(result.status).to.equal("completed");
    });
    
    // 4. Verify no resource conflicts occurred
    const failedActivities = await getFailedActivitiesCount();
    expect(failedActivities).to.equal(0);
  });
});
```

### 6. Temporal Server Recovery Tests

**Test: Temporal Server Restart → Workflow Continuation**
```typescript
describe("Temporal Server Recovery", () => {
  it("should continue workflows after server restart", async () => {
    // 1. Start long-running workflow
    const workflowId = await triggerTargetEnrichment("https://example.com/recovery-test");
    
    // 2. Restart Temporal server mid-workflow
    await restartTemporalServer();
    
    // 3. Verify workflow continues and completes
    await waitForWorkflowCompletion("TargetEnrichmentWorkflow", 30000, workflowId);
    
    // 4. Verify workflow completed successfully despite restart
    const workflowResult = await getWorkflowResult(workflowId);
    expect(workflowResult.status).to.equal("completed");
  });
});
```

## Test Infrastructure Requirements

### 1. Temporal Test Utilities

```typescript
// Temporal-specific test helper functions
export class TemporalTestUtils {
  static async waitForWorkflowCompletion(
    workflowType: string, 
    timeoutMs: number,
    workflowId?: string
  ): Promise<WorkflowResult> {
    // Poll Temporal for workflow completion
  }
  
  static async getWorkflowResult(workflowId: string): Promise<WorkflowExecutionResult> {
    // Fetch workflow result from Temporal
  }
  
  static async getWorkflowHistory(workflowId: string): Promise<WorkflowEvent[]> {
    // Get detailed workflow execution history
  }
  
  static async startTemporalStack(): Promise<void> {
    // Start Temporal server + processor for testing
  }
  
  static async stopTemporalStack(): Promise<void> {
    // Gracefully stop Temporal services
  }
  
  static async restartTemporalServer(): Promise<void> {
    // Restart Temporal server while preserving state
  }
}
```

### 2. Temporal Test Configuration

```typescript
// Temporal integration test configuration
export const temporalTestConfig = {
  temporal: {
    serverUrl: "localhost:7233",
    namespace: "test-namespace",
    taskQueue: "ets-workflows-test",
    ui: {
      url: "http://localhost:8080"
    }
  },
  workflows: {
    timeouts: {
      targetEnrichment: 10000,
      tagCreation: 15000,
      recovery: 30000
    }
  },
  services: {
    hardhat: {
      url: "http://localhost:8545",
      timeout: 30000
    },
    offchainApi: {
      url: "http://localhost:4000",
      timeout: 10000
    },
    arweave: {
      url: "http://localhost:1984",
      timeout: 5000
    }
  }
};
```

### 3. Test Setup Scripts

**setup-temporal-integration.ts**
```typescript
export async function setupTemporalIntegrationEnvironment() {
  // 1. Start Hardhat network
  await startHardhatNode();
  
  // 2. Deploy contracts with EVENT_PROCESSOR_ROLE
  await deployContracts();
  
  // 3. Start ArLocal
  await startArLocal();
  
  // 4. Start Offchain API
  await startOffchainApi();
  
  // 5. Start Temporal server with PostgreSQL
  await startTemporalServer();
  
  // 6. Start Temporal processor (worker + event listener)
  await startTemporalProcessor();
  
  // 7. Wait for all services including Temporal UI
  await waitForServicesReady();
}
```

## Temporal-Specific Test Execution Strategy

### 1. Workflow Isolation
- Each test gets unique workflow IDs
- Temporal namespaces isolate test runs
- Workflow state is reset between tests

### 2. Test Ordering
1. **Unit Tests**: Workflow logic in isolation (TestWorkflowEnvironment)
2. **Activity Tests**: Individual activity validation  
3. **Integration Tests**: Full stack with real Temporal server
4. **Resilience Tests**: Failure scenarios and recovery

### 3. CI/CD Integration
```yaml
# GitHub Actions workflow
name: Temporal Integration Tests
on: [push, pull_request]

jobs:
  temporal-integration-tests:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:13
        env:
          POSTGRES_PASSWORD: temporal
        ports:
          - 5432:5432
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
      
      - name: Start Temporal server
        run: |
          temporal server start-dev \
            --db-filename /tmp/temporal.db \
            --ui-port 8080 &
      
      - name: Start Hardhat network
        run: pnpm --filter contracts hardhat node &
      
      - name: Start Offchain API
        run: pnpm --filter offchain-api start &
      
      - name: Run Temporal integration tests
        run: pnpm test:integration:temporal
```

## Success Criteria

### Functional Requirements
- ✅ TargetEnrichmentWorkflow completes within 10 seconds
- ✅ TagCreatedWorkflow completes within 15 seconds  
- ✅ All workflow activities execute successfully
- ✅ Failed activities retry according to policies
- ✅ Workflow state persists through server restarts

### Performance Requirements
- ✅ Handle 10 concurrent workflows without issues
- ✅ Process 100 targets within 5 minutes via workflows
- ✅ Temporal UI remains responsive under load
- ✅ No workflow state corruption under concurrent load

### Reliability Requirements
- ✅ 99% workflow completion rate for valid inputs
- ✅ Graceful handling of activity failures
- ✅ Workflow visibility and debugging via Temporal UI
- ✅ State consistency across workflow restarts

This comprehensive Temporal integration test suite validates that our Event Processor → Temporal Workflow migration provides reliable, observable, and maintainable workflow orchestration.