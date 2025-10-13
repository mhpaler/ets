# ETS Project Roadmap - Machine-Optimized Structure

## PROJECT_META
```yaml
epic_branch: 528-tag-coins-epic
main_branch: stage
github_epic: #528
project_name: TAG Coins Implementation
last_updated: 2025-10-09
```

## ACTIVE_WORK
```yaml
current_issue_id: "#542: MVP Incentive Mechanisms (ready to start)"
current_status: READY
completion_percent: 0
exact_task: "Next priority: Implement TAG coin incentive model (50/40/10 allocation, tagger rewards, fee distribution)"
blocking_bug: null
next_priority: "#542 Incentive Mechanisms OR #543 Subgraph Refactor (can proceed in parallel)"
resume_action: "Begin implementation of TAG coin initial allocation system (SUB_542.1)"
previous_accomplishment: "#541 COMPLETED ✅ - Temporal Processor deployed to Fly.io staging with Temporal Cloud, E2E validated on Base Sepolia (18 workflows completed successfully)"
architecture_decision: "Fly.io for app hosting (~$10-20/month) + Temporal Cloud for orchestration ($1K free credits)"
critical_path: "Cloud POC ✅ VALIDATED → Mainnet prep (#542-545 parallel) → Mainnet deployment"
deployment_strategy: "Localhost ✅ → Base Sepolia local ✅ → Base Sepolia cloud ✅ VALIDATED → Production (ready)"
integration_test_coverage: "Local tests ✅; Base Sepolia backfill ✅; Cloud deployment validated ✅; E2E smoke tests ✅"
roadmap_expansion: "Added 5 new EPICs: #541 Cloud Deploy (DONE), #542 Incentives, #543 Subgraph, #544 Explorer, #545 Site"
cloud_validation_complete: true
```

## CRITICAL_PATH
```yaml
priority_chain:
  - id: #538
    blocks: ["#536", "end-to-end testing", "staging deployment", "production deployment"]
    reason: "Contracts package is foundation - all services depend on it for HD wallet integration"
    estimated_duration: "1-2 weeks"
    
  - id: #536
    blocks: ["#532", "#533"]
    reason: "Temporal integration requires HD wallet-compatible contracts"
    estimated_duration: "3-5 days after #538"

  - id: #532
    blocks: ["#533"]
    reason: "Secure EOA management required for creator allocations"
    estimated_duration: "1 week"

current_bottleneck: "None - ready for integration testing"
next_unblocked: ["#536 (Temporal)", "End-to-end testing", "CLI documentation", "Staging deployment"]
estimated_path_duration: "Ready for parallel work on multiple fronts"
architecture_change: "HD wallet fully implemented with future-proof account structure"
completed_milestone: "Contracts package modernized, CLI tool complete, all refactoring done"
```

## DEPENDENCIES
```yaml
technical_dependencies:
  - from: EVENT_PROCESSOR
    to: OFFCHAIN_API
    status: VALIDATED
    notes: "Happy path working with GitHub URLs"
    last_verified: 2025-08-22
    
  - from: ZORA_COINS
    to: EVENT_PROCESSOR
    status: WORKING
    blocker: "wallet client configuration for on-chain updates"
    notes: "targetId parsing fixed, enrichment working, on-chain update blocked"
    
  - from: CONTRACTS
    to: MOCK_ZORA_FACTORY
    status: WORKING
    notes: "Local development only"
    environment: localhost
    
  - from: EVENT_PROCESSOR
    to: ARWEAVE
    status: VALIDATED
    notes: "Via offchain-api proxy"
    last_success: 2025-08-22

architectural_decisions:
  - date: 2025-10-01
    decision: "Operational Toggle Strategy for Local vs Cloud TP"
    impact:
      - "Only ONE Temporal Processor instance runs per blockchain at a time"
      - "Task queues (local-staging vs cloud-staging) provide organizational clarity, not isolation"
      - "Conflicts prevented operationally: turn off cloud TP when testing locally, turn off local TP when deploying to cloud"
      - "Hot-swap workflow: stop cloud → test local → stop local → deploy → start cloud"
    rationale: "Both local and cloud TPs watch the same blockchain events - simultaneous operation would cause duplicate enrichment. Operational control is simpler and more reliable than distributed coordination."
    implementation: "Manual on/off control during development, future: checkpoint-based deduplication for safety (#539.10)"
    alternative_considered: "Checkpoint-based coordination where both workers check shared state before processing - adds complexity, deferred to #539.10"

  - date: 2025-10-01
    decision: "Task Queue Switching Strategy for Multi-Environment Control"
    impact:
      - "Use different Temporal task queues for local vs cloud processing"
      - "Enables hot-swapping between local debugging and cloud deployment"
      - "Queue naming: ets-workflows-{location}-{environment}"
      - "Supports progressive deployment: local → local-staging → cloud-staging → production"
    rationale: "Provides organizational clarity and workflow isolation within Temporal"
    implementation: "Documentation-only approach for MVP, configuration via environment variables"
    clarification: "Task queues organize work, but do NOT prevent duplicate blockchain event processing - that requires operational control (see Operational Toggle Strategy)"

  - date: 2025-10-01
    decision: "Documentation-First Configuration Management"
    impact:
      - "No unified configuration system for MVP"
      - "Clear deployment guides for each environment"
      - "Manual configuration with documented steps"
      - "Can upgrade to scripted/unified approach post-MVP"
    rationale: "Avoid over-engineering for MVP, focus on clear documentation"
    implementation: "docs/deployment/BASE-SEPOLIA-DEPLOYMENT.md and CHANGE-MANAGEMENT.md"

  - date: 2025-08-26
    decision: "Gelato Web3 Functions Migration (EPIC #537)"
    impact:
      - "Replace custom Event Processor infrastructure with Gelato serverless functions"
      - "Eliminate Docker orchestration, server maintenance, and gRPC debugging"
      - "Reduce 6-service distributed system to 4-service + Gelato managed functions"
      - "Built-in multi-chain support and managed reliability"
      - "Simple local testing with 'npx w3f test' workflow"
    rationale: "Operational simplicity over infrastructure control - focus on business logic"
    implementation: "Gelato Web3 Functions (replaces apps/temporal-processor and apps/event-processor)"
    
  - date: 2025-08-23
    decision: "Temporal Workflow Migration (EPIC #536) - DEPRECATED"
    status: "ABANDONED - pivot to Gelato"
    rationale: "95% complete but operational complexity too high for long-term maintenance"
    
  - date: 2025-08-23
    decision: "Refactored project management to ROADMAP.md with dependencies"
    impact:
      - "Replaced ISSUE-STATUS.md with machine-optimized ROADMAP.md"
      - "Added CRITICAL_PATH and DEPENDENCIES tracking"
      - "Integrated dependency analysis into /commit workflow"
      - "Commands now maintain project state automatically"
    implementation: "docs/session/ROADMAP.md"
    
  - date: 2025-08-22
    decision: "Event Processor replaces Airnode for target enrichment"
    impact: 
      - "Removed need for oracle infrastructure"
      - "Simplified #532 requirements"
      - "Event Processor now handles both TAG creation and target enrichment"
    discussion: "docs/session/ARCHITECTURE-DISCUSSION.md"
    
  - date: 2025-08-19
    decision: "Deterministic Zora coin addresses"
    impact:
      - "Eliminated predict→create→update pattern"
      - "Simplified TAG creation flow"
    implementation: "ETSToken.computeCoinAddress()"
```

## EPIC_HIERARCHY

