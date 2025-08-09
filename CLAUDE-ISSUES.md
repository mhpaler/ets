# GitHub Issues for TAG Coins Implementation

## Epic Issue

### TAG Coins Architecture Refactor
**Label**: `epic`
**Milestone**: TAG Coins v1.0

**Description**:
Transform ETS from CTAG NFT system to ERC-20 "TAG coins" on Zora platform while maintaining ETS as the canonical tag registry.

**Goals**:
- Enhanced liquidity through fungible tokens
- Improved accessibility and community participation  
- Maintained integrity of tag registry system
- New economic opportunities for creators and communities

**Architecture Overview**:
1. **ETS Core**: Maintains tag uniqueness, emits TagCreated events
2. **Off-Chain Service**: Processes events, mints coins on Zora using ETS EOA
3. **Zora Platform**: Hosts ERC-20 TAG coins with trading infrastructure
4. **Distribution Layer**: Manages creator allocations and fee distributions

**Implementation Phases**:
- Phase 1: Foundation (MVP) - 8-12 weeks
- Phase 2: Economic Integration - 6-8 weeks  
- Phase 3: Advanced Features - 4-6 weeks
- Phase 4: Community Features - 6-8 weeks

**Related Documents**:
- Vision Document: [link to artifact]
- Implementation Plan: [link to artifact]

---

## Phase 1: Foundation (MVP) Issues

### 1. Add TagCreated Event to ETS Core Contract
**Label**: `enhancement`, `contracts`, `phase-1`
**Milestone**: TAG Coins Phase 1
**Assignee**: [contract team]

**Description**:
Modify ETS core contract to emit TagCreated events when new tags are created, enabling off-chain services to mint corresponding TAG coins on Zora.

**Acceptance Criteria**:
- [ ] Add `TagCreated` event with required parameters (tagId, tagString, creator, relayer, timestamp)
- [ ] Emit event in tag creation flow without breaking existing functionality
- [ ] Maintain backward compatibility with existing CTAG operations
- [ ] Update contract interfaces to support new event structure
- [ ] Gas usage analysis shows minimal impact
- [ ] Comprehensive test coverage for event emission

**Technical Details**:
```solidity
event TagCreated(
    uint256 indexed tagId,
    string tagString,
    address indexed creator,
    address indexed relayer,
    uint256 timestamp
);
```

**Definition of Done**:
- Event emitted on all tag creation paths
- Tests pass including gas usage validation
- Documentation updated

---

### 2. Develop Off-Chain Event Processing Service
**Label**: `enhancement`, `backend`, `phase-1`
**Milestone**: TAG Coins Phase 1
**Assignee**: [backend team]

**Description**:
Create reliable service to process TagCreated events and mint corresponding coins on Zora platform.

**Acceptance Criteria**:
- [ ] Event listener with reorg protection
- [ ] Queue-based processing system with Redis
- [ ] Idempotency controls to prevent duplicate minting
- [ ] Error handling and retry logic with dead letter queue
- [ ] PostgreSQL database for state management
- [ ] Health check endpoints for monitoring
- [ ] Comprehensive logging and metrics

**Technical Stack**:
- Node.js/TypeScript runtime
- PostgreSQL for state management
- Redis for queue management
- Ethers.js for blockchain interaction

**Components**:
1. Event Listener - Monitor ETS contract for TagCreated events
2. Queue Manager - Process events in order with retry logic
3. Zora Integration - Call CreateCoin function with ETS EOA
4. State Management - Track processing status and errors

**Definition of Done**:
- Service processes events reliably with <30s latency
- 99.9% success rate for event processing
- Comprehensive error handling and recovery
- Full test coverage including integration tests

---

### 3. Implement EOA Security Infrastructure
**Label**: `security`, `infrastructure`, `phase-1`
**Milestone**: TAG Coins Phase 1
**Assignee**: [security team]

**Description**:
Establish secure management system for ETS EOA used for coin creation on Zora platform.

