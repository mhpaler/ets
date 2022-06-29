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
     * @notice Data structure for a Target Type Tagger. Target Type Tagger contracts are the interfaces through
     * which external partes may call the ETS Core tagTarget() function and thereby record a tagging record.
     * Put another way, ETS Core tagging records may only be recorded though a Target Type Tagger contract.
     *
     * Target Type Tagger contracts deployed by third-parties must be approved/activated by ETS Core dev team.
     * As it's name implies, a Target Type Tagger permits tagging of a specific target type. Target types are
     * any internet addressable artifact, entities or objects registered within ETS. See "setTargetType()" below
     * for more details.
     *
     * @param name Internal machine name for target type tagger. Must be unique among all TTTs
     * @param targetType Valid & enabled machine name for type of target this tagger may tag
     * @param taggerAddress Address of deployed Target Type Tagger address
     */
    struct TargetTypeTagger {
        string name;
        string targetType;
        address taggerAddress;
    }
    /**
     * @notice Data structure for an ETS Target. The core utility of ETS is to record connections between CTAGs
     * (our NFT token that represents a tag) and Targets. In ETS, a "Target" is data structure, stored onchain,
     * that references/points to to a uniquely identifiable artifact or entity on the internet.
     *
     * Examples of Targets include an EVM Compatible NFT, a wallet address on any blockchain, a website or web page,
     * a Tweet. Each Target in ETS is identified by a unique, uint256 ID that is a composite key of targetType
     * and targetURI.
     *
     * @param targetType Valid & enabled machine name for type of target this tagger may tag
     * @param targetURI Unique resource identifier for a target
     * @param created block timestamp when target was created in ETS
     * @param enriched block timestamp when target was last enriched. Defaults to 0
     * @param status https status of last response from ensure enrich api eg. "404", "200". defaults to 0
     * @param ipfsHash ipfsHash of additional metadata for target collected by ETS Enrich target API
     */
    struct Target {
        string targetType;
        string targetURI;
        uint256 created;
        uint256 enriched;
        uint256 status;
        string ipfsHash;
    }

    event AccessControlsSet(IETSAccessControls etsAccessControls);

    event EnrichTargetSet(IETSEnrichTarget etsEnrichTarget);

    event TargetTypeAdded(string _targetType, bool enabled);

    event TargetTypeTaggerAdded(address smartContract);

    event TargetTypeTaggerRemoved(address smartContract);

    event TargetTypeTaggerPauseToggled(address targetType, bool newValue);

    event TargetCreated(uint256 targetId);

    event TargetUpdated(uint256 targetId);

    function setAccessControls(IETSAccessControls _etsAccessControls) external;

    function setEnrichTarget(IETSEnrichTarget _etsEnrichTarget) external;

    function addTargetType(string calldata _targetType, bool _enabled) external;

    function addTargetTypeTagger(address _smartContract, string calldata _name) external;

    function removeTargetTypeTagger(address _smartContract) external;

    function toggleIsTargetTypeTaggerPaused(address _smartContract) external;

    function getOrCreateTargetId(string memory _targetType, string memory _targetURI) external returns (uint256);

    function createTarget(string memory _targetType, string memory _targetURI) external returns (uint256 targetId);

    function updateTarget(
        uint256 _targetId,
        string calldata _targetType,
        string calldata _targetURI,
        uint256 _enriched,
        uint256 _status,
        string calldata _ipfsHash
    ) external returns (bool success);

    function computeTargetId(string memory _targetType, string memory _targetURI)
        external
        view
        returns (uint256 targetId);

    function targetExists(string memory _targetType, string memory _targetURI) external view returns (bool);

    function targetExists(uint256 _targetId) external view returns (bool);

    function getTarget(string memory _targetType, string memory _targetURI) external view returns (Target memory);

    function getTarget(uint256 _targetId) external view returns (Target memory);

    function isTargetType(string memory _targetTypeName) external view returns (bool);

    function isTargetTypeTagger(address _smartContract) external view returns (bool);

    function isTargetTypeTaggerAndNotPaused(address _smartContract) external view returns (bool);
}
