# AddressUpgradeable.sol

View Source: [@openzeppelin/contracts-upgradeable/utils/AddressUpgradeable.sol](https://github.com/ethereum-tag-service/ets/tree/stage/packages/contracts-core@openzeppelin/contracts-upgradeable/utils/AddressUpgradeable.sol)

**AddressUpgradeable**

Collection of functions related to the address type

## Functions

- [isContract](#iscontract)
- [sendValue](#sendvalue)
- [functionCall](#functioncall)
- [functionCall](#functioncall)
- [functionCallWithValue](#functioncallwithvalue)
- [functionCallWithValue](#functioncallwithvalue)
- [functionStaticCall](#functionstaticcall)
- [functionStaticCall](#functionstaticcall)
- [verifyCallResult](#verifycallresult)

### isContract

Returns true if `account` is a contract.
 [IMPORTANT]
 ====
 It is unsafe to assume that an address for which this function returns
 false is an externally-owned account (EOA) and not a contract.
 Among others, `isContract` will return false for the following
 types of addresses:
  - an externally-owned account
  - a contract in construction
  - an address where a contract will be created
  - an address where a contract lived, but was destroyed
 ====
 [IMPORTANT]
 ====
 You shouldn't rely on `isContract` to protect against flash loan attacks!
 Preventing calls from contracts is highly discouraged. It breaks composability, breaks support for smart wallets
 like Gnosis Safe, and does not provide security since it can be circumvented by calling from a contract
 constructor.
 ====

```solidity
function isContract(address account) internal view
returns(bool)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| account | address |  | 

### sendValue

Replacement for Solidity's `transfer`: sends `amount` wei to
 `recipient`, forwarding all available gas and reverting on errors.
 https://eips.ethereum.org/EIPS/eip-1884[EIP1884] increases the gas cost
 of certain opcodes, possibly making contracts go over the 2300 gas limit
 imposed by `transfer`, making them unable to receive funds via
 `transfer`. {sendValue} removes this limitation.
 https://diligence.consensys.net/posts/2019/09/stop-using-soliditys-transfer-now/[Learn more].
 IMPORTANT: because control is transferred to `recipient`, care must be
 taken to not create reentrancy vulnerabilities. Consider using
 {ReentrancyGuard} or the
 https://solidity.readthedocs.io/en/v0.5.11/security-considerations.html#use-the-checks-effects-interactions-pattern[checks-effects-interactions pattern].

```solidity
function sendValue(address payable recipient, uint256 amount) internal nonpayable
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| recipient | address payable |  | 
| amount | uint256 |  | 

### functionCall

Performs a Solidity function call using a low level `call`. A
 plain `call` is an unsafe replacement for a function call: use this
 function instead.
 If `target` reverts with a revert reason, it is bubbled up by this
 function (like regular Solidity function calls).
 Returns the raw returned data. To convert to the expected return value,
 use https://solidity.readthedocs.io/en/latest/units-and-global-variables.html?highlight=abi.decode#abi-encoding-and-decoding-functions[`abi.decode`].
 Requirements:
 - `target` must be a contract.
 - calling `target` with `data` must not revert.
 _Available since v3.1._

```solidity
function functionCall(address target, bytes data) internal nonpayable
returns(bytes)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| target | address |  | 
| data | bytes |  | 

### functionCall

Same as {xref-Address-functionCall-address-bytes-}[`functionCall`], but with
 `errorMessage` as a fallback revert reason when `target` reverts.
 _Available since v3.1._

```solidity
function functionCall(address target, bytes data, string errorMessage) internal nonpayable
returns(bytes)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| target | address |  | 
| data | bytes |  | 
| errorMessage | string |  | 

### functionCallWithValue

Same as {xref-Address-functionCall-address-bytes-}[`functionCall`],
 but also transferring `value` wei to `target`.
 Requirements:
 - the calling contract must have an ETH balance of at least `value`.
 - the called Solidity function must be `payable`.
 _Available since v3.1._

```solidity
function functionCallWithValue(address target, bytes data, uint256 value) internal nonpayable
returns(bytes)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| target | address |  | 
| data | bytes |  | 
| value | uint256 |  | 

### functionCallWithValue

Same as {xref-Address-functionCallWithValue-address-bytes-uint256-}[`functionCallWithValue`], but
 with `errorMessage` as a fallback revert reason when `target` reverts.
 _Available since v3.1._

```solidity
function functionCallWithValue(address target, bytes data, uint256 value, string errorMessage) internal nonpayable
returns(bytes)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| target | address |  | 
| data | bytes |  | 
| value | uint256 |  | 
| errorMessage | string |  | 

### functionStaticCall

Same as {xref-Address-functionCall-address-bytes-}[`functionCall`],
 but performing a static call.
 _Available since v3.3._

```solidity
function functionStaticCall(address target, bytes data) internal view
returns(bytes)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| target | address |  | 
| data | bytes |  | 

### functionStaticCall

Same as {xref-Address-functionCall-address-bytes-string-}[`functionCall`],
 but performing a static call.
 _Available since v3.3._

```solidity
function functionStaticCall(address target, bytes data, string errorMessage) internal view
returns(bytes)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| target | address |  | 
| data | bytes |  | 
| errorMessage | string |  | 

### verifyCallResult

Tool to verifies that a low level call was successful, and revert if it wasn't, either by bubbling the
 revert reason using the provided one.
 _Available since v4.3._

```solidity
function verifyCallResult(bool success, bytes returndata, string errorMessage) internal pure
returns(bytes)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| success | bool |  | 
| returndata | bytes |  | 
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
