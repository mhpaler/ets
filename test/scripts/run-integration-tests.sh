#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}==================================${NC}"
echo -e "${GREEN}ETS Integration Test Runner${NC}"
echo -e "${GREEN}==================================${NC}\n"

# Configuration
PROJECT_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
HARDHAT_DIR="$PROJECT_ROOT/packages/contracts"
OFFCHAIN_API_DIR="$PROJECT_ROOT/apps/offchain-api"
EVENT_PROCESSOR_DIR="$PROJECT_ROOT/apps/event-processor"
TEST_DIR="$PROJECT_ROOT/test"

# Process IDs for cleanup
PIDS=()

# Cleanup function
cleanup() {
    echo -e "\n${YELLOW}Cleaning up processes...${NC}"
    for pid in "${PIDS[@]}"; do
        if kill -0 $pid 2>/dev/null; then
            echo "  Stopping process $pid"
            kill $pid 2>/dev/null || true
        fi
    done
    exit 0
}

# Set up trap for cleanup on exit
trap cleanup EXIT INT TERM

# Function to wait for a service to be ready
wait_for_service() {
    local name=$1
    local url=$2
    local max_attempts=30
    local attempt=0
    
    echo -n "  Waiting for $name..."
    while [ $attempt -lt $max_attempts ]; do
        if curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null | grep -q "200\|404"; then
            echo -e " ${GREEN}Ready!${NC}"
            return 0
        fi
        sleep 1
        attempt=$((attempt + 1))
        echo -n "."
    done
    echo -e " ${RED}Failed!${NC}"
    return 1
}

# Function to check if a port is in use
port_in_use() {
    local port=$1
    lsof -i:$port >/dev/null 2>&1
}

echo -e "${YELLOW}Step 1: Checking prerequisites${NC}"
# Check for required tools
for tool in node pnpm bun curl lsof; do
    if ! command -v $tool &> /dev/null; then
        echo -e "  ${RED}✗ $tool is not installed${NC}"
        exit 1
    else
        echo -e "  ${GREEN}✓ $tool is installed${NC}"
    fi
done

echo -e "\n${YELLOW}Step 2: Installing dependencies${NC}"
cd "$PROJECT_ROOT"
pnpm install --silent

echo -e "\n${YELLOW}Step 3: Starting local services${NC}"

# Start Hardhat node if not already running
if ! port_in_use 8545; then
    echo "  Starting Hardhat node..."
    cd "$HARDHAT_DIR"
    nohup pnpm hardhat node > /tmp/hardhat.log 2>&1 &
    HARDHAT_PID=$!
    PIDS+=($HARDHAT_PID)
    wait_for_service "Hardhat" "http://localhost:8545" || exit 1
else
    echo -e "  ${GREEN}✓ Hardhat already running on port 8545${NC}"
fi

# Deploy contracts
echo -e "\n${YELLOW}Step 4: Deploying contracts${NC}"
cd "$HARDHAT_DIR"
pnpm hardhat deployETS --tags deployAll --network localhost

# Start ArLocal (Arweave local) if needed
if ! port_in_use 1984; then
    echo -e "\n${YELLOW}Step 5: Starting ArLocal${NC}"
    npx arlocal > /tmp/arlocal.log 2>&1 &
    ARLOCAL_PID=$!
    PIDS+=($ARLOCAL_PID)
    wait_for_service "ArLocal" "http://localhost:1984/info" || echo -e "  ${YELLOW}⚠ ArLocal not available - tests will use mocks${NC}"
else
    echo -e "\n${YELLOW}Step 5: ArLocal${NC}"
    echo -e "  ${GREEN}✓ ArLocal already running on port 1984${NC}"
fi

# Start Offchain API if not already running
if ! port_in_use 4000; then
    echo -e "\n${YELLOW}Step 6: Starting Offchain API${NC}"
    cd "$OFFCHAIN_API_DIR"
    if [ -f "package.json" ]; then
        OFFCHAIN_API_URL=http://localhost:4000 \
        CHAIN_ID=31337 \
        RPC_URL=http://localhost:8545 \
        nohup pnpm start > /tmp/offchain-api.log 2>&1 &
        OFFCHAIN_API_PID=$!
        PIDS+=($OFFCHAIN_API_PID)
        wait_for_service "Offchain API" "http://localhost:4000/health" || echo -e "  ${YELLOW}⚠ Offchain API not available - tests will use mocks${NC}"
    else
        echo -e "  ${YELLOW}⚠ Offchain API not found - tests will use mocks${NC}"
    fi
else
    echo -e "\n${YELLOW}Step 6: Offchain API${NC}"
    echo -e "  ${GREEN}✓ Offchain API already running on port 4000${NC}"
fi

# Start Event Processor
echo -e "\n${YELLOW}Step 7: Starting Event Processor${NC}"
cd "$EVENT_PROCESSOR_DIR"
if [ -f "src/index.ts" ]; then
    # Get the event processor private key from hardhat accounts
    EVENT_PROCESSOR_KEY="0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a" # account[2]
    
    CHAIN_ID=31337 \
    RPC_URL=http://localhost:8545 \
    OFFCHAIN_API_URL=http://localhost:4000 \
    PRIVATE_KEY=$EVENT_PROCESSOR_KEY \
    nohup bun src/index.ts > /tmp/event-processor.log 2>&1 &
    EVENT_PROCESSOR_PID=$!
    PIDS+=($EVENT_PROCESSOR_PID)
    echo -e "  ${GREEN}✓ Event Processor started${NC}"
    sleep 3 # Give it time to initialize
else
    echo -e "  ${YELLOW}⚠ Event Processor not found - manual enrichment tests will fail${NC}"
fi

# Run the integration tests
echo -e "\n${YELLOW}Step 8: Running integration tests${NC}"
cd "$TEST_DIR"

# Set test environment variables
export HARDHAT_NETWORK=localhost
export RPC_URL=http://localhost:8545
export CHAIN_ID=31337
export TEST_TIMEOUT=30000

# Run specific test suites
echo -e "\n${GREEN}Running Target Enrichment Integration Tests${NC}"
pnpm test:enrichment

# Check if we should run Zora tag creation tests
if [ -f "integration/zora-tag-creation.integration.test.ts" ]; then
    echo -e "\n${GREEN}Running Zora Tag Creation Integration Tests${NC}"
    pnpm test integration/zora-tag-creation.integration.test.ts
fi

echo -e "\n${GREEN}==================================${NC}"
echo -e "${GREEN}Integration tests completed!${NC}"
echo -e "${GREEN}==================================${NC}"

# Show logs if requested
if [ "$1" = "--show-logs" ]; then
    echo -e "\n${YELLOW}Service Logs:${NC}"
    echo -e "\n${YELLOW}Hardhat:${NC}"
    tail -n 20 /tmp/hardhat.log 2>/dev/null || echo "No logs available"
    echo -e "\n${YELLOW}Event Processor:${NC}"
    tail -n 20 /tmp/event-processor.log 2>/dev/null || echo "No logs available"
    echo -e "\n${YELLOW}Offchain API:${NC}"
    tail -n 20 /tmp/offchain-api.log 2>/dev/null || echo "No logs available"
fi