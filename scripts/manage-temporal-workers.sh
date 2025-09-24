#!/bin/bash

# Script to manage Temporal worker processes

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Helper functions
log() { echo -e "${GREEN}[WORKERS]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
success() { echo -e "${GREEN}✓${NC} $1"; }

# Function to check for running workers
check_workers() {
  local worker_count=$(pgrep -f "tsx.*worker\.ts" 2>/dev/null | wc -l | tr -d ' ')
  local processor_count=$(pgrep -f "tsx.*src/index\.ts" 2>/dev/null | wc -l | tr -d ' ')

  if [ "$worker_count" -gt 0 ]; then
    log "Found $worker_count Temporal worker process(es) running:"
    pgrep -f "tsx.*worker\.ts" | while read pid; do
      echo "  - PID: $pid ($(ps -p $pid -o comm= 2>/dev/null || echo 'unknown'))"
    done
  else
    log "No Temporal worker processes found"
  fi

  if [ "$processor_count" -gt 0 ]; then
    log "Found $processor_count Temporal processor process(es) running:"
    pgrep -f "tsx.*src/index\.ts" | while read pid; do
      echo "  - PID: $pid ($(ps -p $pid -o comm= 2>/dev/null || echo 'unknown'))"
    done
  else
    log "No Temporal processor processes found"
  fi
}

# Function to stop all workers
stop_workers() {
  log "Stopping all Temporal worker processes..."

  # Stop worker processes
  local worker_pids=$(pgrep -f "tsx.*worker\.ts" 2>/dev/null || true)
  if [ -n "$worker_pids" ]; then
    echo "$worker_pids" | while read pid; do
      log "Stopping worker PID: $pid"
      kill -TERM "$pid" 2>/dev/null || true
    done

    # Wait a moment
    sleep 2

    # Force kill any remaining
    worker_pids=$(pgrep -f "tsx.*worker\.ts" 2>/dev/null || true)
    if [ -n "$worker_pids" ]; then
      warn "Force killing remaining workers..."
      echo "$worker_pids" | while read pid; do
        kill -9 "$pid" 2>/dev/null || true
      done
    fi
    success "Worker processes stopped"
  else
    log "No worker processes to stop"
  fi

  # Stop processor processes
  local processor_pids=$(pgrep -f "tsx.*src/index\.ts" 2>/dev/null || true)
  if [ -n "$processor_pids" ]; then
    echo "$processor_pids" | while read pid; do
      log "Stopping processor PID: $pid"
      kill -TERM "$pid" 2>/dev/null || true
    done

    # Wait a moment
    sleep 2

    # Force kill any remaining
    processor_pids=$(pgrep -f "tsx.*src/index\.ts" 2>/dev/null || true)
    if [ -n "$processor_pids" ]; then
      warn "Force killing remaining processors..."
      echo "$processor_pids" | while read pid; do
        kill -9 "$pid" 2>/dev/null || true
      done
    fi
    success "Processor processes stopped"
  else
    log "No processor processes to stop"
  fi
}

# Function to restart workers (useful for picking up code changes)
restart_workers() {
  log "Restarting Temporal workers..."

  # First stop existing workers
  stop_workers

  # Give everything a moment to clean up
  sleep 1

  # Check if local stack is running
  if ! pgrep -f "hardhat node" > /dev/null 2>&1; then
    error "Hardhat node is not running. Start the local stack first with ./scripts/start-local-stack.sh"
    exit 1
  fi

  # Navigate to temporal-processor directory
  cd "$(dirname "$0")/../apps/temporal-processor"

  # Start the processor
  log "Starting Temporal processor..."
  PATH="/Users/User/.nvm/versions/node/v20.19.4/bin:$PATH" tsx --watch src/index.ts > ../../logs/temporal-processor.log 2>&1 &
  local processor_pid=$!
  log "Started processor with PID: $processor_pid"

  # Start the worker
  log "Starting Temporal worker..."
  PATH="/Users/User/.nvm/versions/node/v20.19.4/bin:$PATH" tsx --watch src/worker.ts > ../../logs/temporal-worker.log 2>&1 &
  local worker_pid=$!
  log "Started worker with PID: $worker_pid"

  # Wait a moment and check if they're still running
  sleep 3

  if ps -p $processor_pid > /dev/null 2>&1 && ps -p $worker_pid > /dev/null 2>&1; then
    success "Temporal workers restarted successfully"
    log "Check logs at:"
    echo "  - logs/temporal-processor.log"
    echo "  - logs/temporal-worker.log"
  else
    error "Workers failed to start. Check the logs for details."
    exit 1
  fi
}

# Main command handling
case "${1:-}" in
  status|check)
    check_workers
    ;;
  stop)
    stop_workers
    ;;
  restart)
    restart_workers
    ;;
  *)
    echo "Temporal Worker Management"
    echo ""
    echo "Usage: $0 {status|stop|restart}"
    echo ""
    echo "Commands:"
    echo "  status   Check status of worker processes"
    echo "  stop     Stop all worker processes"
    echo "  restart  Stop and restart worker processes"
    echo ""
    echo "Examples:"
    echo "  $0 status   # Check if workers are running"
    echo "  $0 stop     # Stop all workers"
    echo "  $0 restart  # Restart workers (picks up code changes)"
    echo ""
    exit 1
    ;;
esac