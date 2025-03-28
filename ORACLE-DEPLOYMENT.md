# ETS Environment Separation Plan

This document tracks our progress on creating separate environments (staging and production) for the ETS project.

## Environment Separation Goals

- Separate contract deployments for staging and production
- Independent oracle instances for each environment
- Separate subgraph deployments
- Environment-specific frontend configurations
- Isolated deployment pipelines

## Progress Tracker

### 1. Contract Environment Separation

- [x] Update hardhat.config.ts with staging networks
- [x] Add deployment scripts to package.json
- [x] Set up environment variables
  - [x] MNEMONIC_MAINNET (for future mainnet deployments)
  - [x] MNEMONIC_TESTNET_PRODUCTION (rename from MNEMONIC_TESTNET)
  - [x] MNEMONIC_TESTNET_STAGING (new mnemonic for staging)
- [x] Deploy contracts to staging networks
  - [x] arbitrumSepoliaStaging
  - [x] baseSepoliaStaging
- [x] Verify contracts on block explorers

### 2. Oracle Environment Separation

- [ ] Create staging configuration for oracle
  - [ ] Duplicate and modify config templates
  - [ ] Update endpoint configurations
- [ ] Deploy separate Airnode instance for staging
  - [ ] Configure with staging contract addresses
  - [ ] Set up sponsorship relationships
- [ ] Update oracle scripts to support environment flags
- [ ] Test oracle integration with staging contracts

### 3. Subgraph Environment Separation

- [x] Create staging subgraph deployments
  - [x] Update subgraph.yaml templates for staging
  - [x] Configure with staging contract addresses
- [x] Deploy subgraphs to staging endpoints
- [x] Add environment-specific queries to SDK

### 4. Frontend Configuration

- [x] Update SDK to support environment selection
- [ ] Create staging-specific environment variables
- [ ] Implement environment switching mechanism
- [ ] Test full integration with staging backends

### 5. Deployment Pipeline

- [ ] Create separate CI/CD workflows for each environment
- [ ] Implement environment promotion mechanism
- [ ] Set up monitoring for each environment
- [ ] Document deployment procedures

## Environment Variables

### Production

``` env
ALCHEMY_TESTNET=<alchemy-key>
MNEMONIC_TESTNET_PRODUCTION=<production-mnemonic>
ARBISCAN_API_KEY=<arbiscan-key>
BASESCAN_API_KEY=<basescan-key>
```

### Staging

``` env
ALCHEMY_TESTNET=<same-alchemy-key>
MNEMONIC_TESTNET_STAGING=<staging-mnemonic>
ARBISCAN_API_KEY=<same-as-production>
BASESCAN_API_KEY=<same-as-production>
```

### Future Mainnet

``` env
ALCHEMY_MAINNET=<mainnet-key>
MNEMONIC_MAINNET=<mainnet-mnemonic>
```

## Contract Addresses

### Production

- arbitrumSepolia:
  - ETS: (existing address)
  - ETSToken: (existing address)
  - ETSAccessControls: (existing address)
  - ...

- baseSepolia:
  - ETS: (existing address)
  - ETSToken: (existing address)
  - ETSAccessControls: (existing address)
  - ...

### Staging

- arbitrumSepoliaStaging:
  - ETS: (to be deployed)
  - ETSToken: (to be deployed)
  - ETSAccessControls: (to be deployed)
  - ...

- baseSepoliaStaging:
  - ETS: (to be deployed)
  - ETSToken: (to be deployed)
  - ETSAccessControls: (to be deployed)
  - ...

## Resource URLs

### Production

- Subgraph Arbitrum Sepolia: https://api.studio.thegraph.com/query/87165/ets-arbitrum-sepolia/version/latest
- Subgraph Base Sepolia: https://api.studio.thegraph.com/query/87165/ets-base-sepolia/version/latest
- Offchain API: (existing URL)
- Explorer UI: (existing URL)
- Oracle: (existing URL)