**Acceptance Criteria**:
- [ ] Hardware security module (HSM) or AWS KMS integration
- [ ] Multi-signature backup procedures
- [ ] Key rotation capabilities
- [ ] Transaction monitoring and alerts
- [ ] Emergency pause mechanisms
- [ ] Automated monitoring for suspicious activity
- [ ] Security procedures documentation
- [ ] Emergency response protocols

**Security Requirements**:
- Threshold signatures for high-value operations
- Automated anomaly detection
- Secure key backup and recovery
- Access logging and audit trails

**Definition of Done**:
- EOA secured with enterprise-grade key management
- Monitoring and alerting operational
- Security procedures documented and tested
- Emergency protocols validated

---

### 4. Create Creator Allocation System
**Label**: `enhancement`, `backend`, `phase-1`
**Milestone**: TAG Coins Phase 1
**Assignee**: [backend team]

**Description**:
Implement system for transferring creator allocations from ETS EOA to tag creators.

**Acceptance Criteria**:
- [ ] Track pending allocations for each creator
- [ ] Claim interface for creators
- [ ] Batch processing for gas efficiency
- [ ] Expiration policies for unclaimed allocations
- [ ] Fraud prevention measures
- [ ] Transfer automation from ETS EOA
- [ ] Audit trail maintenance

**Flow**:
1. Coin created on Zora with creator allocation to ETS EOA
2. ETS tracks pending allocations for each creator
3. Creator claims allocation through ETS interface
4. ETS EOA transfers coins directly to creator

**Definition of Done**:
- Creators can claim allocations successfully
- Gas-efficient batch processing implemented
- Complete audit trail of all transfers
- Anti-fraud measures operational

---

### 5. Zora Platform Integration
**Label**: `integration`, `backend`, `phase-1`
**Milestone**: TAG Coins Phase 1
**Assignee**: [backend team]

**Description**:
Integrate with Zora platform for TAG coin creation and management.

**Acceptance Criteria**:
- [ ] Authenticate with ETS EOA for coin creation
- [ ] Call Zora CreateCoin function with correct parameters
- [ ] Set payout recipient (ETS) and referrals appropriately
- [ ] Verify transaction success and handle failures
- [ ] Configure coin parameters (supply, allocations)
- [ ] Error handling for Zora API limitations
- [ ] Rate limiting and retry logic

**Integration Points**:
- Zora CreateCoin API
- Coin configuration parameters
- Payout and referral setup
- Transaction verification

**Definition of Done**:
- Successful coin creation on Zora platform
- Proper configuration of all parameters
- Robust error handling and retries
- Integration tests passing

---

## Phase 2: Economic Integration Issues

### 6. Implement Tagging Fee Distribution System
**Label**: `enhancement`, `backend`, `phase-2`
**Milestone**: TAG Coins Phase 2
**Assignee**: [backend team]

**Description**:
Create system to distribute tagging fees to TAG coin holders on a pro-rata basis.

**Acceptance Criteria**:
- [ ] Snapshot-free pro-rata distribution mechanism
- [ ] Batch claiming to reduce gas costs
- [ ] Configurable fee percentages
- [ ] Treasury exclusion options
- [ ] Merkle tree distribution system
- [ ] Periodic distribution epochs
- [ ] Gas-efficient claiming mechanism

**Technical Approach**:
- Merkle tree for efficient distribution
- Pull-based claiming system
- Epoch-based distribution periods
- Configurable parameters for fee splits

**Definition of Done**:
- Fee distributions working efficiently
- Gas costs optimized for large holder sets
- Configurable distribution parameters
- Complete testing of distribution logic

---

### 7. Automate Referral Reward System
**Label**: `enhancement`, `backend`, `phase-2`
**Milestone**: TAG Coins Phase 2
**Assignee**: [backend team]

**Description**:
Automatically assign Create Referral rewards to sponsoring Relayers during coin creation.

