# ETS

*Ethereum Tag Service &lt;security@ets.xyz&gt;*

> ETS Core

Core tagging contract that enables any online target to be tagged with an ETSTAG token.

*ETS Core utilizes Open Zeppelin UUPS upgradability pattern.*

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



*ETS access controls contract.*


#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | contract ETSAccessControls | undefined |

### accrued

```solidity
function accrued(address) external view returns (uint256)
```



*Map for holding amount accrued to participant address wallets.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

### computeTaggingRecordId

```solidity
function computeTaggingRecordId(uint256 _targetId, address _publisher, address _tagger, address _sponsor) external pure returns (uint256 taggingRecordId)
```

Deterministically compute the tagging record identifier



#### Parameters

| Name | Type | Description |
|---|---|---|
| _targetId | uint256 | undefined |
| _publisher | address | undefined |
| _tagger | address | undefined |
| _sponsor | address | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| taggingRecordId | uint256 | undefined |

### computeTargetId

```solidity
function computeTargetId(string _targetType, string _targetURI) external pure returns (uint256 targetId)
```

Internal



#### Parameters

| Name | Type | Description |
|---|---|---|
| _targetType | string | undefined |
| _targetURI | string | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| targetId | uint256 | undefined |

### drawDown

```solidity
function drawDown(address payable _account) external nonpayable
```

Enables anyone to send ETH accrued by an account.

*Can be called by the account owner or on behalf of someone.Does nothing when there is nothing due to the account.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _account | address payable | Target address that has had accrued ETH and which will receive the ETH. |

### etsEnsure

```solidity
function etsEnsure() external view returns (contract ETSEnsure)
```



*ETSEnsure target contract.*


#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | contract ETSEnsure | undefined |

### etsTag

```solidity
function etsTag() external view returns (contract ETSTag)
```



*ETSTAG erc-721 token contract.*


#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | contract ETSTag | undefined |

### getOrCreateTag

```solidity
function getOrCreateTag(string _tagString, address payable _publisher, address _tagger) external payable returns (uint256 tagId)
```

Fetch an etstagId from tag string.

*Looks in tagToTokenId map and returns if ETSTag is found for tag string Otherwise mints a new ETSTag and returns id.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _tagString | string | tag string for ETSTag we are looking up. |
| _publisher | address payable | publisher address, to attribute new ETSTag to if one s minted |
| _tagger | address | tagger address, to attribute new ETSTag to if one s minted |

#### Returns

| Name | Type | Description |
|---|---|---|
| tagId | uint256 | Id of ETSTag token. |

### getTaggingRecord

```solidity
function getTaggingRecord(uint256 _targetId, address _tagger, address _publisher, address _sponsor) external view returns (uint256[] etsTagIds, uint256 targetId, address tagger, address publisher, address sponsor)
```

Get tagging record from composite key parts



#### Parameters

| Name | Type | Description |
|---|---|---|
| _targetId | uint256 | undefined |
| _tagger | address | undefined |
| _publisher | address | undefined |
| _sponsor | address | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| etsTagIds | uint256[] | undefined |
| targetId | uint256 | undefined |
| tagger | address | undefined |
| publisher | address | undefined |
| sponsor | address | undefined |

### getTaggingRecordFromId

```solidity
function getTaggingRecordFromId(uint256 _id) external view returns (uint256[] etsTagIds, uint256 targetId, address tagger, address publisher, address sponsor)
```



*Retrieves a tagging record from tagging record ID*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _id | uint256 | ID of the tagging record. |

#### Returns

| Name | Type | Description |
|---|---|---|
| etsTagIds | uint256[] | token ID of ETSTAG used. |
| targetId | uint256 | Id of tagging target. |
| tagger | address | Address that tagged the NFT asset. |
| publisher | address | Publisher through which the tag took place. |
| sponsor | address | Address that paid for the transaction fee |

### initialize

```solidity
function initialize(contract ETSAccessControls _accessControls, contract ETSTag _etsTag) external nonpayable
```



