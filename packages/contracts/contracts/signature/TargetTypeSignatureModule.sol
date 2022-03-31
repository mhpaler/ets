// SPDX-License-Identifier: MIT

pragma solidity 0.8.12;

import { EIP712Upgradeable } from "@openzeppelin/contracts-upgradeable/utils/cryptography/draft-EIP712Upgradeable.sol";
import { ECDSAUpgradeable } from "@openzeppelin/contracts-upgradeable/utils/cryptography/ECDSAUpgradeable.sol";
import { Initializable } from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

/// @notice Module that can be added to any target type in order to offer signature support
abstract contract TargetTypeSignatureModule is Initializable, EIP712Upgradeable {

    bytes32 private _TAG_TYPEHASH;

    struct Signature {
        uint8 v;
        bytes32 r;
        bytes32 s;
    }

    function __TargetTypeSignatureModule_init(
        string memory _contractName,
        string memory _version
    ) internal initializer {
        __EIP712_init_unchained(_contractName, _version);

        // tagParamsHash will be keccak256 of targetURI
        _TAG_TYPEHASH = keccak256("Tag(bytes32 tagParamsHash)");
        // todo - update above name
    }

    function recoverAddress(
        bytes32 _taggingRecordsHash,
        uint8 _v,
        bytes32 _r,
        bytes32 _s
    ) internal view returns (address) {
        bytes32 tagStructHash = keccak256(
            abi.encode(_TAG_TYPEHASH, _taggingRecordsHash)
        );

        return ECDSAUpgradeable.recover(
            _hashTypedDataV4(tagStructHash),
            _v,
            _r,
            _s
        );
    }
}
