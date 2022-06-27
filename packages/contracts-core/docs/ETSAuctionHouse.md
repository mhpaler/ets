# ETSAuctionHouse.sol

View Source: [contracts/ETSAuctionHouse.sol](https://github.com/ethereum-tag-service/ets/tree/stage/packages/contracts-corecontracts/ETSAuctionHouse.sol)

**↗ Extends: [IETSAuctionHouse](IETSAuctionHouse.md), [PausableUpgradeable](PausableUpgradeable.md), [ReentrancyGuardUpgradeable](ReentrancyGuardUpgradeable.md), [UUPSUpgradeable](UUPSUpgradeable.md)**

**ETSAuctionHouse**

## Contract Members
**Constants & Variables**

```solidity
contract IETSToken public etsToken;
contract IETSAccessControls public etsAccessControls;
string public constant NAME;
string public constant VERSION;
uint256 public constant modulo;
address public wmatic;
uint256 public timeBuffer;
uint256 public reservePrice;
uint8 public minBidIncrementPercentage;
uint256 public duration;
uint256 public creatorPercentage;
uint256 public publisherPercentage;
uint256 public platformPercentage;
mapping(uint256 => struct IETSAuctionHouse.Auction) public auctions;

```

## Modifiers

- [tagExists](#tagexists)
- [platformOwned](#platformowned)
- [auctionExists](#auctionexists)
- [onlyAdmin](#onlyadmin)

### tagExists

```solidity
modifier tagExists(uint256 tokenId) internal
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| tokenId | uint256 |  | 

### platformOwned

```solidity
modifier platformOwned(uint256 tokenId) internal
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| tokenId | uint256 |  | 

### auctionExists

```solidity
modifier auctionExists(uint256 tokenId) internal
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| tokenId | uint256 |  | 

### onlyAdmin

```solidity
modifier onlyAdmin() internal
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|

## Functions

- [initialize](#initialize)
- [_authorizeUpgrade](#_authorizeupgrade)
- [pause](#pause)
- [unpause](#unpause)
- [setReservePrice](#setreserveprice)
- [setTimeBuffer](#settimebuffer)
- [setProceedPercentages](#setproceedpercentages)
- [createBid](#createbid)
- [settleAuction](#settleauction)
- [_getAuction](#_getauction)
- [_createAuction](#_createauction)
- [_safeTransferETHWithFallback](#_safetransferethwithfallback)
- [_safeTransferETH](#_safetransfereth)
- [_exists](#_exists)
- [auctionActive](#auctionactive)
- [getAuction](#getauction)
- [version](#version)
- [constructor](#constructor)
- [constructor](#constructor)

### initialize

```solidity
function initialize(IETSToken _etsToken, IETSAccessControls _etsAccessControls, address _wmatic, uint256 _timeBuffer, uint256 _reservePrice, uint8 _minBidIncrementPercentage, uint256 _duration, uint256 _publisherPercentage, uint256 _creatorPercentage, uint256 _platformPercentage) external nonpayable initializer 
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| _etsToken | IETSToken |  | 
| _etsAccessControls | IETSAccessControls |  | 
| _wmatic | address |  | 
| _timeBuffer | uint256 |  | 
| _reservePrice | uint256 |  | 
| _minBidIncrementPercentage | uint8 |  | 
| _duration | uint256 |  | 
| _publisherPercentage | uint256 |  | 
| _creatorPercentage | uint256 |  | 
| _platformPercentage | uint256 |  | 

### _authorizeUpgrade

```solidity
function _authorizeUpgrade(address ) internal nonpayable onlyAdmin 
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
|  | address |  | 

### pause

```solidity
function pause() public nonpayable onlyAdmin 
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|

### unpause

```solidity
function unpause() public nonpayable onlyAdmin 
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|

### setReservePrice

```solidity
function setReservePrice(uint256 _reservePrice) public nonpayable onlyAdmin 
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| _reservePrice | uint256 |  | 

### setTimeBuffer

```solidity
function setTimeBuffer(uint256 _timeBuffer) public nonpayable onlyAdmin 
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| _timeBuffer | uint256 |  | 

### setProceedPercentages

```solidity
function setProceedPercentages(uint256 _platformPercentage, uint256 _publisherPercentage) public nonpayable onlyAdmin 
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| _platformPercentage | uint256 |  | 
| _publisherPercentage | uint256 |  | 

### createBid

```solidity
function createBid(uint256 _tokenId) public payable nonReentrant whenNotPaused platformOwned 
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| _tokenId | uint256 |  | 

### settleAuction

```solidity
function settleAuction(uint256 _tokenId) public nonpayable nonReentrant auctionExists 
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| _tokenId | uint256 |  | 

### _getAuction

```solidity
function _getAuction(uint256 _tokenId) private nonpayable
returns(auction struct IETSAuctionHouse.Auction)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| _tokenId | uint256 |  | 

### _createAuction

```solidity
function _createAuction(uint256 _tokenId) private nonpayable
returns(auction struct IETSAuctionHouse.Auction)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| _tokenId | uint256 |  | 

### _safeTransferETHWithFallback

```solidity
function _safeTransferETHWithFallback(address to, uint256 amount) internal nonpayable
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| to | address |  | 
| amount | uint256 |  | 

### _safeTransferETH

```solidity
function _safeTransferETH(address to, uint256 value) internal nonpayable
returns(bool)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| to | address |  | 
| value | uint256 |  | 

### _exists

```solidity
function _exists(uint256 _tokenId) internal view
returns(bool)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| _tokenId | uint256 |  | 

### auctionActive

```solidity
function auctionActive(uint256 _tokenId) public view
returns(bool)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| _tokenId | uint256 |  | 

### getAuction

```solidity
function getAuction(uint256 _tokenId) public view
returns(struct IETSAuctionHouse.Auction)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| _tokenId | uint256 |  | 

### version

```solidity
function version() external pure
returns(string)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|

### constructor

```solidity
constructor() external payable
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|

### constructor

```solidity
constructor() external payable
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|

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
