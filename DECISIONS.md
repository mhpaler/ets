# Architectural Decisions

This document captures significant architectural decisions made during the development of ETS, including the rationale, alternatives considered, and trade-offs accepted.

## 2025-01-20: Remove Arweave from Target Enrichment

**Rationale**:
- Events are 10x cheaper than storage operations
- The Graph indexes events, not storage, making events the natural choice
- Arweave adds significant complexity without providing immediate value
- For MVP, we don't need permanent decentralized storage

**Alternatives Considered**:
- **On-chain storage**: Too expensive, especially on mainnet
- **IPFS**: Similar complexity to Arweave, still requires pinning service
- **Hybrid approach**: Store hash on-chain, data on Arweave (overengineered for current needs)

**Trade-offs**:
- Can't query enrichment data directly from contract
- Rely on The Graph for data availability
- No permanent storage guarantee (but not needed for metadata)

**Future Considerations**:
- Can add Arweave back when we need permanent storage for large media files
- Easy to add storage later if on-chain queries become necessary
- Current approach doesn't prevent future enhancements

## 2025-01-20: Rename Relayer to Channel

**Rationale**:
- "Channel" better represents the concept of a tagging pathway
- More intuitive for developers and users
- Aligns with modern terminology (Discord channels, Slack channels)
- "Relayer" implies technical infrastructure rather than user-facing feature

**Alternatives Considered**:
- Keep "Relayer" for backward compatibility
- Use "Publisher" or "Curator"
- Use "Stream" or "Feed"

**Trade-offs**:
- Breaking change for any existing integrations
- Need to update all documentation
- Potential confusion during transition period

**Future Considerations**:
- This is a one-time breaking change
- Better to do it now before mainnet launch
- Improves long-term maintainability and understanding

## 2025-01-20: Unified /ets-commit Command

**Rationale**:
- Single command reduces cognitive load
- Documentation happens while context is fresh
- Eliminates redundancy between commit and stepping-away commands
- Ensures documentation stays in sync with code

**Alternatives Considered**:
- Keep separate commands for different scenarios
- Automate documentation with git hooks
- Manual documentation process

**Trade-offs**:
- Slightly longer commit process (but more thorough)
- Requires discipline to update docs
- May feel heavy for tiny commits

**Future Considerations**:
- Added `--quick` flag for minor commits
- Can be refined based on usage patterns
- Sets good foundation for automated documentation generation