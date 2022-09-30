// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "./IETSPublisher.sol";
import "../../interfaces/IETS.sol";

/**
 * @title IETSPublisherV1
 * @author Ethereum Tag Service <team@ets.xyz>
 *
 * @notice Interface for the IETSPublisherV1 contract.
 */
interface IETSPublisherV1 is IETSPublisher {

    /**
     * @notice Apply one or more tags to a targetURI using tagging record raw client input data.
     *
     * @param _rawInput Raw client input data formed as TaggingRecordRawInput struct.
     */
    function applyTags(IETS.TaggingRecordRawInput[] calldata _rawInput) external payable;

    /**
     * @notice Replace entire tag set in tagging record using raw data for record lookup.
     *
     * If supplied tag strings don't have CTAGs, new ones are minted.
     *
     * @param _rawInput Raw client input data formed as TaggingRecordRawInput struct.
     */
    function replaceTags(IETS.TaggingRecordRawInput[] calldata _rawInput) external payable;

    /**
     * @notice Remove one or more tags from a tagging record using raw data for record lookup.
     *
     * @param _rawInput Raw client input data formed as TaggingRecordRawInput struct.
     */
    function removeTags(IETS.TaggingRecordRawInput[] calldata _rawInput) external payable;

    /**
     * @notice Get or create CTAG tokens from tag strings.
     *
     * Combo function that accepts a tag strings and returns corresponding CTAG token Id if it exists,
     * or if it doesn't exist, creates a new CTAG and then returns corresponding Id.
     *
     * Only ETS Publisher contracts may call this function.
     *
     * @param _tags Array of tag strings.
     * @return _tagIds Array of Id of CTAG Ids.
     */
    function getOrCreateTagIds(string[] calldata _tags) external payable returns (uint256[] memory _tagIds);

    /**
     * @notice Compute tagging fee for raw input and desired action.
     *
     * @param _rawInput Raw client input data formed as TaggingRecordRawInput struct.
     * @param _action Integer representing action to be performed according to enum TaggingAction.
     *
     * @return fee Calculated tagging fee in ETH/Matic
     * @return tagCount Number of new tags being added to tagging record.
     */
    function computeTaggingFee(
        IETS.TaggingRecordRawInput calldata _rawInput,
        IETS.TaggingAction _action
    ) external view returns (uint256 fee, uint256 tagCount);
}
