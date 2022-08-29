// SPDX-License-Identifier: MIT

pragma solidity ^0.8.10;

/// @title Minimum interface required for ETS Publisher smart contracts.
interface IETSPublisher {
    /**
     * @dev Emitted when an IETSPublisher contract is paused/unpaused.
     */
    event PublisherPauseToggledByOwner(address addr);

    /**
     * @notice Pause this publisher contract.
     * @dev This function can only be called by the owner when the contract is unpaused.
     */
    function pause() external;

    /**
     * @notice Unpause this publisher contract.
     * @dev This function can only be called by the owner when the contract is paused.
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
