// SPDX-License-Identifier: GPL-3.0

// ETSAuctionHouse.sol is a modified version of Nouns NounsAuctionHouse.sol:
// https://github.com/nounsDAO/nouns-monorepo/blob/master/packages/nouns-contracts/contracts/NounsAuctionHouse.sol
// which itself is a modified version of Zora AuctionHouse.sol
//
//    ███████╗████████╗███████╗
//    ██╔════╝╚══██╔══╝██╔════╝
//    █████╗     ██║   ███████╗
//    ██╔══╝     ██║   ╚════██║
//    ███████╗   ██║   ███████║
//    ╚══════╝   ╚═╝   ╚══════╝
//
// The primary modifications are enabling more than one concurrent auction via a protocol controlled
// setting and requiring a bid to start the auction timer.
//
// AuctionHouse.sol source code Copyright Zora licensed under the GPL-3.0 license.
// With modifications by Ethereum Tag Service.

pragma solidity ^0.8.10;

import { PausableUpgradeable } from "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import { ReentrancyGuardUpgradeable } from "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import { UUPSUpgradeable } from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import { IERC20Upgradeable } from "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";
import { SafeERC20Upgradeable } from "@openzeppelin/contracts-upgradeable/token/ERC20/utils/SafeERC20Upgradeable.sol";
import { CountersUpgradeable } from "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";
import { IETSAccessControls } from "./interfaces/IETSAccessControls.sol";
import { IETSAuctionHouse } from "./interfaces/IETSAuctionHouse.sol";
import { IETSToken } from "./interfaces/IETSToken.sol";
import { IWMATIC } from "./interfaces/IWMATIC.sol";

import "hardhat/console.sol";

/**
 * @title ETSAuctionHouse
 * @author Ethereum Tag Service <team@ets.xyz>
 *
 * @notice ETSAuctionHouse contract governs the sale of Ethereum Tag Service composable tags (CTAGs).
 */