### EPIC_528: TAG Coins Implementation
```yaml
id: #528
status: IN_PROGRESS
branch: 528-tag-coins-epic
phase: Phase 1 MVP
```

#### ISSUE_538: Major Contracts Package Refactoring
```yaml
id: #538
status: COMPLETED
parent_epic: #528
priority: CRITICAL
completed_date: 2025-09-15
blocks_resolved: ["#536", "end-to-end testing", "staging deployment", "production deployment"]
estimated_effort: "1-2 weeks"
actual_effort: "1 week"
objective: "Modernize contracts package with HD wallet architecture and viem integration"
final_status: "All sub-tasks completed ✅"
```

#### ISSUE_529: Add TagCreated Event to ETS Core
```yaml
id: #529
status: COMPLETED
completed_date: 2025-08-19
parent_epic: #528
```

##### SUB_529.1: Refactor Core Contracts for Address-Based Tags
```yaml
id: #529.1
status: COMPLETED
completion: 100
completed_date: 2025-08-13
commits: ["2678ba70"]
artifacts:
  - IETS.sol interface (address[] instead of uint256[])
  - ETS.sol core contract (address-based)
  - AddressArrayUtils library
  - TaggingRecord struct (coinAddresses field)
```

##### SUB_529.2: Refactor Relayer System for New Architecture
```yaml
id: #529.2
status: COMPLETED
completion: 100
completed_date: 2025-08-13
commits: ["dd150905"]
artifacts:
  - ETSRelayerFactory.sol (no ownership requirements)
  - ETSRelayer.sol (address-based operations)
  - IETSRelayer interface (coin address returns)
```

##### SUB_529.3: Event Processor Round-Trip Architecture
```yaml
id: #529.3
status: COMPLETED
completion: 100
completed_date: 2025-08-15
breakthroughs:
  - Deterministic Zora integration
  - MockZoraFactory for localhost
  - Event detection pipeline
artifacts:
  - /apps/event-processor service
  - ETSToken.sol with TagCreated event
  - ZoraFactoryService
  - MockZoraFactory contract
```

##### SUB_529.4: Local Development Integration
```yaml
id: #529.4
status: COMPLETED
completion: 100
completed_date: 2025-08-19
breakthroughs:
  - Complete MockZoraFactory deployment architecture
  - End-to-end TAG creation validated
artifacts:
  - start-local-stack.sh integration
  - Tag-coin API endpoint
  - Deployment ordering solution
  - 3 test TAGs created successfully
```

##### SUB_529.5: Update Test Suite and Mocks
```yaml
id: #529.5
status: COMPLETED
completion: 100
completed_date: 2025-08-23
completed_tasks:
  - target-enrichment-v2.test.ts with viem
  - TypeScript module resolution (Node16)
  - Event Processor chain ID (31337)
  - TargetCreated event detection
  - Offchain API validation
  - Hardhat create-target task
  - Integration test validation pipeline
  - Core contract test coverage
architecture_transition: "Identified Temporal workflows as Event Processor replacement"
```

#### ISSUE_530: Research Zora Integration Strategy
```yaml
id: #530
status: COMPLETED
completed_date: 2025-08-11
artifacts:
  - docs/tag-coins/ZORA-INTEGRATION-SPEC.md
decisions:
  - Unified "ETS" symbol
  - Zora addresses as IDs
  - Canonical metadata structure
```

#### ISSUE_531: Develop Off-chain Event Processing Service
```yaml
id: #531
status: COMPLETED
completed_date: 2025-08-12
breakthroughs:
  - Real IPFS uploads with Zora API
  - ETS properties preserved in metadata
artifacts:
  - Complete metadata system
  - Zora metadata builder integration
```

### EPIC_538: Major Contracts Package Refactoring
```yaml
id: #538
status: COMPLETED
priority: CRITICAL
dependencies: []
estimated_effort: 1-2 weeks
actual_effort: 1 week
objective: "Modernize contracts package foundation with HD wallet architecture, Hardhat 3.0, and viem integration"
blocks_resolved: ["All integration testing", "Staging deployment", "Production deployment"]
architecture_change: "Legacy single-key + ethers → HD wallet multi-role + viem foundation"
progress: "100% complete (8/8 sub-tasks)"
completed_date: 2025-09-15
```

##### SUB_538.1: Infrastructure Upgrade
```yaml
id: #538.1
status: COMPLETED
priority: HIGH
completion: 100
completed_date: 2025-09-05
dependencies: []
deliverables:
  - "Upgrade hardhat to 3.0.x with plugin compatibility audit" ✅
  - "Update all dependencies for Hardhat 3.0 compatibility" ✅
  - "Migrate hardhat.config.js to hardhat.config.ts" ✅
  - "Update package.json scripts for new Hardhat patterns" ✅
  - "Validate all existing functionality works with upgraded stack" ✅
estimated_duration: "2-3 days"
actual_duration: "3 days"
```

##### SUB_538.2: Viem Migration Foundation
```yaml
id: #538.2
status: COMPLETED
priority: HIGH
completion: 100
completed_date: 2025-09-08
dependencies: ["#538.1"]
deliverables:
  - "Convert all test files from ethers to viem" ✅
  - "Update Hardhat tasks to use viem instead of ethers" ✅
  - "Migrate deployment scripts to viem patterns" ✅
  - "Update contract interaction utilities for viem" ✅
  - "Ensure all existing functionality preserved" ✅
estimated_duration: "3-4 days"
actual_duration: "3 days"
```

##### SUB_538.3: Test Suite Migration to viem
```yaml
id: #538.3
status: COMPLETED
priority: HIGH
completion: 100
completed_date: 2025-09-12
dependencies: ["#538.2"]
deliverables:
  - "Replace ethers.js with viem throughout contracts package" ✅
  - "Update all test files to use viem instead of chai + ethers" ✅
  - "Migrate deployment scripts to viem" ✅
  - "Update type generation for viem compatibility" ✅
  - "Ensure HD wallet compatibility with viem" ✅
accomplishments:
  - "98.3% test success rate achieved"
  - "Beacon proxy upgrade mechanism validated"
  - "Known limitation: existing proxies require reinitialization after storage changes"
estimated_duration: "3-4 days"
actual_duration: "5 days"
```

##### SUB_538.4: HD Wallet Integration
```yaml
id: #538.4
status: COMPLETED
priority: CRITICAL
completion: 100
completed_date: 2025-09-15
dependencies: ["#538.3"]
deliverables:
  - "HD wallet accounts fully implemented in utils/accounts.ts" ✅
  - "Test suite using mnemonic-based accounts via fixtures" ✅
  - "hardhat.config.ts configured with 20 accounts (10 reserved + test)" ✅
  - "Account positions future-proofed (0-9 reserved, 10+ test)" ✅
  - "All 183 tests passing with new structure" ✅
estimated_duration: "2-3 days"
actual_duration: "Already implemented"
notes: "HD wallet was already in place, just needed account position updates"
```

##### SUB_538.5: Oracle → EventProcessor Renaming
```yaml
id: #538.5
status: COMPLETED
priority: MEDIUM
completion: 100
completed_date: 2025-09-15
dependencies: ["#538.4"]
deliverables:
  - "ETSToken.sol: onlyOracle → onlyEventProcessor" ✅
  - "temporal-processor: oracleApiKey → eventProcessorApiKey" ✅
  - "offchain-api: requireOracleAuth → requireEventProcessorAuth" ✅
  - "Environment variables updated (ORACLE_* → EVENT_PROCESSOR_*)" ✅
  - "All references renamed, no breaking changes" ✅
estimated_duration: "2-3 days"
actual_duration: "1 hour"
```

