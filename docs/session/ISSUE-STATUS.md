# TAG Coins Implementation - Issue Status Tracker

## Working Pattern
1. We work on **one issue at a time** 
2. The epic branch (`528-tag-coins-epic`) holds all work
3. When an issue is complete, we update GitHub and move to next priority
4. **Update ISSUE-STATUS.md to reflect new current issue**
5. Use sub-branches only if we need to experiment/prototype

---

## Current Sprint: Phase 1 MVP

### 🎯 Active Issue
**#529**: Architecture Refactor - ERC-721 to Zora ERC-20 Cutover
- **Status**: 🚧 IN PROGRESS - Interface-by-interface refactoring
- **Branch**: 528-tag-coins-epic  
- **Started**: 2025-08-13
- **Objective**: Complete architectural refactor from CTAG NFTs to Zora ERC-20 coin integration
- **Strategy**: Interface-specific sub-issues with targeted refactoring plans

### 🎯 Sub-Issues

**#529.1: Refactor IETSToken.sol and Implementation** 🚧 IN PROGRESS
- **Status**: Planning and design phase
- **Started**: 2025-08-13
- **Objective**: Refactor IETSToken interface and ETSToken implementation for Zora integration

**#529.2: Refactor ETS.sol Core Contract** ⏳ PLACEHOLDER
- **Status**: Pending #529.1 completion
- **Objective**: Update core ETS contract to work with address-based tag IDs

**#529.3: Refactor/Remove ETSAuctionHouse.sol** ⏳ PLACEHOLDER
- **Status**: Pending - decision needed on removal vs refactor
- **Objective**: Handle auction house incompatibility with ERC-20 trading

**#529.4: Update ETSRelayer Interfaces** ⏳ PLACEHOLDER
- **Status**: Pending
- **Objective**: Update all relayer contracts for new address-based tag system

**#529.5: Update Test Suite and Mocks** ⏳ PLACEHOLDER
- **Status**: Pending
- **Objective**: Comprehensive test updates for new architecture

### 📋 Priority Queue
1. **#532**: Implement secure EOA management for Zora coin creation
   - 🔄 PARTIALLY COVERED by #531.2
2. **#533**: Build creator allocation and distribution system

### ✅ Completed Issues

**#531**: Develop off-chain event processing service for TAG coin creation ✅
- Completed: 2025-08-12
- Deliverable: Full metadata system with Zora metadata builder integration
- Major breakthrough: Real IPFS uploads working with Zora API
- Key technical achievement: ETS properties preserved in metadata

**#530**: Research Zora integration and establish ETS <> Zora mapping strategy ✅
- Completed: 2025-08-11
- Deliverable: [ZORA-INTEGRATION-SPEC.md](../tag-coins/ZORA-INTEGRATION-SPEC.md)
- Key decisions: Unified "ETS" symbol, Zora addresses as IDs, canonical metadata

### ✅ Completed Decisions/Work
- Symbol strategy decision → Unified "ETS" symbol for all TAG coins
- ETS Creator coin symbol → "$ETS" or "ETSX" (TBD)
- Architecture approach → Use Zora coin addresses as tag identifiers
- Economic model → Tag creators as payoutRecipient, relayers as referrers

---

## Notes
- **GitHub Issues**: #528 (epic), #529-533 (Phase 1 sub-issues)
- **Documentation**: See [CLAUDE-IMPLEMENTATION.md](../claude/CLAUDE-IMPLEMENTATION.md) for full plan
- **Research**: See research/ folder for Zora integration findings

## Current Work: #531 (Off-chain Event Processing Service)

### ✅ Completed Core Architecture
- [x] Design service architecture (apps/oracle + apps/offchain-api pattern)
- [x] Refactor to use official @zoralabs/coins-sdk
- [x] Switch from ethers.js to Viem for modern blockchain client
- [x] Build ZoraService with createCoin integration
- [x] Create TagCoinController with validation and error handling
- [x] Create comprehensive test script for validation
- [x] Implement unified "ETS" symbol strategy

### ✅ Completed Sub-Issues

**#531.1: Build TAG Coin Metadata System** ✅ COMPLETED [100%]
- [x] Design image generation process for TAG coins (placeholder images)
- [x] Build metadata creation pipeline (name, description, image, attributes)
- [x] Implement mock metadata system with deterministic URIs
- [x] Use Zora-compatible metadata validation
- [x] Create separate metadata API endpoint (/api/metadata/generate)
- [x] Handle Unicode/emoji tags in image generation (placeholder strategy)
- [x] Integrate with ZoraService via HTTP API
- [x] Dependencies installed (@zoralabs/coins-sdk, viem)
- [x] API authentication middleware implemented
- [x] Environment configuration ready (.env.local)

**#531.2: Implement Secure Private Key Handling** ✅ COMPLETED [100%]
- [x] Environment-based key configuration in .env.local
- [x] ZoraService private key integration with Viem
- [x] Base Sepolia testnet configuration (chainId: 84532)
- [x] API authentication middleware implemented
- [x] Test scripts ready for execution
- [x] Add funded Base Sepolia private key to .env.local
- [x] Execute test-zora-coin-creation.ts script
- [x] Infrastructure testing and validation complete
- [x] Zora SDK integration verified and working
- [ ] FUTURE: HSM/AWS KMS for production
- [ ] FUTURE: ENS subdomain integration
- [ ] FUTURE: Emergency key rotation

**#531.3: Refactor Metadata System to Use Zora Metadata Builder** ✅ COMPLETED [100%]
- [x] Replace custom `buildMetadataJson()` with Zora metadata builder
- [x] Implement `.withProperties()` for ETS attribution data
- [x] Use `createZoraUploaderForCreator()` for IPFS infrastructure
- [x] Add staging/production environment handling
- [x] Configure Zora API key for real IPFS uploads
- [x] Test real IPFS metadata generation and validation
- [x] Generate actual IPFS URIs viewable on public gateways
- [x] Preserve rich ETS properties in metadata JSON
- [x] Remove custom validation in favor of Zora SDK validation
- [x] Implement placeholder SVG image generation
- [ ] FUTURE: Professional TAG coin image generation (separate sub-issue)

### 🏗️ Future Work - Advanced Service Features
- [ ] Implement event listener with reorg protection
- [ ] Queue-based processing system (Redis/SQS)
- [ ] Idempotency controls
- [ ] Error handling and retry logic
- [ ] Database for state management
- [ ] Health check endpoints
- [ ] Subgraph integration for state queries