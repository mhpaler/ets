# Architectural Decisions Log

## 2025-09-20: Single Network Context for Test Fixtures

**Rationale**:
- Multiple `network.connect()` calls were creating different network instances
- Deployment happened on one network, queries on another, causing "no bytecode" errors
- Tests couldn't wait for transaction receipts, making event testing impossible

**Solution**:
- Single `network.connect()` call in the fixture, passed to all deployment and test code
- Consolidated fixtures to avoid redundant network connections
- Removed module-level async operations that created separate contexts

**Alternatives Considered**:
- Running tests only on localhost network (requires separate Hardhat node)
- Mocking events (doesn't test actual contract behavior)
- Using forked mainnet (too slow for development)

**Trade-offs**:
- Tests must use the fixture-provided publicClient
- Can't create network connections at module level
- All tests in a file share the same network context

**Impact**:
- All tests now work in-process, including event testing
- Drawdown tests that previously only worked on localhost now work everywhere
- 10x faster test execution (no need for separate Hardhat node)
- Simplified CI/CD (no localhost network setup required)

**Future**:
- Pattern established for all future test files
- Can extend fixtures without breaking network context
- Foundation for more complex integration tests

## 2025-09-15: Event-Only Target Enrichment

**Rationale**:
- Events are 10x cheaper than storage (50k gas vs 500k+)
- The Graph indexes events, not storage
- No need for on-chain queryability of enrichment data

**Implementation**:
- Removed all storage updates from enrichTarget function
- Emit TargetEnriched event with all metadata
- Event Processor role required for enrichment

**Trade-offs**:
- Can't query enrichment directly from contract
- Rely on The Graph for data availability
- Must trust event processor for accuracy

**Future**:
- Can add storage later if on-chain queries needed
- Events provide complete audit trail
- Easy to add IPFS/Arweave later if needed

## 2025-09-14: Merge ETSEnrichTarget into ETSTarget

**Rationale**:
- Simplify contract architecture
- Reduce deployment complexity
- Lower gas costs for interactions
- Single source of truth for target operations

**Implementation**:
- Moved enrichTarget and requestEnrichTarget to ETSTarget
- Removed ETSEnrichTarget contract entirely
- Updated all references throughout codebase

**Trade-offs**:
- Larger ETSTarget contract size
- Can't upgrade enrichment logic separately
- All target logic in one place (pro and con)

**Future**:
- Monitor contract size limits
- Consider modular approach if contract gets too large
- Simplified upgrade path for all target functionality