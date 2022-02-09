// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts v4.4.1 (utils/introspection/IERC1820Registry.sol)

pragma solidity ^0.8.0;

interface IETSTargetType {

    /// @notice Toggle whether tagging operations are paused. Tagging creator can control this
    function toggleTargetTypePaused() external;

    // not sure if you can have a string as an argument?
    function validateTargetURI(string calldata targetURI) external view returns (bool);

    function isTargetTypePaused() external view returns (bool);

    /// @notice Creator of target type contract
    function creator() external returns (address payable);

    event TargetTypePaused(string targetType, bool paused);
}
