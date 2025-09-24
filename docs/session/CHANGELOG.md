# ETS Session Changelog

## 2025-09-23

### Fixed
- **Temporal worker management** - Added comprehensive process cleanup and restart functionality
- **ChainId configuration** - Fixed localhost chain configuration for viem in targetEnrichmentActivities
- **Stale worker processes** - Added automatic cleanup of orphaned tsx watch processes on startup

### Added
- **manage-temporal-workers.sh** - Standalone script for worker status, stop, and restart operations
- **Integration test suite** for metadata extraction with comprehensive URL validation
- **Bad URI handling** in metadata extraction with security validations (blocks file://, javascript://, internal IPs)
- **Test-driven development framework** for metadata extraction improvements

### Changed
- Enhanced start-local-stack.sh with proper worker cleanup on shutdown (Ctrl+C)
- Commented out redundant 5-second timer in TargetEnrichmentWorkflow (receipt already awaited in activity)
- Worker management now properly kills all tsx processes before starting new ones

### Removed
- Redundant blockchain confirmation timer in workflow (activity already waits for receipt)

## 2025-09-22

### Fixed
- Temporal processor worker separation - worker must run as separate process to execute workflows (#539)
- EVENT_PROCESSOR_ROLE grant in configuration script after removing ETSEnrichTarget references
- Integration test error expectations to match actual contract errors (AccessDenied vs UNAUTHORIZED)
- **Event processing duplicates** - Added deduplication and checkpoint system (#539)
- **Race condition** between event watcher and polling causing duplicate workflows
- **Temporal worker logs** not appearing in fullstack logger

### Added
- `bun --watch` mode for Temporal processor development workflow
- Automatic worker startup in start-local-stack.sh script
- Worker process logging to temporal-worker.log
- **Checkpoint system** for event processing persistence across restarts
- **Chain reset detection** for Hardhat restarts
- **Event deduplication** using transaction hash + log index
- **temporal-worker.log** to log viewer and colorization

### Changed
- Separated Temporal worker from event listener for proper workflow execution
- Updated start-local-stack.sh to run both event listener and worker processes
- Worker must use tsx (not bun) due to native Temporal dependencies
- **Event processing** now marks events as processed before handling to prevent race conditions
- **Polling interval** optimized to 1 second for better local dev responsiveness

### Removed
- ETSEnrichTarget contract and interface (functionality merged into ETSTarget)
- References to ETSEnrichTarget from deployment and configuration scripts
- ETSEnrichTargetUpgrade from test contracts

### Debugging Insights
- Workflows weren't executing because worker wasn't running (only event listener)
- handleTargetCreatedEvent doesn't fetch targetURI (passes undefined to workflow)
- handleEnrichTargetRequestedEvent correctly fetches targetURI from contract
- **Race condition** between watcher and polling was causing duplicate workflows
- **Hot-reload** now properly cleans up intervals and watchers