# IETSTargetTagger

## Functions

### tagTarget

```solidity
function tagTarget(struct IETSTargetTagger.TaggingRecord[] _taggingRecords) external payable
```

Returns human readable name for this IETSTargetTagger contract.

### toggleTargetTaggerPaused

```solidity
function toggleTargetTaggerPaused() external
```

Toggles the paused/unpaused state of a IETSTargetTypeTagger contract.

### getTaggerName

```solidity
function getTaggerName() external pure returns (string)
```

Returns human readable name for this IETSTargetTagger contract.

### getCreator

```solidity
function getCreator() external view returns (address payable)
```

Returns address of an IETSTargetTagger contract creator.

### getOwner

```solidity
function getOwner() external view returns (address payable)
```

Returns address of an IETSTargetTagger contract owner.

### isTargetTaggerPaused

```solidity
function isTargetTaggerPaused() external view returns (bool)
```

Returns true if Target Type Tagger is paused; false if not paused.

## Events

### TargetTaggerPaused

```solidity
event TargetTaggerPaused(bool newValue)
```

_Emitted when an IETSTargetTypeTagger contract is paused/unpaused._

