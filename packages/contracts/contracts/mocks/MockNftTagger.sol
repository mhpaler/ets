// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import { PausableUpgradeable } from "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import { OwnableUpgradeable } from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import { UUPSUpgradeable } from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import { IETSTargetType, IERC165 } from "../interfaces/IETSTargetType.sol";
import { IETS } from "../interfaces/IETS.sol";

// example implementation of 1 target type tagging subcontract
contract MockNftTagger is IETSTargetType, OwnableUpgradeable, UUPSUpgradeable, PausableUpgradeable {

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

    /// @notice Entry point for a user to tag an EVM NFT which will call into ETS
    function tag(
        address _nftAddress,
        uint256 _tokenId,
        uint256 _chainId,
        address payable _publisher,
        address _tagger,
        string calldata _tagString,
        bool _ensure
    ) external {
        // Extra layers that could be added: if EVM is from the same chain, validation can be performed
        // targetURI boilerplate format for EVM Nft is contract address|token id|chain id
        // eg "0x8ee9a60cb5c0e7db414031856cb9e0f1f05988d1|3061|1"
        string memory targetURI = string(abi.encodePacked(_nftAddress, "|", _tokenId, "|", _chainId));

        ets.tagTarget(
            _tagString,
            targetURI,
            _publisher,
            _tagger,
            _ensure
        );
    }

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
        return "NFT";
    }

    /// @inheritdoc IETSTargetType
    function version() external override pure returns (string memory) {
        return "0.0.1";
    }

    /// @notice For clients querying via ERC165, we show support for ERC165 interface plus target type interface
    /// @dev This ensures all target types conform to the same interface if they implement this function
    function supportsInterface(bytes4 interfaceId) public view virtual override returns (bool) {
        return interfaceId == type(IERC165).interfaceId || interfaceId == type(IETSTargetType).interfaceId;
    }
}
