# Zora Integration Specification for TAG Coins

## Executive Summary

This document specifies the integration strategy between ETS (Ethereum Tag Service) and Zora platform for creating ERC-20 TAG coins. The approach uses Zora's Content Coins infrastructure to transform ETS tags into tradeable tokens while maintaining ETS as the canonical source of truth.

## Architecture Overview

```
User Creates Tag → ETS Core → TagCreated Event → Off-Chain Service → Zora CreateCoin → TAG Coin
```

## Key Design Decisions

### 1. Unified Symbol Strategy
**Decision**: All TAG coins will use the symbol "ETS"

**Rationale**:
- Eliminates symbol collision concerns entirely
- Creates brand cohesion across the ecosystem
- Leverages UI reliance on token names for distinction
- Simplifies implementation and determinism

**Implementation**:
```javascript
symbol: "ETS"  // Same for all TAG coins
```

### 2. Tag Identifier Strategy
**Decision**: Use Zora coin addresses AS tag identifiers

**Benefits**:
- Eliminates need for separate ETS tagId mapping
- Deterministic address prediction via Zora's salt mechanism
- Direct `tagString ↔ coinAddress` relationship
- Simplified architecture

**Implementation**:
```javascript
const salt = keccak256(encodePacked(machineName));
const predictedAddress = computeCreate2Address(salt, bytecode, deployer);
```

### 3. Metadata Strategy
**Decision**: Canonical formatting with original preservation

**Token Metadata**:
```javascript
{
  name: toTitleCase(tagString.slice(1)),     // "Bitcoin" (canonical)
  symbol: "ETS",                              // Unified symbol
  description: `TAG coin for #${canonicalName} - Created via ETS`,
  attributes: [
    {"trait_type": "Original Format", "value": originalInput},  // "#BiTCoiN"
    {"trait_type": "Creator", "value": creatorAddress},
    {"trait_type": "Machine Name", "value": machineName},       // "bitcoin"
    {"trait_type": "Created Via", "value": "ETS"}
  ],
  external_url: `https://ets.xyz/tags/${machineName}`
}
```

### 4. Economic Model
**Decision**: Tag creators as primary beneficiaries

**Configuration**:
- **payoutRecipient**: Tag creator (receives 10M tokens + 50% trading fees)
- **platformReferrer**: Relayer (receives 15% trading fees)
- **Creator (ETS EOA)**: Unified creator for consistency
- **Initial Supply**: 10M tokens (creator allocation)

### 5. ETS Creator Coin
**Decision**: Separate symbol for protocol token

**Options**:
- Primary: "$ETS" (if special characters allowed)
- Fallback: "ETSX" (differentiated with X suffix)
- Name: "Ethereum Tag Service"

## Technical Integration

### Zora CreateCoin Parameters
```javascript
{
  name: string,              // Canonical tag name
  symbol: "ETS",            // Unified symbol
  recipient: address,       // Tag creator address
  referrer: address,        // Relayer address
  metadata: {
    description: string,
    attributes: object[],
    external_url: string
  }
}
```

### Event Structure (TagCreated)
```solidity
event TagCreated(
    uint256 indexed tagId,        // ETS internal ID
    string tagString,             // Original input
    string machineName,           // Normalized version
    address indexed creator,      // Tag creator
    address indexed relayer,      // Sponsoring relayer
    uint256 timestamp
);
```

### Off-Chain Service Requirements
1. Listen for TagCreated events from ETS Core
2. Process events with idempotency controls
3. Call Zora CreateCoin with ETS EOA
4. Track coin addresses for tag mapping
5. Handle creator allocation distribution

## Edge Case Handling

### Unicode/Emoji Tags
- **Name**: Preserve as-is (no title casing)
- **Symbol**: "ETS" (unified approach)
- **Example**: "#🔥" → name: "🔥", symbol: "ETS"

### Long Tag Names
- **Name**: Full name preserved (Zora handles truncation in UI)
- **Symbol**: "ETS" (no truncation needed)

### Special Characters
- **Machine Name**: Normalized per ETS rules
- **Display Name**: Canonical format
- **Original**: Preserved in attributes

## Security Considerations

### EOA Management
- Hardware Security Module (HSM) or AWS KMS
- Multi-signature backup procedures
- Transaction monitoring and alerts
- Emergency pause mechanisms

### Rate Limiting
- Queue-based processing with Redis
- Retry logic with exponential backoff
- Dead letter queue for failed transactions

## Implementation Phases

### Phase 1: Foundation (Current)
- ✅ Research and strategy (this document)
- 🔄 Add TagCreated event to ETS Core (#529)
- ⏳ Off-chain service development (#531)
- ⏳ EOA security infrastructure (#532)

### Phase 2: Economic Integration
- Fee distribution system
- Referral automation
- Treasury management

### Phase 3: Advanced Features
- No-fee mode support
- Bulk operations
- Enhanced monitoring

## Testing Strategy

### Testnet Validation
1. Deploy test ETS Core with TagCreated event
2. Create sample tags with various formats
3. Validate coin creation on Zora testnet
4. Test creator allocation claims
5. Verify fee distributions

### Test Cases
- ASCII tags: "bitcoin", "ethereum"
- Unicode: "🚀", "こんにちは"
- Long names: 100+ character tags
- Special chars: "web3.0", "ai/ml"
- Case variations: "BiTcOiN"

## Success Metrics
- Event processing latency < 30 seconds
- Coin creation success rate > 99.9%
- Gas costs within acceptable range
- Creator allocations distributed correctly
- Fee distributions working as designed

## Open Questions
- Gas optimization strategies for bulk operations
- Migration path for existing CTAG holders
- Governance mechanism for parameter updates

## Conclusion

This integration leverages Zora's Content Coins infrastructure to transform ETS tags into tradeable assets while maintaining ETS as the authoritative tag registry. The unified "ETS" symbol strategy eliminates complexity while creating strong brand cohesion across the ecosystem.

---

**Document Status**: APPROVED for implementation
**Last Updated**: 2025-08-11
**Next Steps**: Implement TagCreated event (#529)