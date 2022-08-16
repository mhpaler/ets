// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "../interfaces/IETS.sol";
import "../interfaces/IETSToken.sol";
import "../interfaces/IETSTarget.sol";
import "../interfaces/IETSPublisher.sol";
import { Strings } from "@openzeppelin/contracts/utils/Strings.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { Pausable } from "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title ETSPublisher
 * @author Ethereum Tag Service <team@ets.xyz>
 * @notice Sample implementation of IETSPublisher
 */
contract ETSPublisher is IETSPublisher, Ownable, Pausable {
    /// @notice Address and interface for ETS Core.
    IETS public ets;

    /// @notice Address and interface for ETS Token
    IETSToken public etsToken;

    /// @notice Address and interface for ETS Target.
    IETSTarget public etsTarget;

    // Public constants

    /// @notice machine name for this target tagger.
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

    function applyTags(TaggingRecord[] calldata _taggingRecords) public payable whenNotPaused {
        // Pull tagging fee here so wo don't need to recalculate for each tagging reccord.
        uint256 currentTaggingFee = ets.taggingFee();

        for (uint256 i; i < _taggingRecords.length; ++i) {
            _applyTags(_taggingRecords[i], payable(msg.sender), currentTaggingFee);
        }

        // Confirms that all funds sent here are forwarded along.
        assert(address(this).balance == 0);
    }

    function removeTags(TaggingRecord[] calldata _taggingRecords) public payable {
        for (uint256 i; i < _taggingRecords.length; ++i) {
            _removeTags(_taggingRecords[i], payable(msg.sender));
        }
    }

    // TODO
    function replaceTags(TaggingRecord[] calldata _taggingRecords) public payable {}

    // ============ PUBLIC VIEW FUNCTIONS ============

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
        TaggingRecord calldata _taggingRecord,
        address payable _tagger,
        uint256 _currentFee
    ) internal {
        uint256 valueToSendForTagging = (_currentFee * _taggingRecord.tagStrings.length);
        require(address(this).balance >= valueToSendForTagging, "Not enough funds to complete tagging");

        // First let's derive tagIds for the tagStrings.
        uint256[] memory tagIds = new uint256[](_taggingRecord.tagStrings.length);
        for (uint256 i; i < _taggingRecord.tagStrings.length; ++i) {
            // etsToken.createTag() accepts a publisher argument. Here we are giving
            // publisher credit to this Target Tagger contract. Any funds accrued to this contract
            // can be withdrawn by the contract owner.
            uint256 tagId = etsToken.getOrCreateTagId(_taggingRecord.tagStrings[i], _tagger);

            tagIds[i] = tagId;
        }

        // Given targetURIBytes, we can now get the targetId, or create a new one if it doesn't yet exist.
        // ETS Target Ids are a composite of target type name and target URI struct converted to bytes.
        uint256 targetId = etsTarget.getOrCreateTargetId(_taggingRecord.targetURI);

        // Finally, call the core tagTarget() function to record the tagging record.
        ets.applyTags{ value: valueToSendForTagging }(tagIds, targetId, _taggingRecord.recordType, _tagger);
    }

    function _removeTags(TaggingRecord calldata _taggingRecord, address payable _tagger) internal {
        // Derive tagIds for the tagStrings.
        uint256[] memory tagIds = new uint256[](_taggingRecord.tagStrings.length);
        for (uint256 i; i < _taggingRecord.tagStrings.length; ++i) {
            uint256 tagId = etsToken.getOrCreateTagId(_taggingRecord.tagStrings[i], _tagger);
            tagIds[i] = tagId;
        }

        uint256 targetId = etsTarget.getOrCreateTargetId(_taggingRecord.targetURI);

        ets.removeTags(tagIds, targetId, _taggingRecord.recordType, _tagger);
    }
}
