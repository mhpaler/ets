// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

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

    /// Public constants
    string public constant NAME = "ETS access controls";
    bytes32 public constant PUBLISHER_ROLE = keccak256("PUBLISHER");
    bytes32 public constant PUBLISHER_ROLE_ADMIN = keccak256("PUBLISHER_ADMIN");
    bytes32 public constant SMART_CONTRACT_ROLE = keccak256("SMART_CONTRACT");

    /// @dev ETS Platform account. Core Dev Team multisig in production.
    /// There will only be one "Platform" so no need to make it a role.
    address payable internal platform;

    /// @notice If Target Tagger is paused by the protocol
    mapping(address => bool) public isTargetTaggerPaused;

    /// @notice Target type name to target type contract address or zero if nothing assigned
    mapping(string => address) public targetTaggerNameToContract;

    /// @notice Target type contract address to registered name or empty string if nothing assigned
    mapping(address => string) public targetTaggerContractToName;

    // ============ UUPS INTERFACE ============

    function initialize() public initializer {
        __AccessControl_init();
        // Give default admin role to the deployer.
        // setupRole is should only be called within initialize().
        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
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
        grantRole(PUBLISHER_ROLE, _taggerAddress);
    }

    /// @notice Remove a target type smart contract from the protocol
    function removeTargetTagger(address _taggerAddress) public onlyRole(DEFAULT_ADMIN_ROLE) {
        require(isTargetTagger(_taggerAddress), "invalid target tagger");
        string memory targetTaggerName = targetTaggerContractToName[_taggerAddress];
        delete targetTaggerNameToContract[targetTaggerName];
        delete targetTaggerContractToName[_taggerAddress];
        // Note: revokeRole emits RoleRevoked event.
        revokeRole(PUBLISHER_ROLE, _taggerAddress);
    }

    /// @notice Toggle whether the target type is paused or not
    function toggleIsTargetTaggerPaused(address _taggerAddress) public onlyRole(DEFAULT_ADMIN_ROLE) {
        isTargetTaggerPaused[_taggerAddress] = !isTargetTaggerPaused[_taggerAddress];
        emit TargetTaggerPauseToggled(isTargetTaggerPaused[_taggerAddress]);
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

    /// @notice Checks whether an address is an Target Tagger contract
    /// @param _taggerAddress Address being checked
    /// @return bool True if the address is a Target Tagger
    function isTargetTagger(address _taggerAddress) public view returns (bool) {
        return
            keccak256(abi.encodePacked(targetTaggerContractToName[_taggerAddress])) != keccak256(abi.encodePacked(""));
    }

    /// @notice Checks whether an address has the target type contract role and is not paused from tagging
    /// @param _taggerAddress Address being checked
    function isTargetTaggerAndNotPaused(address _taggerAddress) public view returns (bool) {
        return isTargetTagger(_taggerAddress) && !isTargetTaggerPaused[_taggerAddress];
    }

    function getPlatformAddress() public view returns (address payable) {
        return platform;
    }
}
