// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./interfaces/IETSTarget.sol";
import "./interfaces/IETSEnrichTarget.sol";
import "./interfaces/IETSAccessControls.sol";
import "@openzeppelin/contracts-upgradeable/utils/ContextUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

/// @title ETSEnsure target contract.
/// @author Ethereum Tag Service <security@ets.xyz>
/// @dev Used by ETS to ensure targets using off-chain data.
contract ETSEnrichTarget is IETSEnrichTarget, Initializable, ContextUpgradeable, UUPSUpgradeable {
    /// Variable storage
    /// @notice ETS access controls smart contract.
    IETSAccessControls public etsAccessControls;

    /// @notice ETS access controls smart contract.
    IETSTarget public etsTarget;

    /// Public constants

    string public constant NAME = "ETSEnrichTarget";

    /// Events

    /// Modifiers

    modifier onlyAdmin() {
        require(etsAccessControls.isAdmin(_msgSender()), "Caller must have administrator access");
        _;
    }

    /// Initialization

    function initialize(IETSAccessControls _etsAccessControls, IETSTarget _etsTarget) public initializer {
        // Initialize access controls & ETS
        etsAccessControls = _etsAccessControls;
        etsTarget = _etsTarget;
    }

    function _authorizeUpgrade(address) internal override onlyAdmin {}

    /// @notice Ensure a target Id using the off chain ETS Ensure Target API.
    /// @dev Emits a RequestEnsureTarget event with targetId to Openzeppelin
    /// Defender which is listening for event. When event is detected, OZ makes
    /// callout to ETS.targets(targetId) to collect targetType and targetURI.
    /// With these, OZ makes callout to ETS Ensure Target API which collects
    /// metadata for target, pins it to IPFS and returns pin to ETS blockchain
    /// via fulfillEnsureTarget()
    /// @param _targetId Unique id of target to be ensured.
    function requestEnrichTarget(uint256 _targetId) public {
        require(etsTarget.targetExists(_targetId) == true, "Invalid target");
        // require(!etsTarget.isTargetEnsured(_targetId), "Already ensured");
        emit RequestEnrichTarget(_targetId);
    }

    /// @notice Decorates target with additional metadata stored in IPFS hash.
    /// see requestEnsureTarget()
    /// TODO: 1) consider access restricting this? ie. not public function.
    /// 2) add another field for 200 status, but failed metadata collection.
    /// @param _targetId Unique id of target being ensured.
    /// @param _ipfsHash IPFS hash containing metadata related to the unique target.
    /// @param _status HTTP response code from ETS Ensure Target API.
    function fulfillEnrichTarget(
        uint256 _targetId,
        string calldata _ipfsHash,
        uint256 _status
    ) public {
        require(etsAccessControls.getPlatformAddress() == msg.sender, "only platform may enrich target");
        IETSTarget.Target memory target = etsTarget.getTarget(_targetId);
        etsTarget.updateTarget(_targetId, target.targetURI, block.timestamp, _status, _ipfsHash);
    }
}
