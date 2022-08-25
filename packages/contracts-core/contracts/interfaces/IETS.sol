// SPDX-License-Identifier: MIT

pragma solidity ^0.8.10;

/**
 * @title ETS
 * @author Ethereum Tag Service <team@ets.xyz>
 *
 * @notice This is the interface for the ETS.sol core contract that records ETS TaggingRecords to the blockchain.
 */
interface IETS {
    /**
     * @notice Data structure for raw client input data.
     *
     * @param targetURI Unique resource identifier string, eg. "https://google.com"
     * @param tagStrings Array of hashtag strings, eg. ["#Love, "#Blue"]
     * @param recordType Arbitrary identifier for type of tagging record, eg. "Bookmark"
     */
    struct TaggingRecordRawInput {
        string targetURI;
        string[] tagStrings;
        string recordType;
    }

    /**
     * @notice Data structure for an Ethereum Tag Service "tagging record".
     *
     * The TaggingRecord is the fundamental data structure of ETS and reflects "who tagged what, where and why".
     *
     * Every Tagging record has a unique Id computed from the hashed composite of targetId, recordType, tagger and
     * publisher addresses cast as a uint256. see computeTaggingRecordId()
     *
     * Given this design, a tagger who tags the same URI with the same tags and recordType via two different publishers
     * would produce two TaggingRecords in ETS.
     *
     * @param tagIds Ids of CTAG token(s).
     * @param targetId Id of target being tagged.
     * @param recordType Arbitrary identifier for type of tagging record.
     * @param publisher Address of IETSTargetTagger contract that wrote tagging record.
     * @param tagger Address of wallet that initiated tagging record via publisher.
     */
    struct TaggingRecord {
        uint256[] tagIds;
        uint256 targetId;
        string recordType;
        address publisher;
        address tagger;
    }

    /**
     * @dev emitted when the ETS Access Controls is set.
     *
     * @param newAccessControls contract address access controls is set to.
     */
    event AccessControlsSet(address newAccessControls);

    /**
     * @dev emitted when ETS tagging fee is set.
     *
     * @param newTaggingFee new tagging fee.
     */
    event TaggingFeeSet(uint256 newTaggingFee);

    /**
     * @dev emitted when participant distribution percentages are set.
     *
     * @param platformPercentage percentage of tagging fee allocated to ETS.
     * @param publisherPercentage percentage of tagging fee allocated to publisher of record for CTAG being used in tagging record.
     */
    event PercentagesSet(uint256 platformPercentage, uint256 publisherPercentage);

    /**
     * @dev emitted when a new tagging record is recorded within ETS.
     *
     * @param taggingRecordId Unique identifier of tagging record.
     */
    event TaggingRecordCreated(uint256 taggingRecordId);

    /**
     * @dev emitted when a tagging record is updated.
     *
     * @param taggingRecordId tagging record being updated.
     * @param updateType String describing update type: "append or "removed".
     */
    event TaggingRecordUpdated(uint256 taggingRecordId, string updateType);

    /**
     * @dev emitted when ETS participant draws down funds accrued to their contract or wallet.
     *
     * @param who contract or wallet address being drawn down.
     * @param amount amount being drawn down.
     */
    event FundsWithdrawn(address indexed who, uint256 amount);

    /**
     * @notice Get or create CTAG token from tag string.
     *
     * Combo function that accepts a tag string and returns corresponding CTAG token Id if it exists,
     * or if it doesn't exist, creates a new CTAG and then returns corresponding Id.
     *
     * Only ETS Publisher contracts may call this function.
     *
     * @param _tag Tag string.
     * @param _creator Address credited with creating CTAG.
     * @return tokenId Id of CTAG token.
     */
    function getOrCreateTagId(string calldata _tag, address payable _creator)
        external
        payable
        returns (uint256 tokenId);

    /**
     * @notice Create CTAG token from tag string.
     *
     * Reverts if tag exists or is invalid.
     *
     * Only ETS Publisher contracts may call this function.
     *
     * @param _tag Tag string.
     * @param _creator Address credited with creating CTAG.
     * @return tokenId Id of CTAG token.
     */
    function createTag(string calldata _tag, address payable _creator) external payable returns (uint256 tokenId);

