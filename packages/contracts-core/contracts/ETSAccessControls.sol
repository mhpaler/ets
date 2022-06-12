// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts/interfaces/IERC165.sol";

import "hardhat/console.sol";


/// @title ETS access controls
/// @author Ethereum Tag Service <security@ets.xyz>
/// @dev Maintains a mapping of ethereum addresses and roles they have within the protocol
contract ETSAccessControls is Initializable, AccessControlUpgradeable, UUPSUpgradeable {

    /// Public constants
    string public constant NAME = "ETS access controls";
    string public constant VERSION = "0.0.1";
    bytes32 public constant PUBLISHER_ROLE = keccak256("PUBLISHER");
    bytes32 public constant PUBLISHER_ROLE_ADMIN = keccak256("PUBLISHER_ADMIN");
    bytes32 public constant SMART_CONTRACT_ROLE = keccak256("SMART_CONTRACT");


    // ============ UUPS INTERFACE ============

    function initialize() public initializer {
        __AccessControl_init();
        // Give default admin role to the deployer.
        // setupRole is should only be called within initialize().
        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
    }

    // Ensure that only address with admin role can upgrade.
    function _authorizeUpgrade(address) internal override onlyRole(DEFAULT_ADMIN_ROLE) {}

    // ============ OWNER INTERFACE ============

    function setRoleAdmin(bytes32 _role, bytes32 _adminRole) public onlyRole(DEFAULT_ADMIN_ROLE) {
        _setRoleAdmin(_role, _adminRole);
    }

    // ============ PUBLIC INTERFACE ============

    function isSmartContract(address _addr) public view returns (bool) {
        return hasRole(SMART_CONTRACT_ROLE, _addr);
    }

    function isAdmin(address _addr) public view returns (bool) {
        return hasRole(DEFAULT_ADMIN_ROLE, _addr);
    }

    function isPublisher(address _addr) public view returns (bool) {
        return hasRole(PUBLISHER_ROLE, _addr);
    }

    function isPublisherAdmin(address _addr) public view returns (bool) {
        return hasRole(PUBLISHER_ROLE_ADMIN, _addr);
    }

    function version() external pure returns (string memory) {
        return VERSION;
    }
}
