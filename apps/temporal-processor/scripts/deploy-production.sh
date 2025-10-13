#!/bin/bash

# Deploy Temporal Processor to Production Environment
# This script deploys the Temporal processor to production with Base Mainnet + Temporal Cloud

set -e

echo "🚀 Deploying Temporal Processor to Production..."

# Check required environment variables
if [ -z "$TEMPORAL_API_KEY" ]; then
  echo "❌ Error: TEMPORAL_API_KEY must be set"
  exit 1
fi

if [ -z "$ALCHEMY_API_KEY" ]; then
  echo "❌ Error: ALCHEMY_API_KEY must be set"
  exit 1
fi

# Production safety check
echo "⚠️  PRODUCTION DEPLOYMENT WARNING ⚠️"
echo "You are about to deploy to PRODUCTION environment:"
echo "  - Base Mainnet (Chain ID: 8453)"
echo "  - Real transactions and gas costs"
echo "  - Production Temporal Cloud namespace"
read -p "Type 'DEPLOY' to confirm: " confirmation

if [ "$confirmation" != "DEPLOY" ]; then
  echo "❌ Deployment cancelled"
  exit 1
fi

# Set production environment variables
export NODE_ENV=production
export CHAIN_ID=8453  # Base Mainnet
export TEMPORAL_NAMESPACE=${TEMPORAL_NAMESPACE:-production}
export TEMPORAL_TASK_QUEUE=${TEMPORAL_TASK_QUEUE:-ets-workflows-production}
export LOG_LEVEL=${LOG_LEVEL:-warn}

echo "📋 Production Deployment Configuration:"
echo "  Environment: $NODE_ENV"
echo "  Chain ID: $CHAIN_ID (Base Mainnet)"
echo "  Temporal Namespace: $TEMPORAL_NAMESPACE"
echo "  Task Queue: $TEMPORAL_TASK_QUEUE"
echo "  Log Level: $LOG_LEVEL"

# Build and deploy
echo "🔨 Building Docker image..."
docker build -t temporal-processor:production .

echo "🚀 Starting production deployment..."
docker compose -f docker-compose.production.yml --profile processor up -d

echo "📊 Checking deployment status..."
docker compose -f docker-compose.production.yml ps

echo "📝 Showing recent logs..."
docker compose -f docker-compose.production.yml logs --tail=20 temporal-processor

echo "✅ Production deployment complete!"
echo "🔗 Monitor your workflows at: https://cloud.temporal.io/namespaces/$TEMPORAL_NAMESPACE"

# Wait for health check
echo "⏳ Waiting for service to be healthy..."
sleep 15

if docker compose -f docker-compose.production.yml ps temporal-processor | grep -q "Up"; then
  echo "✅ Temporal Processor is running in production!"
  echo "🔍 Monitor logs with: docker compose -f docker-compose.production.yml logs -f temporal-processor"
  echo "📊 Check metrics and alerts in your monitoring system"
else
  echo "❌ Deployment may have failed. Check logs with:"
  echo "   docker compose -f docker-compose.production.yml logs temporal-processor"
  exit 1
fi