    /**
     * @notice Apply one or more tags to a targetURI using tagging record raw client input data.
     *
     * Like it's sister function applyTagsWithCompositeKey, records new ETS Tagging Record or appends tags to an
     * existing record if found to already exist. This function differs in that it creates new ETS target records
     * and CTAG tokens for novel targetURIs and hastag strings respectively. This function can only be called by
     * Publisher contracts.
     *
     * @param _rawInput Raw client input data formed as TaggingRecordRawInput struct.
     * @param _tagger Address that calls Publisher to tag a targetURI.
     */
    function applyTagsWithRawInput(TaggingRecordRawInput calldata _rawInput, address payable _tagger) external payable;

    /**
     * @notice Apply one or more tags to a targetId using using tagging record composite key.
     *
     * Records new ETS Tagging Record to the blockchain or appends tags if Tagging Record already exists. This function
     * can only be called by Publisher contracts.
     *
     * @param _tagIds Array of CTAG token Ids.
     * @param _targetId targetId of the URI being tagged. See ETSTarget.sol
     * @param _recordType Arbitrary identifier for type of tagging record.
     * @param _tagger Address of that calls IETSTargetTagger to create tagging record.
     */
    function applyTagsWithCompositeKey(
        uint256[] calldata _tagIds,
        uint256 _targetId,
        string memory _recordType,
        address payable _tagger
    ) external payable;

    /**
     * @notice Append one or more tags to a tagging record.
     *
     * @param _taggingRecordId tagging record being updated.
     * @param _tagIds Array of CTAG token Ids.
     */
    function appendTags(uint256 _taggingRecordId, uint256[] calldata _tagIds) external payable;

    /**
     * @notice Remove one or more tags from a tagging record using raw data for record lookup.
     *
     * @param _rawInput Raw client input data formed as TaggingRecordRawInput struct.
     * @param _tagger Address that calls Publisher to tag a targetURI.
     */
    function removeTagsWithRawInput(TaggingRecordRawInput calldata _rawInput, address _tagger) external;

    /**
     * @notice Remove one or more tags from a tagging record using composite key for record lookup.
     *
     * @param _tagIds Array of CTAG token Ids.
     * @param _targetId targetId of the URI being tagged. See ETSTarget.sol
     * @param _recordType Arbitrary identifier for type of tagging record.
     * @param _tagger Address of that calls IETSTargetTagger to create tagging record.
     */
    function removeTagsWithCompositeKey(
        uint256[] calldata _tagIds,
        uint256 _targetId,
        string memory _recordType,
        address payable _tagger
    ) external;

    /**
     * @notice Remove one or more tags from a tagging record.
     *
     * @param _taggingRecordId tagging record being updated.
     * @param _tagIds Array of CTAG token Ids.
     */
    function removeTags(uint256 _taggingRecordId, uint256[] calldata _tagIds) external;

    /**
     * @notice Replace entire tag set in tagging record using raw data for record lookup.
     *
     * @param _rawInput Raw client input data formed as TaggingRecordRawInput struct.
     * @param _tagger Address that calls Publisher to tag a targetURI.
     */
    function replaceTagsWithRawInput(TaggingRecordRawInput calldata _rawInput, address payable _tagger)
        external
        payable;

    /**
     * @notice Replace entire tag set in tagging record using composite key for record lookup.
     *
     * This function overwrites the tags in a tagging record with the supplied tags, only
     * charging for the new tags in the replacement set.
     *
     * @param _tagIds Array of CTAG token Ids.
     * @param _targetId targetId of the URI being tagged. See ETSTarget.sol
     * @param _recordType Arbitrary identifier for type of tagging record.
     * @param _tagger Address of that calls IETSTargetTagger to create tagging record.
     */
    function replaceTagsWithCompositeKey(
        uint256[] calldata _tagIds,
        uint256 _targetId,
        string memory _recordType,
        address payable _tagger
    ) external payable;

    /**
     * @notice Replaces tags in tagging record.
     *
     * This function overwrites the tags in a tagging record with the supplied tags, only
     * charging for the new tags in the replacement set.
     *
     * @param _taggingRecordId tagging record being updated.
     * @param _tagIds Array of CTAG token Ids.
     */
    function replaceTags(uint256 _taggingRecordId, uint256[] calldata _tagIds) external payable;

    /**
     * @notice Function for withdrawing funds from an accrual account. Can be called by the account owner
     * or on behalf of the account. Does nothing when there is nothing due to the account.
     *
     * @param _account Address of account being drawn down and which will receive the funds.
     */
    function drawDown(address payable _account) external;

