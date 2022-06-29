// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IETSEnrichTarget {
    event RequestEnrichTarget(uint256 targetId);

    function requestEnrichTarget(uint256 _targetId) external;

    function fulfillEnrichTarget(
        uint256 _targetId,
        string calldata _ipfsHash,
        uint256 _status
    ) external;
}
