# ETSTargetTagger

Sample implementation if IETSTargetTagger

To use it, call the public tagTarget() function with an array of TaggingRecord structs
and a publisher address.

The tagTarget() function will process each TaggingRecord struct as follows:
  - Get or create a targetId for the target.
  - Get or create tagIds (CTAG token ids) for the tag strings.
  - Call the core ETS.tagTarget() with the tagIds and targetId function to write a tagging record to ETS.

Note: When ETSTargetTagger (this contract) is utilized for tagging, ETS is credited as the Publisher of any CTAGs
minted and as well as the tagging record. To learn more about the role and incentives for Publisher in ETS,
please see. todo: link to docs.

## Functions

### constructor

```solidity
constructor(contract IETS _ets, contract IETSToken _etsToken, contract IETSTarget _etsTarget, address payable _creator, address payable _owner) public
```

### toggleTargetTaggerPaused

```solidity
function toggleTargetTaggerPaused() public
```

Toggles the paused/unpaused state of a IETSTargetTypeTagger contract.

### tagTarget

```solidity
function tagTarget(struct IETSTargetTagger.TaggingRecord[] _taggingRecords) public payable
```

public interface provided by ETS allowing any client to tag a target.

This tagger permits the tagging of one or more Targets with one or more tags
in one transaction.

| Name | Type | Description |
| ---- | ---- | ----------- |
| _taggingRecords | struct IETSTargetTagger.TaggingRecord[] | Array of TaggingRecord stucts. |

### getTaggerName

```solidity
function getTaggerName() public pure returns (string)
```

Returns human readable name for this IETSTargetTagger contract.

### getCreator

```solidity
function getCreator() public view returns (address payable)
```

Returns address of an IETSTargetTagger contract creator.

### getOwner

```solidity
function getOwner() public view returns (address payable)
```

Returns address of an IETSTargetTagger contract owner.

### isTargetTaggerPaused

```solidity
function isTargetTaggerPaused() public view returns (bool)
```

Returns true if Target Type Tagger is paused; false if not paused.

### supportsInterface

```solidity
function supportsInterface(bytes4 interfaceId) public view virtual returns (bool)
```

_Returns true if this contract implements the interface defined by
`interfaceId`. See the corresponding
https://eips.ethereum.org/EIPS/eip-165#how-interfaces-are-identified[EIP section]
to learn more about how these ids are created.

This function call must use less than 30 000 gas._

### _processTaggingRecord

```solidity
function _processTaggingRecord(struct IETSTargetTagger.TaggingRecord _taggingRecord, address payable _tagger, uint256 _currentFee) internal
```

