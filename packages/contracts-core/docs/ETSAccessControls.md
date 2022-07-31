# ETSAccessControls

This is the interface for the ETSAccessControls contract which allows ETS Core Dev
Team to administer roles and control access to various parts of the ETS Platform.
ETSAccessControls contract contains a mix of public and administrator only functions.

## Functions

### initialize

```solidity
function initialize() public
```

### _authorizeUpgrade

```solidity
function _authorizeUpgrade(address) internal
```

### setPlatform

```solidity
function setPlatform(address payable _platform) public
```

Sets the Platform wallet address. Can only be called by address with DEFAULT_ADMIN_ROLE.

| Name | Type | Description |
| ---- | ---- | ----------- |
| _platform | address payable | The new Platform address to set. |

### setRoleAdmin

```solidity
function setRoleAdmin(bytes32 _role, bytes32 _adminRole) public
```

Sets the role admin for a given role. An address with role admin can grant or
revoke that role for other addresses. Can only be called by address with DEFAULT_ADMIN_ROLE.

| Name | Type | Description |
| ---- | ---- | ----------- |
| _role | bytes32 | bytes32 representation of role being administered. |
| _adminRole | bytes32 | bytes32 representation of administering role. |

### addTargetTagger

```solidity
function addTargetTagger(address _taggerAddress, string _name) public
```

Adds a Target Tagger contract to ETS. Can only be called by address
with DEFAULT_ADMIN_ROLE.

| Name | Type | Description |
| ---- | ---- | ----------- |
| _taggerAddress | address | Address of the Target Tagger contract. Must conform to IETSTargetTagger. |
| _name | string | Human readable name of the Target Tagger. |

### removeTargetTagger

```solidity
function removeTargetTagger(address _taggerAddress) public
```

Removes a Target Tagger contract from ETS. Can only be called by address
with DEFAULT_ADMIN_ROLE.

| Name | Type | Description |
| ---- | ---- | ----------- |
| _taggerAddress | address | Address of the Target Tagger contract. |

### toggleIsTargetTaggerPaused

```solidity
function toggleIsTargetTaggerPaused(address _taggerAddress) public
```

Pauses/Unpauses a Target Tagger contract. Can only be called by address
with DEFAULT_ADMIN_ROLE.

| Name | Type | Description |
| ---- | ---- | ----------- |
| _taggerAddress | address | Address of the Target Tagger contract. |

### isSmartContract

```solidity
function isSmartContract(address _addr) public view returns (bool)
```

Checks whether given address has SMART_CONTRACT role.

| Name | Type | Description |
| ---- | ---- | ----------- |
| _addr | address | Address being checked. |

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bool | boolean True if address has SMART_CONTRACT role. |

### isAdmin

```solidity
function isAdmin(address _addr) public view returns (bool)
```

Checks whether given address has DEFAULT_ADMIN_ROLE role.

| Name | Type | Description |
| ---- | ---- | ----------- |
| _addr | address | Address being checked. |

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bool | boolean True if address has DEFAULT_ADMIN_ROLE role. |

### isPublisher

```solidity
function isPublisher(address _addr) public view returns (bool)
```

Checks whether given address has PUBLISHER role.

| Name | Type | Description |
| ---- | ---- | ----------- |
| _addr | address | Address being checked. |

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bool | boolean True if address has PUBLISHER role. |

### isPublisherAdmin

```solidity
function isPublisherAdmin(address _addr) public view returns (bool)
```

Checks whether given address has PUBLISHER_ADMIN role.

| Name | Type | Description |
| ---- | ---- | ----------- |
| _addr | address | Address being checked. |

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bool | boolean True if address has PUBLISHER_ADMIN role. |

### isTargetTagger

```solidity
function isTargetTagger(string _name) public view returns (bool)
```

Checks whether given Tagger Name is a registered Target Tagger.

| Name | Type | Description |
| ---- | ---- | ----------- |
| _name | string | Name being checked. |

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bool | boolean True if _name is a Target Tagger. |

### isTargetTagger

```solidity
function isTargetTagger(address _addr) public view returns (bool)
```

Checks whether given address is a registered Target Tagger.

| Name | Type | Description |
| ---- | ---- | ----------- |
| _addr | address | Address being checked. |

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bool | boolean True if address is a Target Tagger. |

### isTargetTaggerAndNotPaused

```solidity
function isTargetTaggerAndNotPaused(address _addr) public view returns (bool)
```

Checks whether given address is a registered Target Tagger and not paused.

| Name | Type | Description |
| ---- | ---- | ----------- |
| _addr | address | Address being checked. |

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bool | boolean True if address is a Target Tagger and not paused. |

### getPlatformAddress

```solidity
function getPlatformAddress() public view returns (address payable)
```

Returns wallet address for ETS Platform.

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | address payable | ETS Platform address. |

