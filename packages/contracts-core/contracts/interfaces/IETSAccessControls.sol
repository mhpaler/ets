// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./IETSToken.sol";
import "@openzeppelin/contracts-upgradeable/access/IAccessControlUpgradeable.sol";

interface IETSAccessControls is IAccessControlUpgradeable {
    event PlatformSet(address platformAddress);

    event ETSTokenSet(IETSToken etsToken);

    event PublisherDefaultThresholdSet(uint256 threshold);

    event TargetTaggerPauseToggled(bool newValue);

    function togglePublisher() external returns (bool toggled);

    /**
     * @dev Point ETSAccessControls to ETSToken contract.
     */
    function setETSToken(IETSToken _etsToken) external;

    function setPlatform(address payable _platform) external;

    function addTargetTagger(address _taggerAddress, string calldata _name) external;

    function removeTargetTagger(address _taggerAddress) external;

    function toggleIsTargetTaggerPaused(address _taggerAddress) external;

    /**
     * @dev set the role admin for a role.
     */
    function setRoleAdmin(bytes32 _role, bytes32 _adminRole) external;

    function getPlatformAddress() external view returns (address payable);

    function setPublisherDefaultThreshold(uint256 _threshold) external;

    function getPublisherThreshold(address _addr) external view returns (uint256);

    function getPublisherDefaultThreshold() external view returns (uint256);

    function isSmartContract(address _addr) external view returns (bool);

    function isAdmin(address _addr) external view returns (bool);

    function isPublisher(address _addr) external view returns (bool);

    function isPublisherAdmin(address _addr) external view returns (bool);

    function isTargetTagger(address _taggerAddress) external view returns (bool);

    function isTargetTaggerAndNotPaused(address _taggerAddress) external view returns (bool);
}
