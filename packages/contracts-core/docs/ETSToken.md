# ETS ERC-721 NFT contract (ETSToken.sol)

View Source: [contracts/ETSToken.sol](https://github.com/ethereum-tag-service/ets/tree/stage/packages/contracts-corecontracts/ETSToken.sol)

**↗ Extends: [ERC721PausableUpgradeable](ERC721PausableUpgradeable.md), [ERC721BurnableUpgradeable](ERC721BurnableUpgradeable.md), [IETSToken](IETSToken.md), [UUPSUpgradeable](UUPSUpgradeable.md), [StringHelpers](StringHelpers.md)**

**ETSToken**

Contract that governs the creation of CTAG non-fungible tokens.

## Contract Members
**Constants & Variables**

```solidity
contract IETSAccessControls public etsAccessControls;
string public constant NAME;
string public constant VERSION;
uint256 public tagMinStringLength;
uint256 public tagMaxStringLength;
uint256 public ownershipTermLength;
address payable public platform;
mapping(uint256 => struct IETSToken.Tag) public tokenIdToTag;
mapping(uint256 => uint256) public tokenIdToLastRenewed;
mapping(string => bool) public isTagPremium;

```

## Modifiers

- [onlyAdmin](#onlyadmin)
- [onlyPublisher](#onlypublisher)

### onlyAdmin

```solidity
modifier onlyAdmin() internal
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|

### onlyPublisher

```solidity
modifier onlyPublisher() internal
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|

## Functions

- [initialize](#initialize)
- [_authorizeUpgrade](#_authorizeupgrade)
- [pause](#pause)
- [unPause](#unpause)
- [burn](#burn)
- [setTagMaxStringLength](#settagmaxstringlength)
- [setOwnershipTermLength](#setownershiptermlength)
- [setPlatform](#setplatform)
- [setAccessControls](#setaccesscontrols)
- [preSetPremiumTags](#presetpremiumtags)
- [setPremiumFlag](#setpremiumflag)
- [setReservedFlag](#setreservedflag)
- [createTag](#createtag)
- [createTag](#createtag)
- [renewTag](#renewtag)
- [recycleTag](#recycletag)
- [computeTagId](#computetagid)
- [tagExists](#tagexists)
- [tagExists](#tagexists)
- [getTag](#gettag)
- [getTag](#gettag)
- [getOwnershipTermLength](#getownershiptermlength)
- [getLastRenewed](#getlastrenewed)
- [getPaymentAddresses](#getpaymentaddresses)
- [getCreatorAddress](#getcreatoraddress)
- [getPlatformAddress](#getplatformaddress)
- [version](#version)
- [_beforeTokenTransfer](#_beforetokentransfer)
- [_afterTokenTransfer](#_aftertokentransfer)
- [_assertTagIsValid](#_asserttagisvalid)
- [_setLastRenewed](#_setlastrenewed)

### initialize

```solidity
function initialize(IETSAccessControls _etsAccessControls, address payable _platform, uint256 _tagMinStringLength, uint256 _tagMaxStringLength, uint256 _ownershipTermLength) public nonpayable initializer 
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| _etsAccessControls | IETSAccessControls |  | 
| _platform | address payable |  | 
| _tagMinStringLength | uint256 |  | 
| _tagMaxStringLength | uint256 |  | 
| _ownershipTermLength | uint256 |  | 

### _authorizeUpgrade

```solidity
function _authorizeUpgrade(address ) internal nonpayable onlyAdmin 
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
|  | address |  | 

### pause

Pause CTAG token contract.

```solidity
function pause() external nonpayable onlyAdmin 
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|

### unPause

Unpause CTAG token contract.

```solidity
function unPause() external nonpayable onlyAdmin 
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|

### burn

```solidity
function burn(uint256 tokenId) public nonpayable onlyAdmin 
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| tokenId | uint256 |  | 

### setTagMaxStringLength

```solidity
function setTagMaxStringLength(uint256 _tagMaxStringLength) public nonpayable onlyAdmin 
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| _tagMaxStringLength | uint256 |  | 

### setOwnershipTermLength

```solidity
function setOwnershipTermLength(uint256 _ownershipTermLength) public nonpayable onlyAdmin 
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| _ownershipTermLength | uint256 |  | 

### setPlatform

```solidity
function setPlatform(address payable _platform) public nonpayable onlyAdmin 
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| _platform | address payable |  | 

### setAccessControls

```solidity
function setAccessControls(IETSAccessControls _etsAccessControls) public nonpayable onlyAdmin 
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| _etsAccessControls | IETSAccessControls |  | 

### preSetPremiumTags

Pre-minting, flag / unflag tag strings as premium tags.

```solidity
function preSetPremiumTags(string[] _tags, bool _enabled) public nonpayable onlyAdmin 
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| _tags | string[] |  | 
| _enabled | bool |  | 

### setPremiumFlag

set/unset premium flag on tags owned by platform.

```solidity
function setPremiumFlag(uint256[] _tokenIds, bool _isPremium) public nonpayable onlyAdmin 
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| _tokenIds | uint256[] |  | 
| _isPremium | bool |  | 

### setReservedFlag

Add or remove reserved flag from one or more tags.
 Reserved flag prevents bidding on token at ETSAuctionHouse.

```solidity
function setReservedFlag(uint256[] _tokenIds, bool _reserved) public nonpayable onlyAdmin 
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| _tokenIds | uint256[] |  | 
| _reserved | bool |  | 

### createTag

```solidity
function createTag(string _tag) public payable
returns(_tokenId uint256)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| _tag | string |  | 

### createTag

```solidity
function createTag(string _tag, address payable _publisher) public payable
returns(_tokenId uint256)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| _tag | string |  | 
| _publisher | address payable |  | 

### renewTag

```solidity
function renewTag(uint256 _tokenId) public nonpayable
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| _tokenId | uint256 |  | 

### recycleTag

allows anyone or thing to recycle a CTAG back to platform if
 ownership term is expired.

```solidity
function recycleTag(uint256 _tokenId) public nonpayable
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| _tokenId | uint256 |  | 

### computeTagId

```solidity
function computeTagId(string _tag) public pure
returns(uint256)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| _tag | string |  | 

### tagExists

```solidity
function tagExists(string _tag) public view
returns(bool)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| _tag | string |  | 

### tagExists

```solidity
function tagExists(uint256 _tokenId) public view
returns(bool)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| _tokenId | uint256 |  | 

### getTag

```solidity
function getTag(string _tag) public view
returns(struct IETSToken.Tag)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| _tag | string |  | 

### getTag

```solidity
function getTag(uint256 _tokenId) public view
returns(struct IETSToken.Tag)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| _tokenId | uint256 |  | 

### getOwnershipTermLength

```solidity
function getOwnershipTermLength() public view
returns(uint256)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|

### getLastRenewed

```solidity
function getLastRenewed(uint256 _tokenId) public view
returns(uint256)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| _tokenId | uint256 |  | 

### getPaymentAddresses

Returns the commission addresses related to a token.
 TODO: Refactor so it passes all key addresses. platform, publisher, creator, owner

```solidity
function getPaymentAddresses(uint256 _tokenId) public view
returns(_platform address payable, _owner address payable)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| _tokenId | uint256 |  | 

### getCreatorAddress

Returns creator of a CTAG token.

```solidity
function getCreatorAddress(uint256 _tokenId) public view
returns(_creator address)
```

**Returns**

_creator creator of the CTAG.

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| _tokenId | uint256 | ID of a CTAG. | 

### getPlatformAddress

```solidity
function getPlatformAddress() public view
returns(address)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|

### version

```solidity
function version() external pure
returns(string)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|

### _beforeTokenTransfer

```solidity
function _beforeTokenTransfer(address from, address to, uint256 amount) internal nonpayable whenNotPaused 
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| from | address |  | 
| to | address |  | 
| amount | uint256 |  | 

### _afterTokenTransfer

See {ERC721-_afterTokenTransfer}. Contract must not be paused.

```solidity
function _afterTokenTransfer(address from, address to, uint256 tokenId) internal nonpayable
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| from | address |  | 
| to | address |  | 
| tokenId | uint256 |  | 

### _assertTagIsValid

Private method used for validating a CTAG string before minting.

```solidity
function _assertTagIsValid(string _tag) private view
returns(_tagId uint256)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| _tag | string | Proposed tag string. | 

### _setLastRenewed

```solidity
function _setLastRenewed(uint256 _tokenId, uint256 _timestamp) internal nonpayable
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| _tokenId | uint256 |  | 
| _timestamp | uint256 |  | 

## Contracts

* [AccessControlUpgradeable](AccessControlUpgradeable.md)
* [Address](Address.md)
* [AddressUpgradeable](AddressUpgradeable.md)
* [console](console.md)
* [Context](Context.md)
* [ContextUpgradeable](ContextUpgradeable.md)
* [ERC165](ERC165.md)
* [ERC165Upgradeable](ERC165Upgradeable.md)
* [ERC1967UpgradeUpgradeable](ERC1967UpgradeUpgradeable.md)
* [ERC721](ERC721.md)
* [ERC721Burnable](ERC721Burnable.md)
* [ERC721BurnableMock](ERC721BurnableMock.md)
* [ERC721BurnableUpgradeable](ERC721BurnableUpgradeable.md)
* [ERC721PausableUpgradeable](ERC721PausableUpgradeable.md)
* [ERC721ReceiverMock](ERC721ReceiverMock.md)
* [ERC721Upgradeable](ERC721Upgradeable.md)
* [ETSAccessControls](ETSAccessControls.md)
* [ETSAccessControlsUpgrade](ETSAccessControlsUpgrade.md)
* [ETSAuctionHouse](ETSAuctionHouse.md)
* [ETSAuctionHouseUpgrade](ETSAuctionHouseUpgrade.md)
* [ETSToken](ETSToken.md)
* [ETSTokenUpgrade](ETSTokenUpgrade.md)
* [IAccessControlUpgradeable](IAccessControlUpgradeable.md)
* [IBeaconUpgradeable](IBeaconUpgradeable.md)
* [IERC165](IERC165.md)
* [IERC165Upgradeable](IERC165Upgradeable.md)
* [IERC1822ProxiableUpgradeable](IERC1822ProxiableUpgradeable.md)
* [IERC20Upgradeable](IERC20Upgradeable.md)
* [IERC721](IERC721.md)
* [IERC721Metadata](IERC721Metadata.md)
* [IERC721MetadataUpgradeable](IERC721MetadataUpgradeable.md)
* [IERC721Receiver](IERC721Receiver.md)
* [IERC721ReceiverUpgradeable](IERC721ReceiverUpgradeable.md)
* [IERC721Upgradeable](IERC721Upgradeable.md)
* [IETSAccessControls](IETSAccessControls.md)
* [IETSAuctionHouse](IETSAuctionHouse.md)
* [IETSToken](IETSToken.md)
* [Initializable](Initializable.md)
* [IWMATIC](IWMATIC.md)
* [MaliciousBidder](MaliciousBidder.md)
* [PausableUpgradeable](PausableUpgradeable.md)
* [ReentrancyGuardUpgradeable](ReentrancyGuardUpgradeable.md)
* [SafeERC20Upgradeable](SafeERC20Upgradeable.md)
* [SafeMathUpgradeable](SafeMathUpgradeable.md)
* [StorageSlotUpgradeable](StorageSlotUpgradeable.md)
* [StringHelpers](StringHelpers.md)
* [Strings](Strings.md)
* [StringsUpgradeable](StringsUpgradeable.md)
* [UUPSUpgradeable](UUPSUpgradeable.md)
* [WMATIC](WMATIC.md)
