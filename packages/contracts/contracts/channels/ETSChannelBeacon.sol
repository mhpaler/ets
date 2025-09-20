// SPDX-License-Identifier: MIT

/**
 * @title ETS Channel Upgradeable Beacon
 * @author Ethereum Tag Service <team@ets.xyz>
 *
 *  ███████╗████████╗███████╗
 *  ██╔════╝╚══██╔══╝██╔════╝
 *  █████╗     ██║   ███████╗
 *  ██╔══╝     ██║   ╚════██║
 *  ███████╗   ██║   ███████║
 *  ╚══════╝   ╚═╝   ╚══════╝
 *
 * @notice Upgradeable beacon proxy contract for upgrading the ETS Channel proxies
 * deployed by ETSChannelFactory.sol
 */

pragma solidity ^0.8.10;

import { UpgradeableBeacon } from "@openzeppelin/contracts/proxy/beacon/UpgradeableBeacon.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

contract ETSChannelBeacon is Ownable {
    UpgradeableBeacon immutable channelBeacon;

    address public channelLogic;

    constructor(address _channelLogic) {
        channelBeacon = new UpgradeableBeacon(_channelLogic);
        channelLogic = _channelLogic;
        // Assigns ownership to deployer.
        transferOwnership(tx.origin);
    }

    function update(address _channelLogic) public onlyOwner {
        channelBeacon.upgradeTo(_channelLogic);
        channelLogic = _channelLogic;
    }

    function implementation() public view returns (address) {
        return channelBeacon.implementation();
    }
}
