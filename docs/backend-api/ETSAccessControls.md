# ETSAccessControls

This is the interface for the ETSAccessControls contract which allows ETS Core Dev
Team to administer roles and control access to various parts of the ETS Platform.
ETSAccessControls contract contains a mix of public and administrator only functions.

## Functions

### constructor

```solidity
constructor() public
```

### initialize

```solidity
function initialize(address _platformAddress) public
```

### \_authorizeUpgrade

```solidity
function _authorizeUpgrade(address) internal
```

### setPlatform

```solidity
function setPlatform(address payable _platform) public
```

Sets the Platform wallet address. Can only be called by address with DEFAULT_ADMIN_ROLE.

| Name       | Type            | Description                      |
| ---------- | --------------- | -------------------------------- |
| \_platform | address payable | The new Platform address to set. |

### setRoleAdmin

```solidity
function setRoleAdmin(bytes32 _role, bytes32 _adminRole) public
```

Sets the role admin for a given role. An address with role admin can grant or
revoke that role for other addresses. Can only be called by address with DEFAULT_ADMIN_ROLE.

| Name        | Type    | Description                                        |
| ----------- | ------- | -------------------------------------------------- |
| \_role      | bytes32 | bytes32 representation of role being administered. |
| \_adminRole | bytes32 | bytes32 representation of administering role.      |

### addPublisher

```solidity
function addPublisher(address _publisher, string _name) public
```

Adds a Publisher contract to ETS. Can only be called by address
with DEFAULT_ADMIN_ROLE.

| Name        | Type    | Description                                                       |
| ----------- | ------- | ----------------------------------------------------------------- |
| \_publisher | address | Address of the Publisher contract. Must conform to IETSPublisher. |
| \_name      | string  | Human readable name of the Publisher.                             |

### toggleIsPublisherPaused

```solidity
function toggleIsPublisherPaused(address _publisher) public
```

Pauses/Unpauses a Publisher contract. Can only be called by address
with DEFAULT_ADMIN_ROLE.

| Name        | Type    | Description                        |
| ----------- | ------- | ---------------------------------- |
| \_publisher | address | Address of the Publisher contract. |

### isSmartContract

```solidity
function isSmartContract(address _addr) public view returns (bool)
```

Checks whether given address has SMART_CONTRACT role.

| Name   | Type    | Description            |
| ------ | ------- | ---------------------- |
| \_addr | address | Address being checked. |

| Name | Type | Description                                      |
| ---- | ---- | ------------------------------------------------ |
| [0]  | bool | boolean True if address has SMART_CONTRACT role. |

### isAdmin

```solidity
function isAdmin(address _addr) public view returns (bool)
```

Checks whether given address has DEFAULT_ADMIN_ROLE role.

| Name   | Type    | Description            |
| ------ | ------- | ---------------------- |
| \_addr | address | Address being checked. |

| Name | Type | Description                                          |
| ---- | ---- | ---------------------------------------------------- |
| [0]  | bool | boolean True if address has DEFAULT_ADMIN_ROLE role. |

### isPublisher

```solidity
function isPublisher(address _addr) public view returns (bool)
```

Checks whether given address has PUBLISHER role.

| Name   | Type    | Description            |
| ------ | ------- | ---------------------- |
| \_addr | address | Address being checked. |

| Name | Type | Description                                 |
| ---- | ---- | ------------------------------------------- |
| [0]  | bool | boolean True if address has PUBLISHER role. |

### isPublisherAdmin

```solidity
function isPublisherAdmin(address _addr) public view returns (bool)
```

Checks whether given address has PUBLISHER_ADMIN role.

| Name   | Type    | Description            |
| ------ | ------- | ---------------------- |
| \_addr | address | Address being checked. |

| Name | Type | Description                                       |
| ---- | ---- | ------------------------------------------------- |
| [0]  | bool | boolean True if address has PUBLISHER_ADMIN role. |

### isPublisherByName

```solidity
function isPublisherByName(string _name) public view returns (bool)
```

Checks whether given Publisher Name is a registered Publisher.

| Name   | Type   | Description         |
| ------ | ------ | ------------------- |
| \_name | string | Name being checked. |

| Name | Type | Description                            |
| ---- | ---- | -------------------------------------- |
| [0]  | bool | boolean True if \_name is a Publisher. |

### isPublisherByAddress

```solidity
function isPublisherByAddress(address _addr) public view returns (bool)
```

Checks whether given address is a registered Publisher.

| Name   | Type    | Description            |
| ------ | ------- | ---------------------- |
| \_addr | address | Address being checked. |

| Name | Type | Description                                        |
| ---- | ---- | -------------------------------------------------- |
| [0]  | bool | boolean True if address is a registered Publisher. |

### isPublisherAndNotPaused

```solidity
function isPublisherAndNotPaused(address _addr) public view returns (bool)
```

Checks whether given address is a registered Publisher and not paused.

| Name   | Type    | Description            |
| ------ | ------- | ---------------------- |
| \_addr | address | Address being checked. |

| Name | Type | Description                                            |
| ---- | ---- | ------------------------------------------------------ |
| [0]  | bool | boolean True if address is a Publisher and not paused. |

### getPublisherAddressFromName

```solidity
function getPublisherAddressFromName(string _name) public view returns (address)
```

Get publisher address from it's name.

| Name   | Type   | Description        |
| ------ | ------ | ------------------ |
| \_name | string | Name of publisher. |

| Name | Type    | Description           |
| ---- | ------- | --------------------- |
| [0]  | address | Address of publisher. |

### getPublisherNameFromAddress

```solidity
function getPublisherNameFromAddress(address _address) public view returns (string)
```

Get publisher name from it's address.

| Name      | Type    | Description            |
| --------- | ------- | ---------------------- |
| \_address | address | Adsdress of publisher. |

| Name | Type   | Description        |
| ---- | ------ | ------------------ |
| [0]  | string | Name of publisher. |

### getPlatformAddress

```solidity
function getPlatformAddress() public view returns (address payable)
```

Returns wallet address for ETS Platform.

| Name | Type            | Description           |
| ---- | --------------- | --------------------- |
| [0]  | address payable | ETS Platform address. |