**Acceptance Criteria**:
- [ ] Identify sponsoring Relayer from TagCreated event
- [ ] Configure Zora coin creation with correct referral
- [ ] Track referral rewards and distributions
- [ ] Handle edge cases and disputes
- [ ] Map relayer addresses to referral configuration
- [ ] Default referral policies for unregistered relayers
- [ ] Reporting and analytics for referral performance

**Requirements**:
- Automatic referral assignment based on event data
- Override mechanisms for special cases
- Comprehensive tracking and reporting
- Dispute resolution procedures

**Definition of Done**:
- Referral rewards automatically assigned
- Edge cases handled appropriately
- Analytics and reporting operational
- Override mechanisms tested

---

### 8. Develop Treasury Management Policies
**Label**: `enhancement`, `policy`, `phase-2`
**Milestone**: TAG Coins Phase 2
**Assignee**: [product team]

**Description**:
Define and implement policies for ETS treasury interaction with TAG coins.

**Acceptance Criteria**:
- [ ] Define treasury participation in holder distributions
- [ ] Treasury accumulation strategies
- [ ] Governance over treasury TAG coin holdings
- [ ] Emergency fund management policies
- [ ] Policy configuration system
- [ ] Automated treasury operations
- [ ] Governance integration hooks
- [ ] Reporting and transparency tools

**Key Decisions**:
- Whether ETS treasury participates in distributions
- Automatic vs manual treasury management
- Governance mechanisms for policy changes
- Emergency procedures

**Definition of Done**:
- Treasury policies clearly defined and implemented
- Governance integration operational
- Transparency and reporting tools active
- Emergency procedures documented

---

## Phase 3: Advanced Features Issues

### 9. Implement No-Fee Mode Configuration
**Label**: `enhancement`, `backend`, `phase-3`
**Milestone**: TAG Coins Phase 3
**Assignee**: [backend team]

**Description**:
Support operation without tagging fees, relying solely on Zora trading fees.

**Acceptance Criteria**:
- [ ] Toggle tagging fees on/off per deployment
- [ ] Alternative incentive mechanisms
- [ ] Treasury emission programs
- [ ] Community governance integration
- [ ] Configuration management system
- [ ] Migration tools for fee mode changes

**Features**:
- Runtime configuration of fee modes
- Alternative incentive structures
- Governance-controlled parameters
- Smooth transitions between modes

**Definition of Done**:
- No-fee mode operational
- Alternative incentives working
- Governance integration complete
- Configuration changes tested

---

### 10. Build Enhanced Monitoring and Analytics
**Label**: `enhancement`, `monitoring`, `phase-3`
**Milestone**: TAG Coins Phase 3
**Assignee**: [devops team]

**Description**:
Comprehensive visibility into system performance and economics.

**Acceptance Criteria**:
- [ ] Real-time dashboard for system health
- [ ] Economic analytics for fee flows
- [ ] Performance metrics and SLAs
- [ ] Alert systems for anomalies
- [ ] Event processing latency tracking
- [ ] Coin creation success rates
- [ ] Fee distribution efficiency metrics
- [ ] Community growth indicators

**Components**:
- Grafana dashboards
- Prometheus metrics collection
- Alert manager configuration
- Economic analytics tools

**Definition of Done**:
- Comprehensive monitoring operational
- Economic analytics available
- Alerting system functional
- Performance metrics tracked

---

### 11. Implement Bulk Operations Support
**Label**: `enhancement`, `backend`, `phase-3`
**Milestone**: TAG Coins Phase 3
**Assignee**: [backend team]

**Description**:
Enable efficient batch operations for high-volume users.

**Acceptance Criteria**:
- [ ] Batch tag creation with single signature
- [ ] Account abstraction integration
- [ ] Sponsored transaction support
- [ ] Optimized gas usage patterns
- [ ] Bulk processing APIs
- [ ] Rate limiting for bulk operations

**Features**:
- Multi-tag creation in single transaction
- Gasless transactions for users
- Optimized batch processing
- Fair usage policies

