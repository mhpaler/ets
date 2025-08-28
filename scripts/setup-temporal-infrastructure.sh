#!/bin/bash

# Setup script for Temporal infrastructure
# This only needs to be run once to set up the persistent Temporal infrastructure

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

print_banner() {
  echo ""
  echo -e "${CYAN}╔════════════════════════════════════════╗${NC}"
  echo -e "${CYAN}║   Temporal Infrastructure Setup        ║${NC}"
  echo -e "${CYAN}║   Persistent Workflow Engine           ║${NC}"
  echo -e "${CYAN}╚════════════════════════════════════════╝${NC}"
  echo ""
}

# Check if Docker is running
check_docker() {
  log "Checking Docker status..."
  if ! docker info >/dev/null 2>&1; then
    error "Docker is not running."
    
    if [[ "$OSTYPE" == "darwin"* ]]; then
      error "Please start Docker Desktop and try again."
      # Try to open Docker Desktop on macOS
      if [ -d "/Applications/Docker.app" ]; then
        warn "Attempting to start Docker Desktop..."
        open -a Docker
        
        # Wait for Docker to start
        attempt=0
        while [ $attempt -lt 60 ]; do
          if docker info >/dev/null 2>&1; then
            success "Docker Desktop started successfully!"
            return 0
          fi
          attempt=$((attempt+1))
          sleep 1
          if [ $((attempt % 10)) -eq 0 ]; then
            log "Still waiting for Docker to start... ($attempt seconds)"
          fi
        done
        error "Timed out waiting for Docker to start."
        exit 1
      fi
    fi
    exit 1
  fi
  success "Docker is running"
}

# Check for existing Temporal infrastructure
check_existing_infrastructure() {
  log "Checking for existing Temporal infrastructure..."
  
  local containers=$(docker ps -a --filter "label=temporal.infrastructure=true" --format "{{.Names}}" 2>/dev/null | wc -l | tr -d ' ')
  
  if [ "$containers" -gt 0 ]; then
    warn "Found existing Temporal infrastructure containers"
    echo ""
    docker ps -a --filter "label=temporal.infrastructure=true" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    echo ""
    
    read -p "Do you want to remove existing infrastructure and start fresh? (y/n) " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
      log "Removing existing infrastructure..."
      cd "$INFRA_DIR"
      docker compose down -v  # -v removes volumes too
      success "Existing infrastructure removed"
    else
      log "Keeping existing infrastructure"
      exit 0
    fi
  else
    success "No existing Temporal infrastructure found"
  fi
}

# Create infrastructure directory if it doesn't exist
setup_directories() {
  log "Setting up infrastructure directories..."
  
  if [ ! -d "$INFRA_DIR" ]; then
    error "Infrastructure directory not found at $INFRA_DIR"
    error "Please ensure the infrastructure/temporal directory exists with docker-compose.yml"
    exit 1
  fi
  
  cd "$INFRA_DIR"
  success "Infrastructure directory ready"
}

# Pull Docker images
pull_images() {
  log "Pulling required Docker images (this may take a while)..."
  
  docker compose pull
  
  if [ $? -eq 0 ]; then
    success "All Docker images pulled successfully"
  else
    error "Failed to pull Docker images"
    exit 1
  fi
}

# Initialize Temporal infrastructure
initialize_infrastructure() {
  log "Initializing Temporal infrastructure..."
  
  # Start services
  docker compose up -d
  
  if [ $? -ne 0 ]; then
    error "Failed to start Temporal infrastructure"
    docker compose logs
    exit 1
  fi
  
  success "Temporal infrastructure containers started"
  
  # Wait for services to be ready
  log "Waiting for Temporal services to be ready (this may take 2-3 minutes)..."
  
  local max_attempts=90  # 3 minutes timeout
  local attempt=1
  
  while [ $attempt -le $max_attempts ]; do
    # Check if Temporal UI is accessible
    if curl -s http://localhost:8080 >/dev/null 2>&1; then
      log "Temporal UI is responding, checking gRPC endpoint..."
      
      # Test gRPC connection using a simple Node.js script
      node -e "
        const { Client } = require('@temporalio/client');
        (async () => {
          try {
            const client = new Client({
              connection: { address: 'localhost:7233' },
              namespace: 'default'
            });
            await client.connection.close();
            console.log('SUCCESS');
            process.exit(0);
          } catch (error) {
            process.exit(1);
          }
        })();
      " >/dev/null 2>&1
      
      if [ $? -eq 0 ]; then
        success "Temporal infrastructure is ready!"
        break
      fi
    fi
    
    if [ $((attempt % 15)) -eq 0 ]; then
      log "Still waiting for Temporal to be ready... (attempt $attempt/$max_attempts)"
    fi
    
    sleep 2
    attempt=$((attempt + 1))
  done
  
  if [ $attempt -gt $max_attempts ]; then
    error "Temporal infrastructure failed to start within timeout"
    error "Checking container logs..."
    docker compose logs --tail 50
    exit 1
  fi
}

# Display infrastructure information
display_info() {
  echo ""
  echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
  echo -e "${GREEN}   Temporal Infrastructure Setup Complete!                  ${NC}"
  echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
  echo ""
  echo "Services running:"
  echo -e "  • ${CYAN}Temporal Server${NC}:    http://localhost:7233 (gRPC)"
  echo -e "  • ${CYAN}Temporal UI${NC}:        http://localhost:8080"
  echo -e "  • ${CYAN}PostgreSQL${NC}:         localhost:5433"
  echo ""
  echo "Infrastructure containers:"
  docker ps --filter "label=temporal.infrastructure=true" --format "table {{.Names}}\t{{.Status}}"
  echo ""
  echo -e "${YELLOW}Next steps:${NC}"
  echo "  1. The infrastructure will persist between application restarts"
  echo "  2. To start your application stack: ./scripts/start-local-stack.sh --core"
  echo "  3. To stop infrastructure: ./scripts/stop-temporal-infrastructure.sh"
  echo "  4. To check status: ./scripts/check-temporal-infrastructure.sh"
  echo ""
  echo -e "${GREEN}The Temporal infrastructure will auto-restart if Docker restarts.${NC}"
  echo ""
}

# Main execution
print_banner
check_docker
check_existing_infrastructure
setup_directories
pull_images
initialize_infrastructure
display_info

success "Setup complete!"