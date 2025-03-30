# ETS Environment Separation Plan

This document tracks our progress on creating separate environments (staging and production) for the ETS project.

## Latest Status Update (2025-03-29)

We've made significant progress on environment separation:

1. **Contracts**: Successfully deployed and verified all contracts to staging environments on Arbitrum Sepolia and Base Sepolia
2. **Subgraphs**: Deployed separate subgraphs for both production and staging environments
3. **SDK**: Implemented environment-aware SDK with support for "production", "staging", and "localhost" environments
4. **Oracle**: 
   - Created comprehensive deployment infrastructure for staging Oracle with:
     - Environment-specific configuration templates
     - Deployment scripts for AWS
     - CloudWatch monitoring setup
     - Verification and rollback capabilities
   - Successfully completed critical Oracle configuration:
     - Generated Airnode credentials for staging
     - Set up sponsor wallet funding and sponsorship relationship
     - Configured the ETSEnrichTarget contract with the Airnode parameters
   - AWS deployment is ready but encountered Terraform configuration issues

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

- [x] Create staging configuration for oracle
  - [x] Duplicate and modify config templates
  - [x] Update endpoint configurations
- [x] Create AWS deployment scripts for staging
  - [x] Generate Airnode credentials script
  - [x] Generate staging configuration script
  - [x] Setup sponsorship relationship script
  - [x] Configure requester script
  - [x] Deploy to AWS script
  - [x] Verification script
  - [x] Removal/maintenance script
- [x] Configure staging Airnode integration
  - [x] Create AWS infrastructure deployment scripts
  - [x] Create configuration templates for staging
  - [x] Set up sponsorship relationship scripts
  - [x] Add verification and monitoring capabilities
  - [x] Generate Airnode credentials for staging
  - [x] Configure ETSEnrichTarget contract with Airnode parameters
- [x] Update oracle scripts to support environment flags
- [x] Resolve AWS deployment configuration issues
  - [x] Switch to Docker-based deployment approach as recommended in documentation
  - [x] Update scripts to handle Docker container deployment
  - [x] Create separate aws.env file for Docker deployment
- [ ] Test oracle integration with staging contracts
- [ ] Update offchain API to be environment-aware
  - [ ] Add optional `staging` boolean parameter to all endpoints
  - [ ] Modify controllers to use environment-specific SDK clients
  - [ ] Update subgraph queries to use environment-specific endpoints
  - [ ] Add environment-specific configuration settings

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

### 6. Future Improvements

- [ ] Separate admin and sponsor roles for the Oracle deployment
  - Currently the sponsor wallet requires admin privileges in the ETS system
  - Ideally these should be separate concerns for better security
- [ ] Resolve AWS deployment Terraform configuration issues
  - After switching to Docker-based deployment, we still encountered Terraform state file issues
  - These issues appear to be related to previously incomplete deployments or permissions problems
  - Consider using manual AWS console deployment or a different deployment approach
- [ ] Consider containerized deployment alternatives for production
  - Given the challenges with AWS Lambda deployment, a containerized approach might be more reliable
  - Docker Compose or Kubernetes would provide more direct control and visibility
  - Self-hosted Docker container could run on EC2 with simpler configuration

### 7. Alternative Deployment Options

#### Local Docker Container Option

Instead of AWS Lambda, consider running the Airnode in a Docker container:

```bash
# Run Airnode locally with Docker
docker run -d --name ets-oracle-staging \
  -e AIRNODE_WALLET_MNEMONIC="acid relax humble just wasp mask skin weird nurse core original miracle" \
  -e CHAIN_PROVIDER_URL="https://arb-sepolia.g.alchemy.com/v2/TjjzoNYlIqWqZxcoufe60bhVbARhkxYX" \
  -v "/Users/User/Sites/ets/apps/oracle/config/staging/config.json:/app/config/config.json" \
  -p 8090:8090 \
  api3/airnode-client:0.15.0
```

This approach is easier to debug and doesn't require Terraform state management.

#### Managed Service Option

For more reliability without AWS Lambda complexity:

1. Deploy an EC2 instance with Docker installed
2. Run the Airnode in a Docker container
3. Set up auto-scaling and monitoring through AWS tools directly
4. Use API Gateway to expose endpoints if needed

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

