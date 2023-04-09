// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "../interfaces/IETS.sol";
import "../interfaces/IETSToken.sol";
import "../interfaces/IETSTarget.sol";
import "./interfaces/IETSRelayerV1.sol";
import { UintArrayUtils } from "../libraries/UintArrayUtils.sol";
import { ERC165 } from "@openzeppelin/contracts/utils/introspection/ERC165.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { Pausable } from "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title ETSRelayerV1
 * @author Ethereum Tag Service <team@ets.xyz>
 * @notice Sample implementation of IETSRelayer
 */
contract ETSRelayerV1 is IETSRelayerV1, ERC165, Ownable, Pausable {
    using UintArrayUtils for uint256[];

    /// @dev Address and interface for ETS Core.
    IETS public ets;

    /// @dev Address and interface for ETS Token
    IETSToken public etsToken;

    /// @dev Address and interface for ETS Target.
    IETSTarget public etsTarget;

    // Public constants
    string public constant NAME = "ETS Relayer V1";
    bytes4 public constant IID_IETSRelayer = type(IETSRelayer).interfaceId;

    // Public variables

    /// @notice Address that built this smart contract.
    address payable public creator;

    /// @dev Public name for Relayer instance.
    string public relayerName;

    constructor(
        string memory _relayerName,
        IETS _ets,
        IETSToken _etsToken,
        IETSTarget _etsTarget,
        address payable _creator,
        address payable _owner
    ) {
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

    /// @inheritdoc IETSRelayerV1
    function applyTags(IETS.TaggingRecordRawInput[] calldata _rawInput) public payable whenNotPaused {
        uint256 taggingFee = ets.taggingFee();
        for (uint256 i; i < _rawInput.length; ++i) {
            _applyTags(_rawInput[i], payable(msg.sender), taggingFee);
        }
    }

    /// @inheritdoc IETSRelayerV1
    function replaceTags(IETS.TaggingRecordRawInput[] calldata _rawInput) public payable whenNotPaused {
        uint256 taggingFee = ets.taggingFee();
        for (uint256 i; i < _rawInput.length; ++i) {
            _replaceTags(_rawInput[i], payable(msg.sender), taggingFee);
        }
    }

    /// @inheritdoc IETSRelayerV1
    function removeTags(IETS.TaggingRecordRawInput[] calldata _rawInput) public payable whenNotPaused {
        for (uint256 i; i < _rawInput.length; ++i) {
            _removeTags(_rawInput[i], payable(msg.sender));
        }
    }

    /// @inheritdoc IETSRelayerV1
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

    /// @inheritdoc ERC165
    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC165, IETSRelayer) returns (bool) {
        return interfaceId == IID_IETSRelayer || super.supportsInterface(interfaceId);
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

    /// @inheritdoc IETSRelayerV1
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
            require(address(this).balance >= valueToSendForTagging, "Not enough funds to complete tagging");
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
            require(address(this).balance >= valueToSendForTagging, "Not enough funds to complete tagging");
        }

        // Finally, call the core replaceTags() function to update the tagging record.
        ets.replaceTagsWithRawInput{ value: valueToSendForTagging }(_rawInput, _tagger);
    }

    function _removeTags(IETS.TaggingRecordRawInput calldata _rawInput, address payable _tagger) internal {
        ets.removeTagsWithRawInput(_rawInput, _tagger);
    }
}
