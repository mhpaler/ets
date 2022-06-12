// SPDX-License-Identifier: MIT

pragma solidity 0.8.12;

import "@openzeppelin/contracts-upgradeable/utils/ContextUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

import "./ETSTag.sol";
import "../interfaces/IETS.sol";
import "./ETSEnsure.sol";

import "hardhat/console.sol";

/// @title ETS Core
/// @author Ethereum Tag Service <security@ets.xyz>
/// @notice Core tagging contract that enables any online target to be tagged with an ETSTAG token.
/// @dev ETS Core utilizes Open Zeppelin UUPS upgradability pattern.
contract ETS is IETS, Initializable, ContextUpgradeable, ReentrancyGuardUpgradeable, UUPSUpgradeable {

    /// Storage

    /// @dev ETS access controls contract.
    ETSAccessControls public accessControls;

    /// @dev ETSTAG erc-721 token contract.
    ETSTag public etsTag;

    /// @dev ETSEnsure target contract.
    ETSEnsure public etsEnsure;

    /// @dev Percentage of tagging fee allocated to ETS.
    uint256 public platformPercentage;

    /// @dev Percentage of tagging fee allocated to Publisher.
    uint256 public publisherPercentage;

    /// @dev Percentage of tagging fee allocated to Creator or Owner.
    uint256 public remainingPercentage;

    /// @dev Incremental tagging record counter. Used for tagging record ID.
    uint256 public taggingCounter;

    /// @dev Fee in ETH Collected by ETS for tagging.
    uint256 public override taggingFee;

    /// @dev Map for holding amount accrued to participant address wallets.
    mapping(address => uint256) public accrued;

    /// @dev Map for holding lifetime amount drawn down from accrued by participants.
    mapping(address => uint256) public paid;

    /// @dev Map of tagging id to tagging record.
    mapping(uint256 => TaggingRecord) public taggingRecords;

    /// @dev Map of target id to Target embodied by Target struct.
    mapping(uint256 => Target) public targets;

    /// Public constants

    string public constant NAME = "ETS Core";
    string public constant VERSION = "0.0.1";
    uint256 public constant modulo = 100;

    /// Modifiers

    /// @dev When applied to a method, only allows execution when the sender has the admin role.
    modifier onlyAdmin() {
        require(accessControls.isAdmin(_msgSender()), "Caller must be admin");
        _;
    }

    /// @dev Replaces contructor function for UUPS Proxy contracts. Called upon first deployment.
    function initialize(ETSAccessControls _accessControls, ETSTag _etsTag) external initializer {
        accessControls = _accessControls;
        etsTag = _etsTag;
        taggingCounter = 0;
        taggingFee = 0.001 ether;
        platformPercentage = 20;
        publisherPercentage = 30;
        remainingPercentage = 50;
    }

    // Ensure that only address with admin role can upgrade.
    function _authorizeUpgrade(address) internal override onlyAdmin {}

    // External write

    /// @notice Tag a target with an tag string.
    /// @param _tags Strings target is being tagged with.
    /// @param _targetURI Uniform resource identifier of the target being tagged.
    /// @param _publisher Address of publisher enabling the tagging record.
    /// @param _tagger Address of tagger being credited performing tagging record.
    /// @param _ensure Boolean flag, set true to ensure the target at time of tagging.
    function tagTarget(
        string[] calldata _tags,
        string calldata _targetURI,
        address payable _publisher,
        address _tagger,
        address _sponsor,
        bool _ensure
    ) external override payable nonReentrant {
        require(accessControls.isTargetTypeAndNotPaused(_msgSender()), "Only authorized addresses may call ETS core");
        require(accessControls.isPublisher(_publisher), "Tag: The publisher must be whitelisted");

        uint256 tagCount = _tags.length;
        require(tagCount > 0, "No tag strings supplied");
        require(msg.value == (taggingFee * tagCount), "Tag: You must send the fee");

        // Get targetId if the target exists, otherwise, create a new one.
        uint256 targetId = _getOrCreateTarget(
            accessControls.targetTypeContractName(_msgSender()), // return "nft"
            _targetURI
        );

        // Get etsTagId if the tag exists, otherwise, mint a new one.
        uint256[] memory etsTagIds = new uint256[](tagCount);
        for (uint256 i; i < tagCount; ++i) {
            uint256 etsTagId = getOrCreateTag(
                _tags[i],
                _publisher,
                _tagger
            );

            _processAccrued(etsTagId, _publisher);

            etsTagIds[i] = etsTagId;
        }

        if (_ensure) {
            etsEnsure.requestEnsureTarget(targetId);
        }

        // TODO: could probably put a conditional in here that
        // only tags target if it's ensured.
        _tagTarget(etsTagIds, targetId, _publisher, _tagger, _sponsor);
    }

    /// @notice Fetch an etstagId from tag string.
    /// @dev Looks in tagToTokenId map and returns if ETSTag is found for tag string
    /// Otherwise mints a new ETSTag and returns id.
    /// @param _tagString tag string for ETSTag we are looking up.
    /// @param _publisher publisher address, to attribute new ETSTag to if one s minted
    /// @param _tagger tagger address, to attribute new ETSTag to if one s minted
    /// @return tagId Id of ETSTag token.
    function getOrCreateTag(
        string calldata _tagString,
        address payable _publisher,
        address _tagger // TODO: look into tagger attribution + publisher attribution
    ) public payable returns (uint256 tagId) {
        uint256 _etstagId = etsTag.computeTagId(_tagString);
        if (!etsTag.tagExists(_etstagId)) {
            _etstagId = etsTag.mint(_tagString, _publisher, _tagger);
        }
        return _etstagId;
    }

    /// @notice Get a target Id from target type and target uri.
    /// TODO: Perhaps rename this with a better name, because it's
    /// also creating a target record if it doesn't exist?
    // Or perthaps breakout another function called create target?
    function _getOrCreateTarget(string memory _targetType, string memory _targetURI) private returns (uint256 targetId) {
        uint256 _targetId = computeTargetId(_targetType, _targetURI);
        if (targets[_targetId].created != 0) {
            return _targetId;
        }
        return _createTarget(_targetType, _targetURI);
    }

    /// TODO: Finish documentation.
    function _createTarget(string memory _targetType, string memory _targetURI) private returns (uint256 targetId) {
        uint256 _targetId = computeTargetId(_targetType, _targetURI);
        targets[_targetId] = Target({
            targetType: _targetType,
            targetURI: _targetURI, // todo: consider ways to encode _targetURI as some sort of fixed length bytes type.
            created: block.timestamp,
            lastEnsured: 0, // if null, target has never been ensured.
            status: 0,
            ipfsHash: ""
        });
        emit TargetCreated(_targetId);
        return _targetId;
    }


    /// @notice Updates a target with new values.
    /// @return success boolean
    function updateTarget(
        uint256 _targetId,
        string calldata _targetType,
        string calldata _targetURI,
        uint _lastEnsured,
        uint _status,
        string calldata _ipfsHash
    ) external returns (bool success) {
        // TODO - check whether anyone else needs access to this method
        require(msg.sender == address(etsEnsure), "Only ETS ensure");

        targets[_targetId].targetType = _targetType;
        targets[_targetId].targetURI = _targetURI;
        targets[_targetId].lastEnsured = _lastEnsured;
        targets[_targetId].status = _status;
        targets[_targetId].ipfsHash = _ipfsHash;

        emit TargetUpdated(_targetId);
        return true;
    }

    /// @notice Enables anyone to send ETH accrued by an account.
    /// @dev Can be called by the account owner or on behalf of someone.
    /// @dev Does nothing when there is nothing due to the account.
    /// @param _account Target address that has had accrued ETH and which will receive the ETH.
    function drawDown(address payable _account) external nonReentrant {
        uint256 balanceDue = accrued[_account]- paid[_account];
        if (balanceDue > 0 && balanceDue <= address(this).balance) {
            paid[_account] = paid[_account] + balanceDue;
            _account.transfer(balanceDue);

            emit FundsWithdrawn(_account, balanceDue);
        }
    }

    /// @notice Sets the fee required to tag an NFT asset.
    /// @param _fee Value of the fee in WEI.
    function updateTaggingFee(uint256 _fee) external onlyAdmin {
        uint previousFee = taggingFee;
        taggingFee = _fee;
        emit TaggingFeeSet(previousFee, taggingFee);
    }

    /// @notice Admin functionality for updating the access controls.
    /// @param _accessControls Address of the access controls contract.
    function updateAccessControls(ETSAccessControls _accessControls) external onlyAdmin {
        require(address(_accessControls) != address(0), "ETS.updateAccessControls: Cannot be zero");
        ETSAccessControls prevAccessControls = accessControls;
        accessControls = _accessControls;
        emit AccessControlsUpdated(address(prevAccessControls), address(accessControls));
    }

    /// @notice Admin functionality for updating the ETSEnsure contract address.
    /// @param _etsEnsure Address of the ETSEnsure contract.
    function updateETSEnsure(ETSEnsure _etsEnsure) external onlyAdmin {
        require(address(_etsEnsure) != address(0), "ETS.updateETSEnsure: Cannot be zero");
        ETSEnsure previousETSEnsure = etsEnsure;
        etsEnsure = _etsEnsure;
        emit ETSEnsureUpdated(address(previousETSEnsure), address(etsEnsure));
    }

    /// @notice Admin functionality for updating the percentages.
    /// @param _platformPercentage percentage for platform.
    /// @param _publisherPercentage percentage for publisher.
    function updatePercentages(uint256 _platformPercentage, uint256 _publisherPercentage) external onlyAdmin {
        require(
            _platformPercentage + _publisherPercentage <= 100,
            "ETS.updatePercentages: percentages must not be over 100"
        );
        platformPercentage = _platformPercentage;
        publisherPercentage = _publisherPercentage;
        remainingPercentage = modulo - platformPercentage - publisherPercentage;

        emit PercentagesSet(platformPercentage, publisherPercentage, remainingPercentage);
    }

    /// External read

    function isTargetEnsured(uint256 _targetId) external view returns (bool) {
        return targets[_targetId].lastEnsured != 0;
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
    /// @return sponsor Address that paid for the transaction fee
    function getTaggingRecordFromId(uint256 _id)
        external
        view
        returns (
          uint256[] memory etsTagIds,
          uint256 targetId,
          address tagger,
          address publisher,
          address sponsor
        )
    {
        TaggingRecord storage taggingRecord = taggingRecords[_id];
        return (
            taggingRecord.etsTagIds,
            taggingRecord.targetId,
            taggingRecord.tagger,
            taggingRecord.publisher,
            taggingRecord.sponsor
        );
    }

    /// @notice Get tagging record from composite key parts
    function getTaggingRecord(
        uint256 _targetId,
        address _tagger,
        address _publisher,
        address _sponsor
    )
        external
        view
        returns (
            uint256[] memory etsTagIds,
            uint256 targetId,
            address tagger,
            address publisher,
            address sponsor
        )
    {
        uint256 taggingRecordId = computeTaggingRecordId(
            _targetId,
            _tagger,
            _publisher,
            _sponsor
        );

        TaggingRecord storage taggingRecord = taggingRecords[taggingRecordId];

        return (
            taggingRecord.etsTagIds,
            taggingRecord.targetId,
            taggingRecord.tagger,
            taggingRecord.publisher,
            taggingRecord.sponsor
        );
    }

    /// @notice check for existence of target.
    /// @param _targetId token ID.
    /// @return true if exists.
    function targetExistsFromId(uint256 _targetId) external view returns (bool) {
        return targets[_targetId].created > 0 ? true : false;
    } // todo - what's the equivalent

    function targetExists(string memory _targetType, string memory _targetURI) external view returns (bool) {
        uint256 targetId = computeTargetId(_targetType, _targetURI);
        return targets[targetId].created > 0 ? true : false;
    }

    function version() external pure returns (string memory) {
        return VERSION;
    }

    /// Internal

    function computeTargetId(string memory _targetType, string memory _targetURI) public pure returns (uint256 targetId) {
        string memory parts = string(abi.encodePacked(_targetType, _targetURI));
        // The following is how ENS creates ID for their domain names.
        bytes32 label = keccak256(bytes(parts));
        return uint256(label);
    }

   function _tagTarget(
        uint256[] memory _etsTagIds,
        uint256 _targetId,
        address _publisher,
        address _tagger,
        address _sponsor
    ) private {
        // Generate a new tagging record
        // with a deterministic ID
        uint256 taggingRecordId = computeTaggingRecordId(
            _targetId,
            _tagger,
            _publisher,
            _sponsor
        );

        taggingRecords[taggingRecordId] = TaggingRecord({
            etsTagIds: _etsTagIds,
            targetId: _targetId,
            tagger: _tagger,
            publisher: _publisher,
            sponsor: _sponsor
        });

        // Log that a target has been tagged.
        emit TargetTagged(taggingRecordId);
    }

    /// @notice Allow either a tagger or a sponsor to update the tags for a tagging record pointing to a target
    /// Append or replace
    function updateTaggingRecord(
        uint256 _taggingRecordId,
        string[] calldata _tags
    ) external payable {
        // todo - I think this makes sense but should a user be allowed to completely remove all tags, does that mean deleting the record completely?
        require(_tags.length > 0, "Empty array");

        TaggingRecord storage taggingRecord = taggingRecords[_taggingRecordId];
        address sender = _msgSender();

        uint256 currentNumberOfTags = taggingRecord.etsTagIds.length;
        if (_tags.length > currentNumberOfTags) {
            uint256 numberOfAdditionalTags = _tags.length - currentNumberOfTags;
            require(
                msg.value == numberOfAdditionalTags * taggingFee,
                "Additional tags require fees"
            );
        }

        require(
            sender == taggingRecord.tagger || sender == taggingRecord.sponsor,
            "Only tagger or sponsor"
        );

        unchecked {
            uint256 tagCount = _tags.length;
            uint256[] memory etsTagIds = new uint256[](tagCount);
            for (uint256 i; i < tagCount; ++i) {
                uint256 etsTagId = getOrCreateTag(
                    _tags[i],
                    payable(taggingRecord.publisher),
                    taggingRecord.tagger
                );

                etsTagIds[i] = etsTagId;
            }

            taggingRecord.etsTagIds = etsTagIds;
        }

        // Log that a tagging record has been tagged.
        emit TaggingRecordUpdated(_taggingRecordId);
    }

    /// @notice Deterministically compute the tagging record identifier
    function computeTaggingRecordId(
        uint256 _targetId,
        address _publisher,
        address _tagger,
        address _sponsor
    ) public pure returns (uint256 taggingRecordId) {
        taggingRecordId = uint256(keccak256(
                abi.encodePacked(_targetId, _tagger, _publisher, _sponsor)
            ));
    }

    function _processAccrued(uint256 _etsTagId, address _publisher) internal {
        (address _platform, address _owner) = etsTag.getPaymentAddresses(_etsTagId);

        // pre-auction.
        if (_owner == _platform) {
            accrued[_platform] = accrued[_platform] + ((msg.value * platformPercentage) / modulo);
            accrued[_publisher] = accrued[_publisher] + ((msg.value * publisherPercentage) / modulo);

            address creator = etsTag.getCreatorAddress(_etsTagId);
            accrued[creator] = accrued[creator] + ((msg.value * remainingPercentage) / modulo);
        }
        // post-auction.
        else {
            accrued[_platform] = accrued[_platform] + ((msg.value * platformPercentage) / modulo);
            accrued[_publisher] = accrued[_publisher] + ((msg.value * publisherPercentage) / modulo);

            accrued[_owner] = accrued[_owner] + ((msg.value * remainingPercentage) / modulo);
        }
    }
}
