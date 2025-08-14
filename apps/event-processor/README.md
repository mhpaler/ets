# ETS Event Processor

A lightweight service that monitors ETS blockchain events and processes them through the off-chain API.

## Overview

The Event Processor watches for `TagCreated` events from the ETS Token contract and automatically initiates Zora coin creation through the off-chain API, completing the tag-to-coin workflow.

## Architecture

```
TagCreated Event → Event Processor → Off-chain API → Zora Coin Creation
                       ↓
               ETS Contract Update (via off-chain API)
```

## Features

- **Real-time Event Monitoring**: Uses Viem to watch for TagCreated events
- **Automatic Processing**: Instantly processes events as they occur
- **Historical Processing**: Can process past events with `--historical` flag
- **Error Handling**: Robust error handling with event-level isolation
- **Health Monitoring**: API health checks before processing
- **Graceful Shutdown**: Handles SIGINT/SIGTERM signals

## Quick Start

1. **Install dependencies**:
   ```bash
   pnpm install
   ```

2. **Configure environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Run in development**:
   ```bash
   pnpm dev
   ```

4. **Run with historical processing**:
   ```bash
   pnpm dev -- --historical
   ```

## Configuration

The service uses environment-aware configuration that automatically resolves contract addresses and endpoints based on the `NODE_ENV` setting.

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment: `staging`, `production`, `development` | `development` |
| `ALCHEMY_API_KEY` | Alchemy API key for RPC access | - |
| `CHAIN_ID` | Target chain ID (always Base Sepolia: 84532) | `84532` |
| `OFFCHAIN_API_URL` | Off-chain API base URL | `http://localhost:3000` |
| `OFFCHAIN_API_KEY` | API authentication key | - |
| `LOG_LEVEL` | Logging level | `info` |

### Auto-Resolved Configuration

The following are automatically resolved based on environment:

- **Contract Addresses**: From `@ethereum-tag-service/contracts`
- **Subgraph URLs**: From `@ethereum-tag-service/subgraph-endpoints`
- **RPC URLs**: Generated using Alchemy API key

### Environment Mapping

| NODE_ENV | Contract Set | Subgraph | Chain |
|----------|-------------|----------|-------|
| `staging` | Base Sepolia staging deployment | ets-base-sepolia-staging | 84532 |
| `production` | Base Sepolia production deployment | ets-base-sepolia | 84532 |
| `development` | Localhost/hardhat | localhost:8000 | 31337 |

### Manual Overrides

You can override auto-resolved values:

```bash
ETS_TOKEN_ADDRESS=0x...        # Override contract address
SUBGRAPH_URL=https://...       # Override subgraph endpoint
```

## Scripts

- `pnpm dev` - Run in development with hot reload
- `pnpm build` - Build TypeScript to JavaScript
- `pnpm start` - Run built JavaScript
- `pnpm watch` - Run with file watching
- `pnpm test` - Run tests
- `pnpm lint` - Run ESLint

## Event Processing Flow

1. **Event Detection**: Viem watches for `TagCreated` events
2. **Data Extraction**: Parse event arguments and metadata
3. **API Request**: Call off-chain API to create Zora coin
4. **Response Handling**: Log success/failure and continue

## Error Handling

- Individual event failures don't stop processing
- Automatic retries for transient failures (future enhancement)
- Detailed logging for debugging
- Graceful degradation when off-chain API is unavailable

## Monitoring

The service logs:
- Event detection and processing
- API call success/failure
- Health check results
- Error details for debugging

## Development

### Project Structure

```
src/
├── clients/          # External service clients
│   ├── viemClient.ts  # Blockchain client
│   └── apiClient.ts   # Off-chain API client
├── handlers/         # Event processing logic
│   └── tagCoinHandler.ts
├── watchers/         # Event monitoring
│   └── tagCreatedWatcher.ts
├── types/           # TypeScript definitions
├── config/          # Configuration management
└── index.ts         # Application entry point
```

### Adding New Event Types

1. Add event ABI to `viemClient.ts`
2. Create handler in `handlers/`
3. Create watcher in `watchers/`
4. Update main entry point

## Deployment

For production deployment:

1. Build the application:
   ```bash
   pnpm build
   ```

2. Set production environment variables

3. Run the service:
   ```bash
   pnpm start
   ```

Consider using PM2 or similar process manager for production deployments.