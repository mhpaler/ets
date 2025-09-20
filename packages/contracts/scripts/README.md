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

## Using the ETS CLI

For most contract interactions, use the ETS CLI package which provides a comprehensive command-line interface:

```bash
# Navigate to CLI package
cd packages/ets-cli

# Install globally
pnpm link --global

# Use the CLI
ets relayer add "MyRelayer"
ets tags create "#ethereum" "#blockchain"
ets targets create "https://example.com"
ets roles check
ets testdata all
```

The CLI replaces the old Hardhat tasks and provides better user experience with:
- Proper authentication handling
- Network configuration
- Interactive feedback
- Comprehensive help text

See the [ETS CLI documentation](../../ets-cli/README.md) for full usage.

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