#!/bin/bash

echo "Testing Gelato Web3 Functions locally..."

# Navigate to contracts directory where Hardhat config is
cd ../../packages/contracts

# Test target-enrichment function
echo ""
echo "Testing target-enrichment Web3 Function..."
npx hardhat w3f-run target-enrichment --logs

# Test tag-created function
echo ""
echo "Testing tag-created Web3 Function..."
npx hardhat w3f-run tag-created --logs

echo ""
echo "Tests complete!"