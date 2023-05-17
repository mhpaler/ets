// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import { IETS } from "../interfaces/IETS.sol";
import { IETSToken } from "../interfaces/IETSToken.sol";
import { IETSTarget } from "../interfaces/IETSTarget.sol";
import { IETSRelayer } from "./interfaces/IETSRelayer.sol";
import { UintArrayUtils } from "../libraries/UintArrayUtils.sol";

import { Initializable } from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import { ReentrancyGuardUpgradeable } from "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import { ERC165Upgradeable } from "@openzeppelin/contracts-upgradeable/utils/introspection/ERC165Upgradeable.sol";
import { OwnableUpgradeable } from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import { PausableUpgradeable } from "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";

contract ETSRelayerV1 is
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
    string public constant VERSION = "0.1-Beta";
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

    /// @inheritdoc IETSRelayer
    function applyTags(IETS.TaggingRecordRawInput[] calldata _rawInput) public payable whenNotPaused {
        uint256 taggingFee = ets.taggingFee();
        for (uint256 i; i < _rawInput.length; ++i) {
            _applyTags(_rawInput[i], payable(msg.sender), taggingFee);
        }
    }

    /// @inheritdoc IETSRelayer
    function replaceTags(IETS.TaggingRecordRawInput[] calldata _rawInput) public payable whenNotPaused {
        uint256 taggingFee = ets.taggingFee();
        for (uint256 i; i < _rawInput.length; ++i) {
            _replaceTags(_rawInput[i], payable(msg.sender), taggingFee);
        }
    }

    /// @inheritdoc IETSRelayer
    function removeTags(IETS.TaggingRecordRawInput[] calldata _rawInput) public payable whenNotPaused {
        for (uint256 i; i < _rawInput.length; ++i) {
            _removeTags(_rawInput[i], payable(msg.sender));
        }
    }

    /// @inheritdoc IETSRelayer
    function getOrCreateTagIds(
        string[] calldata _tags
    ) public payable whenNotPaused returns (uint256[] memory _tagIds) {
        // First let's derive tagIds for the tagStrings.
        uint256[] memory tagIds = new uint256[](_tags.length);
        for (uint256 i; i < _tags.length; ++i) {
            // for new CTAGs msg.sender is logged as "creator" and this contract is "relayer"
            tagIds[i] = ets.getOrCreateTagId(_tags[i], payable(msg.sender));
        }
        return tagIds;
    }

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
    function isPausedByOwner() public view virtual returns (bool) {
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

    function _applyTags(
        IETS.TaggingRecordRawInput calldata _rawInput,
        address payable _tagger,
        uint256 _taggingFee
    ) internal {
        uint256 valueToSendForTagging = 0;
        if (_taggingFee > 0) {
            // This is either a new tagging record or an existing record that's being appended to.
            // Either way, we need to assess the tagging fees.
            uint256 actualTagCount = 0;
            (valueToSendForTagging, actualTagCount) = ets.computeTaggingFeeFromRawInput(
                _rawInput,
                address(this),
                _tagger,
                IETS.TaggingAction.APPEND
            );
            require(address(this).balance >= valueToSendForTagging, "Insufficient funds");
        }

        // Call the core applyTagsWithRawInput() function to record new or append to exsiting tagging record.
        ets.applyTagsWithRawInput{ value: valueToSendForTagging }(_rawInput, _tagger);
    }

    function _replaceTags(
        IETS.TaggingRecordRawInput calldata _rawInput,
        address payable _tagger,
        uint256 _taggingFee
    ) internal {
        uint256 valueToSendForTagging = 0;
        if (_taggingFee > 0) {
            // This is either a new tagging record or an existing record that's being appended to.
            // Either way, we need to assess the tagging fees.
            uint256 actualTagCount = 0;
            (valueToSendForTagging, actualTagCount) = ets.computeTaggingFeeFromRawInput(
                _rawInput,
                address(this),
                _tagger,
                IETS.TaggingAction.REPLACE
            );
            require(address(this).balance >= valueToSendForTagging, "Insufficient funds");
        }

        // Finally, call the core replaceTags() function to update the tagging record.
        ets.replaceTagsWithRawInput{ value: valueToSendForTagging }(_rawInput, _tagger);
    }

    function _removeTags(IETS.TaggingRecordRawInput calldata _rawInput, address payable _tagger) internal {
        ets.removeTagsWithRawInput(_rawInput, _tagger);
    }
}
