# Temporal Processor

ETS Temporal Workflow Processor - Handles blockchain event processing with Temporal workflows for reliability and observability.

## Overview

This service replaces the custom Event Processor with Temporal workflows, providing:
- Built-in retry/recovery mechanisms
- Visual workflow monitoring via Temporal UI
- Automatic state management
- Standard deployment patterns

## Architecture

### Dual Event Listening
```
[Blockchain Events] → [Temporal Workflows] (business logic)
[Blockchain Events] → [Subgraph] (indexing/queries)  
```

### Workflows

1. **TargetEnrichmentWorkflow**
   - Triggered by: `TargetCreated` events
   - Activities:
     - Fetch metadata from target URI
     - Upload metadata to Arweave
     - Update on-chain target with Arweave TX

2. **TagCreatedWorkflow**
   - Triggered by: `TagCreated` events
   - Activities:
     - Create TAG coin metadata
     - Deploy coin on Zora
     - Allocate creator rewards (future)

## Setup

### 1. Start Temporal Server

```bash
# Start Temporal server with PostgreSQL
docker-compose up -d

# Verify Temporal is running
docker-compose ps

# View Temporal UI
open http://localhost:8080
```

### 2. Configure Environment

```bash
# Copy example env file
cp .env.example .env

# Edit with your configuration
# - Set contract addresses
# - Configure RPC URL
# - Add private key for EVENT_PROCESSOR_ROLE
```

### 3. Install Dependencies

```bash
pnpm install
```

### 4. Run the Service

```bash
# Terminal 1: Start the worker (processes workflows)
pnpm run worker

# Terminal 2: Start the event listener (monitors blockchain)
pnpm run dev
```

## Development

### Project Structure
```
src/
├── workflows/          # Temporal workflow definitions
├── activities/         # Workflow activities (side effects)
├── handlers/          # Event listeners
├── config/            # Configuration
├── types/             # TypeScript types
├── utils/             # Utilities
├── worker.ts          # Temporal worker
└── index.ts           # Main entry point
```

### Testing Workflows

```bash
# Run tests
pnpm test

# Manually trigger a workflow
temporal workflow start \
  --type TargetEnrichmentWorkflow \
  --task-queue ets-workflows \
  --input '{"targetId":"1","targetURI":"https://example.com"}'
```

### Monitoring

1. **Temporal UI**: http://localhost:8080
   - View running workflows
   - Inspect workflow history
   - Debug failed activities

2. **Logs**: Structured JSON logging with pino
   - Development: Pretty printed
   - Production: JSON format

## Deployment

### Docker Build

```bash
# Build image
docker build -t ets-temporal-processor .

# Run with env file
docker run --env-file .env ets-temporal-processor
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `TEMPORAL_SERVER_URL` | Temporal server address | `localhost:7233` |
| `TEMPORAL_NAMESPACE` | Temporal namespace | `default` |
| `TEMPORAL_TASK_QUEUE` | Task queue name | `ets-workflows` |
| `RPC_URL` | Blockchain RPC endpoint | `http://localhost:8545` |
| `CHAIN_ID` | Chain ID | `31337` |
| `PRIVATE_KEY` | Private key for on-chain updates | Required |
| `OFFCHAIN_API_URL` | Offchain API URL | `http://localhost:3000` |

## Migration from Event Processor

This service replaces `apps/event-processor` with the following improvements:

| Event Processor | Temporal Processor |
|-----------------|-------------------|
| Custom retry logic | Built-in retry policies |
| Manual state management | Automatic workflow state |
| Custom error handling | Temporal error boundaries |
| No visibility | Temporal UI monitoring |
| Complex orchestration | Simple workflow definitions |

## Troubleshooting

### Temporal Server Issues
```bash
# Reset Temporal data
docker-compose down -v
docker-compose up -d

# View Temporal logs
docker-compose logs temporal
```

### Workflow Failures
- Check Temporal UI for error details
- Review activity retry attempts
- Inspect workflow history

### Connection Issues
- Verify Temporal server is running: `docker-compose ps`
- Check network connectivity to RPC endpoint
- Ensure contract addresses are correct

## Related Documentation

- [Temporal Documentation](https://docs.temporal.io)
- [ETS Architecture](../../docs/session/ARCHITECTURE-DISCUSSION.md)
- [EPIC #536: Temporal Migration](../../docs/session/ROADMAP.md#epic_536)