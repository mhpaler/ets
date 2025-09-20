// SPDX-License-Identifier: MIT

/**
 * @title IETSAccessControls
 * @author Ethereum Tag Service <team@ets.xyz>
 *
 *  ███████╗████████╗███████╗
 *  ██╔════╝╚══██╔══╝██╔════╝
 *  █████╗     ██║   ███████╗
 *  ██╔══╝     ██║   ╚════██║
 *  ███████╗   ██║   ███████║`
 *  ╚══════╝   ╚═╝   ╚══════╝
 *
 * @notice This is the interface for the ETSAccessControls contract which allows ETS Core Dev
 * Team to administer roles and control access to various parts of the ETS Platform.
 * ETSAccessControls contract contains a mix of public and administrator only functions.
 */

pragma solidity ^0.8.10;

import { IAccessControlUpgradeable } from "@openzeppelin/contracts-upgradeable/access/IAccessControlUpgradeable.sol";

interface IETSAccessControls is IAccessControlUpgradeable {
    // Custom errors
    error ChannelNameExists(string name);
    error ChannelNameTooShort(uint256 length);
    error ChannelNameTooLong(uint256 length);
    error CallerIsNotChannel(address caller);
    error NotChannelOwner(address caller, address expectedOwner);
    error NewOwnerAlreadyOwnsChannel(address newOwner);
    error SenderOwnsChannel(address sender);

    /**
     * @dev emitted when the ETS Platform address is set.
     *
     * @param newAddress wallet address platform is being set to.
     * @param prevAddress previous platform address.
     */
    event PlatformSet(address newAddress, address prevAddress);

    /**
     * @dev emitted when a Channel contract is added & enabled in ETS.
     *
     * Channel contracts are not required implement all ETS Core API functions. Therefore, to ease
     * testing of ETS Core API fuinctions, ETS permits addition of ETS owned wallet addresses as Channels.
     *
     * @param channel Channel contract address.
     */
    event ChannelAdded(address channel);

    /**
     * @dev emitted when a Channel contract is paused or unpaused.
     *
     * @param channel Address that had pause toggled.
     */
    event ChannelLockToggled(address channel);

    /**
     * @notice Sets the Platform wallet address. Can only be called by address with DEFAULT_ADMIN_ROLE.
     *
     * @param _platform The new Platform address to set.
     */
    function setPlatform(address payable _platform) external;

    /**
     * @notice Adds a Channel contract to ETS. Can only be called by address
     * with DEFAULT_ADMIN_ROLE.
     *
     * @param _channel Address of the Channel contract. Must conform to IETSChannel.
     * @param _name Human readable name of the Channel.
     * @param _owner Address of channel owner.
     */
    function registerChannel(address _channel, string calldata _name, address _owner) external;

    /**
     * @notice Pause channel given the channel owner address. Callable by Platform only.
     *
     * @param _channelOwner Address of the Channel owner.
     */
    function pauseChannelByOwnerAddress(address _channelOwner) external;

    /**
     * @notice Change the channel owner as stored in ETSAccessControls. Callable from Channel only.
     * Called via changeOwner() on a channel.
     *
     * @param _currentOwner Address of the current channel owner.
     * @param _newOwner Address of the new channel owner.
     */
    function changeChannelOwner(address _currentOwner, address _newOwner) external;

    /**
     * @notice Pauses/Unpauses a Channel contract. Can only be called by address
     * with DEFAULT_ADMIN_ROLE.
     *
     * @param _channel Address of the Channel contract.
     */
    function toggleChannelLock(address _channel) external;

    /**
     * @notice Sets the role admin for a given role. An address with role admin can grant or
     * revoke that role for other addresses. Can only be called by address with DEFAULT_ADMIN_ROLE.
     *
     * @param _role bytes32 representation of role being administered.
     * @param _adminRole bytes32 representation of administering role.
     */
    function setRoleAdmin(bytes32 _role, bytes32 _adminRole) external;

    /**
     * @notice Checks whether given address has SMART_CONTRACT role.
     *
     * @param _addr Address being checked.
     * @return boolean True if address has SMART_CONTRACT role.
     */
    function isSmartContract(address _addr) external view returns (bool);

    /**
     * @notice Checks whether given address has DEFAULT_ADMIN_ROLE role.
     *
     * @param _addr Address being checked.
     * @return boolean True if address has DEFAULT_ADMIN_ROLE role.
     */
    function isAdmin(address _addr) external view returns (bool);

    /**
     * @notice Checks whether given address has EVENT_PROCESSOR_ROLE role.
     *
     * @param _addr Address being checked.
     * @return boolean True if address has EVENT_PROCESSOR_ROLE role.
     */
    function isEventProcessor(address _addr) external view returns (bool);

    /**
     * @notice Checks whether given address can act as channel factory.
     *
     * @param _addr Address being checked.
     * @return boolean True if address can act as channel factory.
     */
    function isChannelFactory(address _addr) external view returns (bool);

    /**
     * @notice Checks whether given address is a channel.
     *
     * @param _addr Address being checked.
     * @return boolean True if address can be a channel.
     */
    function isChannel(address _addr) external view returns (bool);

    /**
     * @notice Checks whether given address is a registered Channel and not paused.
     *
     * @param _addr Address being checked.
     * @return boolean True if address is a Channel and not paused.
     */
    function isChannelAndNotPaused(address _addr) external view returns (bool);

    /**
     * @notice Checks channel is paused by ETS Platform.
     *
     * @param _addr Address being checked.
     * @return boolean True if channel address is paused by platform.
     */
    function isChannelLocked(address _addr) external view returns (bool);

    /**
     * @notice Checks whether given address owns a channel.
     *
     * @param _addr Address being checked.
     * @return boolean True if address owns a channel.
     */
    function isChannelByOwner(address _addr) external view returns (bool);

    /**
     * @notice Checks whether given address has RELAYER_ADMIN role.
     *
     * @param _addr Address being checked.
     * @return boolean True if address has RELAYER_ADMIN role.
     */
    function isChannelAdmin(address _addr) external view returns (bool);

    /**
     * @notice Checks whether given Channel Name is a registered Channel.
     *
     * @param _name Name being checked.
     * @return boolean True if _name is a Channel.
     */
    function isChannelByName(string calldata _name) external view returns (bool);

    /**
     * @notice Checks whether given address is a registered Channel.
     *
     * @param _addr Address being checked.
     * @return boolean True if address is a registered Channel.
     */
    function isChannelByAddress(address _addr) external view returns (bool);

    /**
     * @notice Get channel address from it's name.
     *
     * @param _name Name of channel.
     * @return Address of channel.
     */
    function getChannelAddressFromName(string calldata _name) external view returns (address);

    /**
     * @notice Get channel name from it's address.
     *
     * @param _address Adsdress of channel.
     * @return Name of channel.
     */
    function getChannelNameFromAddress(address _address) external view returns (string calldata);

    /**
     * @notice Get channel address from its owner address.
     *
     * @param _address address of channel owner.
     * @return Address of channel.
     */
    function getChannelAddressFromOwner(address _address) external view returns (address);

    /**
     * @notice Returns wallet address for ETS Platform.
     *
     * @return ETS Platform address.
     */
    function getPlatformAddress() external view returns (address payable);
}
