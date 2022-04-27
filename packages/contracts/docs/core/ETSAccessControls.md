# ETSAccessControls

*Ethereum Tag Service &lt;security@ets.xyz&gt;*

> ETS access controls



*Maintains a mapping of ethereum addresses and roles they have within the protocol*

## Methods

### DEFAULT_ADMIN_ROLE

```solidity
function DEFAULT_ADMIN_ROLE() external view returns (bytes32)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bytes32 | undefined |

### NAME

```solidity
function NAME() external view returns (string)
```

Public constants




#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | string | undefined |

### PUBLISHER_ROLE

```solidity
function PUBLISHER_ROLE() external view returns (bytes32)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bytes32 | undefined |

### SMART_CONTRACT_ROLE

```solidity
function SMART_CONTRACT_ROLE() external view returns (bytes32)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bytes32 | undefined |

### TARGET_TYPE_ROLE

```solidity
function TARGET_TYPE_ROLE() external view returns (bytes32)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bytes32 | undefined |

### VERSION

```solidity
function VERSION() external view returns (string)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | string | undefined |

### addTargetType

```solidity
function addTargetType(address _smartContract, string _name) external nonpayable
```

Add a new target type smart contract to the ETS protocol. Tagging a target is executed through a target type &quot;subcontract&quot; calling ETS core. Note: Admin addresses can be added as target type to permit calling ETS core directly for tagging testing and debugging purposes.



#### Parameters

| Name | Type | Description |
|---|---|---|
| _smartContract | address | undefined |
| _name | string | undefined |

### getRoleAdmin

```solidity
function getRoleAdmin(bytes32 role) external view returns (bytes32)
```



*Returns the admin role that controls `role`. See {grantRole} and {revokeRole}. To change a role&#39;s admin, use {_setRoleAdmin}.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| role | bytes32 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bytes32 | undefined |

### grantRole

```solidity
function grantRole(bytes32 role, address account) external nonpayable
```



*Grants `role` to `account`. If `account` had not been already granted `role`, emits a {RoleGranted} event. Requirements: - the caller must have ``role``&#39;s admin role.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| role | bytes32 | undefined |
| account | address | undefined |

### hasRole

```solidity
function hasRole(bytes32 role, address account) external view returns (bool)
```



*Returns `true` if `account` has been granted `role`.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| role | bytes32 | undefined |
| account | address | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | undefined |

### initialize

```solidity
function initialize() external nonpayable
```






### isAdmin

```solidity
function isAdmin(address _addr) external view returns (bool)
```



*Checks whether an address has an admin role*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _addr | address | Address being checked |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | bool True if the address has the role, false if not |

### isPublisher

```solidity
function isPublisher(address _addr) external view returns (bool)
```



*Checks whether an address has a publisher role*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _addr | address | Address being checked |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | bool True if the address has the role, false if not |

### isSmartContract

```solidity
function isSmartContract(address _addr) external view returns (bool)
```



*Checks whether an address has a smart contract role.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _addr | address | Address being checked. |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | bool True if the address has the role, false if not. |

### isTargetType

```solidity
function isTargetType(address _smartContract) external view returns (bool)
```

Checks whether an address has the tagging contract role



#### Parameters

| Name | Type | Description |
|---|---|---|
| _smartContract | address | Address being checked |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | bool True if the address has the role, false if not |

### isTargetTypeAndNotPaused

```solidity
function isTargetTypeAndNotPaused(address _smartContract) external view returns (bool)
```

Checks whether an address has the target type contract role and is not paused from tagging



#### Parameters

| Name | Type | Description |
|---|---|---|
| _smartContract | address | Address being checked |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | undefined |

### isTargetTypePaused

```solidity
function isTargetTypePaused(address) external view returns (bool)
```

If target type is paused by the protocol



#### Parameters

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | undefined |

### removeTargetType

```solidity
function removeTargetType(address _smartContract) external nonpayable
```

Remove a target type smart contract from the protocol



#### Parameters

| Name | Type | Description |
|---|---|---|
| _smartContract | address | undefined |

### renounceRole

```solidity
function renounceRole(bytes32 role, address account) external nonpayable
```



*Revokes `role` from the calling account. Roles are often managed via {grantRole} and {revokeRole}: this function&#39;s purpose is to provide a mechanism for accounts to lose their privileges if they are compromised (such as when a trusted device is misplaced). If the calling account had been revoked `role`, emits a {RoleRevoked} event. Requirements: - the caller must be `account`.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| role | bytes32 | undefined |
| account | address | undefined |

### revokeRole

```solidity
function revokeRole(bytes32 role, address account) external nonpayable
```



*Revokes `role` from `account`. If `account` had been granted `role`, emits a {RoleRevoked} event. Requirements: - the caller must have ``role``&#39;s admin role.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| role | bytes32 | undefined |
| account | address | undefined |

### supportsInterface

```solidity
function supportsInterface(bytes4 interfaceId) external view returns (bool)
```



*See {IERC165-supportsInterface}.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| interfaceId | bytes4 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | undefined |

### targetTypeContractName

```solidity
function targetTypeContractName(address) external view returns (string)
```

Target type contract address to registered name or empty string if nothing assigned



#### Parameters

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | string | undefined |

### targetTypeToContract

```solidity
function targetTypeToContract(string) external view returns (address)
```

Target type name to target type contract address or zero if nothing assigned



#### Parameters

| Name | Type | Description |
|---|---|---|
| _0 | string | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |

### toggleIsTargetTypePaused

```solidity
function toggleIsTargetTypePaused(address _smartContract) external nonpayable
```

Toggle whether the target type is paused or not



#### Parameters

| Name | Type | Description |
|---|---|---|
| _smartContract | address | undefined |

### upgradeTo

```solidity
function upgradeTo(address newImplementation) external nonpayable
```



*Upgrade the implementation of the proxy to `newImplementation`. Calls {_authorizeUpgrade}. Emits an {Upgraded} event.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| newImplementation | address | undefined |

### upgradeToAndCall

```solidity
function upgradeToAndCall(address newImplementation, bytes data) external payable
```



*Upgrade the implementation of the proxy to `newImplementation`, and subsequently execute the function call encoded in `data`. Calls {_authorizeUpgrade}. Emits an {Upgraded} event.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| newImplementation | address | undefined |
| data | bytes | undefined |

### version

```solidity
function version() external pure returns (string)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | string | undefined |



