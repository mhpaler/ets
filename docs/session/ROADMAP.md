# ETS Project Roadmap - Machine-Optimized Structure

## PROJECT_META
```yaml
epic_branch: 528-tag-coins-epic
main_branch: stage
github_epic: #528
project_name: TAG Coins Implementation
last_updated: 2025-08-23
```

## ACTIVE_WORK
```yaml
current_issue_id: #537.1  
current_status: COMPLETED
completion_percent: 100
exact_task: "Gelato Web3 Functions infrastructure setup complete with working target-enrichment function"
next_priority: "#537.2 - Implement event-driven TagCreated and TargetCreated handlers"
resume_action: "Implement actual event processing logic in target-enrichment and tag-created functions"
transition_note: "Successfully migrated from Temporal to Gelato - Deno v1.36.0 compatibility resolved"
architecture_decision: "Gelato Web3 Functions deployed at @apps/gelato with SDK v2.3.0"
key_resolution: "Fixed 'global is not defined' error by downgrading deno-bin from v2.2.7 to v1.36.0 to match SDK requirements"
```

## CRITICAL_PATH
```yaml
priority_chain:
  - id: #537
    blocks: ["#532", "#533"]
    reason: "Gelato Web3 Functions migration must complete before EOA management and creator allocations"
    estimated_duration: "1-2 weeks"
    
  - id: #532
    blocks: ["#533"]
    reason: "Secure EOA management required for creator allocations"
    estimated_duration: "1 week"

current_bottleneck: #537.2
next_unblocked: ["#537.2", "#537.3"]  # Can implement both event handlers in parallel
estimated_path_duration: "1-2 weeks remaining"
architecture_change: "Gelato Web3 Functions infrastructure complete - ready for event handler implementation"
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

### EPIC_537: Gelato Web3 Functions Migration  
```yaml
id: #537
status: ACTIVE
priority: HIGH
dependencies: ["#529.5"]
estimated_effort: 1-2 weeks
objective: "Replace custom Event Processor with Gelato Web3 Functions for zero-infrastructure serverless event processing"
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

### EPIC_536: Temporal Workflow Migration - DEPRECATED
```yaml
id: #536
status: ABANDONED
priority: DEPRECATED
dependencies: ["#529.5"]
estimated_effort: 2-3 weeks
objective: "Replace custom Event Processor with Temporal workflows for operational simplicity"
abandonment_reason: "95% complete but operational complexity (Docker, gRPC, server maintenance) too high"
pivot_to: "#537 - Gelato Web3 Functions Migration"
lessons_learned: "Event detection patterns and workflow logic transfer to Gelato implementation"
architecture_change: "6-service distributed → 5-service with Temporal orchestration"
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
status: NOT_STARTED
priority: HIGH
dependencies: ["#536.2"]
deliverables:
  - "Update test/README.md for 5-service Temporal architecture"
  - "Migrate integration tests from Event Processor to Temporal workflows"
  - "Environment-aware integration testing (local/staging)"
  - "Temporal workflow testing utilities"
  - "Real-time monitoring setup for production"
estimated_duration: "3-4 days"
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
  - id: #532
    title: "Implement secure EOA management for Zora coin creation"
    status: NOT_STARTED
    
  - id: #533
    title: "Build creator allocation and distribution system"
    status: NOT_STARTED

future_features:
  - title: "Configurable Smart Wallet Relayers"
    scope: ["Plugin architecture", "Custom fees", "Rate limiting"]
    
  - title: "ENS Subdomain Integration"
    scope: ["myrelayer.ets.eth subdomains", "ENS in RelayerFactory"]
```

## TECHNICAL_DECISIONS
```yaml
decisions:
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