// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import { IETSToken } from "./interfaces/IETSToken.sol";
import { IETSTargetTagger } from "./interfaces/IETSTargetTagger.sol";
import { IETSAccessControls } from "./interfaces/IETSAccessControls.sol";
import "@openzeppelin/contracts/interfaces/IERC165.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/math/SafeMathUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";

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
    bytes32 public constant TARGET_TAGGER_ROLE = keccak256("TARGET_TAGGER");

    /// @dev number of owned tags needed to acquire/maintain publisher role.
    uint256 public publisherDefaultThreshold;

    /// @dev ETS Platform account. Core Dev Team multisig in production.
    /// There will only be one "Platform" so no need to make it a role.
    address payable internal platform;

    /// @dev Mapping of publisher address to grandfathered publisherThreshold.
    mapping(address => uint256) public publisherThresholds;

    /// @notice If Target Tagger is paused by the protocol
    mapping(address => bool) public isTargetTaggerPaused;

    /// @notice Target type name to target type contract address or zero if nothing assigned
    mapping(string => address) public targetTaggerNameToContract;

    /// @notice Target type contract address to registered name or empty string if nothing assigned
    mapping(address => string) public targetTaggerContractToName;

    // ============ UUPS INTERFACE ============

    function initialize(uint256 _publisherDefaultThreshold) public initializer {
        __AccessControl_init();
        // Give default admin role to the deployer.
        // setupRole is should only be called within initialize().
        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());

        publisherDefaultThreshold = _publisherDefaultThreshold;
    }

    // Ensure that only addresses with admin role can upgrade.
    function _authorizeUpgrade(address) internal override onlyRole(DEFAULT_ADMIN_ROLE) {}

    // ============ OWNER INTERFACE ============

    function setPlatform(address payable _platform) public onlyRole(DEFAULT_ADMIN_ROLE) {
        platform = _platform;
        emit PlatformSet(_platform);
    }

    function setRoleAdmin(bytes32 _role, bytes32 _adminRole) public onlyRole(DEFAULT_ADMIN_ROLE) {
        _setRoleAdmin(_role, _adminRole);
    }

    function setETSToken(IETSToken _etsToken) public onlyRole(DEFAULT_ADMIN_ROLE) {
        require(address(_etsToken) != address(0), "ETS: Address cannot be zero");
        etsToken = _etsToken;
        emit ETSTokenSet(_etsToken);
    }

    function setPublisherDefaultThreshold(uint256 _threshold) public onlyRole(DEFAULT_ADMIN_ROLE) {
        publisherDefaultThreshold = _threshold;
        emit PublisherDefaultThresholdSet(_threshold);
    }

    /// @notice Add a new Target Tagger smart contract to the ETS protocol
    /// Note: Admin addresses can be added as target type to permit calling ETS core directly
    /// for tagging testing and debugging purposes.
    function addTargetTagger(address _taggerAddress, string calldata _name) public onlyRole(DEFAULT_ADMIN_ROLE) {
        require(
            isAdmin(_taggerAddress) || IERC165(_taggerAddress).supportsInterface(type(IETSTargetTagger).interfaceId),
            "Address not admin or required interface"
        );
        targetTaggerNameToContract[_name] = _taggerAddress;
        targetTaggerContractToName[_taggerAddress] = _name;
        // Note: grantRole emits RoleGranted event.
        grantRole(TARGET_TAGGER_ROLE, _taggerAddress);
    }

    /// @notice Remove a target type smart contract from the protocol
    function removeTargetTagger(address _taggerAddress) public onlyRole(DEFAULT_ADMIN_ROLE) {
        require(isTargetTagger(_taggerAddress), "invalid target tagger");
        string memory targetTaggerName = targetTaggerContractToName[_taggerAddress];
        delete targetTaggerNameToContract[targetTaggerName];
        delete targetTaggerContractToName[_taggerAddress];
        // Note: revokeRole emits RoleRevoked event.
        revokeRole(TARGET_TAGGER_ROLE, _taggerAddress);
    }

    /// @notice Toggle whether the target type is paused or not
    function toggleIsTargetTaggerPaused(address _taggerAddress) public onlyRole(DEFAULT_ADMIN_ROLE) {
        isTargetTaggerPaused[_taggerAddress] = !isTargetTaggerPaused[_taggerAddress];
        emit TargetTaggerPauseToggled(isTargetTaggerPaused[_taggerAddress]);
    }

    // ============ PUBLIC INTERFACE ============

    ///@dev Grant or revoke publisher role for CTAG Token owners.
    function togglePublisher() public returns (bool toggled) {
        // Grant publisher role to sender if token balance meets threshold.
        uint256 threshold = getPublisherThreshold(msg.sender);

        if (etsToken.balanceOf(msg.sender) >= threshold && !hasRole(PUBLISHER_ROLE, msg.sender)) {
            this.grantRole(PUBLISHER_ROLE, msg.sender);
            publisherThresholds[msg.sender] = threshold;
            return true;
        }

        // Revoke publisher role from sender.
        if (hasRole(PUBLISHER_ROLE, msg.sender)) {
            this.revokeRole(PUBLISHER_ROLE, msg.sender);
            delete publisherThresholds[msg.sender];
            return true;
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

    function isTargetTagger(string memory _taggerName) public view returns (bool) {
        return targetTaggerNameToContract[_taggerName] != address(0);
    }

    /// @notice Checks whether an address has the tagging contract role
    /// @param _taggerAddress Address being checked
    /// @return bool True if the address has the role, false if not
    function isTargetTagger(address _taggerAddress) public view returns (bool) {
        return hasRole(TARGET_TAGGER_ROLE, _taggerAddress);
    }

    /// @notice Checks whether an address has the target type contract role and is not paused from tagging
    /// @param _taggerAddress Address being checked
    function isTargetTaggerAndNotPaused(address _taggerAddress) public view returns (bool) {
        return isTargetTagger(_taggerAddress) && !isTargetTaggerPaused[_taggerAddress];
    }

    function getPlatformAddress() public view returns (address payable) {
        return platform;
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
