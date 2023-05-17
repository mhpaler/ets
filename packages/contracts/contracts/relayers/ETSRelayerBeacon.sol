// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import { UpgradeableBeacon } from "@openzeppelin/contracts/proxy/beacon/UpgradeableBeacon.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

import "hardhat/console.sol";

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
