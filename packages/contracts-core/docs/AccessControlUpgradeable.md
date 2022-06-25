# AccessControlUpgradeable.sol

View Source: [@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol](https://github.com/ethereum-tag-service/ets/tree/stage/packages/contracts-core@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol)

**↗ Extends: [Initializable](Initializable.md), [ContextUpgradeable](ContextUpgradeable.md), [IAccessControlUpgradeable](IAccessControlUpgradeable.md), [ERC165Upgradeable](ERC165Upgradeable.md)**
**↘ Derived Contracts: [ETSAccessControls](ETSAccessControls.md)**

**AccessControlUpgradeable**

Contract module that allows children to implement role-based access
 control mechanisms. This is a lightweight version that doesn't allow enumerating role
 members except through off-chain means by accessing the contract event logs. Some
 applications may benefit from on-chain enumerability, for those cases see
 {AccessControlEnumerable}.
 Roles are referred to by their `bytes32` identifier. These should be exposed
 in the external API and be unique. The best way to achieve this is by
 using `public constant` hash digests:
 ```
 bytes32 public constant MY_ROLE = keccak256("MY_ROLE");
 ```
 Roles can be used to represent a set of permissions. To restrict access to a
 function call, use {hasRole}:
 ```
 function foo() public {
     require(hasRole(MY_ROLE, msg.sender));
     ...
 }
 ```
 Roles can be granted and revoked dynamically via the {grantRole} and
 {revokeRole} functions. Each role has an associated admin role, and only
 accounts that have a role's admin role can call {grantRole} and {revokeRole}.
 By default, the admin role for all roles is `DEFAULT_ADMIN_ROLE`, which means
 that only accounts with this role will be able to grant or revoke other
 roles. More complex role relationships can be created by using
 {_setRoleAdmin}.
 WARNING: The `DEFAULT_ADMIN_ROLE` is also its own admin: it has permission to
 grant and revoke this role. Extra precautions should be taken to secure
 accounts that have been granted it.

## Structs
### RoleData

```solidity
struct RoleData {
 mapping(address => bool) members,
 bytes32 adminRole
}
```

## Contract Members
**Constants & Variables**

```solidity
//private members
mapping(bytes32 => struct AccessControlUpgradeable.RoleData) private _roles;
uint256[49] private __gap;

//public members
bytes32 public constant DEFAULT_ADMIN_ROLE;

```

## Modifiers

- [onlyRole](#onlyrole)

### onlyRole

Modifier that checks that an account has a specific role. Reverts
 with a standardized message including the required role.
 The format of the revert reason is given by the following regular expression:
  /^AccessControl: account (0x[0-9a-f]{40}) is missing role (0x[0-9a-f]{64})$/
 _Available since v4.1._

```solidity
modifier onlyRole(bytes32 role) internal
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| role | bytes32 |  | 

## Functions

- [__AccessControl_init](#__accesscontrol_init)
- [__AccessControl_init_unchained](#__accesscontrol_init_unchained)
- [supportsInterface](#supportsinterface)
- [hasRole](#hasrole)
- [_checkRole](#_checkrole)
- [_checkRole](#_checkrole)
- [getRoleAdmin](#getroleadmin)
- [grantRole](#grantrole)
- [revokeRole](#revokerole)
- [renounceRole](#renouncerole)
- [_setupRole](#_setuprole)
- [_setRoleAdmin](#_setroleadmin)
- [_grantRole](#_grantrole)
- [_revokeRole](#_revokerole)

### __AccessControl_init

```solidity
function __AccessControl_init() internal nonpayable onlyInitializing 
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|

### __AccessControl_init_unchained

```solidity
function __AccessControl_init_unchained() internal nonpayable onlyInitializing 
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|

### supportsInterface

See {IERC165-supportsInterface}.

```solidity
function supportsInterface(bytes4 interfaceId) public view
returns(bool)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| interfaceId | bytes4 |  | 

### hasRole

Returns `true` if `account` has been granted `role`.

```solidity
function hasRole(bytes32 role, address account) public view
returns(bool)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| role | bytes32 |  | 
| account | address |  | 

### _checkRole

Revert with a standard message if `_msgSender()` is missing `role`.
 Overriding this function changes the behavior of the {onlyRole} modifier.
 Format of the revert message is described in {_checkRole}.
 _Available since v4.6._

```solidity
function _checkRole(bytes32 role) internal view
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| role | bytes32 |  | 

### _checkRole

Revert with a standard message if `account` is missing `role`.
 The format of the revert reason is given by the following regular expression:
  /^AccessControl: account (0x[0-9a-f]{40}) is missing role (0x[0-9a-f]{64})$/

```solidity
function _checkRole(bytes32 role, address account) internal view
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| role | bytes32 |  | 
| account | address |  | 

### getRoleAdmin

Returns the admin role that controls `role`. See {grantRole} and
 {revokeRole}.
 To change a role's admin, use {_setRoleAdmin}.

```solidity
function getRoleAdmin(bytes32 role) public view
returns(bytes32)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| role | bytes32 |  | 

### grantRole

Grants `role` to `account`.
 If `account` had not been already granted `role`, emits a {RoleGranted}
 event.
 Requirements:
 - the caller must have ``role``'s admin role.

```solidity
function grantRole(bytes32 role, address account) public nonpayable onlyRole 
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| role | bytes32 |  | 
| account | address |  | 

### revokeRole

Revokes `role` from `account`.
 If `account` had been granted `role`, emits a {RoleRevoked} event.
 Requirements:
 - the caller must have ``role``'s admin role.

```solidity
function revokeRole(bytes32 role, address account) public nonpayable onlyRole 
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| role | bytes32 |  | 
| account | address |  | 

### renounceRole

Revokes `role` from the calling account.
 Roles are often managed via {grantRole} and {revokeRole}: this function's
 purpose is to provide a mechanism for accounts to lose their privileges
 if they are compromised (such as when a trusted device is misplaced).
 If the calling account had been revoked `role`, emits a {RoleRevoked}
 event.
 Requirements:
 - the caller must be `account`.

```solidity
function renounceRole(bytes32 role, address account) public nonpayable
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| role | bytes32 |  | 
| account | address |  | 

### _setupRole

Grants `role` to `account`.
 If `account` had not been already granted `role`, emits a {RoleGranted}
 event. Note that unlike {grantRole}, this function doesn't perform any
 checks on the calling account.
 [WARNING]
 ====
 This function should only be called from the constructor when setting
 up the initial roles for the system.
 Using this function in any other way is effectively circumventing the admin
 system imposed by {AccessControl}.
 ====
 NOTE: This function is deprecated in favor of {_grantRole}.

```solidity
function _setupRole(bytes32 role, address account) internal nonpayable
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| role | bytes32 |  | 
| account | address |  | 

### _setRoleAdmin

Sets `adminRole` as ``role``'s admin role.
 Emits a {RoleAdminChanged} event.

```solidity
function _setRoleAdmin(bytes32 role, bytes32 adminRole) internal nonpayable
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| role | bytes32 |  | 
| adminRole | bytes32 |  | 

### _grantRole

Grants `role` to `account`.
 Internal function without access restriction.

```solidity
function _grantRole(bytes32 role, address account) internal nonpayable
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| role | bytes32 |  | 
| account | address |  | 

### _revokeRole

Revokes `role` from `account`.
 Internal function without access restriction.

```solidity
function _revokeRole(bytes32 role, address account) internal nonpayable
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| role | bytes32 |  | 
| account | address |  | 

## Contracts

* [AccessControlUpgradeable](AccessControlUpgradeable.md)
* [Address](Address.md)
* [AddressUpgradeable](AddressUpgradeable.md)
* [console](console.md)
* [Context](Context.md)
* [ContextUpgradeable](ContextUpgradeable.md)
* [ERC165](ERC165.md)
* [ERC165Upgradeable](ERC165Upgradeable.md)
* [ERC1967UpgradeUpgradeable](ERC1967UpgradeUpgradeable.md)
* [ERC721](ERC721.md)
* [ERC721Burnable](ERC721Burnable.md)
* [ERC721BurnableMock](ERC721BurnableMock.md)
* [ERC721BurnableUpgradeable](ERC721BurnableUpgradeable.md)
* [ERC721PausableUpgradeable](ERC721PausableUpgradeable.md)
* [ERC721ReceiverMock](ERC721ReceiverMock.md)
* [ERC721Upgradeable](ERC721Upgradeable.md)
* [ETSAccessControls](ETSAccessControls.md)
* [ETSAccessControlsUpgrade](ETSAccessControlsUpgrade.md)
* [ETSAuctionHouse](ETSAuctionHouse.md)
* [ETSAuctionHouseUpgrade](ETSAuctionHouseUpgrade.md)
* [ETSToken](ETSToken.md)
* [ETSTokenUpgrade](ETSTokenUpgrade.md)
* [IAccessControlUpgradeable](IAccessControlUpgradeable.md)
* [IBeaconUpgradeable](IBeaconUpgradeable.md)
* [IERC165](IERC165.md)
* [IERC165Upgradeable](IERC165Upgradeable.md)
* [IERC1822ProxiableUpgradeable](IERC1822ProxiableUpgradeable.md)
* [IERC20Upgradeable](IERC20Upgradeable.md)
* [IERC721](IERC721.md)
* [IERC721Metadata](IERC721Metadata.md)
* [IERC721MetadataUpgradeable](IERC721MetadataUpgradeable.md)
* [IERC721Receiver](IERC721Receiver.md)
* [IERC721ReceiverUpgradeable](IERC721ReceiverUpgradeable.md)
* [IERC721Upgradeable](IERC721Upgradeable.md)
* [IETSAccessControls](IETSAccessControls.md)
* [IETSAuctionHouse](IETSAuctionHouse.md)
* [IETSToken](IETSToken.md)
* [Initializable](Initializable.md)
* [IWMATIC](IWMATIC.md)
* [MaliciousBidder](MaliciousBidder.md)
* [PausableUpgradeable](PausableUpgradeable.md)
* [ReentrancyGuardUpgradeable](ReentrancyGuardUpgradeable.md)
* [SafeERC20Upgradeable](SafeERC20Upgradeable.md)
* [SafeMathUpgradeable](SafeMathUpgradeable.md)
* [StorageSlotUpgradeable](StorageSlotUpgradeable.md)
* [StringHelpers](StringHelpers.md)
* [Strings](Strings.md)
* [StringsUpgradeable](StringsUpgradeable.md)
* [UUPSUpgradeable](UUPSUpgradeable.md)
* [WMATIC](WMATIC.md)
