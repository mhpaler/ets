#!/bin/bash

set -e

# Parse command line arguments
CORE_MODE=false
SHOW_HELP=false

while [[ $# -gt 0 ]]; do
  case $1 in
    --core)
      CORE_MODE=true
      shift
      ;;
    --help|-h)
      SHOW_HELP=true
      shift
      ;;
    *)
      echo "Unknown option: $1"
      echo "Use --help for usage information"
      exit 1
      ;;
  esac
done

# Show help if requested
if [ "$SHOW_HELP" = true ]; then
  echo ""
  echo "ETS Local Development Stack"
  echo ""
  echo "Usage: $0 [OPTIONS]"
  echo ""
  echo "Options:"
  echo "  --core     Start core services only (Hardhat, Temporal Server/Processor, Offchain API, ArLocal)"
  echo "  --help|-h  Show this help message"
  echo ""
  echo "Note: Graph Node/Subgraph temporarily disabled for maintenance"
  echo ""
  echo "Default: Start full stack (core services + Explorer UI)"
  echo ""
  echo "Examples:"
  echo "  $0          # Start full stack"
  echo "  $0 --core   # Start core services only"
  echo ""
  exit 0
fi

# Auto-detect if we're in VS Code terminal
if [ "$TERM_PROGRAM" = "vscode" ]; then
  USE_SEPARATE_LOG_TERMINAL=false  # VS Code can't open separate Terminal.app windows
else
  USE_SEPARATE_LOG_TERMINAL=true   # Native terminal can open separate log window
fi

# Directory of this script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

# Root directory of the project
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

# Set up logging with colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
ORANGE='\033[0;33m'
LIGHT_GREEN='\033[1;32m'
LIGHT_BLUE='\033[1;34m'
NC='\033[0m' # No Color

# Add this array at the top of the script, after the color definitions
declare -a SERVICE_URLS

log() {
  echo -e "${BLUE}[$(date +"%T")]${NC} - $1"
}

success() {
  echo -e "${GREEN}[$(date +"%T")]${NC} - $1"
}

warn() {
  echo -e "${YELLOW}[$(date +"%T")]${NC} - $1"
}

error() {
  echo -e "${RED}[$(date +"%T")]${NC} - $1"
}

print_banner() {
  echo ""
  echo ""
  echo -e "  ${CYAN}███████╗████████╗███████╗${NC}"
  echo -e "  ${CYAN}██╔════╝╚══██╔══╝██╔════╝${NC}"
  echo -e "  ${CYAN}█████╗     ██║   ███████╗${NC}"
  echo -e "  ${CYAN}██╔══╝     ██║   ╚════██║${NC}"
  echo -e "  ${CYAN}███████╗   ██║   ███████║${NC}"
  echo -e "  ${CYAN}╚══════╝   ╚═╝   ╚══════╝${NC}"
  
  if [ "$CORE_MODE" = true ]; then
    echo -e "  ${YELLOW}Core TAG Creation Stack${NC}"
    echo ""
    echo ""
    echo -e "${GREEN}Starting core services for TAG creation testing...${NC}"
  else
    echo -e "  ${YELLOW}Universal Tagging System${NC}"
    echo ""
    echo ""
    echo -e "${GREEN}Starting full local development stack...${NC}"
  fi
  
  echo ""
  echo "Script directory: $SCRIPT_DIR"
  echo "Root directory: $ROOT_DIR"

}

# Check if Docker is running
check_docker() {
  log "Checking if Docker is running..."
  if ! docker info >/dev/null 2>&1; then
    error "Docker is not running."

    # Determine OS type
    if [[ "$OSTYPE" == "darwin"* ]]; then
      # macOS
      error "Please start Docker Desktop and try again."

      # Try to open Docker Desktop on macOS
      if [ -d "/Applications/Docker.app" ]; then
        warn "Attempting to start Docker Desktop..."
        open -a Docker

        # Wait for Docker to start (up to 60 seconds)
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
        error "Timed out waiting for Docker to start. Please start Docker Desktop manually."
        exit 1
      fi
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
      # Linux
      error "Please start the Docker daemon with: sudo systemctl start docker"
      error "Then try again."
    else
      # Other OS
      error "Please start Docker and try again."
    fi
    exit 1
  fi
  success "Docker is running!"
}

