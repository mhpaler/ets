// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import { IETS } from "../interfaces/IETS.sol";
import { IETSToken } from "../interfaces/IETSToken.sol";
import { IETSTarget } from "../interfaces/IETSTarget.sol";
import { IETSRelayer } from "../relayers/interfaces/IETSRelayer.sol";
import { ERC165 } from "@openzeppelin/contracts/utils/introspection/ERC165.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { Pausable } from "@openzeppelin/contracts/security/Pausable.sol";

abstract contract RelayerMock is ERC165, IETSRelayer, Ownable, Pausable {
    /// @notice Address and interface for ETS Core.
    IETS public ets;

    /// @notice Address and interface for ETS Token
    IETSToken public etsToken;

    /// @notice Address and interface for ETS Target.
    IETSTarget public etsTarget;

    // Public constants

    /// @notice machine name for this target tagger.
    string public constant NAME = "RelayerMock";
    bytes4 public constant IID_IETSRELAYER = type(IETSRelayer).interfaceId;

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

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    function changeOwner(address _newOwner) public whenPaused {}

    // ============ PUBLIC INTERFACE ============

    function applyTags(IETS.TaggingRecordRawInput[] calldata _rawInput, address _relayer) external payable {
        // Mock implementation
    }

    function replaceTags(IETS.TaggingRecordRawInput[] calldata _rawInput, address _relayer) external payable {
        // Mock implementation
    }

    function removeTags(IETS.TaggingRecordRawInput[] calldata _rawInput, address _relayer) external payable {
        // Mock implementation
    }

    function getOrCreateTagIds(string[] calldata _tags) public payable returns (uint256[] memory _tagIds) {}

    function computeTaggingFee(
        IETS.TaggingRecordRawInput calldata _rawInput,
        IETS.TaggingAction _action
    ) public view returns (uint256 fee, uint256 tagCount) {}

    // ============ PUBLIC VIEW FUNCTIONS ============

    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC165, IETSRelayer) returns (bool) {
        return interfaceId == IID_IETSRELAYER || super.supportsInterface(interfaceId);
    }

    function isPaused() public view returns (bool) {}

    function getRelayerName() public pure returns (string memory) {
        return NAME;
    }

    function getCreator() public view returns (address payable) {}

    function getOwner() public view returns (address payable) {}
}
