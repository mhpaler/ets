// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./IETSEnrichTarget.sol";
import "./IETSAccessControls.sol";

/**
 * @title IETSTarget
 * @author Ethereum Tag Service
 *
 * @notice This is the standard interface for ETS Targets. It includes both public and administration functions.
 */
interface IETSTarget {
    /**
     * @notice Data structure for a Target Tagger. Target Tagger contracts are the interfaces through
     * which external partes may call the ETS Core tagTarget() function and thereby record a tagging record.
     * Put another way, ETS Core tagging records may only be recorded though a Target Tagger contract.
     *
     * @param name Internal machine name for Target Tagger. Must be unique among all TTTs
     * @param taggerAddress Address of deployed Target Tagger address
     */
    struct TargetTagger {
        string name;
        address taggerAddress;
    }
    /**
     * @notice Data structure for an ETS Target. The core utility of ETS is to record connections between CTAGs
     * (our NFT token that represents a tag) and Targets. In ETS, a "Target" is our data structure, stored onchain,
     * that references/points to a URI.
     *
     * For context, from Wikipedia, URI is short for Uniform Resource Identifier and is a unique sequence of
     * characters that identifies a logical or physical resource used by web technologies. URIs may be used to
     * identify anything, including real-world objects, such as people and places, concepts, or information
     * resources such as web pages and books.
     *
     * For our purposes, as much as possible, we are restricting our interpretation of URIs to the more technical
     * parameters defined by the IETF in RFC3986 (https://www.rfc-editor.org/rfc/rfc3986). For newer protocols, such
     * as blockchains, other newer standards such a standards
     *
     * The thing to keep in mind with Targets & URIs is that differently shaped URIs can sometimes point to the same
     * resource. The effect of that is that different Target IDs in ETS can similarly point to the same resource.
     *
     * @param targetURI Unique resource identifier for a target
     * @param createdBy Address of TargetTagger that created target
     * @param created block timestamp when target was created in ETS
     * @param enriched block timestamp when target was last enriched. Defaults to 0
     * @param status https status of last response from ensure enrich api eg. "404", "200". defaults to 0
     * @param ipfsHash ipfsHash of additional metadata for target collected by ETS Enrich target API
     */
    struct Target {
        string targetURI;
        address createdBy;
        uint256 created;
        uint256 enriched;
        uint256 status;
        string ipfsHash;
    }

    event AccessControlsSet(IETSAccessControls etsAccessControls);

    event EnrichTargetSet(IETSEnrichTarget etsEnrichTarget);

    event TargetCreated(uint256 targetId);

    event TargetUpdated(uint256 targetId);

    /**
     * @notice Sets ETS access controls on the ETSTarget contract so that
     * functions can be restricted to being called by ETS platform only.
     *
     * @param _etsAccessControls Address of ETSAccessControls contract.
     */
    function setAccessControls(IETSAccessControls _etsAccessControls) external;

    /**
     * @notice Sets ETS Enrich target contract address so that target metadata enrichment
     * functions can be called from ETSTarget.
     *
     * @param _etsEnrichTarget Address of ETSEnrichTarget contract.
     */
    function setEnrichTarget(IETSEnrichTarget _etsEnrichTarget) external;

    function getOrCreateTargetId(string memory _targetURI) external returns (uint256);

    function createTarget(string memory _targetURI) external returns (uint256 targetId);

    function updateTarget(
        uint256 _targetId,
        string calldata _targetURI,
        uint256 _enriched,
        uint256 _status,
        string calldata _ipfsHash
    ) external returns (bool success);

    function computeTargetId(string memory _targetURI) external view returns (uint256 targetId);

    function targetExists(string memory _targetURI) external view returns (bool);

    function targetExists(uint256 _targetId) external view returns (bool);

    function getTarget(string memory _targetURI) external view returns (Target memory);

    function getTarget(uint256 _targetId) external view returns (Target memory);
}
