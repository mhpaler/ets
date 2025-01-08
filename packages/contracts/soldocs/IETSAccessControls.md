# IETSAccessControls

## Functions

### setPlatform

```solidity
function setPlatform(address payable _platform) external
```

Sets the Platform wallet address. Can only be called by address with DEFAULT_ADMIN_ROLE.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _platform | address payable | The new Platform address to set. |

### registerRelayer

```solidity
function registerRelayer(address _relayer, string _name, address _owner) external
```

Adds a Relayer contract to ETS. Can only be called by address
with DEFAULT_ADMIN_ROLE.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _relayer | address | Address of the Relayer contract. Must conform to IETSRelayer. |
| _name | string | Human readable name of the Relayer. |
| _owner | address | Address of relayer owner. |

### pauseRelayerByOwnerAddress

```solidity
function pauseRelayerByOwnerAddress(address _relayerOwner) external
```

Pause relayer given the relayer owner address. Callable by Platform only.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _relayerOwner | address | Address of the Relayer owner. |

### changeRelayerOwner

```solidity
function changeRelayerOwner(address _currentOwner, address _newOwner) external
```

Change the relayer owner as stored in ETSAccessControls. Callable from Relayer only.
Called via changeOwner() on a relayer.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _currentOwner | address | Address of the current relayer owner. |
| _newOwner | address | Address of the new relayer owner. |

### toggleRelayerLock

```solidity
function toggleRelayerLock(address _relayer) external
```

Pauses/Unpauses a Relayer contract. Can only be called by address
with DEFAULT_ADMIN_ROLE.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _relayer | address | Address of the Relayer contract. |

### setRoleAdmin

```solidity
function setRoleAdmin(bytes32 _role, bytes32 _adminRole) external
```

Sets the role admin for a given role. An address with role admin can grant or
revoke that role for other addresses. Can only be called by address with DEFAULT_ADMIN_ROLE.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _role | bytes32 | bytes32 representation of role being administered. |
| _adminRole | bytes32 | bytes32 representation of administering role. |

### isSmartContract

```solidity
function isSmartContract(address _addr) external view returns (bool)
```

Checks whether given address has SMART_CONTRACT role.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _addr | address | Address being checked. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bool | boolean True if address has SMART_CONTRACT role. |

### isAdmin

```solidity
function isAdmin(address _addr) external view returns (bool)
```

Checks whether given address has DEFAULT_ADMIN_ROLE role.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _addr | address | Address being checked. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bool | boolean True if address has DEFAULT_ADMIN_ROLE role. |

### isAuctionOracle

```solidity
function isAuctionOracle(address _addr) external view returns (bool)
```

Checks whether given address has AUCTION_ORACLE_ROLE role.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _addr | address | Address being checked. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bool | boolean True if address has AUCTION_ORACLE_ROLE role. |

### isRelayerFactory

```solidity
function isRelayerFactory(address _addr) external view returns (bool)
```

Checks whether given address can act as relayer factory.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _addr | address | Address being checked. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bool | boolean True if address can act as relayer factory. |

### isRelayer

```solidity
function isRelayer(address _addr) external view returns (bool)
```

Checks whether given address is a relayer.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _addr | address | Address being checked. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bool | boolean True if address can be a relayer. |

### isRelayerAndNotPaused

```solidity
function isRelayerAndNotPaused(address _addr) external view returns (bool)
```

Checks whether given address is a registered Relayer and not paused.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _addr | address | Address being checked. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bool | boolean True if address is a Relayer and not paused. |

### isRelayerLocked

```solidity
function isRelayerLocked(address _addr) external view returns (bool)
```

Checks relayer is paused by ETS Platform.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _addr | address | Address being checked. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bool | boolean True if relayer address is paused by platform. |

### isRelayerByOwner

```solidity
function isRelayerByOwner(address _addr) external view returns (bool)
```

Checks whether given address owns a relayer.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _addr | address | Address being checked. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bool | boolean True if address owns a relayer. |

### isRelayerAdmin

```solidity
function isRelayerAdmin(address _addr) external view returns (bool)
```

Checks whether given address has RELAYER_ADMIN role.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _addr | address | Address being checked. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bool | boolean True if address has RELAYER_ADMIN role. |

### isRelayerByName

```solidity
function isRelayerByName(string _name) external view returns (bool)
```

Checks whether given Relayer Name is a registered Relayer.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _name | string | Name being checked. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bool | boolean True if _name is a Relayer. |

### isRelayerByAddress

```solidity
function isRelayerByAddress(address _addr) external view returns (bool)
```

Checks whether given address is a registered Relayer.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _addr | address | Address being checked. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bool | boolean True if address is a registered Relayer. |

### getRelayerAddressFromName

```solidity
function getRelayerAddressFromName(string _name) external view returns (address)
```

Get relayer address from it's name.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _name | string | Name of relayer. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | address | Address of relayer. |

### getRelayerNameFromAddress

```solidity
function getRelayerNameFromAddress(address _address) external view returns (string)
```

Get relayer name from it's address.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _address | address | Adsdress of relayer. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | string | Name of relayer. |

### getRelayerAddressFromOwner

```solidity
function getRelayerAddressFromOwner(address _address) external view returns (address)
```

Get relayer address from its owner address.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _address | address | address of relayer owner. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | address | Address of relayer. |

### getPlatformAddress

```solidity
function getPlatformAddress() external view returns (address payable)
```

Returns wallet address for ETS Platform.

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | address payable | ETS Platform address. |

## Events

### PlatformSet

```solidity
event PlatformSet(address newAddress, address prevAddress)
```

_emitted when the ETS Platform address is set._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| newAddress | address | wallet address platform is being set to. |
| prevAddress | address | previous platform address. |

### RelayerAdded

```solidity
event RelayerAdded(address relayer)
```

_emitted when a Relayer contract is added & enabled in ETS.

Relayer contracts are not required implement all ETS Core API functions. Therefore, to ease
testing of ETS Core API fuinctions, ETS permits addition of ETS owned wallet addresses as Relayers._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| relayer | address | Relayer contract address. |

### RelayerLockToggled

```solidity
event RelayerLockToggled(address relayer)
```

_emitted when a Relayer contract is paused or unpaused._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| relayer | address | Address that had pause toggled. |

