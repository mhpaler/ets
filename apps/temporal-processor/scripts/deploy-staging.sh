#!/bin/bash

# Deploy Temporal Processor to Staging Environment
# This script deploys the Temporal processor to staging with Base Sepolia + Temporal Cloud

set -e

echo "🚀 Deploying Temporal Processor to Staging..."

# Check required environment variables
if [ -z "$TEMPORAL_CLIENT_CERT" ] || [ -z "$TEMPORAL_CLIENT_KEY" ]; then
  echo "❌ Error: TEMPORAL_CLIENT_CERT and TEMPORAL_CLIENT_KEY must be set"
  exit 1
fi

if [ -z "$ALCHEMY_API_KEY" ]; then
  echo "❌ Error: ALCHEMY_API_KEY must be set"
  exit 1
fi

# Set staging environment variables
export NODE_ENV=staging
export CHAIN_ID=84532  # Base Sepolia
export TEMPORAL_NAMESPACE=${TEMPORAL_NAMESPACE:-staging}
export TEMPORAL_TASK_QUEUE=${TEMPORAL_TASK_QUEUE:-ets-workflows-staging}
export LOG_LEVEL=${LOG_LEVEL:-info}

echo "📋 Deployment Configuration:"
echo "  Environment: $NODE_ENV"
echo "  Chain ID: $CHAIN_ID (Base Sepolia)"
echo "  Temporal Namespace: $TEMPORAL_NAMESPACE"
echo "  Task Queue: $TEMPORAL_TASK_QUEUE"
echo "  Log Level: $LOG_LEVEL"

# Build and deploy
echo "🔨 Building Docker image..."
docker build -t temporal-processor:staging .

echo "🚀 Starting staging deployment..."
docker compose -f docker-compose.staging.yml --profile processor up -d

echo "📊 Checking deployment status..."
docker compose -f docker-compose.staging.yml ps

echo "📝 Showing recent logs..."
docker compose -f docker-compose.staging.yml logs --tail=20 temporal-processor

echo "✅ Staging deployment complete!"
echo "🔗 Monitor your workflows at: https://cloud.temporal.io/namespaces/$TEMPORAL_NAMESPACE"

# Wait for health check
echo "⏳ Waiting for service to be healthy..."
sleep 10

if docker compose -f docker-compose.staging.yml ps temporal-processor | grep -q "Up"; then
  echo "✅ Temporal Processor is running in staging!"
else
  echo "❌ Deployment may have failed. Check logs with:"
  echo "   docker compose -f docker-compose.staging.yml logs temporal-processor"
  exit 1
fi