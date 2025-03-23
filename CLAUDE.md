# ETS Codebase Guidelines for Claude

## Build & Test Commands
- Build: `pnpm build`
- Lint: `pnpm lint` (uses Biome)
- Format: `pnpm format`
- Test contracts: `pnpm hardhat:test`
- Test single contract: `cd packages/contracts && npx hardhat test test/ETS.test.ts`
- Start local stack: `./scripts/start-local-stack.sh`

## Code Style
- **Formatting**: Double quotes, trailing commas, 2-space indentation (4 for Solidity)
- **Imports**: Organized with Biome, no barrel exports (`index.ts` exports)
- **TypeScript**: Strict mode enabled, prefer explicit types over `any`
- **Naming**: camelCase for variables/functions, PascalCase for components/classes
- **Error Handling**: Explicit error boundaries, detailed error messages
- **Components**: Functional React components with TypeScript interfaces
- **State Management**: React context for global state
- **Testing**: Unit tests for business logic, contract interactions

## Architecture
The ETS monorepo follows a modular architecture with specialized components:

### Core Components
- **Smart Contracts** (`packages/contracts`): Solidity contracts implementing the ETS protocol
  - Core contracts: ETS, ETSToken, ETSTarget, ETSRelayer, ETSAuctionHouse
  - Manages tags, tagging records, relayers, auctions

- **SDK Core** (`packages/sdk-core`): TypeScript library for contract interactions
  - Type-safe client factories (TokenClient, RelayerClient, etc.)
  - Built on viem for Ethereum interactions

- **React Hooks** (`packages/sdk-react-hooks`): React bindings for SDK
  - Simplifies SDK integration in React applications

### Applications
- **Explorer App** (`apps/app`): Next.js frontend for visualizing ETS data
  - Displays tags, auctions, tagging records
  - User interface for protocol interactions

- **Data API** (`apps/data-api`): Graph Node for indexing blockchain data
  - Subgraph for efficient data queries
  - GraphQL API for frontend integration

- **Off-chain API** (`apps/offchain-api`): Node.js service for off-chain operations
  - Target URL metadata extraction
  - Arweave storage integration
  - CTAG auction management

- **Oracle** (`apps/oracle`): API3 Airnode integration for decentralized data

### Key Concepts
- **CTAG**: Composable tag NFT that can be owned and traded
- **Target**: On-chain or off-chain entity that can be tagged
- **Tagging Record**: Association between tag and target
- **Relayer**: Custom implementation for tag management
- **Auction**: Mechanism for distributing CTAGs

All components work together through well-defined interfaces with strict typing.