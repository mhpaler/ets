# IERC721.sol

View Source: [@openzeppelin/contracts/token/ERC721/IERC721.sol](https://github.com/OpenZeppelin/openzeppelin-contracts/tree/master/contracts/token/ERC721/IERC721.sol)

**↗ Extends: [IERC165](IERC165.md)**
**↘ Derived Contracts: [ERC721](ERC721.md), [IERC721Metadata](IERC721Metadata.md)**

**IERC721**

Required interface of an ERC721 compliant contract.

## Events

```solidity
event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId);
event ApprovalForAll(address indexed owner, address indexed operator, bool  approved);
```

## Functions

- [balanceOf](#balanceof)
- [ownerOf](#ownerof)
- [safeTransferFrom](#safetransferfrom)
- [safeTransferFrom](#safetransferfrom)
- [transferFrom](#transferfrom)
- [approve](#approve)
- [setApprovalForAll](#setapprovalforall)
- [getApproved](#getapproved)
- [isApprovedForAll](#isapprovedforall)

### balanceOf

Returns the number of tokens in ``owner``'s account.

```solidity
function balanceOf(address owner) external view
returns(balance uint256)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| owner | address |  | 

### ownerOf

Returns the owner of the `tokenId` token.
 Requirements:
 - `tokenId` must exist.

```solidity
function ownerOf(uint256 tokenId) external view
returns(owner address)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| tokenId | uint256 |  | 

### safeTransferFrom

Safely transfers `tokenId` token from `from` to `to`.
 Requirements:
 - `from` cannot be the zero address.
 - `to` cannot be the zero address.
 - `tokenId` token must exist and be owned by `from`.
 - If the caller is not `from`, it must be approved to move this token by either {approve} or {setApprovalForAll}.
 - If `to` refers to a smart contract, it must implement {IERC721Receiver-onERC721Received}, which is called upon a safe transfer.
 Emits a {Transfer} event.

```solidity
function safeTransferFrom(address from, address to, uint256 tokenId, bytes data) external nonpayable
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| from | address |  | 
| to | address |  | 
| tokenId | uint256 |  | 
| data | bytes |  | 

### safeTransferFrom

Safely transfers `tokenId` token from `from` to `to`, checking first that contract recipients
 are aware of the ERC721 protocol to prevent tokens from being forever locked.
 Requirements:
 - `from` cannot be the zero address.
 - `to` cannot be the zero address.
 - `tokenId` token must exist and be owned by `from`.
 - If the caller is not `from`, it must be have been allowed to move this token by either {approve} or {setApprovalForAll}.
 - If `to` refers to a smart contract, it must implement {IERC721Receiver-onERC721Received}, which is called upon a safe transfer.
 Emits a {Transfer} event.

```solidity
function safeTransferFrom(address from, address to, uint256 tokenId) external nonpayable
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| from | address |  | 
| to | address |  | 
| tokenId | uint256 |  | 

### transferFrom

Transfers `tokenId` token from `from` to `to`.
 WARNING: Usage of this method is discouraged, use {safeTransferFrom} whenever possible.
 Requirements:
 - `from` cannot be the zero address.
 - `to` cannot be the zero address.
 - `tokenId` token must be owned by `from`.
 - If the caller is not `from`, it must be approved to move this token by either {approve} or {setApprovalForAll}.
 Emits a {Transfer} event.

```solidity
function transferFrom(address from, address to, uint256 tokenId) external nonpayable
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| from | address |  | 
| to | address |  | 
| tokenId | uint256 |  | 

### approve

Gives permission to `to` to transfer `tokenId` token to another account.
 The approval is cleared when the token is transferred.
 Only a single account can be approved at a time, so approving the zero address clears previous approvals.
 Requirements:
 - The caller must own the token or be an approved operator.
 - `tokenId` must exist.
 Emits an {Approval} event.

```solidity
function approve(address to, uint256 tokenId) external nonpayable
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| to | address |  | 
| tokenId | uint256 |  | 

### setApprovalForAll

Approve or remove `operator` as an operator for the caller.
 Operators can call {transferFrom} or {safeTransferFrom} for any token owned by the caller.
 Requirements:
 - The `operator` cannot be the caller.
 Emits an {ApprovalForAll} event.

```solidity
function setApprovalForAll(address operator, bool _approved) external nonpayable
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| operator | address |  | 
| _approved | bool |  | 

### getApproved

Returns the account approved for `tokenId` token.
 Requirements:
 - `tokenId` must exist.

```solidity
function getApproved(uint256 tokenId) external view
returns(operator address)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| tokenId | uint256 |  | 

### isApprovedForAll

Returns if the `operator` is allowed to manage all of the assets of `owner`.
 See {setApprovalForAll}

```solidity
function isApprovedForAll(address owner, address operator) external view
returns(bool)
```

**Arguments**

| Name        | Type           | Description  |
| ------------- |------------- | -----|
| owner | address |  | 
| operator | address |  | 

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
