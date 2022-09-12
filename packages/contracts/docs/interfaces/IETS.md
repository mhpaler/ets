# IETS

This is the interface for the ETS.sol core contract that records ETS TaggingRecords to the blockchain.

## Functions

### tagTarget

```solidity
function tagTarget(uint256[] _tagIds, uint256 _targetId, string _recordType, address payable _tagger) external payable
```

Core ETS tagging function that records an ETS tagging record to the blockchain.
This function can only be called by IETSTargetTagger implementation contracts & ETS admins.

| Name | Type | Description |
| ---- | ---- | ----------- |
| _tagIds | uint256[] | Array of CTAG token Ids. |
| _targetId | uint256 | targetId of the URI being tagged. See ETSTarget.sol |
| _recordType | string | Arbitrary identifier for type of tagging record. |
| _tagger | address payable | Address of that calls IETSTargetTagger to create tagging record. |

### updateTaggingRecord

```solidity
function updateTaggingRecord(uint256 _taggingRecordId, string[] _tags) external payable
```

Function for updating the tags in a tagging record. Takes raw tag strings as input.
may only be called by original tagger.

| Name | Type | Description |
| ---- | ---- | ----------- |
| _taggingRecordId | uint256 | Array of CTAG token Ids. |
| _tags | string[] | Array of tag strings. |

### drawDown

```solidity
function drawDown(address payable _account) external
```

Function for withdrawing funds from an accrual account. Can be called by the account owner
or on behalf of the account. Does nothing when there is nothing due to the account.

| Name | Type | Description |
| ---- | ---- | ----------- |
| _account | address payable | Address of account being drawn down and which will receive the funds. |

### computeTaggingRecordId

```solidity
function computeTaggingRecordId(uint256 _targetId, string _recordType, address _publisher, address _tagger) external pure returns (uint256 taggingRecordId)
```

Function to deterministically compute & return a taggingRecordId.

Every TaggingRecord in ETS is mapped to by it's taggingRecordId. This Id is a composite
of a targetId, recordType, publisher address and tagger address hashed and cast as a uint256.

| Name | Type | Description |
| ---- | ---- | ----------- |
| _targetId | uint256 | Id of target being tagged. |
| _recordType | string | Arbitrary identifier for type of tagging record. |
| _publisher | address | Address of IETSTargetTagger contract that wrote tagging record. |
| _tagger | address | Address of wallet that initiated tagging record via publisher. |

### getTaggingRecordFromId

```solidity
function getTaggingRecordFromId(uint256 _id) external view returns (uint256[] tagIds, uint256 targetId, string recordType, address publisher, address tagger)
```

Retrieves a tagging record from it's taggingRecordId.

| Name | Type | Description |
| ---- | ---- | ----------- |
| _id | uint256 | taggingRecordId. |

| Name | Type | Description |
| ---- | ---- | ----------- |
| tagIds | uint256[] | CTAG token ids used to tag targetId. |
| targetId | uint256 | ETS Id of URI that was tagged. |
| recordType | string | Type of tagging record. |
| publisher | address | Address of IETSTargetTagger contract that wrote tagging record. |
| tagger | address | Address of wallet that initiated tagging record via publisher. |

### getTaggingRecord

```solidity
function getTaggingRecord(uint256 _targetId, string _recordType, address _publisher, address _tagger) external view returns (uint256[] tagIds, uint256 targetId, string recordType, address publisher, address tagger)
```

Retrieves a tagging record the composite keys that make up it's taggingRecordId.

| Name | Type | Description |
| ---- | ---- | ----------- |
| _targetId | uint256 | Id of target being tagged. |
| _recordType | string | Arbitrary identifier for type of tagging record. |
| _publisher | address | Address of IETSTargetTagger contract that wrote tagging record. |
| _tagger | address | Address of wallet that initiated tagging record via publisher. |

| Name | Type | Description |
| ---- | ---- | ----------- |
| tagIds | uint256[] | CTAG token ids used to tag targetId. |
| targetId | uint256 | ETS Id of URI that was tagged. |
| recordType | string | Type of tagging record. |
| publisher | address | Address of IETSTargetTagger contract that wrote tagging record. |
| tagger | address | Address of wallet that initiated tagging record via publisher. |

### totalDue

```solidity
function totalDue(address _account) external view returns (uint256 _due)
```

Function to check how much MATIC has been accrued by an address factoring in amount paid out.

| Name | Type | Description |
| ---- | ---- | ----------- |
| _account | address | Address of the account being queried. |

| Name | Type | Description |
| ---- | ---- | ----------- |
| _due | uint256 | Amount of WEI in MATIC due to account. |

### taggingFee

```solidity
function taggingFee() external view returns (uint256)
```

Function to retrieve the ETS platform tagging fee.

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | tagging fee. |

## Events

### AccessControlsSet

```solidity
event AccessControlsSet(address newAccessControls)
```

_emitted when the ETS Access Controls is set._

| Name | Type | Description |
| ---- | ---- | ----------- |
| newAccessControls | address | contract address access controls is set to. |

### TaggingFeeSet

```solidity
event TaggingFeeSet(uint256 newTaggingFee)
```

_emitted when ETS tagging fee is set._

| Name | Type | Description |
| ---- | ---- | ----------- |
| newTaggingFee | uint256 | new tagging fee. |

### PercentagesSet

```solidity
event PercentagesSet(uint256 platformPercentage, uint256 publisherPercentage, uint256 remainingPercentage)
```

_emitted when participant distribution percentages are set._

| Name | Type | Description |
| ---- | ---- | ----------- |
| platformPercentage | uint256 | percentage of tagging fee allocated to ETS. |
| publisherPercentage | uint256 | percentage of tagging fee allocated to publisher of record for CTAG being used in tagging record. |
| remainingPercentage | uint256 | percentage of tagging fee allocated to creator or owner of CTAG being used in tagging record. |

### TargetTagged

```solidity
event TargetTagged(uint256 taggingRecordId)
```

_emitted when a new tagging record is recorded within ETS._

| Name | Type | Description |
| ---- | ---- | ----------- |
| taggingRecordId | uint256 | Unique identifier of tagging record. |

### TaggingRecordUpdated

```solidity
event TaggingRecordUpdated(uint256 taggingRecordId)
```

_emitted when a tagging record is updated._

| Name | Type | Description |
| ---- | ---- | ----------- |
| taggingRecordId | uint256 | tagging record being updated. |

### FundsWithdrawn

```solidity
event FundsWithdrawn(address who, uint256 amount)
```

_emitted when ETS participant draws down funds accrued to their contract or wallet._

| Name | Type | Description |
| ---- | ---- | ----------- |
| who | address | contract or wallet address being drawn down. |
| amount | uint256 | amount being drawn down. |

