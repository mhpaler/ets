// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/interfaces/IERC165.sol";

/// @title Minimum interface required for all target type tagging smart contracts.
interface IETSTargetTagger is IERC165 {
    /**
     * @dev Emitted when an IETSTargetTypeTagger contract is paused/unpaused.
     */
    event TargetTaggerPaused(bool newValue);

    /**
     * @notice Toggles the paused/unpaused state of a IETSTargetTypeTagger contract.
     */
    function toggleTargetTaggerPaused() external;

    /**
     * @notice Returns human readable name for this IETSTargetTagger contract.
     */
    function getTaggerName() external pure returns (string memory);

    /**
     * @notice Returns address of an IETSTargetTagger contract creator.
     */
    function getCreator() external view returns (address payable);

    /**
     * @notice Returns address of an IETSTargetTagger contract owner.
     */
    function getOwner() external view returns (address payable);

    /**
     * @notice Returns true if Target Type Tagger is paused; false if not paused.
     */
    function isTargetTaggerPaused() external view returns (bool);
}
