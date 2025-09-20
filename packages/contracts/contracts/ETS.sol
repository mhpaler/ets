// SPDX-License-Identifier: MIT

/**
 * @title ETS
 * @author Ethereum Tag Service <team@ets.xyz>
 *
 *  ███████╗████████╗███████╗
 *  ██╔════╝╚══██╔══╝██╔════╝
 *  █████╗     ██║   ███████╗
 *  ██╔══╝     ██║   ╚════██║
 *  ███████╗   ██║   ███████║
 *  ╚══════╝   ╚═╝   ╚══════╝
 *
 * @notice This is the core ETS tagging contract that records TaggingRecords to the blockchain.
 * It also contains some governance functions around tagging fees as well as means for market
 * participants to access accrued funds.
 */

pragma solidity ^0.8.10;


import { IETS } from "./interfaces/IETS.sol";
import { IETSToken } from "./interfaces/IETSToken.sol";
import { IETSTarget } from "./interfaces/IETSTarget.sol";
import { IETSAccessControls } from "./interfaces/IETSAccessControls.sol";
import { UintArrayUtils } from "./libraries/UintArrayUtils.sol";
import { AddressArrayUtils } from "./libraries/AddressArrayUtils.sol";
import { ContextUpgradeable } from "@openzeppelin/contracts-upgradeable/utils/ContextUpgradeable.sol";
import { Initializable } from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import { UUPSUpgradeable } from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import { ReentrancyGuardUpgradeable } from "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";

