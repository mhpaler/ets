#!/bin/bash

# Stop script for Temporal infrastructure
# This stops the infrastructure but preserves data

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
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

# Stop infrastructure
stop_infrastructure() {
  log "Stopping Temporal infrastructure..."
  
  cd "$INFRA_DIR"
  
  # Check if any containers are running
  if docker compose ps --services | grep -q .; then
    docker compose stop
    success "Temporal infrastructure stopped"
    echo ""
    warn "Data has been preserved. To start again: ./scripts/start-temporal-infrastructure.sh"
    warn "To completely remove (including data): docker compose -f $INFRA_DIR/docker-compose.yml down -v"
  else
    warn "No Temporal infrastructure containers are running"
  fi
}

# Main execution
stop_infrastructure