contract ETSAuctionHouse is IETSAuctionHouse, PausableUpgradeable, ReentrancyGuardUpgradeable, UUPSUpgradeable {
    using CountersUpgradeable for CountersUpgradeable.Counter;

    IETSToken public etsToken;
    IETSAccessControls public etsAccessControls;

    /// Public constants

    string public constant NAME = "ETS Auction House";
    uint256 public constant MODULO = 100;

    /// Public variables
    uint256 public maxAuctions;

    // Open for bidding
    CountersUpgradeable.Counter activeAuctions;

    // Unique auction id
    CountersUpgradeable.Counter auctionId;

    /// @dev Mapping of active auctions
    mapping(uint256 => IETSAuctionHouse.Auction) public auctions;

    /// @dev The address of the WMATIC contract
    address public wmatic;

    /// @dev The minimum amount of time left in an auction after a new bid is created
    uint256 public timeBuffer;

    /// @dev The minimum price accepted in an auction
    uint256 public reservePrice;

    /// @dev The minimum percentage difference between the last bid amount and the current bid
    uint8 public minBidIncrementPercentage;

    /// @dev The duration of a single auction
    uint256 public duration;

    /// @dev Percentage of auction proceeds allocated to CTAG Creator
    uint256 public creatorPercentage;

    /// @dev Percentage of auction proceeds allocated to CTAG Relayer.
    uint256 public relayerPercentage;

    /// @dev Percentage of auction proceeds allocated to ETS.
    uint256 public platformPercentage;

    /// @dev Map for holding amount accrued to participant address wallets.
    mapping(address => uint256) public accrued;

    /// @dev Map for holding lifetime amount drawn down from accrued by participants.
    mapping(address => uint256) public paid;

    /// Modifiers

    modifier tagExists(uint256 tokenId) {
        require(etsToken.tagExistsById(tokenId), "CTAG does not exist");
        _;
    }

    modifier platformOwned(uint256 tokenId) {
        // Returns "ERC721: owner query for nonexistent token" for non-existent token.
        require(etsToken.ownerOf(tokenId) == etsAccessControls.getPlatformAddress(), "CTAG not owned by ETS");
        _;
    }

    modifier onlyAuctionOracle() {
        require(etsAccessControls.isAuctionOracle(_msgSender()), "Caller not auction oracle");
        _;
    }

    modifier onlyAdmin() {
        require(etsAccessControls.isAdmin(_msgSender()), "Caller must be administrator");
        _;
    }

    modifier onlyPlatform() {
        require(etsAccessControls.getPlatformAddress() == _msgSender(), "Only platform may release CTAG");
        _;
    }

    modifier isAuction(uint256 tokenId) {
        require(_isAuction(tokenId), "Auction doesn't exist");
        _;
    }

    // ============ UUPS INTERFACE ============

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(
        IETSToken _etsToken,
        IETSAccessControls _etsAccessControls,
        address _wmatic,
        uint256 _maxAuctions,
        uint256 _timeBuffer,
        uint256 _reservePrice,
        uint8 _minBidIncrementPercentage,
        uint256 _duration,
        uint256 _relayerPercentage,
        uint256 _platformPercentage
    ) external initializer {
        __Pausable_init();
        __ReentrancyGuard_init();

        _pause();

        etsToken = _etsToken;
        etsAccessControls = _etsAccessControls;
        wmatic = _wmatic;

        activeAuctions.reset();
        auctionId.reset();

        setMaxAuctions(_maxAuctions);
        setMinBidIncrementPercentage(_minBidIncrementPercentage);
        setDuration(_duration);
        setReservePrice(_reservePrice);
        setTimeBuffer(_timeBuffer);
        setProceedPercentages(_platformPercentage, _relayerPercentage);
    }

    // solhint-disable-next-line
    function _authorizeUpgrade(address) internal override onlyAdmin {}

    // ============ OWNER/ADMIN INTERFACE ============

    function pause() public onlyAdmin {
        _pause();
    }

    function unpause() public onlyAdmin {
        _unpause();
    }

    function setMaxAuctions(uint256 _maxAuctions) public onlyAdmin {
        maxAuctions = _maxAuctions;
        emit AuctionsMaxSet(_maxAuctions);
    }

    function setDuration(uint256 _duration) public onlyAdmin {
        duration = _duration;
        emit AuctionDurationSet(_duration);
    }

    function setMinBidIncrementPercentage(uint8 _minBidIncrementPercentage) public onlyAdmin {
        minBidIncrementPercentage = _minBidIncrementPercentage;
        emit AuctionMinBidIncrementPercentageSet(_minBidIncrementPercentage);
    }

    function setReservePrice(uint256 _reservePrice) public onlyAdmin {
        reservePrice = _reservePrice;
        emit AuctionReservePriceSet(_reservePrice);
    }

    function setTimeBuffer(uint256 _timeBuffer) public onlyAdmin {
        timeBuffer = _timeBuffer;
        emit AuctionTimeBufferSet(_timeBuffer);
    }

    function setProceedPercentages(uint256 _platformPercentage, uint256 _relayerPercentage) public onlyAdmin {
        require(_platformPercentage + _relayerPercentage <= 100, "Input must not exceed 100%");
        platformPercentage = _platformPercentage;
        relayerPercentage = _relayerPercentage;
        creatorPercentage = MODULO - platformPercentage - relayerPercentage;

        emit AuctionProceedPercentagesSet(platformPercentage, relayerPercentage, creatorPercentage);
    }

    // ============ PUBLIC INTERFACE ============

    /**
     * @notice Settle the current auction, and release next auction.
     */
    function settleCurrentAndCreateNewAuction(uint256 _tokenId) public nonReentrant whenNotPaused {
        _settleAuction(_tokenId);
        _requestCreateAuction();
    }

    /**
     * @notice Settle the current auction.
     * @dev This function can only be called when the contract is paused.
     */
    function settleAuction(uint256 _tokenId) public whenPaused nonReentrant {
        _settleAuction(_tokenId);
    }

    // Public function to release another auction using the auction Oracle.
    function createNextAuction() public whenNotPaused {
        require(activeAuctions.current() < maxAuctions, "No open auction slots");
        _requestCreateAuction();
    }

    // Capture reponse from next auction oracle.
    function fulfillRequestCreateAuction(uint256 _tokenId) public onlyAuctionOracle {
        // Let's double check the oracle's work.
        // Note: First check returns "ERC721: invalid token ID" for non-existent token.
        require(etsToken.ownerOf(_tokenId) == etsAccessControls.getPlatformAddress(), "CTAG not owned by ETS");
        require(activeAuctions.current() < maxAuctions, "No open auction slots");
        require(!_isAuction(_tokenId), "Auction exists");
        _createAuction(_tokenId);
    }

    function createBid(uint256 _tokenId) public payable nonReentrant whenNotPaused {
        // Retrieve active auction or create new one if _tokenId exists and is platform owned.
        Auction memory auction = _getAuction(_tokenId);

        require(auction.auctionId > 0, "Auction not found");
        if (auction.startTime > 0) {
            require(block.timestamp < auction.endTime, "Auction ended");
        }
        require(msg.value >= reservePrice, "Must send at least reservePrice");
        require(msg.value >= auction.amount + ((auction.amount * minBidIncrementPercentage) / 100), "Bid too low");

        address payable lastBidder = auction.bidder;

        // Refund the last bidder, if applicable
        if (lastBidder != address(0)) {
            _safeTransferETHWithFallback(lastBidder, auction.amount);
        }

        if (auction.startTime == 0) {
            // Start the auction
            uint256 startTime = block.timestamp;
            uint256 endTime = startTime + duration;
            auctions[_tokenId].startTime = startTime;
            auctions[_tokenId].endTime = endTime;
        }

        auctions[_tokenId].amount = msg.value;
        auctions[_tokenId].bidder = payable(msg.sender);

        // Extend the auction if the bid was received within `timeBuffer` of the auction end time
        bool extended = false;
        if (auction.startTime > 0) {
            extended = auction.endTime - block.timestamp < timeBuffer;
            if (extended) {
                auctions[_tokenId].endTime = auction.endTime = block.timestamp + timeBuffer;
                emit AuctionExtended(_tokenId, auction.endTime);
            }
        }

        emit AuctionBid(_tokenId, msg.sender, msg.value, extended);
    }

    /**
     * @notice Function for withdrawing funds from an accrual account. Can be called by the account owner
     * or on behalf of the account. Does nothing when there is nothing due to the account.
     *
     * @param _account Address of account being drawn down and which will receive the funds.
     */
    function drawDown(address payable _account) external nonReentrant {
        uint256 balanceDue = totalDue(_account);
        if (balanceDue > 0 && balanceDue <= address(this).balance) {
            paid[_account] = paid[_account] + balanceDue;

            bool success = _safeTransferETH(_account, balanceDue);
            require(success, "Transfer failed");

            emit AuctionProceedsWithdrawn(_account, balanceDue);
        }
    }

    // ============ INTERNAL FUNCTIONS ============

    function _requestCreateAuction() private {
        // Trigger of chain oracle to pick and release next auction.
        emit RequestCreateAuction();
    }

    function _createAuction(uint256 _tokenId) internal {
        auctionId.increment();
        activeAuctions.increment();
        // Create new auction but don't start it.
        auctions[_tokenId] = Auction({
            auctionId: auctionId.current(),
            amount: 0,
            startTime: 0,
            endTime: 0,
            reservePrice: reservePrice,
            bidder: payable(address(0)),
            auctioneer: etsAccessControls.getPlatformAddress(),
            settled: false
        });

        emit AuctionCreated(_tokenId);
    }

    function _settleAuction(uint256 _tokenId) internal {
        Auction memory auction = _getAuction(_tokenId);
        require(_isAuction(_tokenId), "Auction does not exist");
        require(!(auction.settled), "Auction already settled");
        require(auction.startTime != 0, "Auction has not begun");
        require(block.timestamp >= auction.endTime, "Auction has not ended");

        auctions[_tokenId].settled = true;
        activeAuctions.decrement();
        etsToken.transferFrom(etsAccessControls.getPlatformAddress(), auction.bidder, _tokenId);
        _processAuctionRevenue(_tokenId, auction.amount);
        emit AuctionSettled(_tokenId);
    }

    // @dev Internal function to divide up auction revenue and accrue it to ETS participants.
    function _processAuctionRevenue(uint256 _tokenId, uint256 _amount) private {
        // Distribute proceeds to actors.
        IETSToken.Tag memory ctag = etsToken.getTagById(_tokenId);
        address platform = etsAccessControls.getPlatformAddress();

        uint256 relayerProceeds = (_amount * relayerPercentage) / MODULO;
        uint256 creatorProceeds = (_amount * creatorPercentage) / MODULO;
        uint256 platformProceeds = _amount - (relayerProceeds + creatorProceeds);

        accrued[ctag.relayer] = accrued[ctag.relayer] + relayerProceeds;
        accrued[ctag.creator] = accrued[ctag.creator] + creatorProceeds;
        accrued[platform] = accrued[platform] + platformProceeds;
    }

    function _getAuction(uint256 _tokenId) private view returns (Auction memory auction) {
        return auctions[_tokenId];
    }

    function _safeTransferETHWithFallback(address to, uint256 amount) internal {
        if (!_safeTransferETH(to, amount)) {
            IWMATIC(wmatic).deposit{ value: amount }();
            IERC20Upgradeable(wmatic).transfer(to, amount);
        }
    }

    function _safeTransferETH(address to, uint256 value) internal returns (bool) {
        (bool success, ) = to.call{ value: value, gas: 30_000 }(new bytes(0));
        return success;
    }

    function _isAuction(uint256 _tokenId) internal view returns (bool) {
        return (auctions[_tokenId].auctionId != 0);
    }

    // ============ PUBLIC VIEW FUNCTIONS ============

    function auctionExists(uint256 _tokenId) public view returns (bool) {
        return _isAuction(_tokenId);
    }

    function auctionEnded(uint256 _tokenId) public view returns (bool) {
        return (auctions[_tokenId].endTime > block.timestamp);
    }

    function auctionSettled(uint256 _tokenId) public view returns (bool) {
        return (_isAuction(_tokenId) && auctions[_tokenId].settled);
    }

    function getAuction(uint256 _tokenId) public view returns (Auction memory) {
        return auctions[_tokenId];
    }

    function getActiveCount() public view returns (uint256) {
        return activeAuctions.current();
    }

    function getTotalCount() public view returns (uint256) {
        return auctionId.current();
    }

    function getBalance() public view returns (uint) {
        return address(this).balance;
    }

    function totalDue(address _account) public view returns (uint256 _due) {
        return accrued[_account] - paid[_account];
    }

    /* solhint-disable */
    receive() external payable {}

    fallback() external payable {}
    /* solhint-enable */
}
