// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./interfaces/IETSToken.sol";
import "./interfaces/IETSAccessControls.sol";
import "./utils/StringHelpers.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721BurnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/math/SafeMathUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

import "hardhat/console.sol";

/// @title ETS ERC-721 NFT contract
/// @author Ethereum Tag Service <security@ets.xyz>
/// @notice Contract that governs the creation of CTAG non-fungible tokens.
/// @dev UUPS upgradable.
contract ETSToken is ERC721PausableUpgradeable, ERC721BurnableUpgradeable, IETSToken, UUPSUpgradeable, StringHelpers {
    using AddressUpgradeable for address;
    using StringsUpgradeable for uint256;
    using SafeMathUpgradeable for uint256;

    IETSAccessControls public etsAccessControls;

    /// Public constants
    string public constant NAME = "CTAG Token";
    string public constant VERSION = "0.1.0";

    uint256 public tagMinStringLength;
    uint256 public tagMaxStringLength;
    uint256 public ownershipTermLength;

    /// @dev ETS Platform account.
    address payable public platform;

    /// @dev Map of CTAG id to CTAG record.
    mapping(uint256 => Tag) public tokenIdToTag;

    /// @dev Mapping of tokenId to last renewal.
    mapping(uint256 => uint256) public tokenIdToLastRenewed;

    /// @notice Defines whether a tag has been set up as premium
    mapping(string => bool) public isTagPremium;

    /// Modifiers

    modifier onlyAdmin() {
        require(etsAccessControls.isAdmin(_msgSender()), "Caller must have administrator access");
        _;
    }

    modifier onlyPublisher() {
        require(etsAccessControls.isPublisher(_msgSender()), "Caller is not publisher");
        _;
    }

    // ============ UUPS INTERFACE ============

    function initialize(
        IETSAccessControls _etsAccessControls,
        address payable _platform,
        uint256 _tagMinStringLength,
        uint256 _tagMaxStringLength,
        uint256 _ownershipTermLength
    ) public initializer {
        __ERC721_init("Ethereum Tag Service", "CTAG");
        __ERC721Pausable_init();
        __ERC721Burnable_init();

        etsAccessControls = _etsAccessControls;
        platform = _platform;
        tagMinStringLength = _tagMinStringLength;
        tagMaxStringLength = _tagMaxStringLength;
        ownershipTermLength = _ownershipTermLength;
    }

    function _authorizeUpgrade(address) internal override onlyAdmin {}

    // @vince Not sure if we need this at all? << todo we will need to ensure that the base 721 has minimal 165 requirements before removing
    //function supportsInterface(bytes4 interfaceId) public view virtual override(IERC721Upgradeable) returns (bool) {
    //    return super.supportsInterface(interfaceId);
    //}

    // ============ OWNER INTERFACE ============

    /// @dev Pause CTAG token contract.
    function pause() external onlyAdmin {
        _pause();
    }

    /// @dev Unpause CTAG token contract.
    function unPause() external onlyAdmin {
        _unpause();
    }

    function burn(uint256 tokenId) public override onlyAdmin {
        _burn(tokenId);
    }

    function setTagMaxStringLength(uint256 _tagMaxStringLength) public onlyAdmin {
        tagMaxStringLength = _tagMaxStringLength;
        emit TagMaxStringLengthSet(_tagMaxStringLength);
    }

    function setOwnershipTermLength(uint256 _ownershipTermLength) public onlyAdmin {
        ownershipTermLength = _ownershipTermLength;
        emit OwnershipTermLengthSet(_ownershipTermLength);
    }

    function setPlatform(address payable _platform) public onlyAdmin {
        platform = _platform;
        emit PlatformSet(_platform);
    }

    function setAccessControls(IETSAccessControls _etsAccessControls) public onlyAdmin {
        require(address(_etsAccessControls) != address(0), "Access controls cannot be zero");
        etsAccessControls = _etsAccessControls;
        emit AccessControlsSet(_etsAccessControls);
    }

    /// @dev Pre-minting, flag / unflag tag strings as premium tags.
    function preSetPremiumTags(string[] calldata _tags, bool _enabled) public onlyAdmin {
        require(_tags.length > 0, "Empty array");
        for (uint256 i; i < _tags.length; ++i) {
            string memory tag = __lower(_tags[i]);
            isTagPremium[tag] = _enabled;
            emit PremiumTagPreSet(tag, _enabled);
        }
    }

    /// @dev set/unset premium flag on tags owned by platform.
    function setPremiumFlag(uint256[] calldata _tokenIds, bool _isPremium) public onlyAdmin {
        require(_tokenIds.length > 0, "Empty array");
        for (uint256 i; i < _tokenIds.length; ++i) {
            uint256 tokenId = _tokenIds[i];
            require(ownerOf(tokenId) == platform, "Not owned by platform");
            tokenIdToTag[tokenId].premium = _isPremium;
            emit PremiumFlagSet(tokenId, _isPremium);
        }
    }

    /// @dev Add or remove reserved flag from one or more tags.
    /// Reserved flag prevents bidding on token at ETSAuctionHouse.
    function setReservedFlag(uint256[] calldata _tokenIds, bool _reserved) public onlyAdmin {
        require(_tokenIds.length > 0, "Empty array");
        for (uint256 i; i < _tokenIds.length; ++i) {
            uint256 tokenId = _tokenIds[i];
            require(ownerOf(tokenId) == platform, "Token not owned by platform");
            tokenIdToTag[tokenId].reserved = _reserved;
            emit ReservedFlagSet(tokenId, _reserved);
        }
    }

    // ============ PUBLIC INTERFACE ============

    function getOrCreateTag(string calldata _tag, address payable _publisher) public payable returns (Tag memory tag) {
        uint256 tokenId = computeTagId(_tag);
        if (!tagExists(tokenId)) {
            tokenId = createTag(_tag, _publisher);
        }
        return tokenIdToTag[tokenId];
    }

    function getOrCreateTagId(string calldata _tag, address payable _publisher)
        public
        payable
        returns (uint256 tokenId)
    {
        uint256 _tokenId = computeTagId(_tag);
        if (!tagExists(_tokenId)) {
            _tokenId = createTag(_tag, _publisher);
        }
        return _tokenId;
    }

    function createTag(string calldata _tag) public payable returns (uint256 _tokenId) {
        // todo - add nonReentrant due to safeMint
        return createTag(_tag, platform);
    }

    function createTag(string calldata _tag, address payable _publisher) public payable returns (uint256 _tokenId) {
        // todo - add nonReentrant due to safeMint
        require(etsAccessControls.isPublisher(_publisher), "ETS: Not a publisher");

        // Perform basic tag string validation.
        uint256 tagId = _assertTagIsValid(_tag);

        // mint the token, transferring it to the platform.
        _safeMint(platform, tagId);

        // Store CTAG data in state.
        tokenIdToTag[tagId] = Tag({
            display: _tag,
            publisher: _publisher,
            creator: _msgSender(),
            premium: isTagPremium[__lower(_tag)],
            reserved: isTagPremium[__lower(_tag)]
        });

        return tagId;
    }

    function renewTag(uint256 _tokenId) public {
        require(_exists(_tokenId), "ETS: CTAG not found");

        if (ownerOf(_tokenId) == platform) {
            _setLastRenewed(_tokenId, 0);
        } else {
            _setLastRenewed(_tokenId, block.timestamp);
        }
    }

    /**
     * @dev allows anyone or thing to recycle a CTAG back to platform if
     * ownership term is expired.
     */
    function recycleTag(uint256 _tokenId) public {
        require(_exists(_tokenId), "ETS: CTAG not found");
        require(ownerOf(_tokenId) != platform, "ETS: CTAG owned by platform");

        uint256 lastRenewed = getLastRenewed(_tokenId);
        require(lastRenewed.add(getOwnershipTermLength()) < block.timestamp, "ETS: CTAG not eligible for recycling");

        _transfer(ownerOf(_tokenId), platform, _tokenId);
        emit TagRecycled(_tokenId, _msgSender());
    }

    // ============ PUBLIC VIEW FUNCTIONS ============

    function computeTagId(string memory _tag) public pure returns (uint256) {
        string memory _machineName = __lower(_tag);
        return uint256(keccak256(bytes(_machineName)));
    }

    function tagExists(string calldata _tag) public view returns (bool) {
        return _exists(computeTagId(_tag));
    }

    function tagExists(uint256 _tokenId) public view returns (bool) {
        return _exists(_tokenId);
    }

    function getTag(string calldata _tag) public view returns (Tag memory) {
        return getTag(computeTagId(_tag));
    }

    function getTag(uint256 _tokenId) public view returns (Tag memory) {
        return tokenIdToTag[_tokenId];
    }

    function getOwnershipTermLength() public view returns (uint256) {
        return ownershipTermLength;
    }

    function getLastRenewed(uint256 _tokenId) public view returns (uint256) {
        return tokenIdToLastRenewed[_tokenId];
    }

    /// @notice Returns creator of a CTAG token.
    /// @param _tokenId ID of a CTAG.
    /// @return _creator creator of the CTAG.
    function getCreatorAddress(uint256 _tokenId) public view returns (address) {
        return tokenIdToTag[_tokenId].creator;
    }

    function getPlatformAddress() public view returns (address) {
        return platform;
    }

    function version() external pure returns (string memory) {
        return VERSION;
    }

    // ============ INTERNAL FUNCTIONS ============

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override(ERC721PausableUpgradeable, ERC721Upgradeable) whenNotPaused {
        super._beforeTokenTransfer(from, to, amount);
        require(!paused(), "ERC721Pausable: token transfer while paused");
    }

    /// @dev See {ERC721-_afterTokenTransfer}. Contract must not be paused.
    function _afterTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal virtual override(ERC721Upgradeable) {
        super._afterTokenTransfer(from, to, tokenId);

        if (to != address(0)) {
            // Reset token ownership term.
            if (to == platform) {
                _setLastRenewed(tokenId, 0);
            } else {
                _setLastRenewed(tokenId, block.timestamp);
            }
        }
    }

    /// @notice Private method used for validating a CTAG string before minting.
    /// @dev A series of assertions are performed reverting the transaction for any validation violations.
    /// @param _tag Proposed tag string.
    function _assertTagIsValid(string memory _tag) private view returns (uint256 _tagId) {
        // generate token ID from machine name
        uint256 tagId = computeTagId(_tag);

        require(!_exists(tagId), "ERC721: token already minted");

        bytes memory tagStringBytes = bytes(_tag);
        require(
            tagStringBytes.length >= tagMinStringLength && tagStringBytes.length <= tagMaxStringLength,
            "Invalid format: tag does not meet min/max length requirements"
        );

        require(tagStringBytes[0] == 0x23, "Tag must start with #");

        // start from first char after #
        for (uint256 i = 1; i < tagStringBytes.length; i++) {
            bytes1 char = tagStringBytes[i];
            require(char != 0x20, "Space found: tag may not contain spaces");
            require(char != 0x23, "Tag may not contain prefix");
        }

        return tagId;
    }

    function _setLastRenewed(uint256 _tokenId, uint256 _timestamp) internal {
        tokenIdToLastRenewed[_tokenId] = _timestamp;
        emit TagRenewed(_tokenId, msg.sender);
    }
}