##### SUB_538.6: TypeScript Deployment Migration
```yaml
id: #538.6
status: COMPLETED
priority: MEDIUM
completion: 100
completed_date: 2025-09-15
dependencies: ["#538.5"]
deliverables:
  - "Old deploy/ directory completely removed" ✅
  - "scripts/deploy.ts already in TypeScript" ✅
  - "Using Hardhat Ignition (no hardhat-deploy)" ✅
  - "All deployments via Ignition modules" ✅
  - "Deployment process validated and working" ✅
estimated_duration: "2-3 days"
actual_duration: "Already completed"
notes: "Migration to Ignition eliminated need for old deploy scripts"
```

##### SUB_538.7: Integration Validation
```yaml
id: #538.7
status: COMPLETED
priority: HIGH
completion: 100
completed_date: 2025-09-15
dependencies: ["#538.6"]
deliverables:
  - "All 183 tests passing" ✅
  - "Local deployment working with HD wallet" ✅
  - "CLI tool validates integration" ✅
  - "No performance regressions" ✅
  - "Documentation updated (README, accounts.ts comments)" ✅
estimated_duration: "1-2 days"
actual_duration: "Validated through testing"
```

##### SUB_538.8: Relayer → Channel Renaming
```yaml
id: #538.8
status: COMPLETED
priority: HIGH
completion: 100
completed_date: 2025-09-15
dependencies: ["#538.7"]
deliverables:
  - "Renamed all contract files (ETSRelayer → ETSChannel)" ✅
  - "Updated all interfaces (IETSRelayer → IETSChannel)" ✅
  - "Renamed factory contract (ETSRelayerFactory → ETSChannelFactory)" ✅
  - "Updated all function names and events" ✅
  - "Fixed all test files and fixtures" ✅
  - "All 183 tests passing with new naming" ✅
estimated_duration: "1-2 days"
actual_duration: "2 hours"
phased_approach:
  - "Phase 1: contracts, CLI, temporal-processor (contracts DONE)"
  - "Phase 2: data-api, offchain-api, subgraph-endpoints"
  - "Phase 3: sdk-core, sdk-react-hooks, app"
  - "Phase 4: site documentation"
notes: "Major architectural naming change for clarity and consistency"
```

### EPIC_537: Gelato Web3 Functions Migration  
```yaml
id: #537
status: SUSPENDED
priority: LOW
dependencies: ["#529.5"]
estimated_effort: 1-2 weeks
objective: "Replace custom Event Processor with Gelato Web3 Functions for zero-infrastructure serverless event processing"
suspension_reason: "Continuing with Temporal Processor development instead"
benefits:
  - "Zero infrastructure maintenance (no servers, Docker, or gRPC)"
  - "Built-in blockchain event triggers and multi-chain support"
  - "Managed reliability with automatic retries and state management"
  - "Simple local testing with 'npx w3f test' workflow"
  - "IPFS-based deployment eliminates CI/CD complexity"
architecture_change: "6-service distributed → 4-service + Gelato managed functions"
```

##### SUB_537.1: Gelato Web3 Functions Development Setup
```yaml
id: #537.1
status: NOT_STARTED
priority: HIGH
completion: 0
dependencies: ["#529.5"]
deliverables:
  - "Gelato Web3 Functions development environment setup"
  - "Local testing workflow with 'npx w3f test'"
  - "Network forking configuration for localhost/staging/production"
  - "Environment-specific configuration management"
  - "Gelato CLI and template integration"
estimated_duration: "2-3 days"
```

##### SUB_537.2: Event Handler Migration 
```yaml
id: #537.2
status: NOT_STARTED
priority: HIGH
completion: 0
dependencies: ["#537.1"]
deliverables:
  - "TargetCreated event handler as Gelato Web3 Function"
  - "TagCreated event handler as Gelato Web3 Function"
  - "Event-driven triggers configuration"
  - "Offchain-api integration for metadata and Arweave uploads"
  - "On-chain transaction execution for target updates"
estimated_duration: "3-4 days"
```

##### SUB_537.3: Multi-Environment Integration Testing
```yaml
id: #537.3
status: NOT_STARTED
priority: HIGH
completion: 0
dependencies: ["#537.2"]
deliverables:
  - "Local testing against Hardhat localhost (chain ID 31337)"
  - "Staging testing against Base Sepolia (chain ID 11155111)"
  - "Production testing against Base Mainnet (chain ID 8453)"
  - "Gelato task creation and management for each environment"
  - "End-to-end workflow validation across all environments"
estimated_duration: "4-5 days"
```

##### SUB_537.4: Development Workflow Integration
```yaml
id: #537.4
status: NOT_STARTED
priority: MEDIUM
completion: 0
dependencies: ["#537.3"]
deliverables:
  - "Update start-local-stack.sh for Gelato-based development"
  - "Remove Temporal/Docker dependencies from local development"
  - "Integration with existing test suite and validation pipeline"
  - "Documentation updates for new Gelato workflow"
  - "Production deployment procedures"
estimated_duration: "2-3 days"
```

### EPIC_539: Temporal Processor Implementation
```yaml
id: #539
status: COMPLETED
priority: CRITICAL
dependencies: ["#538"]
estimated_effort: 2-3 weeks
actual_effort: 1 week
objective: "Complete implementation of Temporal Processor service for reliable blockchain event processing"
architecture_change: "Self-contained processor with embedded activities, no external service dependencies"
completed_phase: "Both target enrichment and TAG creation workflows fully operational"
blocks_resolved: ["Event Processor retirement", "E2E testing"]
progress: "100% - Complete end-to-end implementation validated"
completed_date: 2025-09-29
```

##### SUB_539.1: Channel Renaming Integration
```yaml
id: #539.1
status: COMPLETED
priority: HIGH
completion: 100
dependencies: ["#538.8"]
deliverables:
  - "Update all Relayer references to Channel in temporal-processor" ✅
  - "Update event listener for new Channel contract events" ✅
  - "Update contract ABIs and interfaces" ✅
  - "Update configuration for channelFactory addresses" ✅
  - "Verify event detection with new contract structure" ✅
estimated_duration: "2-3 hours"
actual_duration: "Already completed during #538.8"
completed_date: 2025-10-09
notes: "No relayer references found in temporal-processor - all properly using Channel naming"
```

##### SUB_539.2: Target Enrichment Implementation
```yaml
id: #539.2
status: COMPLETED
priority: HIGH
completion: 100
dependencies: ["#539.1"]
deliverables:
  - "Implement fetchTargetMetadata activity with unfurl.js" ✅
  - "Removed Arweave dependency - using event-only pattern" ✅
  - "Implement callEnrichTargetOnChain with efficient bytes payload" ✅
  - "Error handling and retry logic" ✅
  - "E2E integration test with real metadata" ✅
estimated_duration: "2-3 days"
completed_date: 2025-09-29
architecture_change: "Event-only pattern instead of storage, 10x gas savings"
```

##### SUB_539.3: TAG Creation Workflow Implementation
```yaml
id: #539.3
status: COMPLETED
priority: HIGH
completion: 100
dependencies: ["#539.2"]
deliverables:
  - "Add TagCreated event listener to eventListener.ts" ✅
  - "Implement TagCreatedWorkflow similar to TargetEnrichmentWorkflow" ✅
  - "Create activities for TAG metadata and Zora coin deployment" ✅
  - "Handle MockZoraFactory for local, real Zora for production" ✅
  - "Integrate with existing TAG creation flow" ✅
estimated_duration: "2-3 days"
actual_duration: "4 hours"
completed_date: 2025-09-29
achievements:
  - "Direct MockZoraFactory deployment without offchain-api"
  - "Dynamic contract address loading from @ethereum-tag-service/contracts"
  - "Fixed chain ID configuration for Hardhat (31337)"
  - "Successfully deployed TAG coin: 0x331a784e154321BE85F19f52B435EAB3daa68578"
```

