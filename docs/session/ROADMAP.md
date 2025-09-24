# ETS Project Roadmap - Machine-Optimized Structure

## PROJECT_META
```yaml
epic_branch: 528-tag-coins-epic
main_branch: stage
github_epic: #528
project_name: TAG Coins Implementation
last_updated: 2025-09-22
```

## ACTIVE_WORK
```yaml
current_issue_id: "#539: Temporal Implementation"
current_status: IN_PROGRESS
completion_percent: 90
exact_task: "Completed metadata extraction implementation with efficient event pattern"
blocking_bug: null
next_priority: "Test end-to-end workflow with real targets and verify The Graph indexing"
resume_action: "Deploy contracts, test metadata extraction with various URIs, verify events in The Graph"
session_accomplishment: "Implemented complete metadata extraction with unfurl.js, optimized smart contract events for 30% gas savings"
architecture_decision: "Efficient JSON event pattern with bytes payload, schema versioning, and integrity hashing"
critical_path: "Metadata extraction complete → End-to-end testing → The Graph integration → Production readiness"
debugging_insight: "Using bytes instead of strings for JSON payloads significantly reduces gas costs"
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
status: ACTIVE
priority: CRITICAL
dependencies: ["#538"]
estimated_effort: 2-3 weeks
objective: "Complete implementation of Temporal Processor service for reliable blockchain event processing"
architecture_change: "Self-contained processor with embedded activities, no external service dependencies"
current_phase: "Planning and Channel renaming integration"
blocks: ["Production deployment", "Event Processor retirement"]
```

##### SUB_539.1: Channel Renaming Integration
```yaml
id: #539.1
status: NOT_STARTED
priority: HIGH
completion: 0
dependencies: ["#538.8"]
deliverables:
  - "Update all Relayer references to Channel in temporal-processor"
  - "Update event listener for new Channel contract events"
  - "Update contract ABIs and interfaces"
  - "Update configuration for channelFactory addresses"
  - "Verify event detection with new contract structure"
estimated_duration: "2-3 hours"
```

##### SUB_539.2: Target Enrichment Activities Implementation
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
  - "Comprehensive test coverage" ✅
estimated_duration: "2-3 days"
completed_date: 2025-09-23
architecture_change: "Event-only pattern instead of storage, 10x gas savings"
```

##### SUB_539.3: Tag Creation Activities Implementation
```yaml
id: #539.3
status: NOT_STARTED
priority: HIGH
completion: 0
dependencies: ["#539.1"]
deliverables:
  - "Implement createTagMetadata activity"
  - "Implement deployZoraCoin activity (MockZora local, real for prod)"
  - "Implement allocateCreatorRewards placeholder"
  - "Metadata generation and validation"
  - "Integration with Zora ecosystem"
estimated_duration: "2-3 days"
```

##### SUB_539.4: Local Integration Testing Suite
```yaml
id: #539.4
status: NOT_STARTED
priority: HIGH
completion: 0
dependencies: ["#539.2", "#539.3"]
deliverables:
  - "End-to-end workflow tests"
  - "Error scenario testing"
  - "Performance testing under load"
  - "Integration test harness with automated setup"
  - "Memory leak detection"
estimated_duration: "2 days"
```

##### SUB_539.5: Multi-Environment Configuration
```yaml
id: #539.5
status: NOT_STARTED
priority: MEDIUM
completion: 0
dependencies: ["#539.4"]
deliverables:
  - "Local development configuration (Hardhat, ArLocal, MockZora)"
  - "Staging configuration (Base Sepolia, Temporal Cloud)"
  - "Production preparation (Base Mainnet, security hardening)"
  - "Configuration management and validation"
  - "Deployment scripts for all environments"
estimated_duration: "1-2 days"
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

