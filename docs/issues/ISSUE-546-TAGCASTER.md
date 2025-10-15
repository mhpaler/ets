# Issue #546: Tagcaster - Hashtags on Farcaster

## Overview
Tagcaster bridges Farcaster's social layer with ETS's tagging infrastructure, automatically converting Farcaster casts with hashtags into ETS tagging records.

## Vision
**"Tagcaster is Hashtags on Farcaster"**
- Every Farcaster cast with #hashtags automatically becomes an ETS tagging record
- Farcaster users get proper attribution as taggers without needing to interact with ETS directly
- Tagcaster sponsors all gas/tagging fees (subsidizing the user experience)

## Technical Architecture

### Current ETS Flow
1. User signs transaction → pays tagging fee → creates tagging record
2. User's EOA = tagger = fee payer

### Tagcaster Flow
1. Farcaster user posts cast with hashtags (no blockchain interaction)
2. Tagcaster service detects hashtags
3. **Tagcaster EOA signs transaction** → pays tagging fee → creates tagging record
4. **Farcaster user's ETH address = tagger** (attribution)
5. Tagcaster EOA = fee payer (sponsoring the transaction)

## Implementation Requirements

### Contract Changes Needed

#### ETSChannel.sol - Add Relay Function
```solidity
/// @notice Apply tags on behalf of another address (only channel owner)
/// @param _rawInput Array of tag inputs
/// @param _taggerAddress The address to attribute tags to
function applyTagsFor(
    IETS.TaggingRecordRawInput[] calldata _rawInput,
    address payable _taggerAddress
) public payable onlyOwner whenNotPaused {
    uint256 taggingFee = ets.taggingFee();
    for (uint256 i; i < _rawInput.length; ++i) {
        _applyTags(_rawInput[i], _taggerAddress, address(this), taggingFee);
    }
    emit TagsRelayed(msg.sender, _taggerAddress, _rawInput);
}
```

**Key Insight**: The internal `_applyTags` function already accepts `_tagger` as a parameter. We just need a public function that allows the channel owner to specify a different tagger than `msg.sender`.

### Optional Additional Functions
```solidity
// For corrections
function replaceTagsFor(
    IETS.TaggingRecordRawInput[] calldata _rawInput,
    address payable _taggerAddress
) public payable onlyOwner whenNotPaused

// For moderation
function removeTagsFor(
    IETS.TaggingRecordRawInput[] calldata _rawInput,
    address payable _taggerAddress
) public payable onlyOwner whenNotPaused
```

### Why This Works
1. **Payment Flow**: Unchanged! Channel still uses its balance to pay fees
2. **Attribution**: `_taggerAddress` (Farcaster user) gets:
   - TAG coin creation rights
   - Tagging record attribution
   - Future rewards when implemented
3. **Access Control**: Only channel owner can relay (secure for MVP)
4. **No ETS Core Changes**: The core already supports this pattern!

## Economic Model (MVP)

### Fee Structure
- Tagcaster EOA pays all tagging fees
- Farcaster users pay nothing
- Base chain keeps costs reasonable

### Attribution & Rewards
- Farcaster users get full tagger attribution
- TAG Coins created with Farcaster user as creator
- Trading fees from Zora go to Farcaster user
- Tagcaster recognized as channel of record

### Scale Considerations
- Farcaster: ~500K casts/day
- If 10% have hashtags: 50K transactions/day
- Base fees are cheap - investment in distribution
- Future: Consider batching if needed

## Offchain Service Architecture

### Components
1. **Farcaster Listener**: Monitor all new casts
2. **Hashtag Extractor**: Parse hashtags from cast content
3. **User Resolver**: Get Ethereum address from Farcaster profile
4. **Transaction Manager**: Call channel.applyTagsFor()
5. **Monitoring**: Track success/failures

### Data Flow
```
Farcaster Cast → Listener → Extract Tags → Resolve User ETH Address
→ Call applyTagsFor(tags, targetURI, userAddress) → Monitor Result
```

### Target URI Format
- Use Farcaster cast URL as target
- Example: `https://warpcast.com/username/0x123...`
- This makes tags auditable back to source

## MVP Decisions

1. **No Opt-in Required**: Automatic for all casts (reduce friction)
2. **Trust Model**: Tagcaster operated by ETS team (not trustless)
3. **No On-chain Verification**: Trust Farcaster APIs for user mapping
4. **Channel Owner Only**: Access restricted to Tagcaster EOA
5. **Simple Attribution**: Just cast URI, no extra metadata

## Implementation Steps

### Phase 1: Smart Contract Updates
1. [ ] Add applyTagsFor() to ETSChannel.sol
2. [ ] Add replaceTagsFor() and removeTagsFor() (optional)
3. [ ] Add TagsRelayed event
4. [ ] Write comprehensive tests
5. [ ] Deploy upgraded channel implementation

### Phase 2: Tagcaster Channel Setup
1. [ ] Deploy Tagcaster channel on Base Sepolia
2. [ ] Fund channel with ETH for fees
3. [ ] Configure channel parameters
4. [ ] Test with manual transactions

### Phase 3: Offchain Service
1. [ ] Build Farcaster webhook listener
2. [ ] Implement hashtag extraction logic
3. [ ] Add user ETH address resolution
4. [ ] Build transaction manager with retry logic
5. [ ] Add monitoring and alerting

### Phase 4: Production Launch
1. [ ] Deploy Tagcaster channel on Base mainnet
2. [ ] Launch offchain service
3. [ ] Monitor initial transactions
4. [ ] Announce to Farcaster community

## Future Enhancements

### V2 Features
- Opt-in mechanism for privacy
- On-chain verification of Farcaster identity
- Batch transactions for gas efficiency
- Support for other platforms (Twitter, Instagram)
- Account abstraction for sophisticated logic

### Generalization
This pattern enables:
- Instagram bridge (tags from IG posts)
- Twitter/X bridge
- AI agents creating tags for users
- Gasless transactions via relayers

## Success Metrics
- Number of Farcaster users tagged
- TAG coins created via Tagcaster
- Daily active taggers from Farcaster
- Community sentiment/feedback

## Questions Resolved

1. **Who gets TAG coin creator rights?** → Farcaster user
2. **Who pays fees?** → Tagcaster EOA
3. **Access control?** → Channel owner only for MVP
4. **Target format?** → Farcaster cast URL
5. **Trust model?** → Centralized (ETS team) for MVP

## References
- Original discussion: Session on 2025-10-15
- Related contracts: ETSChannel.sol, ETS.sol
- Economic model: MVP 100% fees to platform (Phase 1)

## Status
**Not Started** - Captured from planning session, ready for implementation