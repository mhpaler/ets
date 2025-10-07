#!/usr/bin/env bash

set -e

# ========================================
# ETS Unified Stack Launcher
# ========================================
# Simple front-end for complex stack management
# Usage: ./start-stack.sh [--network local|staging|production] [--services all|core|temporal]
# ========================================

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Default values
NETWORK="local"
SERVICES="all"
SHOW_HELP=false

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --network|-n)
      NETWORK="$2"
      shift 2
      ;;
    --services|-s)
      SERVICES="$2"
      shift 2
      ;;
    --help|-h)
      SHOW_HELP=true
      shift
      ;;
    *)
      echo -e "${RED}Unknown option: $1${NC}"
      echo "Use --help for usage information"
      exit 1
      ;;
  esac
done

# Show help if requested
if [ "$SHOW_HELP" = true ]; then
  echo ""
  echo -e "${CYAN}ETS Unified Stack Launcher${NC}"
  echo ""
  echo "Usage: $0 [OPTIONS]"
  echo ""
  echo "Options:"
  echo "  --network, -n    Network to use: local, staging, production (default: local)"
  echo "  --services, -s   Services to start: all, core, temporal (default: all)"
  echo "  --help, -h       Show this help message"
  echo ""
  echo "Examples:"
  echo "  $0                           # Local development (Hardhat + all services)"
  echo "  $0 -n staging                # Local services + Base Sepolia"
  echo "  $0 -n staging -s temporal    # Only Temporal against Base Sepolia"
  echo "  $0 -n production -s temporal # Temporal for production monitoring"
  echo ""
  echo "Network Details:"
  echo "  local      - Hardhat local node (chain 31337)"
  echo "  staging    - Base Sepolia testnet (chain 84532)"
  echo "  production - Base mainnet (chain 8453)"
  echo ""
  echo "Service Groups:"
  echo "  all      - Full stack (Hardhat/Temporal/Explorer)"
  echo "  core     - Core services (Hardhat/Temporal)"
  echo "  temporal - Only Temporal processor & worker"
  echo ""
  exit 0
fi

# Validate network option
if [[ ! "$NETWORK" =~ ^(local|staging|production)$ ]]; then
  echo -e "${RED}Invalid network: $NETWORK${NC}"
  echo "Valid options: local, staging, production"
  exit 1
fi

# Validate services option
if [[ ! "$SERVICES" =~ ^(all|core|temporal)$ ]]; then
  echo -e "${RED}Invalid services: $SERVICES${NC}"
  echo "Valid options: all, core, temporal"
  exit 1
fi

# Directory setup
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

# Auto-detect if we're in VS Code terminal
if [ "$TERM_PROGRAM" = "vscode" ]; then
  USE_SEPARATE_LOG_TERMINAL=false  # VS Code can't open separate Terminal.app windows
else
  USE_SEPARATE_LOG_TERMINAL=true   # Native terminal can open separate log window
fi

