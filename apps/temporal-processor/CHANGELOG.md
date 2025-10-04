# Temporal Processor Changelog

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