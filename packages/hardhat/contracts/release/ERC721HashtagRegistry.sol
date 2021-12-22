// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/utils/ContextUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/math/SafeMathUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/IERC721Upgradeable.sol";

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

import "./HashtagProtocol.sol";

/**
 * @title ERC721HashtagRegistry
 * @notice Contract that allows any ERC721 asset to be tagged by a hashtag within the Hashtag protocol
 * @author Hashtag Protocol
 */
contract ERC721HashtagRegistry is Initializable, ContextUpgradeable, ReentrancyGuardUpgradeable, UUPSUpgradeable {
    using SafeMathUpgradeable for uint256;

    /// Storage

    HashtagAccessControls public accessControls;
    HashtagProtocol public hashtagProtocol;

    uint256 public platformPercentage;
    uint256 public publisherPercentage;
    uint256 public remainingPercentage;
    uint256 public totalTags;
    uint256 public tagFee;

    mapping(address => uint256) public accrued;
    mapping(address => uint256) public paid;
    mapping(uint256 => bool) public permittedNftChainIds;
    // tag id (will come from the totalTags pointer) -> tag
    mapping(uint256 => Tag) public tagIdToTag;

    /// Public constants

    string public constant NAME = "HTP: ERC721 Registry";
    string public constant VERSION = "0.2.0";
    uint256 public constant modulo = 100;

    /// Structs

    struct Tag {
        uint256 hashtagId;
        address nftContract;
        uint256 nftId;
        address tagger;
        uint256 tagstamp;
        address publisher;
        uint256 nftChainId;
    }

    /// Events

    event HashtagRegistered(
        address indexed tagger,
        address indexed nftContract,
        address indexed publisher,
        uint256 hashtagId,
        uint256 nftId,
        uint256 tagId,
        uint256 tagFee,
        uint256 nftChainId
    );

    event DrawDown(address indexed who, uint256 amount);

    /**
     * @notice Admin only execution guard
     * @dev When applied to a method, only allows execution when the sender has the admin role
     */
    modifier onlyAdmin() {
        require(accessControls.isAdmin(_msgSender()), "Caller must be admin");
        _;
    }

    /// @custom:oz-upgrades-unsafe-allow constructor
    //constructor() initializer {}

    // Replaces contructor function for UUPS Proxy contracts. Called upon first deployment.
    function initialize(HashtagAccessControls _accessControls, HashtagProtocol _hashtagProtocol) public initializer {
        accessControls = _accessControls;
        hashtagProtocol = _hashtagProtocol;
        totalTags = 0;
        tagFee = 0.001 ether;
        platformPercentage = 20;
        publisherPercentage = 30;
        remainingPercentage = 50;
    }

    // Ensure that only address with admin role can upgrade.
    function _authorizeUpgrade(address) internal override onlyAdmin {}

    /// External write

    /**
     * @notice Combines the action of creating a new hashtag and then tagging an NFT asset with this new tag.
     * @dev Only a whitelisted publisher can execute this with the required fee unless the caller / sender has admin privileges.
     * @param _hashtag string value of the hashtag to be minted
     * @param _nftContract address of nft contract
     * @param _nftId ID of the nft to link from the above nft contract
     * @param _publisher the publisher attributed to the tagging
     * @param _tagger the ethereum account that made the original tagging request
     * @param _nftChainId EVM compatible chain id
     */
    function mintAndTag(
        string calldata _hashtag,
        address _nftContract,
        uint256 _nftId,
        address payable _publisher,
        address _tagger,
        uint256 _nftChainId
    ) external payable {
        require(accessControls.isPublisher(_publisher), "Mint and tag: The publisher must be whitelisted");
        require(msg.value >= tagFee, "Mint and tag: You must send the tag fee");
        require(this.getPermittedNftChainId(_nftChainId), "Mint and tag: Tagging target chain not permitted");

        uint256 hashtagId = hashtagProtocol.mint(_hashtag, _publisher, _tagger);
        _tag(hashtagId, _nftContract, _nftId, _publisher, _tagger, _nftChainId);
    }

    /**
     * @notice Tags an ERC721 NFT asset by storing a reference between the asset
       and a hashtag. If hashtag string does not exist, function will attempt to
       mint a new one.
     * @dev Only a whitelisted publisher can execute this with the required fee unless the caller / sender has admin privileges.
     * @param _hashtag hashtag string used for tagging
     * @param _nftContract address of nft contract
     * @param _nftId ID of the nft to link from the above nft contract
     * @param _tagger the ethereum account that made the original tagging request
     * @param _nftChainId EVM compatible chain id
     */
    function tag(
        string calldata _hashtag,
        //uint256 _hashtagId,
        address _nftContract,
        uint256 _nftId,
        address payable _publisher,
        address _tagger,
        uint256 _nftChainId
    ) public payable nonReentrant {
        require(accessControls.isPublisher(_publisher), "Tag: The publisher must be whitelisted");
        require(msg.value >= tagFee, "Tag: You must send the fee");
        //require(hashtagProtocol.exists(_hashtagId), "Tag: The hashtag ID supplied is invalid - non-existent token!");
        require(this.getPermittedNftChainId(_nftChainId), "Tag: Tagging target chain not permitted");

        uint256 hashtagId = hashtagProtocol.getHashtagId(_hashtag);
        if (hashtagId == 0) {
            hashtagId = hashtagProtocol.mint(_hashtag, _publisher, _tagger);
        }

        _tag(hashtagId, _nftContract, _nftId, _publisher, _tagger, _nftChainId);
    }

    /**
     * @notice Enables anyone to send ETH accrued by an account
     * @dev Can be called by the account owner or on behalf of someone
     * @dev Does nothing when there is nothing due to the account
     * @param _account Target address that has had accrued ETH and which will receive the ETH
     */
    function drawDown(address payable _account) external nonReentrant {
        uint256 balanceDue = accrued[_account].sub(paid[_account]);
        if (balanceDue > 0 && balanceDue <= address(this).balance) {
            paid[_account] = paid[_account].add(balanceDue);
            _account.transfer(balanceDue);

            emit DrawDown(_account, balanceDue);
        }
    }

    /**
     * @notice Sets the fee required to tag an NFT asset
     * @param _fee Value of the fee in WEI
     */
    function setTagFee(uint256 _fee) external onlyAdmin {
        tagFee = _fee;
    }

    /**
     * @notice Admin functionality for updating the access controls
     * @param _accessControls Address of the access controls contract
     */
    function updateAccessControls(HashtagAccessControls _accessControls) external onlyAdmin {
        require(address(_accessControls) != address(0), "ERC721HashtagRegistry.updateAccessControls: Cannot be zero");
        accessControls = _accessControls;
    }

    /**
     * @notice Admin functionality for updating the percentages
     * @param _platformPercentage percentage for platform
     * @param _publisherPercentage percentage for publisher
     */
    function updatePercentages(uint256 _platformPercentage, uint256 _publisherPercentage) external onlyAdmin {
        require(
            _platformPercentage.add(_publisherPercentage) <= 100,
            "ERC721HashtagRegistry.updatePercentages: percentages must not be over 100"
        );
        platformPercentage = _platformPercentage;
        publisherPercentage = _publisherPercentage;
        remainingPercentage = modulo.sub(platformPercentage).sub(publisherPercentage);
    }

    /**
     * @notice Admin functionality for enabling/disabling target chains.
     * @param _nftChainId EVM compatible chain id.
     * @param _setting Boolean, set true for enabled, false for disabled.
     */
    function setPermittedNftChainId(uint256 _nftChainId, bool _setting) external onlyAdmin {
        permittedNftChainIds[_nftChainId] = _setting;
    }

    /// External read

    /**
     * @notice Used to check how much ETH has been accrued by an address factoring in amount paid out
     * @param _account Address of the account being queried
     * @return _due Amount of WEI in ETH due to account
     */
    function totalDue(address _account) external view returns (uint256 _due) {
        return accrued[_account].sub(paid[_account]);
    }

    /**
     * @notice Retrieves information about a tag event
     * @param _tagId ID of the tagging event of interest
     * @return _hashtagId hashtag ID
     * @return _nftContract NFT contract address
     * @return _nftId NFT ID
     * @return _tagger Address that tagged the NFT asset
     * @return _tagstamp When the tag took place
     * @return _publisher Publisher through which the tag took place
     */
    function getTagInfo(uint256 _tagId)
        external
        view
        returns (
            uint256 _hashtagId,
            address _nftContract,
            uint256 _nftId,
            address _tagger,
            uint256 _tagstamp,
            address _publisher,
            uint256 _nftChainId
        )
    {
        Tag storage tagInfo = tagIdToTag[_tagId];
        return (
            tagInfo.hashtagId,
            tagInfo.nftContract,
            tagInfo.nftId,
            tagInfo.tagger,
            tagInfo.tagstamp,
            tagInfo.publisher,
            tagInfo.nftChainId
        );
    }

    /**
     * @notice Check if a target chain is permitted for tagging.
     * @param _nftChainId EVM compatible chain id.
     * @return true for enabled, false for disabled.
     */
    function getPermittedNftChainId(uint256 _nftChainId) external view returns (bool) {
        return permittedNftChainIds[_nftChainId];
    }

    function version() external pure returns (string memory) {
        return VERSION;
    }

    /// Internal write

    function _tag(
        uint256 _hashtagId,
        address _nftContract,
        uint256 _nftId,
        address _publisher,
        address _tagger,
        uint256 _nftChainId
    ) private {
        require(
            _nftContract != address(hashtagProtocol),
            "Tag: Invalid tag - you are attempting to tag another hashtag"
        );
        // Ensure that we are dealing with an ERC721 compliant _nftContract
        require(_nftContract != address(0), "function call to a non-contract address");

        // Generate a new tag ID
        totalTags = totalTags.add(1);
        uint256 tagId = totalTags;

        tagIdToTag[tagId] = Tag({
            hashtagId: _hashtagId,
            nftContract: _nftContract,
            nftId: _nftId,
            tagger: _tagger,
            tagstamp: block.timestamp,
            publisher: _publisher,
            nftChainId: _nftChainId
        });

        (address _platform, address _owner) = hashtagProtocol.getPaymentAddresses(_hashtagId);

        // pre-auction
        if (_owner == _platform) {
            accrued[_platform] = accrued[_platform].add(msg.value.mul(platformPercentage).div(modulo));
            accrued[_publisher] = accrued[_publisher].add(msg.value.mul(publisherPercentage).div(modulo));

            address creator = hashtagProtocol.getCreatorAddress(_hashtagId);
            accrued[creator] = accrued[creator].add(msg.value.mul(remainingPercentage).div(modulo));
        }
        // post-auction
        else {
            accrued[_platform] = accrued[_platform].add(msg.value.mul(platformPercentage).div(modulo));
            accrued[_publisher] = accrued[_publisher].add(msg.value.mul(publisherPercentage).div(modulo));

            accrued[_owner] = accrued[_owner].add(msg.value.mul(remainingPercentage).div(modulo));
        }

        // Log that an NFT has been tagged
        emit HashtagRegistered(_tagger, _nftContract, _publisher, _hashtagId, _nftId, tagId, tagFee, _nftChainId);
    }

    /// Internal read

    function _assertNftExists(address _nftContract, uint256 _nftId) private view {
        try IERC721Upgradeable(_nftContract).ownerOf(_nftId) returns (address owner) {
            require(owner != address(0), "Token does not exist or is owned by the zero address");
        } catch Error(string memory reason) {
            revert(reason);
        } catch {
            revert("Token does not exist");
        }
    }
}
