// SPDX-License-Identifier: MIT

pragma solidity ^0.8.10;

import "@openzeppelin/contracts/interfaces/IERC165.sol";

/// @title Minimum interface required for ETS Publisher smart contracts.
interface IETSPublisher is IERC165 {
    /**
     * @notice Data structure to pass into the tagging functions
     *
     * @param targetURI Target being tagged. Please see docs for more about targets.
     * @param tagStrings Array of strings to tag the target with.
     * @param enrich Boolean whether to ensure the target using ETS Enrich API.
     */
    struct TaggingRecord {
        string targetURI;
        string[] tagStrings;
        string recordType;
        bool enrich;
    }

    /**
     * @dev Emitted when an IETSPublisher contract is paused/unpaused.
     */
    event PublisherPaused(bool newValue);

    function applyTags(TaggingRecord[] calldata _taggingRecords) external payable;

    function removeTags(TaggingRecord[] calldata _taggingRecords) external payable;

    function replaceTags(TaggingRecord[] calldata _taggingRecords) external payable;

    /**
     * @notice Pauses IETSPublisher contract.
     */
    function pause() external;

    /**
     * @notice Unpauses IETSPublisher contract.
     */
    function unpause() external;

    /**
     * @notice Returns human readable name for this IETSPublisher contract.
     */
    function getPublisherName() external pure returns (string memory);

    /**
     * @notice Returns address of an IETSPublisher contract creator.
     */
    function getCreator() external view returns (address payable);

    /**
     * @notice Returns address of an IETSPublisher contract owner.
     */
    function getOwner() external view returns (address payable);
}
