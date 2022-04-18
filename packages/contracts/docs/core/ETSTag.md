# ETSTag

*Ethereum Tag Service &lt;security@ets.xyz&gt;*

> ETSTag ERC-721 NFT contract

Contract that governs the creation of ETSTAG non-fungible tokens.

*UUPS upgradable.*

## Methods

### NAME

```solidity
function NAME() external view returns (string)
```

Public constants




#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | string | undefined |

### VERSION

```solidity
function VERSION() external view returns (string)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | string | undefined |

### accessControls

```solidity
function accessControls() external view returns (contract ETSAccessControls)
```

ETS access controls smart contract.




#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | contract ETSAccessControls | undefined |

### approve

```solidity
function approve(address to, uint256 tokenId) external nonpayable
```



*See {IERC721-approve}.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| to | address | undefined |
| tokenId | uint256 | undefined |

### balanceOf

```solidity
function balanceOf(address owner) external view returns (uint256)
```



*See {IERC721-balanceOf}.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| owner | address | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

### baseURI

```solidity
function baseURI() external view returns (string)
```

Variable storage




#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | string | undefined |

### burn

```solidity
function burn(uint256 tokenId) external nonpayable
```

Burns a given tokenId.

*Caller must have administrator role.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | Token Id to burn. |

### computeTagId

```solidity
function computeTagId(string _tag) external pure returns (uint256)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _tag | string | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

### getApproved

```solidity
function getApproved(uint256 tokenId) external view returns (address)
```



*See {IERC721-getApproved}.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |

### getCreatorAddress

```solidity
function getCreatorAddress(uint256 _tokenId) external view returns (address _creator)
```

Returns creator of a ETSTAG token.



#### Parameters

| Name | Type | Description |
|---|---|---|
| _tokenId | uint256 | ID of a ETSTAG. |

#### Returns

| Name | Type | Description |
|---|---|---|
| _creator | address | creator of the ETSTAG. |

### getPaymentAddresses

```solidity
function getPaymentAddresses(uint256 _tokenId) external view returns (address payable _platform, address payable _owner)
```

Returns the commission addresses related to a token.



#### Parameters

| Name | Type | Description |
|---|---|---|
| _tokenId | uint256 | ID of a ETSTAG. |

#### Returns

| Name | Type | Description |
|---|---|---|
| _platform | address payable | Platform commission address. |
| _owner | address payable | Address of the owner of the ETSTAG. |

### initialize

