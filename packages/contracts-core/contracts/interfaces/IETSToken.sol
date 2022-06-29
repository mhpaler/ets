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

    event TagMaxStringLengthSet(uint256 maxStringLength);

    event TagMinStringLengthSet(uint256 minStringLength);

    event OwnershipTermLengthSet(uint256 termLength);

    event PlatformSet(address platformAddress);

    event AccessControlsSet(IETSAccessControls etsAccessControls);

    event PremiumTagPreSet(string tag, bool isPremium);

    event PremiumFlagSet(uint256 tagId, bool isPremium);

    event ReservedFlagSet(uint256 tagId, bool isReleased);

    event TagRenewed(uint256 indexed tokenId, address indexed caller);

    event TagRecycled(uint256 indexed tokenId, address indexed caller);

    // ============ OWNER INTERFACE ============

    function setTagMaxStringLength(uint256 _tagMaxStringLength) external;

    function setTagMinStringLength(uint256 _tagMinStringLength) external;

    function setOwnershipTermLength(uint256 _ownershipTermLength) external;

    function setPlatform(address payable _platform) external;

    function setAccessControls(IETSAccessControls _etsAccessControls) external;

    function preSetPremiumTags(string[] calldata _tags, bool _enabled) external;

    function setPremiumFlag(uint256[] calldata _tokenIds, bool _isPremium) external;

    function setReservedFlag(uint256[] calldata _tokenIds, bool _reserved) external;

    // ============ PUBLIC INTERFACE ============

    function getOrCreateTagId(string calldata _tag, address payable publisher)
        external
        payable
        returns (uint256 tokenId);

    function createTag(string calldata _tag) external payable returns (uint256 tokenId);

    function createTag(string calldata _tag, address payable _publisher) external payable returns (uint256 tokenId);

    function renewTag(uint256 _tokenId) external;

    function recycleTag(uint256 _tokenId) external;

    // ============ PUBLIC VIEW FUNCTIONS ============

    function computeTagId(string memory _tag) external pure returns (uint256);

    function tagExists(string calldata _tag) external view returns (bool);

    function tagExists(uint256 _tokenId) external view returns (bool);

    function getTag(string calldata _tag) external view returns (Tag memory);

    function getTag(uint256 _tokenId) external view returns (Tag memory);

    function getPlatformAddress() external view returns (address);

    function getCreatorAddress(uint256 _tokenId) external view returns (address);

    function getLastRenewed(uint256 _tokenId) external view returns (uint256);

    function getOwnershipTermLength() external view returns (uint256);
}
