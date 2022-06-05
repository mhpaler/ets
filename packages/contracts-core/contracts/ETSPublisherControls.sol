// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./interfaces/IETS.sol";
import "./ETSAccessControls.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/math/SafeMathUpgradeable.sol";

import "hardhat/console.sol";

/// @title ETS publisher controls
/// @author Ethereum Tag Service <security@ets.xyz>
/// @dev System for automatically promoting/demoting ETS publishers.
contract ETSPublisherControls is Initializable, UUPSUpgradeable, ETSAccessControls {

    using SafeMathUpgradeable for uint256;

    //bytes32 public constant PUBLISHER_ROLE = keccak256("PUBLISHER");

    IETS public ets;
    //ETSAccessControls public etsAccessControls;

    modifier onlyAdmin() {
        require(isAdmin(msg.sender), "Caller must have administrator access");
        _;
    }
//
    //modifier onlyPublisherRoleAdmin() {
    //    console.log("onlyPublisherRoleAdmin", msg.sender);
    //    require(etsAccessControls.isPublisherAdmin(msg.sender), "ETSPublisherControls: Caller not publisher admin");
    //    _;
    //}



    // ============ UUPS INTERFACE ============

    //function initialize() public virtual initializer override(ETSAccessControls) {
    //    __UUPSUpgradeable_init();
    //    //ets = _ets;
    //    //etsAccessControls = _etsAccessControls;
    //}

    // @Vince -- can I comment this out?
    //function _authorizeUpgrade(address) internal virtual onlyAdmin {}

    // ============ OWNER INTERFACE ============

    function setETS(IETS _ets) public onlyAdmin {
        require(address(ets) == address(0), "setETS: Cannot set twice");
        require(address(_ets) != address(0), "setETS: Address cannot be zero");
        ets = _ets;
    }

    // ============ PUBLIC INTERFACE ============

    function promoteToPublisher(address owner) public {
        if (ets.balanceOf(owner) > 0) {
            _grantRole(PUBLISHER_ROLE, owner);
        }
    }

    // ============ PUBLIC VIEW FUNCTIONS ============


   // ============ INTERNAL FUNCTIONS ============

}
