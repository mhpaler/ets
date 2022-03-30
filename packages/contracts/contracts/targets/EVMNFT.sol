// SPDX-License-Identifier: MIT

pragma solidity 0.8.12;

import { PausableUpgradeable } from "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import { OwnableUpgradeable } from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import { UUPSUpgradeable } from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import { StringsUpgradeable } from "@openzeppelin/contracts-upgradeable/utils/StringsUpgradeable.sol";
import { TargetTypeSignatureModule } from "../signature/TargetTypeSignatureModule.sol";
import { IETSTargetType, IERC165 } from "../interfaces/IETSTargetType.sol";
import { IETS } from "../interfaces/IETS.sol";

// example implementation of 1 target type tagging subcontract
contract EVMNFT is IETSTargetType, TargetTypeSignatureModule, OwnableUpgradeable, UUPSUpgradeable, PausableUpgradeable {

    /// @notice Definition of an NFT tag event
    struct TagParams {
        string nftAddress;
        string tokenId;
        string chainId;
        bool ensure;
        string[] tagStrings;
    }

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
    function tag(
        TagParams[] calldata _taggingRecords,
        Signature calldata _taggerSignature,
        Signature calldata _publisherSignature
    ) external payable {
        bytes32 taggingRecordsHash = keccak256(abi.encode(_taggingRecords));

        address tagger = recoverAddress(
            taggingRecordsHash,
            _taggerSignature.v,
            _taggerSignature.r,
            _taggerSignature.s
        );

        address payable publisher = payable(recoverAddress(
            taggingRecordsHash,
            _publisherSignature.v,
            _publisherSignature.r,
            _publisherSignature.s
        ));

        uint256 currentTaggingFee = ets.taggingFee();

        for (uint256 i; i < _taggingRecords.length; ++i) {
            // call ETS informing of a new tag
            _tag(
                _taggingRecords[i],
                publisher,
                tagger,
                currentTaggingFee
            );
        }

        assert(address(this).balance == 0);
    }

    function _tag(
        TagParams calldata _taggingRecord,
        address payable _publisher,
        address _tagger,
        uint256 _currentFee
    ) internal {
        // compute concatenated target URI from tag params
        string memory targetURI = computeTargetURI(
            _taggingRecord.nftAddress,
            _taggingRecord.tokenId,
            _taggingRecord.chainId
        );

        uint256 valueToSendForTagging = (_currentFee * _taggingRecord.tagStrings.length);
        require(address(this).balance >= valueToSendForTagging, "Not enough funds to complete tagging");

        ets.tagTarget{ value: valueToSendForTagging }(
            _taggingRecord.tagStrings,
            targetURI,
            _publisher,
            _tagger,
            msg.sender,
            _taggingRecord.ensure
        );
    }

    // Based on tagging params, concatenate the string in an ensure-compliant way
    function computeTargetURI(
        string calldata _nftAddress,
        string calldata _tokenId,
        string calldata _chainId
    ) public pure returns (string memory) {
        // Extra layers that could be added: if EVM is from the same chain, validation can be performed
        // targetURI boilerplate format for EVM Nft is contract address|token id|chain id
        // eg "0x8ee9a60cb5c0e7db414031856cb9e0f1f05988d1|3061|1"
        return string(abi.encodePacked(_nftAddress, "|", _tokenId, "|", _chainId));
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
        return "EVMNFT";
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