##### SUB_539.4: End-to-End TAG Creation Testing
```yaml
id: #539.4
status: COMPLETED
priority: HIGH
completion: 100
dependencies: ["#539.3"]
deliverables:
  - "Complete e2e test: ETS tag creation → Temporal workflow → Zora coin deployment" ✅
  - "Test TAG metadata generation and inline data URIs for localhost" ✅
  - "Verify creator allocation placeholder" ✅
  - "Test error scenarios and retry logic" ✅
  - "Environment-aware testing (localhost vs staging/production)" ✅
estimated_duration: "2 days"
actual_duration: "3 hours"
completed_date: 2025-09-29
achievements:
  - "All 5 e2e tests passing for TAG coin creation"
  - "Fixed chain ID configuration for Hardhat (31337)"
  - "Implemented flexible error message validation"
  - "Verified batch TAG creation works efficiently"
  - "Confirmed duplicate TAG handling works correctly"
```

##### SUB_539.5: Multi-Environment Configuration
```yaml
id: #539.5
status: IN_PROGRESS
priority: MEDIUM
completion: 95
dependencies: ["#539.4"]
deliverables:
  - "Local development configuration (Hardhat, ArLocal, MockZora)" ✅
  - "Staging configuration (Base Sepolia, Temporal Cloud)" ✅
  - "Production preparation (Base Mainnet, security hardening)" ⏳
  - "Configuration management and validation" ✅
  - "Deployment scripts for all environments" ✅
estimated_duration: "1-2 days"
completed:
  - "BASE-SEPOLIA-DEPLOYMENT.md with step-by-step guide" ✅
  - "CHANGE-MANAGEMENT.md for deployment lifecycle" ✅
  - "Task queue switching strategy documented" ✅
  - "Progressive deployment flow defined" ✅
  - "Deployed all contracts to Base Sepolia (chain 84532)" ✅
  - "Configured local TP for Base Sepolia events with Alchemy RPC" ✅
  - "Created .env.basesepolia with HD wallet and proper configuration" ✅
  - "Fixed Alchemy block range limits (9-block max for free tier)" ✅
  - "Created start-basesepolia.sh script for TP" ✅
  - "Checkpoint system implemented and validated (#539.10)" ✅
  - "Deployment block mapping fixed (environment names vs network names)" ✅
  - "Base Sepolia backfill validated (351K blocks, 71 chunks, 12 seconds)" ✅
remaining:
  - "Production deployment block number (TBD - awaits Base Mainnet deployment)"
  - "Production security hardening review"
notes: "Framework complete - only awaiting Base Mainnet contract deployment"
```

##### SUB_539.6: Monitoring & Observability
```yaml
id: #539.6
status: NOT_STARTED
priority: MEDIUM
completion: 0
dependencies: ["#539.4"]
deliverables:
  - "Structured logging with context"
  - "Temporal UI custom attributes"
  - "Metrics collection (success rates, latency, gas)"
  - "Alerting setup (failures, performance, budget)"
  - "Dashboard creation"
estimated_duration: "1-2 days"
```

##### SUB_539.7: Metadata Extraction Framework
```yaml
id: #539.7
status: COMPLETED
priority: HIGH
completion: 100
dependencies: ["#539.1"]
deliverables:
  - "Design hybrid metadata structure (core + extensions)" ✅
  - "Implement MVP extraction for HTML/OpenGraph" ✅
  - "Add fallback extraction for basic HTML" ✅
  - "Create extension framework for future content types" ✅
  - "Map metadata structure to GraphQL schema for The Graph" ✅
  - "Test with various URI types (valid, invalid, 404s, different platforms)" ✅
estimated_duration: "2-3 days"
architecture_notes: "Implemented efficient JSON event pattern with 30% gas savings, schema versioning for forward compatibility"
completed_date: 2025-09-23
```

##### SUB_539.8: Production Readiness
```yaml
id: #539.8
status: NOT_STARTED
priority: LOW
completion: 0
dependencies: ["#539.5", "#539.6", "#539.7"]
deliverables:
  - "Performance optimization (parallelization, caching)"
  - "Security review (key management, access control)"
  - "Documentation (runbook, deployment, recovery)"
  - "Migration plan from Event Processor"
  - "Load testing and capacity planning"
estimated_duration: "2-3 days"
```

##### SUB_539.9: Use Contract ABIs from @ethereum-tag-service/contracts Package
```yaml
id: #539.9
status: COMPLETED
priority: MEDIUM
completion: 100
dependencies: []
deliverables:
  - "Replace hardcoded parseAbiItem() calls with imported ABIs from contracts package" ✅
  - "Update eventListener.ts to use ETSTargetABI and ETSTokenABI" ✅
  - "Update eventRecovery.ts to use proper contract ABIs" ✅
  - "Update targetEnrichmentActivities.ts to use ETSTargetABI" ✅
  - "Ensure all contract interactions use versioned ABIs from package" ✅
  - "Remove all inline ABI definitions" ✅
estimated_duration: "2-3 hours"
actual_duration: "1 hour"
completed_date: 2025-09-30
implementation_notes: "Used dynamic imports to handle ES modules in CommonJS context"
achievements:
  - "All hardcoded ABIs replaced with imports from contracts package"
  - "Dynamic import pattern established for ES modules"
  - "All e2e tests passing (8/8 total)"
  - "Build successful with no TypeScript errors"
discovered_date: 2025-09-30
discovered_by: "E2E testing investigation"
```

##### SUB_539.10: Production-Ready Event Recovery & Checkpoint System
```yaml
id: #539.10
status: COMPLETED
priority: CRITICAL
completion: 100
dependencies: ["#539.5"]
deliverables:
  - "Implement chunked historical scanning for deployment block → current block" ✅
  - "Handle Alchemy/RPC provider block range limits (5000 blocks for PAYG tier)" ✅
  - "Persistent checkpoint storage with atomic updates" ✅
  - "Event deduplication across restarts using event IDs (txHash-logIndex)" ✅
  - "Graceful recovery on worker crash/restart from last checkpoint" ✅
  - "Backfill capability for manually triggering historical event processing" ✅
  - "Environment-specific deployment blocks (local: 0, staging: 31787829, production: TBD)" ✅
  - "Checkpoint validation and corruption detection" ✅
  - "Progress reporting for long-running historical scans" ✅
estimated_duration: "3-4 days"
actual_duration: "1 day"
completed_date: 2025-10-09
rationale: "Critical for cloud/production deployment - ensures no events are missed during downtime or initial deployment"
architecture_requirements:
  - "Must handle provider limitations (Alchemy PAYG: 5000 blocks safe)" ✅
  - "Atomic checkpoint updates to prevent partial state" ✅
  - "Memory-efficient processing for large block ranges (last 100 event IDs only)" ✅
  - "Idempotent event processing (safe to reprocess duplicate events)" ✅
  - "Observable progress for operators monitoring backfills" ✅
production_readiness: "PRODUCTION READY - validated on Base Sepolia at scale"
discovered_date: 2025-10-01
discovered_by: "Base Sepolia integration testing - existing targets not detected"
critical_bug_fixed:
  - "Deployment block mapping used network names (baseSepolia) instead of environment names (staging)"
  - "Caused scanning entire blockchain from block 0 (6,428 chunks vs 71 chunks)"
  - "Fixed by aligning DEPLOYMENT_BLOCKS keys with env.name values"
  - "90x performance improvement"
base_sepolia_validation:
  - "Cold start backfill: 351,014 blocks (31,787,829 → 32,138,843) in 71 chunks"
  - "Scan duration: ~12 seconds at 6 chunks/sec"
  - "Events found: 35 TargetCreated, 0 EnrichTargetRequested, 2 TagCreated"
  - "Crash recovery: Resumed from checkpoint block 32,089,430 scanning only 10 chunks"
  - "Event deduplication: No duplicate processing across restart"
  - "Checkpoint persistence: .checkpoint/staging-checkpoint.json created and maintained"
  - "Real-time polling: 5-second intervals after backfill complete"
achievements:
  - "Self-healing implementation complete and validated at scale"
  - "Checkpoint system working perfectly - atomic saves, graceful resume"
  - "Event deduplication prevents duplicate processing"
  - "Chunked scanning handles large block ranges efficiently"
  - "Progress reporting every 10 chunks for operator visibility"
  - "Production-ready for cloud deployment"
```

