# Key Management Strategy - ETS TAG Coins

## Overview

This document outlines the key management strategy for ETS TAG Coins across different environments, using HD wallet mnemonics for deterministic role-based key derivation.

## HD Wallet Architecture

**Core Principle**: Use separate mnemonics per environment to derive all operational keys deterministically.

### Environment Mnemonics

- **Local Development**: `LOCAL_MNEMONIC` (or use default Hardhat mnemonic)
- **Base Sepolia (Staging)**: `STAGING_MNEMONIC` 
- **Base Mainnet (Production)**: `PRODUCTION_MNEMONIC`

### Role-Based Position Assignment

All environments use the same derivation path positions for consistency:

```
Position 0: ETSAdmin          → Contract deployment + ongoing admin functions
Position 1: ETSPlatform       → Platform operations, fee collection
Position 2: ETSEventProcessor → Temporal workflow callbacks & event processing  
Position 3: ETSZora           → Zora coin creation, profile-linked
```

## Environment-Specific Strategy

### Local Development (Hardhat/Anvil)

- **Purpose**: Local testing and development
- **Mnemonic**: `LOCAL_MNEMONIC` or Hardhat default
- **Security**: Low - test keys only, no real value
- **Rotation**: Freely changeable, reset with each local network restart
- **Funding**: Automatic from local faucet/genesis

### Base Sepolia (Staging)

- **Purpose**: Integration testing and pre-production validation
- **Mnemonic**: `STAGING_MNEMONIC` (12-word BIP39 mnemonic)
- **Security**: Medium - contains testnet ETH, linked to staging profiles
- **Funding**: Testnet faucets for all derived addresses
- **Zora Profile**: Staging profile linked to ETSZora address (position 3)

### Base Mainnet (Production)

- **Purpose**: Live production environment
- **Mnemonic**: `PRODUCTION_MNEMONIC` (12-word BIP39 mnemonic)
- **Security**: **CRITICAL** - contains real ETH, linked to production profiles
- **Funding**: Real ETH required for all operational addresses
- **Zora Profile**: Production profile manually linked to ETSZora address (position 3)

## Role Definitions and Responsibilities

### ETSAdmin (Position 0)

- **Primary Role**: Contract deployment and ongoing administration
- **Responsibilities**:
  - Deploy all ETS contracts during initial setup
  - Contract upgrades and administrative functions
  - Access control management
  - Emergency operations
- **Usage Pattern**: High during deployment, periodic for admin tasks
- **Gas Requirements**: High during deployment, moderate ongoing

### ETSPlatform (Position 1)

- **Primary Role**: Platform operations and fee management
- **Responsibilities**:
  - Platform fee collection and management
  - Revenue distribution operations
  - Platform-wide configuration changes
- **Usage Pattern**: Periodic platform operations
- **Gas Requirements**: Moderate, transaction-dependent

### ETSEventProcessor (Position 2)

- **Primary Role**: Automated event processing and workflow callbacks
- **Responsibilities**:
  - Temporal workflow contract callbacks
  - Automated event processing transactions
  - System automation operations
- **Usage Pattern**: High frequency, automated operations
- **Gas Requirements**: Consistent, predictable patterns
- **Critical**: Must maintain sufficient ETH for uninterrupted processing

### ETSZora (Position 3)

- **Primary Role**: Zora protocol integration and coin creation
- **Responsibilities**:
  - Create TAG coins on Zora protocol
  - Manage Zora profile integration
  - Handle Zora-specific operations
- **Critical Dependencies**:
  - **Zora Profile**: Manually linked to this address in Zora app
  - **Coin Ownership**: One of three owners of created coins
- **Usage Pattern**: High during coin creation periods
- **Gas Requirements**: High for coin creation, low for management

## Technical Implementation

### Viem HD Wallet Integration

