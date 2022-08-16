// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "./interfaces/IETS.sol";
import "./interfaces/IETSToken.sol";
import "./interfaces/IETSTarget.sol";
import "./interfaces/IETSAccessControls.sol";
import { UintArrayUtils } from "./libraries/UintArrayUtils.sol";
import "@openzeppelin/contracts-upgradeable/utils/ContextUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";

import "hardhat/console.sol";

/**
 * @title ETS
 * @author Ethereum Tag Service <team@ets.xyz>
 *
 * @notice This is the core ETS tagging contract that records TaggingRecords to the blockchain.
 * It also contains some governance functions around tagging fees as well as means for market
 * participants to access accrued funds.
 */
contract ETS is IETS, Initializable, ContextUpgradeable, ReentrancyGuardUpgradeable, UUPSUpgradeable {
    using UintArrayUtils for uint256[];

    // Public variables

    /// @dev ETS access controls contract.
    IETSAccessControls public etsAccessControls;

    /// @dev CTAG erc-721 token contract.
    IETSToken public etsToken;

    /// @dev ETS Targets contract.
    IETSTarget public etsTarget;

    /// @dev Fee in MATIC Collected by ETS for tagging.
    uint256 public override taggingFee;

    /// @dev Percentage of tagging fee allocated to ETS.
    uint256 public platformPercentage;

    /// @dev Percentage of tagging fee allocated to Publisher.
    uint256 public publisherPercentage;

    /// @dev Map for holding amount accrued to participant address wallets.
    mapping(address => uint256) public accrued;

    /// @dev Map for holding lifetime amount drawn down from accrued by participants.
    mapping(address => uint256) public paid;

    /// @dev Map of tagging id to tagging record.
    mapping(uint256 => TaggingRecord) public taggingRecords;

    /// Public constants

    string public constant NAME = "ETS Core";
    uint256 public constant modulo = 100;

    /// Modifiers

    /// @dev When applied to a method, only allows execution when the sender has the admin role.
    modifier onlyAdmin() {
        require(etsAccessControls.isAdmin(_msgSender()), "Caller must be admin");
        _;
    }

    /// @dev Require that caller is original publisher or tagger.
    modifier onlyPublisherOrTagger(uint256 _taggingRecordId) {
        require(
            taggingRecords[_taggingRecordId].publisher == _msgSender() ||
                taggingRecords[_taggingRecordId].tagger == _msgSender(),
            "Caller not original publisher or tagger"
        );
        _;
    }

    /// @dev Require that tags are supplied to the operating function.
    modifier tagsSupplied(uint256[] calldata tags) {
        require(tags.length > 0, "No tags supplied");
        _;
    }

    // ============ UUPS INTERFACE ============

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(
        IETSAccessControls _etsAccessControls,
        IETSToken _etsToken,
        IETSTarget _etsTarget,
        uint256 _taggingFee,
        uint256 _platformPercentage,
        uint256 _publisherPercentage
    ) public initializer {
        etsAccessControls = _etsAccessControls;
        etsToken = _etsToken;
        etsTarget = _etsTarget;
        taggingFee = _taggingFee;
        setPercentages(_platformPercentage, _publisherPercentage);
    }

    // Ensure that only address with admin role can upgrade.
    function _authorizeUpgrade(address) internal override onlyAdmin {}

    // ============ OWNER INTERFACE ============

    /**
     * @notice Sets ETSAccessControls on the ETSTarget contract so functions can be
     * restricted to ETS platform only. Note Caller of this function must be deployer
     * or pre-set as admin of new contract.
     *
     * @param _accessControls Address of ETSAccessControls contract.
     */
    function setAccessControls(IETSAccessControls _accessControls) public onlyAdmin {
        require(address(_accessControls) != address(0), "Address cannot be zero");
        require(_accessControls.isAdmin(_msgSender()), "Caller not admin in new contract");
        etsAccessControls = _accessControls;
        emit AccessControlsSet(address(etsAccessControls));
    }

    /// @notice Sets the fee required to tag an NFT asset.
    /// @param _fee Value of the fee in WEI.
    function setTaggingFee(uint256 _fee) public onlyAdmin {
        taggingFee = _fee;
        emit TaggingFeeSet(taggingFee);
    }

    /// @notice Admin functionality for updating the percentages.
    /// @param _platformPercentage percentage for platform.
    /// @param _publisherPercentage percentage for publisher.
    function setPercentages(uint256 _platformPercentage, uint256 _publisherPercentage) public onlyAdmin {
        require(_platformPercentage + _publisherPercentage <= 100, "percentages must not be over 100");
        platformPercentage = _platformPercentage;
        publisherPercentage = _publisherPercentage;

        emit PercentagesSet(platformPercentage, publisherPercentage);
    }

    // ============ PUBLIC INTERFACE ============

    /// @inheritdoc IETS
    function applyTags(
        uint256[] calldata _tagIds,
        uint256 _targetId,
        string memory _recordType,
        address payable _tagger
    ) public payable nonReentrant tagsSupplied(_tagIds) {
        require(etsAccessControls.isPublisherAndNotPaused(_msgSender()), "Caller not IETSPublisher contract");
        require(bytes(_recordType).length < 31, "Record type too long");

        uint256 taggingRecordId = computeTaggingRecordId(_targetId, _recordType, _msgSender(), _tagger);
        if (taggingRecordExistsById(taggingRecordId)) {
            // Filter out new tags from the supplied tags.
            uint256[] memory newTags = UintArrayUtils.difference(_tagIds, taggingRecords[taggingRecordId].tagIds);

            if (newTags.length > 0) {
                _processTaggingFees(newTags);
                _appendTags(taggingRecordId, newTags);
            }
        } else {
            _processTaggingFees(_tagIds);
            _createTaggingRecord(_tagIds, _targetId, _recordType, _msgSender(), _tagger);
        }
    }

    /// @inheritdoc IETS
    function applyTagsByTaggingRecordId(uint256 _taggingRecordId, uint256[] calldata _tagIds)
        public
        payable
        nonReentrant
        onlyPublisherOrTagger(_taggingRecordId)
        tagsSupplied(_tagIds)
    {
        require(taggingRecordExistsById(_taggingRecordId), "Tagging record not found");

        // Filter out new tags from the supplied tags.
        uint256[] memory newTags = UintArrayUtils.difference(_tagIds, taggingRecords[_taggingRecordId].tagIds);

        if (newTags.length > 0) {
            _processTaggingFees(newTags);
            _appendTags(_taggingRecordId, newTags);
        }
    }

    /// @inheritdoc IETS
    function removeTags(
        uint256[] calldata _tagIds,
        uint256 _targetId,
        string memory _recordType,
        address payable _tagger
    ) public tagsSupplied(_tagIds) {
        // Existence of record implies that original publisher is caller.
        uint256 taggingRecordId = computeTaggingRecordId(_targetId, _recordType, _msgSender(), _tagger);
        require(taggingRecordExistsById(taggingRecordId), "Tagging record not found");
        require(_tagIds.length <= taggingRecords[taggingRecordId].tagIds.length, "Too many tags supplied");

        // Find tags shared by supplied tags and tagging record tags.
        uint256[] memory tagsToRemove = UintArrayUtils.intersect(_tagIds, taggingRecords[taggingRecordId].tagIds);

        if (tagsToRemove.length > 0) {
            _removeTags(taggingRecordId, _tagIds);
        }
    }

    /// @inheritdoc IETS
    function removeTagsByTaggingRecordId(uint256 _taggingRecordId, uint256[] calldata _tagIds)
        public
        tagsSupplied(_tagIds)
        onlyPublisherOrTagger(_taggingRecordId)
    {
        require(taggingRecordExistsById(_taggingRecordId), "Tagging record not found");
        require(_tagIds.length <= taggingRecords[_taggingRecordId].tagIds.length, "Too many tags supplied");

        // Find tags shared by supplied tags and tagging record tags.
        uint256[] memory tagsToRemove = UintArrayUtils.intersect(_tagIds, taggingRecords[_taggingRecordId].tagIds);

        if (tagsToRemove.length > 0) {
            _removeTags(_taggingRecordId, _tagIds);
        }
    }

    /// @inheritdoc IETS
    function replaceTags(
        uint256[] calldata _tagIds,
        uint256 _targetId,
        string memory _recordType,
        address payable _tagger
    ) public payable nonReentrant tagsSupplied(_tagIds) {
        uint256 taggingRecordId = computeTaggingRecordId(_targetId, _recordType, _msgSender(), _tagger);
        require(taggingRecordExistsById(taggingRecordId), "Tagging record not found");

        // Remove tags from tagging record not in replacement tags.
        uint256[] memory tagsToRemove = UintArrayUtils.difference(taggingRecords[taggingRecordId].tagIds, _tagIds);

        if (tagsToRemove.length > 0) {
            _removeTags(taggingRecordId, tagsToRemove);
        }

        // Append new tags in the replacement tags to the tagging record.
        uint256[] memory newTags = UintArrayUtils.difference(_tagIds, taggingRecords[taggingRecordId].tagIds);

        if (newTags.length > 0) {
            _processTaggingFees(newTags);
            _appendTags(taggingRecordId, newTags);
        }
    }

    /// @inheritdoc IETS
    function replaceTagsByTaggingRecordId(uint256 _taggingRecordId, uint256[] calldata _tagIds)
        public
        payable
        nonReentrant
        tagsSupplied(_tagIds)
        onlyPublisherOrTagger(_taggingRecordId)
    {
        require(taggingRecordExistsById(_taggingRecordId), "Tagging record not found");
        uint256[] memory tagsToRemove = UintArrayUtils.difference(taggingRecords[_taggingRecordId].tagIds, _tagIds);

        if (tagsToRemove.length > 0) {
            _removeTags(_taggingRecordId, tagsToRemove);
        }

        // Append new tags in the replacement tags to the tagging record.
        uint256[] memory newTags = UintArrayUtils.difference(_tagIds, taggingRecords[_taggingRecordId].tagIds);

        if (newTags.length > 0) {
            _processTaggingFees(newTags);
            _appendTags(_taggingRecordId, newTags);
        }
    }

    /// @inheritdoc IETS
    function drawDown(address payable _account) external nonReentrant {
        uint256 balanceDue = totalDue(_account);
        if (balanceDue > 0 && balanceDue <= address(this).balance) {
            paid[_account] = paid[_account] + balanceDue;

            (bool success, ) = _account.call{ value: balanceDue }("");
            require(success, "Transfer failed.");

            emit FundsWithdrawn(_account, balanceDue);
        }
    }

    // ============ PUBLIC VIEW FUNCTIONS ============

    /// @inheritdoc IETS
    function computeTaggingRecordId(
        uint256 _targetId,
        string memory _recordType,
        address _publisher,
        address _tagger
    ) public pure returns (uint256 taggingRecordId) {
        taggingRecordId = uint256(keccak256(abi.encodePacked(_targetId, _recordType, _publisher, _tagger)));
    }

    /// @inheritdoc IETS
    function getTaggingRecordFromId(uint256 _id)
        external
        view
        returns (
            uint256[] memory tagIds,
            uint256 targetId,
            string memory recordType,
            address publisher,
            address tagger
        )
    {
        TaggingRecord storage taggingRecord = taggingRecords[_id];
        return (
            taggingRecord.tagIds,
            taggingRecord.targetId,
            taggingRecord.recordType,
            taggingRecord.publisher,
            taggingRecord.tagger
        );
    }

    /// @inheritdoc IETS
    function getTaggingRecord(
        uint256 _targetId,
        string memory _recordType,
        address _publisher,
        address _tagger
    )
        external
        view
        returns (
            uint256[] memory tagIds,
            uint256 targetId,
            string memory recordType,
            address publisher,
            address tagger
        )
    {
        uint256 taggingRecordId = computeTaggingRecordId(_targetId, _recordType, _publisher, _tagger);

        TaggingRecord storage taggingRecord = taggingRecords[taggingRecordId];

        return (
            taggingRecord.tagIds,
            taggingRecord.targetId,
            taggingRecord.recordType,
            taggingRecord.publisher,
            taggingRecord.tagger
        );
    }

    /// @inheritdoc IETS
    function taggingRecordExists(
        uint256 _targetId,
        string memory _recordType,
        address _publisher,
        address _tagger
    ) public view returns (bool) {
        uint256 taggingRecordId = computeTaggingRecordId(_targetId, _recordType, _publisher, _tagger);
        return taggingRecordExistsById(taggingRecordId);
    }

    /// @inheritdoc IETS
    function taggingRecordExistsById(uint256 _taggingRecordId) public view returns (bool) {
        return taggingRecords[_taggingRecordId].targetId != 0 ? true : false;
    }

    /// @inheritdoc IETS
    function totalDue(address _account) public view returns (uint256 _due) {
        return accrued[_account] - paid[_account];
    }

    // ============ INTERNAL FUNCTIONS ============

    /// @dev write a tagging record, mapping a taggingRecordId to a TaggingRecord struct.
    function _createTaggingRecord(
        uint256[] memory _tagIds,
        uint256 _targetId,
        string memory _recordType,
        address _publisher,
        address _tagger
    ) private {
        uint256 taggingRecordId = computeTaggingRecordId(_targetId, _recordType, _publisher, _tagger);
        taggingRecords[taggingRecordId] = TaggingRecord({
            tagIds: _tagIds,
            targetId: _targetId,
            recordType: _recordType,
            publisher: _publisher,
            tagger: _tagger
        });

        emit TargetTagged(taggingRecordId);
    }

    /// @dev Update the tags in a tagging record.
    function _updateTaggingRecord(uint256 _taggingRecordId, uint256[] memory _tagIds) private {
        taggingRecords[_taggingRecordId].tagIds = _tagIds;
        // Log that a tagging record has been updated.
        emit TaggingRecordUpdated(_taggingRecordId);
    }

    /**
     * @dev Append tags to a tagging record
     */
    function _appendTags(uint256 _taggingRecordId, uint256[] memory _tagIds) private {
        // Merge _newTagIds with existing tags.
        uint256[] memory mergedTagsIds = UintArrayUtils.extend(taggingRecords[_taggingRecordId].tagIds, _tagIds);
        _updateTaggingRecord(_taggingRecordId, mergedTagsIds);
    }

    /**
     * @dev Remove tags from tagging record.
     */
    function _removeTags(uint256 _taggingRecordId, uint256[] memory _tagIds) private {
        uint256[] memory tagIds = UintArrayUtils.difference(taggingRecords[_taggingRecordId].tagIds, _tagIds);
        _updateTaggingRecord(_taggingRecordId, tagIds);
    }

    function _processTaggingFees(uint256[] memory _tagIds) private {
        require(msg.value >= (taggingFee * _tagIds.length), "Insufficient tagging fee supplied");
        address platform = etsAccessControls.getPlatformAddress();
        for (uint256 i; i < _tagIds.length; ++i) {
            _processAccrued(_tagIds[i], platform);
        }
    }

    // @dev Internal function to divide up the tagging fee and accrue it to ETS participants.
    function _processAccrued(uint256 _tagId, address _platform) private {
        // Note: This will cause _processTaggingFees to revert if tagId doesn't exist.
        address owner = etsToken.ownerOf(_tagId);
        IETSToken.Tag memory tag = etsToken.getTagById(_tagId);

        uint256 platformAllocation = (msg.value * platformPercentage) / modulo;
        uint256 publisherAllocation = (msg.value * publisherPercentage) / modulo;
        uint256 remainingAllocation = msg.value - (platformAllocation + publisherAllocation);

        accrued[_platform] = accrued[_platform] + platformAllocation;
        accrued[tag.publisher] = accrued[tag.publisher] + publisherAllocation;

        // pre-auction.
        if (owner == _platform) {
            accrued[tag.creator] = accrued[tag.creator] + remainingAllocation;
        }
        // post-auction.
        else {
            accrued[owner] = accrued[owner] + remainingAllocation;
        }
    }
}
