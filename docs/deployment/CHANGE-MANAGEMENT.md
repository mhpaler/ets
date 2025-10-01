# ETS Change Management & Deployment Lifecycle

## Overview

This document outlines the change management process and deployment lifecycle for the ETS platform, ensuring safe progression from local development through staging to production.

## Deployment Environments

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  Local   │────▶│  Local   │────▶│  Cloud   │────▶│  Cloud   │
│  Dev     │     │ Staging  │     │ Staging  │     │  Prod    │
└──────────┘     └──────────┘     └──────────┘     └──────────┘
  Hardhat         Base Sepolia    Base Sepolia      Base Mainnet
  (31337)          (84532)          (84532)           (8453)
```

## Environment Configuration

### 1. Local Development

**Purpose**: Rapid iteration and initial testing

| Component | Configuration |
|-----------|--------------|
| Blockchain | Hardhat localhost (31337) |
| Temporal Server | Local Docker |
| Temporal Queue | `ets-workflows` |
| Event Processing | Local machine |
| Contracts | MockZoraFactory |

### 2. Local Staging

**Purpose**: Debug staging blockchain with local control

| Component | Configuration |
|-----------|--------------|
| Blockchain | Base Sepolia (84532) |
| Temporal Server | Local Docker |
| Temporal Queue | `ets-workflows-local-staging` |
| Event Processing | Local machine |
| Contracts | Real Zora Factory |

### 3. Cloud Staging

**Purpose**: Validate cloud deployment before production

| Component | Configuration |
|-----------|--------------|
| Blockchain | Base Sepolia (84532) |
| Temporal Server | Temporal Cloud |
| Temporal Queue | `ets-workflows-cloud-staging` |
| Event Processing | Cloud infrastructure |
| Contracts | Real Zora Factory |

### 4. Production

**Purpose**: Live system serving users

| Component | Configuration |
|-----------|--------------|
| Blockchain | Base Mainnet (8453) |
| Temporal Server | Temporal Cloud |
| Temporal Queue | `ets-workflows-prod` |
| Event Processing | Cloud infrastructure |
| Contracts | Real Zora Factory |

## Change Workflow

### Phase 1: Local Development

```bash
# 1. Make code changes
cd packages/contracts  # or apps/temporal-processor

# 2. Test locally
./scripts/start-local-stack.sh

# 3. Run tests
pnpm test

# 4. Create test transactions
pnpm ets tags create "#test" --network localhost
```

### Phase 2: Local Staging Testing

```bash
# 1. Switch to Base Sepolia configuration
cd apps/temporal-processor
cp .env.local-staging .env

# 2. Start local processor for Base Sepolia
pnpm dev

# 3. Test against real blockchain
pnpm ets tags create "#staging-test" --network baseSepolia

# 4. Debug and iterate with hot-reload
# Make changes, save, automatic restart
```

### Phase 3: Cloud Staging Validation

```bash
# 1. Stop local processor
# Ctrl+C in temporal-processor

# 2. Deploy to cloud (e.g., Railway)
railway up  # or your deployment method

# 3. Switch to cloud task queue
# Cloud uses: ets-workflows-cloud-staging

# 4. Validate cloud processing
pnpm ets tags create "#cloud-test" --network baseSepolia

# 5. Monitor cloud logs
railway logs  # or cloud provider logs
```

### Phase 4: Production Deployment

```bash
# 1. Tag release
git tag v1.0.0
git push origin v1.0.0

# 2. Deploy contracts to Base Mainnet
cd packages/contracts
pnpm hardhat ignition deploy --network base

# 3. Deploy Temporal Processor to production
# Update with production configuration
# Deploy to production infrastructure

# 4. Monitor initial transactions
```

## Task Queue Management

### Switching Processing Location

The task queue strategy allows seamless switching between local and cloud processing:

**Enable Local Processing:**
```bash
# Start local processor with local queue
TEMPORAL_TASK_QUEUE=ets-workflows-local-staging pnpm dev
# All events → local machine
```

**Enable Cloud Processing:**
```bash
# Stop local processor
# Cloud worker with cloud queue takes over
TEMPORAL_TASK_QUEUE=ets-workflows-cloud-staging
# All events → cloud
```

### Queue Naming Convention

```
ets-workflows-{location}-{environment}

