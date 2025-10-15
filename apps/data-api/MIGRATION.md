# Subgraph Migration Guide: Relayer → Channel & CTAG NFT → TAG Coin

This document outlines the comprehensive refactor of the ETS subgraph from the old Relayer/CTAG NFT architecture to the new Channel/TAG Coin architecture.

## Overview

**Issue**: #543 - The Graph Subgraph Refactor
**Date**: October 2025
**Scope**: 214 references across 18 files

### What Changed

1. **Terminology**: Relayer → Channel throughout the entire codebase
2. **Token Model**: CTAG NFTs (ERC-721) → TAG Coins (ERC-20 on Zora)
3. **Auction System**: Removed entirely (no longer needed)
4. **Enrichment**: ETSEnrichTarget merged into ETSTarget
5. **Build System**: Migrated from `abi/` to `artifacts/` with Hardhat 3

## Breaking Changes

### Schema Changes

#### Renamed Entities
- `Relayer` → `Channel`
- `RelayerAdmin` → `ChannelAdmin`

#### Removed Entities
- `Auction`
- `Bid`
- `AuctionSettings`

#### Tag Entity Restructure
**Before** (CTAG NFT model):
```graphql
type Tag @entity {
  id: ID!  # Token ID
  tokenId: BigInt!
  owner: Owner!
  creator: Creator!
  relayer: Relayer!
  premium: Boolean!
  reserved: Boolean!
  renewalCount: BigInt!
  recycleCount: BigInt!
}
```

**After** (TAG Coin model):
```graphql
type Tag @entity {
  id: ID!  # Composite: tagId-coinAddress
  tagId: BigInt!  # Incrementing integer
  coinAddress: Bytes!  # ERC-20 contract address
  originalInput: String!
  displayVersion: String!
  machineName: String!
  creator: Creator!
  channel: Channel!
  timestamp: BigInt!
  platformRevenue: BigInt!
}
```

#### New Lookup Entities
```graphql
type TagByNumber @entity {
  id: ID!  # tagId as string
  tag: Tag!
}

type TagByCoinAddress @entity {
  id: ID!  # coinAddress as string
  tag: Tag!
}
```

### Field Renames

#### GlobalSettings
- `taggingFeeRelayerPercentage` → `taggingFeeChannelPercentage`
- Removed: `ownershipTermLength`, auction-related fields

#### Platform
- `relayerCount` → `channelCount`
- `relayersPausedCount` → `channelsPausedCount`
- Removed: `auctionRevenue`, `auctionCount`

#### Channel (formerly Relayer)
- All field names remain similar but context changed
- New: `revenue` field for channel earnings

### Event Handler Changes

#### ETSAccessControls
- `RelayerAdded` → `ChannelAdded`
- `RelayerLockToggled` → `ChannelLockToggled`

#### ETSToken
**Before**:
- `Transfer` event for NFT ownership
- `TagRenewed`, `TagRecycled` for ownership management

**After**:
- `TagCreated(indexed address coinAddress, indexed uint256 tagId, ...)` for new TAG coins
- No ownership/renewal events (ERC-20 model)

#### ETSTarget
- `TargetUpdated` → `TargetEnriched`
- Removed: `EnrichTargetSet`

#### ETSChannel (formerly ETSRelayer)
- `RelayerPauseToggledByOwner` → `ChannelPauseToggledByOwner`
- `RelayerOwnerChanged` → `ChannelOwnerChanged`

### Removed Contracts
- `ETSAuctionHouse` - Entire auction system removed
- `ETSEnrichTarget` - Merged into ETSTarget
- `ETSRelayerFactory` - Functionality moved to ETSChannelFactory

## File Changes

### Renamed Files
```
src/entities/Relayer.ts → Channel.ts
src/entities/RelayerAdmin.ts → ChannelAdmin.ts
src/mappings/ETSRelayer.ts → ETSChannel.ts
```

### Deleted Files
```
src/entities/Auction.ts
src/mappings/ETSAuctionHouse.ts
```

