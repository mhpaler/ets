force_cleanup() {
  log "Performing force cleanup of all ETS services..."

  # Kill any processes using the required ports
  local ports_to_check=(8545 8000 8001 8020 3000 3001 4000 1984)

  for port in "${ports_to_check[@]}"; do
    local pid=$(lsof -i:"$port" -sTCP:LISTEN -t)
    if [ -n "$pid" ]; then
      log "Killing process using port $port (PID: $pid)"
      kill -9 "$pid" 2>/dev/null || true
    fi
  done

  # Check if Docker is running
  if docker info >/dev/null 2>&1; then
    # Stop all containers related to the project
    log "Stopping all project-related Docker containers..."

    # Stop graph-node containers
    docker ps --filter "name=graph-node" -q | xargs -r docker stop
    docker ps --filter "name=ipfs" -q | xargs -r docker stop
    docker ps --filter "name=postgres" -q | xargs -r docker stop

    # Stop oracle containers
    docker ps --filter "name=airnode" -q | xargs -r docker stop
    docker ps --filter "name=oracle-airnode" -q | xargs -r docker stop

    # Remove the containers
    docker ps -a --filter "name=graph-node" -q | xargs -r docker rm
    docker ps -a --filter "name=ipfs" -q | xargs -r docker rm
    docker ps -a --filter "name=postgres" -q | xargs -r docker rm
    docker ps -a --filter "name=airnode" -q | xargs -r docker rm
    docker ps -a --filter "name=oracle-airnode" -q | xargs -r docker rm

    # Remove project networks
    docker network ls --filter "name=graph-node" -q | xargs -r docker network rm
    docker network ls --filter "name=oracle" -q | xargs -r docker network rm
  else
    warn "Docker daemon not accessible. Cannot clean up Docker containers."
    warn "Please restart Docker manually."
  fi

  # Clean up PID files
  rm -f "$SCRIPT_DIR/service_pids.txt" "$SCRIPT_DIR/tail_pids.txt"

  # Clean log files
  rm -f "$ROOT_DIR/logs"/*.log

  success "Force cleanup completed"
}
