// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/token/ERC721/IERC721Upgradeable.sol";
import "./IETSAccessControls.sol";

/// @notice ETS core interface exposing ability for external contracts to mint and use CTAGs.
interface IETSToken is IERC721Upgradeable {
    // Container for CTAG token data.
    struct Tag {
        address publisher;
        address creator;
        string display;
        bool premium;
        bool reserved;
    }

    // Events
    event OwnershipTermLengthSet(uint256 termLength);

    event TagMaxStringLengthSet(uint256 maxStringLength);

    event PlatformSet(address platformAddress);

    event AccessControlsSet(IETSAccessControls etsAccessControls);

    event TagRenewed(uint256 indexed tokenId, address indexed caller);

    event TagRecycled(uint256 indexed tokenId, address indexed caller);

    event PremiumTagPreSet(string tag, bool isPremium);

    event PremiumFlagSet(uint256 tagId, bool isPremium);

    event ReservedFlagSet(uint256 tagId, bool isReleased);

    function setOwnershipTermLength(uint256 _ownershipTermLength) external;

    function setAccessControls(IETSAccessControls _etsAccessControls) external;

    function createTag(string calldata _tag) external payable returns (uint256 _tokenId);

    function createTag(string calldata _tag, address payable _publisher) external payable returns (uint256 _tokenId);

    function renewTag(uint256 _tokenId) external;

    function recycleTag(uint256 _tokenId) external;

    function computeTagId(string memory _tag) external pure returns (uint256);

    function tagExists(string calldata _tag) external view returns (bool);

    function tagExists(uint256 _tokenId) external view returns (bool);

    function getTag(string calldata _tag) external view returns (Tag memory);

    function getTag(uint256 _tokenId) external view returns (Tag memory);

    function getPlatformAddress() external view returns (address);

    function getLastRenewed(uint256 _tokenId) external view returns (uint256);

    function getOwnershipTermLength() external view returns (uint256);
}
