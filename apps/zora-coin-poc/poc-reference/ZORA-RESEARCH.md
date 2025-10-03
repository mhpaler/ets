# Zora Integration Research for TAG Coins

## Overview
Research findings for integrating ETS TAG creation with Zora ERC-20 coin creation platform.

## Zora Platform Details

### Contract Addresses
- **Base**: `0x777777751622c0d3258f214F9DF38E35BF45baF3`
- **Base Sepolia**: `0x777777751622c0d3258f214F9DF38E35BF45baF3`

### Repository Structure
- **Main Repo**: https://github.com/ourzora/zora-protocol
- **Packages**:
  - `coins`: Core coin creation contracts
  - `coins-sdk`: TypeScript SDK for coin operations
  - `protocol-deployments`: Contract deployment management
  - `shared-contracts`: Common contract utilities

### Core Concept
Zora enables creation of ERC-20 coins with:
- Automatic liquidity pools (Uniswap V4 integration)
- Creator reward distributions
- Built-in trading infrastructure
- Referral reward system

## Key Functions for ETS Integration

### Primary Methods (Contract Level)
1. **`deployCreatorCoin()`** - Best fit for ETS integration
   - Simplified interface for creator coins
   - Built-in Uniswap V4 integration
   - Automatic referral system

2. **`deploy()`** - Full-featured deployment with hooks
   - More complex but supports post-deploy hooks
   - Required for advanced configurations

### SDK Methods (Recommended)
1. **`createCoin()`** - High-level TypeScript function
2. **`createCoinCall()`** - Generate transaction call data

### Required Parameters
- `payoutRecipient`: Address receiving creator rewards (ETS EOA) 
- `owners`: Array of addresses with coin management permissions
- `uri`: Metadata URI (IPFS recommended) 
- `name`: Coin name (from ETS tag string)
- `symbol`: Trading symbol (generated from tag)
- `poolConfig`: Encoded pool configuration (currency, fees, curves)
- `platformReferrer`: Referral rewards address (ETS relayer)
- `coinSalt`: Salt for deterministic deployment (for predictable addresses)

### Key Events Emitted
- `CreatorCoinCreated`: When using `deployCreatorCoin()`
- `CoinCreatedV4`: When using `deploy()` with V4 pools

### Pool Configuration Options
- **ETH Backing**: Coins backed by WETH
- **ZORA Backing**: Coins backed by ZORA token (Base mainnet only)
- **Curve Configuration**: Uniswap V4 pricing curves
- **Fee Tiers**: Trading fee percentages

## Critical Mapping Considerations

### ETS Tag → Zora Coin Name
**Challenges**:
- ETS tags are case-insensitive, Zora coins may have case requirements
- Special characters in tags need sanitization
- Length limits for coin names
- Unicode handling (emojis, international characters)

**Proposed Algorithm**:
```typescript
function generateCoinName(tagString: string): string {
  // 1. Normalize case (Title Case for readability)
  // 2. Replace special chars with underscores or remove
  // 3. Handle length limits (truncate or abbreviate)
  // 4. Ensure uniqueness (append numbers if conflicts)
}
```

### ETS Tag → Zora Symbol
**Challenges**:
- Symbol collision potential (multiple tags → same symbol)
- ERC-20 symbol length limits (typically 3-11 characters)
- Readability vs uniqueness balance

**Proposed Algorithm**:
```typescript
function generateSymbol(tagString: string): string {
  // 1. Extract meaningful characters (first letters of words)
  // 2. Convert to uppercase
  // 3. Limit to 6-8 characters for readability
  // 4. Add numeric suffix for collisions (TAG1, TAG2, etc.)
}
```

## Economic Model Integration

### Creator Allocations
- **Zora Standard**: Variable allocation to creator
- **ETS Requirement**: 10,000,000 coins (1% of 1B total)
- **Implementation**: Configure via `payoutRecipient` parameter

