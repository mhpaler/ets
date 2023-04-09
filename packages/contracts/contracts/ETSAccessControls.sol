// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import { IETSAccessControls } from "./interfaces/IETSAccessControls.sol";
import { IETSRelayer } from "./relayers/interfaces/IETSRelayer.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/introspection/ERC165CheckerUpgradeable.sol";

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
    bytes32 public constant RELAYER_ROLE = keccak256("RELAYER");
    bytes32 public constant RELAYER_ROLE_ADMIN = keccak256("RELAYER_ADMIN");
    bytes32 public constant SMART_CONTRACT_ROLE = keccak256("SMART_CONTRACT");

    /// @dev ETS Platform account. Core Dev Team multisig in production.
    /// There will only be one "Platform" so no need to make it a role.
    address payable internal platform;

    /// @notice Mapping to contain whether Relayer is paused by the protocol.
    mapping(address => bool) public isRelayerPaused;

    /// @notice Relayer name to contract address.
    mapping(string => address) public relayerNameToContract;

    /// @notice Relayer contract address to human readable name.
    mapping(address => string) public relayerContractToName;

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
        // setupRole is should only be called within initialize().
        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
        _setRoleAdmin(RELAYER_ROLE, RELAYER_ROLE_ADMIN);
        grantRole(DEFAULT_ADMIN_ROLE, _platformAddress);
        grantRole(RELAYER_ROLE_ADMIN, _platformAddress);
        setPlatform(payable(_platformAddress));
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
    function addRelayer(address _relayer, string calldata _name)
        public
        onlyRole(RELAYER_ROLE_ADMIN)
        onlyValidName(_name)
    {
        require(
            isRelayerAdmin(_relayer) ||
                ERC165CheckerUpgradeable.supportsInterface(_relayer, type(IETSRelayer).interfaceId),
            "Address not required interface"
        );

        require(!isRelayerByAddress(_relayer), "Relayer exists");

        relayerNameToContract[_name] = _relayer;
        relayerContractToName[_relayer] = _name;
        isRelayerPaused[_relayer] = false;
        // Note: grantRole emits RoleGranted event.
        grantRole(RELAYER_ROLE, _relayer);
        emit RelayerAdded(_relayer, isRelayerAdmin(_relayer));
    }

    /// @inheritdoc IETSAccessControls
    function toggleIsRelayerPaused(address _relayer) public onlyRole(DEFAULT_ADMIN_ROLE) {
        isRelayerPaused[_relayer] = !isRelayerPaused[_relayer];
        emit RelayerPauseToggled(_relayer);
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
    function isRelayer(address _addr) public view returns (bool) {
        return isRelayerAndNotPaused(_addr);
    }

    /// @inheritdoc IETSAccessControls
    function isRelayerAdmin(address _addr) public view returns (bool) {
        return hasRole(RELAYER_ROLE_ADMIN, _addr);
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
    function isRelayerAndNotPaused(address _addr) public view returns (bool) {
        return isRelayerByAddress(_addr) && !isRelayerPaused[_addr];
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
    function getPlatformAddress() public view returns (address payable) {
        return platform;
    }
}
