# ETS Contract Upgrade Guide

This guide documents the standardized process for upgrading ETS contracts using Hardhat Ignition and the UUPS proxy pattern. Follow these steps exactly for safe, consistent upgrades.

## Prerequisites

- Node.js v22+ (required for Hardhat 3)
- Contract must use UUPS proxy pattern (all ETS contracts do)
- Admin role on the contract being upgraded
- Access to deployment network (testnet or mainnet)

## File Structure

```
packages/contracts/
├── contracts/
│   ├── ETSToken.sol          # Contract to upgrade
│   └── interfaces/
│       └── IETSToken.sol     # Interface (update if ABI changes)
├── ignition/
│   ├── modules/
│   │   └── ETSTokenUpgrade.ts    # Generic upgrade module (reusable)
│   └── parameters/
│       └── etsTokenUpgrade.json  # Network-specific proxy addresses
└── test/
    └── ETSToken.test.ts          # Update tests for new features
```

## Step-by-Step Upgrade Process

### Step 1: Make Contract Changes

1. **Edit the contract** (`contracts/ETSToken.sol`):
```solidity
// Update version constant
- string public constant VERSION = "0.0.1";
+ string public constant VERSION = "0.1.0";

// Add version history comment
/**
 * Version History:
 * - 0.0.1: Initial deployment
 * - 0.1.0: Added totalTagsCreated counter; Updated TagCreated event
 */

// Add your changes
uint256 public totalTagsCreated;  // New state variable
```

2. **Update interface if needed** (`contracts/interfaces/IETSToken.sol`):
```solidity
// If you changed events or added functions
event TagCreated(
    address indexed coinAddress,
    uint256 indexed tagId,  // NEW parameter
    ...
);
```

### Step 2: Create/Update Upgrade Module (One-Time Setup)

**Create generic upgrade module** (`ignition/modules/ETSTokenUpgrade.ts`):
```typescript
import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const ETSTokenUpgradeModule = buildModule("ETSTokenUpgrade", (m) => {
  const proxyAddress = m.getParameter("proxyAddress");

  // Deploy new implementation (constructor takes no args for UUPS)
  const newImplementation = m.contract("ETSToken", [], {
    id: "ETSTokenImplementation",  // Unique ID to avoid conflicts
  });

  // Get proxy reference
  const proxy = m.contractAt("ETSToken", proxyAddress);

  // Call upgradeTo on proxy
  m.call(proxy, "upgradeTo", [newImplementation], {
    id: "UpgradeETSToken",
  });

  return { upgradedProxy: proxy, newImplementation };
});

export default ETSTokenUpgradeModule;
```

### Step 3: Create Parameters File

1. **Find existing proxy address**:
```bash
cat ignition/deployments/chain-84532/deployed_addresses.json | jq '."ETSToken#ETSTokenProxy"'
# Output: "0xDB1Be3FC9BbD6697920A91AF43df1b7ec898AA86"
```

2. **Create parameters file** (`ignition/parameters/etsTokenUpgrade.json`):
```json
{
  "ETSTokenUpgrade": {
    "proxyAddress": "0xDB1Be3FC9BbD6697920A91AF43df1b7ec898AA86"
  }
}
```

### Step 4: Compile and Test

```bash
# Use Node 22 for Hardhat 3
nvm use 22

# Compile contracts
pnpm compile

# Run tests to ensure nothing broke
pnpm test

# Verify VERSION constant was updated
grep "VERSION = " contracts/ETSToken.sol
```

### Step 5: Deploy Upgrade

```bash
# Deploy to testnet first
npx hardhat ignition deploy ignition/modules/ETSTokenUpgrade.ts \
  --network baseSepolia \
  --parameters ignition/parameters/etsTokenUpgrade.json

# Confirm when prompted
# ✔ Confirm deploy to network baseSepolia (84532)? … yes
```

Expected output:
```
Deploying [ ETSTokenUpgrade ]

Batch #1
  Executed ETSTokenUpgrade#ETSTokenImplementation

Batch #2
  Executed ETSTokenUpgrade#UpgradeETSToken

[ ETSTokenUpgrade ] successfully deployed 🚀

Deployed Addresses
ETSTokenUpgrade#ETSToken - 0xDB1Be3FC9BbD6697920A91AF43df1b7ec898AA86  # Proxy (unchanged)
ETSTokenUpgrade#ETSTokenImplementation - 0x445b65CD13657a0620A1F2e4F043757a386AC25C  # New impl
```

### Step 6: Verify Upgrade

```bash
# Check VERSION on-chain
cast call <PROXY_ADDRESS> "VERSION()(string)" --rpc-url <RPC_URL>
# Should return: "0.1.0"

# Test new functionality
cast call <PROXY_ADDRESS> "totalTagsCreated()(uint256)" --rpc-url <RPC_URL>
# Should return: 0 (or current count)

# Verify proxy still at same address
cast call <PROXY_ADDRESS> "NAME()(string)" --rpc-url <RPC_URL>
# Should still work
```

### Step 7: Update ABIs for Consumers

```bash
# Build contracts package to export new ABIs
cd packages/contracts
pnpm build

# Update monorepo dependencies
cd ../..
pnpm install

# Restart any services that consume the contracts
# - Temporal Processor (needs new event signatures)
# - CLI tools (needs new functions)
# - Frontend apps (needs updated ABIs)
```

