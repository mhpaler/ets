// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IETSPublisherControls {

    // event TagRenewed(uint256 indexed tokenId, address indexed caller);
    // event TagRecycled(uint256 indexed tokenId, address indexed caller);
    // event OwnershipTermLengthSet(uint256 originalOwnershipLength, uint256 updatedOwnershipLength);
    event OwnerPromoted(address owner);
    function promoteToPublisher(address owner) external;

}
