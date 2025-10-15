#!/bin/bash
# Deploy Temporal Processor to Fly.io
# Usage: ./deploy-flyio.sh [staging|production] [--test] [--replay-from-block <block_number>]
#
# This script automates the deployment process by:
# 1. Loading configuration from .env
# 2. (Optional) Testing Docker build locally first
# 3. Setting Fly.io secrets automatically
# 4. Building and deploying Docker image with --no-cache
# 5. Validating deployment
#
# Options:
#   --test                       Test Docker build locally before deploying to Fly.io
#   --replay-from-block <number> Start processing from a specific block (overrides checkpoint)
#
# Examples:
#   ./deploy-flyio.sh staging
#   ./deploy-flyio.sh production
#   ./deploy-flyio.sh staging --test
#   ./deploy-flyio.sh staging --replay-from-block 32389687

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Parse arguments
ENVIRONMENT=${1:-staging}
TEST_LOCAL=false
REPLAY_FROM_BLOCK=""

# Check for flags
args=("$@")
for i in "${!args[@]}"; do
  arg="${args[$i]}"
  if [ "$arg" = "--test" ]; then
    TEST_LOCAL=true
  elif [ "$arg" = "--replay-from-block" ]; then
    # Get the next argument as the block number
    next_idx=$((i + 1))
    if [ $next_idx -lt ${#args[@]} ]; then
      REPLAY_FROM_BLOCK="${args[$next_idx]}"
      if [[ ! "$REPLAY_FROM_BLOCK" =~ ^[0-9]+$ ]]; then
        echo -e "${RED}❌ Error: --replay-from-block requires a numeric block number${NC}"
        echo "  Received: '$REPLAY_FROM_BLOCK'"
        exit 1
      fi
    else
      echo -e "${RED}❌ Error: --replay-from-block requires a block number${NC}"
      exit 1
    fi
  fi
done

if [[ "$ENVIRONMENT" != "staging" && "$ENVIRONMENT" != "production" ]]; then
  echo -e "${RED}❌ Error: Environment must be 'staging' or 'production'${NC}"
  echo "Usage: ./deploy-flyio.sh [staging|production] [--test] [--replay-from-block <number>]"
  exit 1
fi

echo -e "${BLUE}🚀 Deploying Temporal Processor to Fly.io (${ENVIRONMENT})${NC}"
echo ""

# Navigate to workspace root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORKSPACE_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
cd "$WORKSPACE_ROOT"

# Load environment variables from .env
if [ -f ".env" ]; then
  echo -e "${GREEN}✓${NC} Loading configuration from .env"
  set -a
  source .env
  set +a
else
  echo -e "${YELLOW}⚠${NC}  No .env file found at workspace root, using existing environment variables"
fi

# Set Fly.io app name and configuration based on environment
if [ "$ENVIRONMENT" = "staging" ]; then
  FLY_APP="ets-temporal-processor-staging"
  MNEMONIC_VAR="$STAGING_MNEMONIC"
  NAMESPACE="${TEMPORAL_NAMESPACE:-ets-staging}"
else
  FLY_APP="ets-temporal-processor-production"
  MNEMONIC_VAR="$PRODUCTION_MNEMONIC"
  NAMESPACE="${TEMPORAL_NAMESPACE:-ets-production}"

  # Production safety check
  echo ""
  echo -e "${RED}⚠️  PRODUCTION DEPLOYMENT WARNING ⚠️${NC}"
  echo "You are about to deploy to PRODUCTION environment:"
  echo "  - Base Mainnet (Chain ID: 8453)"
  echo "  - Real transactions and gas costs"
  echo "  - Production Temporal Cloud namespace"
  echo ""
  read -p "Type 'DEPLOY' to confirm: " confirmation

  if [ "$confirmation" != "DEPLOY" ]; then
    echo -e "${RED}❌ Deployment cancelled${NC}"
    exit 1
  fi
fi

# Validate required environment variables
echo ""
echo -e "${BLUE}📋 Validating configuration...${NC}"

MISSING_VARS=()

if [ -z "$ALCHEMY_API_KEY" ]; then
  MISSING_VARS+=("ALCHEMY_API_KEY")
fi

if [ -z "$MNEMONIC_VAR" ]; then
  MISSING_VARS+=("${ENVIRONMENT^^}_MNEMONIC")
fi

if [ -z "$TEMPORAL_SERVER_URL" ]; then
  MISSING_VARS+=("TEMPORAL_SERVER_URL")
fi

if [ -z "$TEMPORAL_API_KEY" ]; then
  MISSING_VARS+=("TEMPORAL_API_KEY")
fi

if [ ${#MISSING_VARS[@]} -gt 0 ]; then
  echo -e "${RED}❌ Error: Missing required environment variables:${NC}"
  for var in "${MISSING_VARS[@]}"; do
    echo "  - $var"
  done
  echo ""
  echo "Please set these variables in your .env file or environment."
  echo "See .env.template for reference."
  exit 1
fi

echo -e "${GREEN}✓${NC} All required variables present"
echo ""

# Display configuration (with sensitive data redacted)
echo -e "${BLUE}📋 Deployment Configuration:${NC}"
echo "  Environment: $ENVIRONMENT"
echo "  Fly.io App: $FLY_APP"
echo "  Alchemy API Key: ${ALCHEMY_API_KEY:0:10}... (redacted)"
echo "  Temporal Server: $TEMPORAL_SERVER_URL"
echo "  Temporal Namespace: $NAMESPACE"
echo "  Mnemonic: ${MNEMONIC_VAR:0:15}... (redacted)"
if [ -n "$REPLAY_FROM_BLOCK" ]; then
  echo -e "  ${YELLOW}🔄 REPLAY MODE: Starting from block $REPLAY_FROM_BLOCK${NC}"
fi
echo ""

# Check if flyctl is installed
if ! command -v flyctl &> /dev/null; then
  echo -e "${RED}❌ Error: flyctl is not installed${NC}"
  echo "Install with: brew install flyctl"
  exit 1
fi

# Check if user is authenticated
if ! flyctl auth whoami &> /dev/null; then
  echo -e "${RED}❌ Error: Not authenticated with Fly.io${NC}"
  echo "Run: flyctl auth login"
  exit 1
fi

# Optional: Test Docker build locally first
if [ "$TEST_LOCAL" = true ]; then
  echo -e "${BLUE}🧪 Testing Docker build locally first...${NC}"
  echo ""

  SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

  if ! "$SCRIPT_DIR/test-docker-local.sh" "$ENVIRONMENT"; then
    echo ""
    echo -e "${RED}❌ Local Docker test failed${NC}"
    echo "Fix the issues and try again"
    exit 1
  fi

  echo ""
  echo -e "${GREEN}✓${NC} Local Docker test passed"
  echo ""
  read -p "Continue with Fly.io deployment? (y/N): " confirm

  if [[ "$confirm" != "y" && "$confirm" != "Y" ]]; then
    echo -e "${YELLOW}Deployment cancelled${NC}"
    exit 0
  fi

  echo ""
fi

# Set Fly.io secrets
echo -e "${BLUE}🔐 Setting Fly.io secrets...${NC}"
echo ""

# Note: flyctl secrets set triggers an automatic deployment
# We use --stage to prevent auto-deployment and deploy manually with our build config
# Set environment-specific mnemonic variable name to match what the app expects
if [ "$ENVIRONMENT" = "staging" ]; then
  MNEMONIC_SECRET_NAME="STAGING_MNEMONIC"
else
  MNEMONIC_SECRET_NAME="PRODUCTION_MNEMONIC"
fi

if ! flyctl secrets set \
  --app "$FLY_APP" \
  --stage \
  TEMPORAL_SERVER_URL="$TEMPORAL_SERVER_URL" \
  TEMPORAL_API_KEY="$TEMPORAL_API_KEY" \
  TEMPORAL_NAMESPACE="$NAMESPACE" \
  ALCHEMY_API_KEY="$ALCHEMY_API_KEY" \
  "$MNEMONIC_SECRET_NAME"="$MNEMONIC_VAR"; then
  echo -e "${RED}❌ Error: Failed to set Fly.io secrets${NC}"
  exit 1
fi

echo ""
echo -e "${GREEN}✓${NC} Secrets configured (staged)"
echo ""

# Deploy to Fly.io
echo -e "${BLUE}🚀 Building and deploying to Fly.io...${NC}"
echo "   This may take 5-10 minutes..."
echo ""

# Build deploy command with optional replay block
DEPLOY_CMD="flyctl deploy --app $FLY_APP --config apps/temporal-processor/fly.toml --dockerfile apps/temporal-processor/Dockerfile --no-cache"

# Add replay block as environment variable if specified
if [ -n "$REPLAY_FROM_BLOCK" ]; then
  DEPLOY_CMD="$DEPLOY_CMD -e REPLAY_FROM_BLOCK=$REPLAY_FROM_BLOCK"
  echo -e "${YELLOW}   Note: Replay mode activated - will start from block $REPLAY_FROM_BLOCK${NC}"
  echo ""
fi

# Execute deploy command
eval $DEPLOY_CMD

echo ""
echo -e "${GREEN}✓${NC} Deployment complete!"
echo ""

# Check deployment status
echo -e "${BLUE}📊 Checking deployment status...${NC}"
flyctl status --app "$FLY_APP"

echo ""
echo -e "${GREEN}✅ Deployment successful!${NC}"
echo ""
echo -e "${BLUE}📝 Next steps:${NC}"
echo "  1. Monitor logs: flyctl logs --app $FLY_APP"
echo "  2. Check Temporal Cloud: https://cloud.temporal.io"
echo "  3. Verify worker is connected in Temporal UI"
echo "  4. Watch for event processing in logs"
echo ""
echo -e "${BLUE}🔗 Resources:${NC}"
echo "  - Fly.io Dashboard: https://fly.io/apps/$FLY_APP"
echo "  - Temporal Cloud: https://cloud.temporal.io/namespaces/$NAMESPACE"
echo "  - Logs: flyctl logs --app $FLY_APP"
echo ""