Examples:
- ets-workflows                    # Local dev
- ets-workflows-local-staging      # Local machine, staging chain
- ets-workflows-cloud-staging      # Cloud, staging chain
- ets-workflows-prod              # Production
```

## Version Control Strategy

### Branch Structure

```
main
├── stage                     # Staging environment
├── 528-tag-coins-epic       # Feature development
└── hotfix/issue-123         # Emergency fixes
```

### Deployment Flow

1. **Feature Development**: Work on feature branch
2. **Staging**: Merge to `stage` branch
3. **Production**: Merge `stage` to `main`
4. **Hotfixes**: Branch from `main`, deploy, backport to `stage`

## Configuration Management

### Environment Files

Each environment has its own configuration:

```
.env.local           # Local development
.env.local-staging   # Local with Base Sepolia
.env.cloud-staging   # Cloud with Base Sepolia
.env.production      # Production (never commit)
```

### Secret Management

**Development/Staging:**
- `.env` files for configuration
- Test mnemonics acceptable

**Production:**
- AWS Secrets Manager / HashiCorp Vault
- Never commit production keys
- Rotate keys regularly
- Use separate keys per service

## Rollback Procedures

### Smart Contract Rollback

Smart contracts are immutable, but we can:
1. Deploy new implementation (upgradeable contracts)
2. Point proxy to previous implementation
3. Use circuit breaker pattern for emergency stops

### Temporal Processor Rollback

```bash
# 1. Stop current version
railway down  # or cloud provider command

# 2. Deploy previous version
git checkout v1.0.0
railway up

# 3. Processor resumes from checkpoint
# No events lost due to checkpoint system
```

## Monitoring & Alerts

### Key Metrics to Monitor

1. **Blockchain Events**
   - TAG creation rate
   - Failed transactions
   - Gas usage

2. **Temporal Workflows**
   - Workflow success rate
   - Processing latency
   - Queue depth

3. **System Health**
   - Memory usage
   - CPU utilization
   - Error rates

### Alert Thresholds

- Workflow failure rate > 5%
- Processing latency > 30 seconds
- Queue depth > 1000
- Memory usage > 80%

## Testing Requirements

### Before Each Deployment

1. **Unit Tests**: `pnpm test`
2. **Integration Tests**: `pnpm test:integration`
3. **E2E Tests**: Full flow validation
4. **Gas Estimation**: Ensure reasonable costs
5. **Load Testing**: For production deployments

### Staging Validation Checklist

- [ ] Contracts deployed successfully
- [ ] Roles and permissions configured
- [ ] TAG creation working
- [ ] Target enrichment working
- [ ] Metadata properly stored/retrieved
- [ ] Gas costs acceptable
- [ ] Error handling working
- [ ] Monitoring/logs accessible

## Emergency Procedures

### Incident Response

1. **Detection**: Monitoring alert triggered
2. **Assessment**: Determine scope and impact
3. **Communication**: Notify team and users if needed
4. **Mitigation**: Apply fix or rollback
5. **Resolution**: Verify system stability
6. **Post-mortem**: Document and improve

### Emergency Contacts

- On-call engineer: (rotation schedule)
- Blockchain team: (contact)
- Infrastructure team: (contact)
- Temporal Cloud support: (ticket system)

## Change Log

Document all production changes:

```markdown
## 2025-10-01 - v1.0.0
- Deployed TAG creation workflow to Base Mainnet
- Enabled Temporal Cloud processing
- Updated gas optimization

## 2025-09-15 - v0.9.0
- Base Sepolia staging deployment
- Added checkpoint system
- Fixed event processing race condition
```

## Approval Process

### Staging Deployments
- Developer can self-deploy
- Notify team in Slack/Discord
- Document changes in CHANGELOG

### Production Deployments
- Requires code review
- Staging validation complete
- Team approval (2 members)
- Scheduled maintenance window
- Rollback plan prepared

## Best Practices

1. **Always test in sequence**: Local → Local Staging → Cloud Staging → Production
2. **Never skip environments** unless hotfix emergency
3. **Document all changes** in CHANGELOG and commits
4. **Monitor after deployment** for at least 1 hour
5. **Keep configurations synchronized** across environments
6. **Use task queues** for controlled processing location
7. **Maintain rollback capability** at each stage
8. **Automate where possible** but maintain manual override