// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./interfaces/IETS.sol";
import "./interfaces/IETSAccessControls.sol";
import "./interfaces/IETSLifeCycleControls.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/math/SafeMathUpgradeable.sol";
import "@openzeppelin/contracts/interfaces/IERC165.sol";

import "hardhat/console.sol";

/// @title ETS CTAG Token lifecycle controls
/// @author Ethereum Tag Service <security@ets.xyz>
/// @dev Maintains a mapping of ethereum addresses and roles they have within the protocol
contract ETSLifeCycleControls is IETSLifeCycleControls, Initializable, UUPSUpgradeable {
    using SafeMathUpgradeable for uint256;


    IETS public ets;
    IETSAccessControls public accessControls;


    /// @dev Upgrade version.
    string public constant VERSION = "0.1.0";
    /// @dev Term length in seconds that a CTAG is owned before it needs to be renewed.
    uint256 public ownershipTermLength;


    /// @dev Last time a CTAG was transfered.
    mapping(uint256 => uint256) public tokenIdToLastRenewed;


    modifier onlyAdmin() {
        require(accessControls.isAdmin(msg.sender), "Caller must have administrator access");
        _;
    }

    modifier tagExists(uint256 tokenId) {
        console.log("tagExists", ets.tagExists(tokenId));
        require(ets.tagExists(tokenId), "CTAG: Token not found");
        _;
    }


    function initialize(IETSAccessControls _accessControls) public initializer {
        __UUPSUpgradeable_init();
        accessControls = _accessControls;
        ownershipTermLength = 730 days;
    }

    function _authorizeUpgrade(address) internal override onlyAdmin {}

    // ============ OWNER INTERFACE ============

    function setOwnershipTermLength(uint256 _ownershipTermLength) public onlyAdmin {
        uint256 prevOwnershipTermLength = ownershipTermLength;
        ownershipTermLength = _ownershipTermLength;
        emit OwnershipTermLengthSet(prevOwnershipTermLength, _ownershipTermLength);
    }

    function setETS(IETS _ets) public onlyAdmin {
        require(address(_ets) != address(0), "setETS: Address cannot be zero");
        IETS prevETS = ets;
        ets = _ets;
        emit EtsSet(prevETS, _ets);
    }

    // ============ PUBLIC INTERFACE ============

    function renewTag(uint256 _tokenId) public tagExists(_tokenId) {
        //require(ets.tagExists(_tokenId), "renewTag: Invalid token ID");
        require(msg.sender == ets.ownerOf(_tokenId), "renewTag: Not owner");
        tokenIdToLastRenewed[_tokenId] = block.timestamp;
        emit TagRenewed(_tokenId, msg.sender);
    }

    function recycleTag(uint256 _tokenId) public tagExists(_tokenId) {
        // require(ets.tagExists(_tokenId), "recycleTag: Invalid token ID");
        uint256 lastRenewed = tokenIdToLastRenewed[_tokenId];
        require(
            lastRenewed.add(ownershipTermLength) < block.timestamp,
            "ETS: CTAG not eligible for recycling"
        );
        require(ets.ownerOf(_tokenId) != ets.getPlatformAddress(), "ETS: CTAG already owned by the platform");

        // If tag ownership is expired, anyone can transfer back to platform for resale.
        ets.safeTransferFrom(ets.ownerOf(_tokenId), ets.getPlatformAddress(), _tokenId);
        emit TagRecycled(_tokenId, msg.sender);
    }

    function setLastRenewed(uint256 _tokenId) public {
        // TODO: Restrict this. Msg.sender should equal tag owner?
        tokenIdToLastRenewed[_tokenId] = block.timestamp;
    }
    
    // ============ PUBLIC VIEW FUNCTIONS ============

    function getLastRenewed(uint256 _tokenId) public view returns (uint256) {
        return tokenIdToLastRenewed[_tokenId];
    }

    function version() public pure returns (string memory) {
        return VERSION;
    }
}
