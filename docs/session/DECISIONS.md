# Architecture Decisions

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