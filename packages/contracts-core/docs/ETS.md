# ETS

This is the core ETS tagging contract that records TaggingRecords to the blockchain.
It also contains some governance functions around tagging fees as well as means for market
participants to access accrued funds.

## Functions

### initialize

```solidity
function initialize(contract IETSAccessControls _etsAccessControls, contract IETSToken _etsToken, contract IETSTarget _etsTarget, uint256 _taggingFee, uint256 _platformPercentage, uint256 _publisherPercentage) public
```

### _authorizeUpgrade

```solidity
function _authorizeUpgrade(address) internal
```

### setAccessControls

```solidity
function setAccessControls(contract IETSAccessControls _accessControls) public
```

Admin functionality for updating the access controls.

| Name | Type | Description |
| ---- | ---- | ----------- |
| _accessControls | contract IETSAccessControls | Address of the access controls contract. |

### setTaggingFee

```solidity
function setTaggingFee(uint256 _fee) public
```

Sets the fee required to tag an NFT asset.

| Name | Type | Description |
| ---- | ---- | ----------- |
| _fee | uint256 | Value of the fee in WEI. |

### setPercentages

```solidity
function setPercentages(uint256 _platformPercentage, uint256 _publisherPercentage) public
```

Admin functionality for updating the percentages.

| Name | Type | Description |
| ---- | ---- | ----------- |
| _platformPercentage | uint256 | percentage for platform. |
| _publisherPercentage | uint256 | percentage for publisher. |

### tagTarget

```solidity
function tagTarget(uint256[] _tagIds, uint256 _targetId, string _recordType, address payable _tagger) public payable
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
function computeTaggingRecordId(uint256 _targetId, string _recordType, address _publisher, address _tagger) public pure returns (uint256 taggingRecordId)
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
function totalDue(address _account) public view returns (uint256 _due)
```

Function to check how much MATIC has been accrued by an address factoring in amount paid out.

| Name | Type | Description |
| ---- | ---- | ----------- |
| _account | address | Address of the account being queried. |

| Name | Type | Description |
| ---- | ---- | ----------- |
| _due | uint256 | Amount of WEI in MATIC due to account. |

### _processAccrued

```solidity
function _processAccrued(uint256 _tagId, address _platform) internal
```

