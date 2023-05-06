// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import { IETS } from "./interfaces/IETS.sol";
import { IETSTarget } from "./interfaces/IETSTarget.sol";
import { IETSToken } from "./interfaces/IETSToken.sol";
import { ETSRelayerV1 } from "./relayers/ETSRelayerV1.sol";
import { IETSAccessControls } from "./interfaces/IETSAccessControls.sol";
import { ContextUpgradeable } from "@openzeppelin/contracts-upgradeable/utils/ContextUpgradeable.sol";
import { Initializable } from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import { UUPSUpgradeable } from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import { ReentrancyGuardUpgradeable } from "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import { ERC165CheckerUpgradeable } from "@openzeppelin/contracts-upgradeable/utils/introspection/ERC165CheckerUpgradeable.sol";

/**
 * @title ETS Relayer Factory
 * @author Ethereum Tag Service <team@ets.xyz>
 *
 * @notice Relayer factory contract that provides public function for creating new ETS Relayers.
 */
contract ETSRelayerFactory is Initializable, ContextUpgradeable, ReentrancyGuardUpgradeable, UUPSUpgradeable {
    // Public variables

    /// @dev ETS access controls contract.
    IETSAccessControls public etsAccessControls;

    /// @dev Address and interface for ETS Core.
    IETS public ets;

    /// @dev Address and interface for ETS Token
    IETSToken public etsToken;

    /// @dev Address and interface for ETS Target.
    IETSTarget public etsTarget;

    /// Public constants

    string public constant NAME = "ETS Relayer Factory";

    /// Modifiers

    /// @dev When applied to a method, only allows execution when the sender has the admin role.
    modifier onlyAdmin() {
        require(etsAccessControls.isAdmin(_msgSender()), "Caller not Administrator");
        _;
    }

    // ============ UUPS INTERFACE ============

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(
        IETSAccessControls _etsAccessControls,
        IETS _ets,
        IETSToken _etsToken,
        IETSTarget _etsTarget
    ) public initializer {
        etsAccessControls = _etsAccessControls;
        ets = _ets;
        etsToken = _etsToken;
        etsTarget = _etsTarget;
    }

    // Ensure that only address with admin role can upgrade.
    // solhint-disable-next-line
    function _authorizeUpgrade(address) internal override onlyAdmin {}

    // ============ OWNER INTERFACE ============

    // ============ PUBLIC INTERFACE ============

    function addRelayerV1(string calldata _relayerName) public payable {
        // require(!isRelayerByAddress(_relayer), "Relayer exists");
        // TODO: If [relayername].ens exists, _msgSender() to be owner.
        require(!etsAccessControls.isRelayerByName(_relayerName), "Relayer name exists");
        ETSRelayerV1 relayer = new ETSRelayerV1(
            _relayerName,
            ets,
            etsToken,
            etsTarget,
            payable(_msgSender()),
            payable(_msgSender())
        );

        etsAccessControls.addRelayer(address(relayer), _relayerName);
    }
}
