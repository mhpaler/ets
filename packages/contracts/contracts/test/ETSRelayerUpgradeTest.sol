// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import { IETS } from "../interfaces/IETS.sol";
import { IETSToken } from "../interfaces/IETSToken.sol";
import { IETSTarget } from "../interfaces/IETSTarget.sol";
import { IETSRelayer } from "../relayers/interfaces/IETSRelayer.sol";
import { UintArrayUtils } from "../libraries/UintArrayUtils.sol";

import { Initializable } from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import { ReentrancyGuardUpgradeable } from "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import { ERC165Upgradeable } from "@openzeppelin/contracts-upgradeable/utils/introspection/ERC165Upgradeable.sol";
import { OwnableUpgradeable } from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import { PausableUpgradeable } from "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";

/**
 * @title ETSRelayerUpgradeTest.sol
 * @author Ethereum Tag Service <team@ets.xyz>
 *
 * @notice Test only contract for testing upgrading the implementation contract for the ETSRelayer proxy beacon.
 * In the test suite, ETSRelayer.sol is replaced with this contract using the update() function in ETSRelayerBeacon.
 */
contract ETSRelayerUpgradeTest is
    IETSRelayer,
    Initializable,
    ERC165Upgradeable,
    OwnableUpgradeable,
    PausableUpgradeable,
    ReentrancyGuardUpgradeable
{
    using UintArrayUtils for uint256[];

    /// @dev Address and interface for ETS Core.
    IETS public ets;

    /// @dev Address and interface for ETS Token
    IETSToken public etsToken;

    /// @dev Address and interface for ETS Target.
    IETSTarget public etsTarget;

    // Public constants
    string public constant NAME = "ETS Relayer";
    string public constant VERSION = "UPGRADE TEST";
    bytes4 public constant IID_IETSRELAYER = type(IETSRelayer).interfaceId;

    // Public variables

    /// @notice Address that built this smart contract.
    address payable public creator;

    /// @dev Public name for Relayer instance.
    string public relayerName;

    /// Modifiers

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(
        string memory _relayerName,
        IETS _ets,
        IETSToken _etsToken,
        IETSTarget _etsTarget,
        address payable _creator,
        address payable _owner
    ) public initializer {
        __Pausable_init();
        __Ownable_init();
        __ReentrancyGuard_init();
        relayerName = _relayerName;
        ets = _ets;
        etsToken = _etsToken;
        etsTarget = _etsTarget;
        creator = _creator;
        transferOwnership(_owner);
    }

    // ============ OWNER INTERFACE ============

    /// @inheritdoc IETSRelayer
    function pause() public onlyOwner {
        _pause();
        emit RelayerPauseToggledByOwner(address(this));
    }

    /// @inheritdoc IETSRelayer
    function unpause() public onlyOwner {
        _unpause();
        emit RelayerPauseToggledByOwner(address(this));
    }

    /// @inheritdoc IETSRelayer
    function changeOwner(address _newOwner) public whenPaused {
        transferOwnership(_newOwner);
        emit RelayerOwnerChanged(address(this));
    }

    // ============ PUBLIC INTERFACE ============

    function applyTags(IETS.TaggingRecordRawInput[] calldata) public payable whenNotPaused {}
    function applyTagsViaRelayer(IETS.TaggingRecordRawInput[] calldata, address) public payable whenNotPaused {}
    function replaceTags(IETS.TaggingRecordRawInput[] calldata) public payable whenNotPaused {}
    function replaceTagsViaRelayer(IETS.TaggingRecordRawInput[] calldata, address) public payable whenNotPaused {}
    function removeTags(IETS.TaggingRecordRawInput[] calldata) public payable whenNotPaused {}
    function removeTagsViaRelayer(IETS.TaggingRecordRawInput[] calldata, address) public payable whenNotPaused {}

    /// @inheritdoc IETSRelayer
    function getOrCreateTagIds(
        string[] calldata _tags
    ) public payable whenNotPaused returns (uint256[] memory _tagIds) {}

    // ============ PUBLIC VIEW FUNCTIONS ============

    function version() external view virtual returns (string memory) {
        return VERSION;
    }

    /// @inheritdoc ERC165Upgradeable
    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override(ERC165Upgradeable, IETSRelayer) returns (bool) {
        return interfaceId == IID_IETSRELAYER || super.supportsInterface(interfaceId);
    }

    /// @inheritdoc IETSRelayer
    function isPaused() public view virtual returns (bool) {
        return paused();
    }

    /// @inheritdoc IETSRelayer
    function getOwner() public view virtual returns (address payable) {
        return payable(owner());
    }

    /// @inheritdoc IETSRelayer
    function getRelayerName() public view returns (string memory) {
        return relayerName;
    }

    /// @inheritdoc IETSRelayer
    function getCreator() public view returns (address payable) {
        return creator;
    }

    /// @inheritdoc IETSRelayer
    function computeTaggingFee(
        IETS.TaggingRecordRawInput calldata _rawInput,
        IETS.TaggingAction _action
    ) public view returns (uint256 fee, uint256 tagCount) {
        return ets.computeTaggingFeeFromRawInput(_rawInput, address(this), msg.sender, _action);
    }

    // ============ INTERNAL FUNCTIONS ============

    function newFunction() public view virtual returns (bool) {
        return true;
    }
}
