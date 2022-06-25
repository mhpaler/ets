# WMATIC.sol

View Source: [contracts/test/WMATIC.sol](https://github.com/ethereum-tag-service/ets/tree/stage/packages/contracts-corecontracts/test/WMATIC.sol)

**WMATIC**

## Contract Members
**Constants & Variables**

```solidity
string public name;
string public symbol;
uint8 public decimals;
mapping(address => uint256) public balanceOf;
mapping(address => mapping(address => uint256)) public allowance;

```

## Events

```solidity
event Approval(address indexed src, address indexed guy, uint256  wad);
event Transfer(address indexed src, address indexed dst, uint256  wad);
event Deposit(address indexed dst, uint256  wad);
event Withdrawal(address indexed src, uint256  wad);
```

## Functions

- [constructor](#constructor)
- [constructor](#constructor)
- [deposit](#deposit)
- [withdraw](#withdraw)
- [totalSupply](#totalsupply)
- [approve](#approve)
- [transfer](#transfer)
- [transferFrom](#transferfrom)

### constructor

```solidity
constructor() external payable
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|

### constructor

```solidity
constructor() external payable
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|

### deposit

```solidity
function deposit() public payable
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|

### withdraw

```solidity
function withdraw(uint256 wad) public nonpayable
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| wad | uint256 |  | 

### totalSupply

```solidity
function totalSupply() public view
returns(uint256)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|

### approve

```solidity
function approve(address guy, uint256 wad) public nonpayable
returns(bool)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| guy | address |  | 
| wad | uint256 |  | 

### transfer

```solidity
function transfer(address dst, uint256 wad) public nonpayable
returns(bool)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| dst | address |  | 
| wad | uint256 |  | 

### transferFrom

```solidity
function transferFrom(address src, address dst, uint256 wad) public nonpayable
returns(bool)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| src | address |  | 
| dst | address |  | 
| wad | uint256 |  | 

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
