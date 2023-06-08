// SPDX-License-Identifier: MIT

/**
 * @title ETSToken
 * @author Ethereum Tag Service <team@ets.xyz>
 *
 *  ███████╗████████╗███████╗
 *  ██╔════╝╚══██╔══╝██╔════╝
 *  █████╗     ██║   ███████╗
 *  ██╔══╝     ██║   ╚════██║
 *  ███████╗   ██║   ███████║
 *  ╚══════╝   ╚═╝   ╚══════╝
 *
 * @notice This is the core ETSToken.sol contract that governs the creation & management of
 * Ethereum Tag Service composable tags (CTAGs).
 *
 * CTAGs are ERC-721 non-fungible tokens that store a single tag string and origin attribution data
 * including a "Relayer" address and a "Creator" address. The tag string must conform to a few simple
 * validation rules.
 *
 * CTAGs are identified in ETS by their Id (tagId) which is an unsigned integer computed from the lowercased
 * tag "display" string. Given this, only one CTAG exists for a tag string regardless of its case. For
 * example, #Punks, #punks and #PUNKS all resolve to the same CTAG.
 *
 * CTAG Ids are combined with Target Ids (see ETSTarget.sol) by ETS core (ETS.sol) to form "Tagging Records".
 * See ETS.sol for more details on Tagging Records.
 */

pragma solidity ^0.8.10;

import { IETS } from "./interfaces/IETS.sol";
import { IETSToken } from "./interfaces/IETSToken.sol";
import { IETSAccessControls } from "./interfaces/IETSAccessControls.sol";
import { StringHelpers } from "./utils/StringHelpers.sol";
import { ERC721PausableUpgradeable } from "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721PausableUpgradeable.sol";
import { ERC721BurnableUpgradeable, ERC721Upgradeable, IERC165Upgradeable } from "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721BurnableUpgradeable.sol";
import { ReentrancyGuardUpgradeable } from "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import { UUPSUpgradeable } from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

