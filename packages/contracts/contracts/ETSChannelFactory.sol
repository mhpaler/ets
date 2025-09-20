// SPDX-License-Identifier: MIT

/**
 * @title ETS Channel Factory
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
 * @dev see ETSChannelBeacon.sol & ETSChannel.sol
 */

pragma solidity ^0.8.10;

import { IETS } from "./interfaces/IETS.sol";
import { IETSTarget } from "./interfaces/IETSTarget.sol";
import { IETSToken } from "./interfaces/IETSToken.sol";
import { IETSAccessControls } from "./interfaces/IETSAccessControls.sol";
import { ETSChannelBeacon } from "./channels/ETSChannelBeacon.sol";
import { ETSChannel } from "./channels/ETSChannel.sol";
import { Context } from "@openzeppelin/contracts/utils/Context.sol";
import { BeaconProxy } from "@openzeppelin/contracts/proxy/beacon/BeaconProxy.sol";

contract ETSChannelFactory is Context {
    mapping(uint256 => address) private vaults;

    ETSChannelBeacon public etsChannelBeacon;

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
        if (etsAccessControls.isChannelByName(_name)) revert IETSAccessControls.ChannelNameExists(_name);
        bytes memory nameBytes = bytes(_name);
        if (nameBytes.length < 2) revert IETSAccessControls.ChannelNameTooShort(nameBytes.length);
        if (nameBytes.length > 32) revert IETSAccessControls.ChannelNameTooLong(nameBytes.length);
        _;
    }

    /// Public constants

    string public constant NAME = "ETS Channel Factory";

    constructor(
        address _etsChannelBeacon,  // Changed: Accept pre-deployed beacon address
        IETSAccessControls _etsAccessControls,
        IETS _ets,
        IETSToken _etsToken,
        IETSTarget _etsTarget
    ) {
        // Changed: Use the pre-deployed beacon instead of creating a new one
        etsChannelBeacon = ETSChannelBeacon(_etsChannelBeacon);
        etsAccessControls = _etsAccessControls;
        ets = _ets;
        etsToken = _etsToken;
        etsTarget = _etsTarget;
    }

    function addChannel(string calldata _channelName) external onlyValidName(_channelName) returns (address channel) {
        if (!etsAccessControls.isChannelAdmin(_msgSender())) {
            if (etsAccessControls.isChannelByOwner(_msgSender())) revert IETSAccessControls.SenderOwnsChannel(_msgSender());
        }

        BeaconProxy channelProxy = new BeaconProxy(
            address(etsChannelBeacon),
            abi.encodeWithSelector(
                ETSChannel(payable(address(0))).initialize.selector,
                _channelName,
                ets,
                etsToken,
                etsTarget,
                etsAccessControls,
                payable(_msgSender()),
                payable(_msgSender())
            )
        );

        etsAccessControls.registerChannel(address(channelProxy), _channelName, _msgSender());
        return address(channelProxy);
    }

    function getImplementation() public view returns (address) {
        return etsChannelBeacon.implementation();
    }

    function getBeacon() public view returns (address) {
        return address(etsChannelBeacon);
    }
}
