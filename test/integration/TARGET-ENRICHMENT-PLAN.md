# Target Enrichment Integration Test Plan

## Overview

This document outlines the implementation plan for `target-enrichment.test.ts`, our comprehensive integration test for the target enrichment pipeline using the Event Processor architecture.

## Test Objectives

Validate the complete target enrichment flow:
1. **Automatic enrichment** triggered by TargetCreated events
2. **Manual enrichment** triggered by EnrichTargetRequested events  
3. **Error handling** for invalid/unreachable URLs
4. **Performance** under concurrent load
5. **Service recovery** after failures

## Environment Strategy

### Single Test, Multiple Environments

Use **one test suite with environment configuration** rather than separate test files:

```typescript
// Run tests with environment variable
ENVIRONMENT=local pnpm test:integration
ENVIRONMENT=staging pnpm test:integration
ENVIRONMENT=production pnpm test:integration
```

**Rationale:**
- Same test logic validates all environments
- Easier to maintain - single source of truth
- Environment-specific configurations handle differences
- Can run same test suite in CI/CD for different stages

### Environment Configurations

```typescript
interface EnvironmentConfig {
  name: string;
  rpcUrl: string;
  chainId: number;
  offchainApiUrl: string;
  arweaveUrl?: string;
  contracts?: ContractAddresses; // For staging/prod
  requiresEventProcessor: boolean;
  requiresLocalServices: boolean;
  accounts?: TestAccounts; // Different for each env
  timeouts: {
    enrichment: number;
    serviceHealth: number;
  };
}

const environments: Record<string, EnvironmentConfig> = {
  local: {
    name: 'Local Stack',
    rpcUrl: 'http://localhost:8545',
    chainId: 31337,
    offchainApiUrl: 'http://localhost:4000',
    arweaveUrl: 'http://localhost:1984',
    requiresEventProcessor: true,
    requiresLocalServices: true,
    accounts: TEST_ACCOUNTS, // Hardhat accounts
    timeouts: {
      enrichment: 15000,
      serviceHealth: 3000
    }
  },
  staging: {
    name: 'Staging (Sepolia)',
    rpcUrl: process.env.STAGING_RPC_URL || 'https://sepolia.infura.io/v3/...',
    chainId: 11155111,
    offchainApiUrl: 'https://api-staging.ets.xyz',
    arweaveUrl: 'https://arweave.net',
    contracts: SEPOLIA_CONTRACTS,
    requiresEventProcessor: false, // Already running
    requiresLocalServices: false,
    accounts: {
      // Use env vars for staging accounts
      tester: process.env.STAGING_TEST_PRIVATE_KEY
    },
    timeouts: {
      enrichment: 30000, // Slower on testnet
      serviceHealth: 5000
    }
  },
  production: {
    name: 'Production (Base)',
    rpcUrl: process.env.PROD_RPC_URL || 'https://mainnet.base.org',
    chainId: 8453,
    offchainApiUrl: 'https://api.ets.xyz',
    arweaveUrl: 'https://arweave.net',
    contracts: BASE_CONTRACTS,
    requiresEventProcessor: false,
    requiresLocalServices: false,
    accounts: {
      // Read-only testing - no private keys needed
      viewer: null
    },
    timeouts: {
      enrichment: 30000,
      serviceHealth: 5000
    }
  }
};
```

## Early Failure Strategy

### Pre-Test Health Checks

