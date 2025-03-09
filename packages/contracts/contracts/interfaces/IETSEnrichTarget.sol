// SPDX-License-Identifier: MIT

/**
 * @title IETSEnrichTarget
 * @author Ethereum Tag Service <team@ets.xyz>
 *
 *  ███████╗████████╗███████╗
 *  ██╔════╝╚══██╔══╝██╔════╝
 *  █████╗     ██║   ███████╗
 *  ██╔══╝     ██║   ╚════██║
 *  ███████╗   ██║   ███████║`
 *  ╚══════╝   ╚═╝   ╚══════╝
 *
 * @notice This is the interface for the ETSEnrichTarget.sol contract that handles the enrichment of
 * Target metadata using off-chain APIs.
 *
 * In order to keep the on-chain recording of new Target records lightweight and inexpensive,
 * the createTarget() function (ETSTarget.sol) requires only a URI string (targetURI). To augment this,
 * we are developing a hybrid onchain/off-chain Enrich Target flow for the purpose of collecting
 * additional metadata about a Target and saving it back on-chain.
 *
 * The flow begins with the requestEnrichTarget() function (see below) which takes a targetId as an
 * argument. If the Target exists, the function emits the targetId via the RequestEnrichTarget event.
 *
 * An OpenZeppelin Defender Sentinel is listening for this event, and when detected, passes the
 * targetId to an ETS off-chain service we call the Enrich Target API, which extracts the Target URI,
 * collects metadata about the URI and saves it in json format to IPFS. The IPFS entpoint is posted
 * back on-chain via fulfillEnrichTarget() thus updating the Target data struct.
 *
 * Future implementation should utilize ChainLink in place of OpenZeppelin for better decentralization.
 */

pragma solidity ^0.8.10;

/// @title IETSEnrichTarget
/// @notice Interface for the ETSEnrichTarget contract
interface IETSEnrichTarget {
    /// @notice Event emitted when an enrichment is requested
    event RequestEnrichTarget(uint256 indexed targetId);

    /// @notice Request to enrich a target
    /// @param _targetId The target ID to enrich
    function requestEnrichTarget(uint256 _targetId) external;

    /// @notice Callback function for Airnode to fulfill an enrichment request
    /// @param requestId The request ID from Airnode
    /// @param data The encoded response data
    function fulfillEnrichTarget(bytes32 requestId, bytes calldata data) external;

    /// @notice Set the Airnode request parameters
    /// @param _airnode The Airnode address
    /// @param _endpointId The endpoint ID
    /// @param _sponsorWallet The sponsor wallet address
    function setAirnodeRequestParameters(address _airnode, bytes32 _endpointId, address _sponsorWallet) external;
}
