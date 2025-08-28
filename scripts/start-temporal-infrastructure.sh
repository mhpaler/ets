#!/bin/bash

# Start script for Temporal infrastructure
# Use this to start the infrastructure if it's been stopped

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
INFRA_DIR="$ROOT_DIR/infrastructure/temporal"

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

# Check if Docker is running
check_docker() {
  if ! docker info >/dev/null 2>&1; then
    error "Docker is not running. Please start Docker first."
    exit 1
  fi
}

# Start Temporal infrastructure
start_infrastructure() {
  log "Starting Temporal infrastructure..."
  
  cd "$INFRA_DIR"
  
  # Use docker compose up -d which handles both missing and stopped containers
  docker compose up -d
  
  if [ $? -eq 0 ]; then
    success "Temporal infrastructure started"
  else
    error "Failed to start Temporal infrastructure"
    docker compose logs --tail 50
    exit 1
  fi
}

# Wait for services to be ready
wait_for_ready() {
  log "Waiting for Temporal services to be ready..."
  
  local max_attempts=60
  local attempt=1
  
  while [ $attempt -le $max_attempts ]; do
    # Quick check if services are responding
    if curl -s http://localhost:8080 >/dev/null 2>&1; then
      # Test gRPC connection
      node -e "
        const { Client } = require('@temporalio/client');
        (async () => {
          try {
            const client = new Client({
              connection: { address: 'localhost:7233' },
              namespace: 'default'
            });
            await client.connection.close();
            process.exit(0);
          } catch (error) {
            process.exit(1);
          }
        })();
      " >/dev/null 2>&1
      
      if [ $? -eq 0 ]; then
        success "Temporal infrastructure is ready!"
        return 0
      fi
    fi
    
    if [ $((attempt % 10)) -eq 0 ]; then
      log "Still waiting... ($attempt/$max_attempts)"
    fi
    
    sleep 2
    attempt=$((attempt + 1))
  done
  
  error "Temporal failed to become ready"
  return 1
}

# Display status
display_status() {
  echo ""
  echo -e "${GREEN}Temporal Infrastructure Status:${NC}"
  docker ps --filter "label=temporal.infrastructure=true" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
  echo ""
  echo "Services:"
  echo -e "  • ${CYAN}Temporal Server${NC}: http://localhost:7233"
  echo -e "  • ${CYAN}Temporal UI${NC}:     http://localhost:8080"
  echo ""
}

# Main execution
check_docker
start_infrastructure
wait_for_ready
display_status

success "Temporal infrastructure is running!"