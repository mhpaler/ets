// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/token/ERC721/IERC721Upgradeable.sol";

/**
 * @title ETS
 * @author Ethereum Tag Service <team@ets.xyz>
 *
 * @notice This is the interface for the ETSToken.sol core contract that governs the creation & management
 * of Ethereum Tag Service composable tags (CTAGs).
 *
 * CTAGs are ERC-721 non-fungible tokens that store a single tag string that must conform to a few simple
 * validation rules and origin attribution data including a "Publisher" address and a "Creator" address.
 *
 * CTAGs are identified in ETS by their Id (tagId) which is an unsigned integer computed from the lowercased
 * tag "display" string. Given this, only one CTAG exists for a tag string regardless of its case. For
 * example, #Punks, #punks and #PUNKS all resolve to the same CTAG.
 *
 * CTAG Ids are combined with Target Ids (see ETSTarget.sol) by ETS core (ETS.sol) to form "Tagging Records".
 */
interface IETSToken is IERC721Upgradeable {
    /**
     * @notice Data structure for CTAG Token.
     *
     * Only premium and reserved flags are editable.
     *
     * @param publisher Address of IETSTargetTagger implementation that created CTAG.
     * @param creator Address interacting with publisher to initiate CTAG creation.
     * @param display Display version of CTAG string.
     * @param premium ETS governed boolean flag to identify a CTAG as premium/higher value.
     * @param reserved ETS governed boolean flag to restrict a CTAG from release to auction.
     */
    struct Tag {
        address publisher;
        address creator;
        string display;
        bool premium;
        bool reserved;
    }

    // Events

    /**
     * @dev emitted when the maximum character length of CTAG display string is set.
     *
     * @param maxStringLength maximum character length of string.
     */
    event TagMaxStringLengthSet(uint256 maxStringLength);

    /**
     * @dev emitted when the minimum character length of CTAG display string is set.
     *
     * @param minStringLength minimum character length of string.
     */
    event TagMinStringLengthSet(uint256 minStringLength);

    /**
     * @dev emitted when the ownership term length of a CTAG is set.
     *
     * @param termLength Ownership term length in days.
     */
    event OwnershipTermLengthSet(uint256 termLength);

    /**
     * @dev emitted when the ETS Access Controls is set.
     *
     * @param etsAccessControls contract address access controls is set to.
     */
    event AccessControlsSet(address etsAccessControls);

    /**
     * @dev emitted when a tag string is flagged/unflagged as premium prior to minting.
     *
     * @param tag tag string being flagged.
     * @param isPremium boolean true for premium/false not premium.
     */
    event PremiumTagPreSet(string tag, bool isPremium);

    /**
     * @dev emitted when a CTAG is flagged/unflagged as premium subsequent to minting.
     *
     * @param tagId Id of CTAG token.
     * @param isPremium boolean true for premium/false not premium.
     */
    event PremiumFlagSet(uint256 tagId, bool isPremium);

    /**
     * @dev emitted when a CTAG is flagged/unflagged as reserved subsequent to minting.
     *
     * @param tagId Id of CTAG token.
     * @param isReserved boolean true for reserved/false for not reserved.
     */
    event ReservedFlagSet(uint256 tagId, bool isReserved);

    /**
     * @dev emitted when CTAG token is renewed.
     *
     * @param tokenId Id of CTAG token.
     * @param caller address of renewer.
     */
    event TagRenewed(uint256 indexed tokenId, address indexed caller);

    /**
     * @dev emitted when CTAG token is recycled back to ETS.
     *
     * @param tokenId Id of CTAG token.
     * @param caller address of recycler.
     */
    event TagRecycled(uint256 indexed tokenId, address indexed caller);

    // ============ OWNER INTERFACE ============

    /**
     * @notice admin function to set maximum character length of CTAG display string.
     *
     * @param _tagMaxStringLength maximum character length of string.
     */
    function setTagMaxStringLength(uint256 _tagMaxStringLength) external;

    /**
     * @notice Admin function to set minimum  character length of CTAG display string.
     *
     * @param _tagMinStringLength minimum character length of string.
     */
    function setTagMinStringLength(uint256 _tagMinStringLength) external;

    /**
     * @notice Admin function to set the ownership term length of a CTAG is set.
     *
     * @param _ownershipTermLength Ownership term length in days.
     */
    function setOwnershipTermLength(uint256 _ownershipTermLength) external;

    /**
     * @notice Sets ETSAccessControls on the ETSTarget contract so functions can be
     * restricted to ETS platform only.
     *
     * @param _etsAccessControls Address of ETSAccessControls contract.
     */
    function setAccessControls(address _etsAccessControls) external;

    /**
     * @notice Admin function to flag/unflag tag string(s) as premium prior to minting.
     *
     * @param _tags Array of tag strings.
     * @param _isPremium Boolean true for premium, false for not premium.
     */
    function preSetPremiumTags(string[] calldata _tags, bool _isPremium) external;