```solidity
function initialize(contract ETSAccessControls _accessControls, address payable _platform) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _accessControls | contract ETSAccessControls | undefined |
| _platform | address payable | undefined |

### isApprovedForAll

```solidity
function isApprovedForAll(address owner, address operator) external view returns (bool)
```



*See {IERC721-isApprovedForAll}.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| owner | address | undefined |
| operator | address | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | undefined |

### mint

```solidity
function mint(string _tag, address payable _publisher, address _creator) external payable returns (uint256 _tokenId)
```

Mint a new ETSTAG token.

*Tag string must pass validation and publisher must be whitelisted.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _tag | string | Tag string to mint - must include hashtag (#) at beginning of string. |
| _publisher | address payable | Address to be logged as publisher. |
| _creator | address | Address to be logged as creator. |

#### Returns

| Name | Type | Description |
|---|---|---|
| _tokenId | uint256 | for newly minted ETSTAG. |

### name

```solidity
function name() external view returns (string)
```



*See {IERC721Metadata-name}.*


#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | string | undefined |

### ownerOf

```solidity
function ownerOf(uint256 tokenId) external view returns (address)
```



*See {IERC721-ownerOf}.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |

### ownershipTermLength

```solidity
function ownershipTermLength() external view returns (uint256)
```

Term length in seconds that a ETSTAG is owned before it needs to be renewed.




#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

### pause

```solidity
function pause() external nonpayable
```



*Pause ETSTAG token contract.*


### paused

```solidity
function paused() external view returns (bool)
```



*Returns true if the contract is paused, and false otherwise.*


#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | undefined |

### platform

```solidity
function platform() external view returns (address payable)
```

ETS Platform account.




#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address payable | undefined |

### recycleTag

```solidity
function recycleTag(uint256 _tokenId) external nonpayable
```

Recycling an ETSTAG i.e. transferring ownership back to the platform due to stale ownership.

*Token must exist, be not already be owned by platform and time of TX must be greater than lastTransferTime.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _tokenId | uint256 | The id of the ETSTAG being recycled. |

### renewTag

```solidity
function renewTag(uint256 _tokenId) external nonpayable
```

Renews an ETSTAG by setting its last transfer time to current time.

*Can only be called by token owner.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _tokenId | uint256 | The identifier for etstag token. |

### safeTransferFrom

```solidity
function safeTransferFrom(address from, address to, uint256 tokenId) external nonpayable
```



*See {IERC721-safeTransferFrom}.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| from | address | undefined |
| to | address | undefined |
| tokenId | uint256 | undefined |

### safeTransferFrom

```solidity
function safeTransferFrom(address from, address to, uint256 tokenId, bytes _data) external nonpayable
```



*See {IERC721-safeTransferFrom}.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| from | address | undefined |
| to | address | undefined |
| tokenId | uint256 | undefined |
| _data | bytes | undefined |

### setApprovalForAll

```solidity
function setApprovalForAll(address operator, bool approved) external nonpayable
```



*See {IERC721-setApprovalForAll}.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| operator | address | undefined |
| approved | bool | undefined |

### supportsInterface

```solidity
function supportsInterface(bytes4 interfaceId) external view returns (bool)
```



*See {IERC165-supportsInterface}.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| interfaceId | bytes4 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | undefined |

### symbol

```solidity
function symbol() external view returns (string)
```



*See {IERC721Metadata-symbol}.*


#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | string | undefined |

### tagExists

```solidity
function tagExists(string _tag) external view returns (bool)
```

Existence check by string tag primary key



#### Parameters

| Name | Type | Description |
|---|---|---|
| _tag | string | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | undefined |

### tagExists

```solidity
function tagExists(uint256 _tokenId) external view returns (bool)
```

Existence check on a ETSTAG token.



#### Parameters

| Name | Type | Description |
|---|---|---|
| _tokenId | uint256 | token ID. |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | true if exists. |

### tagMaxStringLength

```solidity
function tagMaxStringLength() external view returns (uint256)
```

maximum ETSTAG string length.




#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

### tagMinStringLength

```solidity
function tagMinStringLength() external view returns (uint256)
```

minimum ETSTAG string length.




#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

### tokenIdToLastTransferTime

```solidity
function tokenIdToLastTransferTime(uint256) external view returns (uint256)
```

Last time a ETSTAG was transfered.



#### Parameters

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

### tokenIdToTag

```solidity
function tokenIdToTag(uint256) external view returns (address originalPublisher, address creator, string displayVersion)
```

Map of ETSTAG id to ETSTAG record.



#### Parameters

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| originalPublisher | address | undefined |
| creator | address | undefined |
| displayVersion | string | undefined |

### tokenPointer

```solidity
function tokenPointer() external view returns (uint256)
```

Sequential integer counter for ETSTAG Id and total count.




#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

### tokenURI

```solidity
function tokenURI(uint256 tokenId) external view returns (string)
```



*See {IERC721Metadata-tokenURI}.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | string | undefined |

### transferFrom

```solidity
function transferFrom(address from, address to, uint256 tokenId) external nonpayable
```



*See {IERC721-transferFrom}.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| from | address | undefined |
| to | address | undefined |
| tokenId | uint256 | undefined |

### unPause

```solidity
function unPause() external nonpayable
```



*Unpause ETSTAG token contract.*


### updateAccessControls

```solidity
function updateAccessControls(contract ETSAccessControls _accessControls) external nonpayable
```

Admin functionality for updating the access controls.



#### Parameters

| Name | Type | Description |
|---|---|---|
| _accessControls | contract ETSAccessControls | Address of the access controls contract. |

### updateBaseURI

```solidity
function updateBaseURI(string newBaseURI) external nonpayable
```



*Set base metadata api url.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| newBaseURI | string | base url |

### updateOwnershipTermLength

```solidity
function updateOwnershipTermLength(uint256 _ownershipTermLength) external nonpayable
```

Admin method for updating the ownership term length for all ETSTAG tokens.



#### Parameters

| Name | Type | Description |
|---|---|---|
| _ownershipTermLength | uint256 | New length in unix epoch seconds. |

### updatePlatform

```solidity
function updatePlatform(address payable _platform) external nonpayable
```

Admin method for updating the address that receives the commission on behalf of the platform.



#### Parameters

| Name | Type | Description |
|---|---|---|
| _platform | address payable | Address that receives minted NFTs. |

### updateTagMaxStringLength

```solidity
function updateTagMaxStringLength(uint256 _tagMaxStringLength) external nonpayable
```

Admin method for updating the max string length of an ETSTAG.



#### Parameters

| Name | Type | Description |
|---|---|---|
| _tagMaxStringLength | uint256 | max length. |

### upgradeTo

```solidity
function upgradeTo(address newImplementation) external nonpayable
```



*Upgrade the implementation of the proxy to `newImplementation`. Calls {_authorizeUpgrade}. Emits an {Upgraded} event.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| newImplementation | address | undefined |

### upgradeToAndCall

```solidity
function upgradeToAndCall(address newImplementation, bytes data) external payable
```



*Upgrade the implementation of the proxy to `newImplementation`, and subsequently execute the function call encoded in `data`. Calls {_authorizeUpgrade}. Emits an {Upgraded} event.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| newImplementation | address | undefined |
| data | bytes | undefined |

### version

```solidity
function version() external pure returns (string)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | string | undefined |



