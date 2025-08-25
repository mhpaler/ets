# Temporal TAG Coin Creation Integration Tests

**File**: `../../../test/integration/zora-tag-coin-v2.test.ts` (updated for Temporal)  
**Pipeline**: TAG creation → Temporal workflow orchestration → Zora coin deployment  
**Status**: Ready for Temporal workflow implementation

## Pipeline Overview

The TAG coin creation pipeline validates the complete **TAG-to-Zora-coin** workflow using Temporal workflow orchestration, integrating ETS TAG creation with Zora's coin deployment protocol for creator economics.

### Temporal Architecture Flow

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                   Temporal TAG Coin Creation Flow                                      │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────┘

    [User/dApp]      [ETS Contracts]      [Temporal Processor]    [Temporal Server]     [Zora Protocol]
        │                   │                      │                      │                    │
        │                   │                      │                      │                    │
   1. createTags()          │                      │                      │                    │
        ├──────────────────>│                      │                      │                    │
        │                   │                      │                      │                    │
        │             2. TagCreated                │                      │                    │
        │                Event                     │                      │                    │
        │                   ├─────────────────────>│                      │                    │
        │                   │                      │                      │                    │
        │                   │            3. Start TagCreatedWorkflow      │                    │
        │                   │                      ├─────────────────────>│                    │
        │                   │                      │                      │                    │
        │                   │                      │              4. Execute Activities        │
        │                   │                      │                      ├───────────────────>│
        │                   │                      │                      │                    │
        │                   │                      │              5. Complete Workflow         │
        │                   │                      │◄─────────────────────┤                    │
        │                   │                      │                      │                    │
        │                   │                      │              6. Allocate Rewards          │
        │                   │◄─────────────────────┤                      │                    │
        │                   │                      │                      │                    │