**Definition of Done**:
- Bulk operations working efficiently
- Gas optimizations implemented
- Account abstraction integrated
- Rate limiting operational

---

## Phase 4: Community Features Issues

### 12. Build TAG Community Governance Features
**Label**: `enhancement`, `frontend`, `phase-4`
**Milestone**: TAG Coins Phase 4
**Assignee**: [frontend team]

**Description**:
Enable community governance and coordination around TAG coins.

**Acceptance Criteria**:
- [ ] Community voting mechanisms
- [ ] TAG-specific governance proposals
- [ ] Community fund management
- [ ] Cross-tag collaboration tools
- [ ] Governance token integration
- [ ] Proposal creation and voting UI

**Features**:
- Decentralized governance for TAG communities
- Proposal and voting systems
- Community treasury management
- Inter-community coordination

**Definition of Done**:
- Governance features operational
- Community voting functional
- Treasury management tools active
- Cross-community features working

---

### 13. Develop Advanced Distribution Mechanisms
**Label**: `enhancement`, `backend`, `phase-4`
**Milestone**: TAG Coins Phase 4
**Assignee**: [backend team]

**Description**:
Sophisticated approaches to fee and reward distribution.

**Acceptance Criteria**:
- [ ] Streaming distributions
- [ ] Governance-weighted allocations
- [ ] Performance-based rewards
- [ ] Cross-tag incentive programs
- [ ] Dynamic distribution algorithms
- [ ] Community-controlled parameters

**Options**:
- Real-time streaming payments
- Merit-based reward systems
- Cross-pollination incentives
- Dynamic parameter adjustment

**Definition of Done**:
- Advanced distribution options available
- Community control mechanisms operational
- Performance-based systems working
- Cross-tag incentives functional

---

### 14. Expand Ecosystem Integrations
**Label**: `integration`, `phase-4`
**Milestone**: TAG Coins Phase 4
**Assignee**: [partnerships team]

**Description**:
Broaden ecosystem integration and utility for TAG coins.

**Acceptance Criteria**:
- [ ] DeFi protocols integration for TAG coin utility
- [ ] NFT marketplaces for CTAG bridging
- [ ] Social platforms for community features
- [ ] Analytics platforms for insights
- [ ] DEX integrations for trading
- [ ] Lending/borrowing protocol support

**Integration Targets**:
- Major DeFi protocols
- NFT marketplaces
- Social media platforms
- Analytics and data providers

**Definition of Done**:
- Key integrations operational
- Cross-platform utility established
- Analytics and insights available
- Community adoption growing

---

## Testing and Quality Assurance Issues

### 15. Comprehensive Testing Suite for TAG Coins
**Label**: `testing`, `quality-assurance`
**Milestone**: TAG Coins Phase 1
**Assignee**: [qa team]

**Description**:
Develop comprehensive testing for all TAG Coins functionality.

**Acceptance Criteria**:
- [ ] Unit tests for all contract modifications
- [ ] Integration tests for off-chain services
- [ ] End-to-end tests for complete flow
- [ ] Load testing for high-volume scenarios
- [ ] Security testing for EOA management
- [ ] Economic simulation testing
- [ ] Failure scenario testing

**Test Categories**:
- Smart contract tests
- Event processing tests
- Zora integration tests
- Security and penetration tests
- Performance and load tests

**Definition of Done**:
- 95%+ test coverage achieved
- All critical paths tested
- Performance benchmarks met
- Security tests passing

---

### 16. Security Audit and Penetration Testing
**Label**: `security`, `audit`
**Milestone**: TAG Coins Phase 1
**Assignee**: [security team]

**Description**:
Comprehensive security review of TAG Coins implementation.

**Acceptance Criteria**:
- [ ] Smart contract security audit
- [ ] Off-chain service security review
- [ ] EOA management security assessment
- [ ] Penetration testing of APIs
- [ ] Economic attack vector analysis
- [ ] Third-party security audit
- [ ] Remediation of identified issues

