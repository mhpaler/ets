// SPDX-License-Identifier: MIT

/**
 * @title ETS Channel Version 1
 * @author Ethereum Tag Service <team@ets.xyz>
 *
 *  ███████╗████████╗███████╗
 *  ██╔════╝╚══██╔══╝██╔════╝
 *  █████╗     ██║   ███████╗
 *  ██╔══╝     ██║   ╚════██║
 *  ███████╗   ██║   ███████║
 *  ╚══════╝   ╚═╝   ╚══════╝
 *
 * @notice Version 1 of upgradeable beacon proxy contract pointed to by ETSChannelBeacon.sol
 */

pragma solidity ^0.8.10;


import { IETS } from "../interfaces/IETS.sol";
import { IETSToken } from "../interfaces/IETSToken.sol";
import { IETSTarget } from "../interfaces/IETSTarget.sol";
import { IETSChannel } from "./interfaces/IETSChannel.sol";
import { IETSAccessControls } from "../interfaces/IETSAccessControls.sol";
import { AddressArrayUtils } from "../libraries/AddressArrayUtils.sol";

import { Initializable } from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import { ReentrancyGuardUpgradeable } from "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import { ERC165Upgradeable } from "@openzeppelin/contracts-upgradeable/utils/introspection/ERC165Upgradeable.sol";
import { OwnableUpgradeable } from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import { PausableUpgradeable } from "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";

