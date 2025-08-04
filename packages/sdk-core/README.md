
# @ethereum-tag-service/sdk-core

Core SDK for interacting with Ethereum Tag Service smart contracts.

## Features Test

- Type-safe client factories for all ETS contracts
- Built on viem for reliable Ethereum interactions
- Automatic chain configuration
- Support for custom RPC endpoints and Alchemy integration

## Installation

```bash
npm install @ethereum-tag-service/sdk-core
```

## Usage

Create clients for specific ETS contracts:

```typescript
import { createCoreClient, createTokenClient } from '@ethereum-tag-service/sdk-core'

// Initialize the core client with all sub-clients
const coreClient = createCoreClient({
  chainId: 8453, // Base
  account: '0x...',
  clients: {
    tokenClient: true,
    relayerClient: true
  }
})

// Or create individual clients
const tokenClient = createTokenClient({
  chainId: 8453,
  account: '0x...'
})
```

## Available Clients

CoreClient - Main entry point with access to all contracts
TokenClient - ETS token operations
RelayerClient - Relayer interactions
AuctionHouseClient - Auction functionality
AccessControlsClient - Permission management
RelayerFactoryClient - Relayer deployment
TargetClient - Target contract interactions
EnrichTargetClient - Target enrichment operations
EtsClient - General ETS protocol interactions

## Configuration

The SDK automatically configures for supported chains and can use Alchemy RPC endpoints when NEXT_PUBLIC_ALCHEMY_KEY is provided.
