# ERC-721 Non-Fungible Token Standard, optional metadata extension (IERC721Metadata.sol)

View Source: [@openzeppelin/contracts/token/ERC721/extensions/IERC721Metadata.sol](https://github.com/OpenZeppelin/openzeppelin-contracts/tree/master/contracts/token/ERC721/extensions/IERC721Metadata.sol)

**↗ Extends: [IERC721](IERC721.md)**
**↘ Derived Contracts: [ERC721](ERC721.md)**

**IERC721Metadata**

See https://eips.ethereum.org/EIPS/eip-721

## Functions

- [name](#name)
- [symbol](#symbol)
- [tokenURI](#tokenuri)

### name

Returns the token collection name.

```solidity
function name() external view
returns(string)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|

### symbol

Returns the token collection symbol.

```solidity
function symbol() external view
returns(string)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|

### tokenURI

Returns the Uniform Resource Identifier (URI) for `tokenId` token.

```solidity
function tokenURI(uint256 tokenId) external view
returns(string)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| tokenId | uint256 |  | 

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
