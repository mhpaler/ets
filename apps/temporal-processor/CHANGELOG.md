# Temporal Processor Changelog

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