# TAG Coins Economic Model - Final Decisions

## Date: 2025-08-09

## Executive Summary

After extensive research and deliberation, the following economic model has been decided for TAG Coins integration with Zora.

## Key Architectural Decisions

### 1. Tag Identification System
- **Revolutionary Approach**: Use Zora coin address AS the tag identifier
- **Eliminates ETS tagIds**: Deterministic Zora addresses replace traditional hash IDs
- **Predictable addressing**: Can pre-compute coin address from tag string
- **Machine name for salt**: Always use normalized lowercase for deterministic generation
- **Direct mapping**: `tagString ↔ coinAddress` (no intermediate IDs needed)

### 2. Metadata Strategy (Canonical + Original Preservation)
**Zora Coin Metadata** (Professional):
- **Name**: Title Case canonical format (`"Bitcoin"`)  
- **Symbol**: Uppercase standard format (`"BITCOIN"`)
- **Description**: Standardized description with ETS attribution
- **Attributes**: Include original creator format in metadata

**ETS Data Preservation**:
- Store original creator input exactly as provided (`"#BiTCoiN"`)
- Maintain creator attribution and original vision
- Link to Zora coin via deterministic address
- Display flexibility across different interfaces

**Benefits**:
- Professional Zora presence for trading/integrations
- Creator vision preserved in metadata and ETS
- Enterprise-friendly standardized presentation
- Rich attribution system

### 3. Coin Creation Model
- **Coin Type**: Content Coins (not Creator Coins)
- **Deployment Method**: Use Zora's `deploy()` function
- **Initial Supply**: 1 billion tokens (standard for all Zora coins)
- **Distribution**: 10M to creator (minted), 990M to liquidity pool

### 2. Role Assignments

#### ETS EOA Role
- **Acts as**: The `msg.sender` calling deploy() 
- **Purpose**: Creates unified brand identity on Zora
- **Result**: All TAG coins show "Created by ETS" on Zora platform
- **Does NOT receive**: Initial token allocation or trading fees

#### Tag Creator Role  
- **Set as**: `payoutRecipient` parameter in deploy()
- **Receives**: 
  - 10M tokens immediately upon coin creation (minted, not purchased)
  - 50% of all trading fees in perpetuity
- **No additional transfers needed**: Direct allocation from Zora

#### Relayer Role
- **Set as**: `platformReferrer` parameter in deploy()
- **Receives**: 15% of all trading fees
- **Incentive**: Rewards relayers who facilitate tag creation

### 3. Revenue Model Separation

#### ETS Protocol Revenue (On-chain)
- **Tag Creation Fees**: Charged when new tags are minted
- **Tagging Fees**: Charged when tags are applied to targets  
- **Enterprise Features**: Premium namespaces, bulk operations, etc.
- **Key Point**: ETS stays out of TAG coin tokenomics entirely

#### TAG Coin Revenue (Zora)
- **Trading Fees**: Distributed by Zora automatically
  - 50% → Tag Creator (payoutRecipient)
  - 15% → Relayer (platformReferrer)
  - 15% → Trade Referrer (if any)
  - 20% → Protocol/LPs/Doppler
- **No ETS involvement**: Clean separation of concerns

### 4. Economic Flow

```
1. Tagger pays ETS tag creation fee
2. ETS TagCreated event emitted
3. Off-chain service detects event
4. Service calls Zora deploy() with:
   - ETS EOA as msg.sender (creator)
   - Tag creator as payoutRecipient
   - Relayer as platformReferrer
5. Tag creator receives 10M tokens instantly
6. 990M tokens go to liquidity pool
7. Trading begins, fees flow automatically
```

### 5. Rejected Alternative Models

#### Protocol Rewards Model (Rejected)
- **Concept**: ETS as payoutRecipient, distributes tagging fees to token holders
- **Why Rejected**: 
  - Adds unnecessary complexity
  - Regulatory concerns
  - Fights against Zora's simplicity
  - Distracts from core ETS mission

#### ETS Treasury Funding Model (Rejected)
- **Concept**: ETS treasury purchases creator allocations
- **Why Rejected**: 
  - Content Coins mint allocations directly
  - No purchase necessary
  - Would require significant treasury

### 6. Benefits of Chosen Model

#### For Tag Creators
- Immediate token allocation (10M)
- Perpetual trading fee revenue (50%)
- No complex claiming mechanisms
- Clear value proposition

#### For ETS
- Clean revenue model from protocol fees
- No tokenomics management burden
- Unified brand on Zora
- Scalable without treasury requirements

#### For Relayers
- 15% of trading fees as incentive
- Rewards successful tag creation
- Aligns interests with ecosystem growth

#### For the Ecosystem
- Simple, understandable model
- Clear separation of concerns
- No conflicting incentives
- Room for future enhancements

## Implementation Notes

## Fee Structure (MVP)

### Costs Analysis
Based on research of Zora protocol:
- **Zora Platform Fees**: $0 (no fees for coin creation)
- **Gas Costs on Base**: ~$2-10 per deployment
- **Initial Liquidity**: $0 (990M tokens auto-provisioned)
- **Creator Allocation**: $0 (10M tokens minted, not purchased)

### ETS Flat Fee Structure
**TAG Creation Fee**: `0.001 ETH` (~$3-4)
- Covers gas costs with 2-3x buffer
- Simple, predictable pricing
- Low barrier to entry
- Adjustable via governance

**Combined Fees**:
```solidity
// Standalone tag creation
uint256 TAG_CREATION_FEE = 0.001 ether;

// Tag creation via tagging record
uint256 TAGGING_FEE = 0.0001 ether; // existing
uint256 totalFee = TAG_CREATION_FEE + TAGGING_FEE;
```

### Rationale
- **Accessibility**: Low enough to encourage experimentation
- **Sustainability**: Covers operational costs with margin
- **Simplicity**: Single flat fee for MVP
- **Scalability**: Can introduce dynamic pricing later

### Next Steps
1. ~~Research actual Zora deployment costs on Base~~ ✓
2. ~~Determine appropriate ETS fee structure~~ ✓
3. Implement TagCreated event in ETS Core
4. Build off-chain processing service
5. Secure EOA infrastructure

### Critical Requirements
- ETS EOA must be secured (hardware wallet/multisig)
- Fee structure must cover Zora costs + margin
- Event processing must be reliable and idempotent
- Clear documentation for creators about revenue model

## Decision Rationale

**"Simple is better than complex"**

This model was chosen because it:
- Minimizes technical complexity
- Provides clear, direct incentives
- Separates protocol and token layers cleanly
- Allows ETS to focus on being THE tag registry
- Gives creators maximum upside from their contributions

## Approval

This economic model has been reviewed and approved for implementation as part of the TAG Coins MVP.

---

*Last Updated: 2025-08-09*
*Status: APPROVED FOR IMPLEMENTATION*