```typescript
import { mnemonicToAccount } from 'viem/accounts'
import { createWalletClient, createPublicClient, http } from 'viem'
import { base, baseSepolia } from 'viem/chains'

// Environment-based mnemonic selection
const getMnemonic = (chainId: number): string => {
  if (chainId === 31337) return process.env.LOCAL_MNEMONIC || 'test test test...'
  if (chainId === 84532) return process.env.STAGING_MNEMONIC!
  if (chainId === 8453) return process.env.PRODUCTION_MNEMONIC!
  throw new Error(`Unsupported chain ID: ${chainId}`)
}

// Role-based account derivation
const getAccount = (role: 'admin' | 'platform' | 'eventProcessor' | 'zora', chainId: number) => {
  const mnemonic = getMnemonic(chainId)
  const positions = { admin: 0, platform: 1, eventProcessor: 2, zora: 3 }
  
  return mnemonicToAccount(mnemonic, { 
    addressIndex: positions[role] 
  })
}

// Usage example in services
class ZoraContractsService {
  constructor(chainId = 8453) {
    // Derive ETSZora account (position 3)
    this.account = getAccount('zora', chainId)
    
    this.walletClient = createWalletClient({
      account: this.account,
      chain: chainId === 84532 ? baseSepolia : base,
      transport: http(rpcUrl)
    })
  }
}
```

### Multi-Owner Coin Configuration

For TAG coins created on Zora, three owners are configured:

```typescript
// In ZoraContractsService
const buildCoinOwners = (chainId: number): Address[] => {
  const mnemonic = getMnemonic(chainId)
  
  return [
    mnemonicToAccount(mnemonic, { addressIndex: 1 }).address, // ETSPlatform
    mnemonicToAccount(mnemonic, { addressIndex: 3 }).address, // ETSZora  
    process.env.EXTERNAL_OWNER_ADDRESS as Address, // External owner (Privy/etc)
  ].filter(Boolean)
}
```

## Security Recommendations

### Critical Security Measures

1. **Mnemonic Protection**:
   - Store mnemonics in secure environment variables (never in code)
   - Use hardware security modules (HSM) in production
   - Implement mnemonic escrow/backup strategy with multiple secure locations
   - Never log or expose mnemonics in application logs

2. **Environment Separation**:
   - Completely separate mnemonics per environment
   - Never use production mnemonics in staging/development
   - Different Zora profiles per environment
   - Separate infrastructure and access controls

3. **Access Control**:
   - Limit production mnemonic access to essential personnel only
   - Implement multi-person authorization for mnemonic operations
   - Regular security audits of mnemonic access and usage
   - Use principle of least privilege for service accounts

### Operational Security

4. **Runtime Derivation**:
   - Derive keys at runtime, never store derived private keys
   - Clear mnemonics from memory after account derivation where possible
   - Use secure memory allocation for sensitive operations

5. **Monitoring and Alerts**:
   - Monitor all transactions from derived addresses
   - Alert on unexpected transaction patterns or large transfers
   - Track ETH balances across all derived addresses
   - Implement gas price limits and spending controls

## Mnemonic Rotation Strategy

### When to Rotate

- **Scheduled**: Annual rotation for production mnemonics
- **Compromise**: Immediate rotation if any derived key is compromised
- **Personnel Changes**: Rotation when key personnel leave
- **Security Incidents**: Rotation as part of incident response

### Rotation Complexity

**Low Impact Rotation**:
- ETSAdmin, ETSPlatform, ETSEventProcessor can be rotated with standard procedures
- Update contract permissions and service configurations

**High Impact Rotation**:
- **ETSZora**: Requires Zora profile migration to new derived address
- **Historical Data**: Previous coins remain owned by old addresses
- **Service Coordination**: All dependent services must update simultaneously

### Rotation Process

1. **Pre-Rotation Planning**:
   - Generate new environment mnemonic
   - Derive all new addresses and document changes
   - Plan Zora profile migration (for ETSZora address change)
   - Coordinate service downtime window
   - Prepare rollback procedures

2. **Rotation Execution**:
   - Update environment variables with new mnemonic
   - Restart all services to pick up new derived keys
   - Update contract permissions for new addresses
   - Migrate Zora profile to new ETSZora address
   - Update monitoring systems with new addresses
   - Transfer any transferable ownerships

3. **Post-Rotation Validation**:
   - Test all critical functionality with new keys
   - Verify Zora profile and coin creation works
   - Confirm all services operational
   - Monitor for any integration issues
   - Securely dispose of old mnemonic

## Environment Configuration

### Development (.env.local)
```bash
# Local development - use default Hardhat mnemonic or custom
LOCAL_MNEMONIC="test test test test test test test test test test test junk"
CHAIN_ID=31337

# External integrations (optional for local)
PRIVY_WALLET_ADDRESS=0x... # Optional external owner
```

