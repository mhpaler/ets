# Operational Runbook - Temporal Processor (Fly.io)

Quick-reference guide for common operations, debugging, and emergency procedures.

---

## Table of Contents

1. [Daily Operations](#daily-operations)
2. [Monitoring](#monitoring)
3. [Debugging](#debugging)
4. [Emergency Procedures](#emergency-procedures)
5. [Maintenance](#maintenance)
6. [Useful Commands](#useful-commands)

---

## Daily Operations

### Check System Health

```bash
# Quick health check (run daily)
flyctl status                    # App status
flyctl logs --recent 100         # Recent logs
flyctl scale show                # Resource usage

# Expected:
# Status: running
# Health: all instances healthy
# No error logs in recent 100 lines
```

### View Processing Stats

```bash
# Check how many events processed today
flyctl logs | grep "event processed" | wc -l

# Check checkpoint (last processed block)
flyctl ssh console -C "cat /app/.checkpoint/staging-checkpoint.json"

# Check Temporal Cloud UI
# → cloud.temporal.io → ets-staging → Workflows
# → Look for successful workflow executions
```

### Restart Application

```bash
# Graceful restart (recommended)
flyctl apps restart ets-temporal-processor-staging

# Hard restart (if app is hung)
flyctl machine restart $(flyctl machine list --json | jq -r '.[0].id')

# Watch restart
flyctl logs
```

---

## Monitoring

### Real-Time Logs

```bash
# Follow logs in real-time
flyctl logs

# Filter for errors only
flyctl logs | grep -i "error\|fail\|exception"

# Filter for specific event types
flyctl logs | grep "TargetCreated"
flyctl logs | grep "TagCreated"

# Search last 1000 lines for pattern
flyctl logs --recent 1000 | grep "checkpoint"
```

### Resource Usage

```bash
# View metrics
flyctl metrics

# Check memory usage
flyctl ssh console -C "free -h"

# Check disk usage (checkpoint volume)
flyctl ssh console -C "df -h | grep checkpoint"

# Expected:
# /dev/vdc  1.0G  10M  990M  1%  /app/.checkpoint
```

### Temporal Cloud Monitoring

**Worker Health:**
1. Visit: https://cloud.temporal.io
2. Navigate to namespace: `ets-staging`
3. Go to "Workers" tab
4. Verify:
   - Worker ID: `ets-worker-staging-*`
   - Status: **Online** (green)
   - Last heartbeat: < 30s ago

**Workflow Activity:**
1. Go to "Workflows" tab
2. Filter: Task Queue = `ets-workflows-cloud-staging`
3. Check:
   - Recent workflow executions
   - Success rate should be >95%
   - Failed workflows should be retrying

---

## Debugging

### Application Won't Start

**Check logs for startup errors:**
```bash
flyctl logs | grep -A 10 "Starting Temporal Processor"
```

**Common issues:**

1. **Missing secrets:**
```bash
# List all secrets
flyctl secrets list

# Required secrets:
# - TEMPORAL_SERVER_URL
# - TEMPORAL_API_KEY (if using API key auth - recommended)
#   OR
# - TEMPORAL_CLIENT_CERT and TEMPORAL_CLIENT_KEY (if using mTLS)
# - BASE_SEPOLIA_RPC_URL
# - HD_WALLET_MNEMONIC

# Set missing secret
flyctl secrets set SECRET_NAME="value"
```

2. **Authentication issues:**
```bash
# For API Key authentication (recommended):
# Regenerate API key in Temporal Cloud if invalid
flyctl secrets set TEMPORAL_API_KEY="new-api-key-from-temporal-cloud"

# For mTLS certificate authentication:
# Re-encode and update certificates
cat client.pem | base64 > client.pem.b64
flyctl secrets set TEMPORAL_CLIENT_CERT="$(cat client.pem.b64)"

# Restart
flyctl apps restart
```

3. **Contract configuration errors:**
```bash
# Check config loading
flyctl ssh console

# In SSH session:
node -e "
const { ETSConfig } = require('/app/packages/config/dist/index.js');
const config = ETSConfig.getInstance();
console.log('Environment:', config.getEnvironment());
console.log('Network:', config.getNetwork());
"

# Should show staging/Base Sepolia
exit
```

### Events Not Being Processed

**Check event listener logs:**
```bash
# Look for "Watching for new events"
flyctl logs | grep -i "watching\|polling\|backfill"

# Check for RPC errors
flyctl logs | grep -i "rpc\|alchemy"

# Test Alchemy RPC manually
curl -X POST https://base-sepolia.g.alchemy.com/v2/YOUR_KEY \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
```

**Check Temporal connection:**
```bash
# Look for worker registration logs
flyctl logs | grep -i "worker.*start\|connection"

# Should see:
# "Worker configuration" {...}
# "Temporal worker started successfully"
```

### Checkpoint Not Persisting

**Verify volume is mounted:**
```bash
flyctl volumes list

# Should show volume attached to current machine
# If not attached:
flyctl apps restart
```

**Check checkpoint file:**
```bash
flyctl ssh console

ls -la /app/.checkpoint/
cat /app/.checkpoint/staging-checkpoint.json

# Should show:
# {
#   "lastProcessedBlock": "...",
#   "lastUpdated": "...",
#   "recentEventIds": [...]
# }

# Check file permissions
# Owner should be 'temporal' (user 1001)
exit
```

### High Memory Usage

**Check current usage:**
```bash
flyctl ssh console -C "free -h"

# If using >80% of allocated memory:
# 1. Check for memory leaks in logs
flyctl logs | grep -i "memory\|heap"

# 2. Increase memory allocation
flyctl scale memory 1024  # 512MB → 1GB

# 3. Redeploy
flyctl deploy
```

### Workflow Failures in Temporal Cloud

**View failed workflows:**
1. Go to cloud.temporal.io → ets-staging
2. Click "Workflows" tab
3. Filter: Status = "Failed"
4. Click on failed workflow
5. Check "Event History" for error details

**Common workflow failures:**

- **Transaction nonce conflicts**: Reduce `maxConcurrentActivityTaskExecutions` in worker.ts
- **RPC rate limits**: Increase delay between requests or upgrade Alchemy plan
- **Wallet insufficient funds**: Add ETH to event processor wallet

**Retry failed workflow manually:**
```bash
# Get workflow ID from Temporal Cloud UI
# Then retry via Temporal CLI:
temporal workflow reset \
  --namespace ets-staging \
  --workflow-id WORKFLOW_ID \
  --reason "Manual retry after fixing issue"
```

---

## Emergency Procedures

### Application is Down

**Immediate actions:**

```bash
# 1. Check app status
flyctl status

# 2. View recent logs for crash reason
flyctl logs --recent 500 | grep -i "error\|fatal\|crash"

# 3. Restart app
flyctl apps restart

# 4. Watch logs during restart
flyctl logs

# 5. If restart fails, check machine status
flyctl machine list

# 6. If machine is stopped, start it
flyctl machine start $(flyctl machine list --json | jq -r '.[0].id')
```

### Critical Bug Found

**Rollback procedure:**

```bash
# 1. View deployment history
flyctl releases

# Example output:
# v5  deployed  2 hours ago
# v4  deployed  1 day ago (STABLE)
# v3  deployed  2 days ago

# 2. Rollback to last known good version
flyctl releases rollback v4

# 3. Verify rollback successful
flyctl status
flyctl logs
```

### Secrets Compromised

**If secrets are leaked (mnemonic, API keys, certs):**

```bash
# 1. IMMEDIATELY rotate all secrets

# For API Key authentication (recommended):
# Generate new API key in Temporal Cloud UI → API Keys → Create
# Revoke the old API key
flyctl secrets set \
  TEMPORAL_API_KEY="new-api-key-from-temporal-cloud" \
  HD_WALLET_MNEMONIC="new mnemonic" \
  BASE_SEPOLIA_RPC_URL="new alchemy url"

# For mTLS authentication:
# Generate new certificates via Temporal Cloud UI → Certificates → Create
flyctl secrets set \
  TEMPORAL_CLIENT_CERT="$(cat new-client.pem | base64)" \
  TEMPORAL_CLIENT_KEY="$(cat new-client.key | base64)" \
  HD_WALLET_MNEMONIC="new mnemonic" \
  BASE_SEPOLIA_RPC_URL="new alchemy url"

# 2. Revoke old credentials in Temporal Cloud

# 3. Document incident in security log

# 4. Review access logs
```

### Temporal Cloud Outage

**If Temporal Cloud is down:**

```bash
# 1. Check Temporal status page
# https://status.temporal.io

# 2. App will automatically retry connection
# No immediate action needed

# 3. Monitor logs for reconnection
flyctl logs | grep -i "connection\|retry"

# 4. Once Temporal is back, verify worker reconnected
# Check Temporal Cloud UI → Workers tab
```

---

## Maintenance

### Update Application

**Deploy new version:**

```bash
# 1. Navigate to workspace root
cd /Users/User/Sites/ets

# 2. Build and deploy
flyctl deploy \
  --config apps/temporal-processor/fly.toml \
  --dockerfile apps/temporal-processor/Dockerfile

# 3. Watch deployment
flyctl logs

# 4. Verify health
flyctl status

# 5. Check worker reconnected
# (Temporal Cloud UI → Workers)
```

### Rotate Secrets

**Rotate secrets quarterly for security:**

**If using API Key authentication (recommended):**

```bash
# 1. Generate new API key in Temporal Cloud UI → API Keys → Create

# 2. Update secret
flyctl secrets set TEMPORAL_API_KEY="new-api-key-from-temporal-cloud"

# 3. Revoke old API key in Temporal Cloud

# 4. App will automatically restart with new secret

# 5. Verify connection
flyctl logs | grep -i "connection\|worker.*start"
```

**If using mTLS certificate authentication:**

```bash
# 1. Generate new certificates (Temporal Cloud UI → Certificates)

# 2. Encode new certificates
cat new-client.pem | base64 > new-client.pem.b64
cat new-client.key | base64 > new-client.key.b64

# 3. Update secrets
flyctl secrets set \
  TEMPORAL_CLIENT_CERT="$(cat new-client.pem.b64)" \
  TEMPORAL_CLIENT_KEY="$(cat new-client.key.b64)"

# 4. App will automatically restart with new secrets

# 5. Verify connection
flyctl logs | grep -i "connection\|worker.*start"
```

### Clean Up Old Checkpoints

**If checkpoint file grows too large (>10MB):**

```bash
flyctl ssh console

# Backup current checkpoint
cp /app/.checkpoint/staging-checkpoint.json /app/.checkpoint/staging-checkpoint.backup.json

# Truncate recent event IDs (keep only last 100)
node -e "
const fs = require('fs');
const checkpoint = JSON.parse(fs.readFileSync('/app/.checkpoint/staging-checkpoint.json'));
if (checkpoint.recentEventIds && checkpoint.recentEventIds.length > 100) {
  checkpoint.recentEventIds = checkpoint.recentEventIds.slice(-100);
  fs.writeFileSync('/app/.checkpoint/staging-checkpoint.json', JSON.stringify(checkpoint, null, 2));
  console.log('Truncated recent event IDs to last 100');
}
"

exit
```

### Scale Resources

**Increase memory:**
```bash
flyctl scale memory 1024  # 512MB → 1GB
```

**Increase CPU:**
```bash
flyctl scale vm dedicated-cpu-1x  # shared → dedicated
```

**Add more instances (not recommended for this app):**
```bash
# DON'T DO THIS - will cause duplicate event processing
# flyctl scale count 2
```

---

## Useful Commands

### Fly.io Quick Reference

```bash
# App Management
flyctl status                           # App status
flyctl apps list                        # List all apps
flyctl apps restart APP_NAME            # Restart app
flyctl apps pause APP_NAME              # Pause (stop billing)
flyctl apps resume APP_NAME             # Resume

# Logs
flyctl logs                             # Live logs
flyctl logs --recent 1000               # Last 1000 lines
flyctl logs > logs.txt                  # Save to file

# SSH Access
flyctl ssh console                      # Interactive shell
flyctl ssh console -C "command"         # Run single command

# Secrets
flyctl secrets list                     # List all secrets
flyctl secrets set KEY=value            # Set secret
flyctl secrets unset KEY                # Remove secret

# Volumes
flyctl volumes list                     # List volumes
flyctl volumes show vol_xxx             # Volume details
flyctl volumes extend vol_xxx --size 2  # Increase size

# Scaling
flyctl scale show                       # Current scale
flyctl scale count 1                    # Set instance count
flyctl scale memory 512                 # Set memory (MB)
flyctl scale vm shared-cpu-1x           # Change VM type

# Deployment
flyctl deploy                           # Deploy app
flyctl releases                         # Deployment history
flyctl releases rollback v4             # Rollback

# Monitoring
flyctl metrics                          # App metrics
flyctl dashboard                        # Open web dashboard
```

### Temporal Cloud UI Quick Access

- **Dashboard**: https://cloud.temporal.io
- **Workers**: cloud.temporal.io → ets-staging → Workers
- **Workflows**: cloud.temporal.io → ets-staging → Workflows
- **Usage**: cloud.temporal.io → ets-staging → Usage
- **Certificates**: cloud.temporal.io → ets-staging → Certificates

### Log Search Patterns

```bash
# Find specific event types
flyctl logs | grep "TargetCreated event"
flyctl logs | grep "TagCreated event"

# Find errors
flyctl logs | grep -i "error\|exception\|fail"

# Find checkpoint updates
flyctl logs | grep -i "checkpoint"

# Find workflow executions
flyctl logs | grep -i "workflow.*start\|workflow.*complet"

# Find RPC issues
flyctl logs | grep -i "rpc\|alchemy\|rate limit"
```

---

## Contacts & Resources

### Emergency Contacts
- **On-Call Engineer**: [YOUR_NAME]
- **Temporal Support**: https://community.temporal.io
- **Fly.io Support**: https://community.fly.io

### Dashboards
- **Fly.io**: https://fly.io/dashboard/ets-temporal-processor-staging
- **Temporal Cloud**: https://cloud.temporal.io/namespaces/ets-staging
- **Alchemy**: https://dashboard.alchemy.com

### Documentation
- **Deployment Guide**: [CLOUD-DEPLOYMENT.md](./CLOUD-DEPLOYMENT.md)
- **Architecture**: [../session/ROADMAP.md](../session/ROADMAP.md)
- **Fly.io Docs**: https://fly.io/docs
- **Temporal Docs**: https://docs.temporal.io

---

**Last updated:** 2025-10-09
**Owner:** ETS Core Team
**Version:** 1.0 (Base Sepolia Staging)
