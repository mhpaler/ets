// SPDX-License-Identifier: MIT

pragma solidity 0.8.12;

import { PausableUpgradeable } from "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import { OwnableUpgradeable } from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import { UUPSUpgradeable } from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import { StringsUpgradeable } from "@openzeppelin/contracts-upgradeable/utils/StringsUpgradeable.sol";
import { TargetTypeSignatureModule } from "../module/TargetTypeSignatureModule.sol";
import { IETSTargetType, IERC165 } from "../interfaces/IETSTargetType.sol";
import { IETS } from "../interfaces/IETS.sol";

contract EVMERC20Contract is IETSTargetType, TargetTypeSignatureModule, OwnableUpgradeable, UUPSUpgradeable, PausableUpgradeable {

    /// @notice Address that built the target type smart contract
    address payable public override creator;

    /// @notice Address and interface for ETS core
    IETS public ets;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() initializer {}

    /// @param _creator Creator of the target type smart contract
    /// @param _owner Who will become owner and able to upgrade the contract
    function initialize(
        IETS _ets,
        address payable _creator,
        address _owner
    ) external initializer {
        __Ownable_init();
        __UUPSUpgradeable_init();
        __Pausable_init();
        __TargetTypeSignatureModule_init(name(), version());

        ets = _ets;
        creator = _creator;
        transferOwnership(_owner);
    }

    /// @notice Ownable based upgrade authorisation
    function _authorizeUpgrade(address newImplementation)
    internal
    onlyOwner
    override
    {}

    /// @notice Tagging an NFT target where taggers can be offered the ability to have the GAS sponsored
    function tag() external payable {}

    /// @notice Allow owner to toggle pausing on and off
    function toggleTargetTypePaused() external onlyOwner {
        if (paused()) {
            _unpause();
        } else {
            _pause();
        }

        emit TargetTypePaused(name(), paused());
    }

    /// @inheritdoc IETSTargetType
    function isTargetTypePaused() external override view returns (bool) {
        return paused();
    }

    /// @inheritdoc IETSTargetType
    function name() public override pure returns (string memory) {
        return "EVMERC20Contract";
    }

    /// @inheritdoc IETSTargetType
    function version() public override pure returns (string memory) {
        return "0.0.1";
    }

    /// @notice For clients querying via ERC165, we show support for ERC165 interface plus target type interface
    /// @dev This ensures all target types conform to the same interface if they implement this function
    function supportsInterface(bytes4 interfaceId) public view virtual override returns (bool) {
        return interfaceId == type(IERC165).interfaceId || interfaceId == type(IETSTargetType).interfaceId;
    }
}
