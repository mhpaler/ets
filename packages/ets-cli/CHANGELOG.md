# ETS CLI Changelog

## 2025-10-13

### Added
- **Space-separated tag input** - Tags can now be passed as a single quoted string: `"#tag1 #tag2 #tag3"`
- `parseTags()` utility function for flexible tag input handling
- Support for both old multi-argument and new space-separated formats

### Changed
- All tag commands now accept both formats: `"#ethereum #blockchain"` OR `"#ethereum" "#blockchain"`
- Updated help examples to show both input methods
- Enhanced UX for batch tag operations (10-20 tags in one command)

### Technical
- Backwards compatible - both formats work seamlessly
- Applies to `tags create`, `tags apply`, `tags remove`, `tags replace` commands
- Simplifies CLI usage for common batch tagging workflows
- Related to #528 TAG Coins Epic

## 2025-10-04

### Added
- Tag ID display in CLI output - shows sequential TAG number (e.g., "TAG #8") fetched from contract
- Non-optimistic tag counter retrieval - fetches actual `totalTagsCreated()` from chain

### Changed
- Tag details now display format: `#TagName (TAG #8) → 0xCoinAddress`
- Enhanced UX with sequential tag numbering for batch creations

## 2025-10-03

### Added
- Zora deployment polling (up to 5 minutes, 5-second intervals) for reliable coin creation confirmation
- Basescan link generation for Base Sepolia and Base Mainnet networks
- Bytecode existence checks to confirm actual deployment before showing success message

### Changed
- Improved UX for tag creation - CLI now waits for Zora deployment to complete before showing success
- Enhanced network-specific block explorer link generation

### Fixed
- Race condition where CLI would show success before Zora coin was actually deployed
- Missing block explorer links for Base Sepolia and Base Mainnet

### Technical
- Related to #528 TAG Coins Epic
- Addresses #539 Temporal Implementation