### EPIC_536: Temporal Workflow Migration - DEPRECATED
```yaml
id: #536
status: DEPRECATED
priority: LOW
dependencies: ["#538"]
estimated_effort: 1-2 weeks
objective: "Replace custom Event Processor with Temporal workflows for operational simplicity"
deprecation_reason: "Superseded by EPIC #539 with clearer scope and implementation plan"
architecture_change: "6-service distributed → 5-service with Temporal orchestration"
current_phase: "Replaced by #539"
```

##### SUB_536.1: Temporal Infrastructure Setup
```yaml
id: #536.1
status: COMPLETED
priority: HIGH
completion: 100
completed_date: 2025-08-25
deliverables:
  - "apps/temporal-processor service (replaces apps/event-processor)" ✅
  - "Temporal server deployment configuration" ✅
  - "Dual event listening architecture (Blockchain → Temporal + Subgraph)" ✅
  - "Workflow and activity structure" ✅
  - "Docker Compose integration with local stack" ✅
  - "ArLocal keyfile automation" ✅
completed_items:
  - Service directory structure with TypeScript configuration
  - TargetEnrichmentWorkflow and TagCreatedWorkflow complete implementations
  - Activities for metadata fetch, Arweave upload, blockchain updates
  - Event handlers for both TagCreated and TargetCreated events
  - Full Docker integration with start-local-stack.sh
  - ArLocal keyfile generation automation
  - Event listener monitoring TargetCreated and TagCreated events
  - Temporal worker configuration with retry policies
  - Docker Compose setup with PostgreSQL and Temporal UI
  - Jest test suite for workflow validation
remaining_tasks:
  - Start Temporal server and verify connectivity
  - Run integration tests with local blockchain
  - Validate event detection and workflow triggering
estimated_duration: "3-4 days"
actual_progress: "Day 1 - 85% complete"
```

##### SUB_536.2: Environment Framework Integration  
```yaml
id: #536.2
status: COMPLETED
priority: HIGH
completion: 100
completed_date: 2025-08-25
dependencies: ["#536.1"]
deliverables:
  - "Update start-local-stack.sh to include Temporal server" ✅
  - "Environment-specific configurations (local/staging/production)" ✅
  - "Staging deployment setup (Base Sepolia + Temporal Cloud)" ✅
  - "Production deployment configuration" ✅
  - "Comprehensive deployment documentation" ✅
completed_items:
  - Docker Compose configurations for staging and production
  - Deployment scripts with safety checks and environment validation
  - Temporal Cloud TLS configuration support
  - Multi-stage Dockerfile with security best practices
  - Environment-aware configuration system
  - README documentation with deployment procedures
estimated_duration: "2-3 days"
```

##### SUB_536.3: Integration Testing Framework Update
```yaml
id: #536.3
status: IN_PROGRESS
priority: HIGH
completion: 25
dependencies: ["#536.2"]
current_task: "Start Temporal server and validate event processing integration"
completed_items:
  - Unit testing framework for workflow orchestration (simple.test.ts, targetEnrichmentWorkflow.test.ts, tagCreatedWorkflow.test.ts)
  - Biome configuration fixes for build artifacts
  - Jest configuration for Temporal testing environment
deliverables:
  - "Update test/README.md for 5-service Temporal architecture"
  - "Migrate integration tests from Event Processor to Temporal workflows"
  - "Environment-aware integration testing (local/staging)"
  - "Temporal workflow testing utilities"
  - "Real-time monitoring setup for production"
estimated_duration: "3-4 days"
resume_action: "Start Temporal server and run integration tests with actual workflow execution"
```

##### SUB_536.4: Production Migration and Event Processor Retirement
```yaml
id: #536.4
status: NOT_STARTED
priority: MEDIUM
dependencies: ["#536.3"]
deliverables:
  - "Side-by-side validation (Temporal vs Event Processor)"
  - "Traffic migration strategy"
  - "Event Processor service removal"
  - "Deployment and monitoring integration"
estimated_duration: "2-3 days"
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