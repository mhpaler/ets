// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "./IETSPublisher.sol";
import "../../interfaces/IETS.sol";

/**
 * @title IETSPublisherV1
 * @author Ethereum Tag Service <team@ets.xyz>
 *
 * @notice This is the interface for the IETSPublisherV1 contract.
 */
interface IETSPublisherV1 is IETSPublisher {
    function applyTags(IETS.TaggingRecordRawInput[] calldata _rawParts) external payable;

    function replaceTags(IETS.TaggingRecordRawInput[] calldata _rawParts) external payable;

    function removeTags(IETS.TaggingRecordRawInput[] calldata _rawParts) external payable;

    function getOrCreateTagIds(string[] calldata _tags) external payable returns (uint256[] memory _tagIds);
}
