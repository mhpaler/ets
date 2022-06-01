// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./interfaces/IETS.sol";
import "./interfaces/IETSAccessControls.sol";
import "./interfaces/IETSLifeCycleControls.sol";
import "./utils/StringHelpers.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/math/SafeMathUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

import "hardhat/console.sol";


/// @title ETS ERC-721 NFT contract
/// @author Ethereum Tag Service <security@ets.xyz>
/// @notice Contract that governs the creation of CTAG non-fungible tokens.
/// @dev UUPS upgradable.
contract ETS is ERC721PausableUpgradeable, IETS, UUPSUpgradeable, StringHelpers {

    using AddressUpgradeable for address;
    using StringsUpgradeable for uint256;
    using SafeMathUpgradeable for uint256;


    /// Events
    event TagMaxStringLengthUpdated(uint256 previousMaxStringLength, uint256 newMaxStringLength);
    event PlatformSet(address previousPlatformAddress, address newPlatformAddress);
    event AccessControlsUpdated(IETSAccessControls previousAccessControls, IETSAccessControls newAccessControls);
    event LifeCycleControlsSet(IETSLifeCycleControls previousLifeCycleControls, IETSLifeCycleControls newLifeCycleControls);

    event NewBaseURI(string baseURI);


    IETSAccessControls public accessControls;
    IETSLifeCycleControls public lifeCycleControls;


    /// Public constants
    string public constant NAME = "CTAG Token";
    string public constant VERSION = "0.1.0";


    // baseURI for looking up tokenURI for a token
    string public baseURI;
    uint256 public tagMinStringLength;
    uint256 public tagMaxStringLength;

    /// @dev ETS Platform account.
    address payable public platform;

    /// @dev Map of CTAG id to CTAG record.
    mapping(uint256 => Tag) public tokenIdToTag;

    /// Modifiers

    modifier onlyAdmin() {
        require(accessControls.isAdmin(_msgSender()), "Caller must have administrator access");
        _;
    }

    function initialize(
        IETSAccessControls _accessControls,
        IETSLifeCycleControls _lifeCycleControls,
        address payable _platform
    ) public initializer {
        __ERC721_init("Ethereum Tag Service", "CTAG");
        __ERC721Pausable_init();

        accessControls = _accessControls;
        lifeCycleControls = _lifeCycleControls;
        platform = _platform;

        baseURI = "https://api.hashtag-protocol.io/";
        tagMinStringLength = 2;
        tagMaxStringLength = 32;
    }

    function _authorizeUpgrade(address) internal override onlyAdmin {}

    // @vince Not sure if we need this at all?
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

    /// @dev Set base metadata api url.
    /// @param newBaseURI base url
    function updateBaseURI(string calldata newBaseURI) public onlyAdmin {
        baseURI = newBaseURI;
        emit NewBaseURI(baseURI);
    }

    /// @notice Admin method for updating the max string length of an CTAG.
    /// @param _tagMaxStringLength max length.
    function updateTagMaxStringLength(uint256 _tagMaxStringLength) public onlyAdmin {
        uint256 prevTagMaxStringLength = tagMaxStringLength;
        tagMaxStringLength = _tagMaxStringLength;
        emit TagMaxStringLengthUpdated(prevTagMaxStringLength, _tagMaxStringLength);
    }

    /// @notice Admin method for updating the address that receives the commission on behalf of the platform.
    /// @param _platform Address that receives minted NFTs.
    function updatePlatform(address payable _platform) external onlyAdmin {
        address prevPlatform = platform;
        platform = _platform;
        emit PlatformSet(prevPlatform, _platform);
    }

    /// @notice Admin functionality for updating the access controls.
    /// @param _accessControls Address of the access controls contract.
    function updateAccessControls(IETSAccessControls _accessControls) external onlyAdmin {
        require(address(_accessControls) != address(0), "ETS.updateAccessControls: Cannot be zero");
        IETSAccessControls prevAccessControls = accessControls;
        accessControls = _accessControls;
        emit AccessControlsUpdated(prevAccessControls, _accessControls);
    }

    function setLifeCycleControls(IETSLifeCycleControls _lifeCycleControls) external onlyAdmin {
        require(address(_lifeCycleControls) != address(0), "ETS.setLifeCycleControls: Cannot be zero");
        IETSLifeCycleControls prevlifeCycleControls = lifeCycleControls;
        lifeCycleControls = _lifeCycleControls;
        emit LifeCycleControlsSet(prevlifeCycleControls, _lifeCycleControls);
    }

    // ============ PUBLIC INTERFACE ============

    function createTag(
        string calldata _tag,
        address payable _publisher
    ) external payable returns (uint256 _tokenId) {
        require(accessControls.isPublisher(_publisher), "Mint: The publisher must be whitelisted");

        // Perform basic tag string validation.
        uint256 tagId = _assertTagIsValid(_tag);

        // mint the token, transferring it to the platform.
        _safeMint(platform, tagId);//todo - need to add a re-entrancy guard if we are going to use safe mint

        // Store CTAG data in state.
        tokenIdToTag[tagId] = Tag({
            displayVersion: _tag,
            //machineName: machineName, TODO - need to sense check this. I don't believe machine name needs to be stored because it can always be computed from displayVersion field
            originalPublisher: _publisher,
            creator: _msgSender()
        });

        // todo - I believe this event can be removed. The internal mint method already emits an event and you can get everything from the token ID
        emit TagMinted(tagId, _tag, _publisher, _msgSender());
        return tagId;
    }

    // ============ PUBLIC VIEW FUNCTIONS ============

    function computeTagId(string memory _tag) public pure returns (uint256) {
        string memory _machineName = __lower(_tag);
        return uint256(keccak256(bytes(_machineName)));
    }

    /// @notice Existence check on a CTAG token.
    /// @param _tokenId token ID.
    /// @return true if exists.
    function tagExists(uint256 _tokenId) public view returns (bool) {
        console.log("ets.tagExists", _tokenId);
        return _exists(_tokenId);
    }

    /// @notice Existence check by string tag primary key
    function tagExists(string calldata _tag) public view returns (bool) {
        return _exists(computeTagId(_tag));
    }

    /// @notice Returns the commission addresses related to a token.
    /// @param _tokenId ID of a CTAG.
    /// @return _platform Platform commission address.
    /// @return _owner Address of the owner of the CTAG.
    function getPaymentAddresses(uint256 _tokenId)
        public
        view
        returns (address payable _platform, address payable _owner)
    {
        return (platform, payable(ownerOf(_tokenId)));
    }

    /// @notice Returns creator of a CTAG token.
    /// @param _tokenId ID of a CTAG.
    /// @return _creator creator of the CTAG.
    function getCreatorAddress(uint256 _tokenId) public view returns (address _creator) {
        return tokenIdToTag[_tokenId].creator;
    }

    function getPlatformAddress() public view returns (address) {
        return platform;
    }

    function version() external pure returns (string memory) {
        return VERSION;
    }

    /// internal functions

    /// @dev Base URI for computing {tokenURI}.
    function _baseURI() internal view override(ERC721Upgradeable) returns (string memory) {
        return baseURI;
    }

    /// @dev See {ERC721-_beforeTokenTransfer}. Contract must not be paused.
    function _afterTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal virtual override(IERC721Upgradeable) {
        super._afterTokenTransfer(from, to, tokenId);

        require(!paused(), "ERC721Pausable: token transfer while paused");

        // Set last renew time for lifecycle functionality.
        console.log("after token transfer", _exists(tokenId));
//        lifeCycleControls.renewTag(tokenId);
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
            require(
                char != 0x20,
                "Space found: tag may not contain spaces"
            );
            require(
                char != 0x23,
                "Tag may not contain prefix"
            );
        }

        return tagId;
    }
}
