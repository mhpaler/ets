# Interface for ETS Auction House (IETSAuctionHouse.sol)

View Source: [contracts/interfaces/IETSAuctionHouse.sol](https://github.com/ethereum-tag-service/ets/tree/stage/packages/contracts-corecontracts/interfaces/IETSAuctionHouse.sol)

**↘ Derived Contracts: [ETSAuctionHouse](ETSAuctionHouse.md)**

**IETSAuctionHouse**

## Structs
### Auction

```solidity
struct Auction {
 uint256 amount,
 uint256 startTime,
 uint256 endTime,
 uint256 reservePrice,
 address payable bidder
}
```

## Events

```solidity
event AuctionBid(uint256 indexed tokenId, address  sender, uint256  value, bool  extended);
event AuctionCreated(uint256 indexed tokenId);
event AuctionExtended(uint256 indexed tokenId, uint256  endTime);
event AuctionSettled(uint256 indexed tokenId, address  winner, uint256  totalProceeds, uint256  publisherProceeds, uint256  creatorProceeds);
event AuctionReservePriceSet(uint256  reservePrice);
event AuctionTimeBufferSet(uint256  timeBuffer);
event AuctionProceedPercentagesSet(uint256  platformPercentage, uint256  publisherPercentage, uint256  creatorPercentage);
```

## Functions

- [pause](#pause)
- [unpause](#unpause)
- [setReservePrice](#setreserveprice)
- [setTimeBuffer](#settimebuffer)
- [setProceedPercentages](#setproceedpercentages)
- [createBid](#createbid)
- [getAuction](#getauction)
- [settleAuction](#settleauction)

### pause

```solidity
function pause() external nonpayable
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|

### unpause

```solidity
function unpause() external nonpayable
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|

### setReservePrice

```solidity
function setReservePrice(uint256 _reservePrice) external nonpayable
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| _reservePrice | uint256 |  | 

### setTimeBuffer

```solidity
function setTimeBuffer(uint256 timeBuffer) external nonpayable
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| timeBuffer | uint256 |  | 

### setProceedPercentages

```solidity
function setProceedPercentages(uint256 _platformPercentage, uint256 _publisherPercentage) external nonpayable
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| _platformPercentage | uint256 |  | 
| _publisherPercentage | uint256 |  | 

### createBid

```solidity
function createBid(uint256 auctionId) external payable
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| auctionId | uint256 |  | 

### getAuction

```solidity
function getAuction(uint256 _tokenId) external nonpayable
returns(auction struct IETSAuctionHouse.Auction)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| _tokenId | uint256 |  | 

### settleAuction

```solidity
function settleAuction(uint256 _tokenId) external nonpayable
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| _tokenId | uint256 |  | 

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
