// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./interfaces/IETSTarget.sol";
import "./interfaces/IETSAccessControls.sol";
import "./utils/StringHelpers.sol";
import "@openzeppelin/contracts-upgradeable/utils/math/SafeMathUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

import "hardhat/console.sol";

contract ETSTarget is IETSTarget, UUPSUpgradeable, StringHelpers {
    using AddressUpgradeable for address;
    using SafeMathUpgradeable for uint256;

    IETSAccessControls public etsAccessControls;

    /// @notice Target type name to target type contract address or zero if nothing assigned
    mapping(string => address) public targetTypeToContract;

    /// @notice Target type contract address to registered name or empty string if nothing assigned
    mapping(address => string) public targetTypeContractName;

    /// @notice If target type is paused by the protocol
    mapping(address => bool) public isTargetTypePaused;

    /// @dev Map of target id to Target embodied by Target struct.
    mapping(uint256 => Target) public targets;

    /// Modifiers

    modifier onlyAdmin() {
        require(etsAccessControls.isAdmin(_msgSender()), "Caller must have administrator access");
        _;
    }

    modifier onlyPublisher() {
        require(etsAccessControls.isPublisher(_msgSender()), "Caller is not publisher");
        _;
    }

    // ============ UUPS INTERFACE ============

    function initialize(IETSAccessControls _etsAccessControls) public initializer {
        etsAccessControls = _etsAccessControls;
    }

    function _authorizeUpgrade(address) internal override onlyAdmin {}

    // ============ OWNER INTERFACE ============

    /// @notice Add a new target type smart contract to the ETS protocol. Tagging a target
    /// is executed through a target type "subcontract" calling ETS core.
    /// Note: Admin addresses can be added as target type to permit calling ETS core directly
    /// for tagging testing and debugging purposes.
    function addTargetType(address _smartContract, string calldata _name) external onlyAdmin {
        require(
            etsAccessControls.isAdmin(_smartContract) ||
                IERC165(_smartContract).supportsInterface(type(IETSTargetType).interfaceId),
            "Address not admin or required interface"
        );
        targetTypeToContract[_name] = _smartContract;
        targetTypeContractName[_smartContract] = _name;
        emit TargetTypeAdded(_smartContract);
    }

    /// @notice Remove a target type smart contract from the protocol
    function removeTargetType(address _smartContract) external onlyAdmin {
        delete targetTypeToContract[targetTypeContractName[_smartContract]];
        delete targetTypeContractName[_smartContract];
        emit TargetTypeRemoved(_smartContract);
    }

    /// @notice Toggle whether the target type is paused or not
    function toggleIsTargetTypePaused(address _smartContract) external onlyAdmin {
        isTargetTypePaused[_smartContract] = !isTargetTypePaused[_smartContract];
        emit TargetTypePauseToggled(_smartContract, isTargetTypePaused[_smartContract]);
    }

    // ============ PUBLIC INTERFACE ============

    /// @notice Get a target Id from target type and target uri.
    /// TODO: Perhaps rename this with a better name, because it's
    /// also creating a target record if it doesn't exist?
    // Or perthaps breakout another function called create target?
    function _getOrCreateTarget(string memory _targetType, string memory _targetURI)
        private
        returns (uint256 targetId)
    {
        uint256 _targetId = computeTargetId(_targetType, _targetURI);
        if (targets[_targetId].created != 0) {
            return _targetId;
        }
        return _createTarget(_targetType, _targetURI);
    }

    /// TODO: vince should this be payable & non-reentrant?
    function createTarget(string memory _targetType, string memory _targetURI) public returns (uint256 targetId) {
        uint256 _targetId = computeTargetId(_targetType, _targetURI);
        targets[_targetId] = Target({
            targetType: _targetType,
            targetURI: _targetURI, // todo: consider ways to encode _targetURI as some sort of fixed length bytes type.
            created: block.timestamp,
            lastEnsured: 0, // if null, target has never been ensured.
            status: 0,
            ipfsHash: ""
        });
        emit TargetCreated(_targetId);
        return _targetId;
    }

    function createTag(string calldata _tag, address payable _publisher) public payable returns (uint256 _tokenId) {
        // todo - add nonReentrant due to safeMint
        require(etsAccessControls.isPublisher(_publisher), "ETS: Not a publisher");

        // Perform basic tag string validation.
        uint256 tagId = _assertTagIsValid(_tag);

        // mint the token, transferring it to the platform.
        _safeMint(platform, tagId);

        // Store CTAG data in state.
        tokenIdToTag[tagId] = Tag({
            display: _tag,
            publisher: _publisher,
            creator: _msgSender(),
            premium: isTagPremium[__lower(_tag)],
            reserved: isTagPremium[__lower(_tag)]
        });

        return tagId;
    }

    /// @notice Updates a target with new values.
    /// @return success boolean
    function updateTarget(
        uint256 _targetId,
        string calldata _targetType,
        string calldata _targetURI,
        uint256 _lastEnsured,
        uint256 _status,
        string calldata _ipfsHash
    ) external returns (bool success) {
        // TODO - check whether anyone else needs access to this method
        require(msg.sender == address(etsEnsure), "Only ETS ensure");

        targets[_targetId].targetType = _targetType;
        targets[_targetId].targetURI = _targetURI;
        targets[_targetId].lastEnsured = _lastEnsured;
        targets[_targetId].status = _status;
        targets[_targetId].ipfsHash = _ipfsHash;

        emit TargetUpdated(_targetId);
        return true;
    }

    // ============ PUBLIC VIEW FUNCTIONS ============

    function computeTargetId(string memory _targetType, string memory _targetURI)
        public
        pure
        returns (uint256 targetId)
    {
        string memory parts = string(abi.encodePacked(_targetType, _targetURI));
        // The following is how ENS creates ID for their domain names.
        bytes32 label = keccak256(bytes(parts));
        return uint256(label);
    }

    function targetExists(string memory _targetType, string memory _targetURI) public view returns (bool) {
        uint256 targetId = computeTargetId(_targetType, _targetURI);
        return targetExists(targetId);
    }

    /// @notice check for existence of target.
    /// @param _targetId token ID.
    /// @return true if exists.
    function targetExists(uint256 _targetId) public view returns (bool) {
        return targets[_targetId].created > 0 ? true : false;
    }

    function getTarget(uint256 _targetId) public view returns (Target memory) {
        return targets[_targetId];
    }

    function getTarget(string memory _targetType, string memory _targetURI) public view returns (Target memory) {
        uint256 targetId = computeTargetId(_targetType, _targetURI);
        return getTarget(targetId);
    }

    /// @notice Checks whether an address has the tagging contract role
    /// @param _smartContract Address being checked
    /// @return bool True if the address has the role, false if not
    function isTargetType(address _smartContract) public view returns (bool) {
        return hasRole(TARGET_TYPE_ROLE, _smartContract);
    }

    /// @notice Checks whether an address has the tagging contract role
    /// @param _smartContract Address being checked
    /// @return bool True if the address has the role, false if not
    function isTargetType(string _targetTypeName) public view returns (bool) {
        return hasRole(TARGET_TYPE_ROLE, _smartContract);
    }

    /// @notice Checks whether an address has the target type contract role and is not paused from tagging
    /// @param _smartContract Address being checked
    function isTargetTypeAndNotPaused(address _smartContract) public view returns (bool) {
        return isTargetType(_smartContract) && !isTargetTypePaused[_smartContract];
    }
}