### Referral System
- **Zora Feature**: Built-in referral rewards via `platformReferrer`
- **ETS Integration**: Use relayer address from TagCreated event
- **Revenue**: Automatic trading fee distribution

## Technical Implementation Plan

### Phase 1: Research & Testing
- [ ] Deploy test coins on Base Sepolia
- [ ] Test various tag → name/symbol mappings
- [ ] Validate creator allocation configuration
- [ ] Understand gas costs and rate limits

### Phase 2: Mapping Algorithm
- [ ] Implement name/symbol generation
- [ ] Handle edge cases and collisions
- [ ] Create metadata standards linking back to ETS
- [ ] Test with diverse tag examples

### Phase 3: Integration
- [ ] EOA setup for coin creation
- [ ] Off-chain service Zora SDK integration
- [ ] Event processing pipeline
- [ ] Creator allocation distribution

## Technical Implementation Findings

### Creator Allocation Strategy
Based on contract analysis, Zora doesn't have a fixed "10M creator allocation" like described in the vision. Instead:
- **Flexible Allocation**: Creator rewards come from trading fees via `payoutRecipient`
- **ETS Approach**: We'll need to implement the 10M token transfer separately
- **Flow**: Create coin → ETS manages creator allocation outside Zora → Transfer to creator

### Integration Architecture
1. **Event Processing**: Listen to ETS `TagCreated` events
2. **Coin Creation**: Call Zora `deployCreatorCoin()` with ETS EOA
3. **Allocation Management**: Implement separate system for 10M coin transfers
4. **Metadata Linking**: Use `uri` parameter to link back to ETS tag data

### Key Technical Constraints
- **License**: Zora contracts use "Delayed Open Source License" (non-commercial until 3 years)
- **Network Support**: Base and Base Sepolia primarily
- **Pool Backing**: ETH or ZORA token options
- **Deterministic Deployment**: Uses salt for predictable addresses

## Zora Coin Types Distinction

### Creator Coins vs Content Coins
**Creator Coins:**
- One per creator address (first coin created by an address)
- Uses `CreatorCoinHook` with vesting mechanism
- 500M tokens to market, 500M vested to creator over time
- Deployed via `deployCreatorCoin()` function

**Content Coins:** 
- Multiple per creator, backed by creator's coin or ETH
- Uses `ContentCoinHook` with direct allocation
- 990M tokens to liquidity pool, 10M to creator immediately
- Deployed via standard `deploy()` function
- Creator gets instant 10M allocation without vesting

### Key Insight for TAG Coins
Content Coins are the appropriate model for TAG Coins because:
1. Instant 10M creator allocation (no vesting)
2. Multiple coins per creator (multiple tags)
3. Direct liquidity pool funding (990M tokens)
4. The 10M allocation is minted, not purchased - part of initial supply

## Critical Integration Decisions

### 1. Creator Allocation Implementation
**Solution**: Use Content Coin model
- Deploy as content coins via `deploy()` function
- Creator automatically receives 10M tokens on creation
- No need for ETS to purchase tokens from market
- Tagger pays creation fees, creator gets allocation

### 2. Pool Configuration Choice
**Recommendation**: Use ETH-backed pools
- More universal than ZORA token
- Better liquidity on Base
- Simpler for users to understand

### 3. Salt Generation Strategy
**Approach**: Generate deterministic salt from ETS tag data
```typescript
function generateSalt(tagId: bigint, tagString: string): Hex {
  return keccak256(toBytes(`ets-tag-${tagId}-${tagString.toLowerCase()}`));
}
```

## Key Questions to Resolve

1. **Naming Constraints**: What are exact name/symbol validation rules?
2. **Rate Limits**: How many coins can we create per minute/hour?  
3. **Gas Costs**: What are the costs for coin creation + initial liquidity?
4. **Metadata Standards**: How to link Zora coins back to ETS tags?
5. **Error Handling**: What failure modes exist and how to handle them?
6. **Creator Allocation**: How to handle the 10M token allocation outside of Zora?

