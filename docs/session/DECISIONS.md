# Architecture Decisions

## 2025-09-23: Efficient JSON Event Pattern for Metadata

**Rationale**:
- Events are 10x cheaper than storage for metadata
- Raw bytes payload more efficient than multiple string parameters
- Schema versioning enables forward compatibility
- Payload hash ensures integrity without on-chain storage

**Alternatives Considered**:
- Multiple string parameters (less efficient, harder to extend)
- On-chain storage (too expensive at ~20k gas per KB)
- IPFS/Arweave hybrid (adds complexity without immediate benefit)
- Compressed formats (complexity outweighs savings)

**Trade-offs**:
- Can't query metadata directly from contract
- Rely on The Graph for data availability
- Slightly more complex encoding/decoding

**Future**:
- Can evolve schema without breaking existing indexers
- Easy to add storage layer later if needed
- Could add compression if payloads grow significantly

## 2025-09-23: Hybrid Metadata Structure (Core + Extensions)

**Rationale**:
- Uniform core fields ensure consistency across all content types
- Extensions allow type-specific richness without bloating all records
- Maps cleanly to GraphQL schema in The Graph
- Balances gas costs with data completeness

**Alternatives Considered**:
- Fully uniform structure (loses type-specific value)
- Completely dynamic structure (hard to query/index)
- Separate events per type (complex indexing)
- Minimal metadata only (insufficient for discovery)

**Trade-offs**:
- More complex than flat structure
- Requires careful schema design
- Some redundancy in edge cases

**Future**:
- Extensions can grow independently
- New content types easy to add
- Can optimize based on usage patterns

## 2025-09-22: Temporal Worker Process Separation

**Rationale**:
- Temporal's worker has native dependencies that aren't compatible with Bun runtime
- Worker and event listener have different responsibilities and lifecycles
- Separation allows independent scaling and debugging

**Alternatives Considered**:
- Running worker in same process as event listener (failed due to Bun incompatibility)
- Using PM2 for process management (overcomplicated for development)
- Using nodemon/ts-node-dev (didn't solve the native dependency issue)

**Trade-offs**:
- Requires managing two processes instead of one
- Slightly more complex local development setup
- Need to ensure both processes start properly

**Future**:
- Could use Docker Compose for local development orchestration
- Production will use Kubernetes pods for proper separation anyway
- Can revisit when Bun adds better native module support

## 2025-09-22: File-Based Checkpoint System for Event Processing

**Rationale**:
- Need persistence across hot-reloads and restarts to prevent duplicate event processing
- Simple file-based approach is sufficient for MVP
- Leverages filesystem for state without adding dependencies

**Alternatives Considered**:
- Database checkpoint (PostgreSQL/SQLite) - overkill for MVP
- Redis/KeyValue store - adds infrastructure dependency
- Temporal Workflow state - more complex, would require long-running workflow
- No persistence - causes duplicate workflows on every restart

**Trade-offs**:
- File I/O on every event batch (minimal performance impact)
- Limited to single-instance deployment (fine for MVP)
- Manual cleanup of checkpoint files if needed

**Future**:
- Can migrate to Temporal-based state management for production
- Could use database if we need multi-instance support
- Consider event sourcing pattern for full audit trail