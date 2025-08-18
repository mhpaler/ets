#!/bin/bash

set -e

# Directory of this script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

# Root directory of the project
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

# Set up logging with colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

log() {
  echo -e "${BLUE}[$(date +"%T")]${NC} - $1"
}

success() {
  echo -e "${GREEN}[$(date +"%T")]${NC} - $1"
}

error() {
  echo -e "${RED}[$(date +"%T")]${NC} - $1"
}

print_banner() {
  echo ""
  echo -e "  ${CYAN}███████╗████████╗███████╗${NC}"
  echo -e "  ${CYAN}██╔════╝╚══██╔══╝██╔════╝${NC}"
  echo -e "  ${CYAN}█████╗     ██║   ███████╗${NC}"
  echo -e "  ${CYAN}██╔══╝     ██║   ╚════██║${NC}"
  echo -e "  ${CYAN}███████╗   ██║   ███████║${NC}"
  echo -e "  ${CYAN}╚══════╝   ╚═╝   ╚══════╝${NC}"
  echo -e "  ${YELLOW}Core TAG Creation Stack${NC}"
  echo ""
  echo -e "${GREEN}Starting minimal stack for TAG creation testing...${NC}"
  echo ""
}

# Check if port is available
check_port_availability() {
  local port=$1
  if lsof -i:$port -sTCP:LISTEN -t >/dev/null 2>&1; then
    return 1  # Port is in use
  else
    return 0  # Port is available
  fi
}

# Clean logs
clean_logs() {
  log "Cleaning previous log files..."
  mkdir -p "$ROOT_DIR/logs"
  rm -f "$ROOT_DIR/logs/core-hardhat.log"
  rm -f "$ROOT_DIR/logs/core-event-processor.log"
  rm -f "$ROOT_DIR/logs/core-offchain-api.log"
  success "Core log files cleaned"
}

# Start Hardhat node (unless already running)
start_hardhat() {
  if check_port_availability 8545; then
    log "Starting Hardhat node..."
    cd "$ROOT_DIR/packages/contracts"
    pnpm hardhat > "$ROOT_DIR/logs/core-hardhat.log" 2>&1 &
    HARDHAT_PID=$!
    echo $HARDHAT_PID >> "$ROOT_DIR/logs/core-pids.txt"
    
    # Wait for node to be ready
    sleep 5
    success "Hardhat node started with PID: $HARDHAT_PID"
    echo -e "${CYAN}Hardhat node: http://localhost:8545/${NC}"
  else
    success "Hardhat node already running on port 8545"
  fi
}

# Deploy contracts (only if needed)
deploy_contracts() {
  log "Deploying contracts..."
  cd "$ROOT_DIR/packages/contracts"
  
  # Check if contracts are already deployed by trying to get ETSToken
  if npx hardhat run --network localhost -c "
    const { ethers } = require('hardhat');
    async function check() {
      try {
        await ethers.getContractAt('ETSToken', '0xA51c1fc2f0D1a1b8494Ed1FE312d7C3a78Ed91C0');
        console.log('CONTRACTS_EXIST');
      } catch(e) {
        console.log('CONTRACTS_MISSING');
      }
    }
    check();
  " 2>/dev/null | grep -q "CONTRACTS_EXIST"; then
    success "Contracts already deployed"
  else
    log "Deploying fresh contracts..."
    # First deploy mocks for localhost
    cd "$ROOT_DIR/packages/contracts"
    pnpm exec hardhat deploy --tags MockZoraFactory --network localhost > "$ROOT_DIR/logs/core-mocks-deploy.log" 2>&1
    if [ $? -eq 0 ]; then
      success "Mock contracts deployed successfully"
    else
      error "Mock deployment failed. Check logs/core-mocks-deploy.log"
      exit 1
    fi
    
    # Then deploy core contracts
    pnpm run deploy-all --network localhost > "$ROOT_DIR/logs/core-contracts-deploy.log" 2>&1
    if [ $? -eq 0 ]; then
      success "Core contracts deployed successfully"
    else
      error "Contract deployment failed. Check logs/core-contracts-deploy.log"
      exit 1
    fi
  fi
}

