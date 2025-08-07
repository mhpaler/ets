# networkNames

A mapping of chain IDs to their corresponding network name strings.

## Usage

```ts twoslash
import { networkNames } from '@ethereum-tag-service/contracts'

const name = networkNames['84532']
console.log(name)
// @log: Output: "basesepolia"
```

## Returns

`{ [K in SupportedChainId]: string }`

An object mapping chain IDs to network names.

## Properties

### Chain ID Keys

- **Type:** `SupportedChainId`
- **Values:**
  - `"84532"`: "basesepolia"
  - `"84532"`: "basesepolia"
  - `"31337"`: "hardhat"

## Examples

```ts twoslash
import { networkNames } from '@ethereum-tag-service/contracts'

// Get network name for Arbitrum Sepolia
const baseName = networkNames['84532']
console.log(baseName)
// @log: Output: "basesepolia"

// Get network name for Base Sepolia
const baseName = networkNames['84532']
console.log(baseName)
// @log: Output: "basesepolia"
```
