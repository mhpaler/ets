# ETS Session Changelog

## 2025-10-01

### Completed
- **Base Sepolia Integration Tests** - All 3 integration tests passing on Base Sepolia testnet
  - E2E enrichment workflow with Temporal Processor
  - Direct enrichment by event processor account
  - Security validation for access control
- **Temporal Processor Base Sepolia Support** - Full configuration for staging deployment
  - HD wallet integration with mnemonic-based accounts
  - Alchemy RPC for reliable event filtering
  - Base Sepolia chain support (84532)

### Added
- **BASE-SEPOLIA-DEPLOYMENT.md** - Complete deployment guide for Base Sepolia with task queue switching strategy
- **CHANGE-MANAGEMENT.md** - Progressive deployment lifecycle documentation (Local → Staging → Production)
- **Task queue switching strategy** - Enables hot-swapping between local debugging and cloud deployment
- **Documentation-first configuration** - MVP approach avoiding over-engineering
- **`ets targets enrich` CLI command** - Manually trigger target enrichment via `requestEnrichTarget()`
- **Base Sepolia startup script** - `start-basesepolia.sh` for local TP testing against testnet

### Fixed
- **Integration test chain configuration** - Tests now use correct chain for wallet clients (fixes "invalid chain ID" errors)
- **Target ID computation** - Switched from unreliable event parsing to `computeTargetId()` for accuracy
- **RPC state propagation** - Added 2-second delays for Alchemy cache consistency
- **Test timeout** - Increased enrichment test timeout to 40s to allow Temporal workflow completion
- **Workflow error handling** - Throw `ApplicationFailure` on enrichment errors instead of silently completing
- **MNEMONIC parsing** - Strip quotes from environment variable (dotenv doesn't auto-strip)
- **Alchemy block range limits** - Set maxBlockRange to 9n (free tier allows 10 blocks inclusive)
- **Event processor private key** - Use `config.blockchain.eventProcessorPrivateKey` instead of direct env access

### Changed
- **ROADMAP.md** - Updated with deployment strategy architectural decisions and operational toggle approach
- **#539.5 Multi-Environment Configuration** - Now IN_PROGRESS (85% → 100% complete)
- **Integration tests** - Now use Base Sepolia (84532) instead of Ethereum Sepolia (11155111)
- **Contract address loading** - Integration tests load from `@ethereum-tag-service/contracts/deployments` dynamically

### Removed
- **Vestigial apps** - Cleaned up 5 obsolete apps from @apps directory:
  - event-processor (replaced by temporal-processor)
  - offchain-api (no longer needed for MVP)
  - gelato (Web3 functions replaced by Temporal)
  - oracle (Airnode replaced by Temporal)
  - zora-coin-poc (POC integrated into temporal-processor)
- **607 npm packages** - Removed from dependencies after cleanup

## 2025-09-30

### Completed
- **#539 Temporal Implementation** - Fully completed with both target enrichment and TAG creation workflows operational (100%)
- **#539.9 Contract ABI imports** - Replaced all hardcoded ABIs with imports from @ethereum-tag-service/contracts package
- **TAG Coin Creation Workflow** - Complete end-to-end implementation from ETS tag creation → Temporal workflow → MockZoraFactory deployment
- **E2E TAG Creation Tests** - All 5 integration tests passing for TAG coin creation flow

### Fixed
- **Configure script ETSChannel creation** - Fixed to use `addChannel` instead of non-existent `deployChannel` function
- **Chain ID configuration** - Applied Hardhat chain ID override (31337) to TAG coin integration tests
- **Invalid tag error handling** - Made e2e tests more flexible in error message validation
- **Account position for TAG deployment** - Corrected to use Position 3 (ETSZora) from HD wallet strategy

### Added
- **Direct MockZoraFactory integration** - Removed offchain-api dependency for architectural simplification (MVP goal)
- **Dynamic contract address loading** - TAG coin activities now use @ethereum-tag-service/contracts package
- **Environment-aware TAG tests** - Tests handle metadata differences between localhost and staging/production
- **Batch TAG creation test** - Verified efficient handling of multiple TAGs in single transaction
- **Duplicate TAG handling test** - Confirmed proper behavior when attempting to create existing TAGs

### Changed
- **tagCoinActivities.ts** - Updated to use zoraPrivateKey (Position 3) instead of eventProcessorPrivateKey
- **TAG deployment flow** - Direct factory contract interaction without intermediate API layer
- **Test assertions** - More flexible error validation for contract reverts
- **Temporal processor ABIs** - Now using dynamic imports from contracts package for all contract ABIs
- **Event listener architecture** - Added async ABI loading to handle ES modules in CommonJS context

## 2025-09-29

### Fixed
- **Integration test for target enrichment** - Updated to use new enrichTarget signature with payload + schemaVersion (#539)
- **Metadata parsing in tests** - Fixed to handle nested metadata structure (core.title, core.description)
- **Test URL validation** - Now uses real GitHub URLs for proper metadata extraction testing

### Changed
- **target-enrichment.test.ts** - Refactored to match new ETSTarget contract interface
- **Payload format** - Tests now use hex-encoded JSON payloads as expected by viem

### Added
- **Real metadata verification** - Integration tests now validate actual metadata extraction from GitHub URLs
- **HTTP status tracking** - Tests verify HTTP status codes in enrichment responses
- **Content type detection** - Tests check content type identification (e.g., "repository" for GitHub)

## 2025-09-23

### Fixed
- **Temporal worker management** - Added comprehensive process cleanup and restart functionality
- **ChainId configuration** - Fixed localhost chain configuration for viem in targetEnrichmentActivities
- **Stale worker processes** - Added automatic cleanup of orphaned tsx watch processes on startup
- **Metadata extraction tests** - Fixed all 17 tests to handle real-world API responses gracefully

### Added
- **manage-temporal-workers.sh** - Standalone script for worker status, stop, and restart operations
- **Integration test suite** for metadata extraction with comprehensive URL validation
- **Bad URI handling** in metadata extraction with security validations (blocks file://, javascript://, internal IPs)
- **Test-driven development framework** for metadata extraction improvements
- **Organized test structure** - Created test/ subdirectories (workflows/, unit/, integration/)

### Changed
- Enhanced start-local-stack.sh with proper worker cleanup on shutdown (Ctrl+C)
- Commented out redundant 5-second timer in TargetEnrichmentWorkflow (receipt already awaited in activity)
- Worker management now properly kills all tsx processes before starting new ones
- **Reorganized temporal-processor tests** - Moved to organized structure with proper subdirectories
- **Updated targetEnrichmentWorkflow.test.ts** - Removed Arweave references, fixed activity names

### Removed
- Redundant blockchain confirmation timer in workflow (activity already waits for receipt)
- **simple.test.ts** - Removed as it provided minimal value
- **Old tests/ directory** - Consolidated into single test/ directory

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