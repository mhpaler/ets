---
"@ethereum-tag-service/contracts": minor
"@ethereum-tag-service/ets-cli": minor
---

feat: ETSToken v0.1.0 upgrade with tag counter and CLI enhancements

### Contracts
- Upgraded ETSToken to v0.1.0 with `totalTagsCreated` counter for sequential TAG IDs
- Updated TagCreated event to include tagId parameter (breaking change)
- Established generic contract upgrade pattern with semantic versioning
- Successfully deployed upgrade to Base Sepolia network

### CLI
- Added TAG ID display in creation output (e.g., "TAG #8")
- Fetch tag IDs from chain (non-optimistic approach)
- Enhanced UX with sequential numbering for batch tag creation

### Documentation
- Created comprehensive contract upgrade guide for future upgrades
- Documented generic upgrade pattern with semantic versioning
- Added architecture decisions for upgrade strategy

This upgrade enables proper tracking of TAG creation order and improves the user experience when creating TAGs through the CLI.