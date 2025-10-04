# ETS CLI Changelog

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
