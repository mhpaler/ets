// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

/**
 * @title IZoraFactory
 * @notice Interface for Zora Factory contract to enable deterministic coin address computation
 */
interface IZoraFactory {
    /**
     * @notice Predicts the address of a coin contract that will be deployed with the given parameters
     * @param msgSender The address of the msg.sender
     * @param name The name of the coin
     * @param symbol The symbol of the coin
     * @param poolConfig The pool configuration for the coin
     * @param platformReferrer The platform referrer
     * @param coinSalt The salt used to deploy the coin
     * @return The address of the coin contract
     */
    function coinAddress(
        address msgSender,
        string memory name,
        string memory symbol,
        bytes memory poolConfig,
        address platformReferrer,
        bytes32 coinSalt
    ) external view returns (address);
}