# ETSRelayerV1

## Functions

### constructor

```solidity
constructor() public
```

### initialize

```solidity
function initialize(string _relayerName, contract IETS _ets, contract IETSToken _etsToken, contract IETSTarget _etsTarget, contract IETSAccessControls _etsAccessControls, address payable _creator, address payable _owner) public
```

### pause

```solidity
function pause() public
```

Pause this relayer contract.

_This function can only be called by the owner when the contract is unpaused._

### unpause

```solidity
function unpause() public
```

Unpause this relayer contract.

_This function can only be called by the owner when the contract is paused._

### changeOwner

```solidity
function changeOwner(address _newOwner) public
```

Transfer this contract to a new owner.

_This function can only be called by the owner when the contract is paused._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _newOwner | address |  |

### applyTags

```solidity
function applyTags(struct IETS.TaggingRecordRawInput[] _rawInput) public payable
```

Apply one or more tags to a targetURI using tagging record raw client input data.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _rawInput | struct IETS.TaggingRecordRawInput[] | Raw client input data formed as TaggingRecordRawInput struct. |

### replaceTags

```solidity
function replaceTags(struct IETS.TaggingRecordRawInput[] _rawInput) public payable
```

Replace entire tag set in tagging record using raw data for record lookup.

If supplied tag strings don't have CTAGs, new ones are minted.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _rawInput | struct IETS.TaggingRecordRawInput[] | Raw client input data formed as TaggingRecordRawInput struct. |

### removeTags

```solidity
function removeTags(struct IETS.TaggingRecordRawInput[] _rawInput) public payable
```

Remove one or more tags from a tagging record using raw data for record lookup.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _rawInput | struct IETS.TaggingRecordRawInput[] | Raw client input data formed as TaggingRecordRawInput struct. |

### getOrCreateTagIds

```solidity
function getOrCreateTagIds(string[] _tags) public payable returns (uint256[] _tagIds)
```

Get or create CTAG tokens from tag strings.

Combo function that accepts a tag strings and returns corresponding CTAG token Id if it exists,
or if it doesn't exist, creates a new CTAG and then returns corresponding Id.

Only ETS Publisher contracts may call this function.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _tags | string[] | Array of tag strings. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| _tagIds | uint256[] | Array of Id of CTAG Ids. |

### version

```solidity
function version() external view virtual returns (string)
```

### supportsInterface

```solidity
function supportsInterface(bytes4 interfaceId) public view virtual returns (bool)
```

_See {IERC165-supportsInterface}._

### isPaused

```solidity
function isPaused() public view virtual returns (bool)
```

Check whether this contract has been pasued by the owner.

_Pause functionality should be provided by OpenZeppelin Pausable utility._

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bool | boolean: true for paused; false for not paused. |

### getOwner

```solidity
function getOwner() public view virtual returns (address payable)
```

Returns address of an IETSRelayer contract owner.

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | address payable | address of contract owner. |

### getRelayerName

```solidity
function getRelayerName() public view returns (string)
```

Returns human readable name for this IETSRelayer contract.

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | string | name of the Relayer contract as a string. |

### getCreator

```solidity
function getCreator() public view returns (address payable)
```

Returns address of an IETSRelayer contract creator.

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | address payable | address of the creator of the Relayer contract. |

### computeTaggingFee

```solidity
function computeTaggingFee(struct IETS.TaggingRecordRawInput _rawInput, enum IETS.TaggingAction _action) public view returns (uint256 fee, uint256 tagCount)
```

Compute tagging fee for raw input and desired action.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _rawInput | struct IETS.TaggingRecordRawInput | Raw client input data formed as TaggingRecordRawInput struct. |
| _action | enum IETS.TaggingAction | Integer representing action to be performed according to enum TaggingAction. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| fee | uint256 | Calculated tagging fee in ETH/Matic |
| tagCount | uint256 | Number of new tags being added to tagging record. |

### getBalance

```solidity
function getBalance() public view returns (uint256)
```

### _applyTags

```solidity
function _applyTags(struct IETS.TaggingRecordRawInput _rawInput, address payable _tagger, uint256 _taggingFee) internal
```

### _replaceTags

```solidity
function _replaceTags(struct IETS.TaggingRecordRawInput _rawInput, address payable _tagger, uint256 _taggingFee) internal
```

### _removeTags

```solidity
function _removeTags(struct IETS.TaggingRecordRawInput _rawInput, address payable _tagger) internal
```

### receive

```solidity
receive() external payable
```

### fallback

```solidity
fallback() external payable
```

