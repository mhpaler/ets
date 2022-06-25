# ERC721ReceiverMock.sol

View Source: [contracts/mocks/ERC721ReceiverMock.sol](https://github.com/ethereum-tag-service/ets/tree/stage/packages/contracts-corecontracts/mocks/ERC721ReceiverMock.sol)

**↗ Extends: [IERC721Receiver](IERC721Receiver.md)**

**ERC721ReceiverMock**

## **Enums**
### Error

```solidity
enum Error {
 None,
 RevertWithMessage,
 RevertWithoutMessage,
 Panic
}
```

## Contract Members
**Constants & Variables**

```solidity
bytes4 private _retval;
enum ERC721ReceiverMock.Error private _error;

```

## Events

```solidity
event Received(address  operator, address  from, uint256  tokenId, bytes  data, uint256  gas);
```

## Functions

- [constructor](#constructor)
- [onERC721Received](#onerc721received)

### constructor

```solidity
constructor(bytes4 retval, enum ERC721ReceiverMock.Error error) public nonpayable
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| retval | bytes4 |  | 
| error | enum ERC721ReceiverMock.Error |  | 

### onERC721Received

```solidity
function onERC721Received(address operator, address from, uint256 tokenId, bytes data) public nonpayable
returns(bytes4)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| operator | address |  | 
| from | address |  | 
| tokenId | uint256 |  | 
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
