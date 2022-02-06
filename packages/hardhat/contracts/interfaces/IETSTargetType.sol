// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts v4.4.1 (utils/introspection/IERC1820Registry.sol)

pragma solidity ^0.8.0;

interface IETSTargetType {

    /// @notice Toggle whether tagging operations are paused
    function toggleTargetTypePaused() external;
    // todo - another option around this may be to actually control tagging in the core as leaving it to target type contract may not be relieable

    // todo - cant remember what below does - ask about it
    // not sure if you can have a string as an argument?
    function validateTargetURI(string calldata targetURI) external view returns (bool);

    function isTargetTypePaused() external view returns (bool);

    event TargetTypePaused(string targetType, bool paused);

}
