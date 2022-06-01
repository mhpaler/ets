// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./IETS.sol";

interface IETSLifeCycleControls {

    event TagRecycled(uint256 indexed tokenId, address indexed caller);
    event TagRenewed(uint256 indexed tokenId, address indexed caller);
    event OwnershipTermLengthSet(uint256 originalOwnershipLength, uint256 updatedOwnershipLength);
    event EtsSet(IETS prevETS, IETS newETS);

    /// @dev Recycling an CTAG i.e. transferring ownership back to the platform.
    function recycleTag(uint256 _tokenId) external;
    /// @dev Renews an CTAG by setting its last transfer time to current time.
    function renewTag(uint256 _tokenId) external;
    function setLastTransfer(uint256 _tokenId) external;
    function getLastTransfer(uint256 _tokenId) external view returns (uint256);

    function setOwnershipTermLength(uint256 _ownershipTermLength) external;
    function setETS(IETS _ets) external;
}
