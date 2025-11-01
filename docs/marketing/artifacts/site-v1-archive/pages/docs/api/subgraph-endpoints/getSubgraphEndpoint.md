# getSubgraphEndpoint

Returns the appropriate subgraph endpoint URL for a given chain ID. This method maps blockchain network identifiers to their corresponding Graph Protocol endpoints.

## Usage

```ts twoslash
import { getSubgraphEndpoint } from '@ethereum-tag-service/subgraph-endpoints'

const endpoint = getSubgraphEndpoint(84532)
// @log: Output: "https://api.studio.thegraph.com/query/87165/ets-base-sepolia/version/latest"
```

## Returns

`string`

The subgraph endpoint URL for the specified chain.

## Parameters

### chainId

- **Type:** `number`
- **Description:** Numerical identifier for the blockchain network

## Examples

```ts twoslash
import { getSubgraphEndpoint } from '@ethereum-tag-service/subgraph-endpoints'

// Local development
const localEndpoint = getSubgraphEndpoint(31337) // [!code focus]
// @log: Output: "http://localhost:8000/subgraphs/name/ets-local"

// Base Sepolia
const baseEndpoint = getSubgraphEndpoint(84532) // [!code focus]
// @log: Output: "https://api.studio.thegraph.com/query/87165/ets-base-sepolia/version/latest"
```

## Throws

Throws an error if no endpoint is found for the provided chainId.
