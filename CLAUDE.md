# ETS Context Enhancement for Claude

This document contains sections to enhance Claude's context understanding and retrieval for the ETS project.

## Working Branch Notebook

The **Working Branch Notebook** is a feature branch-specific document that maintains detailed notes about the current work in progress. This helps maintain continuity between sessions and provides comprehensive context about the ongoing implementation.

Current branch notebook:
- **Branch**: `513-airnode-oracle`
- **Notebook**: [ORACLE-DEPLOYMENT.md](/Users/User/Sites/ets/ORACLE-DEPLOYMENT.md)
- **Purpose**: Tracks Oracle implementation progress, deployment steps, and environment configuration details

When switching to work on a different feature branch, updating this reference in CLAUDE.md provides immediate context for future sessions.

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

## Coding Pattern Preferences

– Always prefer simple solutions
– Avoid duplication of code whenever possible, which means checking for other areas of the codebase that might already have similar code and functionality
– Write code that takes into account the different environments: dev, test, and prod
– You are careful to only make changes that are requested or you are confident are well understood and related to the change being requested
– When fixing an issue or bug, do not introduce a new pattern or technology without first exhausting all options for the existing implementation. And if you finally do this, make sure to remove the old implementation afterwards so we don't have duplicate logic.
– Keep the codebase very clean and organized
– Avoid writing scripts in files if possible, especially if the script is likely only to be run once
– Avoid having files over 200–300 lines of code. Refactor at that point.
– Mocking data is only needed for tests, never mock data for dev or prod
– Never add stubbing or fake data patterns to code that affects the dev or prod environments
– Never overwrite my .env file without first asking and confirming
– Always use console.info instead of console.log for logging
– Prefer for...of loops over forEach() methods (as recommended by Biome under the rule complexity/noForEach)

## Project Status & Roadmap

- **Current Phase**: Testnet deployment with staging/production separation
- **Active Branches**:
  - `stage`: Main integration branch for next release features
  - `513-airnode-oracle`: Oracle implementation branch
- **Upcoming Milestones**:
  - Complete staging/production environment separation ✓
  - Subgraph deployment for staging environment ✓
  - Oracle deployment to staging environment
  - Application environment switcher implementation

## Current Work Streams

- **Environment Separation**: Implemented SDK support for separate staging/production deployments on same testnets ✓
- **Subgraph Environment Support**: Deployed separate subgraphs for staging/production ✓
- **Oracle Integration**: Deploying API3 Airnode for oracle functionality
- **Contract Upgrades**: Preparing for future contract upgrades

## Environment-Aware SDK Usage

The SDK now supports environment-specific contract deployments on the same network:

```typescript
// In sdk-core
import { createEtsClient, Environment } from "@ethereum-tag-service/sdk-core";

// Specify environment for client creation
const client = createEtsClient({ 
  chainId: 421614, 
  account,
  environment: "staging" // "production" | "staging" | "localhost" 
});

// In React applications
import { useEtsClient } from "@ethereum-tag-service/sdk-react-hooks";

// Pass environment to hook
const { platformPercentage, taggingFee } = useEtsClient({ 
  chainId, 
  account, 
  environment: "staging" 
});
```

By default, if no environment is specified, the SDK uses "production" environment.

## Architecture

The ETS monorepo follows a modular architecture with specialized components:

### Core Components

- **Smart Contracts** (`packages/contracts`): Solidity contracts implementing the ETS protocol
  - Core contracts: ETS, ETSToken, ETSTarget, ETSRelayer, ETSAuctionHouse
  - Manages tags, tagging records, relayers, auctions
  - Currently in testnet phase, running on Arbitrum Sepolia and Base Sepolia
  - Hardhat for local development and testing

- **SDK Core** (`packages/sdk-core`): TypeScript library for contract interactions
  - Type-safe client factories (TokenClient, RelayerClient, etc.)
  - Built on viem for Ethereum interactions
  - Public npm package: `@ethereum-tag-service/sdk-core`

- **React Hooks** (`packages/sdk-react-hooks`): React bindings for SDK
  - Simplifies SDK integration in React applications
  - Public npm package: `@ethereum-tag-service/sdk-react-hooks`

- **Subgraph Endpoints**

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

## Project Structure Quick Reference

- `/packages/contracts/`: Smart contract code, deployment scripts, and tests
- `/packages/sdk-core/`: Core TypeScript library for contract interactions
- `/packages/sdk-react-hooks/`: React bindings for the SDK
- `/apps/app/`: Next.js frontend application
- `/apps/data-api/`: Graph Node and subgraph for data indexing
- `/apps/offchain-api/`: Node.js service for off-chain operations
- `/apps/oracle/`: API3 Airnode integration for oracle functionality

## Key Environment Variables

