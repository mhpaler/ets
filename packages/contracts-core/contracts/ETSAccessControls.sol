// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import { IETSToken } from './interfaces/IETSToken.sol';
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts/interfaces/IERC165.sol";

import "hardhat/console.sol";


/// @title ETS access controls
/// @author Ethereum Tag Service <security@ets.xyz>
/// @dev Maintains a mapping of ethereum addresses and roles they have within the protocol
contract ETSAccessControls is Initializable, AccessControlUpgradeable, UUPSUpgradeable {

    IETSToken public etsToken;

    /// Public constants
    string public constant NAME = "ETS access controls";
    string public constant VERSION = "0.0.1";
    bytes32 public constant PUBLISHER_ROLE = keccak256("PUBLISHER");
    bytes32 public constant PUBLISHER_ROLE_ADMIN = keccak256("PUBLISHER_ADMIN");
    bytes32 public constant SMART_CONTRACT_ROLE = keccak256("SMART_CONTRACT");

    /// @dev number of owned tags required to acquire/maintain publisher role.
    uint256 publisherThreshold; 

    /// @dev Mapping of publisher addresses to grandfathered publisherThresholds.
    mapping(address => uint256) public publisherThresholds;

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

    function setETSToken(IETSToken _etsToken) public onlyRole(DEFAULT_ADMIN_ROLE) {
        require(address(_etsToken) != address(0), "ETS: Address cannot be zero");
        etsToken = _etsToken;
        emit EtsTokenSet(_etsToken);
    }

    // ============ PUBLIC INTERFACE ============

    // Grant or revoke publisher role for CTAG Token owners.
    function assessOwner(address _addr) public {

        uint256 threshold = getPublisherThreshold(_addr);

        if (etsToken.balanceOf(_addr) >= threshold && !hasRole(PUBLISHER_ROLE, _addr)) {
            grantRole(PUBLISHER_ROLE, _addr);
            publisherThresholds[_addr] = threshold;
        }

        if (etsToken.balanceOf(_addr) < threshold && hasRole(PUBLISHER_ROLE, _addr)) {
            revokeRole(PUBLISHER_ROLE, _addr);
            delete publisherThresholds[_addr];
        }
    }

    // ============ PUBLIC VIEW FUNCTIONS ============

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

    function getPublisherThreshold(address _addr) public view returns (uint256) {
        if (hasRole(PUBLISHER_ROLE, _addr)) {
            return publisherThresholds[_addr];
        }
        return calculateThreshold();
    }
    
    function getPublisherThreshold() public view returns (uint256) {
        return getPublisherThreshold(address(0));
    }


    function calculateThreshold() public view returns (uint256) {
        return publisherThreshold;
    }

    function version() external pure returns (string memory) {
        return VERSION;
    }

    // ============ INTERNAL FUNCTIONS ============

}
