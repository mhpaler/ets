// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./utils/StringHelpers.sol";
import "./interfaces/IETSTarget.sol";
import "./interfaces/IETSEnrichTarget.sol";
import "./interfaces/IETSAccessControls.sol";
import "./interfaces/IETSTargetTypeTagger.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/math/SafeMathUpgradeable.sol";

import "hardhat/console.sol";

abstract contract ETSTarget is IETSTarget, UUPSUpgradeable, StringHelpers {
    using AddressUpgradeable for address;
    using SafeMathUpgradeable for uint256;

    IETSAccessControls public etsAccessControls;

    IETSEnrichTarget public etsEnrichTarget;

    /// Public constants

    string public constant NAME = "ETSTarget";
    string public constant VERSION = "0.0.1";

    /// @notice Target type name to target type contract address or zero if nothing assigned
    mapping(string => TargetTypeTagger) public targetTypeTaggerByName;

    /// @notice Target type contract address to registered name or empty string if nothing assigned
    mapping(address => TargetTypeTagger) public targetTypeTaggerByAddress;

    /// @notice If target type tagger contract is paused by the protocol.
    mapping(address => bool) public isTargetTypeTaggerPaused;

    /// @notice Map of Target Types
    mapping(string => bool) public targetTypes;

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

    function addTargetType(string calldata _targetType, bool _enabled) public onlyAdmin {
        targetTypes[_targetType] = _enabled;
        emit TargetTypeAdded(_targetType, _enabled);
    }

    /// @notice Add a new target type smart contract to the ETS protocol. Tagging a target
    /// is executed through a target type "subcontract" calling ETS core.
    /// Note: Admin addresses can be added as target type to permit calling ETS core directly
    /// for tagging testing and debugging purposes.
    function addTargetTypeTagger(
        string calldata _name,
        string calldata _targetType,
        address _smartContract
    ) external onlyAdmin {
        require(targetTypes[_targetType], "invalid target type");
        require(
            etsAccessControls.isAdmin(_smartContract) ||
                IERC165(_smartContract).supportsInterface(type(IETSTargetTypeTagger).interfaceId),
            "Address not admin or required interface"
        );

        TargetTypeTagger memory targetTypeTagger = TargetTypeTagger({
            name: _name,
            targetType: _targetType,
            taggerAddress: _smartContract
        });

        targetTypeTaggerByName[_name] = targetTypeTagger;
        targetTypeTaggerByAddress[_smartContract] = targetTypeTagger;
        emit TargetTypeTaggerAdded(_smartContract);
    }

    /// @notice Remove a target type smart contract from the protocol
    function removeTargetTypeTagger(address _smartContract) external onlyAdmin {
        TargetTypeTagger memory targetTypeTagger = targetTypeTaggerByAddress[_smartContract];
        delete targetTypeTaggerByName[targetTypeTagger.name];
        delete targetTypeTaggerByAddress[_smartContract];
        emit TargetTypeTaggerRemoved(_smartContract);
    }

    /// @notice Toggle whether the target type is paused or not
    function toggleIsTargetTypeTaggerPaused(address _smartContract) external onlyAdmin {
        isTargetTypeTaggerPaused[_smartContract] = !isTargetTypeTaggerPaused[_smartContract];
        emit TargetTypeTaggerPauseToggled(_smartContract, isTargetTypeTaggerPaused[_smartContract]);
    }

    // ============ PUBLIC INTERFACE ============

    /// @notice Get a targetId from target type and target uri.
    function getOrCreateTargetId(string memory _targetType, string memory _targetURI) public returns (uint256) {
        uint256 _targetId = computeTargetId(_targetType, _targetURI);
        if (targets[_targetId].created != 0) {
            return _targetId;
        }

        return createTarget(_targetType, _targetURI);
    }

    ///
    function createTarget(string memory _targetType, string memory _targetURI) public returns (uint256 targetId) {
        require(!targetExists(_targetType, _targetURI), "target id exists");

        uint256 _targetId = computeTargetId(_targetType, _targetURI);
        targets[_targetId] = Target({
            targetType: _targetType,
            targetURI: _targetURI, // todo: consider ways to encode _targetURI as some sort of fixed length bytes type.
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
        string calldata _targetType,
        string calldata _targetURI,
        uint256 _enriched,
        uint256 _status,
        string calldata _ipfsHash
    ) external returns (bool success) {
        // TODO - should others be able to update a target?
        require(msg.sender == address(etsEnrichTarget), "Only ETS ensure");

        targets[_targetId].targetType = _targetType;
        targets[_targetId].targetURI = _targetURI;
        targets[_targetId].enriched = _enriched;
        targets[_targetId].status = _status;
        targets[_targetId].ipfsHash = _ipfsHash;

        emit TargetUpdated(_targetId);
        return true;
    }

    // ============ PUBLIC VIEW FUNCTIONS ============

    function computeTargetId(string memory _targetType, string memory _targetURI) public view returns (uint256) {
        require(isTargetType(_targetType), "invalid target type");
        string memory parts = string(abi.encodePacked(_targetType, _targetURI));
        bytes32 targetId = keccak256(bytes(parts));
        return uint256(targetId);
    }

    function targetExists(string memory _targetType, string memory _targetURI) public view returns (bool) {
        uint256 targetId = computeTargetId(_targetType, _targetURI);
        return targetExists(targetId);
    }

    function targetExists(uint256 _targetId) public view returns (bool) {
        return targets[_targetId].created > 0 ? true : false;
    }

    function getTarget(string memory _targetType, string memory _targetURI) public view returns (Target memory) {
        uint256 targetId = computeTargetId(_targetType, _targetURI);
        return getTarget(targetId);
    }

    function getTarget(uint256 _targetId) public view returns (Target memory) {
        return targets[_targetId];
    }

    function isTargetType(string memory _targetType) public view returns (bool) {
        return targetTypes[_targetType];
    }

    function isTargetTypeTagger(address _smartContract) public view returns (bool) {
        return targetTypeTaggerByAddress[_smartContract].taggerAddress == _smartContract ? true : false;
    }

    /// @notice Checks whether an address has the target type contract role and is not paused from tagging
    /// @param _smartContract Address being checked
    function isTargetTypeTaggerAndNotPaused(address _smartContract) public view returns (bool) {
        return isTargetTypeTagger(_smartContract) && !isTargetTypeTaggerPaused[_smartContract];
    }
}
