// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/token/ERC721/IERC721Upgradeable.sol";

/// @notice ETS core interface exposing ability for external contracts to mint and use CTAGs.
interface IETS is IERC721Upgradeable {

    // Container for CTAG token data.
    struct Tag {
        address originalPublisher;
        address creator;
        string displayVersion;
    }

    // Events
    event TagMinted(uint256 indexed tokenId, string displayVersion, address indexed publisher, address creator);
    event TagRecycled(uint256 indexed tokenId, address indexed caller);


    /// @notice Mint a new CTAG token.
    /// @dev Tag string must pass validation and publisher must be whitelisted.
    /// @param _tag Tag string to mint, without prefix.
    /// @param _publisher Publisher address.
    /// @return _tokenId for newly minted CTAG.
    function createTag(
        string calldata _tag,
        address payable _publisher
    ) external payable returns (uint256 _tokenId);

    function recycleTag(uint256 _tokenId) external;
    function tagExists(uint256 _tokenId) external view returns (bool);
    function getPlatformAddress() external view returns (address);
}
