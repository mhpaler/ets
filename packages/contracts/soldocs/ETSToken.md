# ETSToken

## Functions

### constructor

```solidity
constructor() public
```

### initialize

```solidity
function initialize(contract IETSAccessControls _etsAccessControls, uint256 _tagMinStringLength, uint256 _tagMaxStringLength, uint256 _ownershipTermLength) public
```

### _authorizeUpgrade

```solidity
function _authorizeUpgrade(address) internal
```

### setETSCore

```solidity
function setETSCore(contract IETS _ets) public
```

Sets ETS core on the ETSToken contract so functions can be
restricted to ETS platform only.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _ets | contract IETS | Address of ETS contract. |

### setAccessControls

```solidity
function setAccessControls(contract IETSAccessControls _accessControls) public
```

Sets ETSAccessControls on the ETSToken contract function calls can be
restricted to ETS platform only. Note: Caller of this function must be deployer
or pre-set as admin of new contract.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _accessControls | contract IETSAccessControls | Address of ETSAccessControls contract. |

### pause

```solidity
function pause() public
```

Pauses ETSToken contract.

### unPause

```solidity
function unPause() public
```

Unpauses ETSToken contract.

### burn

```solidity
function burn(uint256 tokenId) public
```

_Burns `tokenId`. See {ERC721-_burn}.

Requirements:

- The caller must own `tokenId` or be an approved operator._

### setTagMaxStringLength

```solidity
function setTagMaxStringLength(uint256 _tagMaxStringLength) public
```

admin function to set maximum character length of CTAG display string.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _tagMaxStringLength | uint256 | maximum character length of string. |

### setTagMinStringLength

```solidity
function setTagMinStringLength(uint256 _tagMinStringLength) public
```

Admin function to set minimum  character length of CTAG display string.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _tagMinStringLength | uint256 | minimum character length of string. |

### setOwnershipTermLength

```solidity
function setOwnershipTermLength(uint256 _ownershipTermLength) public
```

Admin function to set the ownership term length of a CTAG is set.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _ownershipTermLength | uint256 | Ownership term length in days. |

### preSetPremiumTags

```solidity
function preSetPremiumTags(string[] _tags, bool _enabled) public
```

Admin function to flag/unflag tag string(s) as premium prior to minting.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _tags | string[] | Array of tag strings. |
| _enabled | bool |  |

### setPremiumFlag

```solidity
function setPremiumFlag(uint256[] _tokenIds, bool _isPremium) public
```

Admin function to flag/unflag CTAG(s) as premium.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _tokenIds | uint256[] | Array of CTAG Ids. |
| _isPremium | bool | Boolean true for premium, false for not premium. |

### setReservedFlag

```solidity
function setReservedFlag(uint256[] _tokenIds, bool _reserved) public
```

Admin function to flag/unflag CTAG(s) as reserved.

Tags flagged as reserved cannot be auctioned.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _tokenIds | uint256[] | Array of CTAG Ids. |
| _reserved | bool | Boolean true for reserved, false for not reserved. |

### getOrCreateTag

```solidity
function getOrCreateTag(string _tag, address payable _relayer, address payable _creator) public payable returns (struct IETSToken.Tag tag)
```

### getOrCreateTagId

```solidity
function getOrCreateTagId(string _tag, address payable _relayer, address payable _creator) public payable returns (uint256 tokenId)
```

Get CTAG token Id from tag string.

Combo function that accepts a tag string and returns it's CTAG token Id if it exists,
or creates a new CTAG and returns corresponding Id.

Only ETS Core can call this function.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _tag | string | Tag string. |
| _relayer | address payable | Address of Relayer contract calling ETS Core. |
| _creator | address payable | Address credited with creating CTAG. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId | uint256 | Id of CTAG token. |

### createTag

```solidity
function createTag(string _tag, address payable _relayer, address payable _creator) public payable returns (uint256 _tokenId)
```

Create CTAG token from tag string.

Reverts if tag exists or is invalid.

Only ETS Core can call this function.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _tag | string | Tag string. |
| _relayer | address payable |  |
| _creator | address payable | Address credited with creating CTAG. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| _tokenId | uint256 |  |

