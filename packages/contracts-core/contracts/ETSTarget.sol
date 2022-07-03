// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./utils/StringHelpers.sol";
import "./interfaces/IETSTarget.sol";
import "./interfaces/IETSEnrichTarget.sol";
import "./interfaces/IETSTargetTagger.sol";
import "./interfaces/IETSAccessControls.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/math/SafeMathUpgradeable.sol";

import "hardhat/console.sol";

contract ETSTarget is IETSTarget, UUPSUpgradeable, StringHelpers {
    using AddressUpgradeable for address;
    using SafeMathUpgradeable for uint256;

    IETSAccessControls public etsAccessControls;

    IETSEnrichTarget public etsEnrichTarget;

    /// Public constants

    string public constant NAME = "ETSTarget";
    string public constant VERSION = "0.0.1";

    /// @notice Target name to target type contract address or zero if nothing assigned
    mapping(string => address) public targetTaggerByName;

    /// @notice Target contract address to registered name or empty string if nothing assigned
    mapping(address => string) public targetTaggerByAddress;

    /// @notice If target tagger contract is paused by the protocol.
    mapping(address => bool) public isTargetTaggerPaused;

    /// @dev Map of targetId to Target struct.
    mapping(uint256 => Target) public targets;

    /// Modifiers

    modifier onlyAdmin() {
        require(etsAccessControls.isAdmin(msg.sender), "Caller must have administrator access");
        _;
    }

    modifier onlyPublisher() {
        require(etsAccessControls.isPublisher(msg.sender), "Caller is not publisher");
        _;
    }

    // ============ UUPS INTERFACE ============

    function initialize(IETSAccessControls _etsAccessControls) public initializer {
        etsAccessControls = _etsAccessControls;
    }

    function _authorizeUpgrade(address) internal override onlyAdmin {}

    // ============ OWNER INTERFACE ============

    function setAccessControls(IETSAccessControls _etsAccessControls) public onlyAdmin {
        require(address(_etsAccessControls) != address(0), "ETSAccessControls address cannot be zero");
        etsAccessControls = _etsAccessControls;
        emit AccessControlsSet(_etsAccessControls);
    }

    function setEnrichTarget(IETSEnrichTarget _etsEnrichTarget) public onlyAdmin {
        require(address(_etsEnrichTarget) != address(0), "ETSEnrichTarget address cannot be zero");
        etsEnrichTarget = _etsEnrichTarget;
        emit EnrichTargetSet(_etsEnrichTarget);
    }

    /// @notice Add a new target tagger smart contract to the ETS protocol.
    function addTargetTagger(address _taggerAddress, string calldata _name) public onlyAdmin {
        require(
            etsAccessControls.isAdmin(_taggerAddress) ||
                IERC165(_taggerAddress).supportsInterface(type(IETSTargetTagger).interfaceId),
            "Address not admin or required interface"
        );

        targetTaggerByName[_name] = _taggerAddress;
        targetTaggerByAddress[_taggerAddress] = _name;
        emit TargetTaggerAdded(_taggerAddress);
    }

    /// @notice Remove a target type smart contract from the protocol
    function removeTargetTagger(address _taggerAddress) external onlyAdmin {
        require(isTargetTagger(_taggerAddress), "invalid target tagger");
        string memory targetTaggerName = targetTaggerByAddress[_taggerAddress];
        delete targetTaggerByName[targetTaggerName];
        delete targetTaggerByAddress[_taggerAddress];
        emit TargetTaggerRemoved(_taggerAddress);
    }

    /// @notice Toggle whether the target type is paused or not
    function toggleIsTargetTaggerPaused(address _smartContract) external onlyAdmin {
        isTargetTaggerPaused[_smartContract] = !isTargetTaggerPaused[_smartContract];
        emit TargetTaggerPauseToggled(isTargetTaggerPaused[_smartContract]);
    }

    // ============ PUBLIC INTERFACE ============

    /// @notice Get a targetId from target type and target URI.
    function getOrCreateTargetId(string memory _targetURI) public returns (uint256) {
        uint256 _targetId = computeTargetId(_targetURI);
        if (targets[_targetId].created != 0) {
            return _targetId;
        }

        return createTarget(_targetURI);
    }

    function createTarget(string memory _targetURI) public returns (uint256 targetId) {
        require(!targetExists(_targetURI), "target id exists");

        uint256 _targetId = computeTargetId(_targetURI);
        targets[_targetId] = Target({
            targetURI: _targetURI,
            createdBy: msg.sender,
            created: block.timestamp,
            enriched: 0, // if null, target has never been ensured.
            status: 0,
            ipfsHash: ""
        });
        emit TargetCreated(_targetId);
        return _targetId;
    }

    /// @notice Updates a target with new values.
    /// @return success boolean
    function updateTarget(
        uint256 _targetId,
        string calldata _targetURI,
        uint256 _enriched,
        uint256 _status,
        string calldata _ipfsHash
    ) external returns (bool success) {
        require(msg.sender == address(etsEnrichTarget), "Only ETS ensure");
        targets[_targetId].targetURI = _targetURI;
        targets[_targetId].enriched = _enriched;
        targets[_targetId].status = _status;
        targets[_targetId].ipfsHash = _ipfsHash;

        emit TargetUpdated(_targetId);
        return true;
    }

    // ============ PUBLIC VIEW FUNCTIONS ============

    function computeTargetId(string memory _targetURI) public pure returns (uint256) {
        string memory parts = string(abi.encodePacked(_targetURI));
        bytes32 targetId = keccak256(bytes(parts));
        return uint256(targetId);
    }

    function targetExists(string memory _targetURI) public view returns (bool) {
        uint256 targetId = computeTargetId(_targetURI);
        return targetExists(targetId);
    }

    function targetExists(uint256 _targetId) public view returns (bool) {
        return targets[_targetId].created > 0 ? true : false;
    }

    function getTarget(string memory _targetURI) public view returns (Target memory) {
        uint256 targetId = computeTargetId(_targetURI);
        return getTarget(targetId);
    }

    function getTarget(uint256 _targetId) public view returns (Target memory) {
        return targets[_targetId];
    }

    function isTargetTagger(string memory _taggerName) public view returns (bool) {
        return targetTaggerByName[_taggerName] != address(0);
    }

    function isTargetTagger(address _smartContract) public view returns (bool) {
        return bytes(targetTaggerByAddress[_smartContract]).length != 0;
    }

    /// @notice Checks whether an address has the target type contract role and is not paused from tagging
    /// @param _smartContract Address being checked
    function isTargetTaggerAndNotPaused(address _smartContract) public view returns (bool) {
        return isTargetTagger(_smartContract) && !isTargetTaggerPaused[_smartContract];
    }
}
