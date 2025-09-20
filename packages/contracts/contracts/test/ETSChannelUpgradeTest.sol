// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import { IETS } from "../interfaces/IETS.sol";
import { IETSToken } from "../interfaces/IETSToken.sol";
import { IETSTarget } from "../interfaces/IETSTarget.sol";
import { IETSChannel } from "../channels/interfaces/IETSChannel.sol";
import { IETSAccessControls } from "../interfaces/IETSAccessControls.sol";
import { UintArrayUtils } from "../libraries/UintArrayUtils.sol";

import { Initializable } from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import { ReentrancyGuardUpgradeable } from "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import { ERC165Upgradeable } from "@openzeppelin/contracts-upgradeable/utils/introspection/ERC165Upgradeable.sol";
import { OwnableUpgradeable } from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import { PausableUpgradeable } from "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";

/**
 * @title ETSChannelUpgradeTest.sol
 * @author Ethereum Tag Service <team@ets.xyz>
 *
 * @notice Test only contract for testing upgrading the implementation contract for the ETSChannel proxy beacon.
 * In the test suite, ETSChannel.sol is replaced with this contract using the update() function in ETSChannelBeacon.
 */
contract ETSChannelUpgradeTest is
    IETSChannel,
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

    /// @dev Address and interface for ETS Access Controls.
    IETSAccessControls public etsAccessControls;

    // Public constants
    string public constant NAME = "ETS Channel";
    string public constant VERSION = "UPGRADE TEST";
    bytes4 public constant IID_IETSCHANNEL = type(IETSChannel).interfaceId;

    // Public variables

    /// @notice Address that built this smart contract.
    address payable public creator;

    /// @dev Public name for Channel instance.
    string public channelName;

    /// Modifiers

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(
        string memory _channelName,
        IETS _ets,
        IETSToken _etsToken,
        IETSTarget _etsTarget,
        IETSAccessControls _etsAccessControls,
        address payable _creator,
        address payable _owner
    ) public initializer {
        __Pausable_init();
        __Ownable_init();
        __ReentrancyGuard_init();
        channelName = _channelName;
        ets = _ets;
        etsToken = _etsToken;
        etsTarget = _etsTarget;
        etsAccessControls = _etsAccessControls;
        creator = _creator;
        transferOwnership(_owner);
    }

    // ============ OWNER INTERFACE ============

    /// @inheritdoc IETSChannel
    function pause() public onlyOwner {
        _pause();
        emit ChannelPauseToggledByOwner(address(this));
    }

    /// @inheritdoc IETSChannel
    function unpause() public onlyOwner {
        _unpause();
        emit ChannelPauseToggledByOwner(address(this));
    }

    /// @inheritdoc IETSChannel
    function changeOwner(address _newOwner) public whenPaused {
        transferOwnership(_newOwner);
        emit ChannelOwnerChanged(address(this));
    }

    // ============ PUBLIC INTERFACE ============

    function applyTags(IETS.TaggingRecordRawInput[] calldata) public payable whenNotPaused {}
    function applyTagsViaChannel(IETS.TaggingRecordRawInput[] calldata, address) public payable whenNotPaused {}
    function replaceTags(IETS.TaggingRecordRawInput[] calldata) public payable whenNotPaused {}
    function replaceTagsViaChannel(IETS.TaggingRecordRawInput[] calldata, address) public payable whenNotPaused {}
    function removeTags(IETS.TaggingRecordRawInput[] calldata) public payable whenNotPaused {}
    function removeTagsViaChannel(IETS.TaggingRecordRawInput[] calldata, address) public payable whenNotPaused {}

    /// @inheritdoc IETSChannel
    function getOrCreateTagIds(
        string[] calldata _tags
    ) public payable whenNotPaused returns (address[] memory _coinAddresses) {}

    // ============ PUBLIC VIEW FUNCTIONS ============

    function version() external view virtual returns (string memory) {
        return VERSION;
    }

    /// @inheritdoc ERC165Upgradeable
    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override(ERC165Upgradeable, IETSChannel) returns (bool) {
        return interfaceId == IID_IETSCHANNEL || super.supportsInterface(interfaceId);
    }

    /// @inheritdoc IETSChannel
    function isPaused() public view virtual returns (bool) {
        return paused();
    }

    /// @inheritdoc IETSChannel
    function getOwner() public view virtual returns (address payable) {
        return payable(owner());
    }

    /// @inheritdoc IETSChannel
    function getChannelName() public view returns (string memory) {
        return channelName;
    }

    /// @inheritdoc IETSChannel
    function getCreator() public view returns (address payable) {
        return creator;
    }

    /// @inheritdoc IETSChannel
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
