# Changelog

All notable changes to the ETS project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## 2025-10-01

### Added
- Base Sepolia deployment with complete contract suite (#539)
- Task queue switching strategy for Temporal workflows
- Environment-aware configuration for multi-network support

### Changed
- Fixed `configure-ets.ts` script to properly handle role assignments on Base Sepolia
- ETSChannel now properly owned by ETSPlatform instead of ETSAdmin
- Updated deployment scripts with auto-confirmation for non-localhost environments
- Deploy command renamed from `deploy:baseSepolia` to `deploy:staging`

### Fixed
- Role configuration now uses correct admin account for setRoleAdmin calls
- Network detection properly uses HARDHAT_NETWORK environment variable
- ETSChannel creation properly assigns ownership to ETSPlatform

### Removed
- Vestigial Airnode dependencies from contracts package
- 5 obsolete apps (event-processor, offchain-api, gelato, oracle, zora-coin-poc) - saved 607 packages
- Diagnostic scripts used during Base Sepolia deployment debugging

## 2025-01-21

### Added
- Target enrichment workflow implementation in Temporal processor (#539)
- Integration test v3 for unified ETSTarget contract
- Test script for validating metadata extraction

### Changed
- Simplified local development stack by removing ArLocal and offchain-api dependencies
- Updated `start-local-stack.sh` to reflect new architecture
- Fixed contract deployment command from `deploy-all` to `deploy:localhost`
- Updated test documentation to reflect event-only enrichment pattern

### Fixed
- Test fixtures now use single `network.connect()` pattern
- Event testing works properly in Hardhat in-process runner
- All 171 tests now passing including drawdown tests

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