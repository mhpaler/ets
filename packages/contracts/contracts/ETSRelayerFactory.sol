// SPDX-License-Identifier: MIT

/**
 * @title ETS Relayer Factory
 * @author Ethereum Tag Service <team@ets.xyz>
 *
 *  ███████╗████████╗███████╗
 *  ██╔════╝╚══██╔══╝██╔════╝
 *  █████╗     ██║   ███████╗
 *  ██╔══╝     ██║   ╚════██║
 *  ███████╗   ██║   ███████║
 *  ╚══════╝   ╚═╝   ╚══════╝
 *
 * @notice Factory contract for deploying upgradeable beacon proxy contract instances.
 * @dev see ETSRelayerBeacon.sol & ETSRelayer.sol
 */

pragma solidity ^0.8.10;

import { IETS } from "./interfaces/IETS.sol";
import { IETSTarget } from "./interfaces/IETSTarget.sol";
import { IETSToken } from "./interfaces/IETSToken.sol";
import { IETSAccessControls } from "./interfaces/IETSAccessControls.sol";
import { ETSRelayerBeacon } from "./relayers/ETSRelayerBeacon.sol";
import { ETSRelayer } from "./relayers/ETSRelayer.sol";
import { Context } from "@openzeppelin/contracts/utils/Context.sol";
import { BeaconProxy } from "@openzeppelin/contracts/proxy/beacon/BeaconProxy.sol";

contract ETSRelayerFactory is Context {
    mapping(uint256 => address) private vaults;

    ETSRelayerBeacon public etsRelayerBeacon;

    /// @dev ETS access controls contract.
    IETSAccessControls public etsAccessControls;

    /// @dev Address and interface for ETS Core.
    IETS public ets;

    /// @dev Address and interface for ETS Token
    IETSToken public etsToken;

    /// @dev Address and interface for ETS Target.
    IETSTarget public etsTarget;

    // Modifiers

    modifier onlyValidName(string calldata _name) {
        if (etsAccessControls.isRelayerByName(_name)) revert IETSAccessControls.RelayerNameExists(_name);
        bytes memory nameBytes = bytes(_name);
        if (nameBytes.length < 2) revert IETSAccessControls.RelayerNameTooShort(nameBytes.length);
        if (nameBytes.length > 32) revert IETSAccessControls.RelayerNameTooLong(nameBytes.length);
        _;
    }

    /// Public constants

    string public constant NAME = "ETS Relayer Factory";

    constructor(
        address _etsRelayerBeacon,  // Changed: Accept pre-deployed beacon address
        IETSAccessControls _etsAccessControls,
        IETS _ets,
        IETSToken _etsToken,
        IETSTarget _etsTarget
    ) {
        // Changed: Use the pre-deployed beacon instead of creating a new one
        etsRelayerBeacon = ETSRelayerBeacon(_etsRelayerBeacon);
        etsAccessControls = _etsAccessControls;
        ets = _ets;
        etsToken = _etsToken;
        etsTarget = _etsTarget;
    }

    function addRelayer(string calldata _relayerName) external onlyValidName(_relayerName) returns (address relayer) {
        if (!etsAccessControls.isRelayerAdmin(_msgSender())) {
            if (etsAccessControls.isRelayerByOwner(_msgSender())) revert IETSAccessControls.SenderOwnsRelayer(_msgSender());
        }

        BeaconProxy relayerProxy = new BeaconProxy(
            address(etsRelayerBeacon),
            abi.encodeWithSelector(
                ETSRelayer(payable(address(0))).initialize.selector,
                _relayerName,
                ets,
                etsToken,
                etsTarget,
                etsAccessControls,
                payable(_msgSender()),
                payable(_msgSender())
            )
        );

        etsAccessControls.registerRelayer(address(relayerProxy), _relayerName, _msgSender());
        return address(relayerProxy);
    }

    function getImplementation() public view returns (address) {
        return etsRelayerBeacon.implementation();
    }

    function getBeacon() public view returns (address) {
        return address(etsRelayerBeacon);
    }
}
