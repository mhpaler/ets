// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "../interfaces/IETS.sol";
import "../interfaces/IETSToken.sol";
import "../interfaces/IETSTarget.sol";
import "../interfaces/IETSTargetTagger.sol";
import { Strings } from "@openzeppelin/contracts/utils/Strings.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { Pausable } from "@openzeppelin/contracts/security/Pausable.sol";

contract TargetTaggerMock is IETSTargetTagger, Ownable, Pausable {
    /// @notice Address and interface for ETS Core.
    IETS public ets;

    /// @notice Address and interface for ETS Token
    IETSToken public etsToken;

    /// @notice Address and interface for ETS Target.
    IETSTarget public etsTarget;

    // Public constants

    /// @notice machine name for this target tagger.
    string public constant name = "TargetTaggerMock";

    // Public variables

    /// @notice Address that built this smart contract.
    address payable public creator;

    constructor(
        IETS _ets,
        IETSToken _etsToken,
        IETSTarget _etsTarget,
        address payable _creator,
        address payable _owner
    ) {
        ets = _ets;
        etsToken = _etsToken;
        etsTarget = _etsTarget;
        creator = _creator;
        transferOwnership(_owner);
    }

    // ============ OWNER INTERFACE ============

    function toggleTargetTaggerPaused() public onlyOwner {
        if (paused()) {
            _unpause();
        } else {
            _pause();
        }

        emit TargetTaggerPaused(paused());
    }

    // ============ PUBLIC INTERFACE ============

    function tagTarget(TaggingRecord[] calldata _taggingRecords) public payable {}

    // ============ PUBLIC VIEW FUNCTIONS ============

    function getTaggerName() public pure returns (string memory) {
        return name;
    }

    function getCreator() public view returns (address payable) {}

    function getOwner() public view returns (address payable) {}

    /// @inheritdoc IETSTargetTagger
    function isTargetTaggerPaused() public view override returns (bool) {
        return paused();
    }

    function supportsInterface(bytes4 interfaceId) public view virtual override returns (bool) {
        return interfaceId == type(IERC165).interfaceId || interfaceId == type(IETSTargetTagger).interfaceId;
    }

    // ============ INTERNAL FUNCTIONS ============
}
