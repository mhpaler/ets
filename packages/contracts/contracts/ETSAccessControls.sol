// SPDX-License-Identifier: MIT

/**
 * @title IETSAccessControls
 * @author Ethereum Tag Service <team@ets.xyz>
 *
 *  ███████╗████████╗███████╗
 *  ██╔════╝╚══██╔══╝██╔════╝
 *  █████╗     ██║   ███████╗
 *  ██╔══╝     ██║   ╚════██║
 *  ███████╗   ██║   ███████║
 *  ╚══════╝   ╚═╝   ╚══════╝
 *
 * @notice This is the interface for the ETSAccessControls contract which allows ETS Core Dev
 * Team to administer roles and control access to various parts of the ETS Platform.
 * ETSAccessControls contract contains a mix of public and administrator only functions.
 */

pragma solidity ^0.8.10;

import { IETSAccessControls } from "./interfaces/IETSAccessControls.sol";
import { IETSChannel } from "./channels/interfaces/IETSChannel.sol";
import { Initializable } from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import { UUPSUpgradeable } from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import { AccessControlUpgradeable } from "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import { ERC165CheckerUpgradeable } from "@openzeppelin/contracts-upgradeable/utils/introspection/ERC165CheckerUpgradeable.sol";

contract ETSAccessControls is Initializable, AccessControlUpgradeable, IETSAccessControls, UUPSUpgradeable {
    /// Public constants
    string public constant NAME = "ETS access controls";
    string public constant VERSION = "0.0.1";
    bytes32 public constant CHANNEL_ROLE = keccak256("CHANNEL_ROLE");
    bytes32 public constant CHANNEL_FACTORY_ROLE = keccak256("CHANNEL_FACTORY_ROLE");
    bytes32 public constant CHANNEL_ADMIN_ROLE = keccak256("CHANNEL_ADMIN_ROLE");
    bytes32 public constant EVENT_PROCESSOR_ROLE = keccak256("EVENT_PROCESSOR_ROLE");
    bytes32 public constant SMART_CONTRACT_ROLE = keccak256("SMART_CONTRACT_ROLE");

    /// @dev ETS Platform account. Core Dev Team multisig in production.
    /// There will only be one "Platform" so no need to make it a role.
    address payable internal platform;

    /// @notice Mapping to contain whether Channel is paused by the protocol.
    mapping(address => bool) public channelLocked;

    /// @notice Channel name to contract address.
    mapping(string => address) public channelNameToContract;

    /// @notice Channel contract address to human readable name.
    mapping(address => string) public channelContractToName;

    /// @notice Channel owner address to channel address.
    mapping(address => address) public channelOwnerToAddress;

    modifier onlyValidName(string calldata _name) {
        if (isChannelByName(_name)) revert ChannelNameExists(_name);
        bytes memory nameBytes = bytes(_name);
        if (nameBytes.length < 2) revert ChannelNameTooShort(nameBytes.length);
        if (nameBytes.length > 32) revert ChannelNameTooLong(nameBytes.length);
        _;
    }

    // ============ UUPS INTERFACE ============

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(address _platformAddress) public initializer {
        __AccessControl_init();
        _grantRole(DEFAULT_ADMIN_ROLE, _msgSender());
        setPlatform(payable(_platformAddress));
    }

    // Ensure that only addresses with admin role can upgrade.
    // solhint-disable-next-line
    function _authorizeUpgrade(address) internal override onlyRole(DEFAULT_ADMIN_ROLE) {}

    // ============ OWNER INTERFACE ============

    /// @inheritdoc IETSAccessControls
    function setPlatform(address payable _platform) public onlyRole(DEFAULT_ADMIN_ROLE) {
        address prevAddress = platform;
        platform = _platform;
        grantRole(DEFAULT_ADMIN_ROLE, _platform);
        emit PlatformSet(_platform, prevAddress);
    }

    /// @inheritdoc IETSAccessControls
    function setRoleAdmin(bytes32 _role, bytes32 _adminRole) public onlyRole(DEFAULT_ADMIN_ROLE) {
        _setRoleAdmin(_role, _adminRole);
    }

    /// @inheritdoc IETSAccessControls
    function registerChannel(
        address _channel,
        string calldata _name,
        address _owner
    ) public onlyRole(CHANNEL_FACTORY_ROLE) {
        channelNameToContract[_name] = _channel;
        channelContractToName[_channel] = _name;
        channelOwnerToAddress[_owner] = _channel;
        channelLocked[_channel] = false;
        // Note: grantRole emits RoleGranted event.
        grantRole(CHANNEL_ROLE, _channel);
        emit ChannelAdded(_channel);
    }

    /// @inheritdoc IETSAccessControls
    function pauseChannelByOwnerAddress(address _channelOwner) public onlyRole(CHANNEL_ADMIN_ROLE) {
        if (isChannelByOwner(_channelOwner)) {
            IETSChannel channel = IETSChannel(getChannelAddressFromOwner(_channelOwner));
            if (!channel.isPaused()) {
                channel.pause();
            }
        }
    }

    /// @inheritdoc IETSAccessControls
    function changeChannelOwner(address _currentOwner, address _newOwner) public onlyRole(CHANNEL_ROLE) {
        if (!isChannelByAddress(_msgSender())) revert CallerIsNotChannel(_msgSender());
        if (IETSChannel(_msgSender()).getOwner() != _currentOwner) revert NotChannelOwner(_msgSender(), _currentOwner);
        if (isChannelByOwner(_newOwner)) revert NewOwnerAlreadyOwnsChannel(_newOwner);
        channelOwnerToAddress[_currentOwner] = address(0);
        // _msgSender() is the channel itself.
        channelOwnerToAddress[_newOwner] = _msgSender();
    }

    /// @inheritdoc IETSAccessControls
    function toggleChannelLock(address _channel) public onlyRole(CHANNEL_ADMIN_ROLE) {
        channelLocked[_channel] = !channelLocked[_channel];
        emit ChannelLockToggled(_channel);
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
    /// @dev DEPRECATED - TODO: Remove in v2.0.0 after full EVENT_PROCESSOR migration

    /// @inheritdoc IETSAccessControls
    function isEventProcessor(address _addr) public view returns (bool) {
        return hasRole(EVENT_PROCESSOR_ROLE, _addr);
    }

    /// @inheritdoc IETSAccessControls
    function isChannelFactory(address _addr) public view returns (bool) {
        return hasRole(CHANNEL_ADMIN_ROLE, _addr) || hasRole(CHANNEL_FACTORY_ROLE, _addr);
    }

    /// @inheritdoc IETSAccessControls
    function isChannel(address _addr) public view returns (bool) {
        return hasRole(CHANNEL_ADMIN_ROLE, _addr) || isChannelAndNotPaused(_addr);
    }

    /// @inheritdoc IETSAccessControls
    function isChannelLocked(address _addr) public view returns (bool) {
        return channelLocked[_addr];
    }

    /// @inheritdoc IETSAccessControls
    function isChannelAndNotPaused(address _addr) public view returns (bool) {
        return isChannelByAddress(_addr) && !isChannelLocked(_addr) && !IETSChannel(_addr).isPaused();
    }

    /// @inheritdoc IETSAccessControls
    function isChannelByOwner(address _addr) public view returns (bool) {
        return channelOwnerToAddress[_addr] != address(0);
    }

    /// @inheritdoc IETSAccessControls
    function isChannelAdmin(address _addr) public view returns (bool) {
        return hasRole(CHANNEL_ADMIN_ROLE, _addr);
    }

    /// @inheritdoc IETSAccessControls
    function isChannelByName(string memory _name) public view returns (bool) {
        return channelNameToContract[_name] != address(0);
    }

    /// @inheritdoc IETSAccessControls
    function isChannelByAddress(address _addr) public view returns (bool) {
        return keccak256(abi.encodePacked(channelContractToName[_addr])) != keccak256(abi.encodePacked(""));
    }

    /// @inheritdoc IETSAccessControls
    function getChannelAddressFromName(string memory _name) public view returns (address) {
        return channelNameToContract[_name];
    }

    /// @inheritdoc IETSAccessControls
    function getChannelNameFromAddress(address _address) public view returns (string memory) {
        return channelContractToName[_address];
    }

    /// @inheritdoc IETSAccessControls
    function getChannelAddressFromOwner(address _address) public view returns (address) {
        return channelOwnerToAddress[_address];
    }

    /// @inheritdoc IETSAccessControls
    function getPlatformAddress() public view returns (address payable) {
        return platform;
    }
}
