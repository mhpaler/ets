# ERC721 token receiver interface (IERC721Receiver.sol)

View Source: [@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol](https://github.com/OpenZeppelin/openzeppelin-contracts/tree/master/contracts/token/ERC721/IERC721Receiver.sol)

**↘ Derived Contracts: [ERC721ReceiverMock](ERC721ReceiverMock.md)**

**IERC721Receiver**

Interface for any contract that wants to support safeTransfers
 from ERC721 asset contracts.

## Functions

- [onERC721Received](#onerc721received)

### onERC721Received

Whenever an {IERC721} `tokenId` token is transferred to this contract via {IERC721-safeTransferFrom}
 by `operator` from `from`, this function is called.
 It must return its Solidity selector to confirm the token transfer.
 If any other value is returned or the interface is not implemented by the recipient, the transfer will be reverted.
 The selector can be obtained in Solidity with `IERC721Receiver.onERC721Received.selector`.

```solidity
function onERC721Received(address operator, address from, uint256 tokenId, bytes data) external nonpayable
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