```typescript
before("Environment validation and setup", async function() {
  const env = environments[process.env.ENVIRONMENT || 'local'];
  console.log(`\n🔧 Setting up ${env.name} environment for integration testing...\n`);
  
  // 1. Check RPC connectivity
  try {
    provider = new ethers.JsonRpcProvider(env.rpcUrl);
    const network = await provider.getNetwork();
    if (network.chainId !== BigInt(env.chainId)) {
      throw new Error(`Chain ID mismatch: expected ${env.chainId}, got ${network.chainId}`);
    }
    console.log(`✅ Connected to ${env.name} (Chain ID: ${network.chainId})`);
  } catch (error) {
    console.error(`❌ Cannot connect to RPC at ${env.rpcUrl}`);
    console.error(`   Error: ${error.message}`);
    this.skip(); // Skip all tests if RPC is down
    return;
  }
  
  // 2. Check required services
  const serviceChecks = await validateRequiredServices(env);
  if (!serviceChecks.allHealthy) {
    console.error('\n❌ Required services are not available:');
    serviceChecks.failures.forEach(failure => {
      console.error(`   - ${failure.service}: ${failure.error}`);
    });
    
    if (env.requiresLocalServices) {
      console.error('\n💡 To start local services, run:');
      console.error('   ./scripts/start-core-stack.sh');
      console.error('   cd apps/offchain-api && pnpm dev');
      console.error('   npx arlocal');
    }
    
    this.skip(); // Skip all tests if required services are down
    return;
  }
  
  // 3. Validate contract deployments
  try {
    await validateContracts(env);
    console.log('✅ All required contracts are deployed and accessible');
  } catch (error) {
    console.error(`❌ Contract validation failed: ${error.message}`);
    
    if (env.name === 'Local Stack') {
      console.error('\n💡 To deploy contracts locally, run:');
      console.error('   pnpm hardhat deployETS --tags deployAll --network localhost');
    }
    
    this.skip();
    return;
  }
  
  // 4. Validate permissions (for write operations)
  if (env.accounts?.tester) {
    try {
      await validatePermissions(env);
      console.log('✅ Test account has required permissions');
    } catch (error) {
      console.error(`❌ Permission validation failed: ${error.message}`);
      this.skip();
      return;
    }
  }
  
  // 5. Start event processor (local only)
  if (env.requiresEventProcessor) {
    try {
      await startEventProcessor(env);
      console.log('✅ Event processor started successfully');
    } catch (error) {
      console.error(`❌ Failed to start event processor: ${error.message}`);
      this.skip();
      return;
    }
  }
  
  console.log(`\n✅ ${env.name} environment ready for testing\n`);
});
```

### Service Validation Functions

```typescript
async function validateRequiredServices(env: EnvironmentConfig): Promise<ServiceCheckResult> {
  const checks: ServiceCheck[] = [];
  
  // Always check offchain API
  checks.push({
    name: 'Offchain API',
    url: env.offchainApiUrl,
    endpoint: '/health',
    required: true
  });
  
  // Check Arweave if configured
  if (env.arweaveUrl) {
    checks.push({
      name: 'Arweave',
      url: env.arweaveUrl,
      endpoint: env.name === 'Local Stack' ? '/info' : '/tx/test',
      required: env.name === 'Local Stack' // Required for local, optional for others
    });
  }
  
  const results = await Promise.all(checks.map(async check => {
    try {
      const response = await axios.get(`${check.url}${check.endpoint}`, {
        timeout: env.timeouts.serviceHealth
      });
      return { ...check, healthy: true };
    } catch (error) {
      return { 
        ...check, 
        healthy: false, 
        error: error.message 
      };
    }
  }));
  
  const failures = results.filter(r => !r.healthy && r.required);
  return {
    allHealthy: failures.length === 0,
    results,
    failures
  };
}

async function validateContracts(env: EnvironmentConfig): Promise<void> {
  const addresses = env.contracts || await loadChainConfig(env.chainId);
  
  // Check each required contract
  const requiredContracts = [
    'ETSAccessControls',
    'ETSTarget', 
    'ETSEnrichTarget'
  ];
  
  for (const contractName of requiredContracts) {
    const address = addresses[contractName]?.address;
    if (!address) {
      throw new Error(`${contractName} address not found in configuration`);
    }
    
    const code = await provider.getCode(address);
    if (code === '0x') {
      throw new Error(`${contractName} not deployed at ${address}`);
    }
  }
}
```

### Environment-Specific Test Behavior

