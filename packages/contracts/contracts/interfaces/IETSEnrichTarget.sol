// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

/**
 * @title IETSEnrichTarget
 * @author Ethereum Tag Service <team@ets.xyz>
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
interface IETSEnrichTarget {
    /**
     * @dev emitted when Target enrichment is requested via requestEnrichTarget().
     *
     * @param targetId Target record to enrich.
     */
    event RequestEnrichTarget(uint256 targetId);

    /**
     * @notice Request enrichment for a Target using the hybrid ETS Enrich Target API.
     *
     * @param _targetId Id of Target being enriched.
     */
    function requestEnrichTarget(uint256 _targetId) external;

    /**
     * @notice Updates Target record with additional metadata stored behind IPFS hash.
     *
     * @param _targetId Id of Target being enriched & updated.
     * @param _ipfsHash IPFS hash with metadata related to the Target.
     * @param _httpStatus HTTP response code from off-chain ETS Enrich Target API.
     */
    function fulfillEnrichTarget(
        uint256 _targetId,
        string calldata _ipfsHash,
        uint256 _httpStatus
    ) external;
}