```
# Root .env (used as fallback)
MNEMONIC=                  # Primary mnemonic for deployment
MNEMONIC_STAGING=          # Staging-specific mnemonic
REPORT_GAS=true            # Enable gas reporting during tests
COINMARKETCAP_API_KEY=     # For gas reporting in USD

# Network-specific settings
ARBITRUM_SEPOLIA_URL=      # Main Arbitrum Sepolia RPC endpoint
BASE_SEPOLIA_URL=          # Main Base Sepolia RPC endpoint
ARBITRUM_SEPOLIA_API_KEY=  # Block explorer API key
BASE_SEPOLIA_API_KEY=      # Block explorer API key

# Oracle settings
AIRNODE_MNEMONIC=          # Oracle wallet mnemonic
```

## Codebase Exploration Commands

```bash
# Find contract source files
find packages/contracts/contracts -name "*.sol"

# List all deployment scripts
ls -la packages/contracts/deploy/core/

# View contract ABI
cat packages/contracts/abi/contracts/ETS.sol/ETS.json | jq .abi

# Check deployment addresses
cat packages/contracts/deployments/arbitrumSepolia/ETS.json | jq .address

# View test files
find packages/contracts/test -name "*.test.ts"
```

## Contract Addresses Reference

### Production
- **Arbitrum Sepolia**:
  - ETS: `0x...`
  - ETSToken: `0x...`
  - ETSTarget: `0x...`
  
- **Base Sepolia**:
  - ETS: `0x...`
  - ETSToken: `0x...`
  - ETSTarget: `0x...`

### Staging
- **Arbitrum Sepolia**:
  - ETS: `0x...`
  - ETSToken: `0x...`
  - ETSTarget: `0x...`
  
- **Base Sepolia**:
  - ETS: `0x...`
  - ETSToken: `0x...`
  - ETSTarget: `0x...`

## Ongoing Projects

### White Paper Development
The team is working on creating a comprehensive white paper for ETS that will:
- Explain the vision and purpose of the Ethereum Tag Service
- Detail the technical architecture and components
- Cover the tokenomics and incentive mechanisms
- Outline the roadmap and future developments

Key documentation sources for white paper content:
- `/apps/site/pages/docs/why-ets.mdx`: Vision and purpose
- `/apps/site/pages/docs/concepts/overview.mdx`: Key concepts overview
- `/apps/site/pages/docs/concepts/ctag.mdx`: CTAG implementation details
- `/apps/site/pages/docs/tokenomics.mdx`: Economic model and revenue sharing
- `/apps/site/pages/docs/roadmap.mdx`: Future development plans

## Workflow & Change Management

### Version Management with Changesets

The project uses [changesets](https://github.com/changesets/changesets) to manage package versions, changelogs, and publishing:

```bash
# Create a new changeset (run from the package directory or root)
pnpm changeset

# This opens an interactive CLI to:
# 1. Select packages to include in the changeset
# 2. Choose version bump types (major, minor, patch)
# 3. Write a summary of changes

# After creating a changeset, commit the generated file
git add .changeset/*.md
git commit -m "Add changeset for [brief description]"

# When ready to version and publish:
pnpm changeset version  # Updates versions and changelogs
pnpm changeset publish  # Publishes to npm
```

- **Never manually edit** version numbers in package.json files
- Each significant change should have a corresponding changeset
- Changesets get committed to the repository until ready for release
- For environment-specific packages, use appropriate version bump types:
  - **Major**: Breaking API changes
  - **Minor**: New features, backward compatible
  - **Patch**: Bug fixes, documentation updates

### Subgraph Deployment

- **Local Development**:
  ```bash
  cd apps/data-api
  pnpm deploy --config localhost
  ```

- **Production Deployment**:
  ```bash
  cd apps/data-api
  pnpm deploy --config arbitrumSepolia
  pnpm deploy --config baseSepolia
  ```

- **Staging Deployment**:
  ```bash
  cd apps/data-api
  pnpm deploy:staging:all  # Deploys to all staging subgraphs
  # Or deploy individually:
  pnpm deploy:staging:arbitrum
  pnpm deploy:staging:base
  ```

- **Important**: New subgraphs must first be created manually in [The Graph Studio](https://thegraph.com/studio/) UI before deploying

### Git Workflow

- **Branch Naming**: `<issue-number>-<brief-description>`
- **Commit Style**: Concise present-tense summaries
- **PR Process**: Create PR against `stage` branch, include testing steps
- **Release Flow**: `stage` → `main` for production releases

### Development Workflow

1. **Setup Local Environment**:
   ```bash
   ./scripts/start-local-stack.sh
   ```

2. **Deploying Contracts to Staging**:
   ```bash
   cd packages/contracts
   pnpm deploy:staging
   ```

3. **Running Tests**:
   ```bash
   cd packages/contracts
   pnpm hardhat:test
   ```

4. **Starting Oracle**:
   ```bash
   cd apps/oracle
   pnpm start:local
   ```