contract ETSChannel is
    IETSChannel,
    Initializable,
    ERC165Upgradeable,
    OwnableUpgradeable,
    PausableUpgradeable,
    ReentrancyGuardUpgradeable
{
    using AddressArrayUtils for address[];

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
    string public constant VERSION = "0.1.1";
    bytes4 public constant IID_IETSCHANNEL = type(IETSChannel).interfaceId;

    // Public variables

    /// @notice Address that built this smart contract.
    address payable public creator;

    /// @dev Public name for Channel instance.
    string public channelName;

    /// Modifiers
    modifier onlyChannelAdmin() {
        if (!(_msgSender() == owner() || etsAccessControls.hasRole(keccak256("RELAYER_ADMIN_ROLE"), _msgSender()))) {
            revert CallerNotChannelAdmin(_msgSender());
        }
        _;
    }

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
    function pause() public onlyChannelAdmin {
        _pause();
        emit ChannelPauseToggledByOwner(address(this));
    }

    /// @inheritdoc IETSChannel
    function unpause() public onlyChannelAdmin {
        // Check that channel is not paused by platform.
        if (etsAccessControls.isChannelLocked(address(this))) revert UnpausingNotPermitted();
        _unpause();
        emit ChannelPauseToggledByOwner(address(this));
    }

    /// @inheritdoc IETSChannel
    function changeOwner(address _newOwner) public whenPaused onlyOwner {
        // TODO: check that new owner doesn't already have channel?
        etsAccessControls.changeChannelOwner(owner(), _newOwner);
        transferOwnership(_newOwner);
        emit ChannelOwnerChanged(address(this));
    }

    // ============ PUBLIC INTERFACE ============

    /// @inheritdoc IETSChannel
    function applyTags(IETS.TaggingRecordRawInput[] calldata _rawInput) public payable whenNotPaused {
        applyTagsViaChannel(_rawInput, address(this));
    }

    /// @inheritdoc IETSChannel
    function applyTagsViaChannel(
        IETS.TaggingRecordRawInput[] calldata _rawInput,
        address _channel
    ) public payable whenNotPaused {
        uint256 taggingFee = ets.taggingFee();
        for (uint256 i; i < _rawInput.length; ++i) {
            _applyTags(_rawInput[i], payable(msg.sender), _channel, taggingFee);
        }
    }

    /// @inheritdoc IETSChannel
    function replaceTags(IETS.TaggingRecordRawInput[] calldata _rawInput) public payable whenNotPaused {
        replaceTagsViaChannel(_rawInput, address(this));
    }

    /// @inheritdoc IETSChannel
    function replaceTagsViaChannel(
        IETS.TaggingRecordRawInput[] calldata _rawInput,
        address _channel
    ) public payable whenNotPaused {
        uint256 taggingFee = ets.taggingFee();
        for (uint256 i; i < _rawInput.length; ++i) {
            _replaceTags(_rawInput[i], payable(msg.sender), _channel, taggingFee);
        }
    }

    /// @inheritdoc IETSChannel
    function removeTags(IETS.TaggingRecordRawInput[] calldata _rawInput) public payable whenNotPaused {
        removeTagsViaChannel(_rawInput, address(this));
    }

    function removeTagsViaChannel(
        IETS.TaggingRecordRawInput[] calldata _rawInput,
        address _channel
    ) public payable whenNotPaused {
        for (uint256 i; i < _rawInput.length; ++i) {
            _removeTags(_rawInput[i], payable(msg.sender), _channel);
        }
    }

    /// @inheritdoc IETSChannel
    function getOrCreateTagIds(
        string[] calldata _tags
    ) public payable whenNotPaused returns (address[] memory _coinAddresses) {
        // First let's derive coin addresses for the tagStrings.
        address[] memory coinAddresses = new address[](_tags.length);
        for (uint256 i; i < _tags.length; ++i) {
            // for new TAG coins msg.sender is logged as "creator" and this contract is "channel"
            coinAddresses[i] = ets.getOrCreateTagId(_tags[i], payable(msg.sender));
        }
        return coinAddresses;
    }

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

    function getBalance() public view returns (uint) {
        return address(this).balance;
    }

    // ============ INTERNAL FUNCTIONS ============

    function _applyTags(
        IETS.TaggingRecordRawInput calldata _rawInput,
        address payable _tagger,
        address _channel,
        uint256 _taggingFee
    ) internal {
        uint256 valueToSendForTagging = 0;
        if (_taggingFee > 0) {
            // This is either a new tagging record or an existing record that's being appended to.
            // Either way, we need to assess the tagging fees.
            uint256 actualTagCount = 0;
            (valueToSendForTagging, actualTagCount) = ets.computeTaggingFeeFromRawInput(
                _rawInput,
                _channel,
                _tagger,
                IETS.TaggingAction.APPEND
            );
            if (address(this).balance < valueToSendForTagging) revert InsufficientFunds(valueToSendForTagging, address(this).balance);
        }

        // Call the core applyTagsWithRawInput() function to record new or append to exsiting tagging record.
        ets.applyTagsWithRawInput{ value: valueToSendForTagging }(_rawInput, _tagger, _channel);
    }

    function _replaceTags(
        IETS.TaggingRecordRawInput calldata _rawInput,
        address payable _tagger,
        address _channel,
        uint256 _taggingFee
    ) internal {
        uint256 valueToSendForTagging = 0;
        if (_taggingFee > 0) {
            // This is either a new tagging record or an existing record that's being appended to.
            // Either way, we need to assess the tagging fees.
            uint256 actualTagCount = 0;
            (valueToSendForTagging, actualTagCount) = ets.computeTaggingFeeFromRawInput(
                _rawInput,
                _channel,
                _tagger,
                IETS.TaggingAction.REPLACE
            );
            if (address(this).balance < valueToSendForTagging) revert InsufficientFunds(valueToSendForTagging, address(this).balance);
        }

        // Finally, call the core replaceTags() function to update the tagging record.
        ets.replaceTagsWithRawInput{ value: valueToSendForTagging }(_rawInput, _tagger, _channel);
    }

    function _removeTags(
        IETS.TaggingRecordRawInput calldata _rawInput,
        address payable _tagger,
        address _channel
    ) internal {
        ets.removeTagsWithRawInput(_rawInput, _tagger, _channel);
    }

    /* solhint-disable */
    receive() external payable {}

    fallback() external payable {}
    /* solhint-enable */
}
