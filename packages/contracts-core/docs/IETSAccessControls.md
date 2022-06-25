# IETSAccessControls.sol

View Source: [contracts/interfaces/IETSAccessControls.sol](https://github.com/ethereum-tag-service/ets/tree/stage/packages/contracts-corecontracts/interfaces/IETSAccessControls.sol)

**↗ Extends: [IAccessControlUpgradeable](IAccessControlUpgradeable.md)**
**↘ Derived Contracts: [ETSAccessControls](ETSAccessControls.md)**

**IETSAccessControls**

## Events

```solidity
event ETSTokenSet(IETSToken  etsToken);
event PublisherDefaultThresholdSet(uint256  threshold);
```

## Functions

- [togglePublisher](#togglepublisher)
- [setETSToken](#setetstoken)
- [setRoleAdmin](#setroleadmin)
- [setPublisherDefaultThreshold](#setpublisherdefaultthreshold)
- [getPublisherThreshold](#getpublisherthreshold)
- [getPublisherDefaultThreshold](#getpublisherdefaultthreshold)
- [isSmartContract](#issmartcontract)
- [isAdmin](#isadmin)
- [isPublisher](#ispublisher)
- [isPublisherAdmin](#ispublisheradmin)

### togglePublisher

```solidity
function togglePublisher() external nonpayable
returns(toggled bool)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|

### setETSToken

Point ETSAccessControls to ETSToken contract.

```solidity
function setETSToken(IETSToken _etsToken) external nonpayable
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| _etsToken | IETSToken |  | 

### setRoleAdmin

set the role admin for a role.

```solidity
function setRoleAdmin(bytes32 _role, bytes32 _adminRole) external nonpayable
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| _role | bytes32 |  | 
| _adminRole | bytes32 |  | 

### setPublisherDefaultThreshold

```solidity
function setPublisherDefaultThreshold(uint256 _threshold) external nonpayable
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| _threshold | uint256 |  | 

### getPublisherThreshold

```solidity
function getPublisherThreshold(address _addr) external view
returns(uint256)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| _addr | address |  | 

### getPublisherDefaultThreshold

```solidity
function getPublisherDefaultThreshold() external view
returns(uint256)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|

### isSmartContract

```solidity
function isSmartContract(address _addr) external view
returns(bool)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| _addr | address |  | 

### isAdmin

```solidity
function isAdmin(address _addr) external view
returns(bool)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| _addr | address |  | 

### isPublisher

```solidity
function isPublisher(address _addr) external view
returns(bool)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| _addr | address |  | 

### isPublisherAdmin

```solidity
function isPublisherAdmin(address _addr) external view
returns(bool)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| _addr | address |  | 

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
