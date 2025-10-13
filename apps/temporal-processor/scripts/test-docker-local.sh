#!/bin/bash
# Test Docker build locally before deploying to Fly.io
# Usage: ./test-docker-local.sh [staging|production]
#
# This script:
# 1. Builds the Docker image locally
# 2. Runs it with environment variables from .env
# 3. Validates the temporal processor starts correctly
#
# Benefits:
# - Fast feedback (30 seconds vs 5-10 minutes for Fly.io)
# - Catches module resolution and runtime errors early
# - No Fly.io deployment cost for failed builds

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Parse arguments
ENVIRONMENT=${1:-staging}

if [[ "$ENVIRONMENT" != "staging" && "$ENVIRONMENT" != "production" ]]; then
  echo -e "${RED}❌ Error: Environment must be 'staging' or 'production'${NC}"
  echo "Usage: ./test-docker-local.sh [staging|production]"
  exit 1
fi

echo -e "${BLUE}🧪 Testing Temporal Processor Docker build locally (${ENVIRONMENT})${NC}"
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
  echo -e "${RED}❌ Error: No .env file found at workspace root${NC}"
  echo "Create .env file with required variables (see .env.template)"
  exit 1
fi

# Set environment-specific variables
if [ "$ENVIRONMENT" = "staging" ]; then
  MNEMONIC_VAR="$STAGING_MNEMONIC"
  NAMESPACE="${TEMPORAL_NAMESPACE:-ets-staging}"
else
  MNEMONIC_VAR="$PRODUCTION_MNEMONIC"
  NAMESPACE="${TEMPORAL_NAMESPACE:-ets-production}"
fi

# Validate required environment variables
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
  exit 1
fi

echo -e "${GREEN}✓${NC} Environment variables validated"
echo ""

# Build Docker image
echo -e "${BLUE}🔨 Building Docker image...${NC}"
echo "   This will take 2-3 minutes for a fresh build..."
echo ""

if docker build -f apps/temporal-processor/Dockerfile -t ets-temporal:test . ; then
  echo ""
  echo -e "${GREEN}✓${NC} Docker image built successfully"
  echo ""
else
  echo ""
  echo -e "${RED}❌ Docker build failed${NC}"
  exit 1
fi

# Run Docker container
echo -e "${BLUE}🚀 Running Docker container locally...${NC}"
echo "   Press Ctrl+C to stop"
echo ""

docker run --rm \
  -e TEMPORAL_SERVER_URL="$TEMPORAL_SERVER_URL" \
  -e TEMPORAL_API_KEY="$TEMPORAL_API_KEY" \
  -e TEMPORAL_NAMESPACE="$NAMESPACE" \
  -e ALCHEMY_API_KEY="$ALCHEMY_API_KEY" \
  -e HD_WALLET_MNEMONIC="$MNEMONIC_VAR" \
  -e ENVIRONMENT="$ENVIRONMENT" \
  ets-temporal:test