### Staging (.env.staging)
```bash
# Base Sepolia - staging mnemonic
STAGING_MNEMONIC="[12_WORD_BIP39_MNEMONIC_FOR_STAGING]"
CHAIN_ID=84532

# External integrations
PRIVY_WALLET_ADDRESS=0x... # Staging Privy profile wallet
```

### Production (.env.production)
```bash
# Base Mainnet - production mnemonic (CRITICAL)
PRODUCTION_MNEMONIC="[12_WORD_BIP39_MNEMONIC_FOR_PRODUCTION]"
CHAIN_ID=8453

# External integrations  
PRIVY_WALLET_ADDRESS=0x... # Production Privy profile wallet
```

### Derived Address Reference

**Staging Example** (addresses derived from `STAGING_MNEMONIC`):
```bash
# These addresses are derived at runtime, not stored
# Position 0: ETSAdmin = 0x...
# Position 1: ETSPlatform = 0x...
# Position 2: ETSEventProcessor = 0x...
# Position 3: ETSZora = 0x...
```

## API Keys and External Integrations

### Blockchain Infrastructure

**Alchemy API Keys**:
```bash
# Environment-specific Alchemy keys
ALCHEMY_API_KEY_MAINNET=... # Base Mainnet RPC access
ALCHEMY_API_KEY_SEPOLIA=... # Base Sepolia RPC access
```

**Usage**: RPC connectivity for all blockchain operations
**Security**: Medium - rate limiting and usage monitoring
**Rotation**: Quarterly or as needed

### Zora Protocol Integration

**Zora API Key**:
```bash
ZORA_API_KEY=... # Zora SDK authentication
```

**Usage**: Pool configuration and Zora protocol interactions
**Security**: Medium - scoped to Zora operations only
**Rotation**: Based on Zora platform recommendations

### Internal Service Authentication

**Event Processor API Key**:
```bash
EVENT_PROCESSOR_API_KEY=... # Authentication for automated operations
```

**Usage**: Authenticates Temporal processor for automated blockchain operations
**Security**: High - enables automated contract operations
**Rotation**: Monthly or after security incidents

### External Platform Integration

**Privy Integration**:
```bash
PRIVY_APP_ID=...
PRIVY_APP_SECRET=...
```

**Usage**: User authentication and wallet management
**Security**: Critical - user data access
**Rotation**: Based on Privy platform recommendations

**Temporal Cloud** (if using hosted):
```bash
TEMPORAL_CLOUD_API_KEY=...
TEMPORAL_NAMESPACE=...
```

**Usage**: Temporal workflow orchestration
**Security**: Critical - workflow execution control
**Rotation**: Quarterly or after security incidents

### API Key Management Best Practices

1. **Environment Separation**: Separate API keys per environment
2. **Least Privilege**: Use most restrictive scopes possible
3. **Monitoring**: Track API usage and rate limits
4. **Rotation Schedule**: Regular rotation based on security level
5. **Secure Storage**: Environment variables only, never in code
6. **Access Logging**: Monitor and audit API key usage

## Backup and Recovery

### Mnemonic Backup Strategy

1. **Multiple Secure Locations**: Store mnemonic backups in geographically distributed secure locations
2. **Shamir's Secret Sharing**: Split production mnemonics using threshold schemes
3. **Offline Storage**: Paper wallets and hardware security devices
4. **Recovery Documentation**: Detailed procedures for mnemonic recovery
5. **Regular Testing**: Test recovery procedures with staging mnemonics

### Recovery Scenarios

1. **Lost Mnemonic Access**: Process to recover from secured backups
2. **Compromised Mnemonic**: Emergency rotation and service migration
3. **Service Account Issues**: Alternative access through backup procedures
4. **Infrastructure Failures**: Cross-region recovery capabilities
5. **Platform Integration Changes**: Adaptation procedures for external service changes

## Future Governance Considerations

### Multi-Signature Evolution

Current implementation uses single-signature HD-derived accounts for operational efficiency. Future governance requirements may introduce multi-signature controls:

**Potential Multi-Sig Roles**:
- **ETSAdmin**: Governance-controlled administrative functions
- **ETSPlatform**: Treasury and fee management through DAO
- **Emergency Functions**: Multi-sig controlled emergency operations

**Implementation Constraints**:
- **Zora Profile Limitation**: Zora profiles require single-signature addresses
- **Operational Efficiency**: High-frequency operations (ETSEventProcessor) need single-sig
- **Hybrid Architecture**: Multi-sig governance with single-sig execution