### Oracle Staging

``` env
# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=<your-aws-access-key>
AWS_SECRET_ACCESS_KEY=<your-aws-secret-key>

# Airnode Configuration
AIRNODE_STAGING_MNEMONIC=<airnode-wallet-mnemonic>
HTTP_GATEWAY_API_KEY=<gateway-api-key>
HEARTBEAT_API_KEY=<heartbeat-api-key>
HEARTBEAT_URL=<optional-monitoring-url>

# Network Configuration
ARBITRUM_SEPOLIA_URL=<arbitrum-sepolia-rpc-url>
BASE_SEPOLIA_URL=<base-sepolia-rpc-url>
STAGING_API_URL=<staging-offchain-api-url>

# Deployment Configuration
DEPLOYMENT_ID=ets-staging-oracle
NOTIFICATION_EMAIL=<alert-email>
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
- Offchain API: https://ets-offchain-api.onrender.com
- Explorer UI: (to be created)
- Oracle: (configured for contract integration)
  - Airnode Address: 0x62676653F23c313a235e179eb19CbA308A45728c
  - Sponsor Wallet: 0xeab6569dEC788B05d94607C49eD20F509f9d6a09

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

## Airnode Oracle Deployment to AWS (Staging Environment)

### 1. Prerequisites

- AWS Account with appropriate permissions 
- Docker installed for running the Airnode deployer
- Staging contract addresses for ETSEnrichTarget and AirnodeRrpV0/AirnodeRrpV0Proxy
- Environment variables for staging deployment in .env.staging
- Offchain API endpoint for staging environment

### 2. AWS Resources Setup

- [x] Create IAM User "ets-airnode-staging-deployer" with appropriate permissions:
  - [x] AmazonAPIGatewayAdministrator
  - [x] AWSLambda_FullAccess
  - [x] CloudWatchLogsFullAccess
  - [x] IAMFullAccess
  - [x] AmazonS3FullAccess
- [x] Set up CloudWatch for monitoring and logging

### 3. Docker-Based Deployment Process

The AWS deployment now uses the official Docker-based process as recommended in the Airnode documentation:

```bash
# The deployment process runs a Docker container with mounted configuration
docker run -it --rm \
  -e USER_ID=$(id -u) -e GROUP_ID=$(id -g) \
  -v "${configDir}:/app/config" \
  api3/airnode-deployer:latest deploy
```

This approach offers several advantages:
- More consistent deployment environment
- Avoids issues with local Terraform plugin installation
- Better alignment with official API3 documentation and support
- Proper filesystem permissions management with USER_ID/GROUP_ID parameters

### 4. Required Files Structure

Our deployment requires three key files in the config directory:
1. `config.json` - The main Airnode configuration file (generated from template)
2. `secrets.env` - Environment variables including mnemonic and API keys
3. `aws.env` - AWS credentials for deployment

### 5. Deployment Command Flow

The updated process follows these steps:
1. Generate credentials (mnemonic, addresses, xpub)
2. Create config.json from template with appropriate values
3. Generate secrets.env with environment variables
4. Generate aws.env with AWS credentials
5. Run Docker-based deployment
6. Store receipt JSON for future reference or removal

### 6. Removal Process

To remove a deployment, we use the same Docker-based approach:

```bash
docker run -it --rm \
  -e USER_ID=$(id -u) -e GROUP_ID=$(id -g) \
  -v "${configDir}:/app/config" \
  api3/airnode-deployer:latest remove
