// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import { IETS } from "./interfaces/IETS.sol";
import { IETSTarget } from "./interfaces/IETSTarget.sol";
import { IETSToken } from "./interfaces/IETSToken.sol";
import { ETSRelayerBeacon } from "./relayers/ETSRelayerBeacon.sol";
import { ETSRelayerV1 } from "./relayers/ETSRelayerV1.sol";
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

    function addRelayer(string calldata _relayerName) external returns (address) {
        // TODO: If [relayername].ens exists, _msgSender() to be owner.
        require(!etsAccessControls.isRelayerByName(_relayerName), "Relayer name exists");

        BeaconProxy relayerProxy = new BeaconProxy(
            address(etsRelayerBeacon),
            abi.encodeWithSelector(
                ETSRelayerV1(address(0)).initialize.selector,
                _relayerName,
                ets,
                etsToken,
                etsTarget,
                payable(_msgSender()),
                payable(_msgSender())
            )
        );

        etsAccessControls.addRelayer(address(relayerProxy), _relayerName);
        return address(relayerProxy);
    }

    function getImplementation() public view returns (address) {
        return etsRelayerBeacon.implementation();
    }

    function getBeacon() public view returns (address) {
        return address(etsRelayerBeacon);
    }
}
