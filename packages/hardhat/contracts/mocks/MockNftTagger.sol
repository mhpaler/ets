// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import { IETSTargetType } from "../interfaces/IETSTargetType.sol";
import { IETS } from "../interfaces/IETS.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
//todo- import styles

// example implementation of 1 target type tagging subcontract
contract MockNftTagger is IETSTargetType {

    /// @notice Address and interface for ETS core
    IETS public ets;

    // todo-this is main entry point for a user. start here
    function tag(//todo-the nft params could all be strings for non-evm nfts
        address _nftAddress,
        uint256 _tokenId,
        uint256 _chainId,
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
        emit TargetTypePaused("", false);
    }

    function validateTargetURI(string calldata targetURI) external override view returns (bool) {
        return false;
    }

    function isTargetTypePaused() external override view returns (bool) {
        return false;
    }
}
