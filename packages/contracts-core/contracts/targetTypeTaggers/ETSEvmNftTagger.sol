// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../interfaces/IETS.sol";
import "../interfaces/IETSToken.sol";
import "../interfaces/IETSTarget.sol";
import "../interfaces/IETSTargetType.sol";
import "../interfaces/IETSTargetTypeTagger.sol";
import { Pausable } from "@openzeppelin/contracts/security/Pausable.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { Strings } from "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title ETSEvmNftTagger Contract
 * @author Ethereum Tag Service <security@ets.xyz>
 * @notice This Target Type Tagger supports tagging of one or more EVM compatible nfts with
 * one or more hashtag strings in one transaction.
 *
 * To use it, call the public tagEVMNFTs() function with an array of TaggingRecord structs
 * and a publisher address.
 *
 * The tagEVMNFTs() function will process each TaggingRecord struct as follows:
 *   - Get or create a targetId for the nft params (nftAddress, tokenId, chainId)
 *   - Get or create tagIds (CTAG token ids) for the tag strings.
 *   - Call the core ETS.tagTarget() with the tagIds and targetId function to write a tagging record to ETS.
 *
 */
abstract contract ETSEvmNftTagger is IETSTargetTypeTagger, Ownable, Pausable {
    /**
     * @notice Data structure for passing into the tagEVMNFTs() function
     *
     * @param nftAddress Contract address of the target NFT as a string.
     * @param tokenId Token Id of the target nft as a string.
     * @param chainId EVM Chain Id the target nft is on as a string.
     * @param tagStrings Array of strings to tag the target with.
     * @param ensure Boolean whether to ensure the target using ETS Ensure API.
     */
    struct TaggingRecord {
        //string nftAddress;
        //string tokenId;
        //string chainId;
        IETSTargetType.TargetTypeURI targetURI;
        string[] tagStrings;
        bool ensure;
    }

    /// @notice Address and interface for ETS Core.
    IETS public ets;

    /// @notice Address and interface for ETS Token
    IETSToken public etsToken;

    /// @notice Address and interface for ETS Target.
    IETSTarget public etsTarget;

    /// @notice Address and interface for ETS Target.
    IETSTargetType public etsTargetType;
    // Public constants

    /// @notice Type of Target this contract can be used for. Value must exist in ETSTargets.targetTypes
    //string public constant TARGET_TYPE = "EVMNFT";

    string public constant NAME = "ETSEvmNftTagger";

    // Public variables

    /// @notice Address that built the target type smart contract.
    address payable public creator;

    constructor(
        string TARGET_TYPE,
        IETS _ets,
        IETSToken _etsToken,
        IETSTarget _etsTarget,
        address payable _creator,
        address _owner
    ) {
        require (etsTarget.targetTypes[TARGET_TYPE].address != address(0), "non-existent target type");
        ets = _ets;
        etsToken = _etsToken;
        etsTarget = _etsTarget;
        etsTargetType = etsTarget.targetTypes[TARGET_TYPE];
        creator = _creator;
        transferOwnership(_owner);
    }

    // ============ OWNER INTERFACE ============

    function toggleTargetTypeTaggerPaused() public onlyOwner {
        if (paused()) {
            _unpause();
        } else {
            _pause();
        }

        emit TargetTypeTaggerPaused(paused());
    }

    // ============ PUBLIC INTERFACE ============

    function tagEVMNFTs(TaggingRecord[] calldata _taggingRecords, address payable _publisher) public payable {
        uint256 currentTaggingFee = ets.taggingFee();

        for (uint256 i; i < _taggingRecords.length; ++i) {
            _processTaggingRecord(_taggingRecords[i], _publisher, msg.sender, currentTaggingFee);
        }

        assert(address(this).balance == 0);
    }

    // ============ PUBLIC VIEW FUNCTIONS ============

    /// @inheritdoc IETSTargetTypeTagger
    function getTargetType() public pure returns (string memory) {
        return etsTargetType.name;
    }

    /// @inheritdoc IETSTargetTypeTagger
    function getName() public pure returns (string memory) {
        return NAME;
    }

    function getCreator() public pure returns (address payable) {
        return creator;
    }

    /// @inheritdoc IETSTargetTypeTagger
    function isTargetTypeTaggerPaused() public view override returns (bool) {
        return paused();
    }

    function supportsInterface(bytes4 interfaceId) public view virtual override returns (bool) {
        return interfaceId == type(IERC165).interfaceId || interfaceId == type(IETSTargetTypeTagger).interfaceId;
    }

    // ============ INTERNAL FUNCTIONS ============

    function _processTaggingRecord(
        TaggingRecord calldata _taggingRecord,
        address payable _publisher,
        address _tagger,
        uint256 _currentFee
    ) internal {
        uint256 valueToSendForTagging = (_currentFee * _taggingRecord.tagStrings.length);
        require(address(this).balance >= valueToSendForTagging, "Not enough funds to complete tagging");

        // First let's derive tagIds for the tagStrings.
        uint256[] memory tagIds = new uint256[](_taggingRecord.tagStrings.length);
        for (uint256 i; i < _taggingRecord.tagStrings.length; ++i) {
            uint256 tagId = etsToken.getOrCreateTagId(_taggingRecord.tagStrings[i], _publisher);
            // _processAccrued(tagId, _publisher);
            tagIds[i] = tagId;
        }

        // Next let's derive the targetId from the target params.
        // First we compose the TargetURI from the input params.
        // In this case, we the target is a EVM NFT, so the required
        // params are nft contract address, token id & chain id.
        string memory targetURI = composeTargetURI(
            _taggingRecord.nftAddress,
            _taggingRecord.tokenId,
            _taggingRecord.chainId
        );

        // Given the target URI, we can now get or create the target ID.
        // ETS Target Id is a composite of TARGET_TYPE constant and computed target URI.
        uint256 targetId = etsTarget.getOrCreateTargetId(TARGET_TYPE, targetURI);

        // Finally, call the core tagTarget() function to record the tagging record.
        ets.tagTarget{ value: valueToSendForTagging }(tagIds, targetId, _publisher, _tagger, _taggingRecord.ensure);
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
}
