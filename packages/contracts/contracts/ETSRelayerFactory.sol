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
 * @dev see ETSRelayerBeacon.sol & ETSRelayerV1.sol
 */

pragma solidity ^0.8.10;

import { IETS } from "./interfaces/IETS.sol";
import { IETSTarget } from "./interfaces/IETSTarget.sol";
import { IETSToken } from "./interfaces/IETSToken.sol";
import { IETSAccessControls } from "./interfaces/IETSAccessControls.sol";
import { ETSRelayerBeacon } from "./relayers/ETSRelayerBeacon.sol";
import { ETSRelayerV1 } from "./relayers/ETSRelayerV1.sol";

import { Context } from "@openzeppelin/contracts/utils/Context.sol";
import { BeaconProxy } from "@openzeppelin/contracts/proxy/beacon/BeaconProxy.sol";

contract ETSRelayerFactory is Context {
    mapping(uint256 => address) private vaults;

    ETSRelayerBeacon immutable etsRelayerBeacon;

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
        require(!etsAccessControls.isRelayerByName(_name), "Relayer name exists");
        bytes memory nameBytes = bytes(_name);
        require(nameBytes.length >= 2, "Relayer name too short");
        require(nameBytes.length <= 32, "Relayer name too long");
        _;
    }

    /// Public constants

    string public constant NAME = "ETS Relayer Factory V1";

    constructor(
        address _etsRelayerLogic,
        IETSAccessControls _etsAccessControls,
        IETS _ets,
        IETSToken _etsToken,
        IETSTarget _etsTarget
    ) {
        etsRelayerBeacon = new ETSRelayerBeacon(_etsRelayerLogic);
        etsAccessControls = _etsAccessControls;
        ets = _ets;
        etsToken = _etsToken;
        etsTarget = _etsTarget;
    }

    function addRelayer(string calldata _relayerName) external onlyValidName(_relayerName) returns (address relayer) {
        require(
            etsToken.balanceOf(_msgSender()) > 0 || etsAccessControls.isRelayerAdmin(_msgSender()),
            "Must own CTAG"
        );
        require(!etsAccessControls.isRelayerByOwner(_msgSender()), "Sender owns existing relayer");
        BeaconProxy relayerProxy = new BeaconProxy(
            address(etsRelayerBeacon),
            abi.encodeWithSelector(
                ETSRelayerV1(payable(address(0))).initialize.selector,
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
