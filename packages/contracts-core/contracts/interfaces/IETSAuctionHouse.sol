// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.6 .0;

/**
 * @title Interface for ETS Auction House
 */
interface IETSAuctionHouse {
    struct Auction {
        // The current highest bid amount
        uint256 amount;
        // The time that the auction started
        uint256 startTime;
        // The time that the auction is scheduled to end
        uint256 endTime;
        // The minimum price of the first bid
        uint256 reservePrice;
        // The address of the current highest bid
        address payable bidder;
    }

    event AuctionBid(uint256 indexed tokenId, address sender, uint256 value, bool extended);

    event AuctionCreated(uint256 indexed tokenId);

    event AuctionExtended(uint256 indexed tokenId, uint256 endTime);

    event AuctionSettled(
        uint256 indexed tokenId,
        address winner,
        uint256 totalProceeds,
        uint256 publisherProceeds,
        uint256 creatorProceeds
    );

    event AuctionReservePriceSet(uint256 reservePrice);

    event AuctionTimeBufferSet(uint256 timeBuffer);

    event AuctionProceedPercentagesSet(
        uint256 platformPercentage,
        uint256 publisherPercentage,
        uint256 creatorPercentage
    );

    function pause() external;

    function unpause() external;

    function setReservePrice(uint256 _reservePrice) external;

    function setTimeBuffer(uint256 timeBuffer) external;

    function setProceedPercentages(uint256 _platformPercentage, uint256 _publisherPercentage) external;

    function createBid(uint256 auctionId) external payable;

    function getAuction(uint256 _tokenId) external returns (Auction memory auction);

    function settleAuction(uint256 _tokenId) external;
}
