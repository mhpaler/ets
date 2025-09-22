# ETS Session Changelog

## 2025-09-22

### Fixed
- Temporal processor worker separation - worker must run as separate process to execute workflows (#539)
- EVENT_PROCESSOR_ROLE grant in configuration script after removing ETSEnrichTarget references
- Integration test error expectations to match actual contract errors (AccessDenied vs UNAUTHORIZED)

### Added
- `bun --watch` mode for Temporal processor development workflow
- Automatic worker startup in start-local-stack.sh script
- Worker process logging to temporal-worker.log

### Changed
- Separated Temporal worker from event listener for proper workflow execution
- Updated start-local-stack.sh to run both event listener and worker processes
- Worker must use tsx (not bun) due to native Temporal dependencies

### Removed
- ETSEnrichTarget contract and interface (functionality merged into ETSTarget)
- References to ETSEnrichTarget from deployment and configuration scripts
- ETSEnrichTargetUpgrade from test contracts

### Debugging Insights
- Workflows weren't executing because worker wasn't running (only event listener)
- handleTargetCreatedEvent doesn't fetch targetURI (passes undefined to workflow)
- handleEnrichTargetRequestedEvent correctly fetches targetURI from contract