contract ETSToken is
    ERC721PausableUpgradeable,
    ERC721BurnableUpgradeable,
    IETSToken,
    ReentrancyGuardUpgradeable,
    UUPSUpgradeable,
    StringHelpers
{
    IETS public ets;
    IETSAccessControls public etsAccessControls;

    // Public constants
    string public constant NAME = "CTAG Token";

    // Public variables
    uint256 public tagMinStringLength;
    uint256 public tagMaxStringLength;
    uint256 public ownershipTermLength;

    /// @dev Map of CTAG id to CTAG record.
    mapping(uint256 => Tag) public tokenIdToTag;

    /// @dev Mapping of tokenId to last renewal.
    mapping(uint256 => uint256) public tokenIdToLastRenewed;

    /// @notice Defines whether a tag has been set up as premium
    mapping(string => bool) public isTagPremium;

    /// Modifiers
    modifier onlyETSCore() {
        require(_msgSender() == address(ets), "Caller is not ETS core");
        _;
    }

    modifier onlyAdmin() {
        require(etsAccessControls.isAdmin(_msgSender()), "Access denied");
        _;
    }

    modifier onlyRelayer() {
        require(etsAccessControls.isRelayer(_msgSender()), "Caller is not relayer");
        _;
    }

    // ============ UUPS INTERFACE ============

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(
        IETSAccessControls _etsAccessControls,
        uint256 _tagMinStringLength,
        uint256 _tagMaxStringLength,
        uint256 _ownershipTermLength
    ) public initializer {
        __ERC721_init("Ethereum Tag Service", "CTAG");
        __ERC721Pausable_init();
        __ERC721Burnable_init();
        __ReentrancyGuard_init();

        // Initialize ETSToken settings using public
        // functions so our subgraph can capture them.
        // To call them requires etsAccessControls being
        // set so we set that manually first.
        etsAccessControls = _etsAccessControls;
        setTagMinStringLength(_tagMinStringLength);
        setTagMaxStringLength(_tagMaxStringLength);
        setOwnershipTermLength(_ownershipTermLength);
    }

    // solhint-disable-next-line
    function _authorizeUpgrade(address) internal override onlyAdmin {}

    // ============ OWNER INTERFACE ============

    /**
     * @notice Sets ETS core on the ETSToken contract so functions can be
     * restricted to ETS platform only.
     *
     * @param _ets Address of ETS contract.
     */
    function setETSCore(IETS _ets) public onlyAdmin {
        require(address(_ets) != address(0), "Address cannot be zero");
        ets = _ets;
        emit ETSCoreSet(address(ets));
    }

    /**
     * @notice Sets ETSAccessControls on the ETSToken contract function calls can be
     * restricted to ETS platform only. Note: Caller of this function must be deployer
     * or pre-set as admin of new contract.
     *
     * @param _accessControls Address of ETSAccessControls contract.
     */
    function setAccessControls(IETSAccessControls _accessControls) public onlyAdmin {
        require(address(_accessControls) != address(0), "Address cannot be zero");
        require(_accessControls.isAdmin(_msgSender()), "Caller not admin in new contract");
        etsAccessControls = _accessControls;
        emit AccessControlsSet(address(etsAccessControls));
    }

    /**
     * @notice Pauses ETSToken contract.
     */
    function pause() public onlyAdmin whenNotPaused {
        _pause();
    }

    /**
     * @notice Unpauses ETSToken contract.
     */
    function unPause() public onlyAdmin whenPaused {
        _unpause();
    }

    /// @inheritdoc ERC721BurnableUpgradeable
    function burn(uint256 tokenId) public override onlyAdmin {
        _burn(tokenId);
    }

    /// @inheritdoc IETSToken
    function setTagMaxStringLength(uint256 _tagMaxStringLength) public onlyAdmin {
        tagMaxStringLength = _tagMaxStringLength;
        emit TagMaxStringLengthSet(_tagMaxStringLength);
    }

    /// @inheritdoc IETSToken
    function setTagMinStringLength(uint256 _tagMinStringLength) public onlyAdmin {
        tagMinStringLength = _tagMinStringLength;
        emit TagMinStringLengthSet(_tagMinStringLength);
    }

    /// @inheritdoc IETSToken
    function setOwnershipTermLength(uint256 _ownershipTermLength) public onlyAdmin {
        ownershipTermLength = _ownershipTermLength;
        emit OwnershipTermLengthSet(_ownershipTermLength);
    }

    /// @inheritdoc IETSToken
    function preSetPremiumTags(string[] calldata _tags, bool _enabled) public onlyAdmin {
        require(_tags.length > 0, "Empty array");
        for (uint256 i; i < _tags.length; ++i) {
            string memory tag = __lower(_tags[i]);
            isTagPremium[tag] = _enabled;
            emit PremiumTagPreSet(tag, _enabled);
        }
    }

    /// @inheritdoc IETSToken
    function setPremiumFlag(uint256[] calldata _tokenIds, bool _isPremium) public onlyAdmin {
        require(_tokenIds.length > 0, "Empty array");
        for (uint256 i; i < _tokenIds.length; ++i) {
            uint256 tokenId = _tokenIds[i];
            require(ownerOf(tokenId) == getPlatformAddress(), "Not owned by platform");
            tokenIdToTag[tokenId].premium = _isPremium;
            emit PremiumFlagSet(tokenId, _isPremium);
        }
    }

    /// @inheritdoc IETSToken
    function setReservedFlag(uint256[] calldata _tokenIds, bool _reserved) public onlyAdmin {
        require(_tokenIds.length > 0, "Empty array");
        for (uint256 i; i < _tokenIds.length; ++i) {
            uint256 tokenId = _tokenIds[i];
            require(ownerOf(tokenId) == getPlatformAddress(), "Token not owned by platform");
            tokenIdToTag[tokenId].reserved = _reserved;
            emit ReservedFlagSet(tokenId, _reserved);
        }
    }

    // ============ PUBLIC INTERFACE ============

    function getOrCreateTag(
        string calldata _tag,
        address payable _relayer,
        address payable _creator
    ) public payable returns (Tag memory tag) {
        uint256 tokenId = computeTagId(_tag);
        if (!tagExistsById(tokenId)) {
            tokenId = createTag(_tag, _relayer, _creator);
        }
        return tokenIdToTag[tokenId];
    }

    /// @inheritdoc IETSToken
    function getOrCreateTagId(
        string calldata _tag,
        address payable _relayer,
        address payable _creator
    ) public payable returns (uint256 tokenId) {
        uint256 _tokenId = computeTagId(_tag);
        if (!tagExistsById(_tokenId)) {
            _tokenId = createTag(_tag, _relayer, _creator);
        }
        return _tokenId;
    }

    /// @inheritdoc IETSToken
    function createTag(
        string calldata _tag,
        address payable _relayer,
        address payable _creator
    ) public payable nonReentrant onlyETSCore returns (uint256 _tokenId) {
        // Perform basic tag string validation.
        uint256 tagId = _assertTagIsValid(_tag);

        // mint the token, transferring it to the platform.
        _safeMint(getPlatformAddress(), tagId);

        // Store CTAG data in state.
        tokenIdToTag[tagId] = Tag({
            display: _tag,
            relayer: _relayer,
            creator: _creator,
            premium: isTagPremium[__lower(_tag)],
            reserved: isTagPremium[__lower(_tag)]
        });

        return tagId;
    }

    /// @inheritdoc IETSToken
    function renewTag(uint256 _tokenId) public {
        require(_exists(_tokenId), "ETS: CTAG not found");

        if (ownerOf(_tokenId) == getPlatformAddress()) {
            _setLastRenewed(_tokenId, 0);
        } else {
            _setLastRenewed(_tokenId, block.timestamp);
        }
    }

    /// @inheritdoc IETSToken
    function recycleTag(uint256 _tokenId) public {
        require(_exists(_tokenId), "ETS: CTAG not found");
        require(ownerOf(_tokenId) != getPlatformAddress(), "Tag owned by platform");

        uint256 lastRenewed = getLastRenewed(_tokenId);
        require(lastRenewed + getOwnershipTermLength() < block.timestamp, "recycling not available");

        _transfer(ownerOf(_tokenId), getPlatformAddress(), _tokenId);
        emit TagRecycled(_tokenId, _msgSender());
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override(ERC721Upgradeable, IERC165Upgradeable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    // ============ PUBLIC VIEW FUNCTIONS ============

    /// @inheritdoc IETSToken
    function computeTagId(string memory _tag) public pure returns (uint256) {
        string memory _machineName = __lower(_tag);
        return uint256(keccak256(bytes(_machineName)));
    }

    /// @inheritdoc IETSToken
    function tagExistsByString(string calldata _tag) public view returns (bool) {
        return _exists(computeTagId(_tag));
    }

    /// @inheritdoc IETSToken
    function tagExistsById(uint256 _tokenId) public view returns (bool) {
        return _exists(_tokenId);
    }

    /// @inheritdoc IETSToken
    function getTagByString(string calldata _tag) public view returns (Tag memory) {
        return getTagById(computeTagId(_tag));
    }

    /// @inheritdoc IETSToken
    function getTagById(uint256 _tokenId) public view returns (Tag memory) {
        return tokenIdToTag[_tokenId];
    }

    /// @inheritdoc IETSToken
    function getOwnershipTermLength() public view returns (uint256) {
        return ownershipTermLength;
    }

    /// @inheritdoc IETSToken
    function getLastRenewed(uint256 _tokenId) public view returns (uint256) {
        return tokenIdToLastRenewed[_tokenId];
    }

    /// @inheritdoc IETSToken
    function getPlatformAddress() public view returns (address payable) {
        return etsAccessControls.getPlatformAddress();
    }

    /// @inheritdoc IETSToken
    function getCreatorAddress(uint256 _tokenId) public view returns (address) {
        return tokenIdToTag[_tokenId].creator;
    }

    // ============ INTERNAL FUNCTIONS ============

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override(ERC721PausableUpgradeable, ERC721Upgradeable) whenNotPaused {
        super._beforeTokenTransfer(from, to, amount);
        require(!paused(), "Contract paused");
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
            if (to == getPlatformAddress()) {
                _setLastRenewed(tokenId, 0);
            } else {
                _setLastRenewed(tokenId, block.timestamp);
            }
        }

        // If from address is not black hole or platform, and balance is going zero pause their relayer.
        if (from != address(0) && from != getPlatformAddress() && balanceOf(from) == 0) {
            etsAccessControls.pauseRelayerByOwnerAddress(from);
        }
    }

    /**
     * @dev Private method used for validating a CTAG string before minting.
     *
     * A series of assertions are performed reverting the transaction for any validation violations.
     *
     * @param _tag Proposed tag string.
     */
    function _assertTagIsValid(string memory _tag) private view returns (uint256 _tagId) {
        // generate token ID from machine name
        uint256 tagId = computeTagId(_tag);

        require(!_exists(tagId), "ERC721: token already minted");

        bytes memory tagStringBytes = bytes(_tag);
        require(
            tagStringBytes.length >= tagMinStringLength && tagStringBytes.length <= tagMaxStringLength,
            "Invalid tag format"
        );

        require(tagStringBytes[0] == 0x23, "Tag must start with #");

        // start from first char after #
        for (uint256 i = 1; i < tagStringBytes.length; i++) {
            bytes1 char = tagStringBytes[i];
            require(char != 0x20, "Spaces in tag");
            require(char != 0x23, "Tag contains prefix");
        }

        return tagId;
    }

    function _setLastRenewed(uint256 _tokenId, uint256 _timestamp) internal {
        tokenIdToLastRenewed[_tokenId] = _timestamp;
        emit TagRenewed(_tokenId, msg.sender);
    }
}