# Start Event Processor
start_event_processor() {
  if check_port_availability 3002; then
    log "Starting Event Processor..."
    cd "$ROOT_DIR/apps/event-processor"
    
    # Set environment for localhost testing
    export NODE_ENV=development
    export BLOCKCHAIN_RPC_URL=http://localhost:8545
    export OFFCHAIN_API_URL=http://localhost:4000
    
    bun src/index.ts > "$ROOT_DIR/logs/core-event-processor.log" 2>&1 &
    EVENT_PROCESSOR_PID=$!
    echo $EVENT_PROCESSOR_PID >> "$ROOT_DIR/logs/core-pids.txt"
    
    sleep 3
    if ps -p $EVENT_PROCESSOR_PID > /dev/null; then
      success "Event Processor started with PID: $EVENT_PROCESSOR_PID"
      echo -e "${CYAN}Event Processor: Running (no web interface)${NC}"
    else
      error "Event Processor failed to start. Check logs/core-event-processor.log"
      exit 1
    fi
  else
    error "Port 3002 is in use (needed for Event Processor)"
    exit 1
  fi
}

# Start Offchain API
start_offchain_api() {
  if check_port_availability 4000; then
    log "Starting Offchain API..."
    cd "$ROOT_DIR/apps/offchain-api"
    
    # Set environment for localhost testing
    export NODE_ENV=development
    
    pnpm run dev > "$ROOT_DIR/logs/core-offchain-api.log" 2>&1 &
    API_PID=$!
    echo $API_PID >> "$ROOT_DIR/logs/core-pids.txt"
    
    sleep 3
    if ps -p $API_PID > /dev/null; then
      success "Offchain API started with PID: $API_PID"
      echo -e "${CYAN}Offchain API: http://localhost:4000/${NC}"
    else
      error "Offchain API failed to start. Check logs/core-offchain-api.log"
      exit 1
    fi
  else
    error "Port 4000 is in use (needed for Offchain API)"
    exit 1
  fi
}

# Display stack status
display_stack_status() {
  echo ""
  echo -e "${GREEN}=== ETS Core Stack Ready for Testing ===${NC}"
  echo ""
  echo -e "${CYAN}Services running:${NC}"
  echo -e "  • Hardhat node: ${YELLOW}http://localhost:8545/${NC}"
  echo -e "  • Offchain API: ${YELLOW}http://localhost:4000/${NC}"
  echo -e "  • Event Processor: ${YELLOW}Running (monitoring events)${NC}"
  echo ""
  echo -e "${CYAN}Key contract addresses:${NC}"
  echo -e "  • ETSToken: ${YELLOW}0xA51c1fc2f0D1a1b8494Ed1FE312d7C3a78Ed91C0${NC}"
  echo -e "  • ETS Core: ${YELLOW}0x4A679253410272dd5232B3Ff7cF5dbB88f295319${NC}"
  echo ""
  echo -e "${CYAN}Ready for TAG creation testing!${NC}"
  echo ""
}

# Cleanup function
cleanup() {
  log "Cleaning up core stack..."
  if [ -f "$ROOT_DIR/logs/core-pids.txt" ]; then
    for pid in $(cat "$ROOT_DIR/logs/core-pids.txt"); do
      kill $pid 2>/dev/null || true
    done
  fi
  rm -f "$ROOT_DIR/logs/core-pids.txt"
  success "Core stack stopped"
}

# Main execution
print_banner

# Initialize PID tracking
rm -f "$ROOT_DIR/logs/core-pids.txt"
touch "$ROOT_DIR/logs/core-pids.txt"

clean_logs
start_hardhat
deploy_contracts
start_offchain_api
start_event_processor

display_stack_status

# Set up cleanup trap
trap cleanup EXIT INT TERM

log "Press Ctrl+C to stop the core stack"
log "Log files are in $ROOT_DIR/logs/core-*.log"

# Keep script running
wait