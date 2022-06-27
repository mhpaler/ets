// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

/// @notice ETS core tagging contract.
interface IETS {
    /**
     * @dev Data structure for a ETS tagging record. This record stores a connection between one
     * or more CTAGs and a Target struct.
     * @param tagIds Ids of CTAG token(s) being used to tag a target.
     * @param targetId Id of target being tagged.
     * @param tagger Address of wallet credited with tagging record.
     * @param publisher Address of wallet being credited with enabling tagging record.
     */
    struct TaggingRecord {
        uint256[] tagIds;
        uint256 targetId;
        address tagger;
        address publisher;
    }

    event TaggingFeeSet(uint256 previousFee, uint256 taggingFee);

    event AccessControlsSet(address previousAccessControls, address newAccessControls);

    event ETSEnsureSet(address previousETSEnsure, address newETSEnsure);

    event PercentagesSet(uint256 platformPercentage, uint256 publisherPercentage, uint256 remainingPercentage);

    event TargetTagged(uint256 taggingRecordId);

    event TaggingRecordUpdated(uint256 taggingRecordId);

    event FundsWithdrawn(address indexed who, uint256 amount);

    event RequestEnsureTarget(uint256 targetId);

    /// @notice Tag a target with an one or more tags.
    /// @param _tagIds Tags target is being tagged with, passed in as array of CTAG Token Ids.
    /// @param _targetId Target Id of the target being tagged.
    /// @param _publisher Address of publisher enabling the tagging record.
    /// @param _tagger Address of tagger being credited performing tagging record.
    /// @param _enrich Boolean flag, set true to enrich the target at time of tagging.
    function tagTarget(
        uint256[] calldata _tagIds,
        uint256 _targetId,
        address payable _publisher,
        address _tagger,
        bool _enrich
    ) external payable;

    function updateTaggingRecord(uint256 _taggingRecordId, string[] calldata _tags) external payable;

    function drawDown(address payable _account) external;

    function taggingFee() external view returns (uint256);

    function computeTaggingRecordId(
        uint256 _targetId,
        address _publisher,
        address _tagger
    ) external pure returns (uint256 taggingRecordId);

    function getTaggingRecord(
        uint256 _targetId,
        address _tagger,
        address _publisher
    )
        external
        view
        returns (
            uint256[] memory etsTagIds,
            uint256 targetId,
            address tagger,
            address publisher
        );

    function getTaggingRecordFromId(uint256 _id)
        external
        view
        returns (
            uint256[] memory etsTagIds,
            uint256 targetId,
            address tagger,
            address publisher
        );
}
