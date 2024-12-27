# chains

A configuration object that maps chain IDs to their corresponding Viem Chain configuration objects.

## Usage

```ts twoslash
import { chains } from '@ethereum-tag-service/contracts'

const arbitrumSepoliaChain = chains['421614']
// @log: Output: Returns the Viem Chain object for Arbitrum Sepolia
```

## Returns

`MultiChainConfig`

An object containing chain configurations indexed by chain ID.

## Properties

### Chain IDs

- **Type:** `"421614" | "84532" | "31337"`
- **Description:** Supported network chain IDs

Available chains:

- `421614` (arbitrumSepolia)
- `84532` (baseSepolia)
- `31337` (hardhat)

## Examples

```ts twoslash
import { chains } from '@ethereum-tag-service/contracts'

// Access Arbitrum Sepolia chain config
const arbitrumChain = chains['421614']

// Access Base Sepolia chain config
const baseChain = chains['84532']

// Access local Hardhat chain config
const localChain = chains['31337']
```
