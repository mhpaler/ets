// SPDX-License-Identifier: MIT

/**
 * @title IETSRelayer
 * @author Ethereum Tag Service <team@ets.xyz>
 *
 *  ███████╗████████╗███████╗
 *  ██╔════╝╚══██╔══╝██╔════╝
 *  █████╗     ██║   ███████╗
 *  ██╔══╝     ██║   ╚════██║
 *  ███████╗   ██║   ███████║`
 *  ╚══════╝   ╚═╝   ╚══════╝
 *
 * @notice Minimum interface required for ETS Relayer proxy.
 */

pragma solidity ^0.8.10;

import { IETS } from "../../interfaces/IETS.sol";

interface IETSRelayer {
    /**
     * @dev Emitted when an IETSRelayer contract is paused/unpaused by owner.
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
    function isPaused() external view returns (bool);

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

    /**
     * @notice Apply tags to target URIs. Creates new tagging records using this relayer.
     *
     * @param _rawInput Array of tagging record inputs containing target URIs and tag strings
     */
    function applyTags(IETS.TaggingRecordRawInput[] calldata _rawInput) external payable;

    /**
     * @notice Apply tags to target URIs. Creates new tagging records or modifies existing ones using specified relayer.
     *
     * @param _rawInput Array of tagging record inputs containing target URIs and tag strings
     * @param _relayer Address of relayer to use. For new records must be this relayer, for modifications can be any relayer
     */
    function applyTagsViaRelayer(IETS.TaggingRecordRawInput[] calldata _rawInput, address _relayer) external payable;

    /**
     * @notice Replace tags on target URIs using this relayer
     *
     * @param _rawInput Array of tagging record inputs containing target URIs and tag strings
     */
    function replaceTags(IETS.TaggingRecordRawInput[] calldata _rawInput) external payable;

    /**
     * @notice Replace tags on target URIs using specified relayer
     *
     * @param _rawInput Array of tagging record inputs containing target URIs and tag strings
     * @param _relayer Address of relayer to use. For new records must be this relayer, for modifications can be any relayer
     */
    function replaceTagsViaRelayer(IETS.TaggingRecordRawInput[] calldata _rawInput, address _relayer) external payable;

    /**
     * @notice Remove tags from target URIs using this relayer
     *
     * @param _rawInput Array of tagging record inputs containing target URIs and tag strings
     */
    function removeTags(IETS.TaggingRecordRawInput[] calldata _rawInput) external payable;

    /**
     * @notice Remove tags from target URIs using specified relayer
     *
     * @param _rawInput Array of tagging record inputs containing target URIs and tag strings
     * @param _relayer Address of relayer to use. For new records must be this relayer, for modifications can be any relayer
     */
    function removeTagsViaRelayer(IETS.TaggingRecordRawInput[] calldata _rawInput, address _relayer) external payable;

    /**
     * @notice Get or create CTAG tokens from tag strings.
     *
     * Combo function that accepts a tag strings and returns corresponding CTAG token Id if it exists,
     * or if it doesn't exist, creates a new CTAG and then returns corresponding Id.
     *
     * Only ETS Publisher contracts may call this function.
     *
     * @param _tags Array of tag strings.
     * @return _tagIds Array of Id of CTAG Ids.
     */
    function getOrCreateTagIds(string[] calldata _tags) external payable returns (uint256[] memory _tagIds);

    /**
     * @notice Compute tagging fee for raw input and desired action.
     *
     * @param _rawInput Raw client input data formed as TaggingRecordRawInput struct.
     * @param _action Integer representing action to be performed according to enum TaggingAction.
     *
     * @return fee Calculated tagging fee in ETH/Matic
     * @return tagCount Number of new tags being added to tagging record.
     */
    function computeTaggingFee(
        IETS.TaggingRecordRawInput calldata _rawInput,
        IETS.TaggingAction _action
    ) external view returns (uint256 fee, uint256 tagCount);
}
