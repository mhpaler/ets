// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../interfaces/IETSTargetType.sol";
import "../interfaces/IETS.sol";

// example implementation of 1 target type tagging subcontract
contract MockNftTagger is IETSTargetType {
    string public constant NAME = "nft";

    address payable public override creator;

    bool isPaused;

    /// @notice Address and interface for ETS core
    IETS public ets;

    function tag(
        string calldata _nftAddress,
        string calldata _tokenId,
        string calldata _chainId,
        address payable _publisher,
        address _tagger,
        string calldata _tagString
    ) external {
        string memory targetURI = string(abi.encodePacked(
                _nftAddress,
                _tokenId,
                _chainId
            ));

        ets.tagTarget(
            _tagString,
            targetURI,
            _publisher,
            _tagger
        );
    }

    /// @inheritdoc IETSTargetType
    function toggleTargetTypePaused() external override {
        isPaused = !isPaused;
        emit TargetTypePaused(NAME, isPaused);
    }

    function validateTargetURI(string calldata targetURI) external override view returns (bool) {
        return false;
    }

    function isTargetTypePaused() external override view returns (bool) {
        return isPaused;
    }
}
