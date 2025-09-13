# ETS CLI

Command-line interface for interacting with ETS (Ethereum Tag Service) smart contracts.

## Installation

```bash
# From the ets-cli package directory
pnpm install
pnpm build
```

## Configuration

Create a `.env` file in the package directory (copy from `.env.example`):

```bash
# Required: Either PRIVATE_KEY or MNEMONIC
PRIVATE_KEY=your_private_key_here
# or
MNEMONIC=your twelve word mnemonic phrase here

# Optional
ACCOUNT_INDEX=0  # When using mnemonic
NETWORK=localhost # Default network
DEBUG=false       # Enable debug output
```

## Usage

### Global Options

All commands support these options:
- `-n, --network <network>` - Network to use (localhost, baseSepolia, base)
- `-d, --debug` - Enable debug output
- `-h, --help` - Display help

### Commands

#### System Information

```bash
# Display deployment information
ets info [--detailed]

# Show current account info
ets account
```

#### Relayer Management

```bash
# Add a new relayer
ets relayer add <name>

# Get relayer information
ets relayer info <name>

# List all relayers
ets relayer list

# Pause a relayer
ets relayer pause <name>
```

#### Role Management

```bash
# Check roles for an address (defaults to current wallet)
ets roles check [address]

# List system role assignments
ets roles list
```

#### Tag Operations

```bash
# Create new tags
ets tags create tag1 tag2 tag3 [--relayer ETSRelayer]

# Apply tags to a target
ets tags apply "https://example.com" tag1 tag2 [--relayer ETSRelayer]

# Get tag information
ets tags info <tag>
```

## Examples

### Basic Setup

```bash
# Check deployment status
ets info --network localhost

# Check your account and roles
ets account
ets roles check
```

### Managing Relayers

```bash
# Add a new relayer
ets relayer add MyRelayer --network localhost

# Check relayer status
ets relayer info MyRelayer

# Pause the relayer
ets relayer pause MyRelayer
```

### Working with Tags

```bash
# Create some tags
ets tags create defi ethereum blockchain

# Apply tags to a URL
ets tags apply "https://ethereum.org" ethereum blockchain web3

# Check if a tag exists
ets tags info ethereum
```

## Development

```bash
# Run in development mode (watch for changes)
pnpm dev

# Run directly with tsx
pnpm ets <command>

# Type checking
pnpm typecheck

# Linting
pnpm lint
```

## Network Support

The CLI supports the following networks:
- `localhost` (default) - Local Hardhat node
- `baseSepolia` - Base Sepolia testnet
- `base` - Base mainnet

Contract addresses are automatically loaded from the deployment artifacts.

## Security

- Never commit your `.env` file
- Keep your private keys and mnemonics secure
- Use hardware wallets for production operations

## License

MIT