# ETS Developer Guide

This guide contains development patterns, practices, and tooling information for contributors to the ETS project.

## 🚀 Quick Start

```bash
# Setup
git clone <repo>
cd ets
pnpm install

# Start local development stack
./scripts/start-local-stack.sh

# Start frontend
cd apps/app
pnpm dev
```

## 🛠 Development Environment

### Required Tools
- **Node.js**: v20.15.0 (use .nvmrc)
- **Package Manager**: pnpm v10.14.0
- **Docker**: For local services (ArLocal, Graph Node, etc.)

### Environment Setup
The project uses strict version requirements to ensure consistency:

```bash
# Use project's Node.js version
nvm use

# Verify versions
node --version    # v20.15.0
pnpm --version    # 10.14.0
```

## 📝 Code Style & Patterns

### Formatting & Linting
- **Linter**: Biome (replaces ESLint + Prettier)
- **Style**: Double quotes, trailing commas, 2-space indentation
- **Commands**:
  ```bash
  pnpm lint          # Check and fix issues
  pnpm format        # Format code
  ```

### Console Logging Strategy

We use a **hybrid approach** with automatic console stripping:

#### ✅ Recommended Usage

```typescript
// 1. Critical errors (always visible in production)
console.error("Payment failed:", error);
console.error("Authentication error:", authError);

// 2. Development debugging (explicit intent)
import { debug } from "@app/utils";
debug.info("Component state:", { user, isLoggedIn });
debug.warn("Performance issue:", performanceData);

// 3. Production monitoring (auto-stripped)
console.info("User action completed:", actionData);
console.log("Process completed successfully");
```

#### 🔧 Automatic Console Stripping
- **Development**: All console statements visible
- **Production**: `console.log/info/warn/debug` → stripped, `console.error` → preserved
- **Testing**: `cd apps/app && pnpm test:console-stripping`

### TypeScript Patterns

```typescript
// ✅ Prefer explicit types over 'any'
interface UserData {
  id: string;
  address: `0x${string}`;
  chainId: number;
}

// ✅ Use strict mode features
const user: UserData = await fetchUser(id);

// ✅ Functional components with interfaces
interface ComponentProps {
  title: string;
  onSubmit: (data: FormData) => Promise<void>;
}

export const MyComponent: React.FC<ComponentProps> = ({ title, onSubmit }) => {
  // Implementation
};
```

## 🏗 Architecture Overview

### Monorepo Structure
```
ets/
├── apps/
│   ├── app/           # Next.js frontend
│   ├── data-api/      # Graph Node & subgraph
│   ├── offchain-api/  # Node.js API service
│   └── oracle/        # API3 Airnode integration
├── packages/
│   ├── contracts/     # Solidity contracts
│   ├── sdk-core/      # TypeScript SDK
│   └── sdk-react-hooks/ # React SDK bindings
└── scripts/           # Development tools
```

### Key Components

#### Smart Contracts (`packages/contracts`)
- **Core**: ETS, ETSToken, ETSTarget, ETSRelayer
- **Networks**: Arbitrum Sepolia, Base Sepolia
- **Testing**: `pnpm hardhat:test`
- **Deployment**: Environment-aware (staging/production)

#### SDK (`packages/sdk-core`, `packages/sdk-react-hooks`)
- Type-safe contract interactions
- Environment-aware client factories
- React hooks for easy integration

#### Frontend (`apps/app`)
- Next.js with TypeScript
- Rainbow Kit for wallet connections
- TanStack Query for data fetching
- Automatic console stripping in production

## 🧪 Testing

### Running Tests
```bash
# Contract tests
cd packages/contracts && pnpm hardhat:test

# Specific contract test
cd packages/contracts && npx hardhat test test/ETS.test.ts

# Console stripping test
cd apps/app && pnpm test:console-stripping
```

### Testing Patterns
- Unit tests for business logic
- Integration tests for contract interactions
- No mocking in development/production environments
- Use explicit test data, not stubs

## 🔧 Development Tools

### Local Development Stack
```bash
# Start everything (Hardhat, Graph Node, ArLocal, etc.)
./scripts/start-local-stack.sh

# Individual services
cd packages/contracts && pnpm hardhat  # Local blockchain
cd apps/data-api && pnpm deploy       # Subgraph
cd apps/offchain-api && pnpm dev      # API service
```

### Environment Management
- **Development**: Full debugging, all console statements
- **Staging**: Production-like with additional monitoring
- **Production**: Optimized builds, console stripping

### Docker Services
- **ArLocal**: Local Arweave node for testing
- **Graph Node**: Local subgraph indexing
- **PostgreSQL**: Database for Graph Node
- **IPFS**: Distributed storage

## 📚 Common Workflows

### Adding a New Feature
1. Create feature branch: `git checkout -b 123-feature-name`
2. Update relevant packages (contracts, SDK, frontend)
3. Add tests for new functionality
4. Update documentation if needed
5. Test locally with full stack
6. Create PR against `stage` branch

### Environment-Specific Deployments
```typescript
// SDK supports staging/production environments
import { createEtsClient } from "@ethereum-tag-service/sdk-core";

const client = createEtsClient({ 
  chainId: 421614, 
  account,
  environment: "staging" // "production" | "staging" | "localhost"
});
```

### Debugging Issues
1. Check console in development mode
2. Use `debug.*` utilities for verbose logging
3. Verify environment variables
4. Check contract deployment addresses
5. Validate network configuration

## 🔍 Troubleshooting

### Common Issues

**Port Conflicts:**
```bash
# The start script handles conflicts automatically
./scripts/start-local-stack.sh
# Choose 'y' to stop conflicting services
```

**Node Version Issues:**
```bash
nvm use                    # Use project's Node version
pnpm install               # Reinstall dependencies
```

**Build Issues:**
```bash
pnpm clean                 # Clean build artifacts
pnpm install               # Fresh install
pnpm build                 # Rebuild
```

**Console Statements in Production:**
```bash
cd apps/app && pnpm test:console-stripping  # Verify stripping works
```

### Getting Help
- Check existing issues in GitHub
- Review CLAUDE.md for AI context
- Ask in team channels for project-specific questions

## 📈 Performance Considerations

### Build Optimization
- SWC compiler for fast builds
- Automatic console stripping
- Tree shaking for unused code
- Environment-specific optimizations

### Development Speed
- Hot reloading in development
- Efficient dependency management with pnpm
- Parallel service startup with local stack script

## 🔐 Security Practices

- Never commit secrets to repository
- Use environment variables for sensitive data
- Follow smart contract security best practices
- Validate user inputs properly
- Handle errors gracefully with proper logging

---

## 💡 Contributing

When contributing to ETS:

1. **Follow existing patterns** - check similar implementations first
2. **Keep it simple** - prefer straightforward solutions
3. **Test thoroughly** - both unit and integration tests
4. **Document changes** - update relevant docs
5. **Consider all environments** - dev, staging, production

This guide is a living document. Update it as development practices evolve!