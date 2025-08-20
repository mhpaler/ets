// SPDX-License-Identifier: MIT

/**
 * @title ETSToken
 * @author Ethereum Tag Service <team@ets.xyz>
 *
 *  ███████╗████████╗███████╗
 *  ██╔════╝╚══██╔══╝██╔════╝
 *  █████╗     ██║   ███████╗
 *  ██╔══╝     ██║   ╚════██║
 *  ███████╗   ██║   ███████║
 *  ╚══════╝   ╚═╝   ╚══════╝
 *
 * @notice This is the core ETSToken.sol contract that governs the creation & management of
 * Ethereum Tag Service tags with Zora ERC-20 coin integration.
 *
 * TAGs are represented by deterministic Zora ERC-20 coin addresses that store tag metadata including
 * three-tier identifier system, origin attribution data with "Relayer" and "Creator" addresses.
 *
 * TAGs use a three-tier identifier system: originalInput ("#BiTCOin"), displayVersion ("#Bitcoin"),
 * and machineName ("bitcoin"). Only one TAG exists per normalized machine name regardless of case.
 *
 * TAG coin addresses are deterministically computed using Zora's coinAddress() function, enabling
 * predictable addressing and seamless integration with Zora's trading infrastructure.
 */

pragma solidity ^0.8.10;

import { IETS } from "./interfaces/IETS.sol";
import { IETSToken } from "./interfaces/IETSToken.sol";
import { IETSAccessControls } from "./interfaces/IETSAccessControls.sol";
import { IZoraFactory } from "./interfaces/IZoraFactory.sol";
import { StringHelpers } from "./utils/StringHelpers.sol";
import { ReentrancyGuardUpgradeable } from "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import { PausableUpgradeable } from "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import { UUPSUpgradeable } from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