    /**
     * @notice Admin function to flag/unflag CTAG(s) as premium.
     *
     * @param _tokenIds Array of CTAG Ids.
     * @param _isPremium Boolean true for premium, false for not premium.
     */
    function setPremiumFlag(uint256[] calldata _tokenIds, bool _isPremium) external;

    /**
     * @notice Admin function to flag/unflag CTAG(s) as reserved.
     *
     * Tags flagged as reserved cannot be auctioned.
     *
     * @param _tokenIds Array of CTAG Ids.
     * @param _reserved Boolean true for reserved, false for not reserved.
     */
    function setReservedFlag(uint256[] calldata _tokenIds, bool _reserved) external;

    // ============ PUBLIC INTERFACE ============

    /**
     * @notice Get CTAG token Id from tag string.
     *
     * Combo function that accepts a tag string and returns it's CTAG token Id if it exists,
     * or creates a new CTAG and returns corresponding Id.
     *
     * Only contracts/addresses with Publisher role can call this function.
     *
     * @param _tag Tag string.
     * @param _creator Address credited with creating CTAG.
     * @return tokenId Id of CTAG token.
     */
    function getOrCreateTagId(string calldata _tag, address payable _creator)
        external
        payable
        returns (uint256 tokenId);

    /**
     * @notice Create CTAG token from tag string.
     *
     * Reverts if tag exists or is invalid.
     *
     * Only contracts/addresses with Publisher role can call this function.
     *
     * @param _tag Tag string.
     * @param _creator Address credited with creating CTAG.
     * @return tokenId Id of CTAG token.
     */
    function createTag(string calldata _tag, address payable _creator) external payable returns (uint256 tokenId);

    /**
     * @notice Renews ownership term of a CTAG.
     *
     * A "CTAG ownership term" is utilized to prevent CTAGs from being abandoned or inaccessable
     * due to lost private keys.
     *
     * Any wallet address may renew the term of a CTAG for an owner. When renewed, the term
     * is extended from the current block timestamp plus the ownershipTermLength public variable.
     *
     * @param _tokenId Id of CTAG token.
     */
    function renewTag(uint256 _tokenId) external;

    /**
     * @notice Recycles a CTAG back to ETS.
     *
     * When ownership term of a CTAG has expired, any wallet or contract may call this function
     * to recycle the tag back to ETS. Once recycled, a tag may be auctioned again.
     *
     * @param _tokenId Id of CTAG token.
     */
    function recycleTag(uint256 _tokenId) external;

    // ============ PUBLIC VIEW FUNCTIONS ============

    /**
     * @notice Function to deterministically compute & return a CTAG token Id.
     *
     * Every CTAG token and it's associated data struct is mapped to by it's token Id. This Id is computed
     * from the "display" tag string lowercased, hashed and cast as an unsigned integer.
     *
     * Note: Function does not verify if CTAG record exists.
     *
     * @param _tag Tag string.
     * @return Id of potential CTAG token id.
     */
    function computeTagId(string memory _tag) external pure returns (uint256);

    /**
     * @notice Check that a CTAG token exists for a given tag string.
     *
     * @param _tag Tag string.
     * @return true if CTAG token exists; false if not.
     */
    function tagExists(string calldata _tag) external view returns (bool);

    /**
     * @notice Check that CTAG token exists for a given computed token Id.
     *
     * @param _tokenId Token Id uint computed from tag string via computeTargetId().
     * @return true if CTAG token exists; false if not.
     */
    function tagExists(uint256 _tokenId) external view returns (bool);

    /**
     * @notice Retrieve a CTAG record for a given tag string.
     *
     * Note: returns a struct with empty members when no CTAG exists.
     *
     * @param _tag Tag string.
     * @return CTAG record as Tag struct.
     */
    function getTag(string calldata _tag) external view returns (Tag memory);

    /**
     * @notice Retrieve a CTAG record for a given token Id.
     *
     * Note: returns a struct with empty members when no CTAG exists.
     *
     * @param _tokenId CTAG token Id.
     * @return CTAG record as Tag struct.
     */
    function getTag(uint256 _tokenId) external view returns (Tag memory);

    /**
     * @notice Retrieve wallet address for ETS Platform.
     *
     * @return wallet address for ETS Platform.
     */
    function getPlatformAddress() external view returns (address payable);

    /**
     * @notice Retrieve Creator address for a CTAG token.
     *
     * @param _tokenId CTAG token Id.
     * @return _creator Creator address of the CTAG.
     */
    function getCreatorAddress(uint256 _tokenId) external view returns (address);

    /**
     * @notice Retrieve last renewal block timestamp for a CTAG.
     *
     * @param _tokenId CTAG token Id.
     * @return Block timestamp.
     */
    function getLastRenewed(uint256 _tokenId) external view returns (uint256);

    /**
     * @notice Retrieve CTAG ownership term length global setting.
     *
     * @return Term length in days.
     */
    function getOwnershipTermLength() external view returns (uint256);
}
