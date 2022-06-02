// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./IETS.sol";

interface IETSLifeCycleControls {

    event TagRenewed(uint256 indexed tokenId, address indexed caller);
    event TagRecycled(uint256 indexed tokenId, address indexed caller);
    event OwnershipTermLengthSet(uint256 originalOwnershipLength, uint256 updatedOwnershipLength);
    event EtsSet(IETS prevETS, IETS newETS);

    function renewTag(uint256 _tokenId) external;
    function recycleTag(uint256 _tokenId) external;
    function getLastRenewed(uint256 _tokenId) external view returns (uint256);
    function setOwnershipTermLength(uint256 _ownershipTermLength) external;
    function getOwnershipTermLength() external view returns (uint256);
    function setETS(IETS _ets) external;
}
