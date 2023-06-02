// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import { IAccessControlUpgradeable } from "@openzeppelin/contracts-upgradeable/access/IAccessControlUpgradeable.sol";

/**
 * @title IETSAccessControls
 * @author Ethereum Tag Service <team@ets.xyz>
 *
 * @notice This is the interface for the ETSAccessControls contract which allows ETS Core Dev
 * Team to administer roles and control access to various parts of the ETS Platform.
 * ETSAccessControls contract contains a mix of public and administrator only functions.
 */
interface IETSAccessControls is IAccessControlUpgradeable {
    /**
     * @dev emitted when the ETS Platform address is set.
     *
     * @param newAddress wallet address platform is being set to.
     * @param prevAddress previous platform address.
     */
    event PlatformSet(address newAddress, address prevAddress);

    /**
     * @dev emitted when a Relayer contract is added & enabled in ETS.
     *
     * Relayer contracts are not required implement all ETS Core API functions. Therefore, to ease
     * testing of ETS Core API fuinctions, ETS permits addition of ETS owned wallet addresses as Relayers.
     *
     * @param relayer Relayer contract address.
     */
    event RelayerAdded(address relayer);

    /**
     * @dev emitted when a Relayer contract is paused or unpaused.
     *
     * @param relayer Address that had pause toggled.
     */
    event RelayerLockToggled(address relayer);

    /**
     * @notice Sets the Platform wallet address. Can only be called by address with DEFAULT_ADMIN_ROLE.
     *
     * @param _platform The new Platform address to set.
     */
    function setPlatform(address payable _platform) external;

    /**
     * @notice Adds a Relayer contract to ETS. Can only be called by address
     * with DEFAULT_ADMIN_ROLE.
     *
     * @param _relayer Address of the Relayer contract. Must conform to IETSRelayer.
     * @param _name Human readable name of the Relayer.
     * @param _owner Address of relayer owner.
     */
    function registerRelayer(address _relayer, string calldata _name, address _owner) external;

    /**
     * @notice Pause relayer given the relayer owner address. Callable by Platform only.
     *
     * @param _relayerOwner Address of the Relayer owner.
     */
    function pauseRelayerByOwnerAddress(address _relayerOwner) external;

    /**
     * @notice Change the relayer owner as stored in ETSAccessControls. Callable from Relayer only.
     * Called via changeOwner() on a relayer.
     *
     * @param _currentOwner Address of the current relayer owner.
     * @param _newOwner Address of the new relayer owner.
     */
    function changeRelayerOwner(address _currentOwner, address _newOwner) external;

    /**
     * @notice Pauses/Unpauses a Relayer contract. Can only be called by address
     * with DEFAULT_ADMIN_ROLE.
     *
     * @param _relayer Address of the Relayer contract.
     */
    function toggleRelayerLock(address _relayer) external;

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
     * @notice Checks whether given address has AUCTION_ORACLE_ROLE role.
     *
     * @param _addr Address being checked.
     * @return boolean True if address has AUCTION_ORACLE_ROLE role.
     */
    function isAuctionOracle(address _addr) external view returns (bool);

    /**
     * @notice Checks whether given address can act as relayer factory.
     *
     * @param _addr Address being checked.
     * @return boolean True if address can act as relayer factory.
     */
    function isRelayerFactory(address _addr) external view returns (bool);

    /**
     * @notice Checks whether given address is a relayer.
     *
     * @param _addr Address being checked.
     * @return boolean True if address can be a relayer.
     */
    function isRelayer(address _addr) external view returns (bool);

    /**
     * @notice Checks whether given address is a registered Relayer and not paused.
     *
     * @param _addr Address being checked.
     * @return boolean True if address is a Relayer and not paused.
     */
    function isRelayerAndNotPaused(address _addr) external view returns (bool);

    /**
     * @notice Checks relayer is paused by ETS Platform.
     *
     * @param _addr Address being checked.
     * @return boolean True if relayer address is paused by platform.
     */
    function isRelayerLocked(address _addr) external view returns (bool);

    /**
     * @notice Checks whether given address owns a relayer.
     *
     * @param _addr Address being checked.
     * @return boolean True if address owns a relayer.
     */
    function isRelayerByOwner(address _addr) external view returns (bool);

    /**
     * @notice Checks whether given address has RELAYER_ADMIN role.
     *
     * @param _addr Address being checked.
     * @return boolean True if address has RELAYER_ADMIN role.
     */
    function isRelayerAdmin(address _addr) external view returns (bool);

    /**
     * @notice Checks whether given Relayer Name is a registered Relayer.
     *
     * @param _name Name being checked.
     * @return boolean True if _name is a Relayer.
     */
    function isRelayerByName(string calldata _name) external view returns (bool);

    /**
     * @notice Checks whether given address is a registered Relayer.
     *
     * @param _addr Address being checked.
     * @return boolean True if address is a registered Relayer.
     */
    function isRelayerByAddress(address _addr) external view returns (bool);

    /**
     * @notice Get relayer address from it's name.
     *
     * @param _name Name of relayer.
     * @return Address of relayer.
     */
    function getRelayerAddressFromName(string calldata _name) external view returns (address);

    /**
     * @notice Get relayer name from it's address.
     *
     * @param _address Adsdress of relayer.
     * @return Name of relayer.
     */
    function getRelayerNameFromAddress(address _address) external view returns (string calldata);

    /**
     * @notice Get relayer address from its owner address.
     *
     * @param _address address of relayer owner.
     * @return Address of relayer.
     */
    function getRelayerAddressFromOwner(address _address) external view returns (address);

    /**
     * @notice Returns wallet address for ETS Platform.
     *
     * @return ETS Platform address.
     */
    function getPlatformAddress() external view returns (address payable);
}
