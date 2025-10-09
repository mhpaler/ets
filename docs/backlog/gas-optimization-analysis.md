# Gas Optimization: Storage vs Event-Based Architecture

**Status:** Backlogged (Premature optimization - revisit post-MVP)
**Created:** 2025-10-08
**Estimated Effort:** 2-3 weeks
**Potential Savings:** 70% for tags, 33% for records

---

## Executive Summary

Analysis of moving TAG and TaggingRecord structs from on-chain storage to event-based architecture shows **significant gas savings are possible** (~70% for tags, ~33% for records), but with **critical constraints** that prevent a pure event-based approach.

**Recommendation:** Pragmatic Hybrid approach that removes descriptive strings while preserving business-critical fields (creator, channel for fee distribution; tagger for authorization; coinAddresses for operations).

**Why Backlogged:** This is premature optimization that would block MVP progress for 2-3 weeks, introduce risk to core business logic, and require extensive refactoring before we have real production usage data.

---

## Cost Analysis

### Current Storage Costs (Mainnet/Base at $3000 ETH, 20 Gwei)

#### Tag Struct (ETSToken.sol:271-279)
```solidity
struct Tag {
    string originalInput;      // ~40,000 gas (avg 10 chars)
    string displayVersion;     // ~40,000 gas
    string machineName;        // ~40,000 gas
    address coinAddress;       // 20,000 gas
    address creator;           // 20,000 gas
    address channel;           // 20,000 gas
    uint256 timestamp;         // 20,000 gas
}
```
**Total: ~200,000 gas per tag** ($12.00 mainnet, $0.12 Base)

#### TaggingRecord Struct (ETS.sol:564-570)
```solidity
struct TaggingRecord {
    address[] coinAddresses;   // ~80,000 gas (3 tags avg)
    uint256 targetId;          // 20,000 gas
    string recordType;         // ~40,000 gas (avg 10 chars)
    address channel;           // 20,000 gas
    address tagger;            // 20,000 gas
}
```
**Total: ~180,000 gas per record** ($10.80 mainnet, $0.11 Base)

### Pure Event-Based Costs (Theoretical)
- **SSTORE (cold):** 20,000 gas per slot
- **LOG (event):** ~375 gas base + 375 gas/topic + 8 gas/byte

**Theoretical minimums:**
- Tag: ~23,000 gas (88.5% reduction)
- Record: ~24,000 gas (86.7% reduction)

### Realistic Savings (After Constraints Analysis)

**Tags:** ~60,000 gas (70% reduction) = $3.60 mainnet, $0.04 Base
**Records:** ~120,000 gas (33% reduction) = $7.20 mainnet, $0.07 Base

---

## Critical Constraints

### 🚨 Constraint #1: Fee Distribution (BLOCKER)

**Location:** ETS.sol:619-632

```solidity
function _processAccrued(address _coinAddress, address _platform) private {
    // Called on EVERY tagging operation, not just tag creation
    IETSToken.Tag memory tag = etsToken.getTagByAddress(_coinAddress);

    accrued[_platform] = accrued[_platform] + platformAllocation;
    accrued[tag.channel] = accrued[tag.channel] + channelAllocation;
    accrued[tag.creator] = accrued[tag.creator] + remainingAllocation;
}
```

**Critical Insight:**
- Fee distribution happens during every tagging operation, not just tag creation
- System must read `tag.creator` and `tag.channel` from storage on every tag application
- This is a **write-time dependency** that cannot be eliminated without changing the business model

**Impact:**
- ❌ **CANNOT remove `Tag.creator` from storage** (fee distribution breaks)
- ❌ **CANNOT remove `Tag.channel` from storage** (fee distribution breaks)
- ✅ **CAN remove strings:** `originalInput`, `displayVersion`, `machineName` (~120k gas saved)
- ✅ **CAN remove `timestamp`** (~20k gas saved)

---

### 🚨 Constraint #2: Array Operations (BLOCKER)

**Location:** ETS.sol - multiple locations (297, 315, 323, 341, 434, 580, 594)

```solidity
// All tag modification operations require reading existing coinAddresses:
_coinAddresses = AddressArrayUtils.difference(_coinAddresses, taggingRecords[_taggingRecordId].coinAddresses);
taggingRecords[_taggingRecordId].coinAddresses = AddressArrayUtils.extend(...);
_coinAddresses = AddressArrayUtils.intersect(_coinAddresses, taggingRecords[_taggingRecordId].coinAddresses);
```

**Critical Insight:**
- `appendTags`, `replaceTags`, `removeTags` all perform set operations
- These require knowing the **current** coinAddresses array to determine NEW tags being added
- Fee computation depends on these operations to calculate fees for only new tags

**Impact:**
- ❌ **CANNOT remove `TaggingRecord.coinAddresses[]` from storage**
- Dynamic arrays are expensive (~80k gas for 3 addresses) but **required for business logic**
- No optimization possible without fundamentally changing tag modification UX

---

### 🚨 Constraint #3: Authorization (BLOCKER)

**Location:** ETS.sol:294, 312, 338

