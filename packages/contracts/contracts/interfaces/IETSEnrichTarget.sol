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
 * @notice This is the interface for the ETSEnrichTarget.sol contract that serves as an API gateway
 * for requesting target enrichment via the ETS Event Processor.
 *
 * In order to keep the on-chain recording of new Target records lightweight and inexpensive,
 * the createTarget() function (ETSTarget.sol) requires only a URI string (targetURI). To augment this,
 * we have developed a hybrid onchain/off-chain Target enrichment flow for collecting additional 
 * metadata about a Target and saving it back on-chain.
 *
 * The flow begins with the requestEnrichTarget() function which takes a targetId as an argument. 
 * If the Target exists, the function emits an EnrichTargetRequested event. The ETS Event Processor 
 * listens for these events and triggers the enrichment flow, which extracts metadata from the Target URI,
 * uploads it to Arweave, and updates the Target record on-chain.
 */

pragma solidity ^0.8.10;

/// @title IETSEnrichTarget
/// @notice Interface for the ETSEnrichTarget API gateway contract
interface IETSEnrichTarget {
    // Events
    event EnrichTargetRequested(uint256 indexed targetId, address indexed requestor);
    event TargetEnriched(
        uint256 indexed targetId,
        string title,
        string description,
        string imageUrl,
        string keywords
    );
    /// @notice Request to enrich a target's metadata
    /// @param _targetId The target ID to enrich
    /// @dev Emits EnrichTargetRequested event for the Event Processor to handle
    function requestEnrichTarget(uint256 _targetId) external;

    /// @notice Emit enrichment data for a target (called by Event Processor)
    /// @param _targetId The target ID being enriched
    /// @param _title The extracted title metadata
    /// @param _description The extracted description metadata
    /// @param _imageUrl The extracted image URL metadata
    /// @param _keywords Comma-separated keywords metadata
    /// @dev Only callable by EVENT_PROCESSOR_ROLE
    /// @dev Emits TargetEnriched event for The Graph to index
    function enrichTarget(
        uint256 _targetId,
        string memory _title,
        string memory _description,
        string memory _imageUrl,
        string memory _keywords
    ) external;
}
