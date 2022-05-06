// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

/// @notice ETS core interface exposing ability for external contracts to integrate as tagging subcontracts
interface IETS {

    /// Structs

    /**
     * @dev Data structure for a tagging record.
     * @param etsTagIds Ids of ETSTAG token being used to tag a target.
     * @param targetId Id of target being tagged with ETSTAG.
     * @param tagger Address of wallet being credited with tagging record.
     * @param publisher Address of wallet being credited with enabling tagging record.
     * @param timestamp Time when target was tagged.
     */
    struct TaggingRecord {
        uint256[] etsTagIds;
        uint256 targetId;
        address tagger;
        address publisher;
        address sponsor;
    }

    /**
     * @dev Data structure for tagging targets
     * @param targetType Identifier for type of target being tagged
     *        TODO:
     *         1) Consider renaming in the struct to just 'type'
     *         2) depending on how types are coded/handled. consider
     *         a better datatype to hold this. eg. bytes2, bytes4
     *         and perhaps have that be a map of it's own eg:
     *           struct TaggingType {
     *             bytes8 name; // human readable name.
     *             address implemenation; // address of type contract implementation.
     *             address publisher; // address of third party that published implementation.
     *             uint created;
     *             bool enabled;
     *          }
     * @param targetURI Unique resource identifier for tagging target
     *        TODO:
     *        1) Consider calling just 'uri'
     *        2) Storage opmtimization of input string from client. eg.
     *           is there anyway to store URI as bytes32?
     * @param created timestamp of when target was created in ETS.
     * @param lastEnsured timestamp of when target was last ensured. Defaults to 0
     * @param status https status of last response from ensure target api eg. "404", "200". defaults to 0.
     * @param ipfsHash ipfsHash of additional metadata surrounding target provided by ETS Ensure target API.
     *        TODO:
     *        1) Optimization. Would be nice to do better than a string here (eg. bytes32).
     *        There's much talk/issues around the length of IPFS hashes and how to store them as bytes
     */
    struct Target {
        string targetType;
        string targetURI;
        uint created;
        uint lastEnsured;
        uint status;
        string ipfsHash;
    }

    /// Events

    event FundsWithdrawn(
        address indexed who,
        uint256 amount
    );

    event TaggingFeeSet(
        uint256 previousFee,
        uint256 taggingFee
    );

    event AccessControlsUpdated(
        address previousAccessControls,
        address newAccessControls
    );

    event ETSEnsureUpdated(
        address previousETSEnsure,
        address newETSEnsure
    );

    event PercentagesSet(
        uint256 platformPercentage,
        uint256 publisherPercentage,
        uint256 remainingPercentage
    );

    event TargetTypeSet(
        string typeName,
        bool setting
    );

    event TargetCreated(
        uint256 targetId
    );

    event TargetUpdated(
        uint256 targetId
    );

    event RequestEnsureTarget(
        uint256 targetId
    );

    event TargetTagged(
        uint256 taggingRecordId
    );

    event TaggingRecordUpdated (
      uint256 taggingRecordId
    );

    /// @notice Tag a target with an tag string.
    /// TODO: Finish documenting.
    function tagTarget(
        string[] calldata _tagStrings,
        string calldata _targetURI,
        address payable _publisher,
        address _tagger,
        address _sponsor,
        bool _ensure
    ) external payable;

    function taggingFee() external view returns (uint256);
}
