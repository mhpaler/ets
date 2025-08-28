#!/bin/bash

# Check script for Temporal infrastructure status
# Use this to verify infrastructure health

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
  echo -e "${GREEN}✓${NC} $1"
}

warn() {
  echo -e "${YELLOW}⚠${NC} $1"
}

error() {
  echo -e "${RED}✗${NC} $1"
}

print_banner() {
  echo ""
  echo -e "${CYAN}═══════════════════════════════════════════${NC}"
  echo -e "${CYAN}   Temporal Infrastructure Status Check    ${NC}"
  echo -e "${CYAN}═══════════════════════════════════════════${NC}"
  echo ""
}

# Check Docker
check_docker() {
  if docker info >/dev/null 2>&1; then
    success "Docker: Running"
    return 0
  else
    error "Docker: Not running"
    return 1
  fi
}

# Check Temporal containers
check_containers() {
  local all_running=true
  
  echo ""
  echo "Container Status:"
  echo "-----------------"
  
  # Check each expected container
  for container in "temporal-infrastructure-postgres" "temporal-infrastructure-server" "temporal-infrastructure-ui" "temporal-infrastructure-admin"; do
    if docker ps --format '{{.Names}}' | grep -q "^${container}$"; then
      local status=$(docker inspect -f '{{.State.Status}}' "$container" 2>/dev/null)
      local uptime=$(docker inspect -f '{{.Status}}' "$container" 2>/dev/null)
      success "$container: $status ($uptime)"
    else
      # Check if container exists but is stopped
      if docker ps -a --format '{{.Names}}' | grep -q "^${container}$"; then
        local status=$(docker inspect -f '{{.State.Status}}' "$container" 2>/dev/null)
        warn "$container: $status (stopped)"
        all_running=false
      else
        error "$container: Not found"
        all_running=false
      fi
    fi
  done
  
  return $([ "$all_running" = true ] && echo 0 || echo 1)
}

# Check service endpoints
check_endpoints() {
  echo ""
  echo "Service Endpoints:"
  echo "------------------"
  
  local all_healthy=true
  
  # Check Temporal UI
  if curl -s -o /dev/null -w "%{http_code}" http://localhost:8080 | grep -q "200"; then
    success "Temporal UI: http://localhost:8080 (responding)"
  else
    error "Temporal UI: http://localhost:8080 (not responding)"
    all_healthy=false
  fi
  
  # Check Temporal gRPC
  cd "$ROOT_DIR/apps/temporal-processor" 2>/dev/null && node -e "
    const { Connection } = require('@temporalio/client');
    (async () => {
      try {
        const connection = await Connection.connect({
          address: 'localhost:7233'
        });
        await connection.close();
        console.log('SUCCESS');
        process.exit(0);
      } catch (error) {
        console.log('FAILED:', error.message);
        process.exit(1);
      }
    })();
  " >/tmp/temporal-check.log 2>&1
  
  if [ $? -eq 0 ]; then
    success "Temporal gRPC: localhost:7233 (connected)"
  else
    error "Temporal gRPC: localhost:7233 (connection failed)"
    if [ -f /tmp/temporal-check.log ]; then
      cat /tmp/temporal-check.log | sed 's/^/    /'
    fi
    all_healthy=false
  fi
  
  # Check PostgreSQL
  if docker exec temporal-infrastructure-postgres pg_isready -U temporal >/dev/null 2>&1; then
    success "PostgreSQL: localhost:5433 (accepting connections)"
  else
    error "PostgreSQL: localhost:5433 (not accepting connections)"
    all_healthy=false
  fi
  
  return $([ "$all_healthy" = true ] && echo 0 || echo 1)
}

# Check disk usage
check_disk_usage() {
  echo ""
  echo "Resource Usage:"
  echo "---------------"
  
  # Check Docker volume size
  local volume_size=$(docker system df --format "table {{.Type}}\t{{.Size}}" | grep "Volumes" | awk '{print $2}')
  log "Docker volumes: $volume_size"
  
  # Check specific Temporal volume
  if docker volume inspect temporal-infrastructure-postgres-data >/dev/null 2>&1; then
    local volume_path=$(docker volume inspect temporal-infrastructure-postgres-data --format '{{.Mountpoint}}')
    if [ -n "$volume_path" ] && [ -d "$volume_path" ]; then
      local volume_usage=$(du -sh "$volume_path" 2>/dev/null | cut -f1)
      log "Temporal data volume: ${volume_usage:-unknown}"
    fi
  fi
  
  # Memory usage of containers
  echo ""
  echo "Container Memory:"
  docker stats --no-stream --format "table {{.Container}}\t{{.MemUsage}}\t{{.CPUPerc}}" \
    $(docker ps --filter "label=temporal.infrastructure=true" --format "{{.Names}}" | tr '\n' ' ') 2>/dev/null || true
}

# Provide recommendations
provide_recommendations() {
  echo ""
  echo -e "${CYAN}Recommendations:${NC}"
  echo "----------------"
  
  local infra_running=true
  
  # Check if any infrastructure is running
  if ! docker ps --filter "label=temporal.infrastructure=true" --format "{{.Names}}" | grep -q "temporal"; then
    infra_running=false
  fi
  
  if [ "$infra_running" = false ]; then
    echo "• Infrastructure is not running"
    echo -e "  Run: ${GREEN}./scripts/start-temporal-infrastructure.sh${NC}"
    echo ""
    echo "• If this is your first time:"
    echo -e "  Run: ${GREEN}./scripts/setup-temporal-infrastructure.sh${NC}"
  else
    # Check for stopped containers
    local stopped=$(docker ps -a --filter "label=temporal.infrastructure=true" --filter "status=exited" --format "{{.Names}}" | wc -l | tr -d ' ')
    if [ "$stopped" -gt 0 ]; then
      echo "• Some containers are stopped"
      echo -e "  Run: ${GREEN}./scripts/start-temporal-infrastructure.sh${NC}"
    else
      echo "• All systems operational!"
      echo "• To start your application stack:"
      echo -e "  Run: ${GREEN}./scripts/start-local-stack.sh --core${NC}"
    fi
  fi
}

# Main execution
print_banner

# Run all checks
docker_ok=true
containers_ok=true
endpoints_ok=true

check_docker || docker_ok=false

if [ "$docker_ok" = true ]; then
  check_containers || containers_ok=false
  
  if [ "$containers_ok" = true ]; then
    check_endpoints || endpoints_ok=false
    check_disk_usage
  fi
fi

provide_recommendations

echo ""

# Exit with appropriate code
if [ "$docker_ok" = true ] && [ "$containers_ok" = true ] && [ "$endpoints_ok" = true ]; then
  echo -e "${GREEN}═══════════════════════════════════════════${NC}"
  echo -e "${GREEN}   All infrastructure checks passed! ✓     ${NC}"
  echo -e "${GREEN}═══════════════════════════════════════════${NC}"
  exit 0
else
  echo -e "${RED}═══════════════════════════════════════════${NC}"
  echo -e "${RED}   Some infrastructure checks failed ✗     ${NC}"
  echo -e "${RED}═══════════════════════════════════════════${NC}"
  exit 1
fi