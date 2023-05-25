// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import { IETSAccessControls } from "./interfaces/IETSAccessControls.sol";
import { IETSRelayer } from "./relayers/interfaces/IETSRelayer.sol";
import { Initializable } from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import { UUPSUpgradeable } from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import { AccessControlUpgradeable } from "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import { ERC165CheckerUpgradeable } from "@openzeppelin/contracts-upgradeable/utils/introspection/ERC165CheckerUpgradeable.sol";

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
    bytes32 public constant RELAYER_ROLE = keccak256("RELAYER_ROLE");
    bytes32 public constant RELAYER_FACTORY_ROLE = keccak256("RELAYER_FACTORY_ROLE");
    bytes32 public constant RELAYER_ADMIN_ROLE = keccak256("RELAYER_ADMIN_ROLE");
    bytes32 public constant SMART_CONTRACT_ROLE = keccak256("SMART_CONTRACT_ROLE");

    /// @dev ETS Platform account. Core Dev Team multisig in production.
    /// There will only be one "Platform" so no need to make it a role.
    address payable internal platform;

    /// @notice Mapping to contain whether Relayer is paused by the protocol.
    mapping(address => bool) public relayerLocked;

    /// @notice Relayer name to contract address.
    mapping(string => address) public relayerNameToContract;

    /// @notice Relayer contract address to human readable name.
    mapping(address => string) public relayerContractToName;

    /// @notice Relayer owner address to relayer address.
    mapping(address => address) public relayerOwnerToAddress;

    modifier onlyValidName(string calldata _name) {
        require(!isRelayerByName(_name), "Relayer name exists");
        bytes memory nameBytes = bytes(_name);
        require(nameBytes.length >= 2, "Relayer name too short");
        require(nameBytes.length <= 32, "Relayer name too long");
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
        _grantRole(DEFAULT_ADMIN_ROLE, _platformAddress);
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
        emit PlatformSet(_platform, prevAddress);
    }

    /// @inheritdoc IETSAccessControls
    function setRoleAdmin(bytes32 _role, bytes32 _adminRole) public onlyRole(DEFAULT_ADMIN_ROLE) {
        _setRoleAdmin(_role, _adminRole);
    }

    /// @inheritdoc IETSAccessControls
    function registerRelayer(
        address _relayer,
        string calldata _name,
        address _owner
    ) public onlyRole(RELAYER_FACTORY_ROLE) {
        relayerNameToContract[_name] = _relayer;
        relayerContractToName[_relayer] = _name;
        relayerOwnerToAddress[_owner] = _relayer;
        relayerLocked[_relayer] = false;
        // Note: grantRole emits RoleGranted event.
        grantRole(RELAYER_ROLE, _relayer);
        emit RelayerAdded(_relayer);
    }

    /// @inheritdoc IETSAccessControls
    function pauseRelayerByOwnerAddress(address _relayerOwner) public onlyRole(RELAYER_ADMIN_ROLE) {
        if (isRelayerByOwner(_relayerOwner)) {
            IETSRelayer relayer = IETSRelayer(getRelayerAddressFromOwner(_relayerOwner));
            if (!relayer.isPaused()) {
                relayer.pause();
            }
        }
    }

    /// @inheritdoc IETSAccessControls
    function changeRelayerOwner(address _currentOwner, address _newOwner) public onlyRole(RELAYER_ROLE) {
        require(isRelayerByAddress(_msgSender()), "Caller is not relayer");
        require(IETSRelayer(_msgSender()).getOwner() == _currentOwner, "Not relayer owner");
        require(!isRelayerByOwner(_newOwner), "New owner already owns a relayer");
        relayerOwnerToAddress[_currentOwner] = address(0);
        // _msgSender() is the relayer itself.
        relayerOwnerToAddress[_newOwner] = _msgSender();
    }

    /// @inheritdoc IETSAccessControls
    function toggleRelayerLock(address _relayer) public onlyRole(RELAYER_ADMIN_ROLE) {
        relayerLocked[_relayer] = !relayerLocked[_relayer];
        emit RelayerLockToggled(_relayer);
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
    function isRelayerFactory(address _addr) public view returns (bool) {
        return hasRole(RELAYER_ADMIN_ROLE, _addr) || hasRole(RELAYER_FACTORY_ROLE, _addr);
    }

    /// @inheritdoc IETSAccessControls
    function isRelayer(address _addr) public view returns (bool) {
        return hasRole(RELAYER_ADMIN_ROLE, _addr) || isRelayerAndNotPaused(_addr);
    }

    /// @inheritdoc IETSAccessControls
    function isRelayerLocked(address _addr) public view returns (bool) {
        return relayerLocked[_addr];
    }

    /// @inheritdoc IETSAccessControls
    function isRelayerAndNotPaused(address _addr) public view returns (bool) {
        return isRelayerByAddress(_addr) && !isRelayerLocked(_addr) && !IETSRelayer(_addr).isPaused();
    }

    /// @inheritdoc IETSAccessControls
    function isRelayerByOwner(address _addr) public view returns (bool) {
        return relayerOwnerToAddress[_addr] != address(0);
    }

    /// @inheritdoc IETSAccessControls
    function isRelayerAdmin(address _addr) public view returns (bool) {
        return hasRole(RELAYER_ADMIN_ROLE, _addr);
    }

    /// @inheritdoc IETSAccessControls
    function isRelayerByName(string memory _name) public view returns (bool) {
        return relayerNameToContract[_name] != address(0);
    }

    /// @inheritdoc IETSAccessControls
    function isRelayerByAddress(address _addr) public view returns (bool) {
        return keccak256(abi.encodePacked(relayerContractToName[_addr])) != keccak256(abi.encodePacked(""));
    }

    /// @inheritdoc IETSAccessControls
    function getRelayerAddressFromName(string memory _name) public view returns (address) {
        return relayerNameToContract[_name];
    }

    /// @inheritdoc IETSAccessControls
    function getRelayerNameFromAddress(address _address) public view returns (string memory) {
        return relayerContractToName[_address];
    }

    /// @inheritdoc IETSAccessControls
    function getRelayerAddressFromOwner(address _address) public view returns (address) {
        return relayerOwnerToAddress[_address];
    }

    /// @inheritdoc IETSAccessControls
    function getPlatformAddress() public view returns (address payable) {
        return platform;
    }
}
