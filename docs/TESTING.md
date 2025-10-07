# ETS Monorepo Testing Documentation

> **Living Document**: Last updated October 2024
> This document describes the testing strategy, structure, and execution for the Ethereum Tag Service monorepo.

## Table of Contents
- [Overview](#overview)
- [Test Suite Architecture](#test-suite-architecture)
- [Running Tests](#running-tests)
- [Test Categories](#test-categories)
- [Environment Setup](#environment-setup)
- [CI/CD Integration](#cicd-integration)
- [Local Development](#local-development)
- [Troubleshooting](#troubleshooting)

## Overview

The ETS monorepo employs a comprehensive testing strategy across multiple layers:

1. **Unit Tests**: Isolated component testing with mocked dependencies
2. **Integration Tests**: End-to-end testing with real services
3. **Contract Tests**: Solidity smart contract testing
4. **E2E Tests**: Full system testing including blockchain and external services

### Key Principles
- **Test Isolation**: Each test suite should be runnable independently
- **Environment Awareness**: Tests adapt to local/staging/production environments
- **Fast Feedback**: Unit tests run quickly for rapid development
- **Comprehensive Coverage**: Critical paths have multiple test layers

## Test Suite Architecture

```
ets/
├── packages/
│   ├── contracts/
│   │   └── test/           # Hardhat contract tests
│   ├── ets-cli/
│   │   └── tests/          # CLI unit tests
│   └── subgraph/
│       └── tests/          # Subgraph tests
├── apps/
│   ├── app/
│   │   └── __tests__/      # Next.js app tests
│   └── temporal-processor/
│       └── tests/
│           ├── workflows/  # Temporal workflow tests
│           └── unit/       # Service unit tests
└── test/
    └── integration/        # Cross-system integration tests
```

## Running Tests

### Quick Start
```bash
# Run all tests
pnpm test

# Run specific workspace tests
pnpm --filter @ethereum-tag-service/contracts test
pnpm --filter temporal-processor test

# Run integration tests (requires services)
./scripts/start-local-stack.sh
pnpm test:integration
```

### Test Commands by Package

#### Smart Contracts (`packages/contracts`)
```bash
# Run all contract tests
pnpm hardhat:test

# Run specific test file
pnpm hardhat test test/ETSTarget.test.ts

# Run with coverage
pnpm hardhat coverage

# Run with gas reporting
REPORT_GAS=true pnpm hardhat:test
```

#### Temporal Processor (`apps/temporal-processor`)
```bash
# Unit tests for workflows
pnpm test

# Run specific workflow test
pnpm test tagCreatedWorkflow.test.ts

# Run enhanced test suite
pnpm test tagCreatedWorkflow.enhanced.test.ts

# Run metadata extraction tests (network-dependent)
pnpm test:metadata-extraction
```

#### CLI Tools (`packages/ets-cli`)
```bash
# Run CLI tests
pnpm test

# Test specific command
pnpm test -- --testNamePattern "info command"
```

#### Integration Tests (`test/integration`)
```bash
# From monorepo root
# Requires local stack running
./scripts/start-local-stack.sh

# Run all integration tests
bun test test/integration/

# Run specific integration test
bun test test/integration/target-enrichment.test.ts
```

## Test Categories

### 1. Unit Tests
**Purpose**: Test individual functions and components in isolation

**Characteristics**:
- Fast execution (< 10ms per test)
- No external dependencies
- Mocked services and databases
- Deterministic results

**Examples**:
- `tagCreatedWorkflow.test.ts` - Tests Temporal workflow logic
- `tagCoinActivities.test.ts` - Tests activity functions
- Contract unit tests in `packages/contracts/test/`

### 2. Integration Tests
**Purpose**: Test interactions between multiple components

**Characteristics**:
- May require local services (blockchain, Temporal, databases)
- Slower execution (seconds to minutes)
- Tests real data flow
- Environment-specific configuration

**Examples**:
- `target-enrichment.test.ts` - Tests blockchain → Temporal → enrichment flow
- `tag-coin-temporal.test.ts` - Tests TAG coin creation through Temporal
- `metadata-extraction.test.ts` - Tests real URL metadata extraction

### 3. Contract Tests
**Purpose**: Test smart contract functionality and security

**Characteristics**:
- Uses Hardhat network fork or local node
- Tests contract interactions and state changes
- Gas optimization testing
- Security invariant testing

**Examples**:
- `ETSTarget.test.ts` - Target creation and enrichment
- `ETSToken.test.ts` - Token upgrade and functionality
- `ETSAccessControls.test.ts` - Role-based access control

### 4. E2E Tests
**Purpose**: Test complete user flows

**Characteristics**:
- Tests from user perspective
- Involves multiple systems
- Longest execution time
- Most comprehensive coverage

**Examples**:
- TAG coin creation from UI to blockchain
- Target enrichment with metadata extraction
- Multi-signature governance operations

## Environment Setup

### Local Development
```bash
# 1. Install dependencies
pnpm install

# 2. Start required services
./scripts/start-local-stack.sh
# This starts:
# - Hardhat node (port 8545)
# - Temporal server (ports 7233, 8233)
# - Graph node (if configured)

# 3. Deploy contracts
cd packages/contracts
pnpm deploy:localhost

# 4. Run tests
pnpm test
```

### Environment Variables

#### Test-Specific Variables
```bash
# .env.test
NODE_ENV=test
HARDHAT_NETWORK=localhost
TEMPORAL_ADDRESS=localhost:7233
RPC_URL=http://localhost:8545
MNEMONIC_TESTNET="test test test test test test test test test test test junk"
```

#### Environment Detection
Tests automatically detect environment based on:
- `NODE_ENV` - development/test/production
- `HARDHAT_NETWORK` - localhost/baseSepolia/base
- `RPC_URL` - Blockchain endpoint

## CI/CD Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/test.yml
name: Test Suite

on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm test

  integration-tests:
    runs-on: ubuntu-latest
    services:
      hardhat:
        image: ethereum/hardhat
        ports:
          - 8545:8545
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
      - run: pnpm install
      - run: pnpm deploy:localhost
      - run: pnpm test:integration
```

### Test Coverage Requirements

Minimum coverage thresholds:
- Smart Contracts: 80% coverage
- Core Business Logic: 70% coverage
- Utilities: 60% coverage

Coverage reports:
```bash
# Generate coverage reports
pnpm hardhat coverage              # Contracts
pnpm test -- --coverage            # TypeScript
```

## Local Development

### Test-Driven Development (TDD) Workflow

1. **Write failing test**
```typescript
describe("TAG coin creation", () => {
  it("should mint TAG coin with metadata", async () => {
    // Test implementation
  });
});
```

2. **Implement feature**
```typescript
async function createTagCoin(params: TagCoinParams) {
  // Implementation
}
```

3. **Refactor with confidence**
```bash
pnpm test -- --watch  # Auto-run tests on changes
```

### Debugging Tests

#### VS Code Launch Configuration
```json
{
  "type": "node",
  "request": "launch",
  "name": "Debug Jest Tests",
  "program": "${workspaceFolder}/node_modules/.bin/jest",
  "args": [
    "--runInBand",
    "--testNamePattern=${selectedText}"
  ],
  "console": "integratedTerminal",
  "internalConsoleOptions": "neverOpen"
}
```

#### Debugging Temporal Workflows
```bash
# Enable Temporal UI
temporal server start-dev

# View workflows at http://localhost:8233

# Run tests with verbose logging
DEBUG=temporal:* pnpm test
```

## Test Patterns & Best Practices

### 1. Mocking Strategy
```typescript
// Mock external services
jest.mock("../../src/services/MetadataExtractor");

// Mock blockchain calls
const mockWalletClient = {
  writeContract: jest.fn().mockResolvedValue("0xtxhash"),
};
```

### 2. Test Data Management
```typescript
// Use factories for test data
const createTestTarget = (overrides = {}) => ({
  uri: "https://example.com",
  targetId: "123",
  ...overrides,
});
```

### 3. Async Testing
```typescript
// Proper async/await usage
it("should handle async operations", async () => {
  await expect(asyncFunction()).resolves.toBeDefined();
  await expect(failingAsync()).rejects.toThrow();
});
```

### 4. Environment-Specific Tests
```typescript
// Skip tests based on environment
const describeIfLocal = process.env.NODE_ENV === "test"
  ? describe
  : describe.skip;

describeIfLocal("Local-only tests", () => {
  // Tests that only run locally
});
```

## Troubleshooting

### Common Issues

#### 1. Tests Timeout
```bash
# Increase timeout for slow tests
jest.setTimeout(30000);

# Or per test
test("slow test", async () => {
  // test code
}, 30000);
```

#### 2. Port Conflicts
```bash
# Check and kill processes
lsof -i :8545  # Hardhat
lsof -i :7233  # Temporal
kill -9 <PID>
```

#### 3. Contract Deployment Issues
```bash
# Reset local blockchain
cd packages/contracts
pnpm hardhat clean
pnpm hardhat node --reset
```

#### 4. Module Resolution
```bash
# Clear Jest cache
jest --clearCache

# Rebuild packages
pnpm clean && pnpm build
```

### Debug Commands

```bash
# Run tests with detailed output
pnpm test -- --verbose

# Run specific test with debugging
node --inspect-brk ./node_modules/.bin/jest tagCreatedWorkflow.test.ts

# Check test file syntax
npx jest --listTests

# Validate Jest configuration
npx jest --showConfig
```

## Test Maintenance

### Regular Tasks

**Weekly**:
- Review and update flaky tests
- Check test coverage metrics
- Update test data and fixtures

**Monthly**:
- Audit test dependencies
- Review and optimize slow tests
- Update this documentation

**Quarterly**:
- Full test suite performance audit
- Security test review
- Integration test environment validation

### Adding New Tests

When adding new features:
1. Write unit tests first (TDD)
2. Add integration tests for critical paths
3. Update this documentation if adding new test patterns
4. Ensure CI/CD pipeline includes new tests

## Future Improvements

### Planned Enhancements
- [ ] Implement mutation testing
- [ ] Add performance benchmarking tests
- [ ] Create visual regression tests for UI
- [ ] Implement contract fuzzing tests
- [ ] Add load testing for Temporal workflows
- [ ] Create test data generators

### Tools Under Consideration
- **Playwright**: E2E browser testing
- **k6**: Load and performance testing
- **Echidna**: Smart contract fuzzing
- **Stryker**: Mutation testing

## Resources

### Documentation
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Hardhat Testing](https://hardhat.org/tutorial/testing-contracts)
- [Temporal Testing Guide](https://docs.temporal.io/develop/typescript/testing)
- [Bun Test Runner](https://bun.sh/docs/cli/test)

### Internal Resources
- Test fixtures: `test/fixtures/`
- Test utilities: `test/utils/`
- Mock data: `test/mocks/`

---

*This is a living document. Please update it when making significant changes to the testing infrastructure.*

**Last Updated**: October 2024
**Maintainer**: ETS Development Team