# Function to open a separate terminal for logs
open_logs_terminal() {
  if [ "$USE_SEPARATE_LOG_TERMINAL" != "true" ]; then
    if [ "$TERM_PROGRAM" = "vscode" ]; then
      echo -e "${YELLOW}Running in VS Code terminal - logs will appear inline (no separate window)${NC}"
    else
      echo -e "${YELLOW}Using main terminal for logs (separate log terminal disabled)${NC}"
    fi
    return
  fi

  echo -e "${BLUE}Opening a separate terminal window for logs...${NC}"

  # Create placeholder log files for all services
  touch "$ROOT_DIR/logs/hardhat.log"
  touch "$ROOT_DIR/logs/deploy.log"
  touch "$ROOT_DIR/logs/temporal-processor.log"
  touch "$ROOT_DIR/logs/temporal-worker.log"
  touch "$ROOT_DIR/logs/explorer.log"

  # Create a temporary script file for the new terminal
  LOG_SCRIPT="$SCRIPT_DIR/view-logs.sh"

  # Write a properly escaped script that ensures color codes are interpreted
  cat << 'EOF' > "$LOG_SCRIPT"
#!/bin/bash
cd "$1"
echo -e "\033[1;36m=== ETS Stack Logs ===\033[0m\n"
# Use proper escaping for ANSI color codes
tail -f logs/*.log | grep --line-buffered "" |
  sed -e $'s/.*hardhat.log.*/\033[0;36m[HARDHAT]\033[0m &/' \
      -e $'s/.*deploy.log.*/\033[0;32m[DEPLOY]\033[0m &/' \
      -e $'s/.*temporal-processor.log.*/\033[0;35m[TEMPORAL-PROCESSOR]\033[0m &/' \
      -e $'s/.*temporal-worker.log.*/\033[1;34m[TEMPORAL-WORKER]\033[0m &/' \
      -e $'s/.*explorer.log.*/\033[0;33m[EXPLORER]\033[0m &/'
EOF

  # Make the script executable
  chmod +x "$LOG_SCRIPT"

  # Open a new terminal with the script
  if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS - use osascript to open a new terminal
    osascript -e "tell app \"Terminal\" to do script \"$LOG_SCRIPT '$ROOT_DIR'\"" > /dev/null 2>&1
  elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux - use appropriate terminal emulator based on environment
    if [ -n "$GNOME_TERMINAL_SERVICE" ]; then
      gnome-terminal -- "$LOG_SCRIPT" "$ROOT_DIR" &
    elif command -v xfce4-terminal > /dev/null; then
      xfce4-terminal -e "$LOG_SCRIPT '$ROOT_DIR'" &
    elif command -v konsole > /dev/null; then
      konsole -e "$LOG_SCRIPT '$ROOT_DIR'" &
    else
      # Fall back to x-terminal-emulator
      x-terminal-emulator -e "$LOG_SCRIPT '$ROOT_DIR'" &
    fi
  else
    echo -e "${YELLOW}Unsupported OS for opening terminal. Please check logs manually in $ROOT_DIR/logs directory.${NC}"
  fi

  sleep 1
  echo -e "${GREEN}✓ Log terminal opened${NC}"
}

# Load environment based on network
load_environment() {
  echo -e "${BLUE}Loading environment for network: $NETWORK${NC}"

  # Load root .env file if it exists (for ALCHEMY_API_KEY, mnemonics, etc)
  if [ -f "$ROOT_DIR/.env" ]; then
    set -a  # Mark variables for export
    source "$ROOT_DIR/.env"
    set +a
  fi

  # Set ENVIRONMENT variable for config package
  export ENVIRONMENT="$NETWORK"

  # Map network names to environments for backward compatibility
  case $NETWORK in
    local)
      export NODE_ENV="development"
      ;;
    staging)
      export NODE_ENV="staging"
      ;;
    production)
      export NODE_ENV="production"
      echo -e "${YELLOW}⚠️  Production mode - be careful!${NC}"
      ;;
  esac
}

# Print banner with network info
print_banner() {
  echo ""
  echo -e "  ${CYAN}███████╗████████╗███████╗${NC}"
  echo -e "  ${CYAN}██╔════╝╚══██╔══╝██╔════╝${NC}"
  echo -e "  ${CYAN}█████╗     ██║   ███████╗${NC}"
  echo -e "  ${CYAN}██╔══╝     ██║   ╚════██║${NC}"
  echo -e "  ${CYAN}███████╗   ██║   ███████║${NC}"
  echo -e "  ${CYAN}╚══════╝   ╚═╝   ╚══════╝${NC}"

  case $NETWORK in
    local)
      echo -e "  ${GREEN}Local Development Mode${NC}"
      echo -e "  Chain: Hardhat (31337)"
      ;;
    staging)
      echo -e "  ${YELLOW}Staging Mode - Base Sepolia${NC}"
      echo -e "  Chain: Base Sepolia (84532)"
      ;;
    production)
      echo -e "  ${RED}Production Mode - Base Mainnet${NC}"
      echo -e "  Chain: Base (8453)"
      ;;
  esac

  echo -e "  Services: ${SERVICES}"
  echo ""
}

# Check Docker (required for Temporal)
check_docker() {
  echo -e "${BLUE}Checking Docker...${NC}"
  if ! docker info >/dev/null 2>&1; then
    echo -e "${RED}Docker is not running.${NC}"
    echo "Please start Docker Desktop and try again."
    exit 1
  fi
  echo -e "${GREEN}✓ Docker is running${NC}"
}

# Check Temporal infrastructure
check_temporal() {
  echo -e "${BLUE}Checking Temporal infrastructure...${NC}"

  if curl -s http://localhost:8080 >/dev/null 2>&1; then
    echo -e "${GREEN}✓ Temporal infrastructure is running${NC}"
    return 0
  fi

  echo -e "${YELLOW}Temporal infrastructure not running${NC}"
  echo "Starting Temporal infrastructure..."

  if [ -f "$SCRIPT_DIR/start-temporal-infrastructure.sh" ]; then
    "$SCRIPT_DIR/start-temporal-infrastructure.sh"
  else
    echo -e "${RED}Cannot find Temporal infrastructure script${NC}"
    exit 1
  fi
}

# Start Hardhat (only for local network)
start_hardhat() {
  if [ "$NETWORK" != "local" ]; then
    echo -e "${YELLOW}Skipping Hardhat (not needed for $NETWORK)${NC}"
    return
  fi

  echo -e "${BLUE}Starting Hardhat node...${NC}"
  cd "$ROOT_DIR/packages/contracts"

  # Kill any existing Hardhat process
  pkill -f "hardhat node" 2>/dev/null || true
  sleep 1

  # Start Hardhat in background
  if [ "$USE_SEPARATE_LOG_TERMINAL" = "true" ]; then
    bash -c "source ~/.nvm/nvm.sh && nvm use 22 && pnpm hardhat node" > "$ROOT_DIR/logs/hardhat.log" 2>&1 &
  else
    bash -c "source ~/.nvm/nvm.sh && nvm use 22 && pnpm hardhat node" 2>&1 | tee "$ROOT_DIR/logs/hardhat.log" &
  fi
  HARDHAT_PID=$!

  # Wait for it to start
  sleep 5

  if ps -p $HARDHAT_PID > /dev/null; then
    echo -e "${GREEN}✓ Hardhat started (PID: $HARDHAT_PID)${NC}"

    # Deploy contracts if local
    echo -e "${BLUE}Deploying contracts...${NC}"
    bash -c "source ~/.nvm/nvm.sh && nvm use 22 && pnpm deploy:localhost" > "$ROOT_DIR/logs/deploy.log" 2>&1
    echo -e "${GREEN}✓ Contracts deployed${NC}"
  else
    echo -e "${RED}Failed to start Hardhat${NC}"
    cat "$ROOT_DIR/logs/hardhat.log"
    exit 1
  fi
}

# Start Temporal Processor
start_temporal_processor() {
  echo -e "${BLUE}Starting Temporal Processor...${NC}"
  cd "$ROOT_DIR/apps/temporal-processor"

  # Kill any existing processes
  pkill -f "tsx.*worker\.ts" 2>/dev/null || true
  pkill -f "tsx.*src/index\.ts" 2>/dev/null || true
  sleep 2

  # Configure based on network
  case $NETWORK in
    local)
      export TEMPORAL_TASK_QUEUE="ets-workflows-local"
      ;;
    staging)
      export TEMPORAL_TASK_QUEUE="ets-workflows-local-staging"
      export CHAIN_ID=84532
      export HD_WALLET_POSITION=2

      # Ensure we have the staging mnemonic from root .env
      if [ -n "$STAGING_MNEMONIC" ]; then
        export MNEMONIC="$STAGING_MNEMONIC"
        echo -e "${GREEN}  Using staging mnemonic${NC}"
      else
        echo -e "${RED}  Warning: STAGING_MNEMONIC not found in .env${NC}"
      fi

      # Ensure we have Alchemy API key
      if [ -n "$ALCHEMY_API_KEY" ]; then
        echo -e "${GREEN}  Using Alchemy API key${NC}"
      else
        echo -e "${RED}  Warning: ALCHEMY_API_KEY not found in .env${NC}"
      fi
      ;;
    production)
      export TEMPORAL_TASK_QUEUE="ets-workflows-production"
      echo -e "${YELLOW}⚠️  Using production task queue${NC}"
      # Ensure we have the production mnemonic from root .env
      if [ -n "$PRODUCTION_MNEMONIC" ]; then
        export MNEMONIC="$PRODUCTION_MNEMONIC"
      fi
      ;;
  esac

  # Debug: Show what's set
  echo -e "${BLUE}Environment variables set:${NC}"
  echo "  ENVIRONMENT=$ENVIRONMENT"
  echo "  NODE_ENV=$NODE_ENV"
  echo "  CHAIN_ID=$CHAIN_ID"
  echo "  TEMPORAL_TASK_QUEUE=$TEMPORAL_TASK_QUEUE"
  echo "  MNEMONIC=${MNEMONIC:+[SET]}"
  echo "  ALCHEMY_API_KEY=${ALCHEMY_API_KEY:+[SET]}"
  echo ""

  # Export all variables for the subprocess
  export ENVIRONMENT=$ENVIRONMENT
  export NODE_ENV=$NODE_ENV
  export CHAIN_ID=$CHAIN_ID
  export TEMPORAL_TASK_QUEUE=$TEMPORAL_TASK_QUEUE
  export MNEMONIC=$MNEMONIC
  export ALCHEMY_API_KEY=$ALCHEMY_API_KEY
  export HD_WALLET_POSITION=$HD_WALLET_POSITION
  export TEMPORAL_SERVER_URL=localhost:7233

  # Start event listener
  if [ "$USE_SEPARATE_LOG_TERMINAL" = "true" ]; then
    pnpm dev > "$ROOT_DIR/logs/temporal-processor.log" 2>&1 &
  else
    pnpm dev 2>&1 | tee "$ROOT_DIR/logs/temporal-processor.log" &
  fi
  PROCESSOR_PID=$!

  # Start worker
  if [ "$USE_SEPARATE_LOG_TERMINAL" = "true" ]; then
    pnpm worker > "$ROOT_DIR/logs/temporal-worker.log" 2>&1 &
  else
    pnpm worker 2>&1 | tee "$ROOT_DIR/logs/temporal-worker.log" &
  fi
  WORKER_PID=$!

  sleep 5

  if ps -p $PROCESSOR_PID > /dev/null && ps -p $WORKER_PID > /dev/null; then
    echo -e "${GREEN}✓ Temporal Processor started${NC}"
    echo "  Task Queue: $TEMPORAL_TASK_QUEUE"
    echo ""
    echo -e "${CYAN}Streaming logs...${NC}"
    echo ""
  else
    echo -e "${RED}Failed to start Temporal services${NC}"
    exit 1
  fi
}

# Start Explorer (only for 'all' services)
start_explorer() {
  if [ "$SERVICES" != "all" ]; then
    return
  fi

  echo -e "${BLUE}Starting Explorer UI...${NC}"
  cd "$ROOT_DIR/apps/app"

  # Configure for the right network
  export NEXT_PUBLIC_ETS_ENVIRONMENT="$NETWORK"

  if [ "$USE_SEPARATE_LOG_TERMINAL" = "true" ]; then
    pnpm run dev > "$ROOT_DIR/logs/explorer.log" 2>&1 &
  else
    pnpm run dev 2>&1 | tee "$ROOT_DIR/logs/explorer.log" &
  fi
  EXPLORER_PID=$!

  sleep 3

  if ps -p $EXPLORER_PID > /dev/null; then
    echo -e "${GREEN}✓ Explorer UI started at http://localhost:3001${NC}"
  else
    echo -e "${RED}Failed to start Explorer${NC}"
    exit 1
  fi
}

# Main execution flow
main() {
  print_banner
  load_environment

  # Create logs directory
  mkdir -p "$ROOT_DIR/logs"

  # Open separate terminal for logs (if not in VS Code)
  open_logs_terminal

  # Check requirements
  check_docker
  check_temporal

  # Start services based on configuration
  case $SERVICES in
    all)
      [ "$NETWORK" = "local" ] && start_hardhat
      start_temporal_processor
      start_explorer
      ;;
    core)
      [ "$NETWORK" = "local" ] && start_hardhat
      start_temporal_processor
      ;;
    temporal)
      start_temporal_processor
      ;;
  esac

  echo ""
  echo -e "${GREEN}═══════════════════════════════════════════${NC}"
  echo -e "${GREEN}Stack started successfully!${NC}"
  echo -e "${GREEN}═══════════════════════════════════════════${NC}"
  echo ""
  echo "Network: $NETWORK"
  echo "Services: $SERVICES"
  echo "Logs: $ROOT_DIR/logs/"
  echo ""

  # Show relevant URLs
  if [ "$NETWORK" = "local" ] && [ "$SERVICES" != "temporal" ]; then
    echo "Hardhat: http://localhost:8545"
  fi
  if [ "$SERVICES" = "all" ]; then
    echo "Explorer: http://localhost:3001"
  fi
  echo "Temporal UI: http://localhost:8080"
  echo ""
  echo "Press Ctrl+C to stop all services"
}

# Cleanup on exit
cleanup() {
  echo -e "\n${YELLOW}Stopping services...${NC}"

  # Kill all started processes
  pkill -f "hardhat node" 2>/dev/null || true
  pkill -f "tsx.*worker\.ts" 2>/dev/null || true
  pkill -f "tsx.*src/index\.ts" 2>/dev/null || true
  pkill -f "next dev" 2>/dev/null || true

  echo -e "${GREEN}Services stopped${NC}"
}

trap cleanup EXIT INT TERM

# Run main function
main

# Keep script running
wait