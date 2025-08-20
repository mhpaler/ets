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
     * @notice Mock implementation of Zora factory coinAddress function
     * @dev Returns a deterministic address based on the coin salt
     *      Uses CREATE2-style address generation for consistency
     */
    function coinAddress(
        address msgSender,
        string memory name,
        string memory symbol,
        bytes memory poolConfig,
        address platformReferrer,
        bytes32 coinSalt
    ) external view returns (address) {
        
        // Generate deterministic mock address using CREATE2 pattern
        // This ensures the same inputs always produce the same address
        bytes32 hash = keccak256(
            abi.encodePacked(
                bytes1(0xff),
                address(this),
                coinSalt,
                keccak256(abi.encodePacked(msgSender, name, symbol, poolConfig, platformReferrer))
            )
        );
        
        address result = address(uint160(uint256(hash)));
        
        return result;
    }
    
    /**
     * @notice Mock function to simulate coin deployment
     * @dev In real Zora factory, this would deploy the actual coin
     *      For testing, we just emit an event
     */
    function deploy(
        address /* payoutRecipient */,
        address[] memory /* owners */,
        string memory /* uri */,
        string memory name,
        string memory symbol,
        bytes memory poolConfig,
        address platformReferrer,
        address /* postDeployHook */,
        bytes memory /* postDeployHookData */,
        bytes32 coinSalt
    ) external returns (address coin) {
        // Calculate the same address as coinAddress would return
        coin = this.coinAddress(
            msg.sender,
            name,
            symbol,
            poolConfig,
            platformReferrer,
            coinSalt
        );
        
        // Emit event to simulate real factory behavior
        emit CoinCreatedV4(
            coin,
            msg.sender,
            name,
            symbol,
            poolConfig,
            platformReferrer,
            coinSalt
        );
        
        return coin;
    }
    
    /**
     * @notice Event emitted when a mock coin is "created"
     * @dev Matches the event signature from real Zora factory
     */
    event CoinCreatedV4(
        address indexed coin,
        address indexed msgSender,
        string name,
        string symbol,
        bytes poolConfig,
        address platformReferrer,
        bytes32 coinSalt
    );
}