*Replaces contructor function for UUPS Proxy contracts. Called upon first deployment.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _accessControls | contract ETSAccessControls | undefined |
| _etsTag | contract ETSTag | undefined |

### isTargetEnsured

```solidity
function isTargetEnsured(uint256 _targetId) external view returns (bool)
```

External read



#### Parameters

| Name | Type | Description |
|---|---|---|
| _targetId | uint256 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | undefined |

### modulo

```solidity
function modulo() external view returns (uint256)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

### paid

```solidity
function paid(address) external view returns (uint256)
```



*Map for holding lifetime amount drawn down from accrued by participants.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

### platformPercentage

```solidity
function platformPercentage() external view returns (uint256)
```



*Percentage of tagging fee allocated to ETS.*


#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

### publisherPercentage

```solidity
function publisherPercentage() external view returns (uint256)
```



*Percentage of tagging fee allocated to Publisher.*


#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

### remainingPercentage

```solidity
function remainingPercentage() external view returns (uint256)
```



*Percentage of tagging fee allocated to Creator or Owner.*


#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

### tagTarget

```solidity
function tagTarget(string[] _tags, string _targetURI, address payable _publisher, address _tagger, address _sponsor, bool _ensure) external payable
```

Tag a target with an tag string.



#### Parameters

| Name | Type | Description |
|---|---|---|
| _tags | string[] | Strings target is being tagged with. |
| _targetURI | string | Uniform resource identifier of the target being tagged. |
| _publisher | address payable | Address of publisher enabling the tagging record. |
| _tagger | address | Address of tagger being credited performing tagging record. |
| _sponsor | address | undefined |
| _ensure | bool | Boolean flag, set true to ensure the target at time of tagging. |

### taggingCounter

```solidity
function taggingCounter() external view returns (uint256)
```



*Incremental tagging record counter. Used for tagging record ID.*


#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

### taggingFee

```solidity
function taggingFee() external view returns (uint256)
```



*Fee in ETH Collected by ETS for tagging.*


#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

### taggingRecords

```solidity
function taggingRecords(uint256) external view returns (uint256 targetId, address tagger, address publisher, address sponsor)
```



*Map of tagging id to tagging record.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| targetId | uint256 | undefined |
| tagger | address | undefined |
| publisher | address | undefined |
| sponsor | address | undefined |

### targetExists

```solidity
function targetExists(string _targetType, string _targetURI) external view returns (bool)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _targetType | string | undefined |
| _targetURI | string | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | undefined |

### targetExistsFromId

```solidity
function targetExistsFromId(uint256 _targetId) external view returns (bool)
```

check for existence of target.



#### Parameters

| Name | Type | Description |
|---|---|---|
| _targetId | uint256 | token ID. |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | true if exists. |

### targets

```solidity
function targets(uint256) external view returns (string targetType, string targetURI, uint256 created, uint256 lastEnsured, uint256 status, string ipfsHash)
```



*Map of target id to Target embodied by Target struct.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| targetType | string | undefined |
| targetURI | string | undefined |
| created | uint256 | undefined |
| lastEnsured | uint256 | undefined |
| status | uint256 | undefined |
| ipfsHash | string | undefined |

### totalDue

```solidity
function totalDue(address _account) external view returns (uint256 _due)
```

Used to check how much ETH has been accrued by an address factoring in amount paid out.



#### Parameters

| Name | Type | Description |
|---|---|---|
| _account | address | Address of the account being queried. |

#### Returns

| Name | Type | Description |
|---|---|---|
| _due | uint256 | Amount of WEI in ETH due to account. |

### updateAccessControls

```solidity
function updateAccessControls(contract ETSAccessControls _accessControls) external nonpayable
```

Admin functionality for updating the access controls.



#### Parameters

| Name | Type | Description |
|---|---|---|
| _accessControls | contract ETSAccessControls | Address of the access controls contract. |

### updateETSEnsure

```solidity
function updateETSEnsure(contract ETSEnsure _etsEnsure) external nonpayable
```

Admin functionality for updating the ETSEnsure contract address.



#### Parameters

