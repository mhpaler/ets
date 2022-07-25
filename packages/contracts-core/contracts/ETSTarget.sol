// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./utils/StringHelpers.sol";
import "./interfaces/IETSTarget.sol";
import "./interfaces/IETSEnrichTarget.sol";
import "./interfaces/IETSAccessControls.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/math/SafeMathUpgradeable.sol";

import "hardhat/console.sol";

/**
 * @title IETSTarget
 * @author Ethereum Tag Service <team@ets.xyz>
 *
 * @notice This is the standard interface for the core ETSTarget.sol contract. It includes both public
 * and administration functions.
 *
 * In ETS, a "Target" is our data structure, stored onchain, that references/points to a URI.
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
contract ETSTarget is IETSTarget, UUPSUpgradeable, StringHelpers {
    using AddressUpgradeable for address;
    using SafeMathUpgradeable for uint256;

    IETSAccessControls public etsAccessControls;

    IETSEnrichTarget public etsEnrichTarget;

    // Public constants

    string public constant NAME = "ETSTarget";

    /// @dev Map of targetId to Target struct.
    mapping(uint256 => Target) public targets;

    // Modifiers

    modifier onlyAdmin() {
        require(etsAccessControls.isAdmin(msg.sender), "Caller must have administrator access");
        _;
    }

    // ============ UUPS INTERFACE ============

    function initialize(address _etsAccessControls) public initializer {
        etsAccessControls = IETSAccessControls(_etsAccessControls);
    }

    function _authorizeUpgrade(address) internal override onlyAdmin {}

    // ============ OWNER INTERFACE ============

    /// @inheritdoc IETSTarget
    function setAccessControls(address _etsAccessControls) public onlyAdmin {
        require(address(_etsAccessControls) != address(0), "Access controls cannot be zero");
        etsAccessControls = IETSAccessControls(_etsAccessControls);
        emit AccessControlsSet(address(_etsAccessControls));
    }

    /// @inheritdoc IETSTarget
    function setEnrichTarget(address _etsEnrichTarget) public onlyAdmin {
        require(address(_etsEnrichTarget) != address(0), "ETSEnrichTarget address cannot be zero");
        etsEnrichTarget = IETSEnrichTarget(_etsEnrichTarget);
        emit EnrichTargetSet(_etsEnrichTarget);
    }

    // ============ PUBLIC INTERFACE ============

    /// @inheritdoc IETSTarget
    function getOrCreateTargetId(string memory _targetURI) public returns (uint256) {
        uint256 _targetId = computeTargetId(_targetURI);
        if (targets[_targetId].created != 0) {
            return _targetId;
        }

        return createTarget(_targetURI);
    }

    /// @inheritdoc IETSTarget
    function createTarget(string memory _targetURI) public returns (uint256 targetId) {
        require(!targetExists(_targetURI), "target id exists");

        uint256 _targetId = computeTargetId(_targetURI);
        targets[_targetId] = Target({
            targetURI: _targetURI,
            createdBy: msg.sender,
            created: block.timestamp,
            enriched: 0,
            httpStatus: 0,
            ipfsHash: ""
        });
        emit TargetCreated(_targetId);
        return _targetId;
    }

    /// @inheritdoc IETSTarget
    function updateTarget(
        uint256 _targetId,
        string calldata _targetURI,
        uint256 _enriched,
        uint256 _httpStatus,
        string calldata _ipfsHash
    ) external returns (bool success) {
        require(msg.sender == address(etsEnrichTarget), "Only ETSEnrichTarget may update target");
        targets[_targetId].targetURI = _targetURI;
        targets[_targetId].enriched = _enriched;
        targets[_targetId].httpStatus = _httpStatus;
        targets[_targetId].ipfsHash = _ipfsHash;

        emit TargetUpdated(_targetId);
        return true;
    }

    // ============ PUBLIC VIEW FUNCTIONS ============

    /// @inheritdoc IETSTarget
    function computeTargetId(string memory _targetURI) public pure returns (uint256) {
        // ? Should we lowercase
        bytes32 targetId = keccak256(bytes(_targetURI));
        return uint256(targetId);
    }

    /// @inheritdoc IETSTarget
    function targetExists(string memory _targetURI) public view returns (bool) {
        uint256 targetId = computeTargetId(_targetURI);
        return targetExists(targetId);
    }

    /// @inheritdoc IETSTarget
    function targetExists(uint256 _targetId) public view returns (bool) {
        return targets[_targetId].created > 0 ? true : false;
    }

    /// @inheritdoc IETSTarget
    function getTarget(string memory _targetURI) public view returns (Target memory) {
        uint256 targetId = computeTargetId(_targetURI);
        return getTarget(targetId);
    }

    /// @inheritdoc IETSTarget
    function getTarget(uint256 _targetId) public view returns (Target memory) {
        return targets[_targetId];
    }
}
