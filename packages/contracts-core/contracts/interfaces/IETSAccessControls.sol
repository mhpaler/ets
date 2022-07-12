// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./IETSToken.sol";
import "@openzeppelin/contracts-upgradeable/access/IAccessControlUpgradeable.sol";

/**
 * @title IETSAccessControls
 * @author Ethereum Tag Service <team@ets.xyz>
 *
 * @notice This is the interface for the ETSAccessControls which allows ETS Core Dev team to
 * administer roles and control access to various parts of the ETS Platform. ETSAccessControls,
 * itself an implementation of Open Zeppelin Access Controls, contains a mix of public and
 * administrator only functions.
 */
interface IETSAccessControls is IAccessControlUpgradeable {
    /**
     * @dev emitted when the ETS Platform address is set.
     *
     * @param platformAddress wallet address platform is set to.
     */
    event PlatformSet(address platformAddress);

    /**
     * @dev emitted when the publisherDefaultThreshold is set. See function below
     * for explanation of publisherDefaultThreshold.
     *
     * @param threshold number of CTAGs required to own.
     */
    event PublisherDefaultThresholdSet(uint256 threshold);

    /**
     * @dev emitted when a Target Tagger contract is paused or unpaused.
     *
     * @param newValue Boolean contract pause state. True for paused; false for unpaused.
     */
    event TargetTaggerPauseToggled(bool newValue);

    function setPlatform(address payable _platform) external;

    function addTargetTagger(address _taggerAddress, string calldata _name) external;

    function removeTargetTagger(address _taggerAddress) external;

    function toggleIsTargetTaggerPaused(address _taggerAddress) external;

    /**
     * @dev set the role admin for a role.
     */
    function setRoleAdmin(bytes32 _role, bytes32 _adminRole) external;

    function getPlatformAddress() external view returns (address payable);

    function isSmartContract(address _addr) external view returns (bool);

    function isAdmin(address _addr) external view returns (bool);

    function isPublisher(address _addr) external view returns (bool);

    function isPublisherAdmin(address _addr) external view returns (bool);

    function isTargetTagger(address _taggerAddress) external view returns (bool);

    function isTargetTaggerAndNotPaused(address _taggerAddress) external view returns (bool);
}
