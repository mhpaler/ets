// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title IETSTarget
 * @author Ethereum Tag Service <team@ets.xyz>
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
interface IETSTarget {
    /**
     * @notice Data structure for an ETS Target.
     *
     * @param targetURI Unique resource identifier Target points to
     * @param createdBy Address of IETSTargetTagger implementation that created Target
     * @param created block timestamp when Target was created in ETS
     * @param enriched block timestamp when Target was last enriched. Defaults to 0
     * @param httpStatus https status of last response from ETSEnrichTarget API eg. "404", "200". defaults to 0
     * @param ipfsHash ipfsHash of additional metadata for Target collected by ETSEnrichTarget API
     */
    struct Target {
        string targetURI;
        address createdBy;
        uint256 created;
        uint256 enriched;
        uint256 httpStatus;
        string ipfsHash;
    }

    /**
     * @dev emitted when the ETSAccessControls is set.
     *
     * @param etsAccessControls contract address ETSAccessControls is set to.
     */
    event AccessControlsSet(address etsAccessControls);

    /**
     * @dev emitted when the ETSEnrichTarget API address is set.
     *
     * @param etsEnrichTarget contract address ETSEnrichTarget is set to.
     */
    event EnrichTargetSet(address etsEnrichTarget);

    /**
     * @dev emitted when a new Target is created.
     *
     * @param targetId Unique Id of new Target.
     */
    event TargetCreated(uint256 targetId);

    /**
     * @dev emitted when an existing Target is updated.
     *
     * @param targetId Id of Target being updated.
     */
    event TargetUpdated(uint256 targetId);

    /**
     * @notice Sets ETSAccessControls on the ETSTarget contract so functions can be
     * restricted to ETS platform only.
     *
     * @param _etsAccessControls Address of ETSAccessControls contract.
     */
    function setAccessControls(address _etsAccessControls) external;

    /**
     * @notice Sets ETSEnrichTarget contract address so that Target metadata enrichment
     * functions can be called from ETSTarget.
     *
     * @param _etsEnrichTarget Address of ETSEnrichTarget contract.
     */
    function setEnrichTarget(address _etsEnrichTarget) external;

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
     * @notice Update a Target record.
     *
     * @param _targetId Id of Target being updated.
     * @param _targetURI Unique resource identifier Target points to.
     * @param _enriched block timestamp when Target was last enriched
     * @param _httpStatus https status of last response from ETSEnrichTarget API eg. "404", "200". defaults to 0
     * @param _ipfsHash ipfsHash of additional metadata for Target collected by ETSEnrichTarget API

     * @return success true when Target is successfully updated.
     */
    function updateTarget(
        uint256 _targetId,
        string calldata _targetURI,
        uint256 _enriched,
        uint256 _httpStatus,
        string calldata _ipfsHash
    ) external returns (bool success);

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
    function targetExists(string memory _targetURI) external view returns (bool);

    /**
     * @notice Check that a Target record exists for a given computed targetId.
     *
     * @param _targetId targetId uint computed from URI via computeTargetId().
     * @return true if Target record exists; false if not.
     */
    function targetExists(uint256 _targetId) external view returns (bool);

    /**
     * @notice Retrieve a Target record for a given URI string.
     *
     * Note: returns a struct with empty members when no Target exists.
     *
     * @param _targetURI Unique resource identifier Target record points to.
     * @return Target record.
     */
    function getTarget(string memory _targetURI) external view returns (Target memory);

    /**
     * @notice Retrieve a Target record for a computed targetId.
     *
     * Note: returns a struct with empty members when no Target exists.
     *
     * @param _targetId targetId uint computed from URI via computeTargetId().
     * @return Target record.
     */
    function getTarget(uint256 _targetId) external view returns (Target memory);
}
