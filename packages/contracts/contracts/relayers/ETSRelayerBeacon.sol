// SPDX-License-Identifier: MIT

/**
 * @title ETS Relayer Upgradeable Beacon
 * @author Ethereum Tag Service <team@ets.xyz>
 *
 *  ███████╗████████╗███████╗
 *  ██╔════╝╚══██╔══╝██╔════╝
 *  █████╗     ██║   ███████╗
 *  ██╔══╝     ██║   ╚════██║
 *  ███████╗   ██║   ███████║
 *  ╚══════╝   ╚═╝   ╚══════╝
 *
 * @notice Upgradeable beacon proxy contract for upgrading the ETS Relayer proxies
 * deployed by ETSRelayerFactory.sol
 */

pragma solidity ^0.8.10;

import { UpgradeableBeacon } from "@openzeppelin/contracts/proxy/beacon/UpgradeableBeacon.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

contract ETSRelayerBeacon is Ownable {
    UpgradeableBeacon immutable relayerBeacon;

    address public relayerLogic;

    constructor(address _relayerLogic) {
        relayerBeacon = new UpgradeableBeacon(_relayerLogic);
        relayerLogic = _relayerLogic;
        // Assigns ownership to deployer.
        transferOwnership(tx.origin);
    }

    function update(address _relayerLogic) public onlyOwner {
        relayerBeacon.upgradeTo(_relayerLogic);
        relayerLogic = _relayerLogic;
    }

    function implementation() public view returns (address) {
        return relayerBeacon.implementation();
    }
}
