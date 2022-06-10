// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IETSAccessControls {

    function assessOwner(address _addr) external;
    function getPublisherThreshold(address _addr) external returns (uint256);
    function getPublisherThreshold() external returns (uint256);
    function isSmartContract(address _addr) external view returns (bool);
    function isAdmin(address _addr) external view returns (bool);
    function isPublisher(address _addr) external view returns (bool);
    function version() external view returns (string memory);
}