### Governance Transition Strategy

1. **Phase 1** (Current): Single-sig HD wallet for all operations
2. **Phase 2**: Multi-sig for admin functions, single-sig for operations  
3. **Phase 3**: Full DAO governance with operational delegation

## Compliance and Auditing

### Key Management Auditing

- **Mnemonic Access**: Track all access to production mnemonics
- **Derivation Logging**: Log key derivation events (without exposing keys)
- **Transaction Monitoring**: Monitor all transactions from derived addresses
- **Configuration Audits**: Track environment configuration changes
- **Security Reviews**: Quarterly audits of key management practices

### Address Monitoring

```bash
# Monitor all derived addresses per environment
STAGING_ADDRESSES={
  "ETSAdmin": "0x...",
  "ETSPlatform": "0x...", 
  "ETSEventProcessor": "0x...",
  "ETSZora": "0x..."
}

PRODUCTION_ADDRESSES={
  "ETSAdmin": "0x...",
  "ETSPlatform": "0x...",
  "ETSEventProcessor": "0x...", 
  "ETSZora": "0x..."
}
```

### Compliance Requirements

- **Data Protection**: Secure handling of mnemonics per data protection regulations
- **Financial Compliance**: Monitor transactions for regulatory compliance
- **Platform Terms**: Comply with Zora, Privy, and Alchemy terms of service
- **Key Retention**: Secure disposal of rotated mnemonics
- **Audit Trail**: Maintain comprehensive logs for security audits

## Implementation Checklist

### Immediate Actions

- [ ] Generate BIP39 mnemonics for each environment
- [ ] Set up secure mnemonic storage (HSM for production)
- [ ] Implement HD wallet derivation in all services
- [ ] Configure monitoring for all derived addresses
- [ ] Document derived address mappings per environment
- [ ] Set up API key management across all external services
- [ ] Test mnemonic-to-key derivation in staging environment

### Service Integration Tasks

- [ ] Update ZoraContractsService to use HD derivation
- [ ] Modify Temporal EventProcessor to use derived keys
- [ ] Update contract deployment scripts for HD wallets
- [ ] Configure multi-owner coin creation with derived addresses
- [ ] Test end-to-end integration with new key architecture

### Ongoing Maintenance

- [ ] Quarterly mnemonic security reviews
- [ ] Monthly API key rotation for critical services
- [ ] Monitor blockchain transactions from all derived addresses
- [ ] Update address monitoring as new services are added
- [ ] Test recovery procedures with staging mnemonics
- [ ] Document any changes to derivation patterns or roles

## Risk Assessment

### High Risk Scenarios

1. **Production Mnemonic Compromise**: Critical impact across all derived roles
   - **Impact**: Full environment compromise, immediate rotation required
   - **Mitigation**: Hardware security modules, limited access, monitoring

2. **ETSZora Profile Migration Failure**: Breaks coin creation functionality
   - **Impact**: Cannot create new TAG coins until resolved
   - **Mitigation**: Staging environment testing, Zora support coordination

3. **Multi-Environment Mnemonic Confusion**: Using wrong mnemonic in wrong environment
   - **Impact**: Production operations on staging, or staging keys in production
   - **Mitigation**: Clear environment naming, automated environment detection

4. **ETSEventProcessor ETH Depletion**: Automated workflows fail
   - **Impact**: TAG coin creation pipeline stops functioning
   - **Mitigation**: Balance monitoring, automatic funding alerts, backup funding

5. **API Key Compromise**: External service access compromised
   - **Impact**: Service disruption, potential data exposure
   - **Mitigation**: Regular rotation, usage monitoring, least privilege access

### Mitigation Strategies

1. **Environmental Controls**: 
   - Automated environment detection in services
   - Clear mnemonic naming conventions
   - Separate infrastructure per environment

2. **Security Controls**:
   - Production mnemonic access limited to essential personnel
   - Multi-factor authentication for mnemonic access
   - Regular security training and audits

3. **Operational Controls**:
   - Comprehensive testing in staging before production changes
   - Automated monitoring and alerting for all derived addresses
   - Incident response procedures for key compromise scenarios

4. **Recovery Controls**:
   - Tested backup and recovery procedures
   - Emergency contact procedures for external services
   - Rollback capabilities for service configuration changes

---

**Last Updated**: October 1, 2025
**Document Owner**: ETS Development Team
**Review Cycle**: Quarterly or after major platform changes