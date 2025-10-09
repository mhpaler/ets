# Temporal Processor Changelog

## 2025-10-09

### Added
- **Production-ready self-healing system** with automatic error recovery (#539.10)
- `transactionManager.ts` utility - Reusable transaction retry with exponential backoff (1s → 2s → 4s → max 30s)
- Chain reset detection - Automatically clears checkpoint when blockchain resets (critical for Hardhat development)
- Automatic nonce conflict resolution - Retries on "nonce", "network", "timeout" errors with 5-minute timeout
- `eventScanner.ts` utility - Chunked historical event scanning with progress tracking

### Changed
- **Reduced concurrent activities from 10 → 3** to minimize nonce contention between parallel workflows
- Refactored all on-chain activities to use centralized transaction manager (DRY principle)
- Enhanced event listeners with chain reset detection for all 3 event types (TargetCreated, EnrichTargetRequested, TagCreated)
- Historical event scanning now uses deployment block as fallback when no checkpoint exists

### Fixed
- Nonce conflicts when multiple TAG coin deployments execute concurrently
- Checkpoint resume after Hardhat node restarts (previously would miss events)
- Transaction failures now retry automatically instead of immediately failing workflows

### Removed
- Obsolete integration tests: `tag-coin-temporal.test.ts`, `zora-tag-coin-v2.test.ts`

### Technical
- All blockchain transactions now wrapped in `executeWithRetry()` for consistent error handling
- Exponential backoff prevents overwhelming RPC nodes during transient failures
- Self-healing design enables unattended operation in production environments
- Related to #528 TAG Coins Epic
- Addresses #539.10 Production-Ready Event Recovery & Checkpoint System

## 2025-10-03

### Added
- Sequential tag counter support - workflows now process tagId from TagCreated events (#539.5)
- Zora deployment polling in activities for reliable coin creation confirmation
- Multi-chain Basescan link support (Base Sepolia, Base Mainnet)
- SVG metadata generation for TAG coins with inline data URIs
- Dynamic pool config fetching from Zora API based on chain ID

### Changed
- **CRITICAL FIX**: Temporal Processor now reads Zora config from ETSToken contract to ensure parameter matching
  - Uses machineName (not tagString) for coinName
  - Uses "ETS" (not "TAG") for coinSymbol
  - Uses zoraPlatformReferrer from contract (not channel address)
- Enhanced TagCreated event handling to capture and log tagId (e.g., "Processing TAG #123: #bitcoin")
- Updated deployment activities to validate Zora metadata structure
- Improved error handling and retry logic for Zora deployments

### Fixed
- Deterministic address mapping between ETS tags and Zora coins
- Parameter mismatch causing address inconsistencies between contracts and off-chain deployment
- Chain ID configuration for multi-environment support (localhost, Base Sepolia, Base Mainnet)

### Technical
- Added validateZoraMetadata() function for metadata structure validation
- Modified deployTagCoinOnZora() to use contract-sourced configuration
- Implemented fetchPoolConfig() activity for dynamic Zora API integration
- Related to #528 TAG Coins Epic
- Addresses #539 Temporal Implementation

## 2025-09-23

### Added
- Comprehensive metadata extraction system using unfurl.js (#539)
- MetadataExtractor service for rich URI metadata parsing
- Support for OpenGraph, Twitter Cards, and HTML metadata extraction
- Platform detection (GitHub, YouTube, Twitter, etc.)
- Content type classification (article, video, social_post, etc.)
- Checkpoint system for handling restarts and preventing duplicate processing
- Chain reset detection for Hardhat development

### Changed
- Refactored emitTargetEnrichmentEvent to callEnrichTargetOnChain for semantic accuracy
- Updated workflows to use Temporal's workflow-safe logger instead of console.log
- Converted metadata to efficient bytes payload for smart contract events
- Added schema versioning (ets-metadata-v1) for forward compatibility

### Fixed
- Duplicate workflow creation due to race condition in event processing
- Event deduplication using transaction hash + log index
- Temporal worker logs not appearing in fullstack logger

### Technical
- Implemented hybrid metadata structure: uniform core + type-specific extensions
- Optimized for The Graph indexing with structured JSON events
- ~30% gas savings through efficient event pattern
- Added payload integrity verification with keccak256 hashing