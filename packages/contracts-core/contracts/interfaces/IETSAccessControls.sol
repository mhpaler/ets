// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./IETSToken.sol";
import "@openzeppelin/contracts-upgradeable/access/IAccessControlUpgradeable.sol";

interface IETSAccessControls is IAccessControlUpgradeable {
    event ETSTokenSet(IETSToken etsToken);
    event PublisherDefaultThresholdSet(uint256 threshold);

    function togglePublisher() external returns (bool toggled);

    /**
     * @dev Point ETSAccessControls to ETSToken contract.
     */
    function setETSToken(IETSToken _etsToken) external;

    /**
     * @dev set the role admin for a role.
     */
    function setRoleAdmin(bytes32 _role, bytes32 _adminRole) external;

    function setPublisherDefaultThreshold(uint256 _threshold) external;

    function getPublisherThreshold(address _addr)
        external
        view
        returns (uint256);

    function getPublisherDefaultThreshold() external view returns (uint256);

    function isSmartContract(address _addr) external view returns (bool);

    function isAdmin(address _addr) external view returns (bool);

    function isPublisher(address _addr) external view returns (bool);

    function isPublisherAdmin(address _addr) external view returns (bool);
}