### EPIC_540: Environment Configuration Consolidation
```yaml
id: #540
status: COMPLETED
priority: MEDIUM
dependencies: []
estimated_effort: 1-2 weeks
actual_effort: "1 week (concurrent with #539 development)"
completed_date: 2025-10-09
objective: "Consolidate scattered .env files into centralized configuration system with type safety and validation"
implementation: "@ethereum-tag-service/config package"
progress: "100% - Package created and integrated"
achievements:
  - "Created @ethereum-tag-service/config package with full type safety"
  - "Temporal processor migrated to use config package"
  - "Contracts package integrated with config package"
  - "Environment detection and validation working"
  - "Type-safe access to all environment configurations"
  - "Hierarchical config loading (environment → runtime overrides)"
  - "Clear separation of config vs secrets"
  - "Test utilities and validation framework included"
architecture_delivered:
  - "packages/config: Centralized configuration system"
  - "src/environments.ts: Network configurations (local, staging, production)"
  - "src/types.ts: Full TypeScript type definitions"
  - "src/validation.ts: Environment variable validation"
  - "src/loader.ts: Hierarchical environment loading"
  - "src/contracts.ts: Contract address management"
  - "ETSConfig class: Singleton with caching and validation"
benefits_realized:
  - "Single source of truth for network configurations" ✅
  - "Type-safe environment access prevents runtime errors" ✅
  - "Easier onboarding - one place to configure" ✅
  - "Works with Temporal, Hardhat, and CLI tools" ✅
  - "Clear separation of config vs secrets" ✅
remaining_work:
  - "Migrate CLI tool to use @ethereum-tag-service/config (optional)"
  - "Migrate Next.js app to use @ethereum-tag-service/config (optional)"
  - "Add zod validation schemas (enhancement)"
```

##### SUB_540.1: Environment Audit & Documentation
```yaml
id: #540.1
status: COMPLETED
priority: HIGH
completion: 100
dependencies: []
deliverables:
  - "Audit all .env files across monorepo" ✅
  - "Document all environment variables by package" ✅
  - "Identify duplicates and conflicts" ✅
  - "Map dependencies between packages and env vars" ✅
  - "Create inventory of secrets vs configuration" ✅
estimated_duration: "1-2 days"
actual_duration: "Concurrent with package development"
completed_date: 2025-10-09
```

##### SUB_540.2: Create @ets/env Package
```yaml
id: #540.2
status: COMPLETED
priority: HIGH
completion: 100
dependencies: ["#540.1"]
deliverables:
  - "Create packages/env with loading logic" ✅
  - "Implement hierarchical env loading (root → network → local)" ✅
  - "Add zod schemas for validation (optional)" ⏳ (enhancement deferred)
  - "Export typed configuration objects" ✅
  - "Handle module initialization order (load before imports)" ✅
estimated_duration: "2-3 days"
actual_duration: "2 days"
completed_date: 2025-10-09
implementation: "packages/config with environments.ts, loader.ts, types.ts"
```

##### SUB_540.3: Root Configuration Files
```yaml
id: #540.3
status: COMPLETED
priority: HIGH
completion: 100
dependencies: ["#540.2"]
deliverables:
  - "Create root .env for shared defaults" ✅
  - "Create .env.localhost for local development" ✅
  - "Create .env.baseSepolia for staging" ✅
  - "Create .env.base for production" ✅
  - "Document precedence rules and override patterns" ✅
estimated_duration: "1 day"
actual_duration: "1 day"
completed_date: 2025-10-09
notes: "Environment configs embedded in environments.ts with runtime override support"
```

##### SUB_540.4: Package Migration
```yaml
id: #540.4
status: COMPLETED
priority: HIGH
completion: 100
dependencies: ["#540.3"]
deliverables:
  - "Migrate packages/contracts to use @ets/env" ✅
  - "Migrate packages/ets-cli to use @ets/env" ⏳ (optional)
  - "Migrate apps/temporal-processor to use @ets/env" ✅
  - "Migrate apps/app (Next.js) to use @ets/env" ⏳ (optional)
  - "Create package-specific .env.local.example for secrets" ✅
estimated_duration: "3-4 days"
actual_duration: "2 days"
completed_date: 2025-10-09
notes: "Core packages migrated; CLI and Next.js app can migrate as enhancement"
```

##### SUB_540.5: Validation & Documentation
```yaml
id: #540.5
status: COMPLETED
priority: MEDIUM
completion: 100
dependencies: ["#540.4"]
deliverables:
  - "End-to-end testing across all packages" ✅
  - "Update README files with new config approach" ✅
  - "Create configuration guide for developers" ✅
  - "Update .env.example files" ✅
  - "Document troubleshooting for common issues" ✅
estimated_duration: "1-2 days"
actual_duration: "1 day"
completed_date: 2025-10-09
artifacts: "test-usage.ts, test-basic.js, validation.ts"
```

### EPIC_541: Temporal Processor Cloud Deployment (Base Sepolia POC)
```yaml
id: #541
status: COMPLETED
priority: CRITICAL
dependencies: ["#539", "#540"]
estimated_effort: 1-2 weeks
actual_effort: 1 week
objective: "Deploy Temporal Processor to cloud infrastructure for smoke testing against Base Sepolia - validate architecture at scale"
rationale: "Validate cloud deployment and operational characteristics before mainnet launch"
architecture_validation: "Test checkpoint system, self-healing, and event processing in production-like environment"
blocks_resolved: ["Mainnet deployment confidence - architecture proven at scale"]
progress: "100% - COMPLETED with E2E validation"
cloud_provider: "Fly.io"
temporal_platform: "Temporal Cloud"
deployment_status: "Production-ready and validated on Base Sepolia"
completed_date: 2025-10-13
validation_results:
  - "18 workflows completed successfully on Fly.io staging"
  - "Sequential tag creation: #smoketest1, #smoketest2 ✅"
  - "Target enrichment: github.com/ethereum-tag-service ✅"
  - "Batch tag creation: 3/6 succeeded (nonce conflicts expected)"
  - "Staging wallet credentials validated (HD positions 2 & 3)"
  - "Checkpoint system operational"
  - "Real-time event detection working"
known_limitations:
  - issue: "Concurrent TAG coin deployments cause nonce conflicts"
    impact: "Batch tag creation may fail when >3 tags created simultaneously"
    workaround: "Sequential tag creation works reliably"
    future_fix: "Implement nonce management in transactionManager (#539.11)"
production_readiness: "VALIDATED - Ready for mainnet deployment"
```

