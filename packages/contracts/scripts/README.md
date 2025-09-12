# ETS Contract Scripts

This directory contains scripts for interacting with the ETS smart contracts. In Hardhat 3, the task API has changed, so we use scripts instead of tasks for most operations.

## Running Scripts

All scripts are run using the Hardhat `run` command:

```bash
npx hardhat run scripts/<script-name>.ts --network <network>
```

## Available Scripts

### Core Scripts

#### `deploy.ts`
Deploys all ETS contracts using Hardhat Ignition modules.
```bash
pnpm deploy:localhost
pnpm deploy:baseSepolia
pnpm deploy:base
```

#### `configure-ets.ts`
Configures contracts after deployment (roles, linking, etc). This is automatically run for localhost deployments.
```bash
npx hardhat run scripts/configure-ets.ts --network localhost
```

### Utility Scripts

#### `accounts.ts`
Displays account balances and role assignments.
```bash
npx hardhat run scripts/accounts.ts --network localhost

# Show more accounts
COUNT=20 npx hardhat run scripts/accounts.ts --network localhost
```

#### `check-roles.ts`
Checks current role assignments in the ETS system.
```bash
npx hardhat run scripts/check-roles.ts --network localhost
```

### Relayer Management

#### `add-relayer.ts`
Adds a new relayer to the protocol.
```bash
# Add relayer with default signer (ETSAdmin)
NAME="MyRelayer" npx hardhat run scripts/add-relayer.ts --network localhost

# Add relayer with specific signer (0=ETSAdmin, 1=ETSPlatform, etc)
NAME="MyRelayer" SIGNER=1 npx hardhat run scripts/add-relayer.ts --network localhost
```

## Converting Old Tasks

The old Hardhat tasks in `scripts/tasks/` use an API that's no longer compatible with Hardhat 3. To use them:

1. Convert them to scripts (like the examples above)
2. Use environment variables instead of command-line arguments
3. Access Hardhat Runtime Environment via `import hardhat from "hardhat"`

### Example Conversion

Old task format:
```typescript
task("myTask", "Description")
  .addParam("param1", "Description")
  .setAction(async (taskArgs, hre) => {
    // task logic
  });
```

New script format:
```typescript
#!/usr/bin/env tsx
import hardhat from "hardhat";

async function main() {
  const param1 = process.env.PARAM1;
  
  // script logic using hardhat instead of hre
  const { viem } = await hardhat.network.connect();
  // ...
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
```

## Account Roles

The HD wallet uses these standard account positions:

- **Position 0**: ETSAdmin (Deployer)
- **Position 1**: ETSPlatform  
- **Position 2**: ETSEventProcessor
- **Position 3**: ETSZora
- **Position 4-7**: User1-4 (Test accounts)

## Network Configuration

Networks are configured in `hardhat.config.ts`. The scripts automatically detect the network from the `--network` flag passed to `hardhat run`.

For localhost development, ensure your local Hardhat node is running:
```bash
npx hardhat node
```