```

This requires the receipt.json file to be present in the config directory.

### 8. Troubleshooting Common Issues

- **S3 Bucket Permissions**: Ensure the IAM user has S3FullAccess
- **Terraform State File Issues**: This is a significant persistent issue
  - Error: "Can't update an Airnode with missing files: default.tfstate"
  - Potential causes: Previous failed deployments, incomplete cleanup, permission issues
  - Attempted solutions:
    - Running in fresh directories
    - Using environment variables instead of files
    - Trying the DO_NOT_CHECK_STATE option
    - Different Docker containers
  - Recommended solution: Consider alternative deployment approaches (see section 7)
- **Receipt File Not Found**: Make sure the receipt.json path is correctly specified
  - For removal, the receipt file must be in the root of the config directory
  - Our scripts automatically copy from receipts/ directory if needed
- **Configuration Validation Errors**: Check the gasPriceOracle configuration has both strategies
  - Must include both providerRecommendedGasPrice and constantGasPrice strategies
- **Missing TTY Error**: When running Docker with `-it` flags in scripts
  - Solution: Remove the interactive terminal flags when running in scripts

### 9. Completed Implementation Status

We've successfully completed these critical components:

1. **Airnode Credentials**: Successfully generated and saved
   - Airnode Address: 0x62676653F23c313a235e179eb19CbA308A45728c
   - Private keys and mnemonic securely stored

2. **Sponsorship Relationship**: Successfully established
   - Sponsor wallet derived and funded: 0xeab6569dEC788B05d94607C49eD20F509f9d6a09
   - Sponsorship transaction confirmed on-chain

3. **Requester Configuration**: Successfully completed
   - ETSEnrichTarget configured with the correct Airnode parameters
   - Ready to request data when the Oracle is available

4. **AWS Deployment**: Attempted with multiple approaches
   - Encountered persistent Terraform state file issues 
   - AWS IAM permissions appear to be correct
   - Docker-based deployment attempted with same issues
   - Alternative approaches documented for future implementation

This means that the on-chain components are ready for Oracle integration, which is the most critical part of the implementation. When the backend deployment issues are resolved or an alternative deployment method is implemented, the system will be ready to use without additional blockchain transactions.

### 10. Conclusion and Next Steps

The Oracle integration for the ETS project is partially complete, with the most critical blockchain components successfully implemented. 

**What Works:**
- Oracle credentials generation and management
- Smart contract integration and configuration
- Sponsorship relationship establishment

**What Needs Resolution:**
- Airnode deployment to either AWS or an alternative hosting service
- HTTP Gateway endpoint availability

**Recommended Next Steps:**
1. Try direct AWS console deployment using the Airnode Lambda package
2. Consider a containerized approach on EC2 or another hosting service
3. Focus testing on the contract integration mechanisms once a live endpoint is available

### 5. Implementation of Key Modules

#### 5.1. Configuration Generator for Staging

```typescript
// scripts/20-generate-staging-config.ts
import { promises as fs } from "node:fs";
import path from "node:path";
import { deriveEndpointId } from "@api3/airnode-admin";
import * as dotenv from "dotenv";
import Handlebars from "handlebars";
import type { AirnodeCredentials } from "../types/airnode";

// Load environment variables
dotenv.config();