## Events

### AccessControlsUpdated

```solidity
event AccessControlsUpdated(contract ETSAccessControls previousAccessControls, contract ETSAccessControls newAccessControls)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| previousAccessControls  | contract ETSAccessControls | undefined |
| newAccessControls  | contract ETSAccessControls | undefined |

### AdminChanged

```solidity
event AdminChanged(address previousAdmin, address newAdmin)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| previousAdmin  | address | undefined |
| newAdmin  | address | undefined |

### Approval

```solidity
event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| owner `indexed` | address | undefined |
| approved `indexed` | address | undefined |
| tokenId `indexed` | uint256 | undefined |

### ApprovalForAll

```solidity
event ApprovalForAll(address indexed owner, address indexed operator, bool approved)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| owner `indexed` | address | undefined |
| operator `indexed` | address | undefined |
| approved  | bool | undefined |

### BeaconUpgraded

```solidity
event BeaconUpgraded(address indexed beacon)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| beacon `indexed` | address | undefined |

### MintTag

```solidity
event MintTag(uint256 indexed tokenId, string displayVersion, address indexed publisher, address creator)
```

Events



#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId `indexed` | uint256 | undefined |
| displayVersion  | string | undefined |
| publisher `indexed` | address | undefined |
| creator  | address | undefined |

### NewBaseURI

```solidity
event NewBaseURI(string baseURI)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| baseURI  | string | undefined |

### OwnershipTermLengthUpdated

```solidity
event OwnershipTermLengthUpdated(uint256 originalOwnershipLength, uint256 updatedOwnershipLength)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| originalOwnershipLength  | uint256 | undefined |
| updatedOwnershipLength  | uint256 | undefined |

### Paused

```solidity
event Paused(address account)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| account  | address | undefined |

### PlatformSet

```solidity
event PlatformSet(address previousPlatformAddress, address newPlatformAddress)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| previousPlatformAddress  | address | undefined |
| newPlatformAddress  | address | undefined |

### RenewalPeriodUpdated

```solidity
event RenewalPeriodUpdated(uint256 originalRenewalPeriod, uint256 updatedRenewalPeriod)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| originalRenewalPeriod  | uint256 | undefined |
| updatedRenewalPeriod  | uint256 | undefined |

### TagBurned

```solidity
event TagBurned(uint256 indexed tokenId)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId `indexed` | uint256 | undefined |

### TagMaxStringLengthUpdated

```solidity
event TagMaxStringLengthUpdated(uint256 previousMaxStringLength, uint256 newMaxStringLength)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| previousMaxStringLength  | uint256 | undefined |
| newMaxStringLength  | uint256 | undefined |

### TagRecycled

```solidity
event TagRecycled(uint256 indexed tokenId, address indexed owner)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId `indexed` | uint256 | undefined |
| owner `indexed` | address | undefined |

### TagRenewed

```solidity
event TagRenewed(uint256 indexed tokenId, address indexed caller)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId `indexed` | uint256 | undefined |
| caller `indexed` | address | undefined |

### Transfer

```solidity
event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| from `indexed` | address | undefined |
| to `indexed` | address | undefined |
| tokenId `indexed` | uint256 | undefined |

### Unpaused

```solidity
event Unpaused(address account)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| account  | address | undefined |

### Upgraded

```solidity
event Upgraded(address indexed implementation)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| implementation `indexed` | address | undefined |



