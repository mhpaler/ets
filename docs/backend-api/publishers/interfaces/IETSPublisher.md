# IETSPublisher

Minimum interface required for ETS Publisher smart contracts. Contracts implementing this
interface will need to import OpenZeppelin ERC165, Ownable and Pausable contracts.
See https://github.com/ethereum-tag-service/ets/blob/stage/packages/contracts/contracts/examples/ETSPublisher.sol
for a sample implementation.

## Functions

### pause

```solidity
function pause() external
```

Pause this publisher contract.

_This function can only be called by the owner when the contract is unpaused._

### unpause

```solidity
function unpause() external
```

Unpause this publisher contract.

_This function can only be called by the owner when the contract is paused._

### changeOwner

```solidity
function changeOwner(address newOwner) external
```

Transfer this contract to a new owner.

_This function can only be called by the owner when the contract is paused._

| Name | Type | Description |
| ---- | ---- | ----------- |
| newOwner | address | Address of the new contract owner. |

### supportsInterface

```solidity
function supportsInterface(bytes4 interfaceId) external view returns (bool)
```

Broadcast support for IETSPublisher interface to external contracts.

_ETSCore will only add publisher contracts that implement IETSPublisher interface.
Your implementation should broadcast that it implements IETSPublisher interface._

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bool | boolean: true if this contract implements the interface defined by `interfaceId` |

### isPausedByOwner

```solidity
function isPausedByOwner() external view returns (bool)
```

Check whether this contract has been pasued by the owner.

_Pause functionality should be provided by OpenZeppelin Pausable utility._

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bool | boolean: true for paused; false for not paused. |

### getOwner

```solidity
function getOwner() external view returns (address payable)
```

Returns address of an IETSPublisher contract owner.

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | address payable | address of contract owner. |

### getPublisherName

```solidity
function getPublisherName() external view returns (string)
```

Returns human readable name for this IETSPublisher contract.

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | string | name of the Publisher contract as a string. |

### getCreator

```solidity
function getCreator() external view returns (address payable)
```

Returns address of an IETSPublisher contract creator.

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | address payable | address of the creator of the Publisher contract. |

## Events

### PublisherPauseToggledByOwner

```solidity
event PublisherPauseToggledByOwner(address publisherAddress)
```

_Emitted when an IETSPublisher contract is paused/unpaused._

| Name | Type | Description |
| ---- | ---- | ----------- |
| publisherAddress | address | Address of publisher contract. |

### PublisherOwnerChanged

```solidity
event PublisherOwnerChanged(address publisherAddress)
```

_Emitted when an IETSPublisher contract has changed owners._

| Name | Type | Description |
| ---- | ---- | ----------- |
| publisherAddress | address | Address of publisher contract. |

