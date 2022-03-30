// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

/// @notice ETS core interface exposing ability for external contracts to integrate as tagging subcontracts
interface IETS {
    //todo- one pattern I have seen is to have events in interfaces and potentially even structs. need to check if this is official or not

    /// @notice Tag a target with an tag string.
    /// TODO: Finish documenting.
    function tagTarget(
        string[] calldata _tagStrings,
        string calldata _targetURI,
        address payable _publisher,
        address _tagger,
        address _sponsor,
        bool _ensure
    ) external payable;

    function taggingFee() external returns (uint256);

    //todo - go through what else should be part of the interface that other smart contracts may want to interface with. For example;
    //-permittedNftChainIds
}
