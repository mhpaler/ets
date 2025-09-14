# ETS Project Context for Claude

This document contains essential project knowledge, patterns, and conventions for the Ethereum Tag Service (ETS).

## Project Overview

ETS (Ethereum Tag Service) is a decentralized tagging protocol built on Ethereum. The project is undergoing a major transformation from CTAG NFTs to TAG Coins (ERC-20 tokens on Zora), while maintaining ETS as the canonical tag registry.

**Repository Structure**: Monorepo using pnpm workspaces
- `/packages/contracts` - Smart contracts (Hardhat 3, Ignition deployments)
- `/packages/ets-cli` - CLI for contract management (Commander.js)
- `/apps/app` - Main web application (Next.js)
- `/apps/offchain-api` - Event processing service

## Build & Test Commands

- Build: `pnpm build`
- Lint: `pnpm lint` (uses Biome)
- Format: `pnpm format`
- Test contracts: `pnpm hardhat:test`
- Test single contract: `cd packages/contracts && pnpm hardhat test test/ETS.test.ts`
- Start local stack: `./scripts/start-local-stack.sh`
- Deploy locally: `cd packages/contracts && pnpm deploy:localhost`
- Configure after deploy: `cd packages/contracts && tsx scripts/configure.ts`

**Important**: Always use `pnpm` instead of `npm` or `npx` for consistency.

## Environment Configuration

**Required Environment Setup:**
- **Node.js**: v20.19.4 (as specified in .nvmrc)
- **pnpm**: v10.14.0 (as specified in package.json packageManager field)

**Git Commits with proper environment:**
```bash
PATH="/Users/User/.nvm/versions/node/v20.19.4/bin:$PATH" git commit -m "message"
```

## Technology Stack & Decisions

### Core Technologies
- **Smart Contracts**: Solidity 0.8.12, Hardhat 3, OpenZeppelin
- **Deployment**: Hardhat Ignition (replaced hardhat-deploy)
- **Frontend**: Next.js 14, React, TypeScript
- **Blockchain Interaction**: Migrating from ethers.js to viem
- **CLI Tools**: Commander.js (chosen over Hardhat plugins for portability)
- **Testing**: Vitest for contracts, Jest for apps

### Critical Migration Context

**Hardhat 3 Changes**:
- Removed scope/subtask APIs - plugins create subtasks internally
- Custom code should use scripts instead of tasks
- Use Ignition fixtures for testing instead of hardhat-deploy

**Viem Migration**:
- Project is actively migrating from ethers.js to viem
- Better TypeScript support and performance
- Use viem patterns in new code

## Code Style & Conventions

### General Style
- **Formatting**: Double quotes, trailing commas, 2-space indentation (4 for Solidity)
- **Imports**: Organized with Biome, no barrel exports (`index.ts` exports)
- **TypeScript**: Strict mode enabled, prefer explicit types over `any`
- **Naming**: camelCase for variables/functions, PascalCase for components/classes
- **Error Handling**: Explicit error boundaries, detailed error messages
- **File Size**: Keep files under 200-300 lines, refactor when larger

### Biome & Code Quality
- **NEVER use `--no-verify`**: Always fix Biome errors before committing
- **Lean on Biome**: It's an excellent tool that prevents technical debt
- **Fix issues properly**: When Biome blocks a commit:
  - Fix the actual issues in the code
  - If truly problematic, adjust Biome configuration
  - As last resort, use inline Biome ignore comments with justification
- **No bypassing**: `--no-verify` commits are not acceptable

### Debug Logging Strategy

**Hybrid approach with automatic console stripping:**

1. **Production Console Stripping** (Next.js SWC):
   - `console.log`, `console.info`, `console.warn`, `console.debug` → Stripped in production
   - `console.error` → Preserved in production (for critical errors)

2. **Debug Utility** for development:
```typescript
import { debug } from "@app/utils";
debug.info("Development only message:", data);
```

3. **Logging Convention**: Use `console.info` instead of `console.log`

## Coding Pattern Preferences

- Always prefer simple solutions
- Avoid code duplication - check for existing similar functionality first
- Write environment-aware code (dev, test, prod)
- Only make requested changes or well-understood related changes
- When fixing bugs, exhaust existing implementation options before introducing new patterns
- Keep the codebase clean and organized
- Avoid inline scripts in files for one-time operations
- Never mock data for dev or prod environments (only tests)
- Never overwrite .env files without confirmation
- Prefer `for...of` loops over `forEach()` methods (Biome rule)

## Common Development Patterns

### Standard Deployment Flow
```bash
# Compile and deploy
cd packages/contracts
pnpm compile
pnpm deploy:localhost

# Post-deployment configuration
tsx scripts/configure.ts

# Generate exports for other packages
tsx scripts/generate-ignition-exports.ts
```

### Testing with Correct Node Version
```bash
# Use Node 22 for Hardhat operations
bash -c "source ~/.nvm/nvm.sh && nvm use 22 && pnpm test"
```

### CLI Development Workflow
```bash
cd packages/ets-cli
pnpm build
pnpm ets info --network localhost
```

## Integration Patterns & Solutions

### Wagmi CLI + Ignition Gap
- Wagmi CLI doesn't support Hardhat Ignition natively
- Solution: Custom export generation script (`generate-ignition-exports.ts`)
- Generates TypeScript exports from Ignition deployments

### Contract Exports Pattern
```typescript
// In contracts package
export { getContractAddresses } from "./deployments"
export { getContractABI } from "./abis"

// In consuming packages
import { getContractAddresses } from "@ethereum-tag-service/contracts/deployments"
import { ETSCoreABI } from "@ethereum-tag-service/contracts/abis"
```

### Monorepo Dependency Management
- After changing contracts package: run `pnpm install` at workspace root
- Packages are interdependent - changes propagate through the workspace

## Architecture Insights

### HD Wallet Integration
- Foundation for secure multi-role operations across the stack
- Supports deterministic account derivation for different roles
- Critical for TAG Coins creator allocation system

### Event Processing Architecture
- ETS Core emits events (TagCreated, etc.)
- Off-chain service processes events via Temporal workflows
- Maintains idempotency and error recovery

### Beacon Proxy Pattern
- Used for upgradeable relayers
- Complex but functional implementation
- Allows upgrading all relayer instances simultaneously

## Release Management

**Post-Release Workflow**:
```bash
# Run automated sync after releases
pnpm post-release-sync
```

This ensures proper branch synchronization and environment updates.

## Active Development References

- **Session Documentation**: [`docs/session/`](./docs/session/) - Current work status
- **Vision & Strategy**: [`docs/claude/CLAUDE-VISION.md`](./docs/claude/CLAUDE-VISION.md)
- **Implementation Details**: [`docs/claude/CLAUDE-IMPLEMENTATION.md`](./docs/claude/CLAUDE-IMPLEMENTATION.md)
- **Roadmap**: [`docs/session/ROADMAP.md`](./docs/session/ROADMAP.md)