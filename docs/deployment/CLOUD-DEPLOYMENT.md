# Cloud Deployment Guide - Temporal Processor

**Target Environment**: Base Sepolia (Staging)
**Platform**: Fly.io + Temporal Cloud
**Status**: Production-Ready POC

---

## Table of Contents

1. [Quick Deploy (Recommended)](#quick-deploy-recommended)
2. [Prerequisites](#prerequisites)
3. [Temporal Cloud Setup](#temporal-cloud-setup)
4. [Fly.io Setup](#flyio-setup)
5. [Deployment Process](#deployment-process)
6. [Validation & Testing](#validation--testing)
7. [Troubleshooting](#troubleshooting)
8. [Cost Monitoring](#cost-monitoring)

---

## Quick Deploy (Recommended)

**For the fastest deployment**, use our automated script that reads from your `.env` configuration:

```bash
# Navigate to workspace root
cd /Users/User/Sites/ets

# Deploy to staging (Base Sepolia + Temporal Cloud)
./apps/temporal-processor/scripts/deploy-flyio.sh staging

# Deploy to production (Base Mainnet + Temporal Cloud)
./apps/temporal-processor/scripts/deploy-flyio.sh production
```

**What the script does:**
- ✅ Loads configuration from your `.env` file
- ✅ Validates all required environment variables
- ✅ Automatically sets Fly.io secrets (no manual copy/paste)
- ✅ Builds and deploys Docker image
- ✅ Validates deployment success
- ✅ Production safety checks

**Prerequisites for automated deployment:**
1. Complete [Temporal Cloud Setup](#temporal-cloud-setup) (get API key)
2. Complete [Fly.io Setup](#flyio-setup) (create app and volume)
3. Ensure your `.env` file contains:
   ```bash
   ALCHEMY_API_KEY=your-key
   STAGING_MNEMONIC="your twelve word mnemonic"
   TEMPORAL_SERVER_URL="ets-staging.xxxxx.tmprl.cloud:7233"
   TEMPORAL_API_KEY="your-temporal-api-key"
   TEMPORAL_NAMESPACE="ets-staging"
   ```

**For manual deployment** or troubleshooting, see the detailed [Deployment Process](#deployment-process) section below.

---

## Prerequisites

### Required Accounts
- ✅ Temporal Cloud account (free $1,000 credits)
- ✅ Fly.io account (requires credit card)
- ✅ Alchemy account (Base Sepolia RPC)
- ✅ HD Wallet mnemonic for staging environment

### Required Tools
```bash
# Install Fly.io CLI
brew install flyctl  # macOS
# OR
curl -L https://fly.io/install.sh | sh  # Linux/WSL

# Install Temporal CLI (optional, for testing)
brew install temporal  # macOS

# Verify installations
flyctl version
temporal --version
```

---

## Temporal Cloud Setup

### Step 1: Create Account & Claim Free Credits

1. Visit https://temporal.io/cloud
2. Sign up with your email
3. Claim $1,000 free credits (should be automatic for new accounts)

### Step 2: Create Namespace

```bash
# Using Temporal Cloud UI
1. Navigate to "Namespaces" in Temporal Cloud
2. Click "Create Namespace"
3. Name: `ets-staging` (or your preferred name)
4. Region: Choose closest to your Fly.io region (e.g., us-west-2)
5. Click "Create"
```

**Note your namespace details:**
- Namespace: `ets-staging`
- Region: `us-west-2` (example)
- **gRPC Endpoint**: `ets-staging.a1b2c.tmprl.cloud:7233`

### Step 3: Configure Authentication

**Option A: API Key Authentication (Recommended - Simpler)**

1. Navigate to your namespace (`ets-staging`)
2. Go to "API Keys" or "Service Accounts" tab
3. Click "Create API Key"
4. Give it a name: `ets-temporal-processor`
5. **Copy the API key** (you'll only see it once!)
6. Store it securely - you'll use it in Step 1 of Deployment

**✅ Advantages:**
- Simple setup (one string)
- Easy rotation
- No certificate encoding needed
- Recommended for most deployments

**Option B: mTLS Certificates (Alternative)**

For advanced deployments requiring certificate-based authentication:

<details>
<summary>Click to expand mTLS setup instructions</summary>

**Using Temporal Cloud UI:**

1. Navigate to your namespace (`ets-staging`)
2. Go to "Certificates" tab
3. Click "Create Certificate"
4. Certificate name: `ets-temporal-processor`
5. Duration: 1 year (default)
6. Click "Generate"
7. **Download both files**:
   - `client.pem` (certificate)
   - `client.key` (private key)

**Using `tcld` CLI:**

```bash
# Install tcld
brew install temporal/tap/tcld

# Login
tcld login

# Generate certificate
tcld namespace certificate generate \
  --namespace ets-staging \
  --certificate-duration 365d \
  --output-directory ./certs

# Files created:
# - ./certs/client.pem
# - ./certs/client.key
```

**Encode certificates for Fly.io secrets:**

```bash
# Navigate to certificate directory
cd /path/to/certificates

# Encode to base64 (required for Fly.io secrets)
cat client.pem | base64 > client.pem.b64
cat client.key | base64 > client.key.b64

# Verify (should see base64-encoded strings)
cat client.pem.b64
cat client.key.b64
```

</details>

**⚠️ IMPORTANT:** Keep your API key or certificates secure! They grant access to your Temporal namespace.

---

## Fly.io Setup

### Step 1: Create Account

1. Visit https://fly.io/app/sign-up
2. Sign up with GitHub or email
3. Add credit card (required for custom apps)

### Step 2: Install & Authenticate CLI

```bash
# Install flyctl
brew install flyctl  # macOS

# Login
flyctl auth login

# Verify authentication
flyctl auth whoami
```

### Step 3: Create Fly App

```bash
# Navigate to temporal-processor directory
cd /Users/User/Sites/ets/apps/temporal-processor

# Initialize Fly app (DO NOT deploy yet)
flyctl launch --no-deploy

# Interactive prompts:
# - App name: ets-temporal-processor-staging
# - Region: sjc (San Jose) or your preferred region
# - PostgreSQL: No
# - Redis: No
# - Deploy now: No

# This creates fly.toml (already exists in your repo)
```

**Note:** If `fly.toml` already exists, flyctl will use it.

### Step 4: Create Persistent Volume

Checkpoint files need persistent storage across deployments:

```bash
# Create 1GB volume for checkpoint files
flyctl volumes create ets_checkpoints \
  --region sjc \
  --size 1

# Verify volume created
flyctl volumes list
```

Expected output:
```
ID                  NAME             SIZE  REGION  ATTACHED VM  CREATED AT
vol_xxxxxxxxxxx     ets_checkpoints  1GB   sjc                  2m ago
```

---

## Deployment Process

**TL;DR:** Use the [Quick Deploy script](#quick-deploy-recommended) for automated deployment.

**Manual deployment** is documented below for reference, troubleshooting, or custom configurations.

---

### Step 1: Set Environment Secrets

**⚠️ NEVER commit these values to git!**

**Option A: Automated (Recommended)**

Use the deployment script which reads from your `.env`:

```bash
./apps/temporal-processor/scripts/deploy-flyio.sh staging
# Script automatically sets all secrets from .env
```

**Option B: Manual Secret Management**

**If using API Key authentication (recommended):**

```bash
# Navigate to temporal-processor directory
cd /Users/User/Sites/ets/apps/temporal-processor

# Set all secrets in one command
flyctl secrets set \
  TEMPORAL_SERVER_URL="ets-staging.a1b2c.tmprl.cloud:7233" \
  TEMPORAL_API_KEY="your-api-key-from-temporal-cloud" \
  TEMPORAL_NAMESPACE="ets-staging" \
  ALCHEMY_API_KEY="your-alchemy-api-key" \
  HD_WALLET_MNEMONIC="your twelve word mnemonic phrase here for staging"

# Optional: Set HD wallet position (default: 2 for EventProcessor)
# flyctl secrets set HD_WALLET_POSITION="2"

# Verify secrets (values will be redacted)
flyctl secrets list
```

**Note:** The config package constructs RPC URLs from `ALCHEMY_API_KEY`. For staging (Base Sepolia), it builds `https://base-sepolia.g.alchemy.com/v2/{ALCHEMY_API_KEY}`. For production (Base Mainnet), it builds `https://base-mainnet.g.alchemy.com/v2/{ALCHEMY_API_KEY}`.

Expected output:
```
NAME                     DIGEST           CREATED AT
TEMPORAL_SERVER_URL      xxxxxxxxxxxxxxxx  1m ago
TEMPORAL_API_KEY         xxxxxxxxxxxxxxxx  1m ago
TEMPORAL_NAMESPACE       xxxxxxxxxxxxxxxx  1m ago
ALCHEMY_API_KEY          xxxxxxxxxxxxxxxx  1m ago
HD_WALLET_MNEMONIC       xxxxxxxxxxxxxxxx  1m ago
```

**If using mTLS certificates (alternative):**

<details>
<summary>Click to expand mTLS secrets setup</summary>

```bash
# Navigate to temporal-processor directory
cd /Users/User/Sites/ets/apps/temporal-processor

# Set all secrets in one command
flyctl secrets set \
  TEMPORAL_SERVER_URL="ets-staging.a1b2c.tmprl.cloud:7233" \
  TEMPORAL_CLIENT_CERT="$(cat /path/to/client.pem.b64)" \
  TEMPORAL_CLIENT_KEY="$(cat /path/to/client.key.b64)" \
  TEMPORAL_NAMESPACE="ets-staging" \
  ALCHEMY_API_KEY="your-alchemy-api-key" \
  HD_WALLET_MNEMONIC="your twelve word mnemonic phrase here for staging"

# Verify secrets
flyctl secrets list
```

Expected output:
```
NAME                     DIGEST           CREATED AT
TEMPORAL_SERVER_URL      xxxxxxxxxxxxxxxx  1m ago
TEMPORAL_CLIENT_CERT     xxxxxxxxxxxxxxxx  1m ago
TEMPORAL_CLIENT_KEY      xxxxxxxxxxxxxxxx  1m ago
TEMPORAL_NAMESPACE       xxxxxxxxxxxxxxxx  1m ago
ALCHEMY_API_KEY          xxxxxxxxxxxxxxxx  1m ago
HD_WALLET_MNEMONIC       xxxxxxxxxxxxxxxx  1m ago
```

</details>

### Step 2: Deploy to Fly.io

**Option A: Automated (Recommended)**

If you used the automated script in Step 1, the deployment is already complete! Skip to [Step 3: Verify Deployment](#step-3-verify-deployment).

**Option B: Manual Deployment**

If you set secrets manually, deploy with:

```bash
# Build and deploy from workspace root
cd /Users/User/Sites/ets
flyctl deploy --config apps/temporal-processor/fly.toml --dockerfile apps/temporal-processor/Dockerfile

# First deployment takes 5-10 minutes (building Docker image)
```

Expected output:
```
==> Building image
--> Building image with Docker
...
==> Pushing image to fly
...
==> Creating release
...
==> Monitoring deployment
 1 desired, 1 placed, 1 healthy, 0 unhealthy
--> v1 deployed successfully
```

### Step 3: Verify Deployment

```bash
# Check app status
flyctl status

# View real-time logs
flyctl logs

# Check resource usage
flyctl scale show
```

---

## Validation & Testing

### 1. Check Temporal Cloud Connection

Visit Temporal Cloud UI: https://cloud.temporal.io

1. Navigate to your namespace (`ets-staging`)
2. Go to "Workers" tab
3. **Verify worker is connected**:
   - Worker ID: `ets-worker-staging-<timestamp>`
   - Task Queue: `ets-workflows-cloud-staging`
   - Status: **Online** (green)

### 2. Monitor Event Processing

```bash
# Watch logs in real-time
flyctl logs

# Look for these log entries:
# ✅ "Starting Temporal Processor Service"
# ✅ "Worker configuration" (shows task queue, namespace)
# ✅ "Temporal worker started successfully"
# ✅ "Backfill complete" (after initial historical scan)
# ✅ "Watching for new events" (polling mode)
```

### 3. Test Event Detection

Temporal Processor should automatically detect Base Sepolia events:

**Check logs for event detection:**
```
[EventListener] Found 35 TargetCreated events
[EventListener] Found 2 TagCreated events
[EventListener] Processing event: targetId=0x...
```

**Verify in Temporal Cloud UI:**
1. Go to "Workflows" tab
2. Filter by Task Queue: `ets-workflows-cloud-staging`
3. You should see workflow executions for each event

### 4. Test Checkpoint System

**Verify checkpoint persistence:**

```bash
# SSH into container
flyctl ssh console

# Check checkpoint file exists
ls -la /app/.checkpoint/

# Should see: staging-checkpoint.json
cat /app/.checkpoint/staging-checkpoint.json

# Example output:
# {
#   "lastProcessedBlock": "32138843",
#   "lastUpdated": "2025-10-09T...",
#   "recentEventIds": ["0x...-123", ...]
# }

# Exit SSH
exit
```

**Test crash recovery:**
```bash
# Restart the app
flyctl apps restart ets-temporal-processor-staging

# Watch logs - should resume from last checkpoint
flyctl logs

# Look for:
# "Resuming from checkpoint block: 32138843"
# "Backfill progress: 10 chunks scanned"
# NOT: "Starting backfill from deployment block: 31787829"
```

---

## Troubleshooting

### Problem: Automated deployment script fails

**Symptoms:**
- Script exits with "Missing required environment variables" error
- "flyctl is not installed" or "Not authenticated with Fly.io" errors
- Secrets fail to set

**Solutions:**

1. **Missing environment variables:**

```bash
# Check what's in your .env file
cat .env | grep -E "ALCHEMY|MNEMONIC|TEMPORAL"

# Ensure you have:
# - ALCHEMY_API_KEY
# - STAGING_MNEMONIC (for staging) or PRODUCTION_MNEMONIC (for production)
# - TEMPORAL_SERVER_URL
# - TEMPORAL_API_KEY
# - TEMPORAL_NAMESPACE (optional, defaults to ets-staging/ets-production)
```

2. **Flyctl not installed or not authenticated:**

```bash
# Install flyctl
brew install flyctl

# Authenticate
flyctl auth login

# Verify
flyctl auth whoami
```

3. **Wrong Fly.io app name:**

```bash
# Check your apps
flyctl apps list

# If app doesn't exist, create it first (see Fly.io Setup section)
flyctl launch --no-deploy
```

4. **Script permissions:**

```bash
# Make script executable
chmod +x apps/temporal-processor/scripts/deploy-flyio.sh
```

### Problem: Worker not connecting to Temporal Cloud

**Symptoms:**
- No worker shown in Temporal Cloud UI
- Logs show: "Failed to connect" or authentication errors

**Solutions:**

1. **Verify authentication credentials:**
```bash
# Check secrets are set
flyctl secrets list

# For API Key authentication (recommended):
# Should see: TEMPORAL_API_KEY

# For mTLS authentication:
# Should see: TEMPORAL_CLIENT_CERT and TEMPORAL_CLIENT_KEY
```

2. **Test API key (if using API key auth):**
```bash
# Regenerate API key in Temporal Cloud if invalid
# 1. Go to Temporal Cloud UI → ets-staging → API Keys
# 2. Revoke old key
# 3. Create new key
# 4. Update secret
flyctl secrets set TEMPORAL_API_KEY="new-api-key"

# Redeploy
flyctl deploy
```

3. **Verify Temporal Cloud endpoint:**
```bash
# Check your actual endpoint in Temporal Cloud UI
# Should match: ets-staging.a1b2c.tmprl.cloud:7233

# Update if wrong
flyctl secrets set TEMPORAL_SERVER_URL="correct-endpoint:7233"
```

4. **If using mTLS certificates, check certificate validity:**
```bash
# Re-encode certificates (might be corrupt)
cat client.pem | base64 > client.pem.b64
flyctl secrets set TEMPORAL_CLIENT_CERT="$(cat client.pem.b64)"

# Check certificate expiration
openssl x509 -in client.pem -text -noout | grep "Not After"

# If expired, generate new certificate in Temporal Cloud UI
```

### Problem: Events not being processed

**Symptoms:**
- Logs show "Watching for new events" but no event processing
- No workflows in Temporal Cloud UI

**Solutions:**

1. **Verify Base Sepolia RPC connection:**
```bash
# Check logs for RPC errors
flyctl logs | grep -i "rpc\|alchemy\|error"

# Test RPC endpoint manually
curl -X POST YOUR_ALCHEMY_URL \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'

# Should return latest block number
```

2. **Check contract addresses:**
```bash
# SSH into container
flyctl ssh console

# Verify config loaded correctly
node -e "
const { ETSConfig } = require('/app/packages/config/dist/index.js');
const config = ETSConfig.getInstance();
console.log(config.getContracts());
"

# Should show Base Sepolia contract addresses
```

3. **Verify deployment block:**
```bash
# Check logs for backfill start
flyctl logs | grep -i "backfill\|deployment block"

# Should show:
# "Starting backfill from deployment block: 31787829"
```

### Problem: High costs

**Symptoms:**
- Fly.io bill higher than expected (~$20+/month)

**Solutions:**

1. **Check resource usage:**
```bash
# View current scale
flyctl scale show

# Reduce memory if over-provisioned
flyctl scale memory 256  # From 512MB to 256MB

# Check VM count (should be 1)
flyctl scale count
```

2. **Monitor Temporal actions:**
```bash
# In Temporal Cloud UI:
# - Go to "Usage" tab
# - Check Actions consumed
# - $1,000 credit = 20 million actions
# - Alert if approaching limit
```

### Problem: Checkpoint not persisting

**Symptoms:**
- Every restart scans from deployment block (not checkpoint)
- Logs show: "Starting backfill from deployment block: 31787829"

**Solutions:**

1. **Verify volume is mounted:**
```bash
flyctl ssh console

# Check volume mount
df -h | grep checkpoint

# Should show:
# /dev/vdc  1.0G  ... /app/.checkpoint

# Check permissions
ls -la /app/.checkpoint
# Should be owned by 'temporal' user
```

2. **Check volume attachment:**
```bash
flyctl volumes list

# Should show volume attached to VM
# If not attached, restart app
flyctl apps restart
```

---

## Cost Monitoring

### Fly.io Costs

**Expected monthly cost: $10-20**

```bash
# View current usage
flyctl dashboard

# Monitor resource usage
flyctl scale show
flyctl metrics

# Breakdown:
# - VM (shared-cpu-1x, 512MB): ~$5-10/month
# - Volume (1GB): $0.15/month
# - Bandwidth (minimal for worker): ~$0-2/month
```

**Cost optimization tips:**
- Use smallest VM that doesn't OOM (512MB should be sufficient)
- Shared CPU is fine for this workload (not latency-sensitive)
- Volume auto-expands - start with 1GB
- Stop app when not needed: `flyctl apps pause`

### Temporal Cloud Costs

**Free tier: $1,000 credits (20 million actions)**

```bash
# Monitor usage in Temporal Cloud UI:
# 1. Navigate to namespace
# 2. Click "Usage" tab
# 3. Check "Actions consumed this month"

# Estimate burn rate:
# - Each event triggers ~10-20 actions
# - 1,000 events/day = ~20,000 actions/day
# - 20M actions / 20k per day = ~1,000 days of free tier
```

**When free credits run out:**
- Actions: $50 per million ($0.00005 per action)
- Business plan: $500/month minimum
- For POC, $1,000 credit should last months

---

## Summary Checklist

### Pre-Deployment
- [ ] Temporal Cloud account created
- [ ] Namespace created (`ets-staging`)
- [ ] Authentication configured (choose one):
  - [ ] API Key created (recommended)
  - [ ] mTLS certificates generated and encoded to base64
- [ ] Fly.io account created and CLI installed
- [ ] Fly app created (`ets-temporal-processor-staging`)
- [ ] Persistent volume created (`ets_checkpoints`)

### Deployment

- [ ] All secrets set (Temporal auth, RPC URL, mnemonic)
- [ ] Docker image built and deployed
- [ ] App showing as "healthy" in Fly.io
- [ ] Worker connected in Temporal Cloud UI
- [ ] Logs showing successful startup

### Validation
- [ ] Worker appears in Temporal Cloud ("Workers" tab)
- [ ] Events being detected and processed
- [ ] Workflows executing in Temporal Cloud UI
- [ ] Checkpoint file created (`staging-checkpoint.json`)
- [ ] Crash recovery tested (resumes from checkpoint)

### Monitoring
- [ ] Fly.io dashboard bookmarked
- [ ] Temporal Cloud dashboard bookmarked
- [ ] Cost alerts configured
- [ ] Log monitoring set up

---

## Next Steps

After successful deployment:

1. **Monitor for 24-48 hours**
   - Watch logs for errors
   - Verify consistent event processing
   - Check checkpoint system working

2. **Performance tuning**
   - Adjust `MAX_CONCURRENT_ACTIVITIES` if needed
   - Optimize chunk size for RPC provider
   - Monitor memory usage

3. **Prepare for mainnet**
   - Document any issues found
   - Create production namespace in Temporal Cloud
   - Plan mainnet deployment strategy

4. **Create runbook** (see [RUNBOOK.md](./RUNBOOK.md))
   - Common operations
   - Debugging procedures
   - Emergency contacts

---

## Resources

- **Fly.io Docs**: https://fly.io/docs
- **Temporal Cloud Docs**: https://docs.temporal.io/cloud
- **Temporal Cloud UI**: https://cloud.temporal.io
- **Fly.io Dashboard**: https://fly.io/dashboard
- **Alchemy Dashboard**: https://dashboard.alchemy.com

---

**Deployment completed:** [DATE]
**Deployed by:** [YOUR NAME]
**Last updated:** 2025-10-09
