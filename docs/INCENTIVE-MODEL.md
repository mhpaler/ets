# ETS TAG Coin Economic Model

## Phase 1: MVP Launch (Current Implementation)

### Core Principle: Launch Simple, Learn Fast

The MVP focuses on simplicity and data gathering before implementing complex incentive mechanisms.

### Trading Fee Distribution
- **Creator**: 100% of creator fees (0.5% of trade volume)
- **ETS Platform**: Platform referrer fees only (0.15-0.25% of trade volume)
- **Channel/Relayer**: No allocation in MVP

### Tagging Fees
- Collected directly to ETS treasury
- No distribution mechanism in Phase 1
- Used to understand usage patterns and fee volumes

### Initial TAG Coin Allocation
- 10MM TAG coins minted to ETS wallet (HD position 3)
- Held as strategic reserve - no distribution in Phase 1
- Will be deployed based on market feedback and traction

### Why This Approach Works
1. **Minimal Complexity** = Faster launch and easier debugging
2. **Real Data** > Theoretical models
3. **Flexibility** to pivot based on actual usage
4. **No Lock-in** to complex mechanisms that may not fit user behavior

---

## Phase 2: Market Buy & Cashback

Once usage patterns emerge, implement automated market operations.

### Tagging Fee Flow
When a tag is applied in a tagging record:
1. Use tagging fee to **market buy** the TAG coin being used
2. Distribute purchased coins:
   - 40% to tagger (cashback incentive)
   - 40% burn (deflationary pressure)
   - 20% to ETS treasury (sustainability)

### Benefits
- Creates automatic buy pressure for actively used tags
- Taggers earn the coins they're using
- Natural price discovery (popular tags = higher price)
- Deflationary mechanism for successful tags

---

## Phase 3: Liquidity & Staking

### Liquidity Provision
Deploy portion of 10MM initial allocation:
- 5MM TAG coins paired with ETH/ZORA in Uniswap V3
- Concentrated liquidity positions for capital efficiency
- Earn trading fees to compound treasury

### Staking Pools
- TAG holders can stake for additional yield
- Staking rewards from treasury allocation
- Weighted by usage metrics (not just stake size)

---

## Phase 4: Full Automated Market Operations

### Complete Economic Loop
```
Tag Creation → Initial Liquidity → Usage → Buy Pressure →
Price Discovery → Creator Rewards → More Creation
```

### 10MM Allocation Strategy
- **5,000,000**: Liquidity provision (Uniswap V3)
- **3,000,000**: Tagger rewards reserve
- **2,000,000**: Strategic partnerships & integrations

### Advanced Mechanisms
- Dynamic fee adjustment based on tag popularity
- Cross-tag liquidity pools
- Yield optimization strategies
- DAO governance for parameter updates

---

## Metrics to Track (Phase 1)

### Tag Creation Metrics
- Tags created per day/week
- Creator concentration (power creators vs long tail)
- Channel usage patterns
- Gas costs per tag creation

### Tag Usage Metrics
- Tags applied per day/week
- Most used tags (volume leaders)
- Tagging fee revenue per tag
- Unique taggers per tag

### Market Metrics
- Natural price movements per tag
- Trading volume distribution
- Creator fee earnings
- Platform referrer fee totals

### User Behavior
- Creator → tagger conversion
- Tag reuse patterns
- Cross-tag correlation
- Channel effectiveness

---

## Key Decisions Made

### MVP Decisions (Locked In)
✅ Creator gets 100% of trading fees initially
✅ No split contracts in MVP (saves gas)
✅ Hold 10MM TAG coins without distribution
✅ Collect tagging fees to treasury

### Future Considerations
- 80/20 creator/channel split (post-MVP)
- 0xSplits integration for transparent distribution
- Automated market maker for fee processing
- Diminishing rewards for early taggers

---

## Implementation Notes

### Current State
The system is already configured for the MVP model:
- `payoutRecipient` = creator address
- `platformReferrer` = ETS platform address
- No additional contracts needed

### Phase 2 Requirements
- Market buy integration with Zora
- Token distribution logic
- Burn mechanism implementation
- Cashback tracking system

### Risk Mitigation
- Start with small test allocations
- Monitor for gaming/exploitation
- Gradual rollout of incentives
- Emergency pause mechanisms

---

## Success Criteria

### Phase 1 Success
- 1,000+ tags created
- 10,000+ tagging operations
- Clear usage patterns identified
- Sufficient fee volume for Phase 2

### Long-term Success
- Self-sustaining fee model
- Active secondary markets for popular tags
- Creator-driven growth
- Network effects in tag usage