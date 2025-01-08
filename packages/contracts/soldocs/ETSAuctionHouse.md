# ETSAuctionHouse

ETSAuctionHouse contract governs the sale of Ethereum Tag Service composable tags (CTAGs).

## Functions

### constructor

```solidity
constructor() public
```

### initialize

```solidity
function initialize(contract IETSToken _etsToken, contract IETSAccessControls _etsAccessControls, address _wmatic, uint256 _maxAuctions, uint256 _timeBuffer, uint256 _reservePrice, uint8 _minBidIncrementPercentage, uint256 _duration, uint256 _relayerPercentage, uint256 _platformPercentage) external
```

### _authorizeUpgrade

```solidity
function _authorizeUpgrade(address) internal
```

### pause

```solidity
function pause() public
```

### unpause

```solidity
function unpause() public
```

### setMaxAuctions

```solidity
function setMaxAuctions(uint256 _maxAuctions) public
```

### setDuration

```solidity
function setDuration(uint256 _duration) public
```

### setMinBidIncrementPercentage

```solidity
function setMinBidIncrementPercentage(uint8 _minBidIncrementPercentage) public
```

### setReservePrice

```solidity
function setReservePrice(uint256 _reservePrice) public
```

### setTimeBuffer

```solidity
function setTimeBuffer(uint256 _timeBuffer) public
```

### setProceedPercentages

```solidity
function setProceedPercentages(uint256 _platformPercentage, uint256 _relayerPercentage) public
```

### settleCurrentAndCreateNewAuction

```solidity
function settleCurrentAndCreateNewAuction(uint256 _auctionId) public
```

Settle auction, and release next auction.

### settleAuction

```solidity
function settleAuction(uint256 _auctionId) public
```

Settle the auction.

_This function can only be called when the contract is paused._

### createNextAuction

```solidity
function createNextAuction() public
```

### fulfillRequestCreateAuction

```solidity
function fulfillRequestCreateAuction(uint256 _tokenId) public
```

### createBid

```solidity
function createBid(uint256 _auctionId) public payable
```

### drawDown

```solidity
function drawDown(address payable _account) external
```

Function for withdrawing funds from an accrual account. Can be called by the account owner
or on behalf of the account. Does nothing when there is nothing due to the account.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _account | address payable | Address of account being drawn down and which will receive the funds. |

### _createAuction

```solidity
function _createAuction(uint256 _tokenId) internal
```

### _settleAuction

```solidity
function _settleAuction(uint256 _auctionId) internal
```

### _getAuction

```solidity
function _getAuction(uint256 _auctionId) internal view returns (struct IETSAuctionHouse.Auction)
```

_Retrieves an auction given an auction ID._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _auctionId | uint256 | The ID of auction. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | struct IETSAuctionHouse.Auction | Auction object. Returns an empty object if no auction exists         so must perform additional checks downstream. |

### _safeTransferETHWithFallback

```solidity
function _safeTransferETHWithFallback(address to, uint256 amount) internal
```

### _safeTransferETH

```solidity
function _safeTransferETH(address to, uint256 value) internal returns (bool)
```

### _auctionExists

```solidity
function _auctionExists(uint256 _auctionId) internal view returns (bool)
```

### auctionExists

```solidity
function auctionExists(uint256 _auctionId) public view returns (bool)
```

### auctionExistsForTokenId

```solidity
function auctionExistsForTokenId(uint256 _tokenId) public view returns (bool)
```

### auctionEnded

```solidity
function auctionEnded(uint256 _auctionId) public view returns (bool)
```

### auctionSettled

```solidity
function auctionSettled(uint256 _auctionId) public view returns (bool)
```

### getAuction

```solidity
function getAuction(uint256 _auctionId) public view returns (struct IETSAuctionHouse.Auction)
```

### getAuctionForTokenId

```solidity
function getAuctionForTokenId(uint256 _tokenId) public view returns (struct IETSAuctionHouse.Auction)
```

### getAuctionCountForTokenId

```solidity
function getAuctionCountForTokenId(uint256 _tokenId) public view returns (uint256)
```

### getActiveCount

```solidity
function getActiveCount() public view returns (uint256)
```

### getTotalCount

```solidity
function getTotalCount() public view returns (uint256)
```

### getBalance

```solidity
function getBalance() public view returns (uint256)
```

### totalDue

```solidity
function totalDue(address _account) public view returns (uint256 _due)
```

### receive

```solidity
receive() external payable
```

### fallback

```solidity
fallback() external payable
```