## Storage Layout Considerations

### ✅ SAFE Changes
- Adding state variables at the END
- Adding functions
- Adding events
- Changing function logic (not signatures)

### ❌ DANGEROUS Changes (Will Corrupt Data)
- Reordering state variables
- Removing state variables
- Changing variable types
- Modifying struct field order
- Removing struct fields

### Safe Struct Extension Example
```solidity
// BEFORE
struct Tag {
    string originalInput;
    address creator;
    uint256 timestamp;
}

// AFTER - SAFE (added at end)
struct Tag {
    string originalInput;
    address creator;
    uint256 timestamp;
    uint256 tagId;  // NEW field at end only
}
```

## Common Issues and Solutions

### Issue: "Module validation failed - autogenerated future id already used"
**Solution**: Add unique ID to contract deployment:
```typescript
const newImplementation = m.contract("ETSToken", [], {
  id: "ETSTokenImplementation",  // Add this
});
```

### Issue: "Constructor expects 0 arguments but 1 were given"
**Solution**: UUPS proxies have empty constructors. Don't pass args:
```typescript
// Wrong
m.contract("ETSToken", [accessControlsAddress])

// Correct
m.contract("ETSToken", [])
```

### Issue: "Node.js version not supported by Hardhat"
**Solution**: Use Node 22:
```bash
nvm use 22
```

### Issue: Services not detecting new events/functions
**Solution**: Rebuild and restart:
```bash
# Rebuild contracts package
cd packages/contracts && pnpm build

# Update dependencies
cd ../.. && pnpm install

# Restart services (they need new ABIs)
```

## Network-Specific Information

### Base Sepolia (Testnet)
- Chain ID: 84532
- RPC: https://sepolia.base.org
- Explorer: https://sepolia.basescan.org
- Deployments: `ignition/deployments/chain-84532/`

### Base Mainnet (Production)
- Chain ID: 8453
- RPC: https://mainnet.base.org
- Explorer: https://basescan.org
- Deployments: `ignition/deployments/chain-8453/`

### Localhost (Development)
- Chain ID: 31337
- RPC: http://127.0.0.1:8545
- Deployments: `ignition/deployments/chain-31337/`

## Semantic Versioning Guidelines

Use semantic versioning in VERSION constant:

- **0.0.x → 0.0.y**: Bug fixes, no API changes
- **0.x.0 → 0.y.0**: New features, backward compatible
- **0.x.y → 1.0.0**: First stable release
- **x.y.z → (x+1).0.0**: Breaking changes

For pre-1.0 contracts:
- Breaking changes: increment minor (0.1.0 → 0.2.0)
- Features/fixes: increment patch (0.1.0 → 0.1.1)

## Upgrade Checklist

- [ ] Update VERSION constant in contract
- [ ] Add version history comment
- [ ] Update interface if ABI changed
- [ ] Create/update upgrade module (generic, reusable)
- [ ] Create parameters file with proxy address
- [ ] Compile with `pnpm compile`
- [ ] Run tests with `pnpm test`
- [ ] Deploy to testnet first
- [ ] Verify upgrade on-chain
- [ ] Build package with `pnpm build`
- [ ] Update dependencies with `pnpm install`
- [ ] Restart dependent services
- [ ] Document changes in CHANGELOG.md
- [ ] Commit with descriptive message

## Example: Adding a Counter to ETSToken

This example shows the complete upgrade process for adding `totalTagsCreated`:

```bash
# 1. Edit contract
vim contracts/ETSToken.sol
# - Change VERSION from "0.0.1" to "0.1.0"
# - Add: uint256 public totalTagsCreated;
# - Update createTag() to increment counter
# - Update event to include tagId

# 2. Update interface
vim contracts/interfaces/IETSToken.sol
# - Add tagId to TagCreated event

# 3. Compile
nvm use 22
pnpm compile

# 4. Test
pnpm test

# 5. Deploy upgrade
npx hardhat ignition deploy ignition/modules/ETSTokenUpgrade.ts \
  --network baseSepolia \
  --parameters ignition/parameters/etsTokenUpgrade.json

# 6. Verify
cast call 0xDB1Be3FC9BbD6697920A91AF43df1b7ec898AA86 \
  "VERSION()(string)" --rpc-url https://sepolia.base.org
# Returns: "0.1.0"

cast call 0xDB1Be3FC9BbD6697920A91AF43df1b7ec898AA86 \
  "totalTagsCreated()(uint256)" --rpc-url https://sepolia.base.org
# Returns: 0

# 7. Build and distribute
cd packages/contracts && pnpm build
cd ../.. && pnpm install

# 8. Restart services
# Temporal Processor, CLI, etc.
```

## References

- [OpenZeppelin Upgrades Documentation](https://docs.openzeppelin.com/contracts/4.x/upgradeable)
- [Hardhat Ignition Documentation](https://hardhat.org/ignition/docs/getting-started)
- [UUPS Proxy Pattern](https://eips.ethereum.org/EIPS/eip-1822)
- [Storage Layout Best Practices](https://docs.openzeppelin.com/upgrades-plugins/1.x/writing-upgradeable#storage-gaps)

---

**Remember**: Always test on testnet first. Proxy upgrades are irreversible once executed.