```solidity
if (taggingRecords[_taggingRecordId].tagger != _tagger) {
    revert NotAuthorized(_tagger, taggingRecords[_taggingRecordId].tagger);
}
```

**Impact:**
- ❌ **CANNOT remove `TaggingRecord.tagger` from storage** (authorization breaks)
- Alternative cryptographic proofs would be complex, expensive, and poor UX
- Must keep tagger in storage (~20k gas)

---

### 🚨 Constraint #4: Fee Computation (BLOCKER)

**Location:** ETS.sol:422-458, ETSChannel.sol:245

```solidity
// Channels call this view function to compute fees BEFORE calling ETS:
(valueToSendForTagging, actualTagCount) = ets.computeTaggingFeeFromRawInput(
    _rawInput, _channel, _tagger, IETS.TaggingAction.APPEND
);

// Which internally needs existing tags to calculate NEW tags:
_coinAddresses = AddressArrayUtils.difference(_coinAddresses, taggingRecords[_taggingRecordId].coinAddresses);
```

**Impact:**
- Fee computation is a **view function** used by channels to determine ETH to send
- Requires reading existing taggingRecord state
- ❌ **Cannot move to events** without breaking channel fee calculation

---

## Recommended Approach: Pragmatic Hybrid

Keep business-critical fields in storage, move descriptive data to events.

### Optimized Tag Storage

```solidity
// ETSToken.sol - Minimal storage for business logic
struct Tag {
    address creator;    // REQUIRED: Fee distribution (ETS.sol:631)
    address channel;    // REQUIRED: Fee distribution (ETS.sol:628)
}

// Quick lookups
mapping(address => Tag) public coinAddressToTag;
mapping(bytes32 => address) public machineNameHashToCoinAddress;

// Comprehensive event (already implemented ✅)
event TagCreated(
    address indexed coinAddress,
    uint256 indexed tagId,
    string originalInput,    // ← Moved from storage to event
    string displayVersion,   // ← Moved from storage to event
    string machineName,      // ← Moved from storage to event
    address indexed creator,
    address channel,
    uint256 timestamp        // ← Moved from storage to event
);
```

**Gas Savings:** ~140,000 gas (70% reduction)
**Cost Change:** $12.00 → $3.60 mainnet | $0.12 → $0.04 Base

---

### Optimized TaggingRecord Storage

```solidity
// ETS.sol - Minimal storage for business logic
struct TaggingRecord {
    address[] coinAddresses;  // REQUIRED: Array operations (append/replace/remove)
    address tagger;           // REQUIRED: Authorization checks
}

// Existence tracking
mapping(uint256 => TaggingRecord) public taggingRecords;

// Enhanced event with full data
event TaggingRecordCreated(
    uint256 indexed taggingRecordId,
    address[] coinAddresses,
    uint256 indexed targetId,      // ← Moved from storage to event
    string recordType,             // ← Moved from storage to event
    address indexed channel,       // ← Moved from storage to event
    address tagger
);
```

**Gas Savings:** ~60,000 gas (33% reduction)
**Cost Change:** $10.80 → $7.20 mainnet | $0.11 → $0.07 Base

---

### What Gets Preserved

✅ **Fee distribution works perfectly** - creator/channel in storage
✅ **Tag modification operations work** - coinAddresses array in storage
✅ **Authorization works** - tagger in storage
✅ **Fee computation works** - can read existing tags from storage
✅ **The Graph gets comprehensive events** - all descriptive data
✅ **On-chain verification** - minimal state for critical operations

---

### What Gets Lost

❌ **On-chain queries for display data** - `getTagByAddress()` returns only creator/channel
❌ **Smart contract composability** - other contracts can't read tag strings
❌ **Full TaggingRecord queries** - `getTaggingRecordFromId()` returns minimal data
❌ **Must use subgraph** - The Graph becomes required for display data

---

## Alternative Approaches (Not Recommended)

### Option B: Extreme Optimization

Pass creator/channel as calldata on every operation to eliminate storage reads.

**Problems:**
- 🚫 Massive gas increase from calldata (68 gas/byte)
- 🚫 Breaks trust model (anyone could pass fake creator/channel)
- 🚫 Terrible UX (every caller must know tag creators)
- 🚫 Not feasible

### Option C: Business Logic Change

Modify fee distribution to not require per-tag lookups:
1. Only distribute to platform + tagger (no creator/channel split)
2. Pay creator/channel once at tag creation, not per use
3. Use flat-fee model instead of per-tag attribution

**Impact:**
- ✅ Could eliminate Tag storage entirely
- 🚫 Changes core business model
- 🚫 Reduces incentives for tag creators
- 🚫 May not align with ETS vision

---

## Implementation Plan (When Ready)

### Phase 1: Event Enhancement (Non-Breaking)
- [ ] Add comprehensive data to `TaggingRecordCreated` event
- [ ] Deploy contract with enhanced events (backward compatible)
- [ ] Validate event emission in tests

### Phase 2: Subgraph Migration
- [ ] Update subgraph to use events as primary data source
- [ ] Add event-based entity resolvers
- [ ] Test historical data accuracy
- [ ] Validate query performance