```typescript
describe("Target Enrichment Integration", function() {
  let env: EnvironmentConfig;
  
  before(async function() {
    env = environments[process.env.ENVIRONMENT || 'local'];
    // ... setup code ...
  });
  
  describe("Automatic Enrichment Flow", function() {
    it("should automatically enrich a newly created target", async function() {
      // Adjust timeout based on environment
      this.timeout(env.timeouts.enrichment + 5000);
      
      // Skip write tests in production
      if (env.name === 'Production (Base)') {
        console.log('⚠️  Skipping write test in production environment');
        this.skip();
        return;
      }
      
      // Test logic remains the same
      const targetURI = `https://example.com/test-${Date.now()}`;
      // ...
    });
  });
  
  describe("Read-Only Tests", function() {
    it("should verify existing enriched targets", async function() {
      // These tests work in all environments including production
      
      if (env.name === 'Production (Base)') {
        // Use known production target
        const knownTarget = await contracts.ETSTarget.getTargetById(KNOWN_PROD_TARGET_ID);
        expect(knownTarget.enriched).to.be.gt(0);
      } else {
        // Create and verify in test environments
        // ...
      }
    });
  });
});
```

## Architecture Under Test

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Hardhat       │    │ Event Processor │    │  Offchain API   │    │    ArLocal      │
│   (Port 8545)   │◄──►│  (Spawned)      │◄──►│  (Port 4000)    │◄──►│  (Port 1984)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Test Categories

### 1. Automatic Enrichment Flow ✅ (Implemented)

**Current Implementation:**
- Creates target via `ETSTarget.createTarget()`
- Verifies TargetCreated event emission
- Waits for enrichment completion (enriched timestamp > 0)
- Validates HTTP status and Arweave TX ID

**Enhancements Needed:**
- [ ] Verify actual metadata content from Arweave
- [ ] Test with different content types (HTML, JSON, images)
- [ ] Validate openGraph data extraction

### 2. Manual Enrichment Flow ✅ (Implemented)

**Current Implementation:**
- Creates target first
- Requests enrichment via `ETSEnrichTarget.requestEnrichTarget()`
- Verifies EnrichTargetRequested event
- Waits for enrichment completion

**Enhancements Needed:**
- [ ] Test re-enrichment of already enriched targets
- [ ] Test enrichment of targets created by different accounts
- [ ] Verify EVENT_PROCESSOR_ROLE permissions

### 3. Error Handling ✅ (Implemented)

**Current Implementation:**
- Tests with invalid domain that doesn't exist
- Verifies enrichment completes with error status
- Confirms no Arweave upload on error

**Enhancements Needed:**
- [ ] Test different HTTP error codes (404, 403, 500, timeout)
- [ ] Test malformed URLs
- [ ] Test extremely large content handling
- [ ] Test rate limiting scenarios

### 4. Content Type Handling 🔄 (To Implement)

**Test Cases:**
```typescript
const contentTypes = [
  {
    url: "https://example.com/page.html",
    expectedType: "text/html",
    expectedFields: ["title", "description", "openGraph", "favicon"]
  },
  {
    url: "https://api.example.com/data.json",
    expectedType: "application/json",
    expectedFields: ["contentType", "data"]
  },
  {
    url: "https://example.com/image.png",
    expectedType: "image/png",
    expectedFields: ["isImage", "mimeType", "dimensions"]
  },
  {
    url: "https://example.com/document.pdf",
    expectedType: "application/pdf",
    expectedFields: ["isPdf", "mimeType", "title"]
  }
];
```

### 5. Performance & Concurrency 🔄 (To Implement)

**Test Scenarios:**
- [ ] Create 10 targets simultaneously
- [ ] Verify all get enriched within reasonable time
- [ ] Check event processor doesn't miss events
- [ ] Monitor memory usage during batch processing
- [ ] Test queue ordering preservation

**Implementation:**
```typescript
it("should handle multiple concurrent enrichment requests", async function() {
  const targetCount = 10;
  const targetURIs = Array.from({length: targetCount}, (_, i) => 
    `https://example.com/concurrent-${i}-${Date.now()}`
  );
  
  // Create all targets at once
  const promises = targetURIs.map(uri => 
    contracts.ETSTarget.connect(signer).createTarget(uri)
  );
  await Promise.all(promises);
  
  // Wait for all enrichments
  const enrichmentPromises = targetURIs.map(uri => {
    const targetId = ethers.keccak256(ethers.toUtf8Bytes(uri));
    return waitForEnrichment(BigInt(targetId), 30000);
  });
  
  const results = await Promise.allSettled(enrichmentPromises);
  const successful = results.filter(r => r.status === 'fulfilled').length;
  
  expect(successful).to.equal(targetCount);
});
```

### 6. Service Recovery 🔄 (To Implement)

**Test Scenarios:**
- [ ] Event processor restart during enrichment
- [ ] Offchain API temporary unavailability
- [ ] Network interruptions
- [ ] Historical event processing after downtime

**Implementation Approach:**
```typescript
it("should recover from event processor restart", async function() {
  // Create target
  const uri1 = `https://example.com/before-restart-${Date.now()}`;
  await contracts.ETSTarget.connect(signer).createTarget(uri1);
  
  // Stop event processor
  if (eventProcessorProcess) {
    eventProcessorProcess.kill('SIGTERM');
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  // Create target while processor is down
  const uri2 = `https://example.com/during-downtime-${Date.now()}`;
  await contracts.ETSTarget.connect(signer).createTarget(uri2);
  
  // Restart event processor
  await startEventProcessor(eventProcessorSigner.privateKey);
  
  // Both targets should eventually be enriched
  const targetId2 = ethers.keccak256(ethers.toUtf8Bytes(uri2));
  const enriched = await waitForEnrichment(BigInt(targetId2), 20000);
  
  expect(enriched).to.be.true;
});
```

## Test Infrastructure Requirements

### Service Dependencies

1. **Required Services:**
   - Hardhat Network (localhost:8545)
   - Offchain API (localhost:4000) 
   - Event Processor (spawned by test)

2. **Optional Services:**
   - ArLocal (localhost:1984) - for real Arweave testing
   - Mock HTTP server - for controlled content type testing

### Helper Functions Needed

```typescript
// Existing helpers to enhance
async function waitForEnrichment(targetId: bigint, maxWaitMs: number): Promise<boolean>
async function checkServices(): Promise<ServiceStatus>
async function startEventProcessor(privateKey: string): Promise<void>

// New helpers to implement
async function fetchArweaveMetadata(txId: string): Promise<any>
async function setupMockResponse(url: string, response: MockResponse): Promise<void>
async function measureEnrichmentTime(targetId: bigint): Promise<number>
async function getEventProcessorLogs(): Promise<string[]>
```

### Mock Data Setup

For predictable testing, we need mock responses:

```typescript
interface MockResponse {
  status: number;
  contentType: string;
  body: string | object;
  headers?: Record<string, string>;
}

const mockResponses = {
  html: {
    status: 200,
    contentType: 'text/html',
    body: '<html><head><title>Test Page</title></head><body>Content</body></html>'
  },
  json: {
    status: 200,
    contentType: 'application/json',
    body: { data: 'test', timestamp: Date.now() }
  },
  notFound: {
    status: 404,
    contentType: 'text/plain',
    body: 'Not Found'
  }
};
```

## Test Execution Plan

### Phase 1: Core Functionality ✅
- [x] Basic automatic enrichment
- [x] Basic manual enrichment
- [x] Basic error handling

### Phase 2: Enhanced Testing 🔄
- [ ] Content type variations
- [ ] Concurrent enrichment handling
- [ ] Service recovery scenarios

### Phase 3: Performance & Reliability 📋
- [ ] Load testing (100+ targets)
- [ ] Memory leak detection
- [ ] Event ordering validation
- [ ] Race condition testing

## Success Metrics

### Functional
- ✅ All valid URLs enriched successfully
- ✅ All error cases handled gracefully
- ✅ Events processed in order
- ✅ Metadata correctly stored

### Performance
- ⏱️ Single enrichment < 5 seconds
- ⏱️ 10 concurrent enrichments < 15 seconds
- ⏱️ 100 targets processed < 2 minutes
- 💾 Memory usage < 256MB per service

### Reliability
- 🔄 99% success rate for valid URLs
- 🔄 100% recovery from service restarts
- 🔄 No data loss during failures
- 🔄 Consistent state after recovery

## Next Steps

1. **Immediate Priority:**
   - Fix service startup issues in current test
   - Implement content type testing
   - Add concurrent enrichment tests

2. **Short Term:**
   - Add service recovery tests
   - Implement mock HTTP server
   - Enhance logging and debugging

3. **Long Term:**
   - Performance benchmarking
   - CI/CD integration
   - Test result reporting dashboard

## Notes

- Tests should be idempotent and not depend on external services when possible
- Each test should clean up its state
- Use descriptive test names that explain the scenario
- Add comments explaining non-obvious test logic
- Consider test execution time - use appropriate timeouts