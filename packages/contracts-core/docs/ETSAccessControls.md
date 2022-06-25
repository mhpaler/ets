# ETS access controls (ETSAccessControls.sol)

View Source: [contracts/ETSAccessControls.sol](https://github.com/ethereum-tag-service/ets/tree/stage/packages/contracts-corecontracts/ETSAccessControls.sol)

**↗ Extends: [Initializable](Initializable.md), [AccessControlUpgradeable](AccessControlUpgradeable.md), [IETSAccessControls](IETSAccessControls.md), [UUPSUpgradeable](UUPSUpgradeable.md)**
**↘ Derived Contracts: [ETSAccessControlsUpgrade](ETSAccessControlsUpgrade.md), [ETSAuctionHouseUpgrade](ETSAuctionHouseUpgrade.md), [ETSTokenUpgrade](ETSTokenUpgrade.md)**

**ETSAccessControls**

Maintains a mapping of ethereum addresses and roles they have within the protocol

## Contract Members
**Constants & Variables**

```solidity
contract IETSToken public etsToken;
string public constant NAME;
string public constant VERSION;
bytes32 public constant PUBLISHER_ROLE;
bytes32 public constant PUBLISHER_ROLE_ADMIN;
bytes32 public constant SMART_CONTRACT_ROLE;
uint256 public publisherDefaultThreshold;
mapping(address => uint256) public publisherThresholds;

```

## Functions

- [initialize](#initialize)
- [_authorizeUpgrade](#_authorizeupgrade)
- [setETSToken](#setetstoken)
- [setRoleAdmin](#setroleadmin)
- [setPublisherDefaultThreshold](#setpublisherdefaultthreshold)
- [togglePublisher](#togglepublisher)
- [isSmartContract](#issmartcontract)
- [isAdmin](#isadmin)
- [isPublisher](#ispublisher)
- [isPublisherAdmin](#ispublisheradmin)
- [getPublisherThreshold](#getpublisherthreshold)
- [getPublisherDefaultThreshold](#getpublisherdefaultthreshold)
- [version](#version)

### initialize

```solidity
function initialize(uint256 _publisherDefaultThreshold) public nonpayable initializer 
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| _publisherDefaultThreshold | uint256 |  | 

### _authorizeUpgrade

```solidity
function _authorizeUpgrade(address ) internal nonpayable onlyRole 
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
|  | address |  | 

### setETSToken

```solidity
function setETSToken(IETSToken _etsToken) public nonpayable onlyRole 
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| _etsToken | IETSToken |  | 

### setRoleAdmin

```solidity
function setRoleAdmin(bytes32 _role, bytes32 _adminRole) public nonpayable onlyRole 
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| _role | bytes32 |  | 
| _adminRole | bytes32 |  | 

### setPublisherDefaultThreshold

```solidity
function setPublisherDefaultThreshold(uint256 _threshold) public nonpayable onlyRole 
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| _threshold | uint256 |  | 

### togglePublisher

Grant or revoke publisher role for CTAG Token owners.

```solidity
function togglePublisher() public nonpayable
returns(toggled bool)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|

### isSmartContract

```solidity
function isSmartContract(address _addr) public view
returns(bool)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| _addr | address |  | 

### isAdmin

```solidity
function isAdmin(address _addr) public view
returns(bool)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| _addr | address |  | 

### isPublisher

```solidity
function isPublisher(address _addr) public view
returns(bool)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| _addr | address |  | 

### isPublisherAdmin

```solidity
function isPublisherAdmin(address _addr) public view
returns(bool)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| _addr | address |  | 

### getPublisherThreshold

```solidity
function getPublisherThreshold(address _addr) public view
returns(uint256)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| _addr | address |  | 

### getPublisherDefaultThreshold

```solidity
function getPublisherDefaultThreshold() public view
returns(uint256)
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