```

### Temporal Workflow Activities

1. **createTagCoinMetadata**: Generate metadata for TAG coin (name, symbol, image)
2. **deployTagCoinOnZora**: Deploy ERC-20 coin on Zora protocol
3. **allocateCreatorRewards**: Distribute initial rewards to TAG creator

## Integration Test Categories

### 1. Happy Path Workflow Tests

**Objective**: Validate successful TAG coin creation via Temporal workflow

```typescript
describe("Temporal TAG Coin Creation - Happy Path", () => {
  it("should complete TagCreatedWorkflow with Zora deployment", async () => {
    // Arrange
    const tagString = "#TemporalTagCoin";
    const relayerAddress = await getRelayerAddress();
    
    // Act
    const tx = await contracts.etsToken.createTags([tagString], relayerAddress);
    const receipt = await tx.wait();
    const tagId = extractTagIdFromReceipt(receipt);
    
    const workflowResult = await waitForWorkflowCompletion(
      "TagCreatedWorkflow",
      15000,
      { tagId }
    );
    
    // Assert - Workflow completed
    expect(workflowResult.status).to.equal("completed");
    expect(workflowResult.steps.createMetadata).to.be.true;
    expect(workflowResult.steps.deployOnZora).to.be.true;
    expect(workflowResult.steps.allocateRewards).to.be.true;
    
    // Assert - Zora coin deployed
    expect(workflowResult.coinAddress).to.match(/^0x[a-fA-F0-9]{40}$/);
    expect(workflowResult.zoraTxHash).to.not.be.empty;
    
    // Assert - Coin metadata accessible
    const coinMetadata = await fetchCoinMetadata(workflowResult.coinAddress);
    expect(coinMetadata.name).to.include(tagString.slice(1)); // Remove #
    expect(coinMetadata.symbol).to.equal("ETS");
  });
});
```

### 2. Metadata Generation Tests

**Objective**: Validate TAG coin metadata creation activity

```typescript
describe("Temporal TAG Coin - Metadata Generation", () => {
  it("should generate proper TAG coin metadata", async () => {
    // Arrange
    const tagString = "#TestMetadata";
    const tagId = "12345";
    const creator = "0x1234567890abcdef1234567890abcdef12345678";
    const coinAddress = "0xabcdef1234567890abcdef1234567890abcdef12";
    
    // Act
    const workflowResult = await runTagCreatedWorkflow({
      tagId,
      coinAddress,
      tagString,
      creator,
      transactionHash: "0x123abc",
      blockNumber: 100n,
      chainId: 31337,
      timestamp: new Date()
    });
    
    // Assert - Metadata structure
    expect(workflowResult.metadata).to.deep.include({
      name: "TestMetadata",
      symbol: "ETS",
      description: "ETS TAG Coin for #TestMetadata",
      creator: creator,
      coinAddress: coinAddress
    });
    
    expect(workflowResult.metadata.image).to.be.a("string");
    expect(workflowResult.metadata.attributes).to.be.an("array");
  });
});
```

### 3. Zora Integration Tests

**Objective**: Validate Zora coin deployment activity

```typescript
describe("Temporal TAG Coin - Zora Integration", () => {
  it("should deploy coin on Zora protocol", async () => {
    const tagString = "#ZoraIntegration";
    
    // Act
    const tx = await contracts.etsToken.createTags([tagString], relayerAddress);
    const receipt = await tx.wait();
    const tagId = extractTagIdFromReceipt(receipt);
    
    const workflowResult = await waitForWorkflowCompletion(
      "TagCreatedWorkflow",
      20000, // Longer timeout for Zora deployment
      { tagId }
    );
    
    // Assert - Zora deployment succeeded
    expect(workflowResult.status).to.equal("completed");
    expect(workflowResult.coinAddress).to.match(/^0x[a-fA-F0-9]{40}$/);
    
    // Assert - Coin contract is functional
    const coin = await ethers.getContractAt("IERC20", workflowResult.coinAddress);
    const name = await coin.name();
    const symbol = await coin.symbol();
    const totalSupply = await coin.totalSupply();
    
    expect(name).to.include("ZoraIntegration");
    expect(symbol).to.equal("ETS");
    expect(totalSupply).to.be.greaterThan(0);
  });
});
```

### 4. Creator Rewards Tests

**Objective**: Validate creator reward allocation activity

```typescript
describe("Temporal TAG Coin - Creator Rewards", () => {
  it("should allocate initial rewards to TAG creator", async () => {
    const tagString = "#CreatorRewards";
    const creatorAddress = await getCreatorAddress();
    
    // Act
    const tx = await contracts.etsToken.createTags([tagString], relayerAddress, {
      from: creatorAddress
    });
    const receipt = await tx.wait();
    const tagId = extractTagIdFromReceipt(receipt);
    
    const workflowResult = await waitForWorkflowCompletion(
      "TagCreatedWorkflow",
      15000,
      { tagId }
    );
    
    // Assert - Rewards allocated
    expect(workflowResult.status).to.equal("completed");
    expect(workflowResult.steps.allocateRewards).to.be.true;
    
    // Assert - Creator received coin balance
    const coin = await ethers.getContractAt("IERC20", workflowResult.coinAddress);
    const creatorBalance = await coin.balanceOf(creatorAddress);
    
    expect(creatorBalance).to.be.greaterThan(0);
    
    // Verify reward allocation in workflow result
    expect(workflowResult.rewardAllocation).to.deep.include({
      recipient: creatorAddress,
      amount: creatorBalance.toString(),
      type: "creator_initial"
    });
  });
});
```

### 5. Workflow Error Handling Tests

**Objective**: Test workflow resilience with Zora deployment failures

```typescript
describe("Temporal TAG Coin - Error Handling", () => {
  it("should handle Zora deployment failures gracefully", async () => {
    // Arrange - Configure Zora mock to fail deployment
    await mockZoraFactory.configureFailure("deployTagCoin", true);
    
    const tagString = "#DeploymentFailure";
    
    // Act
    const tx = await contracts.etsToken.createTags([tagString], relayerAddress);
    const receipt = await tx.wait();
    const tagId = extractTagIdFromReceipt(receipt);
    
    const workflowResult = await waitForWorkflowCompletion(
      "TagCreatedWorkflow",
      20000, // Allow time for retries
      { tagId }
    );
    
    // Assert - Workflow marked as failed/partial
    expect(workflowResult.status).to.be.oneOf(["failed", "partial"]);
    expect(workflowResult.steps.createMetadata).to.be.true;
    expect(workflowResult.steps.deployOnZora).to.be.false;
    expect(workflowResult.error).to.contain("Zora deployment failed");
    
    // Assert - Metadata was still created
    expect(workflowResult.metadataURI).to.not.be.empty;
  });
});
```

### 6. Concurrent TAG Creation Tests

**Objective**: Validate multiple TAG coin creations don't interfere

```typescript
describe("Temporal TAG Coin - Concurrency", () => {
  it("should handle multiple TAG coin creations simultaneously", async () => {
    const tagStrings = [
      "#ConcurrentTag1",
      "#ConcurrentTag2", 
      "#ConcurrentTag3",
      "#ConcurrentTag4",
      "#ConcurrentTag5"
    ];
    
    // Act - Create multiple TAGs simultaneously
    const creationPromises = tagStrings.map(async (tagString) => {
      const tx = await contracts.etsToken.createTags([tagString], relayerAddress);
      const receipt = await tx.wait();
      const tagId = extractTagIdFromReceipt(receipt);
      
      return waitForWorkflowCompletion("TagCreatedWorkflow", 30000, { tagId });
    });
    
    const results = await Promise.all(creationPromises);
    
    // Assert - All workflows completed successfully
    results.forEach((result, index) => {
      expect(result.status).to.equal("completed");
      expect(result.coinAddress).to.match(/^0x[a-fA-F0-9]{40}$/);
      expect(result.tagString).to.equal(tagStrings[index]);
    });
    
    // Assert - All coin addresses are unique
    const coinAddresses = results.map(r => r.coinAddress);
    const uniqueAddresses = [...new Set(coinAddresses)];
    expect(uniqueAddresses).to.have.length(coinAddresses.length);
  });
});
```

### 7. Long-Running Workflow Tests

**Objective**: Validate workflow completion for slow Zora deployments

```typescript
describe("Temporal TAG Coin - Long-Running Workflows", () => {
  it("should complete workflows with slow Zora responses", async () => {
    // Arrange - Configure slow Zora deployment (10 seconds)
    await mockZoraFactory.configureSlowResponse("deployTagCoin", 10000);
    
    const tagString = "#SlowDeployment";
    
    // Act
    const tx = await contracts.etsToken.createTags([tagString], relayerAddress);
    const receipt = await tx.wait();
    const tagId = extractTagIdFromReceipt(receipt);
    
    const workflowResult = await waitForWorkflowCompletion(
      "TagCreatedWorkflow",
      30000, // Extended timeout for slow deployment
      { tagId }
    );
    
    // Assert - Workflow completed despite slow response
    expect(workflowResult.status).to.equal("completed");
    expect(workflowResult.coinAddress).to.match(/^0x[a-fA-F0-9]{40}$/);
    expect(workflowResult.executionTime).to.be.greaterThan(10000);
  });
});
```

## Test Environment Setup

### Prerequisites
- Hardhat network with deployed ETS contracts
- Temporal server with TAG coin workflow definitions
- Temporal processor monitoring TagCreated events
- Mock Zora factory for local testing
- Offchain API for metadata generation

### Test Configuration

```typescript
export const tagCoinTestConfig = {
  temporal: {
    serverUrl: "localhost:7233",
    namespace: "test",
    taskQueue: "ets-workflows-test"
  },
  timeouts: {
    workflowCompletion: 15000,
    zoraDeployment: 20000,
    concurrent: 30000,
    longRunning: 30000
  },
  zora: {
    mockFactory: "0x1234567890abcdef1234567890abcdef12345678",
    initialSupply: "1000000000000000000000", // 1000 tokens
    creatorRewardPercent: 10
  },
  testTags: [
    "#TestTag1",
    "#TestTag2", 
    "#SpecialCharacters$",
    "#LongTagNameForTesting123456789"
  ]
};
```

### Mock Zora Factory

```typescript
export class MockZoraFactory {
  static async configureFailure(method: string, shouldFail: boolean) {
    // Configure specific Zora methods to fail for testing
  }
  
