// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/token/ERC721/IERC721Upgradeable.sol";
import "./IETSAccessControls.sol";

/// @notice ETS core interface exposing ability for external contracts to mint and use CTAGs.
interface IETSToken is IERC721Upgradeable {

    // Container for CTAG token data.
    struct Tag {
        address originalPublisher;
        address creator;
        string displayVersion;
    }

    // Events
    event OwnershipTermLengthSet(uint256 termLength);
    event TagMaxStringLengthSet(uint256 maxStringLength);
    event PlatformSet(address platformAddress);
    event AccessControlsSet(IETSAccessControls etsAccessControls);
    event TagMinted(uint256 indexed tokenId, string displayVersion, address indexed publisher, address creator);
    event TagRenewed(uint256 indexed tokenId, address indexed caller);
    event TagRecycled(uint256 indexed tokenId, address indexed caller);

    function setOwnershipTermLength(uint256 _ownershipTermLength) external;
    function createTag(string calldata _tag, address payable _publisher) external payable returns (uint256 _tokenId);
    function renewTag(uint256 _tokenId) external;
    function recycleTag(uint256 _tokenId) external;

    function tokenIdExists(uint256 _tokenId) external view returns (bool);
    function tagExists(string calldata _tag) external view returns (bool);
    function getTag(uint256 _tokenId) external view returns (Tag memory);
    function getPlatformAddress() external view returns (address);
    function getLastRenewed(uint256 _tokenId) external view returns (uint256);
    function getOwnershipTermLength() external view returns (uint256);
}
