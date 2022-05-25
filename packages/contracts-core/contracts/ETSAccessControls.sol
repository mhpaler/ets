// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts/interfaces/IERC165.sol";
import "hardhat/console.sol";

import "../interfaces/IETSTargetType.sol";

/// @title ETS access controls
/// @author Ethereum Tag Service <security@ets.xyz>
/// @dev Maintains a mapping of ethereum addresses and roles they have within the protocol
contract ETSAccessControls is Initializable, AccessControlUpgradeable, UUPSUpgradeable {
    event TargetTypePauseToggled(bool newValue);

    /// Public constants
    string public constant NAME = "ETS access controls";
    string public constant VERSION = "0.0.1";
    bytes32 public constant PUBLISHER_ROLE = keccak256("PUBLISHER");
    bytes32 public constant SMART_CONTRACT_ROLE = keccak256("SMART_CONTRACT");
    bytes32 public constant TARGET_TYPE_ROLE = keccak256("TARGET_TYPE");

    /// @notice Target type name to target type contract address or zero if nothing assigned
    mapping(string => address) public targetTypeToContract;

    /// @notice Target type contract address to registered name or empty string if nothing assigned
    mapping(address => string) public targetTypeContractName;

    /// @notice If target type is paused by the protocol
    mapping(address => bool) public isTargetTypePaused;

    function initialize() public initializer {
        __AccessControl_init();
        // Give default admin role to the deployer.
        // setupRole is should only be called within initialize().
        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
    }

    // Ensure that only address with admin role can upgrade.
    function _authorizeUpgrade(address) internal override onlyRole(DEFAULT_ADMIN_ROLE) {}

    /// @dev Checks whether an address has a smart contract role.
    /// @param _addr Address being checked.
    /// @return bool True if the address has the role, false if not.
    function isSmartContract(address _addr) public view returns (bool) {
        return hasRole(SMART_CONTRACT_ROLE, _addr);
    }

    /// @dev Checks whether an address has an admin role
    /// @param _addr Address being checked
    /// @return bool True if the address has the role, false if not
    function isAdmin(address _addr) public view returns (bool) {
        return hasRole(DEFAULT_ADMIN_ROLE, _addr);
    }

    /// @dev Checks whether an address has a publisher role
    /// @param _addr Address being checked
    /// @return bool True if the address has the role, false if not
    function isPublisher(address _addr) public view returns (bool) {
        return hasRole(PUBLISHER_ROLE, _addr);
    }

    /// @notice Checks whether an address has the tagging contract role
    /// @param _smartContract Address being checked
    /// @return bool True if the address has the role, false if not
    function isTargetType(address _smartContract) public view returns (bool) {
        return hasRole(TARGET_TYPE_ROLE, _smartContract);
    }

    /// @notice Checks whether an address has the target type contract role and is not paused from tagging
    /// @param _smartContract Address being checked
    function isTargetTypeAndNotPaused(address _smartContract) public view returns (bool) {
        return isTargetType(_smartContract) && !isTargetTypePaused[_smartContract];
    }

    /// @notice Add a new target type smart contract to the ETS protocol. Tagging a target
    /// is executed through a target type "subcontract" calling ETS core.
    /// Note: Admin addresses can be added as target type to permit calling ETS core directly
    /// for tagging testing and debugging purposes.
    function addTargetType(address _smartContract, string calldata _name) external {
        require(
            isAdmin(_smartContract) || 
            IERC165(_smartContract).supportsInterface(type(IETSTargetType).interfaceId),
            "Address not admin or required interface"  
        );
        targetTypeToContract[_name] = _smartContract;
        targetTypeContractName[_smartContract] = _name;
        grantRole(TARGET_TYPE_ROLE, _smartContract);
    }

    /// @notice Remove a target type smart contract from the protocol
    function removeTargetType(address _smartContract) external {
        delete targetTypeToContract[targetTypeContractName[_smartContract]];
        delete targetTypeContractName[_smartContract];
        revokeRole(TARGET_TYPE_ROLE, _smartContract);
    }

    /// @notice Toggle whether the target type is paused or not
    function toggleIsTargetTypePaused(address _smartContract) external onlyRole(DEFAULT_ADMIN_ROLE) {
        isTargetTypePaused[_smartContract] = !isTargetTypePaused[_smartContract];
        emit TargetTypePauseToggled(isTargetTypePaused[_smartContract]);
    }

    function version() external pure returns (string memory) {
        return VERSION;
    }
}