export async function generateStagingConfig() {
  try {
    console.log("Generating Staging Airnode configuration...");

    // Create config directory if it doesn't exist
    const configDir = path.join(__dirname, "../config/staging");
    await fs.mkdir(configDir, { recursive: true });

    // Read the airnode credentials
    const credentialsPath = path.join(configDir, "airnode-credentials.json");
    let credentials: AirnodeCredentials;
    try {
      const credentialsData = await fs.readFile(credentialsPath, "utf8");
      credentials = JSON.parse(credentialsData);
      console.log(`Read Airnode credentials for address: ${credentials.airnodeAddress}`);
    } catch (error) {
      console.error("Error reading Airnode credentials for staging. Please run generate-airnode-credentials with staging environment first.");
      throw error;
    }

    // Initialize template data object
    const templateData: Record<string, any> = {};

    // Add Airnode variables
    templateData.airnodeWalletMnemonicVar = "${AIRNODE_WALLET_MNEMONIC}";
    
    // Add AWS specific variables
    templateData.awsRegion = process.env.AWS_REGION || "us-east-1";
    templateData.httpGatewayApiKey = "${HTTP_GATEWAY_API_KEY}";
    templateData.heartbeatApiKey = "${HEARTBEAT_API_KEY}";
    templateData.heartbeatUrl = process.env.HEARTBEAT_URL || "";

    // Read AirnodeRrpV0 contract address for staging
    try {
      const airnodeRrpPath = path.join(
        __dirname,
        "../../../packages/contracts/deployments/arbitrumSepoliaStaging/AirnodeRrpV0Proxy.json",
      );

      try {
        const airnodeRrpData = JSON.parse(await fs.readFile(airnodeRrpPath, "utf8"));
        templateData.airnodeRrpAddress = airnodeRrpData.address;
        console.log(`Found AirnodeRrpV0Proxy contract at: ${templateData.airnodeRrpAddress}`);
      } catch (_error) {
        console.error("Error: Could not find AirnodeRrpV0Proxy deployment file for staging.");
        console.error("Please ensure the contracts are deployed to staging environment before running this script.");
        throw new Error("AirnodeRrpV0Proxy staging deployment not found");
      }

      // Read ETSEnrichTarget contract address for staging
      const etsEnrichTargetPath = path.join(
        __dirname,
        "../../../packages/contracts/deployments/arbitrumSepoliaStaging/ETSEnrichTarget.json",
      );

      try {
        const etsEnrichTargetData = JSON.parse(await fs.readFile(etsEnrichTargetPath, "utf8"));
        templateData.etsEnrichTargetAddress = etsEnrichTargetData.address;
        console.log(`Found Staging ETSEnrichTarget contract at: ${templateData.etsEnrichTargetAddress}`);
      } catch (_error) {
        console.error("Error: Could not find ETSEnrichTarget deployment file for staging.");
        console.error("Please ensure the contract is deployed to staging environment before running this script.");
        throw new Error("ETSEnrichTarget staging deployment not found");
      }
    } catch (error) {
      console.error(`Error reading staging deployment artifacts: ${error}`);
      throw error;
    }

    // Set staging-specific values
    templateData.chainId = "421614"; // Arbitrum Sepolia chain ID
    templateData.rpcUrl = process.env.ARBITRUM_SEPOLIA_URL || "https://sepolia-rollup.arbitrum.io/rpc";
    templateData.stagingApiUrl = process.env.STAGING_API_URL || "https://api-staging.ets.xyz"; // Staging API endpoint

    // Generate endpoint IDs using the official Airnode utility
    const oisTitle = "ETS API";

    // For the enrichTarget endpoint
    templateData.enrichTargetEndpointId =
      process.env.STAGING_ENRICH_TARGET_ENDPOINT_ID || deriveEndpointId(oisTitle, "enrichTarget");

    // For the nextAuction endpoint
    templateData.nextAuctionEndpointId =
      process.env.STAGING_NEXT_AUCTION_ENDPOINT_ID || deriveEndpointId(oisTitle, "nextAuction");

    console.log(`Staging Enrich Target Endpoint ID: ${templateData.enrichTargetEndpointId}`);
    console.log(`Staging Next Auction Endpoint ID: ${templateData.nextAuctionEndpointId}`);

    templateData.logLevel = process.env.AIRNODE_LOG_LEVEL || "INFO";

    // Read the staging template file
    const templatePath = path.join(__dirname, "../config/templates/staging.template.json");
    const template = await fs.readFile(templatePath, "utf8");

    // Process the template with Handlebars
    const compiledTemplate = Handlebars.compile(template);
    const configData = compiledTemplate(templateData);

    // Write the processed config to config.json
    const configPath = path.join(configDir, "config.json");
    await fs.writeFile(configPath, configData);

    // Create secrets.env file with the required environment variables
    const secretsContent = `
AIRNODE_WALLET_MNEMONIC=${process.env.AIRNODE_STAGING_MNEMONIC || credentials.mnemonic}
HTTP_GATEWAY_API_KEY=${process.env.HTTP_GATEWAY_API_KEY || generateRandomApiKey()}
HEARTBEAT_API_KEY=${process.env.HEARTBEAT_API_KEY || generateRandomApiKey()}
AWS_ACCESS_KEY_ID=${process.env.AWS_ACCESS_KEY_ID || ""}
AWS_SECRET_ACCESS_KEY=${process.env.AWS_SECRET_ACCESS_KEY || ""}
    `.trim();

    const secretsPath = path.join(configDir, "secrets.env");
    await fs.writeFile(secretsPath, secretsContent);

    console.log(`Airnode staging config generated at: ${configPath}`);
    console.log(`Airnode staging secrets generated at: ${secretsPath}`);
    return true;
  } catch (error) {
    console.error("Error generating staging config:", error);
    throw error;
  }
}