### Staging

- Subgraph Arbitrum Sepolia: https://api.studio.thegraph.com/query/87165/ets-arbitrum-sepolia-staging/version/latest
- Subgraph Base Sepolia: https://api.studio.thegraph.com/query/87165/ets-base-sepolia-staging/version/latest
- Offchain API: (to be created)
- Explorer UI: (to be created)
- Oracle: (to be created)

## Notes and Decisions

- Using the same testnets (Arbitrum Sepolia, Base Sepolia) for both environments
- Same contract addresses will not be shared between environments
- Future consideration: separate mnemonics for staging and production

## Critical Issues to Resolve

### ✅ Contract Exports Problem (RESOLVED)

**Issue:** The auto-generated `src/contracts.ts` export uses chainIds as keys, but our staging and production environments share the same chainIds (84532, 421614), making it impossible to distinguish between environments.

**Impact:** The current export mechanism can't be used to access both production and staging contracts since they would overwrite each other in the exports.

**Implemented Solution:**

We created a custom wagmi plugin (`hardhat-deploy-env-aware.ts`) that:
1. Detects environments from network names (e.g., "arbitrumSepoliaStaging" → "staging")
2. Generates a unified `contracts.ts` with both chainId-only keys (for backward compatibility) and environment-specific keys
3. Creates address map entries in the format `{chainId}_{environment}` (e.g., "421614_staging")

Then we updated the SDK to use these environment-specific keys:
1. Added environment types and utilities to SDK Core
2. Updated all client classes to accept an environment parameter
3. Made client address resolution environment-aware
4. Updated React hooks to support environment parameter

**Implementation Details:**

- **Environment Types:** We defined a standard `Environment` type with values: "production", "staging", "localhost"
- **Default Behavior:** All components default to "production" environment for backward compatibility
- **Address Resolution:** Added a `getAddressForEnvironment()` utility that tries environment-specific keys first, then falls back to chainId-only keys
- **React Integration:** All React hooks now accept an optional environment parameter

**Status:** ✓ Implemented and Ready for Testing

### Environment-Aware Contract Generation

The custom plugin generates contract exports in this format:

```typescript
export const etsConfig = {
  address: {
    // Standard chainId keys (backward compatibility)
    "421614": "0xProductionAddress...",
    "84532": "0xProductionAddress...",
    
    // Environment-specific keys
    "421614_production": "0xProductionAddress...",
    "421614_staging": "0xStagingAddress...",
    "84532_production": "0xProductionAddress...",
    "84532_staging": "0xStagingAddress...",
    "31337_localhost": "0xLocalhostAddress...",
  },
  abi: [...],
}
```

### SDK Client Pattern

All SDK clients now follow this pattern:

```typescript
// Client construction
const client = createEtsClient({ 
  chainId: 421614, 
  account,
  environment: "staging" // Optional, defaults to "production"
});

// Address resolution
const contractAddress = getAddressForEnvironment(
  etsConfig.address, 
  chainId, 
  environment
);
```

### React Hooks Usage

All React hooks accept an optional environment parameter:

```tsx
// Using with explicit environment
const { accrued, taggingFee } = useEtsClient({ 
  chainId, 
  account, 
  environment: "staging" 
});

// Using with default environment (production)
const { accrued, taggingFee } = useEtsClient({ chainId, account });
```

**Timeline:** ✓ Resolved - Solution implemented and ready for application integration

## Environment-Aware Contracts Implementation Plan

After analyzing the code structure and how the SDK packages use the contracts exports, we've developed a detailed plan to make the system environment-aware while maintaining backward compatibility.

### 1. Plugin Modification (Custom Fork of @sunodo/wagmi-plugin-hardhat-deploy)

The current plugin generates address mappings based solely on chainId, which doesn't support our need for environment-specific deployments on the same network. We'll create a custom fork with these modifications:

