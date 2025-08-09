# ETS → TAG Coins Vision Document

## Executive Summary

This document outlines the strategic refactor from ETS's current CTAG NFT system to a new TAG Coins architecture utilizing ERC-20 tokens on the Zora platform. This transition maintains ETS as the canonical source of truth for tag uniqueness while leveraging Zora's coin creation infrastructure for improved liquidity, trading, and community participation.

## Current State Analysis

### ETS Current Architecture
- **CTAGs**: ERC-721 NFTs representing unique tag strings (case-insensitive)
- **Tag Creation**: Happens through Relayers during tagging operations or direct minting
- **Ownership**: New CTAGs held by ETS platform, distributed via English auctions
- **Economics**: Tagging fees distributed to CTAG owners, relayers, and protocol
- **Uniqueness**: Enforced on-chain through `keccak256(lowercased_tag)` computation

### Key Limitations
- **Liquidity**: NFTs provide limited liquidity compared to fungible tokens
- **Participation Barriers**: High auction prices may exclude smaller participants
- **Trading Friction**: NFT marketplaces have higher friction than DeFi protocols
- **Community Building**: Limited mechanisms for broad community participation in tag economics

## Vision: TAG Coins on Zora

### High-Level Goals

1. **Enhanced Liquidity**: Transform tags into ERC-20 tokens for better trading and price discovery
2. **Improved Accessibility**: Lower barriers to participation in tag economics
3. **Maintained Integrity**: Preserve ETS as the authoritative tag registry
4. **Community Growth**: Enable broader participation through fungible token mechanics
5. **Economic Innovation**: Create new incentive structures for tag creators and communities

### Strategic Objectives

- **Preserve Core Value**: Maintain tag uniqueness and attribution while improving token economics
- **Leverage Existing Infrastructure**: Utilize Zora's proven coin creation and trading infrastructure
- **Minimize Technical Risk**: Incremental migration approach with fallback capabilities
- **Enhance User Experience**: Reduce friction for tag creation, ownership, and trading
- **Enable New Use Cases**: Support community-driven tag economies and governance

## Proposed Architecture

### System Components

#### 1. ETS Core (On-Chain)
- **Role**: Canonical tag registry and tagging record management
- **Responsibilities**:
  - Accept tagging requests via Relayers
  - Maintain case-insensitive tag uniqueness
  - Create and update Tagging Records
  - Emit `TagCreated` events for new tags
- **Changes**: Minimal modifications to existing contracts

#### 2. Off-Chain Mint Service
- **Role**: Bridge between ETS events and Zora coin creation
- **Responsibilities**:
  - Listen to ETS `TagCreated` events
  - Use ETS EOA to mint TAG coins on Zora
  - Configure payout recipients and referrals
  - Ensure idempotency and handle retries
- **Technology**: Event-driven service with queue management

#### 3. Zora Platform Integration
- **Role**: Host ERC-20 TAG coins with trading infrastructure
- **Responsibilities**:
  - Mint TAG coins (1B supply) upon request
  - Distribute creator allocation (10M) to ETS EOA
  - Handle trading fees and referral payments
  - Provide liquidity and price discovery

#### 4. ETS Distribution Layer
- **Role**: Manage creator allocations and fee distributions
- **Responsibilities**:
  - Transfer creator allocations from ETS EOA to creators
  - Distribute tagging fees to TAG coin holders (if enabled)
  - Handle referral rewards and protocol fees
  - Manage treasury policies

### Data Flow

```
User Tags Content → Relayer → ETS Core → TagCreated Event
                                              ↓
                                    Off-Chain Service
                                              ↓
                               Zora CreateCoin (ETS EOA)
                                              ↓
                          Creator Allocation → ETS EOA → Creator
                                              ↓
                               Trading & Fee Distribution
```

## Economic Model

### Token Economics
- **Total Supply**: 1,000,000,000 TAG coins per tag
- **Creator Allocation**: 10,000,000 coins (1%) to tag creator
- **Trading Liquidity**: Remaining supply available for purchase
- **Fee Structure**: Zora trading fees + optional ETS tagging fees

### Revenue Streams

#### 1. Trading Fees (Zora)
- **Creator Fees**: Ongoing revenue from TAG coin trading
- **Referral Fees**: Revenue for entities that facilitated coin creation
- **Platform Fees**: Zora platform revenue