| Name | Type | Description |
|---|---|---|
| _etsEnsure | contract ETSEnsure | Address of the ETSEnsure contract. |

### updatePercentages

```solidity
function updatePercentages(uint256 _platformPercentage, uint256 _publisherPercentage) external nonpayable
```

Admin functionality for updating the percentages.



#### Parameters

| Name | Type | Description |
|---|---|---|
| _platformPercentage | uint256 | percentage for platform. |
| _publisherPercentage | uint256 | percentage for publisher. |

### updateTaggingFee

```solidity
function updateTaggingFee(uint256 _fee) external nonpayable
```

Sets the fee required to tag an NFT asset.



#### Parameters

| Name | Type | Description |
|---|---|---|
| _fee | uint256 | Value of the fee in WEI. |

### updateTaggingRecord

```solidity
function updateTaggingRecord(uint256 _taggingRecordId, string[] _tags) external payable
```

Allow either a tagger or a sponsor to update the tags for a tagging record pointing to a target Append or replace



#### Parameters

| Name | Type | Description |
|---|---|---|
| _taggingRecordId | uint256 | undefined |
| _tags | string[] | undefined |

### updateTarget

```solidity
function updateTarget(uint256 _targetId, string _targetType, string _targetURI, uint256 _lastEnsured, uint256 _status, string _ipfsHash) external nonpayable returns (bool success)
```

Updates a target with new values.



#### Parameters

| Name | Type | Description |
|---|---|---|
| _targetId | uint256 | undefined |
| _targetType | string | undefined |
| _targetURI | string | undefined |
| _lastEnsured | uint256 | undefined |
| _status | uint256 | undefined |
| _ipfsHash | string | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| success | bool | boolean |

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
event AccessControlsUpdated(address previousAccessControls, address newAccessControls)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| previousAccessControls  | address | undefined |
| newAccessControls  | address | undefined |

### AdminChanged

```solidity
event AdminChanged(address previousAdmin, address newAdmin)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| previousAdmin  | address | undefined |
| newAdmin  | address | undefined |

### BeaconUpgraded

```solidity
event BeaconUpgraded(address indexed beacon)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| beacon `indexed` | address | undefined |

### ETSEnsureUpdated

```solidity
event ETSEnsureUpdated(address previousETSEnsure, address newETSEnsure)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| previousETSEnsure  | address | undefined |
| newETSEnsure  | address | undefined |

### FundsWithdrawn

```solidity
event FundsWithdrawn(address indexed who, uint256 amount)
```

Events



#### Parameters

| Name | Type | Description |
|---|---|---|
| who `indexed` | address | undefined |
| amount  | uint256 | undefined |

### PercentagesSet

```solidity
event PercentagesSet(uint256 platformPercentage, uint256 publisherPercentage, uint256 remainingPercentage)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| platformPercentage  | uint256 | undefined |
| publisherPercentage  | uint256 | undefined |
| remainingPercentage  | uint256 | undefined |

### RequestEnsureTarget

```solidity
event RequestEnsureTarget(uint256 targetId)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| targetId  | uint256 | undefined |

### TaggingFeeSet

```solidity
event TaggingFeeSet(uint256 previousFee, uint256 taggingFee)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| previousFee  | uint256 | undefined |
| taggingFee  | uint256 | undefined |

### TaggingRecordUpdated

```solidity
event TaggingRecordUpdated(uint256 taggingRecordId)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| taggingRecordId  | uint256 | undefined |

### TargetCreated

```solidity
event TargetCreated(uint256 targetId)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| targetId  | uint256 | undefined |

### TargetTagged

```solidity
event TargetTagged(uint256 taggingRecordId)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| taggingRecordId  | uint256 | undefined |

### TargetTypeSet

```solidity
event TargetTypeSet(string typeName, bool setting)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| typeName  | string | undefined |
| setting  | bool | undefined |

### TargetUpdated

```solidity
event TargetUpdated(uint256 targetId)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| targetId  | uint256 | undefined |

### Upgraded

```solidity
event Upgraded(address indexed implementation)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| implementation `indexed` | address | undefined |