```typescript
// Modified plugin implementation
const plugin = (config: HardhatDeployOptions): Plugin => {
  return {
    name: "hardhat-deploy-env-aware",
    contracts: () => {
      // list all files exported by hardhat-deploy
      const files = fs
        .readdirSync(config.directory)
        .filter((file) => shouldIncludeFile(file, config));

      // build a collection of contracts as expected by wagmi (ContractConfig) indexed by name
      const contracts = files.reduce<Record<string, ContractConfig>>(
        (acc, file) => {
          // read export file (hardhat-deploy format)
          const filename = path.join(config.directory, file);
          const deployment = JSON.parse(
            fs.readFileSync(filename).toString()
          ) as Export;
          const chainId = parseInt(deployment.chainId);

          // Extract environment from filename (if present)
          const fileBaseName = path.basename(file, ".json");
          const envMatch = fileBaseName.match(/(.*?)(Staging|Production)$/);
          const environment = envMatch ? envMatch[2].toLowerCase() : "production";

          // merge this contract with potentially existing contract from other chain
          Object.entries(deployment.contracts).forEach(
            ([name, { abi, address }]) => {
              if (shouldInclude(name, config)) {
                const contract = acc[name] || {
                  name,
                  abi,
                  address: {},
                };
                const addresses = contract.address as Record<
                  string | number,
                  Address
                >;

                // Add both chainId-only (for backward compatibility)
                // and chainId+environment entries
                if (environment === "production") {
                  addresses[chainId] = address; // Backward compatibility
                }

                // Add environment-specific key
                addresses[`${chainId}_${environment}`] = address;

                acc[name] = contract;
              }
            }
          );

          return acc;
        },
        {}
      );

      // No longer simplify addresses - we want to maintain the environment distinction
      return Object.values(contracts);
    },
  };
};
```

### 2. Update wagmi.config.ts

```typescript
  import hardhatDeployEnvAware from "./plugins/hardhat-deploy-env-aware";
  import { defineConfig } from "@wagmi/cli";

  export default defineConfig({
    out: "src/contracts.ts",
    plugins: [
      hardhatDeployEnvAware({
        directory: "src/chainConfig",
      }),
    ],
  });
```

### 3. Update SDK Core to be Environment-Aware

Modify the client classes to accept an environment parameter:

```typescript
// In CoreClient.ts and other client classes
export class CoreClient {
  constructor({
    publicClient,
    walletClient,
    chainId,
    environment = "production", // Default to production
    relayerAddress,
    clients,
  }: {
    publicClient: PublicClient;
    walletClient?: WalletClient;
    chainId?: number;
    environment?: "production" | "staging" | "localhost";
    relayerAddress?: Hex;
    clients?: ClientsConfig;
  }) {
    validateConfig(chainId, publicClient, walletClient);

    // Store for use in other methods
    this.environment = environment;
    this.chainId = chainId;

    // ... rest of constructor
  }

  // Helper method to get environment-aware contract address
  protected getContractAddress(config: any): Hex {
    if (!this.chainId) {
      throw new Error("Chain ID is required");
    }

    // Try environment-specific key first
    const envKey = `${this.chainId}_${this.environment}` as keyof typeof config.address;
    const chainIdKey = this.chainId as keyof typeof config.address;

    // Look for environment-specific address first, fall back to chainId-only address
    const address = config.address[envKey] || config.address[chainIdKey];

    if (!address) {
      throw new Error(
        `Contract not configured for chain ${this.chainId} and environment ${this.environment}`
      );
    }

    return address;
  }
}
```

### 4. Update Client Factory to Pass Environment Parameter

```typescript
// In clientFactory.ts
export function createEtsClient({
  chainId,
  account,
  environment = "production",
}: {
  chainId: number | undefined;
  account?: Account | Hex;
  environment?: "production" | "staging" | "localhost";
}): EtsClient | undefined {
  if (!chainId) return undefined;

  try {
    const { publicClient, walletClient } = initializeClients({ chainId, account });
    return new EtsClient({
      chainId,
      publicClient,
      walletClient,
      environment,
    });
  } catch (error) {
    console.error("[@ethereum-tag-service/sdk-core] Failed to create ETS client:", error);
    return undefined;
  }
}
```

