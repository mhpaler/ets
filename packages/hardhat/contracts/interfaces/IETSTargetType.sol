// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/interfaces/IERC165.sol";

/// @title Minimum interface required for all target type tagging smart contracts
interface IETSTargetType is IERC165 {
    // ------
    // Events
    // -------
    event TargetTypePaused(string targetType, bool paused);

    // ------
    // Methods
    // -------

    /// @notice Allow a target type to validate a URI
    function validateTargetURI(string calldata targetURI) external view returns (bool);

    /// @notice Query if the target type has been paused
    function isTargetTypePaused() external view returns (bool);

    /// @notice Address of target type smart contract creator. Must not be address(0)
    function creator() external returns (address payable);
}
