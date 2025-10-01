#!/usr/bin/env bash

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting Base Sepolia Temporal Processor...${NC}"

# Navigate to temporal-processor directory
cd "$(dirname "$0")/../apps/temporal-processor"

# Check if .env.basesepolia exists
if [ ! -f ".env.basesepolia" ]; then
    echo -e "${RED}Error: .env.basesepolia not found${NC}"
    echo "Please create apps/temporal-processor/.env.basesepolia with:"
    echo "  - STAGING_MNEMONIC"
    echo "  - STAGING_RPC_URL"
    echo "  - TEMPORAL_TASK_QUEUE"
    echo "  - TEMPORAL_SERVER_URL"
    exit 1
fi

# Load environment
export NODE_ENV=basesepolia

echo -e "${BLUE}Using Base Sepolia configuration...${NC}"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing dependencies...${NC}"
    pnpm install
fi

# Build if needed
if [ ! -d "dist" ]; then
    echo -e "${YELLOW}Building temporal-processor...${NC}"
    pnpm build
fi

# Start the event listener and worker
echo -e "${GREEN}Starting processor for Base Sepolia events...${NC}"
echo -e "${YELLOW}Task Queue: ets-workflows-localhost-development${NC}"
echo -e "${YELLOW}Network: Base Sepolia (Chain ID: 84532)${NC}"

# Copy env file
cp .env.basesepolia .env

# Start both the event listener and worker
echo -e "${BLUE}Starting event listener (watches blockchain)...${NC}"
pnpm dev &
EVENT_LISTENER_PID=$!

echo -e "${BLUE}Starting worker (processes workflows)...${NC}"
pnpm worker &
WORKER_PID=$!

echo -e "${GREEN}Both processes started:${NC}"
echo "  - Event Listener PID: $EVENT_LISTENER_PID"
echo "  - Worker PID: $WORKER_PID"
echo ""
echo "Press Ctrl+C to stop both processes"

# Trap to clean up both processes on exit
trap "echo 'Stopping processes...'; kill $EVENT_LISTENER_PID $WORKER_PID 2>/dev/null; exit" SIGINT SIGTERM

# Wait for both processes
wait $EVENT_LISTENER_PID $WORKER_PID