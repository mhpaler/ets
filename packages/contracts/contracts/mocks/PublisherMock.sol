// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "../interfaces/IETS.sol";
import "../interfaces/IETSToken.sol";
import "../interfaces/IETSTarget.sol";
import "../interfaces/IETSPublisher.sol";
import { ERC165 } from "@openzeppelin/contracts/utils/introspection/ERC165.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { Pausable } from "@openzeppelin/contracts/security/Pausable.sol";

contract PublisherMock is ERC165, IETSPublisher, Ownable, Pausable {
    /// @notice Address and interface for ETS Core.
    IETS public ets;

    /// @notice Address and interface for ETS Token
    IETSToken public etsToken;

    /// @notice Address and interface for ETS Target.
    IETSTarget public etsTarget;

    // Public constants

    /// @notice machine name for this target tagger.
    string public constant name = "PublisherMock";
    bytes4 public constant IID_IETSPublisher = type(IETSPublisher).interfaceId;

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

    function applyTags(IETS.TaggingRecordRawInput[] calldata _rawParts) public payable {}

    function removeTags(IETS.TaggingRecordRawInput[] calldata _rawParts) public payable {}

    function replaceTags(IETS.TaggingRecordRawInput[] calldata _rawParts) public payable {}

    // ============ PUBLIC VIEW FUNCTIONS ============

    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC165, IETSPublisher) returns (bool) {
        return interfaceId == IID_IETSPublisher || super.supportsInterface(interfaceId);
    }

    function isPausedByOwner() public view returns (bool) {}

    function getPublisherName() public pure returns (string memory) {
        return name;
    }

    function getCreator() public view returns (address payable) {}

    function getOwner() public view returns (address payable) {}
}
