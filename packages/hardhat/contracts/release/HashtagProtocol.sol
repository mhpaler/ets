// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721BurnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/math/SafeMathUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "hardhat/console.sol";

import {HashtagAccessControls} from "./HashtagAccessControls.sol";
import "../utils/StringHelpers.sol";

/**
 * @title Hashtag Protocol contract
 * @notice Core smart contract of the protocol that governs the creation of HASHTAG tokens
 * @author Hashtag Protocol
 */
contract HashtagProtocol is ERC721PausableUpgradeable, ERC721BurnableUpgradeable, UUPSUpgradeable, StringHelpers {
    using AddressUpgradeable for address;
    using StringsUpgradeable for uint256;
    using SafeMathUpgradeable for uint256;

    /// Variable storage

    // baseURI for looking up tokenURI for a token
    string public baseURI;

    /// @notice minimum time in seconds that a hashtag is owned
    uint256 public ownershipTermLength;

    /// @notice current tip of the hashtag tokens (and total supply) as minted consecutively
    uint256 public tokenPointer;

    /// @notice minimum hashtag length
    uint256 public hashtagMinStringLength;

    /// @notice maximum hashtag length
    uint256 public hashtagMaxStringLength;

    /// @notice core Hashtag protocol account
    address payable public platform;

    /// @notice access controls smart contract
    HashtagAccessControls public accessControls;

    /// @notice lookup of Hashtag info from token ID
    mapping(uint256 => Hashtag) public tokenIdToHashtag;

    /// @notice lookup of (lowercase) Hashtag string to token ID
    mapping(string => uint256) public hashtagToTokenId;

    /// @notice Last time a token was interacted with
    mapping(uint256 => uint256) public tokenIdToLastTransferTime;

    /// Public constants

    string public constant NAME = "HTP: HASHTAG Token";
    string public constant VERSION = "0.2.0";

    /// Modifiers

    modifier onlyAdmin() {
        require(accessControls.isAdmin(_msgSender()), "Caller must have administrator access");
        _;
    }

    /// Structs

    struct Hashtag {
        address originalPublisher;
        address creator;
        string displayVersion;
    }

    /// Events

    event MintHashtag(uint256 indexed tokenId, string displayHashtag, address indexed publisher, address creator);

    event HashtagReset(uint256 indexed tokenId, address indexed owner);

    event HashtagRenewed(uint256 indexed tokenId, address indexed caller);

    event OwnershipTermLengthUpdated(uint256 originalOwnershipLength, uint256 updatedOwnershipLength);

    event HashtagMaxStringLengthUpdated(uint256 originalHashtagMaxStringLength, uint256 UpdatedHashtagMaxStringLength);

    event PlatformSet(address previousPlatformAddress, address newPlatformAddress);

    event AccessControlsUpdated(HashtagAccessControls previousAccessControls, HashtagAccessControls newAccessControls);

    event NewBaseURI(string baseURI);

    event RenewalPeriodUpdated(uint256 originalRenewalPeriod, uint256 updatedRenewalPeriod);

    /// @custom:oz-upgrades-unsafe-allow constructor
    //constructor() initializer {}

    function initialize(HashtagAccessControls _accessControls, address payable _platform) public initializer {
        __ERC721_init("Hashtag Protocol", "HASHTAG");
        __ERC721Pausable_init();
        __ERC721Burnable_init();

        // Initialize access controls.
        accessControls = _accessControls;
        // Set platform address.
        platform = _platform;
        ownershipTermLength = 730 days;
        baseURI = "https://api.hashtag-protocol.io/";
        hashtagMinStringLength = 3;
        hashtagMaxStringLength = 32;
    }

    function _authorizeUpgrade(address) internal override onlyAdmin {}

    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721Upgradeable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    /// Minting

    /**
     * @notice Mints a new HASHTAG token
     * @dev Hashtag string must pass validation and publisher must be whitelisted
     * @param _hashtag Hashtag string to mint - must include hashtag (#) at beginning of string
     * @param _publisher Address to be logged as publisher
     * @param _creator Address to be logged as creator
     */
    function mint(
        string calldata _hashtag,
        address payable _publisher,
        address _creator
    ) external payable returns (uint256 _tokenId) {
        require(accessControls.isPublisher(_publisher), "Mint: The publisher must be whitelisted");

        // Perform basic hashtag validation
        string memory lowerHashtagToMint = _assertHashtagIsValid(_hashtag);

        // generate the new hashtag token id
        tokenPointer = tokenPointer.add(1);
        uint256 tokenId = tokenPointer;

        // mint the token, transferring it to the platform.
        _safeMint(platform, tokenId);

        // Store HASHTAG data in state.
        tokenIdToHashtag[tokenId] = Hashtag({
            displayVersion: _hashtag,
            originalPublisher: _publisher,
            creator: _creator
        });

        // Store a reverse lookup.
        hashtagToTokenId[lowerHashtagToMint] = tokenId;

        emit MintHashtag(tokenId, _hashtag, _publisher, _creator);

        return tokenId;
    }

    /**
     * @notice Burns a given `tokenId`
     * @param tokenId Token Id to burn
     * @dev Caller must have administrator role.
     * See {ERC721-_burn}
     */
    function burn(uint256 tokenId) public virtual override onlyAdmin {
        //solhint-disable-next-line max-line-length
        require(_isApprovedOrOwner(_msgSender(), tokenId), "ERC721Burnable: caller is not owner nor approved");
        _burn(tokenId);
    }

    /**
     * @notice Renews a hashtag by setting its last transfer time to current time.
     * @dev Can only be called by token owner
     * @param _tokenId The identifier for HASHTAG token
     */
    function renewHashtag(uint256 _tokenId) external {
        require(_msgSender() == ownerOf(_tokenId), "renewHashtag: Invalid sender");

        tokenIdToLastTransferTime[_tokenId] = block.timestamp;

        emit HashtagRenewed(_tokenId, _msgSender());
    }

    /**
     * @notice Recycling a hashtag i.e. transferring ownership back to the platform due to stale ownership
     * @dev Token must exist, be not already be owned by platform and time of TX must be greater than lastTransferTime
     * @param _tokenId The identifier for the hashtag being recycled
     */
    function recycleHashtag(uint256 _tokenId) external {
        require(_exists(_tokenId), "recycleHashtag: Invalid token ID");
        require(ownerOf(_tokenId) != platform, "recycleHashtag: Already owned by the platform");

        uint256 lastTransferTime = tokenIdToLastTransferTime[_tokenId];
        require(
            lastTransferTime.add(ownershipTermLength) < block.timestamp,
            "recycleHashtag: Token not eligible for recycling yet"
        );

        _transfer(ownerOf(_tokenId), platform, _tokenId);

        emit HashtagReset(_tokenId, _msgSender());
    }

    /// Administration

    /**
     * @dev Pause Hashtag Protocol token contract.
     */
    function pause() external onlyAdmin {
        _pause();
    }

    /**
     * @dev Unpause Hashtag Protocol token contract.
     */
    function unPause() external onlyAdmin {
        _unpause();
    }

    /**
     * @dev Set base metadata api url.
     * @param newBaseURI base url
     */
    function setBaseURI(string calldata newBaseURI) public onlyAdmin {
        baseURI = newBaseURI;
        emit NewBaseURI(baseURI);
    }

    /**
     * @notice Admin method for updating the max string length of a hashtag
     * @param _hashtagMaxStringLength max length
     */
    function setHashtagMaxStringLength(uint256 _hashtagMaxStringLength) public onlyAdmin {
        uint256 prevHashtagMaxStringLength = hashtagMaxStringLength;
        hashtagMaxStringLength = _hashtagMaxStringLength;
        emit HashtagMaxStringLengthUpdated(prevHashtagMaxStringLength, _hashtagMaxStringLength);
    }

    /**
     * @notice Admin method for updating the ownership term length for all hashtag tokens
     * @param _ownershipTermLength New length in unix epoch seconds
     */
    function setOwnershipTermLength(uint256 _ownershipTermLength) public onlyAdmin {
        uint256 prevOwnershipTermLength = ownershipTermLength;
        ownershipTermLength = _ownershipTermLength;
        emit OwnershipTermLengthUpdated(prevOwnershipTermLength, _ownershipTermLength);
    }

    /**
     * @notice Admin method for updating the address that receives the commission on behalf of the platform
     * @param _platform Address that receives minted NFTs
     */
    function setPlatform(address payable _platform) external onlyAdmin {
        address prevPlatform = platform;
        platform = _platform;
        emit PlatformSet(prevPlatform, _platform);
    }

    /**
     * @notice Admin functionality for updating the access controls
     * @param _accessControls Address of the access controls contract
     */
    function updateAccessControls(HashtagAccessControls _accessControls) external onlyAdmin {
        require(address(_accessControls) != address(0), "HashtagProtocol.updateAccessControls: Cannot be zero");
        HashtagAccessControls prevAccessControls = accessControls;
        accessControls = _accessControls;
        emit AccessControlsUpdated(prevAccessControls, _accessControls);
    }

    /// external/public view functions

    function getHashtagId(string calldata hashtag) public view returns (uint256 hashtagId) {
        return (hashtagToTokenId[__lower(hashtag)]);
    }

    /**
     * @notice Existence check on a HASHTAG token
     * @param tokenId token ID
     * @return true if exists
     */
    function exists(uint256 tokenId) external view returns (bool) {
        return _exists(tokenId);
    }

    /// @notice Returns the commission addresses related to a token
    /// @param _tokenId ID of a hashtag
    /// @return _platform Platform commission address
    /// @return _owner Address of the owner of the hashtag
    function getPaymentAddresses(uint256 _tokenId)
        public
        view
        returns (address payable _platform, address payable _owner)
    {
        return (platform, payable(ownerOf(_tokenId)));
    }

    /// @notice Returns creator of a token
    /// @param _tokenId ID of a hashtag
    /// @return _creator creator of the hashtag
    function getCreatorAddress(uint256 _tokenId) public view returns (address _creator) {
        return tokenIdToHashtag[_tokenId].creator;
    }

    function version() external pure returns (string memory) {
        return VERSION;
    }

    /// internal functions

    /**
     * @dev Base URI for computing {tokenURI}.
     */
    function _baseURI() internal view override(ERC721Upgradeable) returns (string memory) {
        return baseURI;
    }

    /**
     * @dev See {ERC721-_beforeTokenTransfer}.
     *
     * Requirements:
     *
     * - the contract must not be paused.
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal virtual override(ERC721PausableUpgradeable, ERC721Upgradeable) {
        super._beforeTokenTransfer(from, to, tokenId);

        require(!paused(), "ERC721Pausable: token transfer while paused");

        // Set last transfer time for use in renewal/reset functionality.
        tokenIdToLastTransferTime[tokenId] = block.timestamp;
    }

    /**
     * @notice Private method used for validating a hashtag before minting
     * @dev A series of assertions are performed reverting the transaction for any validation violations
     * @param _hashtag Proposed hashtag string
     */
    function _assertHashtagIsValid(string memory _hashtag) private view returns (string memory) {
        bytes memory hashtagStringBytes = bytes(_hashtag);
        require(
            hashtagStringBytes.length >= hashtagMinStringLength && hashtagStringBytes.length <= hashtagMaxStringLength,
            "Invalid format: Hashtag must not exceed length requirements"
        );

        require(hashtagStringBytes[0] == 0x23, "Must start with #");

        string memory hashtagKey = __lower(_hashtag);
        require(hashtagToTokenId[hashtagKey] == 0, "ERC721: token already minted");

        uint256 alphabetCharCount = 0;
        // start from first char after #
        for (uint256 i = 1; i < hashtagStringBytes.length; i++) {
            bytes1 char = hashtagStringBytes[i];

            // Generally ensure that the character is alpha numeric
            bool isInvalidCharacter = !(char >= 0x30 && char <= 0x39) && //0-9
                !(char >= 0x41 && char <= 0x5A) && //A-Z
                !(char >= 0x61 && char <= 0x7A);
            //a-z

            require(
                !isInvalidCharacter,
                "Invalid character found: Hashtag may only contain characters A-Z, a-z, 0-9 and #"
            );

            // Should the char be alphabetic, increment alphabetCharCount
            if ((char >= 0x41 && char <= 0x5A) || (char >= 0x61 && char <= 0x7A)) {
                alphabetCharCount = alphabetCharCount.add(1);
            }
        }

        // Ensure alphabetCharCount is at least 1
        require(alphabetCharCount >= 1, "Invalid format: Hashtag must contain at least 1 alphabetic character.");

        return hashtagKey;
    }
}
