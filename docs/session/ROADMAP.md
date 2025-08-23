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
current_issue_id: #536
current_status: PLANNED
completion_percent: 0
exact_task: "Temporal Workflow Migration Epic - Architecture discussion completed"
next_priority: "#536.1 - Temporal Infrastructure Setup"
resume_action: "Begin Temporal infrastructure setup: create apps/temporal-processor service structure"
transition_note: "EPIC #536 created with 4 sub-issues, replacing Event Processor with Temporal workflows"
architectural_decision: "Dual event listening: Blockchain → Temporal (workflows) + Subgraph (indexing)"
```

## CRITICAL_PATH
```yaml
priority_chain:
  - id: #536
    blocks: ["#532", "#533"]
    reason: "Temporal migration must complete before EOA management and creator allocations"
    estimated_duration: "2-3 weeks"
    
  - id: #532
    blocks: ["#533"]
    reason: "Secure EOA management required for creator allocations"
    estimated_duration: "1 week"

current_bottleneck: #536
next_unblocked: ["#536.1"]  # Temporal setup can begin immediately
estimated_path_duration: "3-4 weeks total"
architecture_change: "Event Processor → Temporal Workflows (operational simplification)"
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
  - date: 2025-08-23
    decision: "Temporal Workflow Migration (EPIC #536)"
    impact:
      - "Replace Event Processor with Temporal workflows"
      - "Eliminate custom orchestration and retry logic" 
      - "Reduce 6-service distributed system to 5-service with built-in reliability"
      - "Save weeks of custom reliability engineering"
    rationale: "Pre-MVP status optimal for major architecture change"
    implementation: "apps/temporal-processor (replaces apps/event-processor)"
    
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

### EPIC_536: Temporal Workflow Migration
```yaml
id: #536
status: PLANNED
priority: HIGH
dependencies: ["#529.5"]
estimated_effort: 2-3 weeks
objective: "Replace custom Event Processor with Temporal workflows for operational simplicity"
benefits:
  - "Built-in retry/recovery (eliminate custom orchestration)"
  - "Visual workflow monitoring (eliminate custom dashboards)"
  - "Automatic state management (eliminate manual coordination)"
  - "Standard deployment patterns (reduce operational overhead)"
architecture_change: "6-service distributed → 5-service with Temporal orchestration"
```

##### SUB_536.1: Temporal Infrastructure Setup
```yaml
id: #536.1
status: NOT_STARTED
priority: HIGH
deliverables:
  - "apps/temporal-processor service (replaces apps/event-processor)"
  - "Temporal server deployment configuration"
  - "Dual event listening architecture (Blockchain → Temporal + Subgraph)"
  - "Workflow and activity structure"
estimated_duration: "3-4 days"
```

##### SUB_536.2: Target Enrichment Workflow Migration
```yaml
id: #536.2
status: NOT_STARTED
priority: HIGH
dependencies: ["#536.1"]
deliverables:
  - "TargetCreated event → Temporal workflow"
  - "Activities: fetchMetadata, storeOnArweave, updateBlockchain"
  - "Built-in retry policies (replace custom error handling)"
  - "Workflow state visualization"
estimated_duration: "4-5 days"
```

##### SUB_536.3: TAG Coin Creation Workflow Migration
```yaml
id: #536.3
status: NOT_STARTED
priority: HIGH
dependencies: ["#536.2"]
deliverables:
  - "TagCreated event → Temporal workflow"
  - "Activities: createCoinMetadata, deployCoinOnZora, allocateRewards"
  - "Parallel execution optimization"
  - "Creator allocation workflow"
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