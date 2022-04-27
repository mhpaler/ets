// SPDX-License-Identifier: MIT

pragma solidity 0.8.12;

import { PausableUpgradeable } from "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import { OwnableUpgradeable } from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import { UUPSUpgradeable } from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import { StringsUpgradeable } from "@openzeppelin/contracts-upgradeable/utils/StringsUpgradeable.sol";
import { TargetTypeSignatureModule } from "../module/TargetTypeSignatureModule.sol";
import { IETSTargetType, IERC165 } from "../interfaces/IETSTargetType.sol";
import { IETS } from "../interfaces/IETS.sol";

/// @title ETS EVMNFT Target Type Tagger Contract
/// @author Ethereum Tag Service <security@ets.xyz>
/// @notice Contract that moderates tagging of EVM compatible NFTs on the ETS platform.
/// @dev UUPS upgradable.
contract EVMNFT is IETSTargetType, TargetTypeSignatureModule, OwnableUpgradeable, UUPSUpgradeable, PausableUpgradeable {

    /// @notice EVMNFT Target Type tagging record input structure.
    /// When tagging an EVM compatible NFT on ETS, the EVMNFT Target Type
    /// subcontract (this) tag() function requires a tagging record be
    /// supplied as an array of json strings structured as follows:
    ///
    /// @param nftAddress Contract address of the target NFT as a string.
    /// @param tokenId Token Id of the target nft as a string.
    /// @param chainId EVM Chain Id the target nft is on as a string.
    /// @param tagStrings Array of strings to tag the target with.
    /// @param ensure Boolean whether to ensure the target using ETS Ensure API.
    struct TaggingRecordParams {
        string nftAddress;
        string tokenId;
        string chainId;
        string[] tagStrings;
        bool ensure;
    }

    /// @notice Address that built the target type smart contract.
    address payable public override creator;

    /// @notice Address and interface for ETS core.
    IETS public ets;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() initializer {}

    /// @param _creator Creator of the target type smart contract.
    /// @param _owner Who will become owner and able to upgrade the contract.
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

    /// @notice Ownable based upgrade authorisation.
    function _authorizeUpgrade(address newImplementation) internal onlyOwner override {}

    /// @notice Publisher sponsored recording of one or more tagging records to
    /// ETS Core. A "tagging record" here is an EVMNFT target tagged with one
    /// or more tag strings. Tagging records are passed in as an array of one
    /// or more json objects that conform to the TaggingRecordParams struct.
    /// "Publisher sponsored" means the tagger is receiving attribution for
    /// the tagging record and the publisher is paying for the transaction.
    ///
    /// @param _taggingRecords Array of TaggingRecordParams structs.
    /// @param _taggerSignature EIP712 signature signed by tagger.
    /// @param _publisherSignature EIP712 signature signed by publisher.
    function tag(
        TaggingRecordParams[] calldata _taggingRecords,
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

    /// @dev Internal function that ads global tagging record via ETS Core.
    /// @param _taggingRecord Array of json of TaggingRecordParams structs.
    /// @param _publisher Address of publisher, extracted from _publisherSignature.
    /// @param _tagger Address of tagger, extracted from _taggerSignature.
    /// @param _currentFee ETS tagging fee per tag.
    function _tag(
        TaggingRecordParams calldata _taggingRecord,
        address payable _publisher,
        address _tagger,
        uint256 _currentFee
    ) internal {
        // compute concatenated target URI from tag params
        string memory targetURI = composeTargetURI(
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

    /// @dev Compose target type input params into a format expected by ETS Ensure API.
    /// @param _nftAddress Contract address of the target NFT as a string.
    /// @param _tokenId Token Id of the target nft as a string.
    /// @param _chainId EVM Chain Id the target nft is on as a string.
    /// @return ETS Ensure API compatible string.
    function composeTargetURI(
        string calldata _nftAddress,
        string calldata _tokenId,
        string calldata _chainId
    ) public pure returns (string memory) {
        // Extra layers that could be added: if EVM is from the same chain, validation can be performed
        // ETS Ensure targetURI boilerplate format for EVMNFT is contract address|token id|chain id
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
