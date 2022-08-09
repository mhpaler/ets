// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "@openzeppelin/contracts-upgradeable/access/IAccessControlUpgradeable.sol";

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
     * @dev emitted when a Target Tagger contract is added & enabled in ETS.
     *
     * @param targetTagger Target Tagger contract address.
     */
    event TargetTaggerAdded(address targetTagger);

    /**
     * @dev emitted when a Target Tagger contract is removed from ETS.
     *
     * @param targetTagger Target Tagger contract address.
     */
    event TargetTaggerRemoved(address targetTagger);

    /**
     * @dev emitted when a Target Tagger contract is paused or unpaused.
     *
     * @param taggerAddress Address that had pause toggled.
     */
    event TargetTaggerPauseToggled(address taggerAddress);

    /**
     * @notice Sets the Platform wallet address. Can only be called by address with DEFAULT_ADMIN_ROLE.
     *
     * @param _platform The new Platform address to set.
     */
    function setPlatform(address payable _platform) external;

    /**
     * @notice Adds a Target Tagger contract to ETS. Can only be called by address
     * with DEFAULT_ADMIN_ROLE.
     *
     * @param _taggerAddress Address of the Target Tagger contract. Must conform to IETSTargetTagger.
     * @param _name Human readable name of the Target Tagger.
     */
    function addTargetTagger(address _taggerAddress, string calldata _name) external;

    /**
     * @notice Removes a Target Tagger contract from ETS. Can only be called by address
     * with DEFAULT_ADMIN_ROLE.
     *
     * @param _taggerAddress Address of the Target Tagger contract.
     */
    function removeTargetTagger(address _taggerAddress) external;

    /**
     * @notice Pauses/Unpauses a Target Tagger contract. Can only be called by address
     * with DEFAULT_ADMIN_ROLE.
     *
     * @param _taggerAddress Address of the Target Tagger contract.
     */
    function toggleIsTargetTaggerPaused(address _taggerAddress) external;

    /**
     * @notice Sets the role admin for a given role. An address with role admin can grant or
     * revoke that role for other addresses. Can only be called by address with DEFAULT_ADMIN_ROLE.
     *
     * @param _role bytes32 representation of role being administered.
     * @param _adminRole bytes32 representation of administering role.
     */
    function setRoleAdmin(bytes32 _role, bytes32 _adminRole) external;

    /**
     * @notice Returns wallet address for ETS Platform.
     *
     * @return ETS Platform address.
     */
    function getPlatformAddress() external view returns (address payable);

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
     * @notice Checks whether given address has PUBLISHER role.
     *
     * @param _addr Address being checked.
     * @return boolean True if address has PUBLISHER role.
     */
    function isPublisher(address _addr) external view returns (bool);

    /**
     * @notice Checks whether given address has PUBLISHER_ADMIN role.
     *
     * @param _addr Address being checked.
     * @return boolean True if address has PUBLISHER_ADMIN role.
     */
    function isPublisherAdmin(address _addr) external view returns (bool);

    /**
     * @notice Checks whether given Tagger Name is a registered Target Tagger.
     *
     * @param _name Name being checked.
     * @return boolean True if _name is a Target Tagger.
     */
    function isTargetTaggerByName(string calldata _name) external view returns (bool);

    /**
     * @notice Checks whether given address is a registered Target Tagger.
     *
     * @param _addr Address being checked.
     * @return boolean True if address is a Target Tagger.
     */
    function isTargetTaggerByAddress(address _addr) external view returns (bool);

    /**
     * @notice Checks whether given address is a registered Target Tagger and not paused.
     *
     * @param _addr Address being checked.
     * @return boolean True if address is a Target Tagger and not paused.
     */
    function isTargetTaggerAndNotPaused(address _addr) external view returns (bool);
}
