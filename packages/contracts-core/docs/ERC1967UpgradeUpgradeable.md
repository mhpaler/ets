# ERC1967UpgradeUpgradeable.sol

View Source: [@openzeppelin/contracts-upgradeable/proxy/ERC1967/ERC1967UpgradeUpgradeable.sol](https://github.com/ethereum-tag-service/ets/tree/stage/packages/contracts-core@openzeppelin/contracts-upgradeable/proxy/ERC1967/ERC1967UpgradeUpgradeable.sol)

**↗ Extends: [Initializable](Initializable.md)**
**↘ Derived Contracts: [UUPSUpgradeable](UUPSUpgradeable.md)**

**ERC1967UpgradeUpgradeable**

This abstract contract provides getters and event emitting update functions for
 https://eips.ethereum.org/EIPS/eip-1967[EIP1967] slots.
 _Available since v4.1._

## Contract Members
**Constants & Variables**

```solidity
//private members
bytes32 private constant _ROLLBACK_SLOT;
uint256[50] private __gap;

//internal members
bytes32 internal constant _IMPLEMENTATION_SLOT;
bytes32 internal constant _ADMIN_SLOT;
bytes32 internal constant _BEACON_SLOT;

```

## Events

```solidity
event Upgraded(address indexed implementation);
event AdminChanged(address  previousAdmin, address  newAdmin);
event BeaconUpgraded(address indexed beacon);
```

## Functions

- [__ERC1967Upgrade_init](#__erc1967upgrade_init)
- [__ERC1967Upgrade_init_unchained](#__erc1967upgrade_init_unchained)
- [_getImplementation](#_getimplementation)
- [_setImplementation](#_setimplementation)
- [_upgradeTo](#_upgradeto)
- [_upgradeToAndCall](#_upgradetoandcall)
- [_upgradeToAndCallUUPS](#_upgradetoandcalluups)
- [_getAdmin](#_getadmin)
- [_setAdmin](#_setadmin)
- [_changeAdmin](#_changeadmin)
- [_getBeacon](#_getbeacon)
- [_setBeacon](#_setbeacon)
- [_upgradeBeaconToAndCall](#_upgradebeacontoandcall)
- [_functionDelegateCall](#_functiondelegatecall)

### __ERC1967Upgrade_init

```solidity
function __ERC1967Upgrade_init() internal nonpayable onlyInitializing 
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|

### __ERC1967Upgrade_init_unchained

```solidity
function __ERC1967Upgrade_init_unchained() internal nonpayable onlyInitializing 
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|

### _getImplementation

Returns the current implementation address.

```solidity
function _getImplementation() internal view
returns(address)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|

### _setImplementation

Stores a new address in the EIP1967 implementation slot.

```solidity
function _setImplementation(address newImplementation) private nonpayable
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| newImplementation | address |  | 

### _upgradeTo

Perform implementation upgrade
 Emits an {Upgraded} event.

```solidity
function _upgradeTo(address newImplementation) internal nonpayable
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| newImplementation | address |  | 

### _upgradeToAndCall

Perform implementation upgrade with additional setup call.
 Emits an {Upgraded} event.

```solidity
function _upgradeToAndCall(address newImplementation, bytes data, bool forceCall) internal nonpayable
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| newImplementation | address |  | 
| data | bytes |  | 
| forceCall | bool |  | 

### _upgradeToAndCallUUPS

Perform implementation upgrade with security checks for UUPS proxies, and additional setup call.
 Emits an {Upgraded} event.

```solidity
function _upgradeToAndCallUUPS(address newImplementation, bytes data, bool forceCall) internal nonpayable
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| newImplementation | address |  | 
| data | bytes |  | 
| forceCall | bool |  | 

### _getAdmin

Returns the current admin.

```solidity
function _getAdmin() internal view
returns(address)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|

### _setAdmin

Stores a new address in the EIP1967 admin slot.

```solidity
function _setAdmin(address newAdmin) private nonpayable
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| newAdmin | address |  | 

### _changeAdmin

Changes the admin of the proxy.
 Emits an {AdminChanged} event.

```solidity
function _changeAdmin(address newAdmin) internal nonpayable
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| newAdmin | address |  | 

### _getBeacon

Returns the current beacon.

```solidity
function _getBeacon() internal view
returns(address)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|

### _setBeacon

Stores a new beacon in the EIP1967 beacon slot.

```solidity
function _setBeacon(address newBeacon) private nonpayable
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| newBeacon | address |  | 

### _upgradeBeaconToAndCall

Perform beacon upgrade with additional setup call. Note: This upgrades the address of the beacon, it does
 not upgrade the implementation contained in the beacon (see {UpgradeableBeacon-_setImplementation} for that).
 Emits a {BeaconUpgraded} event.

```solidity
function _upgradeBeaconToAndCall(address newBeacon, bytes data, bool forceCall) internal nonpayable
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| newBeacon | address |  | 
| data | bytes |  | 
| forceCall | bool |  | 

### _functionDelegateCall

Same as {xref-Address-functionCall-address-bytes-string-}[`functionCall`],
 but performing a delegate call.
 _Available since v3.4._

```solidity
function _functionDelegateCall(address target, bytes data) private nonpayable
returns(bytes)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| target | address |  | 
| data | bytes |  | 

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