    /**
     * @notice Compute & return a taggingRecordId from raw input.
     *
     * @param _rawInput Raw client input data formed as TaggingRecordRawInput struct.
     * @param _publisher Address of IETSTargetTagger contract that wrote tagging record.
     * @param _tagger Address of wallet that initiated tagging record via publisher.
     * @return taggingRecordId Unique identifier for a tagging record.
     */
    function computeTaggingRecordIdFromRawInput(
        TaggingRecordRawInput calldata _rawInput,
        address _publisher,
        address _tagger
    ) external view returns (uint256 taggingRecordId);

    /**
     * @notice Compute & return a taggingRecordId.
     *
     * Every TaggingRecord in ETS is mapped to by it's taggingRecordId. This Id is a composite key
     * composed of targetId, recordType, publisher contract address and tagger address hashed and cast as a uint256.
     *
     * @param _targetId Id of target being tagged.
     * @param _recordType Arbitrary identifier for type of tagging record.
     * @param _publisher Address of IETSTargetTagger contract that wrote tagging record.
     * @param _tagger Address of wallet that initiated tagging record via publisher.
     * @return taggingRecordId Unique identifier for a tagging record.
     */
    function computeTaggingRecordIdFromCompositeKey(
        uint256 _targetId,
        string memory _recordType,
        address _publisher,
        address _tagger
    ) external pure returns (uint256 taggingRecordId);

    function computeTaggingFeeFromRawInput(
        TaggingRecordRawInput memory _rawInput,
        address _publisher,
        address _tagger,
        string calldata _action
    ) external view returns (uint256 fee, uint256 tagCount);

    function computeTaggingFeeFromCompositeKey(
        uint256[] memory _tagIds,
        uint256 _targetId,
        string calldata _recordType,
        address _publisher,
        address _tagger,
        string calldata _action
    ) external view returns (uint256 fee, uint256 tagCount);

    function computeTaggingFee(
        uint256 _taggingRecordId,
        uint256[] memory _tagIds,
        string calldata _action
    ) external view returns (uint256 fee, uint256 tagCount);

    function getTaggingRecordFromRawInput(
        TaggingRecordRawInput memory _rawInput,
        address _publisher,
        address _tagger
    )
        external
        view
        returns (
            uint256[] memory tagIds,
            uint256 targetId,
            string memory recordType,
            address publisher,
            address tagger
        );

    /**
     * @notice Retrieves a tagging record from it's taggingRecordId.
     *
     * @param _id taggingRecordId.
     *
     * @return tagIds CTAG token ids used to tag targetId.
     * @return targetId ETS Id of URI that was tagged.
     * @return recordType Type of tagging record.
     * @return publisher Address of IETSTargetTagger contract that wrote tagging record.
     * @return tagger Address of wallet that initiated tagging record via publisher.
     */
    function getTaggingRecordFromId(uint256 _id)
        external
        view
        returns (
            uint256[] memory tagIds,
            uint256 targetId,
            string memory recordType,
            address publisher,
            address tagger
        );

    /**
     * @notice Retrieves a tagging record the composite keys that make up it's taggingRecordId.
     *
     * @param _targetId Id of target being tagged.
     * @param _recordType Arbitrary identifier for type of tagging record.
     * @param _publisher Address of IETSTargetTagger contract that wrote tagging record.
     * @param _tagger Address of wallet that initiated tagging record via publisher.
     *
     * @return tagIds CTAG token ids used to tag targetId.
     * @return targetId ETS Id of URI that was tagged.
     * @return recordType Type of tagging record.
     * @return publisher Address of IETSTargetTagger contract that wrote tagging record.
     * @return tagger Address of wallet that initiated tagging record via publisher.
     */
    function getTaggingRecordFromCompositeKey(
        uint256 _targetId,
        string memory _recordType,
        address _publisher,
        address _tagger
    )
        external
        view
        returns (
            uint256[] memory tagIds,
            uint256 targetId,
            string memory recordType,
            address publisher,
            address tagger
        );

    /**
     * @notice Check that a tagging record exists by componsite key parts.
     */
    function taggingRecordExists(
        uint256 _targetId,
        string memory _recordType,
        address _publisher,
        address _tagger
    ) external view returns (bool);

    /**
     * @notice Check that a tagging record exsits by it's Id.
     */
    function taggingRecordExistsById(uint256 _taggingRecordId) external view returns (bool);

    /**
     * @notice Function to check how much MATIC has been accrued by an address factoring in amount paid out.
     *
     * @param _account Address of the account being queried.
     * @return _due Amount of WEI in MATIC due to account.
     */
    function totalDue(address _account) external view returns (uint256 _due);

    /**
     * @notice Function to retrieve the ETS platform tagging fee.
     *
     * @return tagging fee.
     */
    function taggingFee() external view returns (uint256);
}