### Phase 3: Contract Refactoring (Breaking)
- [ ] Remove Tag struct string fields, keep creator/channel
- [ ] Remove TaggingRecord struct fields, keep coinAddresses/tagger
- [ ] Update internal functions to use minimal storage
- [ ] Deprecate `getTagByAddress()` and `getTaggingRecordFromId()` getters

### Phase 4: Testing & Validation
- [ ] Update all 183 contract tests
- [ ] Integration tests with subgraph mocks
- [ ] Gas benchmarking on localhost
- [ ] Comprehensive upgrade testing

### Phase 5: Deployment
- [ ] Deploy to Base Sepolia
- [ ] Monitor gas costs and functionality
- [ ] Gradual migration strategy for existing data
- [ ] Production rollout with monitoring

**Estimated Total Effort:** 2-3 weeks with full team

---

## Migration Gotchas

### 1. External Contract Dependencies
Any contracts calling these functions will break:
- `etsToken.getTagByAddress(addr)` - currently returns full Tag struct
- `ets.getTaggingRecordFromId(id)` - currently returns full TaggingRecord struct

**Migration:** External contracts must switch to subgraph queries or accept minimal data.

### 2. Subgraph Becomes Critical
The Graph becomes the **source of truth** for:
- Tag display strings (originalInput, displayVersion, machineName)
- Tagging record metadata (targetId, recordType, channel)
- Historical queries and analytics

**Risk:** If subgraph is down or desynced, UX degrades significantly.

### 3. Testing Complexity
- All contract tests must be updated to expect minimal storage
- Integration tests need mock subgraph responses
- E2E testing requires running The Graph indexer
- Staging must have subgraph deployed and synced before contract upgrade

### 4. Data Migration Strategy
Existing tags/records have full structs in storage:
- Option A: Leave old data as-is (mixed state)
- Option B: Batch migration (expensive, complex)
- Option C: Lazy migration on access (complex logic)

---

## Why This Is Backlogged

### Premature Optimization
- Don't have production usage data yet
- Don't know if gas costs are actually a UX problem
- Base L2 already makes costs fairly low ($0.04-$0.12)
- Need real metrics to justify 2-3 week refactor

### MVP Progress Blockers
- Currently 85% done with Temporal Processor (#539)
- Checkpoint system (#539.10) is critical path for production
- This optimization would delay MVP by 2-3 weeks
- Team should focus on getting to production first

### Risk vs Reward
- **High Risk:** Touching core fee distribution and authorization
- **Medium Reward:** 70% savings on tags, 33% on records
- **Unknown Value:** Is $0.04 vs $0.12 per tag meaningful on Base?
- Better to validate business model first, optimize later

### Technical Debt Concerns
- Introduces subgraph as critical dependency
- Breaks smart contract composability
- Requires ongoing maintenance of dual systems (events + minimal storage)
- May limit future feature development

---

## Conditions to Revisit

**Do this AFTER:**
1. ✅ Checkpoint system (#539.10) complete
2. ✅ Production deployment validated on Base Mainnet
3. ✅ Real usage metrics collected (volume, gas costs, user feedback)
4. ✅ Business model validated with users
5. ✅ The Graph subgraph stable and performing well

**Then you'll know:**
- Are gas costs actually a UX problem?
- Which operations are most expensive in practice?
- Is the 70% tag savings worth the complexity?
- Do users care about $0.04 vs $0.12 on Base?
- Is volume high enough to justify 2-3 week optimization?

**Threshold Metrics:**
- If tag creation costs > $0.50 on Base: **High Priority**
- If tag creation costs $0.10-$0.50: **Medium Priority**
- If tag creation costs < $0.10: **Low Priority**
- If user feedback mentions gas costs: **Increase Priority**

---

## Annual Volume Projections

### Conservative (100k tags, 50k records/year)

**Mainnet:**
- Tag savings: 14 billion gas = ~$840,000/year
- Record savings: 3 billion gas = ~$180,000/year
- **Total: ~$1M annual savings**

**Base L2 (100x cheaper):**
- Tag savings: ~$8,400/year
- Record savings: ~$1,800/year
- **Total: ~$10,200 annual savings**

### Aggressive (1M tags, 500k records/year)

**Mainnet:**
- **Total: ~$10M annual savings**

**Base L2:**
- **Total: ~$100k annual savings**

---

## References

### Key Files Analyzed
- `packages/contracts/contracts/ETSToken.sol` (lines 271-279, 621)
- `packages/contracts/contracts/ETS.sol` (lines 564-570, 619-632)
- `packages/contracts/contracts/channels/ETSChannel.sol` (lines 245-251)
- `packages/contracts/contracts/interfaces/IETSToken.sol`
- `packages/contracts/contracts/interfaces/IETS.sol`

### Related Documentation
- ETS Architecture: `docs/claude/CLAUDE-IMPLEMENTATION.md`
- Roadmap: `docs/session/ROADMAP.md`
- TAG Coins Vision: `docs/claude/CLAUDE-VISION.md`

---

**Last Updated:** 2025-10-08
**Next Review:** After SUB_539.10 complete + production deployment validated