  static async configureSlowResponse(method: string, delayMs: number) {
    // Simulate slow Zora responses for timeout testing
  }
  
  static async getDeployedCoins(): Promise<string[]> {
    // Get list of coins deployed during testing
  }
}
```

## Success Criteria

### Functional Requirements
- ✅ TAG coin creation workflow completes in < 15 seconds
- ✅ Zora coin deployment succeeds with proper metadata
- ✅ Creator rewards allocated correctly
- ✅ Multiple TAGs create unique coin addresses
- ✅ Failed deployments handled gracefully

### Performance Requirements
- ✅ Single TAG coin creation: < 15 seconds
- ✅ 5 concurrent TAG creations: < 30 seconds
- ✅ Slow Zora responses handled within 30 seconds
- ✅ Memory usage stable during concurrent operations

### Integration Requirements
- ✅ ETS contracts emit TagCreated events correctly
- ✅ Temporal workflows triggered by blockchain events
- ✅ Zora protocol integration functional
- ✅ Metadata generation and storage working
- ✅ Creator economics properly implemented

### Monitoring Requirements
- ✅ All workflows visible in Temporal UI
- ✅ Zora deployment transactions tracked
- ✅ Creator reward allocations logged
- ✅ Failed deployments debuggable

This Temporal-based TAG coin creation integration test suite ensures reliable, observable workflow orchestration for the complete TAG-to-Zora-coin pipeline.