contract ETSToken is IETSToken, ReentrancyGuardUpgradeable, PausableUpgradeable, UUPSUpgradeable, StringHelpers {
    IETS public ets;
    IETSAccessControls public etsAccessControls;

    // Public constants
    string public constant NAME = "ETS TAG Token";
    string public constant VERSION = "0.0.1";

    // Public variables
    uint256 public tagMinStringLength;
    uint256 public tagMaxStringLength;

    // Zora integration configuration
    address public zoraFactoryAddress; // Zora factory contract address
    address public zoraCreatorEOA; // EOA address that creates Zora coins
    address public zoraPlatformReferrer; // ETS platform referrer address
    bytes public zoraPoolConfig; // Standardized pool configuration

    /// @dev Map of coin address to TAG record.
    mapping(address => Tag) public coinAddressToTag;

    /// @dev Map of machine name hash to coin address for quick lookup.
    mapping(bytes32 => address) public machineNameHashToCoinAddress;

    /// Modifiers
    modifier onlyETSCore() {
        require(_msgSender() == address(ets), "Caller is not ETS core");
        _;
    }

    modifier onlyAdmin() {
        require(etsAccessControls.isAdmin(_msgSender()), "Access denied");
        _;
    }

    modifier onlyRelayer() {
        require(etsAccessControls.isRelayer(_msgSender()), "Caller is not relayer");
        _;
    }

    // TODO: Definitely need to look closer at this claude code. It's wrong
    modifier onlyOracle() {
        require(
            etsAccessControls.isAdmin(_msgSender()) || etsAccessControls.isRelayer(_msgSender()),
            "Caller not authorized for oracle operations"
        );
        _;
    }

    // ============ UUPS INTERFACE ============

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(
        IETSAccessControls _etsAccessControls,
        uint256 _tagMinStringLength,
        uint256 _tagMaxStringLength,
        address _zoraFactoryAddress,
        address _zoraCreatorEOA,
        address _zoraPlatformReferrer,
        bytes memory _zoraPoolConfig
    ) public initializer {
        __ReentrancyGuard_init();
        __Pausable_init();

        // Initialize ETSToken settings using public
        // functions so our subgraph can capture them.
        // To call them requires etsAccessControls being
        // set so we set that manually first.
        etsAccessControls = _etsAccessControls;
        setTagMinStringLength(_tagMinStringLength);
        setTagMaxStringLength(_tagMaxStringLength);

        // Initialize Zora integration settings
        setZoraFactoryAddress(_zoraFactoryAddress);
        setZoraCreatorEOA(_zoraCreatorEOA);
        setZoraPlatformReferrer(_zoraPlatformReferrer);
        setZoraPoolConfig(_zoraPoolConfig);
    }

    // solhint-disable-next-line
    function _authorizeUpgrade(address) internal override onlyAdmin {}

    // ============ OWNER INTERFACE ============

    /**
     * @notice Sets ETS core on the ETSToken contract so functions can be
     * restricted to ETS platform only.
     *
     * @param _ets Address of ETS contract.
     */
    function setETSCore(IETS _ets) public onlyAdmin {
        require(address(_ets) != address(0), "Address cannot be zero");
        ets = _ets;
        emit ETSCoreSet(address(ets));
    }

    /**
     * @notice Sets ETSAccessControls on the ETSToken contract function calls can be
     * restricted to ETS platform only. Note: Caller of this function must be deployer
     * or pre-set as admin of new contract.
     *
     * @param _accessControls Address of ETSAccessControls contract.
     */
    function setAccessControls(IETSAccessControls _accessControls) public onlyAdmin {
        require(address(_accessControls) != address(0), "Address cannot be zero");
        require(_accessControls.isAdmin(_msgSender()), "Caller not admin in new contract");
        etsAccessControls = _accessControls;
        emit AccessControlsSet(address(etsAccessControls));
    }

    /**
     * @notice Pauses ETSToken contract.
     */
    function pause() public onlyAdmin whenNotPaused {
        _pause();
    }

    /**
     * @notice Unpauses ETSToken contract.
     */
    function unPause() public onlyAdmin whenPaused {
        _unpause();
    }

    /// @inheritdoc IETSToken
    function setTagMaxStringLength(uint256 _tagMaxStringLength) public onlyAdmin {
        tagMaxStringLength = _tagMaxStringLength;
        emit TagMaxStringLengthSet(_tagMaxStringLength);
    }

    /// @inheritdoc IETSToken
    function setTagMinStringLength(uint256 _tagMinStringLength) public onlyAdmin {
        tagMinStringLength = _tagMinStringLength;
        emit TagMinStringLengthSet(_tagMinStringLength);
    }

    /**
     * @notice Sets the Zora factory contract address for coin address computation
     * @param _factoryAddress Address of the Zora factory contract (zero address allowed for localhost testing)
     */
    function setZoraFactoryAddress(address _factoryAddress) public onlyAdmin {
        zoraFactoryAddress = _factoryAddress;
        emit ZoraFactoryAddressSet(_factoryAddress);
    }

    /**
     * @notice Sets the EOA address that will create Zora coins
     * @param _eoaAddress EOA address for coin creation
     */
    function setZoraCreatorEOA(address _eoaAddress) public onlyAdmin {
        zoraCreatorEOA = _eoaAddress;
        emit ZoraCreatorEOASet(_eoaAddress);
    }

    /**
     * @notice Sets the platform referrer address for Zora coins
     * @param _referrerAddress Platform referrer address
     */
    function setZoraPlatformReferrer(address _referrerAddress) public onlyAdmin {
        zoraPlatformReferrer = _referrerAddress;
        emit ZoraPlatformReferrerSet(_referrerAddress);
    }

    /**
     * @notice Sets the pool configuration for Zora coins
     * @param _poolConfig Encoded pool configuration bytes
     */
    function setZoraPoolConfig(bytes memory _poolConfig) public onlyAdmin {
        zoraPoolConfig = _poolConfig;
        emit ZoraPoolConfigSet(_poolConfig);
    }

    // ============ PUBLIC INTERFACE ============

    function getOrCreateTag(
        string calldata _tag,
        address payable _relayer,
        address payable _creator
    ) public payable returns (Tag memory tag) {
        address coinAddress = computeCoinAddress(_tag);
        if (!tagExistsByAddress(coinAddress)) {
            coinAddress = createTag(_tag, _relayer, _creator);
        }
        return coinAddressToTag[coinAddress];
    }

    /// @inheritdoc IETSToken
    function getOrCreateTagId(
        string calldata _tag,
        address payable _relayer,
        address payable _creator
    ) public payable returns (address coinAddress) {
        coinAddress = computeCoinAddress(_tag);
        if (!tagExistsByAddress(coinAddress)) {
            coinAddress = createTag(_tag, _relayer, _creator);
        }
        return coinAddress;
    }

    /// @inheritdoc IETSToken
    function createTag(
        string calldata _tag,
        address payable _relayer,
        address payable _creator
    ) public payable nonReentrant onlyETSCore returns (address coinAddress) {
        // Perform basic tag string validation.
        _assertTagIsValid(_tag);

        // Generate three-tier identifiers
        string memory originalInput = _tag;
        string memory machineName = __lower(_tag);
        string memory displayVersion = _formatDisplayVersion(_tag);

        // Compute deterministic coin address
        coinAddress = computeCoinAddress(machineName);

        // Ensure TAG doesn't already exist
        require(coinAddressToTag[coinAddress].coinAddress == address(0), "TAG already exists");

        // Store TAG data in state
        coinAddressToTag[coinAddress] = Tag({
            originalInput: originalInput,
            displayVersion: displayVersion,
            machineName: machineName,
            coinAddress: coinAddress,
            creator: _creator,
            relayer: _relayer,
            timestamp: block.timestamp
        });

        // Quick lookup mapping
        bytes32 machineNameHash = keccak256(bytes(machineName));
        machineNameHashToCoinAddress[machineNameHash] = coinAddress;

        // Emit comprehensive event
        emit TagCreated(coinAddress, originalInput, displayVersion, machineName, _creator, _relayer, block.timestamp);

        return coinAddress;
    }

    // ============ INTERNAL HELPER FUNCTIONS ============

    /**
     * @dev Generate canonical display format from input tag.
     * @param _input Tag string input.
     * @return displayVersion Canonical display format.
     */
    function _formatDisplayVersion(string memory _input) internal pure returns (string memory) {
        // For now, return input as-is. Can be enhanced later with title case logic.
        return _input;
    }

    // ============ PUBLIC VIEW FUNCTIONS ============

    /// @inheritdoc IETSToken
    function computeCoinAddress(string memory _tag) public view returns (address) {
        require(zoraFactoryAddress != address(0), "Zora factory not configured");

        string memory machineName = __lower(_tag);
        bytes32 coinSalt = keccak256(abi.encodePacked(machineName));


        address result = IZoraFactory(zoraFactoryAddress).coinAddress(
                zoraCreatorEOA, // msgSender - EOA that creates coins
                machineName, // name - normalized machine name for consistency
                "ETS", // symbol - standardized for all ETS coins
                zoraPoolConfig, // poolConfig - standardized configuration
                zoraPlatformReferrer, // platformReferrer - ETS platform address
                coinSalt // coinSalt - deterministic from machine name
            );
        
        
        return result;
    }

    /// @inheritdoc IETSToken
    function tagExistsByString(string calldata _tag) public view returns (bool) {
        address coinAddress = computeCoinAddress(_tag);
        return coinAddressToTag[coinAddress].coinAddress != address(0);
    }

    /// @inheritdoc IETSToken
    function tagExistsByAddress(address _coinAddress) public view returns (bool) {
        return coinAddressToTag[_coinAddress].coinAddress != address(0);
    }

    /// @inheritdoc IETSToken
    function getTagByString(string calldata _tag) public view returns (Tag memory) {
        address coinAddress = computeCoinAddress(_tag);
        return coinAddressToTag[coinAddress];
    }

    /// @inheritdoc IETSToken
    function getTagByAddress(address _coinAddress) public view returns (Tag memory) {
        return coinAddressToTag[_coinAddress];
    }

    /// @inheritdoc IETSToken
    function getPlatformAddress() public view returns (address payable) {
        return etsAccessControls.getPlatformAddress();
    }

    // ============ INTERNAL FUNCTIONS ============

    /**
     * @dev Private method used for validating a TAG string before creation.
     *
     * A series of assertions are performed reverting the transaction for any validation violations.
     *
     * @param _tag Proposed tag string.
     */
    function _assertTagIsValid(string memory _tag) private view {
        bytes memory tagStringBytes = bytes(_tag);
        require(
            tagStringBytes.length >= tagMinStringLength && tagStringBytes.length <= tagMaxStringLength,
            "Invalid tag format"
        );

        require(tagStringBytes[0] == 0x23, "Tag must start with #");

        // start from first char after #
        for (uint256 i = 1; i < tagStringBytes.length; i++) {
            bytes1 char = tagStringBytes[i];
            require(char != 0x20, "Spaces in tag");
            require(char != 0x23, "Tag contains prefix");
        }
    }
}
