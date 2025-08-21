# ETS Hardhat Tasks - TypeScript & Zora TAG Coin Framework

> **✨ Modernized**: All tasks now use TypeScript, viem, and support the new Zora TAG coin architecture with Event Processor integration.

## Architecture Overview

- **🏠 Local Development**: Direct contract interaction with full validation
- **🌐 Production**: API guidance with fallback to manual operations
- **🔗 Address-Based TAGs**: Zora coin integration for TAG tokens
- **⚡ Event Processor**: Automated TAG creation and target enrichment
- **💎 Viem Client**: Modern Ethereum interaction library
- **🔍 Comprehensive Validation**: Network, contracts, permissions, and balance checks

---

## Account Management

### `accounts`

Displays account information with balances and role assignments.

```bash
hardhat accounts --network localhost
hardhat accounts --count 5 --network localhost
```

**Output:**
```bash
account0: 0x93A5f58566D436Cae0711ED4d2815B85A26924e6 Balance: 26.5949 ETH
         Role: ETSAdmin (Deployer)
account1: 0xE9FBC1a1925F6f117211C59b89A55b576182e1e9 Balance: 20.1431 ETH
         Role: ETSPlatform
account2: 0x60F2760f0D99330A555c5fc350099b634971C6Eb Balance: 11.0083 ETH
```

---

## Relayer Management

### `addRelayer`