check_port_availability() {
  local port=$1
  if lsof -i:$port -sTCP:LISTEN -t >/dev/null 2>&1; then
    return 1  # Port is in use
  else
    return 0  # Port is available
  fi
}

check_service_conflicts() {
  log "Checking for potential service conflicts..."

  local conflicts_found=0
  local services_to_kill=()
  
  # Define ports and services based on mode
  # TEMPORARILY DISABLED: Graph Node ports (8000, 8001, 8020) to unblock integration testing
  if [ "$CORE_MODE" = true ]; then
    local ports_to_check=(8545 4000 1984 3002)
    local port_names=("Hardhat" "Offchain API" "ArLocal" "Event Processor")
    local docker_containers=()  # Graph Node containers disabled
  else
    local ports_to_check=(8545 4000 3001 1984 3002)
    local port_names=("Hardhat" "Offchain API" "Explorer UI" "ArLocal" "Event Processor") 
    local docker_containers=()  # Graph Node containers disabled
  fi
  local protected_processes=("docker" "Docker" "com.docker.backend" "dockerd")

  # Check port conflicts
  for i in "${!ports_to_check[@]}"; do
    local port="${ports_to_check[$i]}"
    local name="${port_names[$i]}"

    if ! check_port_availability "$port"; then
      warn "Port $port is in use, which is needed for $name"
      local pid=$(lsof -i:"$port" -sTCP:LISTEN -t)
      if [ -n "$pid" ]; then
        local process_name=$(ps -p "$pid" -o comm=)
        warn "Process using port $port: $process_name (PID: $pid)"

        # Check if this is a protected process we shouldn't kill
        local is_protected=0
        for protected in "${protected_processes[@]}"; do
          if [[ "$process_name" == *"$protected"* ]]; then
            warn "This appears to be a Docker process. Will not attempt to kill automatically."
            is_protected=1
            break
          fi
        done

        if [ $is_protected -eq 0 ]; then
          services_to_kill+=("$pid")
        fi
      fi
      conflicts_found=1
    fi
  done

  # Check Docker container conflicts
  if docker info >/dev/null 2>&1; then
    for container in "${docker_containers[@]}"; do
      if docker ps --format '{{.Names}}' | grep -q "$container"; then
        warn "Docker container '$container' is already running"
        conflicts_found=1
      fi
    done
  else
    warn "Docker daemon not running or not accessible"
    conflicts_found=1
  fi

  # If conflicts were found, ask user what to do
  if [ $conflicts_found -eq 1 ]; then
    echo
    warn "Service conflicts were detected. These may interfere with the ETS stack."
    read -p "Would you like to stop these conflicts and continue? (y/n) " -n 1 -r
    echo

    if [[ $REPLY =~ ^[Yy]$ ]]; then
      log "Stopping conflicting services..."

      # Stop conflicting processes (excluding protected ones)
      for pid in "${services_to_kill[@]}"; do
        log "Killing process with PID: $pid"
        kill -9 "$pid" 2>/dev/null || true
      done

      # Check if Docker is accessible before trying to stop containers
      if docker info >/dev/null 2>&1; then
        # Stop conflicting Docker containers with retries
        for container in "${docker_containers[@]}"; do
          if docker ps --format '{{.Names}}' | grep -q "$container"; then
            log "Stopping Docker container: $container"

            # Try graceful stop first
            docker stop "$container" >/dev/null 2>&1 || true

            # If container still exists after 3 seconds, try force remove
            sleep 3
            if docker ps --format '{{.Names}}' | grep -q "$container"; then
              warn "Container still running, trying force removal"
              docker rm -f "$container" >/dev/null 2>&1 || true
            fi
          fi
        done

        # Additional cleanup for any orphaned containers
        log "Checking for any orphaned project containers..."
        ORPHANS=$(docker ps --filter "label=com.docker.compose.project" -q)
        if [ -n "$ORPHANS" ]; then
          warn "Found orphaned project containers, stopping them"
          docker stop $ORPHANS >/dev/null 2>&1 || true
          docker rm $ORPHANS >/dev/null 2>&1 || true
        fi
      else
        error "Docker daemon not accessible. Please restart Docker manually."
        error "After Docker is running again, restart this script."
        exit 1
      fi

      # Give everything time to shut down
      sleep 3

      # Verify Docker is still running after our operations
      if ! docker info >/dev/null 2>&1; then
        error "Docker daemon is not responding after cleanup operations."
        error "Please restart Docker manually, then try again."
        exit 1
      fi

      success "Conflicting services stopped"
    else
      error "Cannot start ETS stack with service conflicts. Please resolve them manually."
      exit 1
    fi
  else
    success "No service conflicts detected"
  fi
}

