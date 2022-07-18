// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

/// @notice ETS core tagging contract.
interface IETS {
    /**
     * @dev Data structure for a ETS tagging record. This record stores a connection between one
     * or more CTAGs and a Target struct.
     * @param tagIds Ids of CTAG token(s) being used to tag a target.
     * @param targetId Id of target being tagged.
     * @param recordType Identifier for type of tagging record. Defaults to "tag".
     * @param tagger Address of wallet credited with tagging record.
     * @param publisher Address of wallet being credited with enabling tagging record.
     */
    struct TaggingRecord {
        uint256[] tagIds;
        uint256 targetId;
        string recordType;
        address tagger;
        address publisher;
    }

    event AccessControlsSet(address newAccessControls);

    event TaggingFeeSet(uint256 newTaggingFee);

    event PercentagesSet(uint256 platformPercentage, uint256 publisherPercentage, uint256 remainingPercentage);

    event TargetTagged(uint256 taggingRecordId);

    event TaggingRecordUpdated(uint256 taggingRecordId);

    event FundsWithdrawn(address indexed who, uint256 amount);

    /// @notice Tag a target with an one or more tags.
    /// @param _tagIds Tags target is being tagged with, passed in as array of CTAG Token Ids.
    /// @param _targetId Target Id of the target being tagged.
    /// @param _tagger Address of tagger being credited performing tagging record.
    function tagTarget(
        uint256[] calldata _tagIds,
        uint256 _targetId,
        string memory _recordType,
        address payable _tagger
    ) external payable;

    function updateTaggingRecord(uint256 _taggingRecordId, string[] calldata _tags) external payable;

    function drawDown(address payable _account) external;

    function computeTaggingRecordId(
        uint256 _targetId,
        string memory _recordType,
        address _publisher,
        address _tagger
    ) external pure returns (uint256 taggingRecordId);

    function getTaggingRecord(
        uint256 _targetId,
        string memory _recordType,
        address _tagger,
        address _publisher
    )
        external
        view
        returns (
            uint256[] memory etsTagIds,
            uint256 targetId,
            string memory recordType,
            address tagger,
            address publisher
        );

    function getTaggingRecordFromId(uint256 _id)
        external
        view
        returns (
            uint256[] memory etsTagIds,
            uint256 targetId,
            string memory recordType,
            address tagger,
            address publisher
        );

    /// @notice Used to check how much MATIC has been accrued by an address factoring in amount paid out.
    /// @param _account Address of the account being queried.
    /// @return _due Amount of WEI in ETH due to account.
    function totalDue(address _account) external view returns (uint256 _due);

    function taggingFee() external view returns (uint256);
}
