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

/**
 * @title IETSAccessControls
 * @author Ethereum Tag Service <team@ets.xyz>
 *
 * @notice This is the interface for the ETSAccessControls contract which allows ETS Core Dev
 * Team to administer roles and control access to various parts of the ETS Platform.
 * ETSAccessControls contract contains a mix of public and administrator only functions.
 */
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

    /// @notice Mapping to contain whether Target Tagger is paused by the protocol.
    mapping(address => bool) public isTargetTaggerPaused;

    /// @notice Target Tagger name to contract address.
    mapping(string => address) public targetTaggerNameToContract;

    /// @notice Target Tagger contract address to human readable name.
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

    /// @inheritdoc IETSAccessControls
    function setPlatform(address payable _platform) public onlyRole(DEFAULT_ADMIN_ROLE) {
        address prevAddress = platform;
        platform = _platform;
        emit PlatformSet(_platform, prevAddress);
    }

    /// @inheritdoc IETSAccessControls
    function setRoleAdmin(bytes32 _role, bytes32 _adminRole) public onlyRole(DEFAULT_ADMIN_ROLE) {
        _setRoleAdmin(_role, _adminRole);
    }

    /// @inheritdoc IETSAccessControls
    function addTargetTagger(address _taggerAddress, string calldata _name) public onlyRole(DEFAULT_ADMIN_ROLE) {
        require(
            isAdmin(_taggerAddress) || IERC165(_taggerAddress).supportsInterface(type(IETSTargetTagger).interfaceId),
            "Address not admin or required interface"
        );
        targetTaggerNameToContract[_name] = _taggerAddress;
        targetTaggerContractToName[_taggerAddress] = _name;
        // Note: grantRole emits RoleGranted event.
        grantRole(PUBLISHER_ROLE, _taggerAddress);
        emit TargetTaggerAdded(_taggerAddress);
    }

    /// @inheritdoc IETSAccessControls
    function removeTargetTagger(address _taggerAddress) public onlyRole(DEFAULT_ADMIN_ROLE) {
        require(isTargetTagger(_taggerAddress), "invalid target tagger");
        string memory targetTaggerName = targetTaggerContractToName[_taggerAddress];
        delete targetTaggerNameToContract[targetTaggerName];
        delete targetTaggerContractToName[_taggerAddress];
        // Note: revokeRole emits RoleRevoked event.
        revokeRole(PUBLISHER_ROLE, _taggerAddress);
    }

    /// @inheritdoc IETSAccessControls
    function toggleIsTargetTaggerPaused(address _taggerAddress) public onlyRole(DEFAULT_ADMIN_ROLE) {
        isTargetTaggerPaused[_taggerAddress] = !isTargetTaggerPaused[_taggerAddress];
        emit TargetTaggerPauseToggled(isTargetTaggerPaused[_taggerAddress]);
    }

    // ============ PUBLIC VIEW FUNCTIONS ============

    /// @inheritdoc IETSAccessControls
    function isSmartContract(address _addr) public view returns (bool) {
        return hasRole(SMART_CONTRACT_ROLE, _addr);
    }

    /// @inheritdoc IETSAccessControls
    function isAdmin(address _addr) public view returns (bool) {
        return hasRole(DEFAULT_ADMIN_ROLE, _addr);
    }

    /// @inheritdoc IETSAccessControls
    function isPublisher(address _addr) public view returns (bool) {
        return hasRole(PUBLISHER_ROLE, _addr);
    }

    /// @inheritdoc IETSAccessControls
    function isPublisherAdmin(address _addr) public view returns (bool) {
        return hasRole(PUBLISHER_ROLE_ADMIN, _addr);
    }

    /// @inheritdoc IETSAccessControls
    function isTargetTagger(string memory _name) public view returns (bool) {
        return targetTaggerNameToContract[_name] != address(0);
    }

    /// @inheritdoc IETSAccessControls
    function isTargetTagger(address _addr) public view returns (bool) {
        return keccak256(abi.encodePacked(targetTaggerContractToName[_addr])) != keccak256(abi.encodePacked(""));
    }

    /// @inheritdoc IETSAccessControls
    function isTargetTaggerAndNotPaused(address _addr) public view returns (bool) {
        return isTargetTagger(_addr) && !isTargetTaggerPaused[_addr];
    }

    /// @inheritdoc IETSAccessControls
    function getPlatformAddress() public view returns (address payable) {
        return platform;
    }
}
