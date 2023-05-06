// SPDX-License-Identifier: MIT

pragma solidity ^0.8.10;

/**
 * @title IETSRelayer
 * @author Ethereum Tag Service <team@ets.xyz>
 *
 * @notice Minimum interface required for ETS Relayer smart contracts. Contracts implementing this
 * interface will need to import OpenZeppelin ERC165, Ownable and Pausable contracts.
 * See https://github.com/ethereum-tag-service/ets/blob/stage/packages/contracts/contracts/examples/ETSRelayer.sol
 * for a sample implementation.
 */
interface IETSRelayer {
    /**
     * @dev Emitted when an IETSRelayer contract is paused/unpaused.
     *
     * @param relayerAddress Address of relayer contract.
     */
    event RelayerPauseToggledByOwner(address relayerAddress);

    /**
     * @dev Emitted when an IETSRelayer contract has changed owners.
     *
     * @param relayerAddress Address of relayer contract.
     */
    event RelayerOwnerChanged(address relayerAddress);

    // ============ OWNER INTERFACE ============

    /**
     * @notice Pause this relayer contract.
     * @dev This function can only be called by the owner when the contract is unpaused.
     */
    function pause() external;

    /**
     * @notice Unpause this relayer contract.
     * @dev This function can only be called by the owner when the contract is paused.
     */
    function unpause() external;

    /**
     * @notice Transfer this contract to a new owner.
     *
     * @dev This function can only be called by the owner when the contract is paused.
     *
     * @param newOwner Address of the new contract owner.
     */
    function changeOwner(address newOwner) external;

    // ============ PUBLIC VIEW FUNCTIONS ============

    /**
     * @notice Broadcast support for IETSRelayer interface to external contracts.
     *
     * @dev ETSCore will only add relayer contracts that implement IETSRelayer interface.
     * Your implementation should broadcast that it implements IETSRelayer interface.
     *
     * @return boolean: true if this contract implements the interface defined by
     * `interfaceId`
     */
    function supportsInterface(bytes4 interfaceId) external view returns (bool);

    /**
     * @notice Check whether this contract has been pasued by the owner.
     *
     * @dev Pause functionality should be provided by OpenZeppelin Pausable utility.
     * @return boolean: true for paused; false for not paused.
     */
    function isPausedByOwner() external view returns (bool);

    /**
     * @notice Returns address of an IETSRelayer contract owner.
     *
     * @return address of contract owner.
     */
    function getOwner() external view returns (address payable);

    /**
     * @notice Returns human readable name for this IETSRelayer contract.
     *
     * @return name of the Relayer contract as a string.
     */
    function getRelayerName() external view returns (string memory);

    /**
     * @notice Returns address of an IETSRelayer contract creator.
     *
     * @return address of the creator of the Relayer contract.
     */
    function getCreator() external view returns (address payable);
}
