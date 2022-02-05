// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "hardhat/console.sol";

import {ETSAccessControls} from "./ETSAccessControls.sol";

/// @title ETSTag ERC-721 NFT contract
/// @author Ethereum Tag Service <security@ets.xyz>
/// @notice Contract that governs the creation of ETSTAG non-fungible tokens.
/// @dev UUPS upgradable.
contract ETSEnsure is UUPSUpgradeable {

    /// Variable storage

    /// @notice ETS access controls smart contract.
    ETSAccessControls public accessControls;

    /// Public constants

    string public constant NAME = "ETSEnsure Contract";
    string public constant VERSION = "0.1.0";

    /// Modifiers

    modifier onlyAdmin() {
        require(accessControls.isAdmin(msg.sender), "Caller must have administrator access");
        _;
    }

    /// Events


    function initialize(ETSAccessControls _accessControls) public initializer {

        // Initialize access controls.
        accessControls = _accessControls;
    }

    function _authorizeUpgrade(address) internal override onlyAdmin {}


    function version() external pure returns (string memory) {
        return VERSION;
    }

}
