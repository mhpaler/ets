// SPDX-License-Identifier: GPL-3.0

/**
 * @title IETSAuctionHouse
 * @author Ethereum Tag Service <team@ets.xyz>
 *
 *  ███████╗████████╗███████╗
 *  ██╔════╝╚══██╔══╝██╔════╝
 *  █████╗     ██║   ███████╗
 *  ██╔══╝     ██║   ╚════██║
 *  ███████╗   ██║   ███████║`
 *  ╚══════╝   ╚═╝   ╚══════╝
 *
 * @notice This is the standard interface for the ETSAuctionHouse.sol contract.
 * Includes both public and administration functions.
 */

pragma solidity ^0.8.6;

interface IETSAuctionHouse {
    struct Auction {
        // Incremented auction number
        uint256 auctionId;
        // Id of token being auctioned.
        uint256 tokenId;
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
        // Address of the auctioneer. Defaults to ETS.
        address payable auctioneer;
        // Whether or not the auction has been settled
        bool settled;
    }

    event RequestCreateAuction();

    event AuctionBid(uint256 indexed auctionId, address sender, uint256 value, bool extended);

    event AuctionCreated(uint256 indexed auctionId, uint256 indexed tokenId, uint256 tokenAuctionNumber);

    event AuctionExtended(uint256 indexed auctionId, uint256 endTime);

    event AuctionSettled(uint256 indexed auctionId);

    event AuctionsMaxSet(uint256 maxAuctions);

    event AuctionDurationSet(uint256 duration);

    event AuctionMinBidIncrementPercentageSet(uint8 minBidIncrementPercentagePrice);

    event AuctionReservePriceSet(uint256 reservePrice);

    event AuctionTimeBufferSet(uint256 timeBuffer);

    event AuctionProceedPercentagesSet(
        uint256 platformPercentage,
        uint256 relayerPercentage,
        uint256 creatorPercentage
    );

    event AuctionProceedsWithdrawn(address indexed who, uint256 amount);

    function pause() external;

    function unpause() external;

    function setReservePrice(uint256 _reservePrice) external;

    function setTimeBuffer(uint256 timeBuffer) external;

    function setProceedPercentages(uint256 _platformPercentage, uint256 _relayerPercentage) external;

    function createBid(uint256 auctionId) external payable;

    function settleCurrentAndCreateNewAuction(uint256 _tokenId) external;

    function settleAuction(uint256 _tokenId) external;

    function createNextAuction() external;

    function fulfillRequestCreateAuction(uint256 _tokenId) external;

    function auctionExists(uint256 _tokenId) external returns (bool);

    function auctionEnded(uint256 _tokenId) external returns (bool);

    function auctionSettled(uint256 _tokenId) external returns (bool);

    function getActiveCount() external returns (uint256);

    function getTotalCount() external returns (uint256);

    function getAuction(uint256 _tokenId) external returns (Auction memory auction);

    function getBalance() external returns (uint);

    function totalDue(address _account) external returns (uint256 _due);

    function drawDown(address payable _account) external;
}
