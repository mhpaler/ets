#!/bin/bash

# Restart just the Temporal Processor (not the infrastructure)
# Useful when you make changes to workflows, activities, or event listeners

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

log() {
  echo -e "${BLUE}[$(date +"%T")]${NC} $1"
}

success() {
  echo -e "${GREEN}[$(date +"%T")]${NC} ✓ $1"
}

warn() {
  echo -e "${YELLOW}[$(date +"%T")]${NC} ⚠ $1"
}

error() {
  echo -e "${RED}[$(date +"%T")]${NC} ✗ $1"
}

print_banner() {
  echo ""
  echo -e "${CYAN}╔════════════════════════════════════════╗${NC}"
  echo -e "${CYAN}║      Temporal Processor Restart        ║${NC}"
  echo -e "${CYAN}║      Fast Development Iteration        ║${NC}"
  echo -e "${CYAN}╚════════════════════════════════════════╝${NC}"
  echo ""
}

# Check if Temporal infrastructure is running
check_temporal_infrastructure() {
  log "Checking Temporal infrastructure..."
  
  if ! curl -s http://localhost:8080 >/dev/null 2>&1; then
    error "Temporal infrastructure is not running"
    error "Please start it first with: ./scripts/start-temporal-infrastructure.sh"
    exit 1
  fi
  
  success "Temporal infrastructure is ready"
}

# Find and kill existing Temporal Processor
kill_existing_processor() {
  log "Looking for existing Temporal Processor processes..."
  
  # Look for processes in the temporal-processor directory
  local pids=$(ps aux | grep -v grep | grep "temporal-processor" | grep -E "(pnpm|node|bun)" | awk '{print $2}')
  
  if [ -n "$pids" ]; then
    log "Found running Temporal Processor processes: $pids"
    echo $pids | xargs kill -TERM 2>/dev/null || true
    
    # Wait a moment for graceful shutdown
    sleep 2
    
    # Force kill if still running
    local still_running=$(ps aux | grep -v grep | grep "temporal-processor" | grep -E "(pnpm|node|bun)" | awk '{print $2}')
    if [ -n "$still_running" ]; then
      warn "Processes still running, force killing: $still_running"
      echo $still_running | xargs kill -KILL 2>/dev/null || true
    fi
    
    success "Stopped existing Temporal Processor"
  else
    log "No existing Temporal Processor processes found"
  fi
}

# Start the Temporal Processor
start_processor() {
  log "Starting Temporal Processor..."
  cd "$ROOT_DIR/apps/temporal-processor"
  
  # Set environment variables for localhost
  export NODE_ENV=development
  export CHAIN_ID=31337
  export RPC_URL=http://localhost:8545
  export OFFCHAIN_API_URL=http://localhost:3000
  export TEMPORAL_SERVER_URL=localhost:7233
  export TEMPORAL_NAMESPACE=default
  export TEMPORAL_TASK_QUEUE=ets-workflows
  
  # Create logs directory if it doesn't exist
  mkdir -p "$ROOT_DIR/logs"
  
  # Start the processor with proper PATH
  if command -v pnpm >/dev/null 2>&1; then
    log "Starting with pnpm..."
    PATH="/Users/User/.nvm/versions/node/v20.19.4/bin:$PATH" pnpm run dev > "$ROOT_DIR/logs/temporal-processor.log" 2>&1 &
  elif command -v npm >/dev/null 2>&1; then
    log "Starting with npm..."
    PATH="/Users/User/.nvm/versions/node/v20.19.4/bin:$PATH" npm run dev > "$ROOT_DIR/logs/temporal-processor.log" 2>&1 &
  else
    error "No package manager found (pnpm/npm)"
    exit 1
  fi
  
  local processor_pid=$!
  echo $processor_pid > "$ROOT_DIR/logs/temporal-processor.pid"
  
  # Verify it started
  sleep 3
  if ps -p $processor_pid > /dev/null; then
    success "Temporal Processor started with PID: $processor_pid"
    
    # Show recent logs
    echo ""
    echo -e "${CYAN}Recent logs:${NC}"
    tail -10 "$ROOT_DIR/logs/temporal-processor.log" | sed 's/^/  /'
    
    echo ""
    echo -e "${GREEN}Temporal Processor is running!${NC}"
    echo "  • PID: $processor_pid"
    echo "  • Logs: $ROOT_DIR/logs/temporal-processor.log"
    echo "  • Temporal UI: http://localhost:8080"
    echo ""
    echo "To stop: kill $processor_pid"
    echo "To follow logs: tail -f $ROOT_DIR/logs/temporal-processor.log"
    
  else
    error "Temporal Processor failed to start"
    echo ""
    echo "Recent logs:"
    tail -20 "$ROOT_DIR/logs/temporal-processor.log" | sed 's/^/  /'
    exit 1
  fi
}

# Display monitoring info
show_monitoring_info() {
  echo ""
  echo -e "${CYAN}Development Workflow:${NC}"
  echo "  1. Make changes to workflows/activities"
  echo "  2. Run this script again to restart: $0"
  echo "  3. Test workflows via Temporal UI or by creating test events"
  echo ""
  echo -e "${CYAN}Useful Commands:${NC}"
  echo "  • View logs: ${GREEN}tail -f $ROOT_DIR/logs/temporal-processor.log${NC}"
  echo "  • Temporal UI: ${GREEN}open http://localhost:8080${NC}"
  echo "  • Check infrastructure: ${GREEN}./scripts/check-temporal-infrastructure.sh${NC}"
  echo ""
}

# Main execution
print_banner
check_temporal_infrastructure
kill_existing_processor
start_processor
show_monitoring_info

success "Temporal Processor restart complete!"