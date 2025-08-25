# Temporal Workflow Integration Test Plan

## Overview

This document outlines the implementation plan for Temporal workflow integration tests, validating our comprehensive workflow orchestration pipeline using the Temporal architecture.

## Test Objectives

Validate complete Temporal workflow orchestration:
1. **TargetEnrichmentWorkflow** triggered by TargetCreated events
2. **TagCreatedWorkflow** triggered by TagCreated events  
3. **Activity retry policies** for resilient execution
4. **Workflow monitoring** via Temporal UI
5. **Service recovery** with workflow continuation

## Environment Strategy

### Single Test Suite, Multiple Environments

Use **one test suite with environment configuration** for consistency:

```typescript
// Run tests with environment variable
ENVIRONMENT=local pnpm test:integration:temporal
ENVIRONMENT=staging pnpm test:integration:temporal
ENVIRONMENT=production pnpm test:integration:temporal
```

**Rationale:**
- Same workflow logic validates all environments
- Easier to maintain - single source of truth
- Environment-specific configurations handle differences
- Temporal Cloud vs local server differences abstracted

### Environment Configurations

```typescript
interface TemporalEnvironmentConfig {
  name: string;
  rpcUrl: string;
  chainId: number;
  offchainApiUrl: string;
  arweaveUrl?: string;
  temporal: {
    serverUrl: string;
    namespace: string;
    taskQueue: string;
    isCloud: boolean;
    clientCert?: string;
    clientKey?: string;
  };
  contracts?: ContractAddresses; // For staging/prod
  requiresLocalServices: boolean;
  accounts?: TestAccounts;
  timeouts: {
    workflowCompletion: number;
    activityTimeout: number;
    serviceHealth: number;
  };
}
```

### Local Environment Config
```typescript
const localConfig: TemporalEnvironmentConfig = {
  name: "local",
  rpcUrl: "http://localhost:8545",
  chainId: 31337,
  offchainApiUrl: "http://localhost:4000", 
  arweaveUrl: "http://localhost:1984",
  temporal: {
    serverUrl: "localhost:7233",
    namespace: "default",
    taskQueue: "ets-workflows-test",
    isCloud: false
  },
  requiresLocalServices: true,
  timeouts: {
    workflowCompletion: 10000,
    activityTimeout: 5000,
    serviceHealth: 30000
  }
};
```

### Staging Environment Config  
```typescript
const stagingConfig: TemporalEnvironmentConfig = {
  name: "staging",
  rpcUrl: "https://base-sepolia.g.alchemy.com/v2/API_KEY",
  chainId: 84532, // Base Sepolia
  offchainApiUrl: "https://staging-api.ets.domains",
  temporal: {
    serverUrl: "staging-namespace.tmprl.cloud:7233",
    namespace: "staging-namespace.account-id",
    taskQueue: "ets-workflows-staging",
    isCloud: true,
    clientCert: process.env.TEMPORAL_CLIENT_CERT,
    clientKey: process.env.TEMPORAL_CLIENT_KEY
  },
  requiresLocalServices: false,
  timeouts: {
    workflowCompletion: 30000,
    activityTimeout: 15000,
    serviceHealth: 60000
  }
};
```

## Test Implementation Structure

### 1. Core Workflow Tests

**File: `temporal-workflows.test.ts`**