### Modified Files (Major Changes)
- `schema.graphql` - Complete restructure
- `src/entities/Tag.ts` - New TAG coin implementation
- `src/entities/Platform.ts` - Channel terminology
- `src/entities/GlobalSettings.ts` - Removed auction settings
- `scripts/generate-yaml.ts` - New artifact paths
- `templates/subgraph.yaml.mustache` - Event signature updates

## Migration Steps

### For Subgraph Developers

1. **Update Dependencies**:
   ```bash
   cd apps/data-api
   pnpm install
   ```

2. **Regenerate Subgraph Configuration**:
   ```bash
   pnpm graph:prepare-local  # or generate-yaml:staging:base, etc.
   ```

3. **Run Codegen**:
   ```bash
   pnpm codegen
   ```

4. **Deploy**:
   ```bash
   # Local
   pnpm graph:ship-local

   # Staging
   pnpm deploy:staging:base

   # Production
   pnpm deploy:production:base
   ```

### For Frontend/API Consumers

#### Update GraphQL Queries

**Before**:
```graphql
query GetRelayers {
  relayers {
    id
    name
    owner
    tagCount
  }
}

query GetTag($tokenId: BigInt!) {
  tag(id: $tokenId) {
    tokenId
    owner {
      id
    }
    relayer {
      name
    }
  }
}
```

**After**:
```graphql
query GetChannels {
  channels {
    id
    name
    owner
    tagCount
    revenue
  }
}

query GetTag($compositeId: ID!) {
  tag(id: $compositeId) {
    tagId
    coinAddress
    creator {
      id
    }
    channel {
      name
    }
  }
}

# Or lookup by tag ID
query GetTagByNumber($tagId: String!) {
  tagByNumber(id: $tagId) {
    tag {
      tagId
      coinAddress
      displayVersion
    }
  }
}

# Or lookup by coin address
query GetTagByCoinAddress($coinAddress: String!) {
  tagByCoinAddress(id: $coinAddress) {
    tag {
      tagId
      coinAddress
      displayVersion
    }
  }
}
```

#### Update Entity References

| Old Path | New Path | Notes |
|----------|----------|-------|
| `tag.relayer` | `tag.channel` | Renamed field |
| `tag.tokenId` | `tag.tagId` | Now incrementing integer |
| `tag.owner` | N/A | No ownership in ERC-20 model |
| `relayers` | `channels` | Query name change |
| `auctions` | N/A | Removed entirely |

## Build System Changes

### ABI Paths
**Before**: `/packages/contracts/abi/contracts/...`
**After**: `/packages/contracts/artifacts/contracts/...`

The old `abi/` directory has been deleted. All ABIs are now sourced from Hardhat's `artifacts/` directory.

### OpenZeppelin ABIs
Previously included OpenZeppelin ABIs (UUPSUpgradeable, Initializable, Ownable, Pausable) are no longer needed. All required events are available in the main contract ABIs.

### Template Updates
When updating `subgraph.yaml.mustache`:
- Use `{{abis.ContractName}}` for contract ABI paths
- Paths automatically resolve to `artifacts/contracts/...`
- No manual ABI path configuration needed

## Testing Checklist

- [ ] Schema compiles without errors (`pnpm codegen`)
- [ ] All entity files import correctly
- [ ] All mapping files handle events correctly
- [ ] GraphQL queries return expected data structure
- [ ] Channel queries replace Relayer queries
- [ ] Tag lookups work by both ID and coin address
- [ ] No auction-related queries fail
- [ ] Deployment succeeds on target network

## Rollback Plan

If rollback is needed:

1. **Revert contract deployment** to previous version
2. **Restore old subgraph.yaml** from version control
3. **Redeploy previous subgraph version**:
   ```bash
   git checkout <previous-commit>
   cd apps/data-api
   pnpm codegen
   pnpm deploy:production:base --version-label rollback-$(date +%s)
   ```

## Support

For issues or questions:
- GitHub: https://github.com/ethereum-tag-service/ets/issues
- Reference Issue: #543

## Related Documentation

- [TAG Coins Epic (#528)](../../../docs/session/ROADMAP.md)
- [Contract Migration Guide](../../../packages/contracts/MIGRATION.md)
- [Subgraph README](./README.md)
