// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../interfaces/IETS.sol";
import "../interfaces/IETSToken.sol";
import "../interfaces/IETSTarget.sol";
import "../interfaces/IETSTargetTagger.sol";
import { Strings } from "@openzeppelin/contracts/utils/Strings.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { Pausable } from "@openzeppelin/contracts/security/Pausable.sol";

import "hardhat/console.sol";

/**
 * @title ETSTargetTagger
 * @author Ethereum Tag Service <security@ets.xyz>
 * @notice Sample implementation if IETSTargetTagger
 *
 * To use it, call the public tagTarget() function with an array of TaggingRecord structs
 * and a publisher address.
 *
 * The tagTarget() function will process each TaggingRecord struct as follows:
 *   - Get or create a targetId for the target.
 *   - Get or create tagIds (CTAG token ids) for the tag strings.
 *   - Call the core ETS.tagTarget() with the tagIds and targetId function to write a tagging record to ETS.
 *
 * Note: When ETSTargetTagger (this contract) is utilized for tagging, ETS is credited as the Publisher of any CTAGs
 * minted and as well as the tagging record. To learn more about the role and incentives for Publisher in ETS,
 * please see. todo: link to docs.
 */
contract ETSTargetTagger is IETSTargetTagger, Ownable, Pausable {
    /// @notice Address and interface for ETS Core.
    IETS public ets;

    /// @notice Address and interface for ETS Token
    IETSToken public etsToken;

    /// @notice Address and interface for ETS Target.
    IETSTarget public etsTarget;

    // Public constants

    /// @notice machine name for this target tagger.
    string public constant name = "ETSTargetTagger";

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

    function toggleTargetTaggerPaused() public onlyOwner {
        if (paused()) {
            _unpause();
        } else {
            _pause();
        }

        emit TargetTaggerPaused(paused());
    }

    // ============ PUBLIC INTERFACE ============

    /**
     * @notice public interface provided by ETS allowing any client to tag a target.
     *
     * This tagger permits the tagging of one or more Targets with one or more tags
     * in one transaction.
     *
     * @param _taggingRecords Array of TaggingRecord stucts.
     */
    function tagTarget(TaggingRecord[] calldata _taggingRecords) public payable {
        // Pull tagging fee here so wo don't need to recalculate for each tagging reccord.
        uint256 currentTaggingFee = ets.taggingFee();

        for (uint256 i; i < _taggingRecords.length; ++i) {
            _processTaggingRecord(_taggingRecords[i], payable(msg.sender), currentTaggingFee);
        }

        // Confirms that all funds sent here are forwarded along.
        assert(address(this).balance == 0);
    }

    // ============ PUBLIC VIEW FUNCTIONS ============

    function getTaggerName() public pure returns (string memory) {
        return name;
    }

    function getCreator() public view returns (address payable) {
        return creator;
    }

    function getOwner() public view returns (address payable) {
        return payable(owner());
    }

    /// @inheritdoc IETSTargetTagger
    function isTargetTaggerPaused() public view override returns (bool) {
        return paused();
    }

    function supportsInterface(bytes4 interfaceId) public view virtual override returns (bool) {
        return interfaceId == type(IERC165).interfaceId || interfaceId == type(IETSTargetTagger).interfaceId;
    }

    // ============ INTERNAL FUNCTIONS ============

    function _processTaggingRecord(
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
        ets.tagTarget{ value: valueToSendForTagging }(tagIds, targetId, _taggingRecord.recordType, _tagger);
    }
}
