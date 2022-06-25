# SafeMathUpgradeable.sol

View Source: [@openzeppelin/contracts-upgradeable/utils/math/SafeMathUpgradeable.sol](https://github.com/ethereum-tag-service/ets/tree/stage/packages/contracts-core@openzeppelin/contracts-upgradeable/utils/math/SafeMathUpgradeable.sol)

**SafeMathUpgradeable**

Wrappers over Solidity's arithmetic operations.
 NOTE: `SafeMath` is generally not needed starting with Solidity 0.8, since the compiler
 now has built in overflow checking.

## Functions

- [tryAdd](#tryadd)
- [trySub](#trysub)
- [tryMul](#trymul)
- [tryDiv](#trydiv)
- [tryMod](#trymod)
- [add](#add)
- [sub](#sub)
- [mul](#mul)
- [div](#div)
- [mod](#mod)
- [sub](#sub)
- [div](#div)
- [mod](#mod)

### tryAdd

Returns the addition of two unsigned integers, with an overflow flag.
 _Available since v3.4._

```solidity
function tryAdd(uint256 a, uint256 b) internal pure
returns(bool, uint256)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| a | uint256 |  | 
| b | uint256 |  | 

### trySub

Returns the subtraction of two unsigned integers, with an overflow flag.
 _Available since v3.4._

```solidity
function trySub(uint256 a, uint256 b) internal pure
returns(bool, uint256)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| a | uint256 |  | 
| b | uint256 |  | 

### tryMul

Returns the multiplication of two unsigned integers, with an overflow flag.
 _Available since v3.4._

```solidity
function tryMul(uint256 a, uint256 b) internal pure
returns(bool, uint256)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| a | uint256 |  | 
| b | uint256 |  | 

### tryDiv

Returns the division of two unsigned integers, with a division by zero flag.
 _Available since v3.4._

```solidity
function tryDiv(uint256 a, uint256 b) internal pure
returns(bool, uint256)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| a | uint256 |  | 
| b | uint256 |  | 

### tryMod

Returns the remainder of dividing two unsigned integers, with a division by zero flag.
 _Available since v3.4._

```solidity
function tryMod(uint256 a, uint256 b) internal pure
returns(bool, uint256)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| a | uint256 |  | 
| b | uint256 |  | 

### add

Returns the addition of two unsigned integers, reverting on
 overflow.
 Counterpart to Solidity's `+` operator.
 Requirements:
 - Addition cannot overflow.

```solidity
function add(uint256 a, uint256 b) internal pure
returns(uint256)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| a | uint256 |  | 
| b | uint256 |  | 

### sub

Returns the subtraction of two unsigned integers, reverting on
 overflow (when the result is negative).
 Counterpart to Solidity's `-` operator.
 Requirements:
 - Subtraction cannot overflow.

```solidity
function sub(uint256 a, uint256 b) internal pure
returns(uint256)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| a | uint256 |  | 
| b | uint256 |  | 

### mul

Returns the multiplication of two unsigned integers, reverting on
 overflow.
 Counterpart to Solidity's `*` operator.
 Requirements:
 - Multiplication cannot overflow.

```solidity
function mul(uint256 a, uint256 b) internal pure
returns(uint256)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| a | uint256 |  | 
| b | uint256 |  | 

### div

Returns the integer division of two unsigned integers, reverting on
 division by zero. The result is rounded towards zero.
 Counterpart to Solidity's `/` operator.
 Requirements:
 - The divisor cannot be zero.

```solidity
function div(uint256 a, uint256 b) internal pure
returns(uint256)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| a | uint256 |  | 
| b | uint256 |  | 

### mod

Returns the remainder of dividing two unsigned integers. (unsigned integer modulo),
 reverting when dividing by zero.
 Counterpart to Solidity's `%` operator. This function uses a `revert`
 opcode (which leaves remaining gas untouched) while Solidity uses an
 invalid opcode to revert (consuming all remaining gas).
 Requirements:
 - The divisor cannot be zero.

```solidity
function mod(uint256 a, uint256 b) internal pure
returns(uint256)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| a | uint256 |  | 
| b | uint256 |  | 

### sub

Returns the subtraction of two unsigned integers, reverting with custom message on
 overflow (when the result is negative).
 CAUTION: This function is deprecated because it requires allocating memory for the error
 message unnecessarily. For custom revert reasons use {trySub}.
 Counterpart to Solidity's `-` operator.
 Requirements:
 - Subtraction cannot overflow.

```solidity
function sub(uint256 a, uint256 b, string errorMessage) internal pure
returns(uint256)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| a | uint256 |  | 
| b | uint256 |  | 
| errorMessage | string |  | 

### div

Returns the integer division of two unsigned integers, reverting with custom message on
 division by zero. The result is rounded towards zero.
 Counterpart to Solidity's `/` operator. Note: this function uses a
 `revert` opcode (which leaves remaining gas untouched) while Solidity
 uses an invalid opcode to revert (consuming all remaining gas).
 Requirements:
 - The divisor cannot be zero.

```solidity
function div(uint256 a, uint256 b, string errorMessage) internal pure
returns(uint256)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| a | uint256 |  | 
| b | uint256 |  | 
| errorMessage | string |  | 

### mod

Returns the remainder of dividing two unsigned integers. (unsigned integer modulo),
 reverting with custom message when dividing by zero.
 CAUTION: This function is deprecated because it requires allocating memory for the error
 message unnecessarily. For custom revert reasons use {tryMod}.
 Counterpart to Solidity's `%` operator. This function uses a `revert`
 opcode (which leaves remaining gas untouched) while Solidity uses an
 invalid opcode to revert (consuming all remaining gas).
 Requirements:
 - The divisor cannot be zero.

```solidity
function mod(uint256 a, uint256 b, string errorMessage) internal pure
returns(uint256)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| a | uint256 |  | 
| b | uint256 |  | 
| errorMessage | string |  | 

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
