#!/bin/bash

# Start script for Temporal Processor with Base Sepolia configuration
# This script loads the proper environment and starts the worker

echo "🚀 Starting Temporal Processor for Base Sepolia..."
echo "================================================"

# Check if .env.basesepolia exists
if [ ! -f .env.basesepolia ]; then
  echo "❌ Error: .env.basesepolia not found!"
  echo "Please create .env.basesepolia with your configuration"
  exit 1
fi

# Load Base Sepolia environment
cp .env.basesepolia .env

# Check if STAGING_MNEMONIC is set in parent .env
if [ -f ../../.env ]; then
  # Source parent .env to get STAGING_MNEMONIC
  export $(grep -v '^#' ../../.env | grep STAGING_MNEMONIC | xargs)

  if [ -z "$STAGING_MNEMONIC" ]; then
    echo "⚠️  Warning: STAGING_MNEMONIC not found in root .env"
    echo "Using default Hardhat mnemonic for testing"
    export MNEMONIC="test test test test test test test test test test test junk"
  else
    export MNEMONIC="$STAGING_MNEMONIC"
    echo "✅ Using STAGING_MNEMONIC from root .env"
  fi
else
  echo "⚠️  Warning: Root .env not found, using test mnemonic"
  export MNEMONIC="test test test test test test test test test test test junk"
fi

echo ""
echo "Configuration:"
echo "  Chain ID: 84532 (Base Sepolia)"
echo "  Task Queue: ets-workflows-local-staging"
echo "  HD Wallet Position: 2 (ETSEventProcessor)"
echo ""

# Start the worker
echo "Starting Temporal worker..."
pnpm tsx src/worker.ts