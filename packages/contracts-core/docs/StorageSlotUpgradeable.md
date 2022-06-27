# StorageSlotUpgradeable.sol

View Source: [@openzeppelin/contracts-upgradeable/utils/StorageSlotUpgradeable.sol](https://github.com/ethereum-tag-service/ets/tree/stage/packages/contracts-core@openzeppelin/contracts-upgradeable/utils/StorageSlotUpgradeable.sol)

**StorageSlotUpgradeable**

Library for reading and writing primitive types to specific storage slots.
 Storage slots are often used to avoid storage conflict when dealing with upgradeable contracts.
 This library helps with reading and writing to such slots without the need for inline assembly.
 The functions in this library return Slot structs that contain a `value` member that can be used to read or write.
 Example usage to set ERC1967 implementation slot:
 ```
 contract ERC1967 {
     bytes32 internal constant _IMPLEMENTATION_SLOT = 0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc;
     function _getImplementation() internal view returns (address) {
         return StorageSlot.getAddressSlot(_IMPLEMENTATION_SLOT).value;
     }
     function _setImplementation(address newImplementation) internal {
         require(Address.isContract(newImplementation), "ERC1967: new implementation is not a contract");
         StorageSlot.getAddressSlot(_IMPLEMENTATION_SLOT).value = newImplementation;
     }
 }
 ```
 _Available since v4.1 for `address`, `bool`, `bytes32`, and `uint256`._

## Structs
### AddressSlot

```solidity
struct AddressSlot {
 address value
}
```

### BooleanSlot

```solidity
struct BooleanSlot {
 bool value
}
```

### Bytes32Slot

```solidity
struct Bytes32Slot {
 bytes32 value
}
```

### Uint256Slot

```solidity
struct Uint256Slot {
 uint256 value
}
```

## Functions

- [getAddressSlot](#getaddressslot)
- [getBooleanSlot](#getbooleanslot)
- [getBytes32Slot](#getbytes32slot)
- [getUint256Slot](#getuint256slot)

### getAddressSlot

Returns an `AddressSlot` with member `value` located at `slot`.

```solidity
function getAddressSlot(bytes32 slot) internal pure
returns(r struct StorageSlotUpgradeable.AddressSlot)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| slot | bytes32 |  | 

### getBooleanSlot

Returns an `BooleanSlot` with member `value` located at `slot`.

```solidity
function getBooleanSlot(bytes32 slot) internal pure
returns(r struct StorageSlotUpgradeable.BooleanSlot)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| slot | bytes32 |  | 

### getBytes32Slot

Returns an `Bytes32Slot` with member `value` located at `slot`.

```solidity
function getBytes32Slot(bytes32 slot) internal pure
returns(r struct StorageSlotUpgradeable.Bytes32Slot)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| slot | bytes32 |  | 

### getUint256Slot

Returns an `Uint256Slot` with member `value` located at `slot`.

```solidity
function getUint256Slot(bytes32 slot) internal pure
returns(r struct StorageSlotUpgradeable.Uint256Slot)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| slot | bytes32 |  | 

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
