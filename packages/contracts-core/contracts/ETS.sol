// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// import "./ETSToken.sol";
import "./interfaces/IETS.sol";
import "./interfaces/IETSToken.sol";
import "./interfaces/IETSTarget.sol";
import "./interfaces/IETSEnrichTarget.sol";
import "./interfaces/IETSAccessControls.sol";
import "@openzeppelin/contracts-upgradeable/utils/ContextUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";

import "hardhat/console.sol";

/// @title ETS Core Tagging Contract
/// @author Ethereum Tag Service <security@ets.xyz>
/// @notice Core tagging contract that enables any online target to be tagged with an ETSTAG token.
contract ETS is IETS, Initializable, ContextUpgradeable, ReentrancyGuardUpgradeable, UUPSUpgradeable {
    // Public variables

    /// @dev ETS access controls contract.
    IETSAccessControls public etsAccessControls;

    /// @dev CTAG erc-721 token contract.
    IETSToken public etsToken;

    /// @dev ETS Targets contract.
    IETSTarget public etsTarget;

    /// @dev Enrich target contract.
    IETSEnrichTarget public etsEnrichTarget;

    /// @dev Percentage of tagging fee allocated to ETS.
    uint256 public platformPercentage;

    /// @dev Percentage of tagging fee allocated to Publisher.
    uint256 public publisherPercentage;

    /// @dev Percentage of tagging fee allocated to Creator or Owner.
    uint256 public remainingPercentage;

    /// @dev Fee in ETH Collected by ETS for tagging.
    uint256 public override taggingFee;

    /// @dev Map for holding amount accrued to participant address wallets.
    mapping(address => uint256) public accrued;

    /// @dev Map for holding lifetime amount drawn down from accrued by participants.
    mapping(address => uint256) public paid;

    /// @dev Map of tagging id to tagging record.
    mapping(uint256 => TaggingRecord) public taggingRecords;

    /// Public constants

    string public constant NAME = "ETS Core";
    string public constant VERSION = "0.0.1";
    uint256 public constant modulo = 100;

    /// Modifiers

    /// @dev When applied to a method, only allows execution when the sender has the admin role.
    modifier onlyAdmin() {
        require(etsAccessControls.isAdmin(_msgSender()), "Caller must be admin");
        _;
    }

    // ============ UUPS INTERFACE ============

    function initialize(
        IETSAccessControls _etsAccessControls,
        IETSToken _etsToken,
        IETSTarget _etsTarget
    ) public initializer {
        etsAccessControls = _etsAccessControls;
        etsToken = _etsToken;
        etsTarget = _etsTarget;
        taggingFee = 0.001 ether;
        platformPercentage = 20;
        publisherPercentage = 30;
        remainingPercentage = 50;
    }

    // Ensure that only address with admin role can upgrade.
    function _authorizeUpgrade(address) internal override onlyAdmin {}

    // ============ OWNER INTERFACE ============

    /// @notice Sets the fee required to tag an NFT asset.
    /// @param _fee Value of the fee in WEI.
    function setTaggingFee(uint256 _fee) public onlyAdmin {
        uint256 previousFee = taggingFee;
        taggingFee = _fee;
        emit TaggingFeeSet(previousFee, taggingFee);
    }

    /// @notice Admin functionality for updating the access controls.
    /// @param _accessControls Address of the access controls contract.
    function setAccessControls(IETSAccessControls _accessControls) public onlyAdmin {
        require(address(_accessControls) != address(0), "ETS.updateAccessControls: Cannot be zero");
        IETSAccessControls prevAccessControls = etsAccessControls;
        etsAccessControls = _accessControls;
        emit AccessControlsSet(address(prevAccessControls), address(etsAccessControls));
    }

    /// @notice Admin functionality for updating the IETSEnrichTarget contract address.
    /// @param _etsEnrichTarget Address of the IETSEnrichTarget contract.
    function setETSEnrichTarget(IETSEnrichTarget _etsEnrichTarget) public onlyAdmin {
        require(address(_etsEnrichTarget) != address(0), "Address cannot be zero");
        IETSEnrichTarget previousEtsEnrichTarget = etsEnrichTarget;
        etsEnrichTarget = _etsEnrichTarget;
        emit ETSEnsureSet(address(previousEtsEnrichTarget), address(etsEnrichTarget));
    }

    /// @notice Admin functionality for updating the percentages.
    /// @param _platformPercentage percentage for platform.
    /// @param _publisherPercentage percentage for publisher.
    function setPercentages(uint256 _platformPercentage, uint256 _publisherPercentage) public onlyAdmin {
        require(
            _platformPercentage + _publisherPercentage <= 100,
            "ETS.updatePercentages: percentages must not be over 100"
        );
        platformPercentage = _platformPercentage;
        publisherPercentage = _publisherPercentage;
        remainingPercentage = modulo - platformPercentage - publisherPercentage;

        emit PercentagesSet(platformPercentage, publisherPercentage, remainingPercentage);
    }

    // ============ PUBLIC INTERFACE ============

    function tagTarget(
        uint256[] calldata _tagIds,
        uint256 _targetId,
        address payable _publisher,
        address _tagger,
        bool _enrich
    ) public payable nonReentrant {
        require(etsTarget.isTargetTaggerAndNotPaused(_msgSender()), "Only authorized contracts may call ETS core");
        require(etsAccessControls.isPublisher(_publisher), "Publisher not activated");
        require(_tagIds.length > 0, "No tags supplied");
        require(msg.value == (taggingFee * _tagIds.length), "Insufficient tagging fee supplied");

        for (uint256 i; i < _tagIds.length; ++i) {
            _processAccrued(_tagIds[i], _publisher);
        }

        if (_enrich) {
            etsEnrichTarget.requestEnrichTarget(_targetId);
        }

        _tagTarget(_tagIds, _targetId, _publisher, _tagger);
    }

    /// @notice Allow a tagger to update the tags for a tagging record.
    function updateTaggingRecord(uint256 _taggingRecordId, string[] calldata _tags) external payable {
        // todo - I think this makes sense but should
        // user be allowed to completely remove all tags,
        // does that mean deleting the record completely?
        //require(_tags.length > 0, "Empty array");
        require(taggingRecords[_taggingRecordId].tagIds.length > 0, "Tagging record not found");

        TaggingRecord storage taggingRecord = taggingRecords[_taggingRecordId];

        address sender = _msgSender();

        uint256 currentNumberOfTags = taggingRecords[_taggingRecordId].tagIds.length;
        if (_tags.length > currentNumberOfTags) {
            uint256 numberOfAdditionalTags = _tags.length - currentNumberOfTags;
            require(msg.value == numberOfAdditionalTags * taggingFee, "Additional tags require fees");
        }

        require(sender == taggingRecord.tagger, "Only original tagger can update");

        unchecked {
            uint256 tagCount = _tags.length;
            uint256[] memory tagIds = new uint256[](tagCount);
            for (uint256 i; i < tagCount; ++i) {
                uint256 tagId = etsToken.getOrCreateTagId(_tags[i], payable(taggingRecord.publisher));

                tagIds[i] = tagId;
            }

            taggingRecords[_taggingRecordId].tagIds = tagIds;
        }

        // Log that a tagging record has been updated.
        emit TaggingRecordUpdated(_taggingRecordId);
    }

    /// @notice Enables anyone to send ETH accrued by an account.
    /// @dev Can be called by the account owner or on behalf of someone.
    /// @dev Does nothing when there is nothing due to the account.
    /// @param _account Target address that has had accrued ETH and which will receive the ETH.
    function drawDown(address payable _account) external nonReentrant {
        uint256 balanceDue = accrued[_account] - paid[_account];
        if (balanceDue > 0 && balanceDue <= address(this).balance) {
            paid[_account] = paid[_account] + balanceDue;
            _account.transfer(balanceDue);

            emit FundsWithdrawn(_account, balanceDue);
        }
    }

    // ============ PUBLIC VIEW FUNCTIONS ============

    /// @notice Deterministically compute the tagging record identifier
    function computeTaggingRecordId(
        uint256 _targetId,
        address _publisher,
        address _tagger
    ) public pure returns (uint256 taggingRecordId) {
        taggingRecordId = uint256(keccak256(abi.encodePacked(_targetId, _tagger, _publisher)));
    }

    /// @notice Used to check how much ETH has been accrued by an address factoring in amount paid out.
    /// @param _account Address of the account being queried.
    /// @return _due Amount of WEI in ETH due to account.
    function totalDue(address _account) external view returns (uint256 _due) {
        return accrued[_account] - paid[_account];
    }

    /// @dev Retrieves a tagging record from tagging record ID
    /// @param _id ID of the tagging record.
    /// @return etsTagIds token ID of ETSTAG used.
    /// @return targetId Id of tagging target.
    /// @return tagger Address that tagged the NFT asset.
    /// @return publisher Publisher through which the tag took place.
    function getTaggingRecordFromId(uint256 _id)
        external
        view
        returns (
            uint256[] memory etsTagIds,
            uint256 targetId,
            address tagger,
            address publisher
        )
    {
        TaggingRecord storage taggingRecord = taggingRecords[_id];
        return (taggingRecord.tagIds, taggingRecord.targetId, taggingRecord.tagger, taggingRecord.publisher);
    }

    /// @notice Get tagging record from composite key parts
    function getTaggingRecord(
        uint256 _targetId,
        address _tagger,
        address _publisher
    )
        external
        view
        returns (
            uint256[] memory etsTagIds,
            uint256 targetId,
            address tagger,
            address publisher
        )
    {
        uint256 taggingRecordId = computeTaggingRecordId(_targetId, _tagger, _publisher);

        TaggingRecord storage taggingRecord = taggingRecords[taggingRecordId];

        return (taggingRecord.tagIds, taggingRecord.targetId, taggingRecord.tagger, taggingRecord.publisher);
    }

    function version() external pure returns (string memory) {
        return VERSION;
    }

    // ============ INTERNAL FUNCTIONS ============

    function _tagTarget(
        uint256[] memory _tagIds,
        uint256 _targetId,
        address _publisher,
        address _tagger
    ) private {
        // Generate a new tagging record
        // with a deterministic ID
        uint256 taggingRecordId = computeTaggingRecordId(_targetId, _tagger, _publisher);

        taggingRecords[taggingRecordId] = TaggingRecord({
            tagIds: _tagIds,
            targetId: _targetId,
            tagger: _tagger,
            publisher: _publisher
        });

        // Log that a target has been tagged.
        emit TargetTagged(taggingRecordId);
    }

    function _processAccrued(uint256 _tagId, address _publisher) internal {
        address owner = etsToken.ownerOf(_tagId);
        address platform = etsAccessControls.getPlatformAddress();

        // pre-auction.
        if (owner == platform) {
            accrued[platform] = accrued[platform] + ((msg.value * platformPercentage) / modulo);
            accrued[_publisher] = accrued[_publisher] + ((msg.value * publisherPercentage) / modulo);

            address creator = etsToken.getCreatorAddress(_tagId);
            accrued[creator] = accrued[creator] + ((msg.value * remainingPercentage) / modulo);
        }
        // post-auction.
        else {
            accrued[platform] = accrued[platform] + ((msg.value * platformPercentage) / modulo);
            accrued[_publisher] = accrued[_publisher] + ((msg.value * publisherPercentage) / modulo);
            accrued[owner] = accrued[owner] + ((msg.value * remainingPercentage) / modulo);
        }
    }
}