contract ETS is IETS, Initializable, ContextUpgradeable, ReentrancyGuardUpgradeable, UUPSUpgradeable {
    using UintArrayUtils for uint256[];
    using AddressArrayUtils for address[];

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

    /// @dev Percentage of tagging fee allocated to Channel.
    uint256 public channelPercentage;

    /// @dev Map for holding amount accrued to participant address wallets.
    mapping(address => uint256) public accrued;

    /// @dev Map for holding lifetime amount drawn down from accrued by participants.
    mapping(address => uint256) public paid;

    /// @dev Map of tagging id to tagging record.
    mapping(uint256 => TaggingRecord) public taggingRecords;

    /// Public constants

    string public constant NAME = "ETS Core";
    string public constant VERSION = "0.0.1";
    uint256 public constant MODULO = 100;

    /// Modifiers

    /// @dev When applied to a method, only allows execution when the sender has the admin role.
    modifier onlyAdmin() {
        if (!etsAccessControls.isAdmin(_msgSender())) revert CallerNotAdministrator(_msgSender());
        _;
    }

    modifier onlyChannel() {
        if (!etsAccessControls.isChannel(_msgSender())) revert CallerNotChannel(_msgSender());
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
        uint256 _channelPercentage
    ) public initializer {
        __ReentrancyGuard_init();
        etsAccessControls = _etsAccessControls;
        etsToken = _etsToken;
        etsTarget = _etsTarget;
        setTaggingFee(_taggingFee);
        setPercentages(_platformPercentage, _channelPercentage);
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
        if (address(_accessControls) == address(0)) revert AddressCannotBeZero();
        if (!_accessControls.isAdmin(_msgSender())) revert CallerNotAdminInNewContract(_msgSender());
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
    /// @param _channelPercentage percentage for channel.
    function setPercentages(uint256 _platformPercentage, uint256 _channelPercentage) public onlyAdmin {
        if (_platformPercentage + _channelPercentage > 100) revert PercentagesMustNotBeOver100(_platformPercentage, _channelPercentage);
        platformPercentage = _platformPercentage;
        channelPercentage = _channelPercentage;

        emit PercentagesSet(platformPercentage, channelPercentage);
    }

    // ============ PUBLIC INTERFACE ============

    /// @inheritdoc IETS
    function createTaggingRecord(
        address[] memory _coinAddresses,
        uint256 _targetId,
        string calldata _recordType,
        address _tagger
    ) public payable nonReentrant onlyChannel {
        uint256 tagCount = _coinAddresses.length;
        if (tagCount == 0) revert NoTagsSupplied();
        for (uint256 i; i < tagCount; ++i) {
            if (!etsToken.tagExistsByAddress(_coinAddresses[i])) revert InvalidCoinAddress(_coinAddresses[i]);
        }
        if (bytes(_recordType).length < 3 || bytes(_recordType).length >= 31) revert RecordTypeTooLong(bytes(_recordType).length);
        if (!etsTarget.targetExistsById(_targetId)) revert InvalidTargetId(_targetId);
        _processTaggingFees(_coinAddresses);
        _createTaggingRecord(_coinAddresses, _targetId, _recordType, _msgSender(), _tagger);
    }

    /// @inheritdoc IETS
    function getOrCreateTagId(
        string calldata _tag,
        address payable _creator
    ) public payable onlyChannel returns (address coinAddress) {
        return etsToken.getOrCreateTagId(_tag, payable(_msgSender()), _creator);
    }

    /// @inheritdoc IETS
    function createTag(
        string calldata _tag,
        address payable _creator
    ) public payable nonReentrant onlyChannel returns (address coinAddress) {
        return etsToken.createTag(_tag, payable(_msgSender()), _creator);
    }

    /// @inheritdoc IETS
    function applyTagsWithRawInput(
        TaggingRecordRawInput calldata _rawInput,
        address payable _tagger,
        address _channel
    ) public payable onlyChannel {
        
        // Derive coin addresses for the tagStrings.
        uint256 tagCount = _rawInput.tagStrings.length;
        if (tagCount == 0) revert NoTagsSupplied();

        address[] memory coinAddresses = new address[](tagCount);
        for (uint256 i; i < tagCount; ++i) {
            coinAddresses[i] = getOrCreateTagId(_rawInput.tagStrings[i], _tagger);
        }

        uint256 taggingRecordId = computeTaggingRecordIdFromRawInput(_rawInput, _channel, _tagger);

        if (taggingRecordExists(taggingRecordId)) {
            appendTags(taggingRecordId, coinAddresses, _tagger);
        } else {
            // Derive targetId from targetURI. Will revert if targetURI is empty.
            uint256 targetId = etsTarget.getOrCreateTargetId(_rawInput.targetURI);
            // Require new tagging records be inserted by calling channel.
            createTaggingRecord(coinAddresses, targetId, _rawInput.recordType, _tagger);
        }
    }

    /// @inheritdoc IETS
    function applyTagsWithCompositeKey(
        address[] memory _coinAddresses,
        uint256 _targetId,
        string calldata _recordType,
        address payable _tagger,
        address _channel
    ) public payable onlyChannel {
        uint256 tagCount = _coinAddresses.length;
        if (tagCount == 0) revert NoTagsSupplied();

        uint256 taggingRecordId = computeTaggingRecordIdFromCompositeKey(_targetId, _recordType, _channel, _tagger);
        if (taggingRecordExists(taggingRecordId)) {
            appendTags(taggingRecordId, _coinAddresses, _tagger);
        } else {
            createTaggingRecord(_coinAddresses, _targetId, _recordType, _tagger);
        }
    }

    /// @inheritdoc IETS
    function replaceTagsWithRawInput(
        TaggingRecordRawInput calldata _rawInput,
        address payable _tagger,
        address _channel
    ) public payable onlyChannel {
        uint256 tagCount = _rawInput.tagStrings.length;
        if (tagCount == 0) revert NoTagsSupplied();

        address[] memory coinAddresses = new address[](tagCount);
        for (uint256 i; i < tagCount; ++i) {
            // New tags are created via calling channel.
            coinAddresses[i] = getOrCreateTagId(_rawInput.tagStrings[i], _tagger);
        }

        replaceTags(computeTaggingRecordIdFromRawInput(_rawInput, _channel, _tagger), coinAddresses, _tagger);
    }

    /// @inheritdoc IETS
    function replaceTagsWithCompositeKey(
        address[] calldata _coinAddresses,
        uint256 _targetId,
        string memory _recordType,
        address payable _tagger,
        address _channel
    ) public payable onlyChannel {
        replaceTags(
            computeTaggingRecordIdFromCompositeKey(_targetId, _recordType, _channel, _tagger),
            _coinAddresses,
            _tagger
        );
    }

    /// @inheritdoc IETS
    function removeTagsWithRawInput(
        TaggingRecordRawInput calldata _rawInput,
        address _tagger,
        address _channel
    ) public onlyChannel {
        uint256 rawTagCount = _rawInput.tagStrings.length;
        address[] memory coinAddresses = new address[](rawTagCount);
        for (uint256 i; i < rawTagCount; ++i) {
            coinAddresses[i] = etsToken.computeCoinAddress(_rawInput.tagStrings[i]);
        }
        removeTags(computeTaggingRecordIdFromRawInput(_rawInput, _channel, _tagger), coinAddresses, _tagger);
    }

    /// @inheritdoc IETS
    function removeTagsWithCompositeKey(
        address[] calldata _coinAddresses,
        uint256 _targetId,
        string memory _recordType,
        address payable _tagger,
        address _channel
    ) public onlyChannel {
        removeTags(computeTaggingRecordIdFromCompositeKey(_targetId, _recordType, _channel, _tagger), _coinAddresses, _tagger);
    }

    /// @inheritdoc IETS
    function appendTags(
        uint256 _taggingRecordId,
        address[] memory _coinAddresses,
        address _tagger
    ) public payable nonReentrant onlyChannel {
        if (_coinAddresses.length == 0) revert NoTagsSupplied();
        if (taggingRecords[_taggingRecordId].tagger != _tagger) revert NotAuthorized(_tagger, taggingRecords[_taggingRecordId].tagger);

        // Filter out new tags from the supplied tags.
        _coinAddresses = AddressArrayUtils.difference(_coinAddresses, taggingRecords[_taggingRecordId].coinAddresses);

        if (_coinAddresses.length > 0) {
            _processTaggingFees(_coinAddresses);
            _appendTags(_taggingRecordId, _coinAddresses);
        }
    }

    /// @inheritdoc IETS
    function replaceTags(
        uint256 _taggingRecordId,
        address[] memory _coinAddresses,
        address _tagger
    ) public payable nonReentrant onlyChannel {
        if (_coinAddresses.length == 0) revert NoTagsSupplied();
        if (taggingRecords[_taggingRecordId].tagger != _tagger) revert NotAuthorized(_tagger, taggingRecords[_taggingRecordId].tagger);

        // Find all the tags NOT SHARED by the tagging record and the replacement set.
        address[] memory notShared = AddressArrayUtils.difference(taggingRecords[_taggingRecordId].coinAddresses, _coinAddresses);

        // Remove these from the tagging record.
        if (notShared.length > 0) {
            _removeTags(_taggingRecordId, notShared);
        }

        // Filter out new tags from the replacement set
        _coinAddresses = AddressArrayUtils.difference(_coinAddresses, taggingRecords[_taggingRecordId].coinAddresses);

        if (_coinAddresses.length > 0) {
            _processTaggingFees(_coinAddresses);
            _appendTags(_taggingRecordId, _coinAddresses);
        }
    }

    /// @inheritdoc IETS
    function removeTags(
        uint256 _taggingRecordId,
        address[] memory _coinAddresses,
        address _tagger
    ) public nonReentrant onlyChannel {
        if (_coinAddresses.length == 0) revert NoTagsSupplied();
        if (taggingRecords[_taggingRecordId].tagger != _tagger) revert NotAuthorized(_tagger, taggingRecords[_taggingRecordId].tagger);

        // Find tags shared by supplied tags and tagging record tags.
        _coinAddresses = AddressArrayUtils.intersect(_coinAddresses, taggingRecords[_taggingRecordId].coinAddresses);

        if (_coinAddresses.length > 0) {
            // No tagging fee when tags are removed.
            _removeTags(_taggingRecordId, _coinAddresses);
        }
    }

    /// @inheritdoc IETS
    function drawDown(address payable _account) external nonReentrant {
        uint256 balanceDue = totalDue(_account);
        if (balanceDue > 0 && balanceDue <= address(this).balance) {
            paid[_account] = paid[_account] + balanceDue;

            (bool success, ) = _account.call{ value: balanceDue }("");
            if (!success) revert TransferFailed();

            emit FundsWithdrawn(_account, balanceDue);
        }
    }

    // ============ PUBLIC VIEW FUNCTIONS ============

    /// @inheritdoc IETS
    function computeTaggingRecordIdFromRawInput(
        TaggingRecordRawInput memory _rawInput,
        address _channel,
        address _tagger
    ) public view returns (uint256 taggingRecordId) {
        return
            computeTaggingRecordIdFromCompositeKey(
                etsTarget.computeTargetId(_rawInput.targetURI),
                _rawInput.recordType,
                _channel,
                _tagger
            );
    }

    /// @inheritdoc IETS
    function computeTaggingRecordIdFromCompositeKey(
        uint256 _targetId,
        string memory _recordType,
        address _channel,
        address _tagger
    ) public pure returns (uint256 taggingRecordId) {
        taggingRecordId = uint256(keccak256(abi.encodePacked(_targetId, _recordType, _channel, _tagger)));
    }

    /// @inheritdoc IETS
    function computeTaggingFeeFromRawInput(
        TaggingRecordRawInput calldata _rawInput,
        address _channel,
        address _tagger,
        TaggingAction _action
    ) public view returns (uint256 fee, uint256 tagCount) {
        uint256 rawTagCount = _rawInput.tagStrings.length;
        address[] memory coinAddresses = new address[](rawTagCount);
        for (uint256 i; i < rawTagCount; ++i) {
            coinAddresses[i] = etsToken.computeCoinAddress(_rawInput.tagStrings[i]);
        }
        return computeTaggingFee(computeTaggingRecordIdFromRawInput(_rawInput, _channel, _tagger), coinAddresses, _action);
    }

    /// @inheritdoc IETS
    function computeTaggingFeeFromCompositeKey(
        address[] memory _coinAddresses,
        uint256 _targetId,
        string calldata _recordType,
        address _channel,
        address _tagger,
        TaggingAction _action
    ) public view returns (uint256 fee, uint256 tagCount) {
        return
            computeTaggingFee(
                computeTaggingRecordIdFromCompositeKey(_targetId, _recordType, _channel, _tagger),
                _coinAddresses,
                _action
            );
    }

    /// @inheritdoc IETS
    function computeTaggingFee(
        uint256 _taggingRecordId,
        address[] memory _coinAddresses,
        TaggingAction _action
    ) public view returns (uint256 fee, uint256 tagCount) {
        // Return quickly when no tagging record exists.
        if (!taggingRecordExists(_taggingRecordId)) {
            return (_computeTaggingFee(_coinAddresses.length), _coinAddresses.length);
        }

        if (TaggingAction(_action) == TaggingAction.APPEND) {
            // remove tagging record coin addresses from input coin addresses to return number of new tags applied.
            _coinAddresses = AddressArrayUtils.difference(_coinAddresses, taggingRecords[_taggingRecordId].coinAddresses);
        }

        if (TaggingAction(_action) == TaggingAction.REPLACE) {
            // Remove tags from tagging record not in replacement tag set.
            address[] memory taggingRecordTags = taggingRecords[_taggingRecordId].coinAddresses;
            address[] memory tagsToRemove = AddressArrayUtils.difference(taggingRecords[_taggingRecordId].coinAddresses, _coinAddresses);
            if (tagsToRemove.length > 0) {
                taggingRecordTags = AddressArrayUtils.difference(taggingRecords[_taggingRecordId].coinAddresses, tagsToRemove);
            }

            _coinAddresses = AddressArrayUtils.difference(_coinAddresses, taggingRecordTags);
        }

        if (TaggingAction(_action) == TaggingAction.REMOVE) {
            // Find tags shared by supplied tags and tagging record tags.
            _coinAddresses = AddressArrayUtils.intersect(_coinAddresses, taggingRecords[_taggingRecordId].coinAddresses);

            // No fee charged for removing tags at the present time, but still nice to give
            // clients a way to know how many tags will be removed.
            return (0, _coinAddresses.length);
        }

        return (_computeTaggingFee(_coinAddresses.length), _coinAddresses.length);
    }

    /// @inheritdoc IETS
    function getTaggingRecordFromRawInput(
        TaggingRecordRawInput memory _rawInput,
        address _channel,
        address _tagger
    )
        public
        view
        returns (address[] memory coinAddresses, uint256 targetId, string memory recordType, address channel, address tagger)
    {
        return
            this.getTaggingRecordFromId(
                computeTaggingRecordIdFromCompositeKey(
                    etsTarget.computeTargetId(_rawInput.targetURI),
                    _rawInput.recordType,
                    _channel,
                    _tagger
                )
            );
    }

    /// @inheritdoc IETS
    function getTaggingRecordFromCompositeKey(
        uint256 _targetId,
        string memory _recordType,
        address _channel,
        address _tagger
    )
        public
        view
        returns (address[] memory coinAddresses, uint256 targetId, string memory recordType, address channel, address tagger)
    {
        return
            this.getTaggingRecordFromId(
                computeTaggingRecordIdFromCompositeKey(_targetId, _recordType, _channel, _tagger)
            );
    }

    /// @inheritdoc IETS
    function getTaggingRecordFromId(
        uint256 _id
    )
        public
        view
        returns (address[] memory coinAddresses, uint256 targetId, string memory recordType, address channel, address tagger)
    {
        TaggingRecord storage taggingRecord = taggingRecords[_id];
        return (
            taggingRecord.coinAddresses,
            taggingRecord.targetId,
            taggingRecord.recordType,
            taggingRecord.channel,
            taggingRecord.tagger
        );
    }

    /// @inheritdoc IETS
    function taggingRecordExistsByRawInput(
        TaggingRecordRawInput memory _rawInput,
        address _channel,
        address _tagger
    ) public view returns (bool) {
        return
            taggingRecordExists(
                computeTaggingRecordIdFromCompositeKey(
                    etsTarget.computeTargetId(_rawInput.targetURI),
                    _rawInput.recordType,
                    _channel,
                    _tagger
                )
            );
    }

    /// @inheritdoc IETS
    function taggingRecordExistsByCompositeKey(
        uint256 _targetId,
        string memory _recordType,
        address _channel,
        address _tagger
    ) public view returns (bool) {
        return taggingRecordExists(computeTaggingRecordIdFromCompositeKey(_targetId, _recordType, _channel, _tagger));
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
        address[] memory _coinAddresses,
        uint256 _targetId,
        string calldata _recordType,
        address _channel,
        address _tagger
    ) private {
        uint256 taggingRecordId = computeTaggingRecordIdFromCompositeKey(_targetId, _recordType, _channel, _tagger);
        taggingRecords[taggingRecordId] = TaggingRecord({
            coinAddresses: _coinAddresses,
            targetId: _targetId,
            recordType: _recordType,
            channel: _channel,
            tagger: _tagger
        });

        emit TaggingRecordCreated(taggingRecordId);
    }

    /**
     * @dev Append tags to a tagging record
     */
    function _appendTags(uint256 _taggingRecordId, address[] memory _coinAddresses) private {
        // Merge _coinAddresses with existing tags.
        taggingRecords[_taggingRecordId].coinAddresses = AddressArrayUtils.extend(
            taggingRecords[_taggingRecordId].coinAddresses,
            _coinAddresses
        );
        emit TaggingRecordUpdated(_taggingRecordId, TaggingAction.APPEND);
    }

    /**
     * @dev Remove tags from tagging record.
     *
     * @param _taggingRecordId tagging record being updated.
     * @param _coinAddresses coin addresses to remove from tagging record.
     */
    function _removeTags(uint256 _taggingRecordId, address[] memory _coinAddresses) private {
        taggingRecords[_taggingRecordId].coinAddresses = AddressArrayUtils.difference(
            taggingRecords[_taggingRecordId].coinAddresses,
            _coinAddresses
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

    function _processTaggingFees(address[] memory _coinAddresses) private {
        uint256 requiredFee = _computeTaggingFee(_coinAddresses.length);
        if (msg.value != requiredFee) revert WrongFeeSupplied(msg.value, requiredFee);
        address platform = etsAccessControls.getPlatformAddress();
        for (uint256 i; i < _coinAddresses.length; ++i) {
            _processAccrued(_coinAddresses[i], platform);
        }
    }

    // @dev Internal function to divide up the tagging fee and accrue it to ETS participants.
    function _processAccrued(address _coinAddress, address _platform) private {
        // Note: This will cause _processTaggingFees to revert if coinAddress doesn't exist.
        IETSToken.Tag memory tag = etsToken.getTagByAddress(_coinAddress);

        uint256 platformAllocation = (msg.value * platformPercentage) / MODULO;
        uint256 channelAllocation = (msg.value * channelPercentage) / MODULO;
        uint256 remainingAllocation = msg.value - (platformAllocation + channelAllocation);

        accrued[_platform] = accrued[_platform] + platformAllocation;
        accrued[tag.channel] = accrued[tag.channel] + channelAllocation;

        // In Zora ERC-20 model, creator always gets remaining allocation (no ownership concept)
        accrued[tag.creator] = accrued[tag.creator] + remainingAllocation;
    }
}