#### 2. Tagging Fees (Optional)
- **Holder Distributions**: Pro-rata sharing among TAG coin holders
- **Relayer Incentives**: Rewards for applications facilitating tagging
- **Protocol Revenue**: ETS treasury accumulation

### Incentive Alignment
- **Creators**: Direct ownership + ongoing trading revenue
- **Community**: Ability to participate in tag economics
- **Relayers**: Referral fees + potential tagging fee shares
- **ETS Protocol**: Trading fee shares + treasury management

## Technical Requirements

### Smart Contract Changes
- **Minimal ETS Modifications**: Add `TagCreated` event emission
- **No Breaking Changes**: Maintain backward compatibility
- **Gas Optimization**: Efficient event emission and data structures

### Off-Chain Infrastructure
- **Event Processing**: Reliable event listening with reorg handling
- **Idempotency**: Prevent duplicate coin creation
- **Queue Management**: Handle high-volume tag creation
- **Monitoring**: Track service health and success rates

### Security Considerations
- **EOA Management**: Secure key custody and rotation procedures
- **Rate Limiting**: Prevent spam and abuse
- **Validation**: Ensure consistency between ETS and Zora states
- **Recovery**: Mechanisms for handling failed transactions

## Implementation Phases

### Phase 1: MVP (Core Functionality)
- Basic TAG coin minting on tag creation
- Simple creator allocation transfers
- Event-driven architecture foundation
- Testing and validation infrastructure

### Phase 2: Economic Features
- Tagging fee distributions to holders
- Referral reward automation
- Treasury management policies
- Advanced monitoring and analytics

### Phase 3: Community Features
- Governance mechanisms for TAG communities
- Advanced distribution strategies
- Cross-platform integrations
- Enhanced user interfaces

## Risk Assessment

### Technical Risks
- **EOA Security**: Single point of failure for coin creation
- **Event Reliability**: Missed events could result in unminted coins
- **Gas Costs**: High transaction volumes may increase operational costs
- **Integration Complexity**: Coordination between multiple systems

### Economic Risks
- **Market Volatility**: TAG coin prices may be highly volatile
- **Liquidity Fragmentation**: Some TAG coins may have limited trading
- **Fee Sustainability**: Distribution mechanisms must remain economically viable
- **Gaming**: Potential for economic manipulation or abuse

### Mitigation Strategies
- **Robust Monitoring**: Comprehensive alerting and health checks
- **Fallback Mechanisms**: Ability to revert to CTAG system if needed
- **Gradual Rollout**: Phased implementation to identify issues early
- **Economic Modeling**: Simulation and testing of fee structures

## Success Metrics

### Technical Metrics
- **Event Processing**: 99.9% successful tag creation → coin minting
- **Transaction Success**: 99% successful creator allocation transfers
- **System Uptime**: 99.9% availability of off-chain services
- **Response Time**: <30 seconds from tag creation to coin availability

### Economic Metrics
- **Trading Volume**: Increased trading activity vs. CTAG auctions
- **Participation**: Number of unique TAG coin holders
- **Creator Revenue**: Total fees earned by tag creators
- **Protocol Revenue**: Fees and treasury growth

### User Experience Metrics
- **Adoption Rate**: Number of applications integrating TAG coins
- **Community Growth**: Active participants in TAG economics
- **User Satisfaction**: Feedback from creators and community members

## Governance and Evolution

### Decision Framework
- **Technical Changes**: Core team decisions with community input
- **Economic Parameters**: Community governance for fee structures
- **New Features**: Collaborative development with stakeholder input

### Future Considerations
- **Cross-Chain Expansion**: TAG coins on multiple networks
- **DeFi Integration**: Lending, borrowing, and yield farming with TAG coins
- **NFT Bridging**: Mechanisms to convert between CTAGs and TAG coins
- **Advanced Governance**: DAO-like structures for tag communities

## Conclusion

The transition from CTAGs to TAG Coins represents a strategic evolution that maintains ETS's core value proposition while dramatically improving liquidity, accessibility, and community participation. By leveraging Zora's proven infrastructure and maintaining ETS as the canonical tag registry, this approach minimizes technical risk while maximizing economic opportunity.

The proposed architecture preserves the integrity of the ETS protocol while opening new possibilities for tag-based economies, community building, and creator monetization. Success will be measured not just in technical execution, but in the vibrant communities and economies that emerge around meaningful tags.

This vision positions ETS at the forefront of Web3 content organization and tokenization, creating a foundation for the next generation of decentralized tagging and community coordination tools.