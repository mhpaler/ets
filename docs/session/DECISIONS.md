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