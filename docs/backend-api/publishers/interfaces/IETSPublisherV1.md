# IETSPublisherV1

This is the interface for the IETSPublisherV1 contract.

## Functions

### applyTags

```solidity
function applyTags(struct IETS.TaggingRecordRawInput[] _rawParts) external payable
```

### replaceTags

```solidity
function replaceTags(struct IETS.TaggingRecordRawInput[] _rawParts) external payable
```

### removeTags

```solidity
function removeTags(struct IETS.TaggingRecordRawInput[] _rawParts) external payable
```

### getOrCreateTagIds

```solidity
function getOrCreateTagIds(string[] _tags) external payable returns (uint256[] _tagIds)
```