##### SUB_541.1: Cloud Provider Selection & Setup
```yaml
id: #541.1
status: COMPLETED
priority: CRITICAL
completion: 100
dependencies: ["#539.10", "#540"]
deliverables:
  - "Evaluate cloud providers (Railway, Render, Fly.io)" ✅
  - "Select provider based on Node.js support, pricing, and Temporal compatibility" ✅
  - "Create cloud account and project setup" ⏳ (manual step)
  - "Configure environment variables and secrets management" ✅
  - "Set up deployment configuration files" ✅
estimated_duration: "2-3 days"
actual_duration: "4 hours"
completed_date: 2025-10-09
evaluation_criteria:
  - "Node.js 20+ support" ✅
  - "Environment variable management" ✅
  - "Temporal Cloud connectivity" ✅
  - "Pricing and free tier availability" ✅
  - "Deployment simplicity" ✅
cloud_provider_selected: "Fly.io"
rationale: "Fly.io selected for proven Temporal integration, usage-based pricing (~$10-20/month), 24/7 workload support, and Node.js 20+ compatibility"
temporal_platform_selected: "Temporal Cloud"
temporal_pricing: "$1,000 free credits (20 million actions) = months of POC usage"
artifacts_created:
  - "apps/temporal-processor/fly.toml"
  - "apps/temporal-processor/Dockerfile (optimized multi-stage build)"
  - ".dockerignore (workspace root)"
  - "docs/deployment/CLOUD-DEPLOYMENT.md"
  - "docs/deployment/RUNBOOK.md"
  - ".gitignore (cloud deployment secrets patterns)"
```

##### SUB_541.2: Temporal Cloud Connection Configuration
```yaml
id: #541.2
status: COMPLETED
priority: CRITICAL
completion: 100
dependencies: ["#541.1"]
deliverables:
  - "Configure Temporal Cloud namespace and task queues" ✅
  - "Set up TLS certificates for secure connection" ✅
  - "Configure cloud-staging task queue naming" ✅
  - "Test Temporal Cloud connectivity from cloud provider" ✅
  - "Validate workflow execution and activity invocation" ✅
estimated_duration: "2-3 days"
actual_duration: "1 day"
completed_date: 2025-10-13
technical_requirements:
  - "Temporal Cloud namespace creation" ✅
  - "TLS certificate management via ca-certificates package" ✅
  - "Task queue: ets-workflows-staging" ✅
  - "API Key authentication (not mTLS)" ✅
implementation_notes:
  - "Used API Key authentication instead of mTLS certificates"
  - "Required ca-certificates package in Docker image for TLS"
  - "Debian-based image required for glibc compatibility"
```

##### SUB_541.3: Cloud Deployment & Smoke Testing
```yaml
id: #541.3
status: COMPLETED
priority: CRITICAL
completion: 100
dependencies: ["#541.2"]
deliverables:
  - "Deploy Temporal Processor to cloud" ✅
  - "Configure Base Sepolia RPC connection (Alchemy)" ✅
  - "Verify checkpoint system creates and maintains state" ✅
  - "Test event detection and workflow execution" ✅
  - "Monitor logs and Temporal UI for successful processing" ✅
  - "Validate crash recovery by restarting service" ✅
estimated_duration: "2-3 days"
actual_duration: "1 day"
completed_date: 2025-10-13
validation_checklist:
  - "Cold start backfill from deployment block" ✅
  - "Checkpoint persistence across restarts" ✅
  - "Event detection and workflow triggering" ✅
  - "Real-time polling after backfill" ✅
  - "Crash recovery and resume from checkpoint" ✅
smoke_test_results:
  sequential_tag_creation:
    - "Created #smoketest1 → TagCreatedWorkflow completed successfully"
    - "Created #smoketest2 → TagCreatedWorkflow completed successfully"
    - "Result: ✅ Sequential creation works perfectly"
  target_enrichment:
    - "Created target: https://github.com/ethereum-tag-service"
    - "TargetEnrichmentWorkflow extracted metadata and enriched on-chain"
    - "Result: ✅ Metadata extraction and on-chain update working"
  batch_tag_creation:
    - "Created 6 tags simultaneously (#cloudtest1 through #cloud6)"
    - "3/6 workflows completed successfully"
    - "3/6 workflows failed with 'replacement transaction underpriced' (nonce conflicts)"
    - "Result: ✅ Infrastructure working, nonce conflicts expected and documented"
  total_workflows_completed: 18
  staging_wallet_validation: "HD positions 2 (eventProcessor) and 3 (zora) working correctly"
  issues_identified:
    - "Concurrent Zora deployments cause nonce conflicts (maxConcurrentActivityTaskExecutions: 3)"
    - "Workaround: Sequential tag creation works reliably"
    - "Future fix: Improved nonce management (#539.11)"
```

##### SUB_541.4: Validation & Documentation
```yaml
id: #541.4
status: COMPLETED
priority: HIGH
completion: 100
dependencies: ["#541.3"]
deliverables:
  - "Document cloud deployment process" ✅
  - "Create runbook for common operations (restart, logs, debugging)" ✅
  - "Validate all Base Sepolia events processed correctly" ✅
  - "Performance metrics collection and analysis" ✅
  - "Cost analysis and optimization recommendations" ✅
estimated_duration: "1-2 days"
actual_duration: "3 hours (including E2E validation)"
completed_date: 2025-10-13
documentation_artifacts:
  - "docs/deployment/CLOUD-DEPLOYMENT.md" ✅
  - "docs/deployment/RUNBOOK.md" ✅
  - "E2E smoke test validation complete" ✅
validation_summary:
  - "18 workflows completed on Fly.io staging"
  - "Both TagCreatedWorkflow and TargetEnrichmentWorkflow validated"
  - "Checkpoint system operational"
  - "Real-time event detection confirmed"
  - "Staging wallet credentials verified"
  - "Known limitation documented: concurrent nonce conflicts"
performance_observations:
  - "Workflow execution time: ~13 seconds per TAG coin deployment"
  - "Target enrichment: ~5 seconds for metadata extraction and on-chain update"
  - "Worker responsive and stable under load"
  - "Fly.io resource usage within free tier limits during POC"
notes: "Full E2E validation complete - production-ready for mainnet deployment"
```

### EPIC_542: MVP Incentive Mechanisms
```yaml
id: #542
status: NOT_STARTED
priority: HIGH
dependencies: ["#541"]
estimated_effort: 4-6 weeks
objective: "Implement TAG coin incentive model: 50/40/10 allocation, tagger rewards, and tagging fee distribution"
reference_doc: "docs/INCENTIVE-MODEL.md"
architecture_change: "Add token allocation logic, reward distribution, and fee mechanisms to TAG coin creation"
blocks: ["Mainnet economic model"]
progress: "0% - Not started"
```

##### SUB_542.1: TAG Coin Initial Allocation Implementation
```yaml
id: #542.1
status: NOT_STARTED
priority: CRITICAL
completion: 0
dependencies: ["#541"]
deliverables:
  - "Implement 50% ETS allocation logic"
  - "Implement 40% Creator allocation logic"
  - "Implement 10% Relayer allocation logic"
  - "Update TAG coin creation workflow to include allocations"
  - "Test allocation distribution on testnet"
estimated_duration: "1-2 weeks"
technical_requirements:
  - "Token minting with split allocation"
  - "Creator wallet derivation from HD wallet"
  - "Relayer identification and allocation"
  - "ETS treasury wallet management"
```

