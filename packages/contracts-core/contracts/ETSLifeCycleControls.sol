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
/// @dev System for maintaining CTAG owernship term length.
/// Sets up a ownership term that must be renewed by CTAG owner
/// every two years. If not renewed, anyone may "recycle" the CTAG
/// thus transferring it back to ETS platform for re-auction. 
contract ETSLifeCycleControls is IETSLifeCycleControls, Initializable, UUPSUpgradeable {
    using SafeMathUpgradeable for uint256;


    IETS public ets;
    IETSAccessControls public accessControls;


    /// @dev Upgrade version.
    string public constant VERSION = "0.1.0";
    /// @dev CTAG ownership term length in seconds.
    uint256 public ownershipTermLength;


    /// @dev Mapping of tokenId to last renewal. 
    mapping(uint256 => uint256) public tokenIdToLastRenewed;


    modifier onlyAdmin() {
        require(accessControls.isAdmin(msg.sender), "Caller must have administrator access");
        _;
    }

    modifier tagExists(uint256 tokenId) {
        require(ets.tagExists(tokenId), "CTAG renew/recycle: Token not found");
        _;
    }

    // ============ UUPS INTERFACE ============

    function initialize(IETSAccessControls _accessControls) public initializer {
        __UUPSUpgradeable_init();
        accessControls = _accessControls;
        ownershipTermLength = 730 days;
    }

    function _authorizeUpgrade(address) internal override onlyAdmin {}

    // ============ OWNER INTERFACE ============

    function setETS(IETS _ets) public onlyAdmin {
        require(address(_ets) != address(0), "setETS: Address cannot be zero");
        IETS prevETS = ets;
        ets = _ets;
        emit EtsSet(prevETS, _ets);
    }

    function setOwnershipTermLength(uint256 _ownershipTermLength) public onlyAdmin {
        uint256 prevOwnershipTermLength = ownershipTermLength;
        ownershipTermLength = _ownershipTermLength;
        emit OwnershipTermLengthSet(prevOwnershipTermLength, _ownershipTermLength);
    }

    // ============ PUBLIC INTERFACE ============

    function renewTag(uint256 _tokenId) public tagExists(_tokenId) {

        require(
            msg.sender == ets.ownerOf(_tokenId) || 
            msg.sender == address(ets),
            "renewTag: Invalid sender"
        );

        // Handle new and recycled CTAGS.
        if (ets.ownerOf(_tokenId) == ets.getPlatformAddress()) {
            _setLastRenewed(_tokenId, 0);
        } else {
            _setLastRenewed(_tokenId, block.timestamp);
        }

        emit TagRenewed(_tokenId, msg.sender);
    }

    function recycleTag(uint256 _tokenId) public tagExists(_tokenId) {
        ets.recycleTag(_tokenId);
    }
    
    // ============ PUBLIC VIEW FUNCTIONS ============

    function getOwnershipTermLength() public view returns (uint256) {
        return ownershipTermLength;
    }

    function getLastRenewed(uint256 _tokenId) public view returns (uint256) {
        return tokenIdToLastRenewed[_tokenId];
    }

    function version() public pure returns (string memory) {
        return VERSION;
    }

   // ============ INTERNAL FUNCTIONS ============

   function _setLastRenewed(uint256 _tokenId, uint256 _timestamp) internal {
       tokenIdToLastRenewed[_tokenId] = _timestamp;
   }
}
