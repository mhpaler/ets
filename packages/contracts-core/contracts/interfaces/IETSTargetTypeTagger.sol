// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/interfaces/IERC165.sol";

/// @title Minimum interface required for all target type tagging smart contracts.
interface IETSTargetTypeTagger is IERC165 {
    /**
     * @dev Emitted when an IETSTargetTypeTagger contract is paused/unpaused.
     */
    event TargetTypeTaggerPaused(bool newValue);

    /**
     * @notice Toggles the paused/unpaused state of a IETSTargetTypeTagger contract.
     */
    function toggleTargetTypeTaggerPaused() external;

    /**
     * @notice Returns target type this Target Type Tagger can be used for.
     * Return value exist in ETSTarget.targetTypes mapping.
     */
    function getTargetType() external view returns (string memory);

    /**
     * @notice Returns human readable name for this IETSTargetTypeTagger contract.
     */
    function getName() external pure returns (string memory);

    /**
     * @notice Returns address of an IETSTargetTypeTagger contract creator.
     */
    function getCreator() external pure returns (address payable);

    /**
     * @notice Returns true if Target Type Tagger is paused; false if not paused.
     */
    function isTargetTypeTaggerPaused() external view returns (bool);
}
