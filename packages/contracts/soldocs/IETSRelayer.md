# IETSRelayer

## Functions

### pause

```solidity
function pause() external
```

Pause this relayer contract.

_This function can only be called by the owner when the contract is unpaused._

### unpause

```solidity
function unpause() external
```

Unpause this relayer contract.

_This function can only be called by the owner when the contract is paused._

### changeOwner

```solidity
function changeOwner(address newOwner) external
```

Transfer this contract to a new owner.

_This function can only be called by the owner when the contract is paused._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| newOwner | address | Address of the new contract owner. |

### supportsInterface

```solidity
function supportsInterface(bytes4 interfaceId) external view returns (bool)
```

Broadcast support for IETSRelayer interface to external contracts.

_ETSCore will only add relayer contracts that implement IETSRelayer interface.
Your implementation should broadcast that it implements IETSRelayer interface._

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bool | boolean: true if this contract implements the interface defined by `interfaceId` |

### isPaused

```solidity
function isPaused() external view returns (bool)
```

Check whether this contract has been pasued by the owner.

_Pause functionality should be provided by OpenZeppelin Pausable utility._

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bool | boolean: true for paused; false for not paused. |

### getOwner

```solidity
function getOwner() external view returns (address payable)
```

Returns address of an IETSRelayer contract owner.

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | address payable | address of contract owner. |

### getRelayerName

```solidity
function getRelayerName() external view returns (string)
```

Returns human readable name for this IETSRelayer contract.

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | string | name of the Relayer contract as a string. |

### getCreator

```solidity
function getCreator() external view returns (address payable)
```

Returns address of an IETSRelayer contract creator.

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | address payable | address of the creator of the Relayer contract. |

### applyTags

```solidity
function applyTags(struct IETS.TaggingRecordRawInput[] _rawInput) external payable
```

Apply one or more tags to a targetURI using tagging record raw client input data.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _rawInput | struct IETS.TaggingRecordRawInput[] | Raw client input data formed as TaggingRecordRawInput struct. |

### replaceTags

```solidity
function replaceTags(struct IETS.TaggingRecordRawInput[] _rawInput) external payable
```

Replace entire tag set in tagging record using raw data for record lookup.

If supplied tag strings don't have CTAGs, new ones are minted.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _rawInput | struct IETS.TaggingRecordRawInput[] | Raw client input data formed as TaggingRecordRawInput struct. |

### removeTags

```solidity
function removeTags(struct IETS.TaggingRecordRawInput[] _rawInput) external payable
```

Remove one or more tags from a tagging record using raw data for record lookup.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _rawInput | struct IETS.TaggingRecordRawInput[] | Raw client input data formed as TaggingRecordRawInput struct. |

### getOrCreateTagIds

```solidity
function getOrCreateTagIds(string[] _tags) external payable returns (uint256[] _tagIds)
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

### computeTaggingFee

```solidity
function computeTaggingFee(struct IETS.TaggingRecordRawInput _rawInput, enum IETS.TaggingAction _action) external view returns (uint256 fee, uint256 tagCount)
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

## Events

### RelayerPauseToggledByOwner

```solidity
event RelayerPauseToggledByOwner(address relayerAddress)
```

_Emitted when an IETSRelayer contract is paused/unpaused by owner._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| relayerAddress | address | Address of relayer contract. |

### RelayerOwnerChanged

```solidity
event RelayerOwnerChanged(address relayerAddress)
```

_Emitted when an IETSRelayer contract has changed owners._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| relayerAddress | address | Address of relayer contract. |

