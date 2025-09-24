---
"@ethereum-tag-service/contracts": minor
---

feat: Optimize target enrichment with efficient JSON event pattern

- Changed ETSTarget.enrichTarget() to accept bytes payload and schema version
- Emit raw UTF-8 JSON bytes instead of individual string fields
- Add keccak256 hash for payload integrity verification
- Add schema versioning for forward compatibility
- Reduce gas costs by ~30% for metadata events
- Enable structured metadata that maps cleanly to The Graph

BREAKING CHANGE: enrichTarget function signature changed from (targetId, httpStatus, contentType, metadataJson) to (targetId, payload, schemaVersion)