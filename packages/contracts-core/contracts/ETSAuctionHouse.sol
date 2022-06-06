// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.6;

import { PausableUpgradeable } from '@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol';
import { ReentrancyGuardUpgradeable } from '@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol';
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { SafeMath } from "@openzeppelin/contracts/utils/math/SafeMath.sol";
import { IETSAccessControls } from "./interfaces/IETSAccessControls.sol";
import { IETSAuctionHouse } from "./interfaces/IETSAuctionHouse.sol";
import { IETSToken } from './interfaces/IETSToken.sol';
import { IWETH } from './interfaces/IWETH.sol';

/**
 * @title An open auction house, enabling collectors and curators to run their own auctions
 */
contract ETSAuctionHouse is IETSAuctionHouse, PausableUpgradeable, ReentrancyGuardUpgradeable {

    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    // The ETS ERC721 token contract
    IETSToken public etsToken;
    IETSAccessControls public etsAccessControls;

    /// Public constants
    string public constant NAME = "CTAG Token";
    string public constant VERSION = "0.1.0";

    /// Public variables
    // The address of the WETH/WMATIC contract
    address public weth;

    // The minimum amount of time left in an auction after a new bid is created
    uint256 public timeBuffer;

    // The minimum price accepted in an auction
    uint256 public reservePrice;

    // The minimum percentage difference between the last bid amount and the current bid
    uint8 public minBidIncrementPercentage;

    // / The address of the WETH contract, so that any ETH transferred can be handled as an ERC-20
    address public wethAddress;

    // The duration of a single auction
    uint256 public duration;


    /// @dev Mapping of active auctions
    mapping(uint256 => IETSAuctionHouse.Auction) public auctions;


    /// Modifiers
    modifier tagExists(uint256 tokenId) {
        require(etsToken.tagExists(tokenId), "CTAG doesn't exist");
        _;
    }

    modifier platformOwned(uint256 tokenId) {
        require(etsToken.ownerOf(tokenId) == etsToken.getPlatformAddress(), "CTAG not owned by ETS");
        _;
    }

    modifier auctionExists(uint256 auctionId) {
        require(_exists(auctionId), "Auction doesn't exist");
        _;
    }

    modifier onlyAdmin() {
        require(etsAccessControls.isAdmin(_msgSender()), "Caller must have administrator access");
        _;
    }

    // ============ UUPS INTERFACE ============

    function initialize(
        IETSToken _etsToken,
        IETSAccessControls _etsAccessControls,
        address _weth,
        uint256 _timeBuffer,
        uint256 _reservePrice,
        uint8 _minBidIncrementPercentage,
        uint256 _duration
    ) external initializer {
        __Pausable_init();
        __ReentrancyGuard_init();

       //_pause();
        etsToken = _etsToken;
        etsAccessControls = _etsAccessControls;
        weth = _weth;
        timeBuffer = _timeBuffer; // 5 * 60 = extend 5 minutes after every bid made in last 15 minutes
        reservePrice = _reservePrice; 
        minBidIncrementPercentage = _minBidIncrementPercentage; // 5
        duration = _duration;
    }

    // ============ OWNER/ADMIN INTERFACE ============

    function setReservePrice(uint256 _reservePrice) public onlyAdmin {
        reservePrice = _reservePrice;
        emit AuctionReservePriceSet(_reservePrice);
    }

    // ============ PUBLIC INTERFACE ============

    /**
     * @notice Create an auction.
     * @dev Store the auction details in the auctions mapping and emit an AuctionCreated event.
     */
    function createAuction(uint256 _tokenId) public nonReentrant platformOwned(_tokenId) returns (uint256) {


        // TODO: Require token owned by platform
        // TODO: If the token is reserved, require it to be released first.
        auctions[_tokenId] = Auction({
            tokenId: _tokenId,
            amount: 0,
            // TODO: Have duration configurable by standard vs. premium.
            duration: duration,
            firstBidTime: 0,
            reservePrice: reservePrice,
            bidder: payable(address(0))
        });

        // TODO: Do we even need to do this? Or can it stay held by platform
        // till auction is complete.
        etsToken.transferFrom(etsToken.getPlatformAddress(), address(this), _tokenId);

        emit AuctionCreated(_tokenId);
        return _tokenId;
    }

    /**
     * @notice Create a bid on a token, with a given amount.
     * @dev If provided a valid bid, transfers the provided amount to this contract.
     * If the auction is run in native ETH, the ETH is wrapped so it can be identically to other
     * auction currencies in this contract.
     */
//    function createBid(uint256 auctionId, uint256 amount)
//    external
//    override
//    payable
//    auctionExists(auctionId)
//    nonReentrant
//    {
//        address payable lastBidder = auctions[auctionId].bidder;
//        require(
//            auctions[auctionId].firstBidTime == 0 ||
//            block.timestamp <
//            auctions[auctionId].firstBidTime.add(auctions[auctionId].duration),
//            "Auction expired"
//        );
//        require(
//            amount >= auctions[auctionId].reservePrice,
//                "Must send at least reservePrice"
//        );
//        require(
//            amount >= auctions[auctionId].amount.add(
//                auctions[auctionId].amount.mul(minBidIncrementPercentage).div(100)
//            ),
//            "Must send more than last bid by minBidIncrementPercentage amount"
//        );
//
//        // If this is the first valid bid, we should set the starting time now.
//        // If it's not, then we should refund the last bidder
//        if(auctions[auctionId].firstBidTime == 0) {
//            auctions[auctionId].firstBidTime = block.timestamp;
//        } else if(lastBidder != address(0)) {
//            _handleOutgoingBid(lastBidder, auctions[auctionId].amount, auctions[auctionId].auctionCurrency);
//        }
//
//        _handleIncomingBid(amount, auctions[auctionId].auctionCurrency);
//
//        auctions[auctionId].amount = amount;
//        auctions[auctionId].bidder = msg.sender;
//
//
//        bool extended = false;
//        // at this point we know that the timestamp is less than start + duration (since the auction would be over, otherwise)
//        // we want to know by how much the timestamp is less than start + duration
//        // if the difference is less than the timeBuffer, increase the duration by the timeBuffer
//        if (
//            auctions[auctionId].firstBidTime.add(auctions[auctionId].duration).sub(
//                block.timestamp
//            ) < timeBuffer
//        ) {
//            // Playing code golf for gas optimization:
//            // uint256 expectedEnd = auctions[auctionId].firstBidTime.add(auctions[auctionId].duration);
//            // uint256 timeRemaining = expectedEnd.sub(block.timestamp);
//            // uint256 timeToAdd = timeBuffer.sub(timeRemaining);
//            // uint256 newDuration = auctions[auctionId].duration.add(timeToAdd);
//            uint256 oldDuration = auctions[auctionId].duration;
//            auctions[auctionId].duration =
//                oldDuration.add(timeBuffer.sub(auctions[auctionId].firstBidTime.add(oldDuration).sub(block.timestamp)));
//            extended = true;
//        }
//
//        emit AuctionBid(
//            auctionId,
//            auctions[auctionId].tokenId,
//            msg.sender,
//            amount,
//            lastBidder == address(0), // firstBid boolean
//            extended
//        );
//
//        if (extended) {
//            emit AuctionDurationExtended(
//                auctionId,
//                auctions[auctionId].tokenId,
//                auctions[auctionId].duration
//            );
//        }
//    }
//
//    /**
//     * @notice End an auction, finalizing the bid on Zora if applicable and paying out the respective parties.
//     * @dev If for some reason the auction cannot be finalized (invalid token recipient, for example),
//     * The auction is reset and the NFT is transferred back to the auction creator.
//     */
//    function endAuction(uint256 auctionId) external override auctionExists(auctionId) nonReentrant {
//        require(
//            uint256(auctions[auctionId].firstBidTime) != 0,
//            "Auction hasn't begun"
//        );
//        require(
//            block.timestamp >=
//            auctions[auctionId].firstBidTime.add(auctions[auctionId].duration),
//            "Auction hasn't completed"
//        );
//
//        address currency = auctions[auctionId].auctionCurrency == address(0) ? wethAddress : auctions[auctionId].auctionCurrency;
//        uint256 curatorFee = 0;
//
//        uint256 tokenOwnerProfit = auctions[auctionId].amount;
//        
//        // Otherwise, transfer the token to the winner and pay out the participants below
//        try etsToken.safeTransferFrom(
//            address(this),
//            auctions[auctionId].bidder, 
//            auctions[auctionId].tokenId
//        ) {} catch {
//            _handleOutgoingBid(auctions[auctionId].bidder, auctions[auctionId].amount, auctions[auctionId].auctionCurrency);
//            _cancelAuction(auctionId);
//            return;
//        }
//
//        _handleOutgoingBid(auctions[auctionId].tokenOwner, tokenOwnerProfit, auctions[auctionId].auctionCurrency);
//
//        emit AuctionEnded(
//            auctionId,
//            auctions[auctionId].tokenId,
//            auctions[auctionId].tokenContract,
//            auctions[auctionId].tokenOwner,
//            auctions[auctionId].curator,
//            auctions[auctionId].bidder,
//            tokenOwnerProfit,
//            curatorFee,
//            currency
//        );
//        delete auctions[auctionId];
//    }
//
//    /**
//     * @notice Cancel an auction.
//     * @dev Transfers the NFT back to the auction creator and emits an AuctionCanceled event
//     */
//    function cancelAuction(uint256 auctionId) external override nonReentrant auctionExists(auctionId) {
//        require(
//            auctions[auctionId].tokenOwner == msg.sender || auctions[auctionId].curator == msg.sender,
//            "Can only be called by auction creator or curator"
//        );
//        require(
//            uint256(auctions[auctionId].firstBidTime) == 0,
//            "Can't cancel an auction once it's begun"
//        );
//        _cancelAuction(auctionId);
//    }
//
//    /**
//     * @dev Given an amount and a currency, transfer the currency to this contract.
//     * If the currency is ETH (0x0), attempt to wrap the amount as WETH
//     */
//    function _handleIncomingBid(uint256 amount, address currency) internal {
//        // If this is an ETH bid, ensure they sent enough and convert it to WETH under the hood
//        if(currency == address(0)) {
//            require(msg.value == amount, "Sent ETH Value does not match specified bid amount");
//            IWETH(wethAddress).deposit{value: amount}();
//        } else {
//            // We must check the balance that was actually transferred to the auction,
//            // as some tokens impose a transfer fee and would not actually transfer the
//            // full amount to the market, resulting in potentally locked funds
//            IERC20 token = IERC20(currency);
//            uint256 beforeBalance = token.balanceOf(address(this));
//            token.safeTransferFrom(msg.sender, address(this), amount);
//            uint256 afterBalance = token.balanceOf(address(this));
//            require(beforeBalance.add(amount) == afterBalance, "Token transfer call did not transfer expected amount");
//        }
//    }
//
//    function _handleOutgoingBid(address to, uint256 amount, address currency) internal {
//        // If the auction is in ETH, unwrap it from its underlying WETH and try to send it to the recipient.
//        if(currency == address(0)) {
//            IWETH(wethAddress).withdraw(amount);
//
//            // If the ETH transfer fails (sigh), rewrap the ETH and try send it as WETH.
//            if(!_safeTransferETH(to, amount)) {
//                IWETH(wethAddress).deposit{value: amount}();
//                IERC20(wethAddress).safeTransfer(to, amount);
//            }
//        } else {
//            IERC20(currency).safeTransfer(to, amount);
//        }
//    }
//
//    function _safeTransferETH(address to, uint256 value) internal returns (bool) {
//        (bool success, ) = to.call{value: value}(new bytes(0));
//        return success;
//    }
//
//    function _cancelAuction(uint256 auctionId) internal {
//        address tokenOwner = auctions[auctionId].tokenOwner;
//        IERC721(auctions[auctionId].tokenContract).safeTransferFrom(address(this), tokenOwner, auctions[auctionId].tokenId);
//
//        emit AuctionCanceled(auctionId, auctions[auctionId].tokenId, auctions[auctionId].tokenContract, tokenOwner);
//        delete auctions[auctionId];
//    }
//
//    function _approveAuction(uint256 auctionId, bool approved) internal {
//        auctions[auctionId].approved = approved;
//        emit AuctionApprovalUpdated(auctionId, auctions[auctionId].tokenId, auctions[auctionId].tokenContract, approved);
//    }

    function _exists(uint256 auctionId) internal view returns(bool) {
        return (auctions[auctionId].duration != 0);
    }

    // TODO: consider reverting if the message sender is not WETH
    receive() external payable {}
    fallback() external payable {}
}