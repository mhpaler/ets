// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IETSAccessControls {
    function isSmartContract(address _addr) external view returns (bool);
    function isAdmin(address _addr) external view returns (bool);
    function isPublisher(address _addr) external view returns (bool);
    function version() external view returns (string memory);
}
