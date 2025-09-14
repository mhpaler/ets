# ETS Project Roadmap - Machine-Optimized Structure

## PROJECT_META
```yaml
epic_branch: 528-tag-coins-epic
main_branch: stage
github_epic: #528
project_name: TAG Coins Implementation
last_updated: 2025-09-01
```

## ACTIVE_WORK
```yaml
current_issue_id: "CLI Implementation for ETS Management"
current_status: IN_PROGRESS
completion_percent: 60
exact_task: "Implementing and testing CLI commands for ETS contract management"
blocking_bug: null
next_priority: "Complete remaining CLI commands (roles check/list, tags create/apply/info)"
resume_action: "Implement role commands starting with 'ets roles check' to display user's roles"
session_accomplishment: "Fixed ABI imports, added ETSRelayerABI export, successfully tested relayer add/info commands"
architecture_decision: "Dual deployment export strategy: Wagmi for existing packages, custom Ignition exports for CLI"
critical_path: "CLI relayer commands working ✅ - need roles and tags commands"
debugging_insight: "Must use funded account (PRIVATE_KEY env var) for contract interactions"
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

current_bottleneck: #538.4
next_unblocked: ["#538.4"]  # Must complete sequentially: Infrastructure ✅ → Viem ✅ → HD Wallet → Naming → TypeScript → Validation
estimated_path_duration: "1-2 weeks for contracts, then 1-2 weeks for integration"
architecture_change: "HD wallet foundation enabling secure multi-role operations across entire stack"
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
status: NOT_STARTED
parent_epic: #528
priority: CRITICAL
blocks: ["#536", "end-to-end testing", "staging deployment", "production deployment"]
estimated_effort: "1-2 weeks"
objective: "Modernize contracts package with HD wallet architecture and viem integration"
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
status: ACTIVE
priority: CRITICAL
dependencies: []
estimated_effort: 1-2 weeks
objective: "Modernize contracts package foundation with HD wallet architecture, Hardhat 3.0, and viem integration"
blocks: ["All integration testing", "Staging deployment", "Production deployment"]
architecture_change: "Legacy single-key + ethers → HD wallet multi-role + viem foundation"
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
status: NOT_STARTED
priority: HIGH
completion: 0
dependencies: ["#538.3"]
deliverables:
  - "Update deploy/utils/setup.js → setup.ts with HD wallet derivation"
  - "Refactor test suite setup to use mnemonic-based accounts"
  - "Update hardhat.config.ts for HD wallet account configuration"
  - "Create environment-specific account derivation utilities"
  - "Validate all role-based operations work correctly"
estimated_duration: "2-3 days"
```

##### SUB_538.5: Oracle → EventProcessor Renaming
```yaml
id: #538.5
status: NOT_STARTED
priority: MEDIUM
completion: 0
dependencies: ["#538.4"]
deliverables:
  - "Rename all contract references from Oracle to EventProcessor"
  - "Update deployment scripts with new naming convention"
  - "Update test files to use EventProcessor terminology"
  - "Update contract interfaces and events as needed"
  - "Ensure no breaking changes to external integrations"
estimated_duration: "2-3 days"
```

##### SUB_538.6: TypeScript Deployment Migration
```yaml
id: #538.6
status: NOT_STARTED
priority: MEDIUM
completion: 0
dependencies: ["#538.5"]
deliverables:
  - "Convert deploy/utils/setup.js to TypeScript"
  - "Convert all deployment scripts to TypeScript"
  - "Add proper typing for all deployment functions"
  - "Integrate with hardhat-deploy TypeScript patterns"
  - "Validate deployment process across all environments"
estimated_duration: "2-3 days"
```

##### SUB_538.7: Integration Validation
```yaml
id: #538.7
status: NOT_STARTED
priority: HIGH
completion: 0
dependencies: ["#538.6"]
deliverables:
  - "Full test suite passes with all changes"
  - "Local deployment works with new HD wallet structure"
  - "Validate integration with downstream services"
  - "Performance testing to ensure no regressions"
  - "Documentation updates for new patterns"
estimated_duration: "1-2 days"
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

### EPIC_536: Temporal Workflow Migration - BLOCKED
```yaml
id: #536
status: BLOCKED
priority: HIGH
dependencies: ["#538"]
estimated_effort: 1-2 weeks
objective: "Replace custom Event Processor with Temporal workflows for operational simplicity"
blocking_reason: "Requires HD wallet-compatible contracts foundation"
architecture_change: "6-service distributed → 5-service with Temporal orchestration"
current_phase: "Waiting for contracts refactoring completion"
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
  - id: "End-to-End Integration Testing"
    title: "Test complete pipeline: ETS tag creation → Temporal → Zora coin"
    status: BLOCKED
    dependencies: ["#538", "#536"]
    
  - id: #532
    title: "Implement secure EOA management for Zora coin creation"
    status: NOT_STARTED
    dependencies: ["#538", "#536"]
    
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