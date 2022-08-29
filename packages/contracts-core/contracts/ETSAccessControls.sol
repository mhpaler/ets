// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import { IETSPublisher } from "./interfaces/IETSPublisher.sol";
import { IETSAccessControls } from "./interfaces/IETSAccessControls.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/introspection/ERC165CheckerUpgradeable.sol";

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
    /// Public constants
    string public constant NAME = "ETS access controls";
    bytes32 public constant PUBLISHER_ROLE = keccak256("PUBLISHER");
    bytes32 public constant PUBLISHER_ROLE_ADMIN = keccak256("PUBLISHER_ADMIN");
    bytes32 public constant SMART_CONTRACT_ROLE = keccak256("SMART_CONTRACT");

    /// @dev ETS Platform account. Core Dev Team multisig in production.
    /// There will only be one "Platform" so no need to make it a role.
    address payable internal platform;

    /// @notice Mapping to contain whether Publisher is paused by the protocol.
    mapping(address => bool) public isPublisherPaused;

    /// @notice Publisher name to contract address.
    mapping(string => address) public publisherNameToContract;

    /// @notice Publisher contract address to human readable name.
    mapping(address => string) public publisherContractToName;

    // ============ UUPS INTERFACE ============

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

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
    function addPublisher(address _publisher, string calldata _name) public onlyRole(PUBLISHER_ROLE_ADMIN) {
        require(
            isPublisherAdmin(_publisher) ||
                ERC165CheckerUpgradeable.supportsInterface(_publisher, type(IETSPublisher).interfaceId),
            "Address not required interface"
        );
        require(!isPublisherByAddress(_publisher), "Publisher exists");
        require(!isPublisherByName(_name), "Publisher name exists");
        publisherNameToContract[_name] = _publisher;
        publisherContractToName[_publisher] = _name;
        isPublisherPaused[_publisher] = true;
        // Note: grantRole emits RoleGranted event.
        grantRole(PUBLISHER_ROLE, _publisher);
        grantRole(SMART_CONTRACT_ROLE, _publisher);
        emit PublisherAdded(_publisher, isPublisherAdmin(_publisher));
    }

    /// @inheritdoc IETSAccessControls
    function toggleIsPublisherPaused(address _publisher) public onlyRole(DEFAULT_ADMIN_ROLE) {
        isPublisherPaused[_publisher] = !isPublisherPaused[_publisher];
        emit PublisherPauseToggled(_publisher);
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
        return isPublisherAndNotPaused(_addr);
    }

    /// @inheritdoc IETSAccessControls
    function isPublisherAdmin(address _addr) public view returns (bool) {
        return hasRole(PUBLISHER_ROLE_ADMIN, _addr);
    }

    /// @inheritdoc IETSAccessControls
    function isPublisherByName(string memory _name) public view returns (bool) {
        return publisherNameToContract[_name] != address(0);
    }

    /// @inheritdoc IETSAccessControls
    function isPublisherByAddress(address _addr) public view returns (bool) {
        return keccak256(abi.encodePacked(publisherContractToName[_addr])) != keccak256(abi.encodePacked(""));
    }

    /// @inheritdoc IETSAccessControls
    function isPublisherAndNotPaused(address _addr) public view returns (bool) {
        return isPublisherByAddress(_addr) && !isPublisherPaused[_addr];
    }

    /// @inheritdoc IETSAccessControls
    function getPlatformAddress() public view returns (address payable) {
        return platform;
    }
}