# Add this function to clean log files
clean_logs() {
  log "Cleaning previous log files..."

  # Create logs directory if it doesn't exist
  mkdir -p "$ROOT_DIR/logs"

  # Remove all existing log files
  rm -f "$ROOT_DIR/logs"/*.log

  success "Log files cleaned"
}

# Function to rotate logs based on size
rotate_logs() {
  local max_size_mb=50
  local log_file="$1"
  local current_size_kb=$(du -k "$log_file" | cut -f1)
  local max_size_kb=$((max_size_mb * 1024))

  if [ $current_size_kb -gt $max_size_kb ]; then
    log "Rotating log file $log_file (size: $((current_size_kb / 1024))MB)"
    mv "$log_file" "${log_file}.$(date +%Y%m%d%H%M%S)"
    touch "$log_file"
    # Keep only the 5 most recent rotated log files
    ls -t "${log_file}."* | tail -n +6 | xargs rm -f 2>/dev/null || true
    return 0
  fi
  return 1
}

# Function to check all logs periodically
check_logs_size() {
  while true; do
    sleep 300  # Check every 5 minutes

    # Rotate logs if necessary
    rotate_logs "$ROOT_DIR/logs/hardhat.log"
    rotate_logs "$ROOT_DIR/logs/graph-node.log"

    # Optional: report on all log sizes
    if [ "$(date +%M)" = "00" ]; then  # Report once per hour
      log "Current log sizes:"
      du -h "$ROOT_DIR/logs"/*.log | sort -hr
    fi
  done
}

# Function to open a separate terminal for logs
# Replace your open_logs_terminal function with this updated version
open_logs_terminal() {
  if [ "$USE_SEPARATE_LOG_TERMINAL" != "true" ]; then
    if [ "$TERM_PROGRAM" = "vscode" ]; then
      log "Running in VS Code terminal - logs will appear inline (no separate window)"
    else
      log "Using main terminal for logs (separate log terminal disabled)"
    fi
    return
  fi

  log "Opening a separate terminal window for logs..."

  # Create placeholder log files for all services
  touch "$ROOT_DIR/logs/hardhat.log"
  touch "$ROOT_DIR/logs/graph-node.log"
  touch "$ROOT_DIR/logs/contracts-deploy.log"
  touch "$ROOT_DIR/logs/subgraph-deploy.log"
  touch "$ROOT_DIR/logs/arlocal.log"
  touch "$ROOT_DIR/logs/offchain-api.log"
  touch "$ROOT_DIR/logs/temporal-server.log"
  touch "$ROOT_DIR/logs/temporal-processor.log"
  touch "$ROOT_DIR/logs/explorer.log"

  # Create a temporary script file for the new terminal
  LOG_SCRIPT="$SCRIPT_DIR/view-logs.sh"

  # Write a properly escaped script that ensures color codes are interpreted
  cat << 'EOF' > "$LOG_SCRIPT"
#!/bin/bash
cd "$1"
echo -e "\033[1;36m=== ETS Local Stack Logs ===\033[0m\n"
# Use proper escaping for ANSI color codes
tail -f logs/*.log | grep --line-buffered "" |
  sed -e $'s/.*hardhat.log.*/\033[0;36m[HARDHAT]\033[0m &/' \
      -e $'s/.*graph-node.log.*/\033[0;33m[SUBGRAPH]\033[0m &/' \
      -e $'s/.*contracts-deploy.log.*/\033[0;32m[CONTRACTS]\033[0m &/' \
      -e $'s/.*subgraph-deploy.log.*/\033[0;34m[SUBGRAPH-DEPLOY]\033[0m &/' \
      -e $'s/.*arlocal.log.*/\033[1;34m[ARLOCAL]\033[0m &/' \
      -e $'s/.*offchain-api.log.*/\033[0;32m[OFFCHAIN-API]\033[0m &/' \
      -e $'s/.*temporal-server.log.*/\033[1;35m[TEMPORAL-SERVER]\033[0m &/' \
      -e $'s/.*temporal-processor.log.*/\033[0;35m[TEMPORAL-PROCESSOR]\033[0m &/' \
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
    warn "Unsupported OS for opening terminal. Please check logs manually in $ROOT_DIR/logs directory."
  fi

  sleep 1
  success "Log terminal opened"
}

# Then modify the colorize_output function to respect this setting
colorize_output() {
  local service_name=$1
  local color=$2
  local log_file="$ROOT_DIR/logs/${service_name}.log"

  # Ensure we're not trying to read from a non-existent file
  touch "$log_file"

  # Only tail logs in the main terminal if we're not using a separate log terminal
  if [ "$USE_SEPARATE_LOG_TERMINAL" != "true" ]; then
    # Use sed to prefix each line with the service name and color
    tail -f "$log_file" | sed -e "s/^/${color}[${service_name}]${NC} /" &
    echo $! >> "$ROOT_DIR/logs/tail_pids.txt"
  fi
}

display_service_url() {
  local service_name=$1
  local url=$2
  # Instead of displaying, add to our collection
  SERVICE_URLS+=("${service_name}:${url}")
}

# Add a new function to display all collected URLs at the end
display_all_services() {
  echo ""
  echo -e "${ORANGE}=== ETS Local Stack Services ===${NC}"
  echo ""
  for service_info in "${SERVICE_URLS[@]}"; do
    # Split the service info by colon
    service_name="${service_info%%:*}"
    url="${service_info#*:}"
    echo -e "${LIGHT_GREEN}${service_name}${NC} is running at ${LIGHT_BLUE}${url}${NC}"
  done
  echo ""
}

# Start Hardhat node
start_hardhat() {
  log "Starting Hardhat node..."
  cd "$ROOT_DIR/packages/contracts"
  # Start hardhat in background, redirect output to log file
  pnpm hardhat > "$ROOT_DIR/logs/hardhat.log" 2>&1 &
  HARDHAT_PID=$!
  echo $HARDHAT_PID >> "$ROOT_DIR/logs/service_pids.txt"


  # Set up colored output for this service
  colorize_output "HARDHAT" "${CYAN}"

  # Wait for node to be ready (adjust sleep time as needed)
  sleep 5

  display_service_url "Hardhat node" "http://localhost:8545/"
  success "Hardhat node started with PID: $HARDHAT_PID"
}

# Deploy contracts
deploy_contracts() {
  log "Deploying contracts..."
  cd "$ROOT_DIR/packages/contracts"
  pnpm run deploy-all --network localhost > "$ROOT_DIR/logs/contracts-deploy.log" 2>&1
  local EXIT_CODE=$?

  if [ $EXIT_CODE -eq 0 ]; then
    success "Contracts deployed successfully"
  else
    error "Contract deployment failed. Check logs/contracts-deploy.log for details"
    cat "$ROOT_DIR/logs/contracts-deploy.log"
    exit 1
  fi
}

start_graph_node() {
  log "Starting Graph Node..."
  cd "$ROOT_DIR/apps/data-api"

  # First clean any existing data
  pnpm run clean-graph-node

  # Modified approach to capture Docker container logs
  if [ "$USE_SEPARATE_LOG_TERMINAL" = "true" ]; then
    # If using separate log terminal, only redirect to log file
    (cd graph-node && docker compose up) > "$ROOT_DIR/logs/graph-node.log" 2>&1 &
  else
    # If showing logs in main terminal, use tee to display while capturing
    (cd graph-node && docker compose up) > >(tee "$ROOT_DIR/logs/graph-node.log") 2>&1 &
  fi

  GRAPH_PID=$!
  echo $GRAPH_PID >> "$ROOT_DIR/logs/service_pids.txt"

  # Set up colored output for this service
  colorize_output "GRAPH" "${YELLOW}"

  # Wait for graph node to be ready
  log "Waiting for Graph Node to start (this may take a while)..."
  sleep 20
  success "Graph Node started with PID: $GRAPH_PID"
}

# Deploy subgraph
deploy_subgraph() {
  log "Deploying subgraph..."
  cd "$ROOT_DIR/apps/data-api"

  # Deploy with a single command - it handles YAML generation and codegen internally
  # Using --config for environment-aware subgraph deployment
  pnpm run deploy --config localhost > "$ROOT_DIR/logs/subgraph-deploy.log" 2>&1
  local EXIT_CODE=$?

  if [ $EXIT_CODE -eq 0 ]; then
    success "Subgraph deployed successfully"

    # Extract the subgraph URL from the log file
    SUBGRAPH_URL=$(grep -o "http://localhost:8000/subgraphs/name/[^ ]*" "$ROOT_DIR/logs/subgraph-deploy.log" | head -1)

    if [ -n "$SUBGRAPH_URL" ]; then
      # Display the subgraph URL
      display_service_url "Subgraph endpoint" "$SUBGRAPH_URL"
    else
      # Fallback if URL not found in logs
      display_service_url "Subgraph endpoint" "http://localhost:8000/subgraphs/name/ets-local"
    fi
  else
    error "Subgraph deployment failed. Check logs/subgraph-deploy.log for details"
    cat "$ROOT_DIR/logs/subgraph-deploy.log"
    exit 1
  fi
}



# Add function to start arlocal (using Docker)
start_arlocal() {
  log "Starting ArLocal (Arweave local node) in Docker..."
  
  # Clean up any existing ArLocal container (running or stopped)
  if docker ps -a --format '{{.Names}}' | grep -q "arlocal"; then
    warn "ArLocal container exists, cleaning up first..."
    docker stop arlocal > /dev/null 2>&1 || true
    docker rm arlocal > /dev/null 2>&1 || true
    sleep 1
  fi

  # Start ArLocal in Docker container
  docker run -d \
    --name arlocal \
    -p 1984:1984 \
    -e NODE_ENV=development \
    textury/arlocal:latest > /dev/null 2>&1

  if [ $? -eq 0 ]; then
    # Capture Docker logs
    if [ "$USE_SEPARATE_LOG_TERMINAL" = "true" ]; then
      docker logs -f arlocal > "$ROOT_DIR/logs/arlocal.log" 2>&1 &
    else
      docker logs -f arlocal | tee "$ROOT_DIR/logs/arlocal.log" &
    fi
    
    ARLOCAL_LOG_PID=$!
    echo $ARLOCAL_LOG_PID >> "$ROOT_DIR/logs/service_pids.txt"
    
    # Set up colored output for this service
    colorize_output "ARLOCAL" "${LIGHT_GREEN}"
    
    # Wait for ArLocal to be ready
    sleep 3
    
    # Check if container is still running
    if docker ps --format '{{.Names}}' | grep -q "arlocal"; then
      display_service_url "ArLocal server" "http://localhost:1984/"
      success "ArLocal started in Docker container"
    else
      error "ArLocal Docker container failed to start"
      docker logs arlocal
      exit 1
    fi
  else
    error "Failed to start ArLocal Docker container"
    exit 1
  fi
}

# Add after start_arlocal function  
generate_arweave_keyfile() {
  log "Checking for Arweave keyfile..."
  cd "$ROOT_DIR/apps/offchain-api"
  
  if [ ! -f "arweave-keyfile.json" ]; then
    log "Arweave keyfile not found. Generating new keyfile for local development..."
    if [ "$USE_SEPARATE_LOG_TERMINAL" = "true" ]; then
      pnpm run generate-keyfile > "$ROOT_DIR/logs/arweave-keyfile-generation.log" 2>&1
    else
      pnpm run generate-keyfile | tee "$ROOT_DIR/logs/arweave-keyfile-generation.log"
    fi
    if [ ${PIPESTATUS[0]} -eq 0 ]; then
      success "Arweave keyfile generated successfully"
    else
      error "Failed to generate Arweave keyfile. Check logs/arweave-keyfile-generation.log for details"
      cat "$ROOT_DIR/logs/arweave-keyfile-generation.log"
      exit 1
    fi
  else
    success "Arweave keyfile already exists"
  fi
}

fund_arlocal_wallet() {
  log "Funding ArLocal wallet with test tokens..."
  cd "$ROOT_DIR/apps/offchain-api"

  if [ "$USE_SEPARATE_LOG_TERMINAL" = "true" ]; then
    pnpm run mint-ar > "$ROOT_DIR/logs/arlocal-funding.log" 2>&1
  else
    pnpm run mint-ar | tee "$ROOT_DIR/logs/arlocal-funding.log"
  fi

  if [ ${PIPESTATUS[0]} -eq 0 ]; then
    success "ArLocal wallet funded successfully"
  else
    error "Failed to fund ArLocal wallet. Check logs/arlocal-funding.log for details"
    cat "$ROOT_DIR/logs/arlocal-funding.log"
    exit 1
  fi
}


# Start offchain API
start_offchain_api() {
  log "Starting offchain API..."
  cd "$ROOT_DIR/apps/offchain-api"

  # Check if USE_SEPARATE_LOG_TERMINAL is enabled
  if [ "$USE_SEPARATE_LOG_TERMINAL" = "true" ]; then
    pnpm run dev > "$ROOT_DIR/logs/offchain-api.log" 2>&1 &
  else
    pnpm run dev | tee "$ROOT_DIR/logs/offchain-api.log" &
  fi

  API_PID=$!
  echo $API_PID >> "$ROOT_DIR/logs/service_pids.txt"

  # Set up colored output for this service
  colorize_output "API" "${GREEN}"

  # Check if the API is actually running
  sleep 3
  if ! ps -p $API_PID > /dev/null; then
    error "Offchain API failed to start. Check logs/offchain-api.log for details"
    cat "$ROOT_DIR/logs/offchain-api.log"
    exit 1
  fi

  display_service_url "Offchain API" "http://localhost:4000/"
  success "Offchain API started with PID: $API_PID"
}

# Start Event Processor
start_event_processor() {
  log "Starting Event Processor..."
  cd "$ROOT_DIR/apps/event-processor"
  
  # Set environment for localhost testing
  export NODE_ENV=development
  export CHAIN_ID=31337
  export BLOCKCHAIN_RPC_URL=http://localhost:8545
  export OFFCHAIN_API_URL=http://localhost:4000
  
  if [ "$USE_SEPARATE_LOG_TERMINAL" = "true" ]; then
    bun src/index.ts > "$ROOT_DIR/logs/event-processor.log" 2>&1 &
  else
    bun src/index.ts | tee "$ROOT_DIR/logs/event-processor.log" &
  fi
  
  EVENT_PROCESSOR_PID=$!
  echo $EVENT_PROCESSOR_PID >> "$ROOT_DIR/logs/service_pids.txt"
  
  # Set up colored output for this service
  colorize_output "EVENT-PROCESSOR" "${PURPLE}"
  
  sleep 3
  if ps -p $EVENT_PROCESSOR_PID > /dev/null; then
    display_service_url "Event Processor" "Running (monitoring events)"
    success "Event Processor started with PID: $EVENT_PROCESSOR_PID"
  else
    error "Event Processor failed to start. Check logs/event-processor.log for details"
    cat "$ROOT_DIR/logs/event-processor.log"
    exit 1
  fi
}

# Start Temporal Server
start_temporal_server() {
  log "Starting Temporal Server with Docker Compose..."
  cd "$ROOT_DIR/apps/temporal-processor"
  
  # Clean up any existing Temporal containers (running or stopped)
  if docker compose ps -a | grep -q "temporal"; then
    warn "Temporal server containers exist, cleaning up first..."
    docker compose down > /dev/null 2>&1 || true
    sleep 2
  fi
  
  # Start Temporal server stack
  if [ "$USE_SEPARATE_LOG_TERMINAL" = "true" ]; then
    docker compose up -d > "$ROOT_DIR/logs/temporal-server.log" 2>&1
  else
    docker compose up -d | tee "$ROOT_DIR/logs/temporal-server.log"
  fi
  
  # Wait for services to be ready
  log "Waiting for Temporal server to be ready..."
  local max_attempts=30
  local attempt=1
  
  while [ $attempt -le $max_attempts ]; do
    if docker compose ps | grep -q "temporal.*Up" && \
       curl -s http://localhost:8080 >/dev/null 2>&1; then
      break
    fi
    
    if [ $((attempt % 5)) -eq 0 ]; then
      log "Still waiting for Temporal server... (attempt $attempt/$max_attempts)"
    fi
    
    sleep 2
    attempt=$((attempt + 1))
  done
  
  if [ $attempt -gt $max_attempts ]; then
    error "Temporal server failed to start within timeout"
    docker-compose logs
    exit 1
  fi
  
  display_service_url "Temporal Server" "http://localhost:7233"
  display_service_url "Temporal UI" "http://localhost:8080"
  success "Temporal Server started successfully"
}

# Start Temporal Processor (replaces Event Processor)
start_temporal_processor() {
  log "Starting Temporal Processor..."
  cd "$ROOT_DIR/apps/temporal-processor"
  
  # Set environment for localhost testing
  export NODE_ENV=development
  export CHAIN_ID=31337
  export RPC_URL=http://localhost:8545
  export OFFCHAIN_API_URL=http://localhost:3000
  export TEMPORAL_SERVER_URL=localhost:7233
  export TEMPORAL_NAMESPACE=default
  export TEMPORAL_TASK_QUEUE=ets-workflows
  
  if [ "$USE_SEPARATE_LOG_TERMINAL" = "true" ]; then
    PATH="/Users/User/.nvm/versions/node/v20.19.4/bin:$PATH" pnpm run dev > "$ROOT_DIR/logs/temporal-processor.log" 2>&1 &
  else
    PATH="/Users/User/.nvm/versions/node/v20.19.4/bin:$PATH" pnpm run dev | tee "$ROOT_DIR/logs/temporal-processor.log" &
  fi
  
  TEMPORAL_PROCESSOR_PID=$!
  echo $TEMPORAL_PROCESSOR_PID >> "$ROOT_DIR/logs/service_pids.txt"
  
  # Set up colored output for this service
  colorize_output "TEMPORAL-PROCESSOR" "${PURPLE}"
  
  sleep 5
  if ps -p $TEMPORAL_PROCESSOR_PID > /dev/null; then
    display_service_url "Temporal Processor" "Running (monitoring events → workflows)"
    success "Temporal Processor started with PID: $TEMPORAL_PROCESSOR_PID"
  else
    error "Temporal Processor failed to start. Check logs/temporal-processor.log for details"
    cat "$ROOT_DIR/logs/temporal-processor.log"
    exit 1
  fi
}

# Airnode Oracle removed - replaced with Temporal Processor

# Start Explorer UI
start_explorer() {
  log "Starting ETS Explorer UI..."
  cd "$ROOT_DIR/apps/app"

  # Check if USE_SEPARATE_LOG_TERMINAL is enabled
  if [ "$USE_SEPARATE_LOG_TERMINAL" = "true" ]; then
    pnpm run dev > "$ROOT_DIR/logs/explorer.log" 2>&1 &
  else
    pnpm run dev | tee "$ROOT_DIR/logs/explorer.log" &
  fi

  EXPLORER_PID=$!
  echo $EXPLORER_PID >> "$ROOT_DIR/logs/service_pids.txt"

  # Set up colored output for this service
  colorize_output "EXPLORER" "${BLUE}"

  sleep 3
  display_service_url "ETS Explorer UI" "http://localhost:3001/"
  success "Explorer UI started with PID: $EXPLORER_PID"
}

# Populate initial data
populate_data() {
  log "Populating initial data..."
  cd "$ROOT_DIR/packages/contracts"

  # Run the first command and wait for it to complete
  log "Applying initial tags to the ETS repository URL..."
  hardhat applyTags --relayer "ETSRelayer" --signer "account3" --tags "#UniversalTags" --uri "https://github.com/ethereum-tag-service/ets" --record-type "bookmark" --network localhost >> "$ROOT_DIR/logs/hardhat.log" 2>&1

  if [ $? -ne 0 ]; then
    error "Failed to apply initial tags. Check logs/hardhat.log for details"
    return 1
  fi

  # Run the second command after the first one completes
  log "Creating test tagging records..."
  hardhat testdata --action createTaggingRecords --qty 4 --signers 4 --network localhost >> "$ROOT_DIR/logs/hardhat.log" 2>&1

  if [ $? -ne 0 ]; then
    error "Failed to create test tagging records. Check logs/hardhat.log for details"
    return 1
  fi

  success "Initial data populated successfully"
}


# Initialize PID tracking files
rm -f "$ROOT_DIR/logs/service_pids.txt" "$ROOT_DIR/logs/tail_pids.txt"
touch "$ROOT_DIR/logs/service_pids.txt" "$ROOT_DIR/logs/tail_pids.txt"

print_banner
check_docker
check_service_conflicts

# Create logs directory with explicit error handling
if [ -z "$ROOT_DIR" ]; then
  echo "Error: ROOT_DIR is empty, cannot create logs directory"
  exit 1
fi
mkdir -p "$ROOT_DIR/logs"

# Clean log files before starting services
clean_logs

# Open a separate terminal for logs
open_logs_terminal

# Start the log size checker in the background
log "Setting up log rotation..."
check_logs_size &
LOG_ROTATION_PID=$!
echo $LOG_ROTATION_PID >> "$ROOT_DIR/logs/service_pids.txt"
success "Log rotation set up with PID: $LOG_ROTATION_PID"

# Start services based on mode
if [ "$CORE_MODE" = true ]; then
  log "Starting core services only..."
  # Core services: Hardhat + Contracts + Temporal Server/Processor + Offchain API + ArLocal
  # TEMPORARILY DISABLED: Subgraph (Graph Node) to unblock integration testing
  start_hardhat
  deploy_contracts
  # start_graph_node    # DISABLED: Graph Node broken, fix later
  # deploy_subgraph     # DISABLED: Requires Graph Node
  start_arlocal         # FIXED: Now using Docker instead of native
  generate_arweave_keyfile   # Generate keyfile if needed for ArLocal testing
  fund_arlocal_wallet   
  start_offchain_api
  start_temporal_server      # NEW: Temporal server infrastructure
  start_temporal_processor   # REPLACES: Event Processor with Temporal workflows
else
  log "Starting full stack..."
  # Full stack: Core services + Explorer UI
  # TEMPORARILY DISABLED: Subgraph (Graph Node) to unblock integration testing
  start_hardhat
  deploy_contracts
  # start_graph_node    # DISABLED: Graph Node broken, fix later
  # deploy_subgraph     # DISABLED: Requires Graph Node
  start_arlocal         # FIXED: Now using Docker instead of native
  generate_arweave_keyfile   # Generate keyfile if needed for ArLocal testing
  fund_arlocal_wallet   
  start_offchain_api
  start_temporal_server      # NEW: Temporal server infrastructure  
  start_temporal_processor   # REPLACES: Event Processor with Temporal workflows
  start_explorer
  populate_data
fi

display_all_services
# 66970359841036948517769269395685321134451577895751556947483004888163188906780

if [ "$CORE_MODE" = true ]; then
  success "Core services started successfully!"
  log "Ready for TAG creation testing"
else
  success "All services started successfully!"
  log "Full development stack ready"
fi
log "Services are logging with different colors"
log "Log files are available in the $ROOT_DIR/logs directory"

# Trap for cleanup
cleanup() {
  log "Cleaning up..."
  # Kill all service processes
  if [ -f "$ROOT_DIR/logs/service_pids.txt" ]; then
    for pid in $(cat "$ROOT_DIR/logs/service_pids.txt"); do
      kill $pid 2>/dev/null || true
    done
  fi

  # Kill all tail processes
  if [ -f "$ROOT_DIR/logs/tail_pids.txt" ]; then
    for pid in $(cat "$ROOT_DIR/logs/tail_pids.txt"); do
      kill $pid 2>/dev/null || true
    done
  fi

  # Stop Docker containers
  docker stop arlocal 2>/dev/null || true
  docker rm arlocal 2>/dev/null || true
  # docker stop $(docker ps -q --filter "name=graph-node") 2>/dev/null || true  # DISABLED: Graph Node
  
  # Stop Temporal Docker containers
  if [ -d "$ROOT_DIR/apps/temporal-processor" ]; then
    cd "$ROOT_DIR/apps/temporal-processor"
    docker compose down 2>/dev/null || true
  fi

  rm -f "$ROOT_DIR/logs/service_pids.txt" "$ROOT_DIR/logs/tail_pids.txt"
  success "All services stopped"
}

trap cleanup EXIT INT TERM

log "Press Ctrl+C to stop all services"
# Keep the script running
wait