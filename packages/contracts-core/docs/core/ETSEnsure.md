# ETSEnsure

*Ethereum Tag Service &lt;security@ets.xyz&gt;*

> ETSEnsure target contract.



*Used by ETS to ensure targets using off-chain data.*

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

Variable storageETS access controls smart contract.




#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | contract ETSAccessControls | undefined |

### ets

```solidity
function ets() external view returns (contract ETS)
```

ETS access controls smart contract.




#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | contract ETS | undefined |

### fulfillEnsureTarget

```solidity
function fulfillEnsureTarget(uint256 _targetId, string _ipfsHash, uint256 _status) external nonpayable
```

Decorates target with additional metadata stored in IPFS hash. see requestEnsureTarget() TODO: 1) consider access restricting this? ie. not public function. 2) add another field for 200 status, but failed metadata collection.



#### Parameters

| Name | Type | Description |
|---|---|---|
| _targetId | uint256 | Unique id of target being ensured. |
| _ipfsHash | string | IPFS hash containing metadata related to the unique target. |
| _status | uint256 | HTTP response code from ETS Ensure Target API. |

### initialize

```solidity
function initialize(contract ETSAccessControls _accessControls, contract ETS _ets) external nonpayable
```

Initialization



#### Parameters

| Name | Type | Description |
|---|---|---|
| _accessControls | contract ETSAccessControls | undefined |
| _ets | contract ETS | undefined |

### platform

```solidity
function platform() external view returns (address payable)
```

ETS Platform account.




#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address payable | undefined |

### requestEnsureTarget

```solidity
function requestEnsureTarget(uint256 _targetId) external nonpayable
```

Ensure a target Id using the off chain ETS Ensure Target API.

*Emits a RequestEnsureTarget event with targetId to Openzeppelin Defender which is listening for event. When event is detected, OZ makes callout to ETS.targets(targetId) to collect targetType and targetURI. With these, OZ makes callout to ETS Ensure Target API which collects metadata for target, pins it to IPFS and returns pin to ETS blockchain via fulfillEnsureTarget()*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _targetId | uint256 | Unique id of target to be ensured. |

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



## Events

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

### RequestEnsureTarget

```solidity
event RequestEnsureTarget(uint256 targetId)
```

Events



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



