# IETSEnrichTarget

## Functions

### requestEnrichTarget

```solidity
function requestEnrichTarget(uint256 _targetId) external
```

Request enrichment for a Target using the hybrid ETS Enrich Target API.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _targetId | uint256 | Id of Target being enriched. |

### fulfillEnrichTarget

```solidity
function fulfillEnrichTarget(uint256 _targetId, string _ipfsHash, uint256 _httpStatus) external
```

Updates Target record with additional metadata stored behind IPFS hash.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _targetId | uint256 | Id of Target being enriched & updated. |
| _ipfsHash | string | IPFS hash with metadata related to the Target. |
| _httpStatus | uint256 | HTTP response code from off-chain ETS Enrich Target API. |

## Events

### RequestEnrichTarget

```solidity
event RequestEnrichTarget(uint256 targetId)
```

_emitted when Target enrichment is requested via requestEnrichTarget()._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| targetId | uint256 | Target record to enrich. |

