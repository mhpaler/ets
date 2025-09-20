# Changelog

All notable changes to the ETS project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## 2025-01-20

### Added
- `enrichTarget()` function to ETSEnrichTarget contract for event-only enrichment
- `TargetEnriched` event for The Graph indexing
- Unified `/ets-commit` command with documentation updates
- CHANGELOG.md and DECISIONS.md for better documentation

### Changed
- **BREAKING**: Renamed "Relayer" to "Channel" throughout entire codebase (#538)
  - All contract interfaces and implementations updated
  - CLI commands now use `channel` instead of `relayer`
  - Event names and parameters updated
- Refactored target enrichment to remove Arweave dependency (#539)
  - Now emits events directly for The Graph indexing
  - 10x gas savings by avoiding storage operations
- Temporal processor now self-contained with embedded activities
  - No longer depends on offchain-api for metadata fetching

### Removed
- Arweave upload activities from temporal processor
- On-chain storage of enrichment metadata
- Redundant `/ets-steppingaway` command (merged into `/ets-commit`)

### Fixed
- Temporal processor compilation issues with Node.js version compatibility
- Contract address configuration in temporal processor