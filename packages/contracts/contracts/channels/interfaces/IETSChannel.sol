// SPDX-License-Identifier: MIT

/**
 * @title IETSChannel
 * @author Ethereum Tag Service <team@ets.xyz>
 *
 *  ███████╗████████╗███████╗
 *  ██╔════╝╚══██╔══╝██╔════╝
 *  █████╗     ██║   ███████╗
 *  ██╔══╝     ██║   ╚════██║
 *  ███████╗   ██║   ███████║`
 *  ╚══════╝   ╚═╝   ╚══════╝
 *
 * @notice Minimum interface required for ETS Channel proxy.
 */

pragma solidity ^0.8.10;

import { IETS } from "../../interfaces/IETS.sol";

interface IETSChannel {
    // Custom errors
    error CallerNotChannelAdmin(address caller);
    error UnpausingNotPermitted();
    error InsufficientFunds(uint256 required, uint256 available);

    /**
     * @dev Emitted when an IETSChannel contract is paused/unpaused by owner.
     *
     * @param channelAddress Address of channel contract.
     */
    event ChannelPauseToggledByOwner(address channelAddress);

    /**
     * @dev Emitted when an IETSChannel contract has changed owners.
     *
     * @param channelAddress Address of channel contract.
     */
    event ChannelOwnerChanged(address channelAddress);

    // ============ OWNER INTERFACE ============

    /**
     * @notice Pause this channel contract.
     * @dev This function can only be called by the owner when the contract is unpaused.
     */
    function pause() external;

    /**
     * @notice Unpause this channel contract.
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
     * @notice Broadcast support for IETSChannel interface to external contracts.
     *
     * @dev ETSCore will only add channel contracts that implement IETSChannel interface.
     * Your implementation should broadcast that it implements IETSChannel interface.
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
     * @notice Returns address of an IETSChannel contract owner.
     *
     * @return address of contract owner.
     */
    function getOwner() external view returns (address payable);

    /**
     * @notice Returns human readable name for this IETSChannel contract.
     *
     * @return name of the Channel contract as a string.
     */
    function getChannelName() external view returns (string memory);

    /**
     * @notice Returns address of an IETSChannel contract creator.
     *
     * @return address of the creator of the Channel contract.
     */
    function getCreator() external view returns (address payable);

    /**
     * @notice Apply tags to target URIs. Creates new tagging records using this channel.
     *
     * @param _rawInput Array of tagging record inputs containing target URIs and tag strings
     */
    function applyTags(IETS.TaggingRecordRawInput[] calldata _rawInput) external payable;

    /**
     * @notice Apply tags to target URIs. Creates new tagging records or modifies existing ones using specified channel.
     *
     * @param _rawInput Array of tagging record inputs containing target URIs and tag strings
     * @param _channel Address of channel to use. For new records must be this channel, for modifications can be any channel
     */
    function applyTagsViaChannel(IETS.TaggingRecordRawInput[] calldata _rawInput, address _channel) external payable;

    /**
     * @notice Replace tags on target URIs using this channel
     *
     * @param _rawInput Array of tagging record inputs containing target URIs and tag strings
     */
    function replaceTags(IETS.TaggingRecordRawInput[] calldata _rawInput) external payable;

    /**
     * @notice Replace tags on target URIs using specified channel
     *
     * @param _rawInput Array of tagging record inputs containing target URIs and tag strings
     * @param _channel Address of channel to use. For new records must be this channel, for modifications can be any channel
     */
    function replaceTagsViaChannel(IETS.TaggingRecordRawInput[] calldata _rawInput, address _channel) external payable;

    /**
     * @notice Remove tags from target URIs using this channel
     *
     * @param _rawInput Array of tagging record inputs containing target URIs and tag strings
     */
    function removeTags(IETS.TaggingRecordRawInput[] calldata _rawInput) external payable;

    /**
     * @notice Remove tags from target URIs using specified channel
     *
     * @param _rawInput Array of tagging record inputs containing target URIs and tag strings
     * @param _channel Address of channel to use. For new records must be this channel, for modifications can be any channel
     */
    function removeTagsViaChannel(IETS.TaggingRecordRawInput[] calldata _rawInput, address _channel) external payable;

    /**
     * @notice Get or create TAG coins from tag strings.
     *
     * Combo function that accepts tag strings and returns corresponding Zora coin address if it exists,
     * or if it doesn't exist, creates a new TAG coin and then returns corresponding address.
     *
     * Only ETS Publisher contracts may call this function.
     *
     * @param _tags Array of tag strings.
     * @return _coinAddresses Array of Zora ERC-20 coin addresses representing TAG tokens.
     */
    function getOrCreateTagIds(string[] calldata _tags) external payable returns (address[] memory _coinAddresses);

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