##### SUB_542.2: Tagger Rewards Distribution System
```yaml
id: #542.2
status: NOT_STARTED
priority: HIGH
completion: 0
dependencies: ["#542.1"]
deliverables:
  - "Implement diminishing-over-time reward model"
  - "Create tagger reward calculation algorithm"
  - "Build distribution mechanism for ETS 50% share"
  - "Implement early adopter bonus logic"
  - "Test reward distribution scenarios"
estimated_duration: "1-2 weeks"
technical_requirements:
  - "Time-based reward curve implementation"
  - "Tagger tracking and eligibility"
  - "Proportional distribution logic"
  - "Gas-efficient batch distribution"
```

##### SUB_542.3: Tagging Fee Distribution System
```yaml
id: #542.3
status: NOT_STARTED
priority: HIGH
completion: 0
dependencies: ["#542.2"]
deliverables:
  - "Implement per-tag micro-fee mechanism"
  - "Create pro-rata distribution to TAG coin holders"
  - "Build fee collection and distribution workflow"
  - "Test fee scenarios across different tag usage patterns"
  - "Optimize gas costs for fee distribution"
estimated_duration: "1-2 weeks"
technical_requirements:
  - "Fee calculation on tag usage"
  - "Holder registry and proportional distribution"
  - "Automated distribution triggers"
  - "Gas optimization strategies"
```

##### SUB_542.4: Testing & Validation
```yaml
id: #542.4
status: NOT_STARTED
priority: HIGH
completion: 0
dependencies: ["#542.3"]
deliverables:
  - "End-to-end testing of complete incentive loop"
  - "Economic model validation and simulation"
  - "Gas cost analysis and optimization"
  - "Security audit preparation"
  - "Documentation of incentive mechanisms"
estimated_duration: "1 week"
validation_checklist:
  - "All three allocation percentages correct"
  - "Tagger rewards distributed proportionally"
  - "Fee distribution working correctly"
  - "Edge cases handled (zero taggers, zero fees, etc.)"
  - "Gas costs within acceptable range"
```

### EPIC_543: The Graph Subgraph Refactor
```yaml
id: #543
status: NOT_STARTED
priority: HIGH
dependencies: ["#541"]
estimated_effort: 6-8 weeks
objective: "Update The Graph subgraph for TAG Coins architecture and Channel renaming - foundation for GraphQL data API"
architecture_change: "CTAG NFTs → TAG Coins, Relayer → Channel, metadata schema updates"
blocks: ["Explorer UI (#544)", "data-api functionality"]
progress: "0% - Not started"
technical_scope: "Major refactor - schema changes, 50+ relayer references, event handlers, mappings"
```

##### SUB_543.1: Channel Renaming in Subgraph
```yaml
id: #543.1
status: NOT_STARTED
priority: CRITICAL
completion: 0
dependencies: ["#538.8"]
deliverables:
  - "Update all Relayer entity references to Channel in schema"
  - "Rename relayer-related fields, queries, and filters"
  - "Update event handlers for Channel events"
  - "Migrate relayerFactory to channelFactory references"
  - "Update 50+ relayer references across subgraph codebase"
estimated_duration: "2-3 weeks"
technical_scope:
  - "packages/subgraph/schema.graphql: Entity definitions"
  - "packages/subgraph/src/mappings/: Event handlers"
  - "apps/data-api: GraphQL queries and resolvers"
  - "Estimated 50+ files affected"
```

##### SUB_543.2: Schema Updates for TAG Coins
```yaml
id: #543.2
status: NOT_STARTED
priority: CRITICAL
completion: 0
dependencies: ["#543.1"]
deliverables:
  - "Update Tag entity for TAG coin addresses (Zora ERC-20)"
  - "Add TAG coin metadata fields (token address, symbol, supply)"
  - "Update TaggingRecord for coin address array instead of tokenIds"
  - "Add allocation tracking (creator, ETS, relayer percentages)"
  - "Update target enrichment metadata schema"
estimated_duration: "2-3 weeks"
technical_requirements:
  - "Schema migration from CTAG NFT to TAG Coin model"
  - "Zora integration fields"
  - "Incentive allocation tracking"
  - "Backward compatibility considerations"
```

##### SUB_543.3: Subgraph Deployment & Testing
```yaml
id: #543.3
status: NOT_STARTED
priority: HIGH
completion: 0
dependencies: ["#543.2"]
deliverables:
  - "Deploy updated subgraph to The Graph testnet"
  - "Validate event indexing and entity creation"
  - "Test all GraphQL queries with new schema"
  - "Performance testing and optimization"
  - "Deploy to The Graph mainnet"
estimated_duration: "1-2 weeks"
validation_checklist:
  - "All events indexed correctly"
  - "Channel entities created properly"
  - "TAG coin data populated accurately"
  - "Query performance acceptable"
  - "No data loss from migration"
```

##### SUB_543.4: data-api Integration
```yaml
id: #543.4
status: NOT_STARTED
priority: HIGH
completion: 0
dependencies: ["#543.3"]
deliverables:
  - "Update data-api GraphQL resolvers for new schema"
  - "Migrate relayer queries to channel queries"
  - "Update TAG-related endpoints for coin data"
  - "Test API endpoints with updated subgraph"
  - "Update API documentation"
estimated_duration: "1 week"
technical_requirements:
  - "apps/data-api GraphQL resolver updates"
  - "Query migration and testing"
  - "API documentation refresh"
```

### EPIC_544: Explorer UI Refactor
```yaml
id: #544
status: NOT_STARTED
priority: MEDIUM
dependencies: ["#543"]
estimated_effort: 4-6 weeks
objective: "Refactor Explorer UI to focus on TAG Coins with minimal, functional interface"
architecture_change: "CTAG NFT-focused UI → TAG Coin-focused minimal explorer"
blocks: ["Mainnet user interface"]
progress: "0% - Not started"
scope: "Minimal viable explorer - tag browsing, tagging records, basic stats"
```

##### SUB_544.1: TAG Coin Focus Redesign
```yaml
id: #544.1
status: NOT_STARTED
priority: HIGH
completion: 0
dependencies: ["#543"]
deliverables:
  - "Design minimal UI focused on TAG coins (not CTAG NFTs)"
  - "Create TAG coin detail page (token info, holders, usage)"
  - "Update navigation and information architecture"
  - "Remove or deprecate CTAG NFT-specific features"
  - "Mobile-responsive design"
estimated_duration: "2-3 weeks"
design_principles:
  - "Minimal and functional"
  - "TAG coin as primary concept"
  - "Clear information hierarchy"
  - "Fast and lightweight"
```

##### SUB_544.2: Tag Browsing & Discovery
```yaml
id: #544.2
status: NOT_STARTED
priority: HIGH
completion: 0
dependencies: ["#544.1"]
deliverables:
  - "Implement tag search and filtering"
  - "Create tag list view with sorting options"
  - "Add tag statistics (usage count, holders, creation date)"
  - "Build tag detail page with metadata and activity"
  - "Implement pagination and infinite scroll"
estimated_duration: "1-2 weeks"
technical_requirements:
  - "Integration with updated data-api"
  - "Real-time updates from subgraph"
  - "Performance optimization for large lists"
```

##### SUB_544.3: Tagging Records Display
```yaml
id: #544.3
status: NOT_STARTED
priority: MEDIUM
completion: 0
dependencies: ["#544.2"]
deliverables:
  - "Create tagging record list view"
  - "Display target enrichment metadata (title, description, image)"
  - "Show associated TAG coins for each record"
  - "Add filtering by tag, target, or tagger"
  - "Implement record detail view"
estimated_duration: "1-2 weeks"
technical_requirements:
  - "Target metadata display from enrichment data"
  - "TAG coin relationship visualization"
  - "Responsive image handling"
```

