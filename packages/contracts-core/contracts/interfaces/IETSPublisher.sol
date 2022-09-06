// SPDX-License-Identifier: MIT

pragma solidity ^0.8.10;

/**
 * @title IETSPublisher
 * @author Ethereum Tag Service <team@ets.xyz>
 *
 * @notice Minimum interface required for ETS Publisher smart contracts. Contracts implementing this
 * interface will need to import OpenZeppelin ERC165, Ownable and Pausable contracts.
 * See https://github.com/ethereum-tag-service/ets/blob/stage/packages/contracts-core/contracts/examples/ETSPublisher.sol
 * for a sample implementation.
 */
interface IETSPublisher {
    /**
     * @dev Emitted when an IETSPublisher contract is paused/unpaused.
     *
     * @param publisherAddress Address of publisher contract.
     */
    event PublisherPauseToggledByOwner(address publisherAddress);

    /**
     * @dev Emitted when an IETSPublisher contract has changed owners.
     *
     * @param publisherAddress Address of publisher contract.
     */
    event PublisherOwnerChanged(address publisherAddress);

    // ============ OWNER INTERFACE ============

    /**
     * @notice Pause this publisher contract.
     * @dev This function can only be called by the owner when the contract is unpaused.
     */
    function pause() external;

    /**
     * @notice Unpause this publisher contract.
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
     * @notice Broadcast support for IETSPublisher interface to external contracts.
     *
     * @dev ETSCore will only add publisher contracts that implement IETSPublisher interface.
     * Your implementation should broadcast that it implements IETSPublisher interface.
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
     * @notice Returns address of an IETSPublisher contract owner.
     *
     * @return address of contract owner.
     */
    function getOwner() external view returns (address payable);

    /**
     * @notice Returns human readable name for this IETSPublisher contract.
     *
     * @return name of the Publisher contract as a string.
     */
    function getPublisherName() external pure returns (string memory);

    /**
     * @notice Returns address of an IETSPublisher contract creator.
     *
     * @return address of the creator of the Publisher contract.
     */
    function getCreator() external view returns (address payable);
}