### renewTag

```solidity
function renewTag(uint256 _tokenId) public
```

Renews ownership term of a CTAG.

A "CTAG ownership term" is utilized to prevent CTAGs from being abandoned or inaccessable
due to lost private keys.

Any wallet address may renew the term of a CTAG for an owner. When renewed, the term
is extended from the current block timestamp plus the ownershipTermLength public variable.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _tokenId | uint256 | Id of CTAG token. |

### recycleTag

```solidity
function recycleTag(uint256 _tokenId) public
```

Recycles a CTAG back to ETS.

When ownership term of a CTAG has expired, any wallet or contract may call this function
to recycle the tag back to ETS. Once recycled, a tag may be auctioned again.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _tokenId | uint256 | Id of CTAG token. |

### supportsInterface

```solidity
function supportsInterface(bytes4 interfaceId) public view virtual returns (bool)
```

### computeTagId

```solidity
function computeTagId(string _tag) public pure returns (uint256)
```

Function to deterministically compute & return a CTAG token Id.

Every CTAG token and it's associated data struct is mapped to by it's token Id. This Id is computed
from the "display" tag string lowercased, hashed and cast as an unsigned integer.

Note: Function does not verify if CTAG record exists.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _tag | string | Tag string. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | Id of potential CTAG token id. |

### tagExistsByString

```solidity
function tagExistsByString(string _tag) public view returns (bool)
```

Check that a CTAG token exists for a given tag string.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _tag | string | Tag string. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bool | true if CTAG token exists; false if not. |

### tagExistsById

```solidity
function tagExistsById(uint256 _tokenId) public view returns (bool)
```

Check that CTAG token exists for a given computed token Id.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _tokenId | uint256 | Token Id uint computed from tag string via computeTargetId(). |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bool | true if CTAG token exists; false if not. |

### tagOwnershipTermExpired

```solidity
function tagOwnershipTermExpired(uint256 _tokenId) public view returns (bool)
```

Check if CTAG token ownership term has expired.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _tokenId | uint256 | Token Id uint computed from tag string via computeTargetId(). |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bool | true if CTAG ownership term has expired; false if not. |

### getTagByString

```solidity
function getTagByString(string _tag) public view returns (struct IETSToken.Tag)
```

Retrieve a CTAG record for a given tag string.

Note: returns a struct with empty members when no CTAG exists.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _tag | string | Tag string. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | struct IETSToken.Tag | CTAG record as Tag struct. |

### getTagById

```solidity
function getTagById(uint256 _tokenId) public view returns (struct IETSToken.Tag)
```

Retrieve a CTAG record for a given token Id.

Note: returns a struct with empty members when no CTAG exists.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _tokenId | uint256 | CTAG token Id. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | struct IETSToken.Tag | CTAG record as Tag struct. |

### getOwnershipTermLength

```solidity
function getOwnershipTermLength() public view returns (uint256)
```

Retrieve CTAG ownership term length global setting.

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | Term length in days. |

### getLastRenewed

```solidity
function getLastRenewed(uint256 _tokenId) public view returns (uint256)
```

Retrieve last renewal block timestamp for a CTAG.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _tokenId | uint256 | CTAG token Id. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | Block timestamp. |

### getPlatformAddress

```solidity
function getPlatformAddress() public view returns (address payable)
```

Retrieve wallet address for ETS Platform.

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | address payable | wallet address for ETS Platform. |

### getCreatorAddress

```solidity
function getCreatorAddress(uint256 _tokenId) public view returns (address)
```

Retrieve Creator address for a CTAG token.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _tokenId | uint256 | CTAG token Id. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | address | _creator Creator address of the CTAG. |

### _beforeTokenTransfer

```solidity
function _beforeTokenTransfer(address from, address to, uint256 firstTokenId, uint256 batchSize) internal
```

### _afterTokenTransfer

```solidity
function _afterTokenTransfer(address from, address to, uint256 tokenId, uint256 batchSize) internal virtual
```

_See {ERC721-_afterTokenTransfer}. Contract must not be paused._

### _setLastRenewed

```solidity
function _setLastRenewed(uint256 _tokenId, uint256 _timestamp) internal
```