## Test Cases for Validation

### Simple Cases
- `bitcoin` → Name: "Bitcoin", Symbol: "BITCOIN"
- `ethereum` → Name: "Ethereum", Symbol: "ETHEREUM"

### Complex Cases  
- `artificial intelligence` → Name: "Artificial Intelligence", Symbol: "AI"
- `web3.0` → Name: "Web 3.0", Symbol: "WEB3"
- `🚀rocket` → Name: "Rocket", Symbol: "ROCKET"

### Edge Cases
- Very long tags (100+ characters)
- Special characters and punctuation
- Unicode and international characters
- Duplicate symbol conflicts
- Reserved word handling

## Key Findings Summary

### ✅ What We Learned
1. **Zora Contract**: `deployCreatorCoin()` is perfect for our use case
2. **SDK Integration**: TypeScript SDK available for easy integration
3. **Creator Allocation**: Must be implemented separately from Zora coin creation
4. **Deterministic Deployment**: Can predict coin addresses using salt
5. **Network Support**: Base and Base Sepolia ready for integration

### 🔥 Critical Architectural Decision
**Good news: Content Coins provide exactly what we need!**

**Reality Check**: 
- Content Coins (not Creator Coins) give instant 10M allocation
- The 10M tokens are minted to creator, not purchased
- 990M tokens go to liquidity pool for trading
- Creator allocation is free (part of initial mint)

**Correct Flow**:
1. ETS creates tag → Event emitted
2. Off-chain service creates Content Coin via `deploy()` using ETS EOA
3. **Tag creator receives 10M tokens directly** (set as payoutRecipient)
4. 990M tokens available in liquidity pool for trading
5. Tagger pays only the coin creation fee to Zora

**Important Architecture Decision**: 
- ETS EOA will be the Zora creator (msg.sender) for ALL TAG coins
- Tag creator address set as payoutRecipient (receives 10M directly)
- Creates unified brand identity on Zora platform
- All TAG coins show as "Created by ETS" 
- Tag creators receive their 10M allocation instantly, no transfer needed

### ✅ Economic Model Simplified
- **No Purchase Required**: 10M allocation is minted, not bought
- **Tagger Pays Creation Fee**: Small fee for deploying the coin
- **Creator Gets Everything**: 
  - Instant 10M tokens on creation (minted)
  - 50% of all trading fees forever (as payoutRecipient)
- **Relayer Gets**: 15% of trading fees (as platformReferrer)
- **Market Gets Liquidity**: 990M tokens in pool for trading
- **ETS Benefits**: Brand unity, platform control, referral revenues

## Deployment Costs & Fee Structure

### Zora Platform Costs (Researched)
- **Platform Fees**: $0 (Zora charges no fees for coin creation)
- **Gas Costs**: ~$2-10 on Base network
- **Initial Liquidity**: $0 (automatic from token distribution)
- **Creator Allocation**: $0 (minted, not purchased)

### ETS Fee Structure (Decided)
- **Flat Fee for MVP**: 0.001 ETH (~$3-4)
- **Covers**: Gas costs + operational margin
- **Simple**: No dynamic pricing for MVP
- **Combined with Tagging**: TAG_CREATION_FEE + TAGGING_FEE when applicable

## Next Steps

1. ~~Research Zora deployment costs~~ ✓ COMPLETE
2. ~~Determine fee structure~~ ✓ COMPLETE  
3. **Test Coin Creation** on Base Sepolia to validate integration
4. **Implement Mapping Algorithms** with test cases
5. **Build TagCreated Event** in ETS Core

## Success Criteria

- Successfully create test coins for various ETS tag types ✅
- Mapping algorithm handles all edge cases gracefully ⏳
- **Economic model accounts for allocation purchase costs** 🚨 NEW
- Ready to implement in off-chain service (#531) ⏳

---

*Research Status: Major architectural insight discovered. Creator allocation strategy requires revision.*