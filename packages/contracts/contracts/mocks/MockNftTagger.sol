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
contract MockNftTagger is IETSTargetType, TargetTypeSignatureModule, OwnableUpgradeable, UUPSUpgradeable, PausableUpgradeable {

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

    /// @notice Entry point for a user to tag an EVM NFT which will call into ETS
    /// @dev This will be deprecated and removed in favour of a mandatory signature requirement from tagger
    function tag(
        string calldata _nftAddress,
        string calldata _tokenId,
        string calldata _chainId,
        string calldata _tagString,
        address payable _publisher,
        address _tagger,
        bool _ensure
    ) external payable {
        // compute concatenated target URI from tag params
        string memory targetURI = computeTargetURI(
            _nftAddress,
            _tokenId,
            _chainId
        );

        // call ETS informing of a new tag
        _tag(
            targetURI,
            _publisher,
            _tagString,
            _tagger,
            _ensure
        );
    }

    struct TagParams {
        string nftAddress;
        string tokenId;
        string chainId;
        string[] tagString;
    }

    /// @notice where tagger does an off chain signature and the tx gas is sponsored by anyone
    function sponsoredTag(
        TagParams calldata _tagParams, // todo - make sure to sign over whole tag params including tag strings
        Signature calldata _taggerSignature,
        address payable _publisher,// todo - need a publisher signature + pass down sponsor which is msg.sender
        bool _ensure
    ) external payable {
        // compute concatenated target URI from tag params
        string memory targetURI = computeTargetURI(
            _tagParams.nftAddress,
            _tagParams.tokenId,
            _tagParams.chainId
        );

        address tagger = recoverAddress(
            targetURI,
            _taggerSignature.v,
            _taggerSignature.r,
            _taggerSignature.s
        );

        // call ETS informing of a new tag
        _tag(
            targetURI,
            _publisher,
            _tagParams.tagString[0],
            tagger,
            _ensure
        );
    }

    /// @notice where publisher is sponsoring the tag (no need to pass publisher as a param)
    function publisherSponsoredTag(
        TagParams calldata _tagParams,
        Signature calldata _taggerSignature,
        bool _ensure
    ) external payable {
        // compute concatenated target URI from tag params
        string memory targetURI = computeTargetURI(
            _tagParams.nftAddress,
            _tagParams.tokenId,
            _tagParams.chainId
        );

        address tagger = recoverAddress(
            targetURI,
            _taggerSignature.v,
            _taggerSignature.r,
            _taggerSignature.s
        );

        // call ETS informing of a new tag
        _tag(
            targetURI,
            payable(msg.sender), // msg.sender is whitelisted publisher
            _tagParams.tagString[0],
            tagger,
            _ensure
        );
    }

    function _tag(
        string memory _targetURI,
        address payable _publisher,
        string calldata _tagString,
        address _tagger,
        bool _ensure
    ) internal {
        _performTaggingChecks(_tagger, _publisher);

        ets.tagTarget{ value: msg.value }(
            _tagString,
            _targetURI,
            _publisher,
            _tagger,
            _ensure
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

    // Perform any checks on input data from the tagging event
    function _performTaggingChecks(
        address _tagger,
        address _publisher
    ) internal pure {
        require(_tagger != _publisher, "Tagger cannot be publisher");
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
        return "MockNftTagger";
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
