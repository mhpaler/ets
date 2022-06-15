// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import { IETSToken } from './interfaces/IETSToken.sol';
import { IETSAccessControls } from './interfaces/IETSAccessControls.sol';
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/math/SafeMathUpgradeable.sol";
import "@openzeppelin/contracts/interfaces/IERC165.sol";

import "hardhat/console.sol";


/// @title ETS access controls
/// @author Ethereum Tag Service <security@ets.xyz>
/// @dev Maintains a mapping of ethereum addresses and roles they have within the protocol
contract ETSAccessControls is Initializable, AccessControlUpgradeable, IETSAccessControls, UUPSUpgradeable {

    using SafeMathUpgradeable for uint256;

    IETSToken public etsToken;

    /// Public constants
    string public constant NAME = "ETS access controls";
    string public constant VERSION = "0.0.1";
    bytes32 public constant PUBLISHER_ROLE = keccak256("PUBLISHER");
    bytes32 public constant PUBLISHER_ROLE_ADMIN = keccak256("PUBLISHER_ADMIN");
    bytes32 public constant SMART_CONTRACT_ROLE = keccak256("SMART_CONTRACT");


    /// @dev number of owned tags needed to acquire/maintain publisher role.
    uint256 public publisherDefaultThreshold; 

    /// @dev Mapping of publisher address to grandfathered publisherThreshold.
    mapping(address => uint256) public publisherThresholds;

    // ============ UUPS INTERFACE ============

    function initialize(
        uint256 _publisherDefaultThreshold
    ) public initializer {
        __AccessControl_init();
        // Give default admin role to the deployer.
        // setupRole is should only be called within initialize().
        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());

        publisherDefaultThreshold = _publisherDefaultThreshold;

    }

    // Ensure that only addresses with admin role can upgrade.
    function _authorizeUpgrade(address) internal override onlyRole(DEFAULT_ADMIN_ROLE) {}

    // ============ OWNER INTERFACE ============

    function setETSToken(IETSToken _etsToken) public onlyRole(DEFAULT_ADMIN_ROLE) {
        require(address(_etsToken) != address(0), "ETS: Address cannot be zero");
        etsToken = _etsToken;
        emit ETSTokenSet(_etsToken);
    }

    function setRoleAdmin(bytes32 _role, bytes32 _adminRole) public onlyRole(DEFAULT_ADMIN_ROLE) {
        _setRoleAdmin(_role, _adminRole);
    }

    function setPublisherDefaultThreshold(uint256 _threshold) public onlyRole(DEFAULT_ADMIN_ROLE) {
        publisherDefaultThreshold = _threshold;
        emit PublisherDefaultThresholdSet(_threshold);
    } 

    // ============ PUBLIC INTERFACE ============

    ///@dev Grant or revoke publisher role for CTAG Token owners.
    function assessOwners(address _from, address _to) public {

        // Grant recipient publisher role when receiving
        // from platform and balance meets threshold.
        if (_from == etsToken.getPlatformAddress()) {
            uint256 threshold = getPublisherThreshold(_to);

            if (etsToken.balanceOf(_to) >= threshold && !hasRole(PUBLISHER_ROLE, _to)) {
                grantRole(PUBLISHER_ROLE, _to);
                publisherThresholds[_to] = threshold;
            }
        } 
        
        // Revoke publisher role from sender if balance falls below threshold.
        if (_from != etsToken.getPlatformAddress() && _from != address(0)) {
            uint256 threshold = getPublisherThreshold(_from);

            if (etsToken.balanceOf(_from) < threshold && hasRole(PUBLISHER_ROLE, _from)) {
                revokeRole(PUBLISHER_ROLE, _from);
                delete publisherThresholds[_from];
            }
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
        return getPublisherDefaultThreshold();
    }

    function getPublisherDefaultThreshold() public view returns (uint256) {
        return publisherDefaultThreshold;
    }

    function version() external pure returns (string memory) {
        return VERSION;
    }

}
