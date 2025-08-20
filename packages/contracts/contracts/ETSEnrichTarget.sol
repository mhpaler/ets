// SPDX-License-Identifier: MIT

/* solhint-disable no-console */
pragma solidity ^0.8.10;

import { IETSTarget } from "./interfaces/IETSTarget.sol";
import { IETSEnrichTarget } from "./interfaces/IETSEnrichTarget.sol";
import { IETSAccessControls } from "./interfaces/IETSAccessControls.sol";
import { ContextUpgradeable } from "@openzeppelin/contracts-upgradeable/utils/ContextUpgradeable.sol";
import { Initializable } from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import { UUPSUpgradeable } from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

contract ETSEnrichTarget is IETSEnrichTarget, Initializable, ContextUpgradeable, UUPSUpgradeable {
    /// @dev ETS access controls smart contract.
    IETSAccessControls public etsAccessControls;

    /// @dev ETS target smart contract.
    IETSTarget public etsTarget;

    // Public constants
    string public constant NAME = "ETSEnrichTarget";
    string public constant VERSION = "0.1.0";

    // Custom errors
    error AccessDenied();
    error InvalidTarget();

    // Events
    event EnrichTargetRequested(uint256 indexed targetId, address indexed requestor);

    // Modifiers
    modifier onlyAdmin() {
        if (!etsAccessControls.isAdmin(_msgSender())) revert AccessDenied();
        _;
    }

    // ============ UUPS INTERFACE ============

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(
        IETSAccessControls _etsAccessControls,
        IETSTarget _etsTarget
    ) public initializer {
        // Initialize access controls & ETS
        etsAccessControls = _etsAccessControls;
        etsTarget = _etsTarget;
    }

    // solhint-disable-next-line
    function _authorizeUpgrade(address) internal override onlyAdmin {}

    // ============ OWNER INTERFACE ============

    // ============ PUBLIC INTERFACE ============

    /// @inheritdoc IETSEnrichTarget
    function requestEnrichTarget(uint256 _targetId) external {
        if (!etsTarget.targetExistsById(_targetId)) revert InvalidTarget();
        
        // Simply emit event for event processor to pick up
        emit EnrichTargetRequested(_targetId, _msgSender());
    }
}
