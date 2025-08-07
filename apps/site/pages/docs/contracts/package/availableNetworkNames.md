# availableNetworkNames

An array of all supported network names.

## Usage

```ts twoslash
import { availableNetworkNames } from '@ethereum-tag-service/contracts'

console.log(availableNetworkNames)
// @log: Output: ["basesepolia", "basesepolia", "hardhat"]
```

## Returns

`string[]`

Array of network name strings.

## Examples

```ts twoslash
import { availableNetworkNames } from '@ethereum-tag-service/contracts'

// Check if network name is supported
const isSupported = availableNetworkNames.includes('basesepolia');

// Iterate over network names
availableNetworkNames.forEach(name => {
  console.log(name)
})
// @log: Output: "basesepolia"
// @log: Output: "basesepolia"
// @log: Output: "hardhat"
```