**Security Areas**:
- Contract vulnerabilities
- Key management security
- API security
- Economic attack vectors
- System architecture security

**Definition of Done**:
- Security audit completed with no critical issues
- Penetration testing passed
- All identified issues remediated
- Security documentation updated

---

## Documentation and Deployment Issues

### 17. Update Documentation for TAG Coins
**Label**: `documentation`
**Milestone**: TAG Coins Phase 1
**Assignee**: [docs team]

**Description**:
Comprehensive documentation update for TAG Coins architecture.

**Acceptance Criteria**:
- [ ] Architecture documentation updated
- [ ] API documentation for new services
- [ ] User guides for creators and communities
- [ ] Integration guides for developers
- [ ] Economic model documentation
- [ ] Migration guides from CTAGs

**Documentation Sections**:
- Technical architecture
- User interfaces and workflows
- Developer integration guides
- Economic model explanations
- Migration procedures

**Definition of Done**:
- Complete documentation published
- User guides available
- Developer resources updated
- Migration documentation ready

---

### 18. Staging Environment Deployment
**Label**: `deployment`, `infrastructure`
**Milestone**: TAG Coins Phase 1
**Assignee**: [devops team]

**Description**:
Deploy TAG Coins system to staging environment for testing.

**Acceptance Criteria**:
- [ ] Deploy modified ETS contracts to staging
- [ ] Deploy off-chain services to staging infrastructure
- [ ] Configure EOA for staging environment
- [ ] Set up monitoring and alerting
- [ ] Configure Zora integration for staging
- [ ] End-to-end testing in staging environment

**Deployment Components**:
- Smart contracts
- Off-chain services
- Database systems
- Monitoring infrastructure
- Security systems

**Definition of Done**:
- Staging environment fully operational
- End-to-end testing successful
- Monitoring and alerting active
- Ready for production deployment

---

### 19. Production Deployment and Migration Plan
**Label**: `deployment`, `migration`
**Milestone**: TAG Coins Phase 1
**Assignee**: [devops team]

**Description**:
Plan and execute production deployment with migration strategy.

**Acceptance Criteria**:
- [ ] Production deployment plan
- [ ] Migration strategy from CTAG system
- [ ] Rollback procedures documented
- [ ] Community communication plan
- [ ] Gradual rollout strategy
- [ ] Success metrics and monitoring
- [ ] Post-deployment validation

**Migration Strategy**:
- Deploy alongside existing CTAG system
- Gradual migration of new tags to coin system
- Community choice for existing CTAG conversion
- Full system cutover after validation

**Definition of Done**:
- Production deployment successful
- Migration plan executed
- Rollback procedures tested
- Community informed and engaged

---

## Issue Creation Instructions

To create these issues in GitHub:

1. **Copy each issue section above**
2. **Create new issue in GitHub**
3. **Use the title as the issue title**
4. **Copy the description content**
5. **Add appropriate labels** (shown in each issue)
6. **Assign to milestone** TAG Coins v1.0 or specific phase
7. **Assign to team members** as appropriate
8. **Link related issues** using GitHub's linking features

## Recommended GitHub Project Setup

1. **Create Milestones**:
   - TAG Coins v1.0 (overall milestone)
   - TAG Coins Phase 1
   - TAG Coins Phase 2  
   - TAG Coins Phase 3
   - TAG Coins Phase 4

2. **Create Labels**:
   - `epic` (for main tracking issue)
   - `phase-1`, `phase-2`, `phase-3`, `phase-4`
   - `contracts`, `backend`, `frontend`, `infrastructure`
   - `enhancement`, `security`, `testing`, `documentation`
   - `integration`, `deployment`, `migration`

3. **Create Project Board** with columns:
   - Backlog
   - Phase 1 In Progress
   - Phase 2 Ready
   - Phase 3 Ready  
   - Phase 4 Ready
   - In Review
   - Done

This structure will help you track progress across the complex TAG Coins implementation while maintaining clear organization and dependencies.