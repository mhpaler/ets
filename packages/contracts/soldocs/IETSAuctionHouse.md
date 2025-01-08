# IETSAuctionHouse

## Functions

### pause

```solidity
function pause() external
```

### unpause

```solidity
function unpause() external
```

### setReservePrice

```solidity
function setReservePrice(uint256 _reservePrice) external
```

### setTimeBuffer

```solidity
function setTimeBuffer(uint256 timeBuffer) external
```

### setProceedPercentages

```solidity
function setProceedPercentages(uint256 _platformPercentage, uint256 _relayerPercentage) external
```

### createBid

```solidity
function createBid(uint256 auctionId) external payable
```

### settleCurrentAndCreateNewAuction

```solidity
function settleCurrentAndCreateNewAuction(uint256 _tokenId) external
```

### settleAuction

```solidity
function settleAuction(uint256 _tokenId) external
```

### createNextAuction

```solidity
function createNextAuction() external
```

### fulfillRequestCreateAuction

```solidity
function fulfillRequestCreateAuction(uint256 _tokenId) external
```

### auctionExists

```solidity
function auctionExists(uint256 _tokenId) external returns (bool)
```

### auctionEnded

```solidity
function auctionEnded(uint256 _tokenId) external returns (bool)
```

### auctionSettled

```solidity
function auctionSettled(uint256 _tokenId) external returns (bool)
```

### getActiveCount

```solidity
function getActiveCount() external returns (uint256)
```

### getTotalCount

```solidity
function getTotalCount() external returns (uint256)
```

### getAuction

```solidity
function getAuction(uint256 _tokenId) external returns (struct IETSAuctionHouse.Auction auction)
```

### getBalance

```solidity
function getBalance() external returns (uint256)
```

### totalDue

```solidity
function totalDue(address _account) external returns (uint256 _due)
```

### drawDown

```solidity
function drawDown(address payable _account) external
```

## Events

### RequestCreateAuction

```solidity
event RequestCreateAuction()
```

### AuctionBid

```solidity
event AuctionBid(uint256 auctionId, address sender, uint256 value, bool extended)
```

### AuctionCreated

```solidity
event AuctionCreated(uint256 auctionId, uint256 tokenId, uint256 tokenAuctionNumber)
```

### AuctionExtended

```solidity
event AuctionExtended(uint256 auctionId, uint256 endTime)
```

### AuctionSettled

```solidity
event AuctionSettled(uint256 auctionId)
```

### AuctionsMaxSet

```solidity
event AuctionsMaxSet(uint256 maxAuctions)
```

### AuctionDurationSet

```solidity
event AuctionDurationSet(uint256 duration)
```

### AuctionMinBidIncrementPercentageSet

```solidity
event AuctionMinBidIncrementPercentageSet(uint8 minBidIncrementPercentagePrice)
```

### AuctionReservePriceSet

```solidity
event AuctionReservePriceSet(uint256 reservePrice)
```

### AuctionTimeBufferSet

```solidity
event AuctionTimeBufferSet(uint256 timeBuffer)
```

### AuctionProceedPercentagesSet

```solidity
event AuctionProceedPercentagesSet(uint256 platformPercentage, uint256 relayerPercentage, uint256 creatorPercentage)
```

### AuctionProceedsWithdrawn

```solidity
event AuctionProceedsWithdrawn(address who, uint256 amount)
```