```typescript
describe("Temporal Workflow Integration", () => {
  let config: TemporalEnvironmentConfig;
  let temporalClient: Client;
  
  beforeAll(async () => {
    config = getEnvironmentConfig();
    temporalClient = await setupTemporalClient(config);
    
    if (config.requiresLocalServices) {
      await startLocalStack();
    }
  });

  describe("TargetEnrichmentWorkflow", () => {
    it("should complete full enrichment workflow", async () => {
      // Implementation focuses on workflow orchestration
      const targetURI = `https://example.com/test-${Date.now()}`;
      
      // 1. Create target to trigger workflow
      const targetId = await createTargetOnChain(targetURI);
      
      // 2. Wait for workflow completion
      const workflowResult = await waitForWorkflowCompletion(
        "TargetEnrichmentWorkflow", 
        config.timeouts.workflowCompletion,
        { targetId }
      );
      
      // 3. Verify workflow completed successfully
      expect(workflowResult.status).to.equal("completed");
      expect(workflowResult.steps).to.deep.include({
        fetchMetadata: true,
        uploadToArweave: true, 
        updateBlockchain: true
      });
      
      // 4. Verify on-chain state was updated
      const target = await getTargetById(targetId);
      expect(target.arweaveTxId).to.not.be.empty;
    });
  });

  describe("TagCreatedWorkflow", () => {
    it("should complete TAG coin creation workflow", async () => {
      const tagString = `#Test${Date.now()}`;
      
      // 1. Create TAG to trigger workflow  
      const tagId = await createTagOnChain(tagString);
      
      // 2. Wait for workflow completion
      const workflowResult = await waitForWorkflowCompletion(
        "TagCreatedWorkflow",
        config.timeouts.workflowCompletion,
        { tagId }
      );
      
      // 3. Verify workflow orchestration
      expect(workflowResult.status).to.equal("completed");
      expect(workflowResult.steps).to.deep.include({
        createMetadata: true,
        deployOnZora: true,
        allocateRewards: true
      });
      
      // 4. Verify Zora coin deployment
      expect(workflowResult.coinAddress).to.match(/^0x[a-fA-F0-9]{40}$/);
    });
  });
});
```

### 2. Activity-Level Tests

**File: `temporal-activities.test.ts`**

```typescript
describe("Temporal Activity Integration", () => {
  describe("fetchTargetMetadata activity", () => {
    it("should fetch and validate target metadata", async () => {
      const result = await runActivity("fetchTargetMetadata", {
        targetId: "123",
        targetURI: "https://example.com"
      });
      
      expect(result.status).to.equal("success");
      expect(result.title).to.be.a("string");
      expect(result.description).to.be.a("string");
    });
  });

  describe("uploadToArweave activity", () => {
    it("should upload metadata to Arweave", async () => {
      const metadata = { title: "Test", url: "https://example.com" };
      
      const result = await runActivity("uploadToArweave", {
        targetId: "123",
        metadata
      });
      
      expect(result.status).to.equal("success");
      expect(result.transactionId).to.be.a("string");
      expect(result.gatewayUrl).to.include(result.transactionId);
    });
  });
});
```

### 3. Resilience Tests

**File: `temporal-resilience.test.ts`**

```typescript
describe("Temporal Workflow Resilience", () => {
  it("should retry failed activities", async () => {
    // Configure API to fail initially
    await configureTemporaryAPIFailure(2); // Fail 2 times then succeed
    
    const targetURI = "https://example.com/retry-test";
    const targetId = await createTargetOnChain(targetURI);
    
    // Workflow should eventually succeed despite initial failures
    const workflowResult = await waitForWorkflowCompletion(
      "TargetEnrichmentWorkflow",
      config.timeouts.workflowCompletion * 3, // Longer timeout for retries
      { targetId }
    );
    
    expect(workflowResult.status).to.equal("completed");
    
    // Verify retries occurred
    const workflowHistory = await getWorkflowHistory(workflowResult.workflowId);
    const retryEvents = workflowHistory.filter(e => e.type === "ActivityTaskFailed");
    expect(retryEvents.length).to.be.greaterThan(0);
  });

  it("should handle Temporal server restart", async () => {
    const targetURI = "https://example.com/restart-test";
    const targetId = await createTargetOnChain(targetURI);
    
    // Start workflow
    const workflowId = await getWorkflowIdForTarget(targetId);
    
    // Restart Temporal server mid-execution (local only)
    if (config.name === "local") {
      await restartTemporalServer();
    }
    
    // Workflow should continue and complete
    const workflowResult = await waitForWorkflowCompletion(
      "TargetEnrichmentWorkflow",
      config.timeouts.workflowCompletion * 2,
      { workflowId }
    );
    
    expect(workflowResult.status).to.equal("completed");
  });
});
```

### 4. Monitoring Tests

**File: `temporal-monitoring.test.ts`**

```typescript
describe("Temporal Workflow Monitoring", () => {
  it("should provide workflow visibility", async () => {
    const targetURI = "https://example.com/monitoring-test";
    const targetId = await createTargetOnChain(targetURI);
    const workflowId = await getWorkflowIdForTarget(targetId);
    
    // Query workflow status
    const workflowHandle = await temporalClient.workflow.getHandle(workflowId);
    const workflowInfo = await workflowHandle.describe();
    
    expect(workflowInfo.workflowId).to.equal(workflowId);
    expect(workflowInfo.workflowType).to.equal("TargetEnrichmentWorkflow");
    expect(workflowInfo.status.name).to.be.oneOf(["Running", "Completed"]);
    
    // Wait for completion and verify result
    const result = await workflowHandle.result();
    expect(result.status).to.equal("completed");
  });

  it("should track workflow metrics", async () => {
    // Create multiple workflows for metrics
    const workflows = await Promise.all([
      createTargetOnChain("https://example.com/metrics-1"),
      createTargetOnChain("https://example.com/metrics-2"),
      createTargetOnChain("https://example.com/metrics-3")
    ]);
    
    // Wait for all to complete
    await Promise.all(workflows.map(targetId =>
      waitForWorkflowCompletion("TargetEnrichmentWorkflow", 30000, { targetId })
    ));
    
    // Verify metrics are tracked (would integrate with Temporal metrics)
    const metrics = await getWorkflowMetrics("TargetEnrichmentWorkflow");
    expect(metrics.completedCount).to.be.greaterThan(0);
    expect(metrics.averageDuration).to.be.a("number");
  });
});
```

## Test Utilities

### Temporal Client Helpers

```typescript
export class TemporalTestHelpers {
  static async setupTemporalClient(config: TemporalEnvironmentConfig): Promise<Client> {
    const connectionOptions: any = {
      address: config.temporal.serverUrl
    };
    
    if (config.temporal.isCloud) {
      connectionOptions.tls = {
        clientCertPair: {
          crt: Buffer.from(config.temporal.clientCert!, "base64"),
          key: Buffer.from(config.temporal.clientKey!, "base64")
        }
      };
    }
    
    const connection = await NativeConnection.connect(connectionOptions);
    return new Client({ connection, namespace: config.temporal.namespace });
  }
  
