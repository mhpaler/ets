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

## Environment Configuration for Claude Code

Claude Code should always use the project's Node.js and pnpm versions to ensure compatibility:

**Required Environment Setup:**
- **Node.js**: v20.19.4 (as specified in .nvmrc)
- **pnpm**: v10.14.0 (as specified in package.json packageManager field)

**PATH Configuration:**
All Claude Code commands should use this PATH prefix to ensure correct Node.js and pnpm versions:

```bash
PATH="/Users/User/.nvm/versions/node/v20.19.4/bin:$PATH"
```

**Git Commits:**
When committing via Claude Code, use the correct environment:

```bash
PATH="/Users/User/.nvm/versions/node/v20.19.4/bin:$PATH" git commit -m "message"
```

This ensures:
- Pre-commit hooks (Biome linting) work correctly
- pnpm commands use the correct version (10.14.0)
- Node.js version matches project requirements (v20.15.0)
- Dependency compatibility is maintained

## Code Style

- **Formatting**: Double quotes, trailing commas, 2-space indentation (4 for Solidity)
- **Imports**: Organized with Biome, no barrel exports (`index.ts` exports)
- **TypeScript**: Strict mode enabled, prefer explicit types over `any`
- **Naming**: camelCase for variables/functions, PascalCase for components/classes
- **Error Handling**: Explicit error boundaries, detailed error messages
- **Components**: Functional React components with TypeScript interfaces
- **State Management**: React context for global state
- **Testing**: Unit tests for business logic, contract interactions

### Debug Logging Strategy

**We use a hybrid approach with automatic console stripping and explicit debug utilities:**

#### Automatic Console Stripping (Next.js SWC)
- `console.log`, `console.info`, `console.warn`, `console.debug` → **Stripped in production**
- `console.error` → **Preserved in production** (for critical errors)
- Uses Next.js SWC compiler for optimal performance
- Configured in `apps/app/next.config.js`

#### When to Use Each Approach:

**1. Debug Utility (`debug.*`) - For explicit development-only debugging:**
```typescript
import { debug } from "@app/utils";

// ✅ Temporary debugging during feature development
debug.info("User authentication state:", { user, isLoggedIn });
debug.warn("Performance issue detected:", performanceData);
debug.log("Component re-render:", { props, state });
```

**2. Direct Console - For production-ready logging:**
```typescript
// ✅ Critical errors (always shows in production)
console.error("Failed to load user data:", error);
console.error("Payment processing failed:", paymentError);

// ✅ Production monitoring (stripped automatically)
console.info("User signup completed:", { userId, timestamp });
```

**Testing Console Stripping:**
```bash
# Automated test
cd apps/app && pnpm test:console-stripping

# Manual verification
NODE_ENV=development pnpm dev    # Shows all console messages
NODE_ENV=production pnpm build && pnpm start  # Strips non-error messages
```

**Benefits:**
- Developer-friendly: Full console logging in development
- Production-clean: Automatic stripping of debug statements
- Performance optimized: Uses fast SWC compiler
- Error preservation: Critical errors always visible

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

## Release Management

- **Recommended Workflow**: Run Automated Script (scripts/post-release-sync.ts) after every release to ensure proper synchronization and environment updates

(rest of the content remains the same...)