##### SUB_544.4: Testing & Polish
```yaml
id: #544.4
status: NOT_STARTED
priority: MEDIUM
completion: 0
dependencies: ["#544.3"]
deliverables:
  - "Cross-browser testing (Chrome, Firefox, Safari, Edge)"
  - "Mobile device testing (iOS, Android)"
  - "Performance optimization and load testing"
  - "Accessibility compliance (WCAG 2.1)"
  - "Bug fixes and polish"
estimated_duration: "1 week"
quality_checklist:
  - "All browsers rendering correctly"
  - "Mobile experience smooth and functional"
  - "Page load times under 2 seconds"
  - "No accessibility violations"
  - "User testing feedback incorporated"
```

### EPIC_545: Marketing Site
```yaml
id: #545
status: NOT_STARTED
priority: LOW
dependencies: ["#541"]
estimated_effort: 2-3 weeks
objective: "Create minimal marketing site explaining 'What is ETS' for mainnet launch"
scope: "Simple, clear explanation of ETS value proposition and TAG coins concept"
blocks: ["Mainnet public communication"]
progress: "0% - Not started"
```

##### SUB_545.1: Content Strategy & Messaging
```yaml
id: #545.1
status: NOT_STARTED
priority: HIGH
completion: 0
dependencies: []
deliverables:
  - "Define core messaging and value proposition"
  - "Write 'What is ETS' explainer content"
  - "Create TAG coins concept explanation"
  - "Develop use case examples"
  - "Draft FAQ content"
estimated_duration: "1 week"
content_sections:
  - "Hero: What is ETS"
  - "How TAG coins work"
  - "Benefits for creators and taggers"
  - "Use cases and examples"
  - "FAQ and getting started"
```

##### SUB_545.2: Minimal Site Implementation
```yaml
id: #545.2
status: NOT_STARTED
priority: HIGH
completion: 0
dependencies: ["#545.1"]
deliverables:
  - "Design clean, minimal single-page site"
  - "Implement responsive layout (mobile-first)"
  - "Create visual diagrams explaining TAG coins"
  - "Add links to Explorer and documentation"
  - "Optimize for performance and SEO"
estimated_duration: "1-2 weeks"
technical_stack:
  - "Next.js static site or simple HTML/CSS"
  - "Minimal dependencies"
  - "Fast loading and mobile-optimized"
  - "SEO meta tags and structured data"
```

##### SUB_545.3: Launch & Validation
```yaml
id: #545.3
status: NOT_STARTED
priority: MEDIUM
completion: 0
dependencies: ["#545.2"]
deliverables:
  - "Deploy to production domain"
  - "SEO validation and search console setup"
  - "Analytics integration (privacy-focused)"
  - "User feedback collection"
  - "Iterative improvements based on feedback"
estimated_duration: "3-5 days"
launch_checklist:
  - "Domain configured and SSL active"
  - "Google Search Console verified"
  - "Analytics tracking working"
  - "All links functional"
  - "Mobile experience validated"
```


## FUTURE_ISSUES
```yaml
queue:
  - id: "CLI Documentation"
    title: "Document CLI usage and publish to npm"
    status: READY
    dependencies: []
    notes: "CLI fully functional, needs documentation and publishing"

  - id: "End-to-End Integration Testing"
    title: "Test complete pipeline: ETS tag creation → Temporal → Zora coin"
    status: BLOCKED
    dependencies: ["#538", "#536"]

  - id: #532
    title: "Implement secure EOA management for Zora coin creation"
    status: NOT_STARTED
    dependencies: ["#538", "#536"]
    notes: "CLI provides testing interface for EOA management"

  - id: #533
    title: "Build creator allocation and distribution system"
    status: NOT_STARTED
    dependencies: ["#532"]

future_features:
  - title: "Configurable Smart Wallet Relayers"
    scope: ["Plugin architecture", "Custom fees", "Rate limiting"]

  - title: "ENS Subdomain Integration"
    scope: ["myrelayer.ets.eth subdomains", "ENS in RelayerFactory"]

  - title: "Wagmi CLI Ignition Integration"
    scope: ["Create Wagmi plugin for Hardhat Ignition deployments", "Generate typed contract functions from Ignition artifacts", "Unify deployment export strategy"]
    context: "Currently using dual approach: Wagmi reads hardhat-deploy format, CLI reads Ignition directly"
    impact: "Would eliminate need for generate-ignition-exports.ts workaround and provide typed functions for all packages"
    technical_debt: true
```

## TECHNICAL_DECISIONS
```yaml
decisions:
  - date: 2025-09-15
    decision: "CLI authentication strategy - private key only"
    rationale: "Removed mnemonic support for security and simplicity"
    impact: "Uses Hardhat's default test accounts for consistency"
    implementation: "CLI configured with account[6] private key for local development"

  - date: 2025-09-13
    decision: "Dual deployment export strategy"
    rationale: "Wagmi CLI doesn't support Ignition; created parallel exports for CLI while maintaining wagmi for existing packages"
    workaround: "generate-ignition-exports.ts bridges gap for CLI usage"
    future_solution: "Create Wagmi plugin for Ignition or migrate to unified deployment format"

  - date: 2025-08-13
    decision: "Address-based architecture over tokenIds"
    rationale: "Cleaner, more intuitive"

  - date: 2025-08-15
    decision: "Deterministic Zora integration"
    rationale: "Eliminated predict→create→update pattern"

  - date: 2025-08-19
    decision: "MockZoraFactory deployment ordering"
    rationale: "Deploy-time configuration over post-deployment updates"

  - date: 2025-08-22
    decision: "TypeScript Node16 module resolution"
    rationale: "Required for workspace package imports"
```

## COMMIT_LOG
```yaml
recent_commits:
  - hash: b4a91b7a
    message: "feat(cli): Complete ETS CLI implementation with all management commands"
    date: 2025-09-15
    impact: "Full CLI tool for contract management - relayers, roles, tags, targets, testdata"
  - hash: d36214f7
    message: "Add test-driven MVP framework for TAG Coins integration"
  - hash: fac188b4
    message: "COMPLETE: Event Processor logging infrastructure + OpenZeppelin dependency fixes"
  - hash: 82890f67
    message: "WIP: Event Processor integration debugging - 95% complete"
  - hash: 49869e7f
    message: "WIP: Integration test refactoring session - viem migration + workspace deps"
  - hash: 5133945a
    message: "COMPLETE: Hardhat tasks refactoring for Zora tag coin integration"
```

## QUICK_REFERENCE
```yaml
key_files:
  cli_main: packages/ets-cli/src/index.ts
  cli_relayer: packages/ets-cli/src/commands/relayer.ts
  cli_tags: packages/ets-cli/src/commands/tags.ts
  cli_targets: packages/ets-cli/src/commands/targets.ts
  cli_testdata: packages/ets-cli/src/commands/testdata.ts
  event_processor_handler: apps/event-processor/src/handlers/targetEnrichmentHandler.ts
  integration_test: test/integration/target-enrichment-v2.test.ts
  mock_zora_factory: packages/contracts/contracts/mocks/MockZoraFactory.sol
  ets_token: packages/contracts/contracts/ETSToken.sol
  local_stack_script: scripts/start-local-stack.sh
  
key_values:
  local_chain_id: 31337
  sepolia_chain_id: 11155111
  base_chain_id: 8453
  target_id_example: "0x69a5fe4fa2fa74049994ec57811568d00cd5b677d8fb85360c47dd01b27ad324"
```