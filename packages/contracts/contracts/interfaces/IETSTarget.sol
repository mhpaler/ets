// SPDX-License-Identifier: MIT

/**
 * @title IETSTarget
 * @author Ethereum Tag Service <team@ets.xyz>
 *
 *  ███████╗████████╗███████╗
 *  ██╔════╝╚══██╔══╝██╔════╝
 *  █████╗     ██║   ███████╗
 *  ██╔══╝     ██║   ╚════██║
 *  ███████╗   ██║   ███████║`
 *  ╚══════╝   ╚═╝   ╚══════╝
 *
 * @notice This is the standard interface for the core ETSTarget.sol contract. It includes both public
 * and administration functions.
 *
 * In ETS, a "Target" is our data structure, stored onchain, that references/points to a URI. Target records
 * are identified in ETS by their Id (targetId) which is a unsigned integer computed from the URI string.
 * Target Ids are combined with CTAG Ids by ETS core (ETS.sol) to form "Tagging Records".
 *
 * For context, from Wikipedia, URI is short for Uniform Resource Identifier and is a unique sequence of
 * characters that identifies a logical or physical resource used by web technologies. URIs may be used to
 * identify anything, including real-world objects, such as people and places, concepts, or information
 * resources such as web pages and books.
 *
 * For our purposes, as much as possible, we are restricting our interpretation of URIs to the more technical
 * parameters defined by the IETF in [RFC3986](https://www.rfc-editor.org/rfc/rfc3986). For newer protocols, such
 * as blockchains, For newer protocols, such as blockchains we will lean on newer emerging URI standards such
 * as the [Blink](https://w3c-ccg.github.io/blockchain-links) and [BIP-122](https://github.com/bitcoin/bips/blob/master/bip-0122.mediawiki)
 *
 * One the thing to keep in mind with URIs & ETS Targets is that differently shaped URIs can sometimes point to the same
 * resource. The effect of that is that different Target IDs in ETS can similarly point to the same resource.
 */

pragma solidity ^0.8.10;

interface IETSTarget {
    // Custom errors
    error AccessDenied(address caller);
    error AddressCannotBeZero();
    error CallerNotAdminInNewContract(address caller);
    error BadAddress();
    error TargetIdExists(string targetURI);
    error EmptyTarget();

    /**
     * @notice Data structure for an ETS Target.
     *
     * @param targetURI Unique resource identifier Target points to
     * @param createdBy Address of IETSTargetTagger implementation that created Target
     */
    struct Target {
        string targetURI;
        address createdBy;
    }

    /**
     * @dev emitted when the ETSAccessControls is set.
     *
     * @param etsAccessControls contract address ETSAccessControls is set to.
     */
    event AccessControlsSet(address etsAccessControls);

    /**
     * @dev emitted when a target enrichment is requested.
     *
     * @param targetId The target ID to enrich.
     * @param requestor Address requesting the enrichment.
     */
    event EnrichTargetRequested(uint256 indexed targetId, address indexed requestor);

    /**
     * @dev emitted when target metadata is enriched.
     *
     * @param targetId The target ID being enriched.
     * @param title The extracted title metadata.
     * @param description The extracted description metadata.
     * @param imageUrl The extracted image URL metadata.
     * @param keywords Comma-separated keywords metadata.
     */
    event TargetEnriched(
        uint256 indexed targetId,
        string title,
        string description,
        string imageUrl,
        string keywords
    );

    /**
     * @dev emitted when a new Target is created.
     *
     * @param targetId Unique Id of new Target.
     */
    event TargetCreated(uint256 targetId);


    /**
     * @notice Get ETS targetId from URI.
     *
     * Combo function that given a URI string will return it's ETS targetId if it exists,
     * or create a new Target record and return corresponding targetId.
     *
     * @param _targetURI URI passed in as string
     * @return Id of ETS Target record
     */
    function getOrCreateTargetId(string memory _targetURI) external returns (uint256);

    /**
     * @notice Create a Target record and return it's targetId.
     *
     * @param _targetURI URI passed in as string
     * @return targetId Id of ETS Target record
     */
    function createTarget(string memory _targetURI) external returns (uint256 targetId);


    /**
     * @notice Function to deterministically compute & return a targetId.
     *
     * Every Target in ETS is mapped to by it's targetId. This Id is computed from
     * the target URI sting hashed and cast as a uint256.
     *
     * Note: Function does not verify if Target record exists.
     *
     * @param _targetURI Unique resource identifier Target record points to.
     * @return targetId Id of the potential Target record.
     */
    function computeTargetId(string memory _targetURI) external view returns (uint256 targetId);

    /**
     * @notice Check that a Target record exists for a given URI string.
     *
     * @param _targetURI Unique resource identifier Target record points to.
     * @return true if Target record exists; false if not.
     */
    function targetExistsByURI(string memory _targetURI) external view returns (bool);

    /**
     * @notice Check that a Target record exists for a given computed targetId.
     *
     * @param _targetId targetId uint computed from URI via computeTargetId().
     * @return true if Target record exists; false if not.
     */
    function targetExistsById(uint256 _targetId) external view returns (bool);

    /**
     * @notice Retrieve a Target record for a given URI string.
     *
     * Note: returns a struct with empty members when no Target exists.
     *
     * @param _targetURI Unique resource identifier Target record points to.
     * @return Target record.
     */
    function getTargetByURI(string memory _targetURI) external view returns (Target memory);

    /**
     * @notice Retrieve a Target record for a computed targetId.
     *
     * Note: returns a struct with empty members when no Target exists.
     *
     * @param _targetId targetId uint computed from URI via computeTargetId().
     * @return Target record.
     */
    function getTargetById(uint256 _targetId) external view returns (Target memory);

    /**
     * @notice Request to enrich a target's metadata.
     *
     * @param _targetId The target ID to enrich.
     * @dev Emits EnrichTargetRequested event for the Event Processor to handle.
     */
    function requestEnrichTarget(uint256 _targetId) external;

    /**
     * @notice Emit enrichment data for a target (called by Event Processor).
     *
     * @param _targetId The target ID being enriched.
     * @param _title The extracted title metadata.
     * @param _description The extracted description metadata.
     * @param _imageUrl The extracted image URL metadata.
     * @param _keywords Comma-separated keywords metadata.
     * @dev Only callable by EVENT_PROCESSOR_ROLE.
     * @dev Emits TargetEnriched event for The Graph to index.
     */
    function enrichTarget(
        uint256 _targetId,
        string memory _title,
        string memory _description,
        string memory _imageUrl,
        string memory _keywords
    ) external;
}
