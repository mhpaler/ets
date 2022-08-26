// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "../interfaces/IETS.sol";
import "../interfaces/IETSToken.sol";
import "../interfaces/IETSTarget.sol";
import "../interfaces/IETSPublisher.sol";
import { UintArrayUtils } from "../libraries/UintArrayUtils.sol";
import { Strings } from "@openzeppelin/contracts/utils/Strings.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { Pausable } from "@openzeppelin/contracts/security/Pausable.sol";

import "hardhat/console.sol";

/**
 * @title ETSPublisher
 * @author Ethereum Tag Service <team@ets.xyz>
 * @notice Example implementation of IETSPublisher
 */
contract ETSPublisher is IETSPublisher, Ownable, Pausable {
    using UintArrayUtils for uint256[];

    /// @dev Address and interface for ETS Core.
    IETS public ets;

    /// @dev Address and interface for ETS Token
    IETSToken public etsToken;

    /// @dev Address and interface for ETS Target.
    IETSTarget public etsTarget;

    // Public constants

    /// @notice machine name for this Publisher.
    string public constant name = "ETSPublisher";

    // Public variables

    /// @notice Address that built this smart contract.
    address payable public creator;

    constructor(
        IETS _ets,
        IETSToken _etsToken,
        IETSTarget _etsTarget,
        address payable _creator,
        address payable _owner
    ) {
        ets = _ets;
        etsToken = _etsToken;
        etsTarget = _etsTarget;
        creator = _creator;
        transferOwnership(_owner);
    }

    // ============ OWNER INTERFACE ============

    /**
     * @notice Pause this publisher contract.
     * @dev This function can only be called by the owner when the contract is unpaused.
     */
    function pause() public onlyOwner {
        _pause();
    }

    /**
     * @notice Unpause this publisher contract.
     * @dev This function can only be called by the owner when the contract is paused.
     */
    function unpause() public onlyOwner {
        _unpause();
    }

    // ============ PUBLIC INTERFACE ============

    function applyTags(IETS.TaggingRecordRawInput[] calldata _rawParts) public payable whenNotPaused {
        uint256 taggingFee = ets.taggingFee();
        for (uint256 i; i < _rawParts.length; ++i) {
            _applyTags(_rawParts[i], payable(msg.sender), taggingFee);
        }
    }

    function replaceTags(IETS.TaggingRecordRawInput[] calldata _rawParts) public payable whenNotPaused {
        uint256 taggingFee = ets.taggingFee();
        for (uint256 i; i < _rawParts.length; ++i) {
            _replaceTags(_rawParts[i], payable(msg.sender), taggingFee);
        }
    }

    function removeTags(IETS.TaggingRecordRawInput[] calldata _rawParts) public payable whenNotPaused {
        for (uint256 i; i < _rawParts.length; ++i) {
            _removeTags(_rawParts[i], payable(msg.sender));
        }
    }

    function getOrCreateTagIds(string[] calldata _tags)
        public
        payable
        whenNotPaused
        returns (uint256[] memory _tagIds)
    {
        // First let's derive tagIds for the tagStrings.
        uint256[] memory tagIds = new uint256[](_tags.length);
        for (uint256 i; i < _tags.length; ++i) {
            // for new CTAGs msg.sender is logged as "creator" and this contract is "publisher"
            tagIds[i] = ets.getOrCreateTagId(_tags[i], payable(msg.sender));
        }
        return tagIds;
    }

    // ============ PUBLIC VIEW FUNCTIONS ============

    function computeTaggingFee(
        uint256 _taggingRecordId,
        uint256[] calldata _tagIds,
        string calldata _action
    ) public view returns (uint256 fee, uint256 tagCount) {
        return ets.computeTaggingFee(_taggingRecordId, _tagIds, _action);
    }

    function getPublisherName() public pure returns (string memory) {
        return name;
    }

    function getCreator() public view returns (address payable) {
        return creator;
    }

    function getOwner() public view returns (address payable) {
        return payable(owner());
    }

    function supportsInterface(bytes4 interfaceId) public view virtual override returns (bool) {
        return interfaceId == type(IERC165).interfaceId || interfaceId == type(IETSPublisher).interfaceId;
    }

    // ============ INTERNAL FUNCTIONS ============

    function _applyTags(
        IETS.TaggingRecordRawInput calldata _rawParts,
        address payable _tagger,
        uint256 _taggingFee
    ) internal {
        uint256 valueToSendForTagging = 0;
        if (_taggingFee > 0) {
            // This is either a new tagging record or an existing record that's being appended to.
            // Either way, we need to assess the tagging fees.
            uint256 actualTagCount = 0;
            (valueToSendForTagging, actualTagCount) = ets.computeTaggingFeeFromRawInput(
                _rawParts,
                address(this),
                _tagger,
                "apply"
            );
            require(address(this).balance >= valueToSendForTagging, "Not enough funds to complete tagging");
        }

        // Call the core applyTagsWithRawInput() function to record new or append to exsiting tagging record.
        ets.applyTagsWithRawInput{ value: valueToSendForTagging }(_rawParts, _tagger);
    }

    function _replaceTags(
        IETS.TaggingRecordRawInput calldata _rawParts,
        address payable _tagger,
        uint256 _taggingFee
    ) internal {
        uint256 valueToSendForTagging = 0;
        if (_taggingFee > 0) {
            // This is either a new tagging record or an existing record that's being appended to.
            // Either way, we need to assess the tagging fees.
            uint256 actualTagCount = 0;
            (valueToSendForTagging, actualTagCount) = ets.computeTaggingFeeFromRawInput(
                _rawParts,
                address(this),
                _tagger,
                "apply"
            );
            require(address(this).balance >= valueToSendForTagging, "Not enough funds to complete tagging");
        }

        // Finally, call the core replaceTags() function to update the tagging record.
        ets.replaceTagsWithRawInput{ value: valueToSendForTagging }(_rawParts, _tagger);
    }

    function _removeTags(IETS.TaggingRecordRawInput calldata _rawParts, address payable _tagger) internal {
        ets.removeTagsWithRawInput(_rawParts, _tagger);
    }
}