## Events

### AdminChanged

```solidity
event AdminChanged(address previousAdmin, address newAdmin)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| previousAdmin  | address | undefined |
| newAdmin  | address | undefined |

### BeaconUpgraded

```solidity
event BeaconUpgraded(address indexed beacon)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| beacon `indexed` | address | undefined |

### RoleAdminChanged

```solidity
event RoleAdminChanged(bytes32 indexed role, bytes32 indexed previousAdminRole, bytes32 indexed newAdminRole)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| role `indexed` | bytes32 | undefined |
| previousAdminRole `indexed` | bytes32 | undefined |
| newAdminRole `indexed` | bytes32 | undefined |

### RoleGranted

```solidity
event RoleGranted(bytes32 indexed role, address indexed account, address indexed sender)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| role `indexed` | bytes32 | undefined |
| account `indexed` | address | undefined |
| sender `indexed` | address | undefined |

### RoleRevoked

```solidity
event RoleRevoked(bytes32 indexed role, address indexed account, address indexed sender)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| role `indexed` | bytes32 | undefined |
| account `indexed` | address | undefined |
| sender `indexed` | address | undefined |

### TargetTypePauseToggled

```solidity
event TargetTypePauseToggled(bool newValue)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| newValue  | bool | undefined |

### Upgraded

```solidity
event Upgraded(address indexed implementation)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| implementation `indexed` | address | undefined |



