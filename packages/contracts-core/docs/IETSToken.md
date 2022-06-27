# IETSToken.sol

View Source: [contracts/interfaces/IETSToken.sol](https://github.com/ethereum-tag-service/ets/tree/stage/packages/contracts-corecontracts/interfaces/IETSToken.sol)

**↗ Extends: [IERC721Upgradeable](IERC721Upgradeable.md)**
**↘ Derived Contracts: [ETSToken](ETSToken.md)**

**IETSToken**

ETS core interface exposing ability for external contracts to mint and use CTAGs.

## Structs
### Tag

```solidity
struct Tag {
 address publisher,
 address creator,
 string display,
 bool premium,
 bool reserved
}
```

## Events

```solidity
event OwnershipTermLengthSet(uint256  termLength);
event TagMaxStringLengthSet(uint256  maxStringLength);
event PlatformSet(address  platformAddress);
event AccessControlsSet(IETSAccessControls  etsAccessControls);
event TagRenewed(uint256 indexed tokenId, address indexed caller);
event TagRecycled(uint256 indexed tokenId, address indexed caller);
event PremiumTagPreSet(string  tag, bool  isPremium);
event PremiumFlagSet(uint256  tagId, bool  isPremium);
event ReservedFlagSet(uint256  tagId, bool  isReleased);
```

## Functions

- [setOwnershipTermLength](#setownershiptermlength)
- [setAccessControls](#setaccesscontrols)
- [createTag](#createtag)
- [createTag](#createtag)
- [renewTag](#renewtag)
- [recycleTag](#recycletag)
- [computeTagId](#computetagid)
- [tagExists](#tagexists)
- [tagExists](#tagexists)
- [getTag](#gettag)
- [getTag](#gettag)
- [getPlatformAddress](#getplatformaddress)
- [getLastRenewed](#getlastrenewed)
- [getOwnershipTermLength](#getownershiptermlength)

### setOwnershipTermLength

```solidity
function setOwnershipTermLength(uint256 _ownershipTermLength) external nonpayable
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| _ownershipTermLength | uint256 |  | 

### setAccessControls

```solidity
function setAccessControls(IETSAccessControls _etsAccessControls) external nonpayable
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| _etsAccessControls | IETSAccessControls |  | 

### createTag

```solidity
function createTag(string _tag) external payable
returns(_tokenId uint256)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| _tag | string |  | 

### createTag

```solidity
function createTag(string _tag, address payable _publisher) external payable
returns(_tokenId uint256)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| _tag | string |  | 
| _publisher | address payable |  | 

### renewTag

```solidity
function renewTag(uint256 _tokenId) external nonpayable
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| _tokenId | uint256 |  | 

### recycleTag

```solidity
function recycleTag(uint256 _tokenId) external nonpayable
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| _tokenId | uint256 |  | 

### computeTagId

```solidity
function computeTagId(string _tag) external pure
returns(uint256)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| _tag | string |  | 

### tagExists

```solidity
function tagExists(string _tag) external view
returns(bool)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| _tag | string |  | 

### tagExists

```solidity
function tagExists(uint256 _tokenId) external view
returns(bool)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| _tokenId | uint256 |  | 

### getTag

```solidity
function getTag(string _tag) external view
returns(struct IETSToken.Tag)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| _tag | string |  | 

### getTag

```solidity
function getTag(uint256 _tokenId) external view
returns(struct IETSToken.Tag)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| _tokenId | uint256 |  | 

### getPlatformAddress

```solidity
function getPlatformAddress() external view
returns(address)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|

### getLastRenewed

```solidity
function getLastRenewed(uint256 _tokenId) external view
returns(uint256)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| _tokenId | uint256 |  | 

### getOwnershipTermLength

```solidity
function getOwnershipTermLength() external view
returns(uint256)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|

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
