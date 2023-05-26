// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import { IETS } from "./interfaces/IETS.sol";
import { IETSToken } from "./interfaces/IETSToken.sol";
import { IETSTarget } from "./interfaces/IETSTarget.sol";
import { IETSAccessControls } from "./interfaces/IETSAccessControls.sol";
import { UintArrayUtils } from "./libraries/UintArrayUtils.sol";
import { ContextUpgradeable } from "@openzeppelin/contracts-upgradeable/utils/ContextUpgradeable.sol";
import { Initializable } from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import { UUPSUpgradeable } from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import { ReentrancyGuardUpgradeable } from "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";

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

    /// @dev Percentage of tagging fee allocated to Relayer.
    uint256 public relayerPercentage;

    /// @dev Map for holding amount accrued to participant address wallets.
    mapping(address => uint256) public accrued;

    /// @dev Map for holding lifetime amount drawn down from accrued by participants.
    mapping(address => uint256) public paid;

    /// @dev Map of tagging id to tagging record.
    mapping(uint256 => TaggingRecord) public taggingRecords;

    /// Public constants

    string public constant NAME = "ETS Core";
    uint256 public constant MODULO = 100;

    /// Modifiers

    /// @dev When applied to a method, only allows execution when the sender has the admin role.
    modifier onlyAdmin() {
        require(etsAccessControls.isAdmin(_msgSender()), "Caller not Administrator");
        _;
    }

    modifier onlyRelayer() {
        require(etsAccessControls.isRelayer(_msgSender()), "Caller not Relayer");
        _;
    }

    /// @dev Require that caller is original relayer or tagger.
    modifier onlyOriginalRelayerOrTagger(uint256 _taggingRecordId) {
        require(
            (taggingRecords[_taggingRecordId].relayer == _msgSender() && etsAccessControls.isRelayer(_msgSender())) ||
                taggingRecords[_taggingRecordId].tagger == _msgSender(),
            "Not authorized"
        );
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
        uint256 _relayerPercentage
    ) public initializer {
        etsAccessControls = _etsAccessControls;
        etsToken = _etsToken;
        etsTarget = _etsTarget;
        setTaggingFee(_taggingFee);
        setPercentages(_platformPercentage, _relayerPercentage);
    }

    // Ensure that only address with admin role can upgrade.
    // solhint-disable-next-line
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
    /// @param _relayerPercentage percentage for relayer.
    function setPercentages(uint256 _platformPercentage, uint256 _relayerPercentage) public onlyAdmin {
        require(_platformPercentage + _relayerPercentage <= 100, "percentages must not be over 100");
        platformPercentage = _platformPercentage;
        relayerPercentage = _relayerPercentage;

        emit PercentagesSet(platformPercentage, relayerPercentage);
    }

    // ============ PUBLIC INTERFACE ============

    /// @inheritdoc IETS
    function createTaggingRecord(
        uint256[] memory _tagIds,
        uint256 _targetId,
        string calldata _recordType,
        address _tagger
    ) public payable nonReentrant onlyRelayer {
        uint256 tagCount = _tagIds.length;
        require(tagCount > 0, "No tags supplied");
        for (uint256 i; i < tagCount; ++i) {
            require(etsToken.tagExistsById(_tagIds[i]), "Invalid tagId");
        }
        require(bytes(_recordType).length >= 3 && bytes(_recordType).length < 31, "Record type too long");
        require(etsTarget.targetExistsById(_targetId), "Invalid targetId");
        _processTaggingFees(_tagIds);
        _createTaggingRecord(_tagIds, _targetId, _recordType, _msgSender(), _tagger);
    }

    /// @inheritdoc IETS
    function getOrCreateTagId(
        string calldata _tag,
        address payable _creator
    ) public payable onlyRelayer returns (uint256 tokenId) {
        return etsToken.getOrCreateTagId(_tag, payable(_msgSender()), _creator);
    }

    /// @inheritdoc IETS
    function createTag(
        string calldata _tag,
        address payable _creator
    ) public payable nonReentrant onlyRelayer returns (uint256 _tokenId) {
        return etsToken.createTag(_tag, payable(_msgSender()), _creator);
    }

    /// @inheritdoc IETS
    function applyTagsWithRawInput(TaggingRecordRawInput calldata _rawInput, address payable _tagger) public payable {
        // Derive tagIds for the tagStrings.
        uint256 tagCount = _rawInput.tagStrings.length;
        require(tagCount > 0, "No tags supplied");

        uint256[] memory tagIds = new uint256[](tagCount);
        for (uint256 i; i < tagCount; ++i) {
            tagIds[i] = getOrCreateTagId(_rawInput.tagStrings[i], _tagger);
        }

        uint256 taggingRecordId = computeTaggingRecordIdFromRawInput(_rawInput, _msgSender(), _tagger);

        if (taggingRecordExists(taggingRecordId)) {
            appendTags(taggingRecordId, tagIds);
        } else {
            // Derive targetId from targetURI. Will revert if targetURI is empty.
            uint256 targetId = etsTarget.getOrCreateTargetId(_rawInput.targetURI);
            // Require new tagging records be inserted by relayer.
            createTaggingRecord(tagIds, targetId, _rawInput.recordType, _tagger);
        }
    }

    /// @inheritdoc IETS
    function applyTagsWithCompositeKey(
        uint256[] memory _tagIds,
        uint256 _targetId,
        string calldata _recordType,
        address payable _tagger
    ) public payable {
        uint256 tagCount = _tagIds.length;
        require(tagCount > 0, "No tags supplied");

        uint256 taggingRecordId = computeTaggingRecordIdFromCompositeKey(_targetId, _recordType, _msgSender(), _tagger);
        if (taggingRecordExists(taggingRecordId)) {
            appendTags(taggingRecordId, _tagIds);
        } else {
            createTaggingRecord(_tagIds, _targetId, _recordType, _tagger);
        }
    }

    /// @inheritdoc IETS
    function replaceTagsWithRawInput(TaggingRecordRawInput calldata _rawInput, address payable _tagger) public payable {
        uint256 tagCount = _rawInput.tagStrings.length;
        require(tagCount > 0, "No tags supplied");

        uint256[] memory tagIds = new uint256[](tagCount);
        for (uint256 i; i < tagCount; ++i) {
            tagIds[i] = getOrCreateTagId(_rawInput.tagStrings[i], _tagger);
        }

        replaceTags(computeTaggingRecordIdFromRawInput(_rawInput, _msgSender(), _tagger), tagIds);
    }

    /// @inheritdoc IETS
    function replaceTagsWithCompositeKey(
        uint256[] calldata _tagIds,
        uint256 _targetId,
        string memory _recordType,
        address payable _tagger
    ) public payable {
        replaceTags(computeTaggingRecordIdFromCompositeKey(_targetId, _recordType, _msgSender(), _tagger), _tagIds);
    }

    /// @inheritdoc IETS
    function removeTagsWithRawInput(TaggingRecordRawInput calldata _rawInput, address _tagger) public {
        uint256 rawTagCount = _rawInput.tagStrings.length;
        uint256[] memory tagIds = new uint256[](rawTagCount);
        for (uint256 i; i < rawTagCount; ++i) {
            tagIds[i] = etsToken.computeTagId(_rawInput.tagStrings[i]);
        }
        removeTags(computeTaggingRecordIdFromRawInput(_rawInput, _msgSender(), _tagger), tagIds);
    }

    /// @inheritdoc IETS
    function removeTagsWithCompositeKey(
        uint256[] calldata _tagIds,
        uint256 _targetId,
        string memory _recordType,
        address payable _tagger
    ) public {
        removeTags(computeTaggingRecordIdFromCompositeKey(_targetId, _recordType, _msgSender(), _tagger), _tagIds);
    }

    /// @inheritdoc IETS
    function appendTags(
        uint256 _taggingRecordId,
        uint256[] memory _tagIds
    ) public payable nonReentrant onlyOriginalRelayerOrTagger(_taggingRecordId) {
        require(_tagIds.length > 0, "No tags supplied");

        // Filter out new tags from the supplied tags.
        _tagIds = UintArrayUtils.difference(_tagIds, taggingRecords[_taggingRecordId].tagIds);

        if (_tagIds.length > 0) {
            _processTaggingFees(_tagIds);
            _appendTags(_taggingRecordId, _tagIds);
        }
    }

    /// @inheritdoc IETS
    function replaceTags(
        uint256 _taggingRecordId,
        uint256[] memory _tagIds
    ) public payable nonReentrant onlyOriginalRelayerOrTagger(_taggingRecordId) {
        require(_tagIds.length > 0, "No tags supplied");

        // Find all the tags NOT SHARED by the tagging record and the replacement set.
        uint256[] memory notShared = UintArrayUtils.difference(taggingRecords[_taggingRecordId].tagIds, _tagIds);

        // Remove these from the tagging record.
        if (notShared.length > 0) {
            _removeTags(_taggingRecordId, notShared);
        }

        // Filter out new tags from the replacement set
        _tagIds = UintArrayUtils.difference(_tagIds, taggingRecords[_taggingRecordId].tagIds);

        if (_tagIds.length > 0) {
            _processTaggingFees(_tagIds);
            _appendTags(_taggingRecordId, _tagIds);
        }
    }

    /// @inheritdoc IETS
    function removeTags(
        uint256 _taggingRecordId,
        uint256[] memory _tagIds
    ) public nonReentrant onlyOriginalRelayerOrTagger(_taggingRecordId) {
        require(_tagIds.length > 0, "No tags supplied");

        // Find tags shared by supplied tags and tagging record tags.
        _tagIds = UintArrayUtils.intersect(_tagIds, taggingRecords[_taggingRecordId].tagIds);

        if (_tagIds.length > 0) {
            // No tagging fee when tags are removed.
            _removeTags(_taggingRecordId, _tagIds);
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
    function computeTaggingRecordIdFromRawInput(
        TaggingRecordRawInput memory _rawInput,
        address _relayer,
        address _tagger
    ) public view returns (uint256 taggingRecordId) {
        return
            computeTaggingRecordIdFromCompositeKey(
                etsTarget.computeTargetId(_rawInput.targetURI),
                _rawInput.recordType,
                _relayer,
                _tagger
            );
    }

    /// @inheritdoc IETS
    function computeTaggingRecordIdFromCompositeKey(
        uint256 _targetId,
        string memory _recordType,
        address _relayer,
        address _tagger
    ) public pure returns (uint256 taggingRecordId) {
        taggingRecordId = uint256(keccak256(abi.encodePacked(_targetId, _recordType, _relayer, _tagger)));
    }

    /// @inheritdoc IETS
    function computeTaggingFeeFromRawInput(
        TaggingRecordRawInput calldata _rawInput,
        address _relayer,
        address _tagger,
        TaggingAction _action
    ) public view returns (uint256 fee, uint256 tagCount) {
        uint256 rawTagCount = _rawInput.tagStrings.length;
        uint256[] memory tagIds = new uint256[](rawTagCount);
        for (uint256 i; i < rawTagCount; ++i) {
            tagIds[i] = etsToken.computeTagId(_rawInput.tagStrings[i]);
        }
        return computeTaggingFee(computeTaggingRecordIdFromRawInput(_rawInput, _relayer, _tagger), tagIds, _action);
    }

    /// @inheritdoc IETS
    function computeTaggingFeeFromCompositeKey(
        uint256[] memory _tagIds,
        uint256 _targetId,
        string calldata _recordType,
        address _relayer,
        address _tagger,
        TaggingAction _action
    ) public view returns (uint256 fee, uint256 tagCount) {
        return
            computeTaggingFee(
                computeTaggingRecordIdFromCompositeKey(_targetId, _recordType, _relayer, _tagger),
                _tagIds,
                _action
            );
    }

    /// @inheritdoc IETS
    function computeTaggingFee(
        uint256 _taggingRecordId,
        uint256[] memory _tagIds,
        TaggingAction _action
    ) public view returns (uint256 fee, uint256 tagCount) {
        // Return quickly when no tagging record exists.
        if (!taggingRecordExists(_taggingRecordId)) {
            return (_computeTaggingFee(_tagIds.length), _tagIds.length);
        }

        if (TaggingAction(_action) == TaggingAction.APPEND) {
            // remove tagging record tag ids from input tag ids to return number of new tags applied.
            _tagIds = UintArrayUtils.difference(_tagIds, taggingRecords[_taggingRecordId].tagIds);
        }

        if (TaggingAction(_action) == TaggingAction.REPLACE) {
            // Remove tags from tagging record not in replacement tag set.
            uint256[] memory taggingRecordTags = taggingRecords[_taggingRecordId].tagIds;
            uint256[] memory tagsToRemove = UintArrayUtils.difference(taggingRecords[_taggingRecordId].tagIds, _tagIds);
            if (tagsToRemove.length > 0) {
                taggingRecordTags = UintArrayUtils.difference(taggingRecords[_taggingRecordId].tagIds, tagsToRemove);
            }

            _tagIds = UintArrayUtils.difference(_tagIds, taggingRecordTags);
        }

        if (TaggingAction(_action) == TaggingAction.REMOVE) {
            // Find tags shared by supplied tags and tagging record tags.
            _tagIds = UintArrayUtils.intersect(_tagIds, taggingRecords[_taggingRecordId].tagIds);

            // No fee charged for removing tags at the present time, but still nice to give
            // clients a way to know how many tags will be removed.
            return (0, _tagIds.length);
        }

        return (_computeTaggingFee(_tagIds.length), _tagIds.length);
    }

    /// @inheritdoc IETS
    function getTaggingRecordFromRawInput(
        TaggingRecordRawInput memory _rawInput,
        address _relayer,
        address _tagger
    )
        public
        view
        returns (uint256[] memory tagIds, uint256 targetId, string memory recordType, address relayer, address tagger)
    {
        return
            this.getTaggingRecordFromId(
                computeTaggingRecordIdFromCompositeKey(
                    etsTarget.computeTargetId(_rawInput.targetURI),
                    _rawInput.recordType,
                    _relayer,
                    _tagger
                )
            );
    }

    /// @inheritdoc IETS
    function getTaggingRecordFromCompositeKey(
        uint256 _targetId,
        string memory _recordType,
        address _relayer,
        address _tagger
    )
        public
        view
        returns (uint256[] memory tagIds, uint256 targetId, string memory recordType, address relayer, address tagger)
    {
        return
            this.getTaggingRecordFromId(
                computeTaggingRecordIdFromCompositeKey(_targetId, _recordType, _relayer, _tagger)
            );
    }

    /// @inheritdoc IETS
    function getTaggingRecordFromId(
        uint256 _id
    )
        public
        view
        returns (uint256[] memory tagIds, uint256 targetId, string memory recordType, address relayer, address tagger)
    {
        TaggingRecord storage taggingRecord = taggingRecords[_id];
        return (
            taggingRecord.tagIds,
            taggingRecord.targetId,
            taggingRecord.recordType,
            taggingRecord.relayer,
            taggingRecord.tagger
        );
    }

    /// @inheritdoc IETS
    function taggingRecordExistsByRawInput(
        TaggingRecordRawInput memory _rawInput,
        address _relayer,
        address _tagger
    ) public view returns (bool) {
        return
            taggingRecordExists(
                computeTaggingRecordIdFromCompositeKey(
                    etsTarget.computeTargetId(_rawInput.targetURI),
                    _rawInput.recordType,
                    _relayer,
                    _tagger
                )
            );
    }

    /// @inheritdoc IETS
    function taggingRecordExistsByCompositeKey(
        uint256 _targetId,
        string memory _recordType,
        address _relayer,
        address _tagger
    ) public view returns (bool) {
        return taggingRecordExists(computeTaggingRecordIdFromCompositeKey(_targetId, _recordType, _relayer, _tagger));
    }

    /// @inheritdoc IETS
    function taggingRecordExists(uint256 _taggingRecordId) public view returns (bool) {
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
        string calldata _recordType,
        address _relayer,
        address _tagger
    ) private {
        uint256 taggingRecordId = computeTaggingRecordIdFromCompositeKey(_targetId, _recordType, _relayer, _tagger);
        taggingRecords[taggingRecordId] = TaggingRecord({
            tagIds: _tagIds,
            targetId: _targetId,
            recordType: _recordType,
            relayer: _relayer,
            tagger: _tagger
        });

        emit TaggingRecordCreated(taggingRecordId);
    }

    /**
     * @dev Append tags to a tagging record
     */
    function _appendTags(uint256 _taggingRecordId, uint256[] memory _tagIds) private {
        // Merge _newTagIds with existing tags.
        taggingRecords[_taggingRecordId].tagIds = UintArrayUtils.extend(
            taggingRecords[_taggingRecordId].tagIds,
            _tagIds
        );
        emit TaggingRecordUpdated(_taggingRecordId, TaggingAction.APPEND);
    }

    /**
     * @dev Remove tags from tagging record.
     *
     * @param _taggingRecordId tagging record being updated.
     * @param _tagIds tagId to remove from tagging record.
     */
    function _removeTags(
        uint256 _taggingRecordId,
        uint256[] memory _tagIds
    ) private onlyOriginalRelayerOrTagger(_taggingRecordId) {
        taggingRecords[_taggingRecordId].tagIds = UintArrayUtils.difference(
            taggingRecords[_taggingRecordId].tagIds,
            _tagIds
        );
        emit TaggingRecordUpdated(_taggingRecordId, TaggingAction.REMOVE);
    }

    function _computeTaggingFee(uint256 _tagCount) internal view returns (uint256 _fee) {
        uint256 fee = 0;
        if (_tagCount > 0 && taggingFee > 0) {
            fee = _tagCount * taggingFee;
        }
        return (fee);
    }

    function _processTaggingFees(uint256[] memory _tagIds) private {
        require((msg.value == _computeTaggingFee(_tagIds.length)), "wrong fee supplied");
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

        uint256 platformAllocation = (msg.value * platformPercentage) / MODULO;
        uint256 relayerAllocation = (msg.value * relayerPercentage) / MODULO;
        uint256 remainingAllocation = msg.value - (platformAllocation + relayerAllocation);

        accrued[_platform] = accrued[_platform] + platformAllocation;
        accrued[tag.relayer] = accrued[tag.relayer] + relayerAllocation;

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