Creates a new relayer in the protocol. Each account can own one relayer (unless they're a relayer admin).

```bash
hardhat addRelayer --name "MyRelayer" --signer account0 --network localhost
```

**Local Environment:**
- ✅ Validates relayer name availability
- ✅ Checks ownership constraints
- ✅ Verifies account permissions
- ✅ Deploys and registers relayer contract

### `checkRelayer`

Comprehensive relayer status check with troubleshooting guidance.

```bash
hardhat checkRelayer --name "MyRelayer" --network localhost
```

**Status Checks:**
- Registration and activity status
- Owner information
- Pause state and permissions
- Recent activity metrics

### `transferRelayer`

Transfer relayer ownership to a new account. Requires relayer to be paused.

```bash
hardhat transferRelayer --relayer "MyRelayer" --to "0x..." --signer account0 --network localhost
```

**Safety Features:**
- ✅ Ownership verification
- ✅ Pause state requirement
- ✅ New owner constraint validation
- ✅ Transaction simulation

### `togglePauseRelayerByOwner`

Toggle relayer pause state (owner or admin only).

```bash
hardhat togglePauseRelayerByOwner --relayer "MyRelayer" --signer account0 --network localhost
```

**Permissions:**
- Relayer owner can always pause/unpause
- Relayer admin can pause/unpause any relayer
- Automatic state verification

---

## TAG Operations (Zora Coin Framework)

### `createTags`

Creates TAG tokens using the new Zora coin integration. Each TAG becomes an ERC-20 token.

```bash
hardhat createTags --tags "#Bitcoin,#Ethereum,#DeFi" --relayer "MyRelayer" --signer account0 --network localhost
```

**Features:**
- 🏗️ **Zora Integration**: Each TAG becomes a tradeable ERC-20 coin
- 📍 **Address-Based**: TAGs identified by deterministic coin addresses
- ⚡ **Event Processor**: Automatic coin creation via TagCreated events
- 🔍 **Validation**: Case-insensitive, format validation, duplicate checking
- 📊 **Comprehensive Feedback**: Gas usage, coin addresses, validation status

**Local Environment Flow:**
1. Network connectivity check
2. Contract deployment verification
3. Relayer registration validation
4. TAG existence checking
5. Zora coin creation simulation
6. Transaction execution with confirmations
7. TAG validation and status reporting

**Production Environment:**
- Provides API endpoint guidance
- Handles complex Zora integration
- Manages IPFS metadata
- Optimizes gas costs

---

## Tagging Operations (Address-Based Architecture)

### `applyTags`

Creates tagging records using the new address-based TAG architecture.

```bash
hardhat applyTags --tags "#Bitcoin,#DeFi" --uri "https://bitcoin.org" --recordType "bookmark" --relayer "MyRelayer" --signer account0 --network localhost
```

**Features:**
- 🏷️ **Address-Based TAGs**: Uses coin addresses instead of token IDs
- 🔄 **Auto-Creation**: Missing TAGs are created automatically
- 💰 **Fee Calculation**: Dynamic tagging fees based on TAG count
- 📋 **Record Management**: Creates or appends to existing records
- 🎯 **Target Enrichment**: Optional enrichment via Event Processor

**Parameters:**
- `--uri`: URI being tagged
- `--tags`: Hashtags separated by commas
- `--recordType`: Arbitrary record type (default: "bookmark")
- `--relayer`: Relayer name
- `--signer`: Tagger account
- `--enrich`: Enable target enrichment (default: false)

### `removeTags`

Remove specific tags from an existing tagging record.

```bash
hardhat removeTags --tags "#Bitcoin" --uri "https://bitcoin.org" --recordType "bookmark" --relayer "MyRelayer" --signer account0 --network localhost
```

**Validation:**
- Record existence verification
- TAG presence in record validation
- Ownership permission checking

### `replaceTags`

Replace all tags in a tagging record with new ones.

```bash
hardhat replaceTags --tags "#Cryptocurrency,#Store-of-Value" --uri "https://bitcoin.org" --recordType "bookmark" --relayer "MyRelayer" --signer account0 --network localhost
```

**Process:**
1. Record existence validation
2. New TAG creation (if needed)
3. Atomic replacement operation
4. Fee calculation for new TAGs

---

## Deployment

### `deployETS`

Deploys the complete ETS protocol with Zora integration.

```bash
hardhat deployETS --network localhost
```

**Deployment Stack:**
- Core ETS contracts
- Zora factory integration
- Event processor configuration
- Access controls setup
- Initial relayer creation

---

## Environment-Aware Operation

### Local Development (`--network localhost`)

All tasks provide full contract interaction with:
- ✅ Network connectivity validation
- ✅ Contract deployment verification
- ✅ Permission and ownership checks
- ✅ Transaction simulation before execution
- ✅ Comprehensive error handling with guidance
- ✅ Gas usage reporting
- ✅ State validation after operations

### Production Networks

Tasks provide guidance for:
- 🌐 API endpoint usage
- 📋 Manual operation procedures
- ⚠️ Safety considerations
- 🔗 Web interface alternatives

---

## Common Usage Patterns

### Full Development Workflow

```bash
# 1. Start local environment
./scripts/start-core-stack.sh

# 2. Check accounts
hardhat accounts --network localhost

# 3. Add relayer
hardhat addRelayer --name "DevRelayer" --signer account1 --network localhost

# 4. Create TAGs
hardhat createTags --tags "#Test,#Development" --relayer "DevRelayer" --network localhost

# 5. Create tagging records
hardhat applyTags --tags "#Test" --uri "https://example.com" --relayer "DevRelayer" --network localhost

# 6. Manage relayer
hardhat togglePauseRelayerByOwner --relayer "DevRelayer" --signer account1 --network localhost
```

### Production Operations

```bash
# Check status
hardhat checkRelayer --name "ProductionRelayer" --network mainnet

# Get API guidance
hardhat createTags --tags "#Production" --network mainnet
```

---

## Error Handling & Troubleshooting

All tasks include comprehensive error handling with specific guidance:

- **🔌 Network Issues**: Connection troubleshooting
- **📋 Contract Issues**: Deployment and configuration help
- **🔐 Permission Issues**: Role and ownership guidance
- **💰 Balance Issues**: Insufficient funds detection
- **⛽ Gas Issues**: Transaction simulation and optimization
- **🏷️ TAG Issues**: Format validation and existence checking

---

## Migration from Legacy Tasks

### Removed (Obsolete)
- ❌ `checkAirnodeParams` - Airnode removed
- ❌ `enrichTarget` - Replaced by Event Processor
- ❌ `enrichTargetDirect` - Replaced by Event Processor

### Converted & Enhanced
- ✅ `accounts` → Modern TypeScript with role information
- ✅ `addRelayer` → viem integration with validation
- ✅ `createTags` → Zora coin framework support
- ✅ `applyTags` → Address-based TAG architecture
- ✅ `removeTags` → Enhanced validation and error handling
- ✅ `replaceTags` → Atomic operations with fee calculation
- ✅ `transferRelayer` → Safety features and state verification
- ✅ `togglePauseRelayerByOwner` → Permission validation

---

## Technical Details

### Zora TAG Coin Integration
- Each TAG becomes an ERC-20 token on Zora
- Deterministic coin addresses computed from TAG strings
- Automatic coin creation via Event Processor
- Metadata and IPFS integration

### Address-Based Architecture
- TAGs identified by coin addresses (not token IDs)
- Case-insensitive normalization
- Efficient lookups and validation
- Seamless integration with DeFi protocols

### Event Processor Integration
- Automatic TAG coin creation
- Target enrichment workflows
- Asynchronous processing
- Offchain API coordination

### Modern Development Stack
- **TypeScript**: Type safety and modern JavaScript features
- **Viem**: Modern Ethereum client library
- **Comprehensive Validation**: Multi-step verification processes
- **Error Recovery**: Specific guidance for common issues
- **Gas Optimization**: Transaction simulation and fee estimation