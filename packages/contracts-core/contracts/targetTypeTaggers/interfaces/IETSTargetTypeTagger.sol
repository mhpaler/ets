// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/interfaces/IERC165.sol";

/// @title Minimum interface required for all target type tagging smart contracts
interface IETSTargetTypeTagger is IERC165 {
    event TargetTypePaused(string targetType, bool paused);

    function isTargetTypePaused() external view returns (bool);

    /// @notice Address of target type smart contract creator. Must not be address(0)
    function creator() external returns (address payable);

    /// @notice Human readable name for the target type
    function name() external pure returns (string memory);

    /// @notice Version of the target type contract
    function version() external pure returns (string memory);
}
