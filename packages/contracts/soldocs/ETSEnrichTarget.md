# ETSEnrichTarget

## Functions

### constructor

```solidity
constructor() public
```

### initialize

```solidity
function initialize(contract IETSAccessControls _etsAccessControls, contract IETSTarget _etsTarget) public
```

### _authorizeUpgrade

```solidity
function _authorizeUpgrade(address) internal
```

### requestEnrichTarget

```solidity
function requestEnrichTarget(uint256 _targetId) public
```

Request enrichment for a Target using the hybrid ETS Enrich Target API.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _targetId | uint256 | Id of Target being enriched. |

### fulfillEnrichTarget

```solidity
function fulfillEnrichTarget(uint256 _targetId, string _ipfsHash, uint256 _httpStatus) public
```

Updates Target record with additional metadata stored behind IPFS hash.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _targetId | uint256 | Id of Target being enriched & updated. |
| _ipfsHash | string | IPFS hash with metadata related to the Target. |
| _httpStatus | uint256 | HTTP response code from off-chain ETS Enrich Target API. |