// Helper function to generate random API keys
function generateRandomApiKey() {
  return `${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
}

// For command-line usage
if (require.main === module) {
  generateStagingConfig()
    .then(() => console.log("Staging Airnode config generation completed"))
    .catch((error) => {
      console.error("Error in Staging Airnode config generation:", error);
      process.exit(1);
    });
}
```

#### 5.2. AWS Deployment Module

```typescript
// scripts/50-deploy-staging-airnode.ts
import { promises as fs } from "node:fs";
import path from "node:path";
import { exec as execCallback } from "child_process";
import util from "util";
import * as dotenv from "dotenv";

// Convert exec to promise-based version
const exec = util.promisify(execCallback);

// Load environment variables
dotenv.config();

export async function deployStagingAirnode() {
  try {
    console.log("Deploying Airnode to AWS...");

    // Check for AWS credentials
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
      console.error("Error: AWS credentials not found in environment variables.");
      console.error("Please ensure AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY are set.");
      throw new Error("AWS credentials not found");
    }

    // Check if the Airnode deployer is installed
    try {
      await exec("npx @api3/airnode-deployer --version");
      console.log("Airnode deployer is available");
    } catch (error) {
      console.log("Installing Airnode deployer...");
      await exec("npm install -g @api3/airnode-deployer");
    }

    const configDir = path.join(__dirname, "../config/staging");
    const receiptDir = path.join(configDir, "receipts");

    // Create receipts directory if it doesn't exist
    await fs.mkdir(receiptDir, { recursive: true });

    // Deploy using Airnode deployer
    console.log("Starting deployment... (this may take a few minutes)");
    const deployCommand = `npx @api3/airnode-deployer deploy \
      --config ${path.join(configDir, "config.json")} \
      --secrets ${path.join(configDir, "secrets.env")} \
      --receipt ${path.join(receiptDir, `receipt-${Date.now()}.json`)}`;

    // Execute deployment
    const { stdout, stderr } = await exec(deployCommand);
    
    if (stderr) {
      console.warn("Deployment warnings:", stderr);
    }

    console.log("Deployment output:", stdout);

    // Check for successful deployment by looking for the latest receipt file
    const files = await fs.readdir(receiptDir);
    const receiptFiles = files.filter(file => file.startsWith("receipt-")).sort();
    
    if (receiptFiles.length === 0) {
      throw new Error("No deployment receipt found, deployment may have failed");
    }

    const latestReceiptPath = path.join(receiptDir, receiptFiles[receiptFiles.length - 1]);
    const receiptData = JSON.parse(await fs.readFile(latestReceiptPath, "utf8"));

    console.log("\nDeployment completed successfully!");
    console.log("Deployment details:");
    console.log(`- Airnode Address: ${receiptData.airnodeWallet.airnodeAddress}`);
    console.log(`- Stage: ${receiptData.deployment.stage}`);
    console.log(`- Region: ${receiptData.deployment.region}`);
    console.log(`- HTTP Gateway URL: ${receiptData.deployment.httpGatewayUrl}`);
    
    // Create a deployment-info.json file with critical information
    const deploymentInfo = {
      airnodeAddress: receiptData.airnodeWallet.airnodeAddress,
      httpGatewayUrl: receiptData.deployment.httpGatewayUrl,
      deploymentTimestamp: new Date().toISOString(),
      environment: "staging",
    };

    await fs.writeFile(
      path.join(configDir, "deployment-info.json"),
      JSON.stringify(deploymentInfo, null, 2)
    );

    console.log("\nDeployment info saved to:", path.join(configDir, "deployment-info.json"));
    return true;
  } catch (error) {
    console.error("Error deploying Airnode to AWS:", error);
    throw error;
  }
}

// For command-line usage
if (require.main === module) {
  deployStagingAirnode()
    .then(() => console.log("Airnode AWS deployment completed"))
    .catch((error) => {
      console.error("Error in Airnode AWS deployment:", error);
      process.exit(1);
    });
}
```

### 6. Verification and Monitoring

Once deployed, we need to verify the Oracle is working correctly:

```typescript
// scripts/60-verify-staging-oracle.ts
import * as ethers from "ethers";
import * as dotenv from "dotenv";
import path from "path";
import { promises as fs } from "fs";

dotenv.config();

async function verifyOracleHealth() {
  try {
    console.log("Verifying Staging Oracle health...");

    // Load deployment info
    const configDir = path.join(__dirname, "../config/staging");
    const deploymentInfoPath = path.join(configDir, "deployment-info.json");
    const deploymentInfo = JSON.parse(await fs.readFile(deploymentInfoPath, "utf8"));

    // Check HTTP Gateway response
    console.log("Testing HTTP Gateway connectivity...");
    const httpGatewayUrl = deploymentInfo.httpGatewayUrl;
    
    const gatewayResponse = await fetch(`${httpGatewayUrl}/health`);
    if (!gatewayResponse.ok) {
      throw new Error(`HTTP Gateway health check failed: ${gatewayResponse.statusText}`);
    }
    
    const healthData = await gatewayResponse.json();
    console.log("Gateway health check response:", healthData);

    // Connect to blockchain
    console.log("Connecting to Arbitrum Sepolia testnet...");
    const provider = new ethers.providers.JsonRpcProvider(
      process.env.ARBITRUM_SEPOLIA_URL || "https://sepolia-rollup.arbitrum.io/rpc"
    );

    // Load contract ABI and address
    const etsEnrichTargetPath = path.join(
      __dirname,
      "../../../packages/contracts/deployments/arbitrumSepoliaStaging/ETSEnrichTarget.json"
    );
    const etsEnrichTargetData = JSON.parse(await fs.readFile(etsEnrichTargetPath, "utf8"));
    
    // Create contract instance
    const etsEnrichTarget = new ethers.Contract(
      etsEnrichTargetData.address,
      etsEnrichTargetData.abi,
      provider
    );

    // Check if Airnode parameters are set correctly
    console.log("Checking ETSEnrichTarget contract configuration...");
    const airnode = await etsEnrichTarget.airnode();
    const endpointId = await etsEnrichTarget.endpointId();
    const sponsorWallet = await etsEnrichTarget.sponsorWallet();

    console.log("Contract configuration:");
    console.log(`- Airnode: ${airnode}`);
    console.log(`- Endpoint ID: ${endpointId}`);
    console.log(`- Sponsor Wallet: ${sponsorWallet}`);

    // Verify Airnode address matches
    if (airnode.toLowerCase() !== deploymentInfo.airnodeAddress.toLowerCase()) {
      console.warn("⚠️ Warning: Airnode address mismatch between contract and deployment!");
      console.warn(`Contract: ${airnode}`);
      console.warn(`Deployment: ${deploymentInfo.airnodeAddress}`);
    } else {
      console.log("✅ Airnode address matches between contract and deployment");
    }

    console.log("\nStaging Oracle verification completed!");
    return true;
  } catch (error) {
    console.error("Error verifying Oracle:", error);
    throw error;
  }
}

if (require.main === module) {
  verifyOracleHealth()
    .then(() => console.log("Oracle verification completed"))
    .catch((error) => {
      console.error("Error in Oracle verification:", error);
      process.exit(1);
    });
}
```

### 7. Oracle Maintenance Scripts

Create utility scripts for common maintenance operations:

```typescript
// scripts/remove-staging-oracle.ts
import { promises as fs } from "node:fs";
import path from "node:path";
import util from "util";
import { exec as execCallback } from "child_process";
import * as dotenv from "dotenv";

// Convert exec to promise-based version
const exec = util.promisify(execCallback);

// Load environment variables
dotenv.config();

async function removeOracle() {
  try {
    console.log("Removing Staging Oracle from AWS...");

    // Check for AWS credentials
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
      console.error("Error: AWS credentials not found in environment variables.");
      console.error("Please ensure AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY are set.");
      throw new Error("AWS credentials not found");
    }

    const configDir = path.join(__dirname, "../config/staging");
    const receiptDir = path.join(configDir, "receipts");

    // Find the most recent receipt file
    const files = await fs.readdir(receiptDir);
    const receiptFiles = files.filter(file => file.startsWith("receipt-")).sort();
    
    if (receiptFiles.length === 0) {
      throw new Error("No deployment receipt found");
    }

    const latestReceiptPath = path.join(receiptDir, receiptFiles[receiptFiles.length - 1]);
    
    // Remove the deployment
    console.log(`Removing deployment using receipt: ${latestReceiptPath}`);
    const removeCommand = `npx @api3/airnode-deployer remove --receipt ${latestReceiptPath}`;

    const { stdout, stderr } = await exec(removeCommand);
    
    if (stderr) {
      console.warn("Removal warnings:", stderr);
    }

    console.log("Removal output:", stdout);
    console.log("\n✅ Oracle removal completed successfully!");
    
    // Update deployment-info to reflect removed status
    const deploymentInfoPath = path.join(configDir, "deployment-info.json");
    try {
      const deploymentInfo = JSON.parse(await fs.readFile(deploymentInfoPath, "utf8"));
      deploymentInfo.status = "removed";
      deploymentInfo.removalTimestamp = new Date().toISOString();
      await fs.writeFile(deploymentInfoPath, JSON.stringify(deploymentInfo, null, 2));
    } catch (error) {
      console.warn("Could not update deployment info file:", error);
    }

    return true;
  } catch (error) {
    console.error("Error removing Oracle:", error);
    throw error;
  }
}

if (require.main === module) {
  removeOracle()
    .then(() => console.log("Oracle removal completed"))
    .catch((error) => {
      console.error("Error in Oracle removal:", error);
      process.exit(1);
    });
}
```

### 8. Required Environment Variables

To complete this deployment, we'll need to define a comprehensive set of environment variables:

```bash
# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=<your-aws-access-key>
AWS_SECRET_ACCESS_KEY=<your-aws-secret-key>

# Airnode Configuration
AIRNODE_STAGING_MNEMONIC=<airnode-wallet-mnemonic>
HTTP_GATEWAY_API_KEY=<gateway-api-key>
HEARTBEAT_API_KEY=<heartbeat-api-key>
HEARTBEAT_URL=<heartbeat-monitoring-url>

# Network Configuration
ARBITRUM_SEPOLIA_URL=<arbitrum-sepolia-rpc-url>
STAGING_API_URL=<staging-offchain-api-url>

# Logging
AIRNODE_LOG_LEVEL=INFO
```

### 9. Testing Plan

After deployment, execute these tests to confirm everything works:

1. Verify the HTTP Gateway returns a valid health check
2. Check contract configuration via script 60-verify-staging-oracle.ts
3. Create a test tagging record via the staging contract
4. Submit an enrichment request via the ETSEnrichTarget contract
5. Verify Airnode receives and processes the request
6. Confirm the target metadata is updated correctly

### 10. Monitoring Setup

For production-grade deployment, set up monitoring:

1. CloudWatch Dashboard with key metrics:
   - Lambda function invocations and errors
   - API Gateway requests and latency
   - Endpoint invocation count
   - Error rate

2. CloudWatch Alarms for:
   - High error rate (>5%)
   - Lambda function failures
   - No requests processed in 24 hours

3. Automated health check:
   - HTTP endpoint test every 5 minutes
   - Alert on failure

### 11. Security Considerations

To ensure our Oracle deployment is secure:

1. Use IAM roles with least privilege
2. Secure API Gateway with API keys
3. Isolate Oracle resources in a separate VPC
4. Encrypt all sensitive data at rest and in transit
5. Regularly rotate API keys
6. Log all access and changes to the Oracle

### 12. Rollback Plan

In case of issues, have a clear rollback strategy:

1. Keep the previous working Oracle deployment receipt
2. Script to quickly remove the problematic deployment
3. Script to redeploy using the previous working configuration
4. Process to update contract parameters back to previous values

This comprehensive staging environment Oracle deployment plan will allow smooth testing before moving to production while keeping all environments separate and maintainable.

## Oracle Deployment Guide

To deploy the staging Oracle to AWS, follow these steps:

1. **Preparation**:
   ```bash
   # Copy the example environment file and fill in required values
   cp apps/oracle/.env.staging.example apps/oracle/.env.staging
   # Edit the file with your AWS credentials and configuration
   nano apps/oracle/.env.staging
   ```

2. **Docker Requirements**:
   ```bash
   # Ensure Docker is installed and running
   docker --version
   
   # The deployment will use the official Airnode deployer Docker image
   # No need to install Terraform or other tools locally
   ```

3. **Deployment**:
   ```bash
   # Step 1: Run the preparation script
   cd apps/oracle
   pnpm run deploy:staging
   
   # This will:
   # 1. Generate credentials if needed
   # 2. Create config files
   # 3. Set up sponsorship relationships
   # 4. Configure requester contracts
   # 5. Output Docker command for manual AWS deployment
   
   # Step 2: Run the Docker command that was displayed
   # The command will look like this:
   cd /Users/User/Sites/ets/apps/oracle/config/staging && \
   docker run --rm --platform linux/amd64 \
     -e USER_ID=$(id -u) -e GROUP_ID=$(id -g) \
     -v "$(pwd):/app/config" \
     api3/airnode-deployer:latest deploy
   ```

4. **Verification**:
   ```bash
   # Run the verification script to ensure everything works
   pnpm run verify:staging
   
   # Run the test script to perform a real Oracle request
   pnpm run test:staging
   ```

5. **Maintenance**:
   ```bash
   # Step 1: To remove the deployment, run the preparation script
   pnpm run remove:staging
   
   # Step 2: Run the Docker removal command that was displayed
   # The command will look like this:
   cd /Users/User/Sites/ets/apps/oracle/config/staging && \
   docker run --rm --platform linux/amd64 \
     -e USER_ID=$(id -u) -e GROUP_ID=$(id -g) \
     -v "$(pwd):/app/config" \
     api3/airnode-deployer:latest remove
   
   # For logs and monitoring
   # Use the AWS CloudWatch console to view logs under:
   # - Lambda functions with names containing the Airnode address
   # - API Gateway with name containing the Airnode address and stage "staging"
   ```

## AWS Monitoring Setup

The Oracle deployment includes monitoring with AWS CloudWatch:

1. **CloudWatch Metrics**:
   - Lambda function invocations and errors
   - API Gateway requests and latency
   - HTTP Gateway availability
   - Request processing time

2. **CloudWatch Alarms**:
   - Error rate threshold (>5%)
   - Lambda function failures
   - No activity threshold (24 hours)

3. **Logs**:
   - Function execution logs
   - API Gateway access logs
   - Error tracking with structured JSON

## Testing the Offchain API

The offchain API is hosted on render.com at the following URL:

```
https://ets-offchain-api.onrender.com
```

### Offchain API Environment Awareness Plan

To support our environment separation strategy, the offchain API needs to be updated to be environment-aware. This will allow the API to return data from either the staging or production environments based on a request parameter.

#### Implementation Plan

1. **Add Environment Parameter**:
   - Add an optional `staging` boolean parameter to all API endpoints
   - Default value is `false` (production environment)
   - When `staging=true`, the API will query staging contracts and subgraphs

2. **Environment-Aware SDK Usage**:
   - Modify API controllers to pass the environment parameter to SDK clients
   - Update SDK client creation to include the appropriate environment:
   ```typescript
   const environment = req.body.staging ? "staging" : "production";
   const client = createEtsClient({ 
     chainId, 
     account,
     environment 
   });
   ```

3. **Subgraph Query Updates**:
   - Update subgraph query functions to use environment-specific endpoints
   - Create environment-specific fetch utilities

4. **Configuration Updates**:
   - Add staging environment URLs to the API configuration
   - Create environment-specific logger contexts for better debugging

5. **Deployment Updates**:
   - Update deployment scripts to include environment variables for both environments
   - Ensure the same API instance can serve both environments

#### Testing Strategy

After implementation, the API can be tested with these commands:

```bash
# Get next auction from production environment (default)
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"chainId": 421614, "returnType": "json"}' \
  https://ets-offchain-api.onrender.com/api/auction/next

# Get next auction from staging environment
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"chainId": 421614, "returnType": "json", "staging": true}' \
  https://ets-offchain-api.onrender.com/api/auction/next

# Get next auction in Airnode format from production
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"chainId": 421614}' \
  https://ets-offchain-api.onrender.com/api/auction/next

# Get next auction in Airnode format from staging
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"chainId": 421614, "staging": true}' \
  https://ets-offchain-api.onrender.com/api/auction/next
```

The endpoint expects a JSON body with:
- Required: `chainId` (number) - The blockchain network ID
- Optional: `returnType` (string) - Set to "json" for a more detailed response or omit for the Airnode-compatible format
- Optional: `staging` (boolean) - Set to `true` to query staging environment, defaults to `false` for production