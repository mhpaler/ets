// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;


/**
 * @title MockZoraFactory
 * @notice Mock implementation of Zora factory for localhost testing
 * @dev This contract provides the same interface as the real Zora factory
 *      but returns deterministic mock addresses for local testing
 */
contract MockZoraFactory {
    /**
     * @notice Internal function to compute coin address
     * @dev Returns a deterministic address based on the coin salt
     *      Uses CREATE2-style address generation for consistency
     */
    function _computeCoinAddress(
        address msgSender,
        string memory name,
        string memory symbol,
        bytes32 poolConfigHash,
        address platformReferrer,
        bytes32 coinSalt
    ) internal view returns (address) {
        bytes32 hash = keccak256(
            abi.encodePacked(
                bytes1(0xff),
                address(this),
                coinSalt,
                keccak256(abi.encodePacked(msgSender, name, symbol, poolConfigHash, platformReferrer))
            )
        );
        return address(uint160(uint256(hash)));
    }

    /**
     * @notice Mock implementation of Zora factory coinAddress function
     * @dev Returns a deterministic address based on the coin salt
     *      Signature matches real Zora factory exactly
     */
    function coinAddress(
        address msgSender,
        string memory name,
        string memory symbol,
        bytes memory poolConfig,
        address platformReferrer,
        bytes32 coinSalt
    ) external view returns (address) {
        return _computeCoinAddress(
            msgSender,
            name,
            symbol,
            keccak256(poolConfig),
            platformReferrer,
            coinSalt
        );
    }

    /**
     * @notice Mock function to simulate coin deployment
     * @dev In real Zora factory, this would deploy the actual coin
     *      For testing, we just emit an event
     *      Signature matches real Zora factory exactly
     */
    function deploy(
        address payoutRecipient,
        address[] memory /* owners */,
        string memory uri,
        string memory name,
        string memory symbol,
        bytes memory poolConfig,
        address platformReferrer,
        address /* postDeployHook */,
        bytes memory /* postDeployHookData */,
        bytes32 coinSalt
    ) external payable returns (address coin, bytes memory postDeployHookDataOut) {
        // Compute poolConfigHash once to avoid stack too deep
        bytes32 poolConfigHash = keccak256(poolConfig);

        // Calculate the same address as coinAddress would return
        coin = _computeCoinAddress(
            msg.sender,
            name,
            symbol,
            poolConfigHash,
            platformReferrer,
            coinSalt
        );

        // Emit event to simulate real factory behavior
        // Note: coin is NOT indexed in real Zora (important for subgraph filtering)
        // Note: poolKey passed as empty bytes to avoid stack too deep error
        emit CoinCreatedV4(
            msg.sender,          // caller
            payoutRecipient,     // payoutRecipient
            platformReferrer,    // platformReferrer
            address(0),          // currency (simplified for mock)
            uri,                 // uri
            name,                // name
            symbol,              // symbol
            coin,                // coin (NOT indexed!)
            "",                  // poolKey (empty bytes to avoid stack too deep)
            poolConfigHash,      // poolKeyHash
            "v1"                 // version
        );

        return (coin, "");
    }

    /**
     * @notice Event emitted when a mock coin is "created"
     * @dev Matches the event signature from real Zora factory exactly
     *      Note: Only caller, payoutRecipient, and platformReferrer are indexed
     *      The coin address is NOT indexed (unlike our old implementation)
     */
    event CoinCreatedV4(
        address indexed caller,
        address indexed payoutRecipient,
        address indexed platformReferrer,
        address currency,
        string uri,
        string name,
        string symbol,
        address coin,        // NOT indexed - important!
        bytes poolKey,       // Simplified to bytes instead of PoolKey struct
        bytes32 poolKeyHash,
        string version
    );
}