  static async waitForWorkflowCompletion(
    workflowType: string,
    timeoutMs: number,
    searchParams: { targetId?: string; tagId?: string; workflowId?: string }
  ): Promise<WorkflowResult> {
    // Implementation polls for workflow completion
  }
  
  static async getWorkflowHistory(workflowId: string): Promise<WorkflowEvent[]> {
    // Get detailed workflow execution history from Temporal
  }
  
  static async runActivity(activityName: string, input: any): Promise<any> {
    // Run individual activity for testing
  }
}
```

### Environment Management

```typescript
export class TemporalEnvironmentManager {
  static async startLocalStack(): Promise<void> {
    // Start full local stack including Temporal server
    await execAsync("./scripts/start-local-stack.sh --temporal");
    await waitForServicesHealthy();
  }
  
  static async stopLocalStack(): Promise<void> {
    // Gracefully stop all local services
    await execAsync("pkill -f temporal");
    await execAsync("pkill -f hardhat");
  }
  
  static async restartTemporalServer(): Promise<void> {
    // Restart only Temporal server, preserving state
    await execAsync("docker compose restart temporal");
    await waitForTemporalHealthy();
  }
}
```

## CI/CD Pipeline Integration

### GitHub Actions Workflow

```yaml
name: Temporal Integration Tests

on:
  push:
    branches: [main, stage]
  pull_request:
    branches: [main, stage]

jobs:
  temporal-local-tests:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:13
        env:
          POSTGRES_PASSWORD: temporal
          POSTGRES_DB: temporal
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'pnpm'
          
      - name: Install dependencies
        run: pnpm install
        
      - name: Install Temporal CLI
        run: |
          curl -sSf https://temporal.download/cli.sh | sh
          sudo mv temporal /usr/local/bin/
          
      - name: Start Temporal server
        run: |
          temporal server start-dev \
            --db-filename /tmp/temporal.db \
            --ui-port 8080 \
            --log-level error &
          sleep 10
          
      - name: Start local services
        run: |
          ./scripts/start-local-stack.sh --core &
          sleep 30
          
      - name: Run Temporal integration tests
        run: |
          ENVIRONMENT=local pnpm test:integration:temporal
        env:
          TEST_PRIVATE_KEY: ${{ secrets.TEST_PRIVATE_KEY }}
          
      - name: Upload Temporal logs
        if: failure()
        uses: actions/upload-artifact@v3
        with:
          name: temporal-logs
          path: /tmp/temporal.db
          
  temporal-staging-tests:
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/stage'
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Run staging tests
        run: |
          ENVIRONMENT=staging pnpm test:integration:temporal
        env:
          TEMPORAL_CLIENT_CERT: ${{ secrets.TEMPORAL_STAGING_CERT }}
          TEMPORAL_CLIENT_KEY: ${{ secrets.TEMPORAL_STAGING_KEY }}
          STAGING_PRIVATE_KEY: ${{ secrets.STAGING_PRIVATE_KEY }}
          ALCHEMY_API_KEY: ${{ secrets.ALCHEMY_API_KEY }}
```

## Success Metrics

### Workflow Execution Metrics
- ✅ TargetEnrichmentWorkflow completion: < 10 seconds  
- ✅ TagCreatedWorkflow completion: < 15 seconds
- ✅ Workflow success rate: > 99%
- ✅ Activity retry success rate: > 95%

### Monitoring & Observability
- ✅ All workflows visible in Temporal UI
- ✅ Activity execution history available
- ✅ Workflow metrics collected and queryable  
- ✅ Failed workflow debugging information accessible

### Resilience Requirements
- ✅ Workflows survive Temporal server restarts
- ✅ Activities retry on transient failures
- ✅ Workflow state remains consistent
- ✅ Long-running workflows complete successfully

This comprehensive Temporal workflow testing plan ensures our migration from Event Processor to Temporal provides reliable, observable, and maintainable workflow orchestration across all deployment environments.