# UUPSUpgradeable.sol

View Source: [@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol](https://github.com/ethereum-tag-service/ets/tree/stage/packages/contracts-core@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol)

**↗ Extends: [Initializable](Initializable.md), [IERC1822ProxiableUpgradeable](IERC1822ProxiableUpgradeable.md), [ERC1967UpgradeUpgradeable](ERC1967UpgradeUpgradeable.md)**
**↘ Derived Contracts: [ETSAccessControls](ETSAccessControls.md), [ETSAuctionHouse](ETSAuctionHouse.md), [ETSToken](ETSToken.md)**

**UUPSUpgradeable**

An upgradeability mechanism designed for UUPS proxies. The functions included here can perform an upgrade of an
 {ERC1967Proxy}, when this contract is set as the implementation behind such a proxy.
 A security mechanism ensures that an upgrade does not turn off upgradeability accidentally, although this risk is
 reinstated if the upgrade retains upgradeability but removes the security mechanism, e.g. by replacing
 `UUPSUpgradeable` with a custom implementation of upgrades.
 The {_authorizeUpgrade} function must be overridden to include access restriction to the upgrade mechanism.
 _Available since v4.1._

## Contract Members
**Constants & Variables**

```solidity
address private __self;
uint256[50] private __gap;

```

## Modifiers

- [onlyProxy](#onlyproxy)
- [notDelegated](#notdelegated)

### onlyProxy

Check that the execution is being performed through a delegatecall call and that the execution context is
 a proxy contract with an implementation (as defined in ERC1967) pointing to self. This should only be the case
 for UUPS and transparent proxies that are using the current contract as their implementation. Execution of a
 function through ERC1167 minimal proxies (clones) would not normally pass this test, but is not guaranteed to
 fail.

```solidity
modifier onlyProxy() internal
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|

### notDelegated

Check that the execution is not being performed through a delegate call. This allows a function to be
 callable on the implementing contract but not through proxies.

```solidity
modifier notDelegated() internal
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|

## Functions

- [__UUPSUpgradeable_init](#__uupsupgradeable_init)
- [__UUPSUpgradeable_init_unchained](#__uupsupgradeable_init_unchained)
- [proxiableUUID](#proxiableuuid)
- [upgradeTo](#upgradeto)
- [upgradeToAndCall](#upgradetoandcall)
- [_authorizeUpgrade](#_authorizeupgrade)

### __UUPSUpgradeable_init

```solidity
function __UUPSUpgradeable_init() internal nonpayable onlyInitializing 
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|

### __UUPSUpgradeable_init_unchained

```solidity
function __UUPSUpgradeable_init_unchained() internal nonpayable onlyInitializing 
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|

### proxiableUUID

Implementation of the ERC1822 {proxiableUUID} function. This returns the storage slot used by the
 implementation. It is used to validate that the this implementation remains valid after an upgrade.
 IMPORTANT: A proxy pointing at a proxiable contract should not be considered proxiable itself, because this risks
 bricking a proxy that upgrades to it, by delegating to itself until out of gas. Thus it is critical that this
 function revert if invoked through a proxy. This is guaranteed by the `notDelegated` modifier.

```solidity
function proxiableUUID() external view notDelegated 
returns(bytes32)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|

### upgradeTo

Upgrade the implementation of the proxy to `newImplementation`.
 Calls {_authorizeUpgrade}.
 Emits an {Upgraded} event.

```solidity
function upgradeTo(address newImplementation) external nonpayable onlyProxy 
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| newImplementation | address |  | 

### upgradeToAndCall

Upgrade the implementation of the proxy to `newImplementation`, and subsequently execute the function call
 encoded in `data`.
 Calls {_authorizeUpgrade}.
 Emits an {Upgraded} event.

```solidity
function upgradeToAndCall(address newImplementation, bytes data) external payable onlyProxy 
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| newImplementation | address |  | 
| data | bytes |  | 

### _authorizeUpgrade

Function that should revert when `msg.sender` is not authorized to upgrade the contract. Called by
 {upgradeTo} and {upgradeToAndCall}.
 Normally, this function will use an xref:access.adoc[access control] modifier such as {Ownable-onlyOwner}.
 ```solidity
 function _authorizeUpgrade(address) internal override onlyOwner {}
 ```

```solidity
function _authorizeUpgrade(address newImplementation) internal nonpayable
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| newImplementation | address |  | 

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
