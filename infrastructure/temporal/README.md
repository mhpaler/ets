# Temporal Infrastructure

This directory contains the persistent Temporal Server infrastructure for ETS development.

## Overview

Temporal Server is treated as **persistent infrastructure** (like Docker or PostgreSQL), not as application code. This means:

- ✅ Starts once, runs persistently  
- ✅ Survives application restarts
- ✅ Preserves workflow history between sessions
- ✅ Fast application startup (no 2-minute wait)
- ✅ Realistic development environment

## Quick Start

### First Time Setup
```bash
# One-time setup (like installing Docker Desktop)
./scripts/setup-temporal-infrastructure.sh
```

### Daily Development
```bash
# Check if infrastructure is running
./scripts/check-temporal-infrastructure.sh

# Start your application stack (fast!)
./scripts/start-local-stack.sh --core
```

### Infrastructure Management
```bash
# Start infrastructure (if stopped)
./scripts/start-temporal-infrastructure.sh

# Check infrastructure status  
./scripts/check-temporal-infrastructure.sh

# Stop infrastructure (preserves data)
./scripts/stop-temporal-infrastructure.sh
```

## Architecture

### Components

- **temporal-infrastructure-postgres**: PostgreSQL database for workflow persistence
- **temporal-infrastructure-server**: Temporal Server (gRPC API)
- **temporal-infrastructure-ui**: Temporal Web UI  
- **temporal-infrastructure-admin**: Admin tools

### Networks & Data

- **Network**: `temporal-infrastructure-network`
- **Data Volume**: `temporal-infrastructure-postgres-data` (persistent)
- **Ports**: 
  - 5433: PostgreSQL (avoiding conflicts with other PostgreSQL)
  - 7233: Temporal gRPC
  - 8080: Temporal UI

### Container Labels

All infrastructure containers are labeled with:
```yaml
labels:
  - "temporal.infrastructure=true"
  - "temporal.component=<server|database|ui|admin>"
```

This allows the scripts to distinguish infrastructure containers from application containers.

## Integration with Application Stack

The main application stack (`./scripts/start-local-stack.sh`) now:

1. **Checks Docker** (like before)
2. **Checks Temporal Infrastructure** (NEW!)
3. Starts application services
4. Connects Temporal Processor to existing infrastructure

### What Changes for Developers

**Before:**
```bash
./scripts/start-local-stack.sh --core  # Wait 2+ minutes for Temporal
```

**After:**
```bash
# One-time setup
./scripts/setup-temporal-infrastructure.sh

# Daily development (10 seconds!)
./scripts/start-local-stack.sh --core
```

### Backward Compatibility

The original `start-local-stack.sh` behavior is preserved:

- If infrastructure is missing → Clear error with setup instructions
- If infrastructure is stopped → Auto-starts it
- If infrastructure is running → Proceeds normally

## Data Persistence

### What's Persistent
- All workflow execution history
- Temporal namespaces and configuration
- PostgreSQL data

### What's NOT Persistent  
- Application containers (Hardhat, APIs, etc.)
- Application logs
- Temporary data

### Data Location
```bash
# PostgreSQL data volume
docker volume inspect temporal-infrastructure-postgres-data

# Container logs (if needed)
docker logs temporal-infrastructure-server
docker logs temporal-infrastructure-postgres
```

## Troubleshooting

### Infrastructure Not Starting
```bash
# Check container status
docker ps -a --filter "label=temporal.infrastructure=true"

# Check logs
docker logs temporal-infrastructure-server
docker logs temporal-infrastructure-postgres

# Nuclear option - rebuild from scratch
cd infrastructure/temporal
docker compose down -v  # WARNING: Deletes all workflow history
docker compose up -d
```

### Port Conflicts
The infrastructure uses different ports to avoid conflicts:

- **PostgreSQL**: 5433 (not 5432) 
- **Temporal gRPC**: 7233 (standard)
- **Temporal UI**: 8080 (standard)

If you have conflicts, update `docker-compose.yml` port mappings.

### Performance Issues
```bash
# Check resource usage
docker stats $(docker ps --filter "label=temporal.infrastructure=true" --format "{{.Names}}" | tr '\n' ' ')

# Check disk usage
docker system df
docker volume inspect temporal-infrastructure-postgres-data
```

## Development Tips

### Viewing Workflows
1. Open Temporal UI: http://localhost:8080
2. Browse workflows by namespace (default: "default")
3. Click workflows to see execution history, retries, failures

### Debugging
- Workflow history persists between app restarts
- Use Temporal UI to replay workflows
- Check both application logs AND Temporal UI for complete picture

### Database Access
```bash
# Connect to PostgreSQL directly
docker exec -it temporal-infrastructure-postgres psql -U temporal -d temporal

# View workflow data (advanced)
\dt  # List tables
SELECT * FROM workflows LIMIT 5;
```

## Production Notes

In production/staging:
- Use Temporal Cloud instead of local infrastructure
- This setup is purely for local development
- All production workflows use managed Temporal service

## Comparison: Before vs After

| Aspect | Before (Embedded) | After (Infrastructure) |
|--------|------------------|------------------------|
| **Startup time** | 2+ minutes | 10 seconds |
| **Workflow history** | Lost on restart | Persistent |
| **Development UX** | Frustrating waits | Smooth iteration |
| **Resource usage** | Repeated setup | Persistent, efficient |
| **Production parity** | Poor | Excellent |
| **Debugging** | Lost context | Full history |

This infrastructure approach makes Temporal development much more pleasant while providing a realistic environment that matches production usage patterns.