### 5. Update React Hooks to Support Environment Parameter

```typescript
// In useEtsClient.ts and other hook files
export const useEtsClient = ({
  chainId,
  account,
  environment = "production",
}: {
  chainId?: number;
  account?: `0x${string}`;
  environment?: "production" | "staging" | "localhost";
}) => {
  const [etsClient, setEtsClient] = useState<EtsClient>();

  useEffect(() => {
    if (!chainId || !account) return;
    const client = createEtsClient({ chainId, account, environment });
    setEtsClient(client);
  }, [chainId, account, environment]);

  // ... rest of hook implementation
};
```

### 6. Environment Detection Utility

Create a utility function to detect the current environment:

```typescript
// In utils/environment.ts
export type Environment = "production" | "staging" | "localhost";

export function detectEnvironment(): Environment {
  // For browser environments
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;

    // Check for staging subdomain or domain pattern
    if (hostname.includes("staging") || hostname.includes("stage")) {
      return "staging";
    }

    // Check for localhost or development domains
    if (hostname === "localhost" || hostname.includes("127.0.0.1") || hostname.includes(".local")) {
      return "localhost";
    }

    // Default to production
    return "production";
  }

  // For Node.js environments
  if (typeof process !== "undefined" && process.env) {
    const nodeEnv = process.env.NODE_ENV;
    const etsEnv = process.env.ETS_ENVIRONMENT;

    if (etsEnv === "staging") return "staging";
    if (etsEnv === "localhost" || nodeEnv === "development") return "localhost";
  }

  // Default fallback
  return "production";
}
```

### 7. App Integration for Environment Selection

Modify web applications to use the environment detection:

```tsx
// In apps/app/context/SystemContext.tsx
import { detectEnvironment, type Environment } from "../utils/environment";

export const SystemContext = createContext<{
  environment: Environment;
  setEnvironment: (env: Environment) => void;
  // ... other context values
}>({
  environment: "production",
  setEnvironment: () => {},
  // ... defaults for other values
});

export const SystemProvider = ({ children }: { children: React.ReactNode }) => {
  const [environment, setEnvironment] = useState<Environment>(detectEnvironment());

  // ... rest of provider

  return (
    <SystemContext.Provider value={{ environment, setEnvironment, /* other values */ }}>
      {children}
    </SystemContext.Provider>
  );
};
```

### 8. Integration Testing Checklist

1. Deploy test contracts to a localhost network
2. Generate the new environment-aware contracts.ts file
3. Test SDK with explicit environment specifications:
   - `createEtsClient({ chainId: 421614, account, environment: "production" })`
   - `createEtsClient({ chainId: 421614, account, environment: "staging" })`
4. Test backward compatibility:
   - `createEtsClient({ chainId: 421614, account })` should default to production
5. Test environment detection in web applications
6. Test full integration with all environments

### 9. Versioning and Release Strategy

1. Create new minor versions for all affected packages:
   - @ethereum-tag-service/contracts: x.y.0 → x.(y+1).0
   - @ethereum-tag-service/sdk-core: x.y.0 → x.(y+1).0
   - @ethereum-tag-service/sdk-react-hooks: x.y.0 → x.(y+1).0

2. Include clear documentation on environment support in READMEs and CHANGELOGs

3. Consider a gradual migration strategy:
   - Phase 1: Deploy infrastructure with environment support
   - Phase 2: Update apps to explicitly specify environments
   - Phase 3: Set up CI/CD to deploy to the correct environments

### 10. Documentation Requirements

1. Update SDK documentation with environment parameter usage
2. Create internal documentation on environment matrix
3. Document deployment procedures for each environment
4. Include troubleshooting guides for common environment issues
