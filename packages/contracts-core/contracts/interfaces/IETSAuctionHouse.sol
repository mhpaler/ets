// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.6;

/**
 * @title Interface for ETS Auction House
 */
interface IETSAuctionHouse {
    struct Auction {
        // ID for the ERC721 token
        uint256 tokenId;
        // The current highest bid amount
        uint256 amount;
        // The length of time to run the auction for, after the first bid was made
        uint256 duration;
        // The time of the first bid
        uint256 firstBidTime;
        // The minimum price of the first bid
        uint256 reservePrice;
        // The address of the current highest bid
        address payable bidder;
    }

    event AuctionCreated(uint256 indexed auctionId);

    event AuctionReservePriceSet(uint256 reservePrice);
//
//    event AuctionBid(
//        uint256 indexed auctionId,
//        uint256 indexed tokenId,
//        address indexed tokenContract,
//        address sender,
//        uint256 value,
//        bool firstBid,
//        bool extended
//    );
//
//    event AuctionDurationExtended(
//        uint256 indexed auctionId,
//        uint256 indexed tokenId,
//        address indexed tokenContract,
//        uint256 duration
//    );
//
//    event AuctionEnded(
//        uint256 indexed auctionId,
//        uint256 indexed tokenId,
//        address indexed tokenContract,
//        address tokenOwner,
//        address curator,
//        address winner,
//        uint256 amount,
//        uint256 curatorFee,
//        address auctionCurrency
//    );
//
//    event AuctionCanceled(
//        uint256 indexed auctionId,
//        uint256 indexed tokenId,
//        address indexed tokenContract,
//        address tokenOwner
//    );
//
//    function setReservePrice(uint256 _reservePrice) external;
//
    function createAuction(uint256 tokenId) external returns (uint256);
//
//    function createBid(uint256 auctionId, uint256 amount) external payable;
//
//    function endAuction(uint256 auctionId) external;
//
//    function cancelAuction(uint256 auctionId) external;
}