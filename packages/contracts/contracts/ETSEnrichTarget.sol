// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import { IETSTarget } from "./interfaces/IETSTarget.sol";
import { IETSEnrichTarget } from "./interfaces/IETSEnrichTarget.sol";
import { IETSAccessControls } from "./interfaces/IETSAccessControls.sol";
import { ContextUpgradeable } from "@openzeppelin/contracts-upgradeable/utils/ContextUpgradeable.sol";
import { Initializable } from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import { UUPSUpgradeable } from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import { StringsUpgradeable } from "@openzeppelin/contracts-upgradeable/utils/StringsUpgradeable.sol";
import { RrpRequesterV0 } from "@api3/airnode-protocol/contracts/rrp/requesters/RrpRequesterV0.sol";
import { IAirnodeRrpV0 } from "@api3/airnode-protocol/contracts/rrp/interfaces/IAirnodeRrpV0.sol";

contract ETSEnrichTarget is IETSEnrichTarget, Initializable, ContextUpgradeable, UUPSUpgradeable {
    /// @dev ETS access controls smart contract.
    IETSAccessControls public etsAccessControls;

    /// @dev ETS target smart contract.
    IETSTarget public etsTarget;

    // Airnode parameters
    address public airnode;
    bytes32 public endpointId;
    address public sponsorAddress;
    address public sponsorWallet;

    // Airnode RRP contract
    IAirnodeRrpV0 public airnodeRrp;

    // Track request IDs to target IDs
    mapping(bytes32 => uint256) public requestIdToTargetId;

    // Public constants
    string public constant NAME = "ETSEnrichTarget";
    string public constant VERSION = "0.0.2";

    // Events
    event RequestEnrichTarget(uint256 indexed targetId);
    event EnrichmentFulfilled(bytes32 indexed requestId, uint256 indexed targetId, string ipfsHash, uint256 httpStatus);
    event AirnodeRrpUpdated(address indexed airnodeRrp);

    // Modifiers
    modifier onlyAdmin() {
        require(etsAccessControls.isAdmin(_msgSender()), "Access denied");
        _;
    }

    modifier onlyAirnodeRrp() {
        require(msg.sender == address(airnodeRrp), "Caller is not the AirnodeRrpV0 contract");
        _;
    }

    // ============ UUPS INTERFACE ============

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(
        IETSAccessControls _etsAccessControls,
        IETSTarget _etsTarget,
        IAirnodeRrpV0 _airnodeRrp
    ) public initializer {
        // Initialize access controls & ETS
        etsAccessControls = _etsAccessControls;
        etsTarget = _etsTarget;
        airnodeRrp = _airnodeRrp;
    }

    // solhint-disable-next-line
    function _authorizeUpgrade(address) internal override onlyAdmin {}

    // ============ OWNER INTERFACE ============
    /**
     * @notice Allows admin to update the Airnode RRP implementation address
     * @param _airnodeRrp New Airnode RRP contract address
     */
    function setAirnodeRrp(IAirnodeRrpV0 _airnodeRrp) external onlyAdmin {
        require(address(_airnodeRrp) != address(0), "Address cannot be zero");
        airnodeRrp = _airnodeRrp;
        emit AirnodeRrpUpdated(address(_airnodeRrp));
    }

    function setAirnodeRequestParameters(
        address _airnode,
        bytes32 _endpointId,
        address _sponsorAddress,
        address _sponsorWallet
    ) external onlyAdmin {
        airnode = _airnode;
        endpointId = _endpointId;
        sponsorAddress = _sponsorAddress;
        sponsorWallet = _sponsorWallet;
    }

    // ============ PUBLIC INTERFACE ============

    /// @inheritdoc IETSEnrichTarget
    function requestEnrichTarget(uint256 _targetId) external {
        require(etsTarget.targetExistsById(_targetId) == true, "Invalid target");
        require(airnode != address(0), "Airnode not set");
        require(sponsorWallet != address(0), "Sponsor wallet not set");

        // Convert uint256 to string using the Strings library
        string memory targetIdStr = StringsUpgradeable.toString(_targetId);
        string memory chainIdStr = StringsUpgradeable.toString(block.chainid);

        // Encode parameters according to Airnode ABI specifications
        // Header: "1SS" - version 1, two string parameters
        bytes memory parameters = abi.encode(
            bytes32("1SS"), // Header: version 1, two string parameters
            bytes32("chainId"),
            chainIdStr, // First parameter: chainId (string)
            bytes32("targetId"),
            targetIdStr // Second parameter: targetId (string)
        );

        // Make the Airnode request
        bytes32 requestId = airnodeRrp.makeFullRequest(
            airnode,
            endpointId,
            sponsorAddress,
            sponsorWallet,
            address(this),
            this.fulfillEnrichTarget.selector,
            parameters
        );

        // Store the mapping between requestId and targetId
        requestIdToTargetId[requestId] = _targetId;

        emit RequestEnrichTarget(_targetId);
    }

    /// @notice Function called by Airnode with the enriched data
    /// @param requestId The request ID that was returned when making the request
    /// @param data The data returned by the Airnode (encoded ipfsHash and httpStatus)
    function fulfillEnrichTarget(bytes32 requestId, bytes calldata data) external onlyAirnodeRrp {
        // Get the target ID associated with this request
        uint256 targetId = requestIdToTargetId[requestId];
        require(targetId != 0, "Unknown request ID");

        // Clean up mapping
        delete requestIdToTargetId[requestId];

        // Decode the response - expects encoded tuple of (string, uint256)
        (string memory arweaveTxId, uint256 httpStatus) = abi.decode(data, (string, uint256));

        // Update the target with enriched data
        IETSTarget.Target memory target = etsTarget.getTargetById(targetId);
        etsTarget.updateTarget(targetId, target.targetURI, block.timestamp, httpStatus, arweaveTxId);

        emit EnrichmentFulfilled(requestId, targetId, arweaveTxId, httpStatus);
    }
}
