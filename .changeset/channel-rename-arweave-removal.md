---
"@ethereum-tag-service/contracts": major
---

BREAKING CHANGE: Complete architectural refactor with Channel renaming and Arweave removal

## Breaking Changes

### Relayer → Channel Renaming
- All "Relayer" references renamed to "Channel" throughout contracts
- `ETSRelayer` → `ETSChannel`
- `ETSRelayerFactory` → `ETSChannelFactory`
- `IETSRelayer` → `IETSChannel`
- All related functions, events, and roles updated

### Target Enrichment Refactor
- Removed Arweave dependency from target enrichment
- Added `enrichTarget()` function to ETSEnrichTarget for event-only enrichment
- Added `TargetEnriched` event for The Graph indexing
- 10x gas savings by emitting events instead of storing data

### Interface Changes
- Updated IETSAccessControls with Channel terminology
- Updated IETSToken with Channel references
- Events moved to interfaces for better organization

## Migration Guide

### For Contract Integrations
1. Update all "relayer" references to "channel" in your code
2. Use new Channel interfaces and ABIs
3. Update role names (RELAYER_ROLE → CHANNEL_ROLE)

### For Target Enrichment
- Target enrichment now emits events only (no storage)
- The Graph will index enrichment data from events
- No more Arweave transaction IDs needed

This is a one-time breaking change to improve terminology and reduce gas costs before mainnet launch.