# ETS Off-Chain API

## Technical Summary

The ETS Off-Chain API is a Node.js service that provides off-chain processing capabilities for the Ethereum Tag Service (ETS) ecosystem. It serves as a bridge between on-chain smart contracts and various off-chain resources, primarily handling URL metadata extraction and permanent data storage.

### Core Features

- **Target URL Processing**: Extracts metadata from any URL (webpages, images, PDFs, etc.)
- **Permanent Storage**: Stores metadata on Arweave for decentralized, permanent storage
- **Integration with ETS Contracts**: Communicates with ETS smart contracts across multiple chains
- **Multi-Chain Support**: Works with multiple EVM chains including Arbitrum Sepolia and Base Sepolia

### Architecture

The service is built with a modular architecture:

- **Express API Server**: Handles HTTP requests and responses
- **Controller Layer**: Processes incoming requests and orchestrates service interactions
- **Service Layer**: Contains domain-specific business logic
  - `metadataService`: Extracts and processes metadata from target URLs
  - `arweaveService`: Handles interaction with Arweave blockchain
- **SDK Integration**: Uses `@ethereum-tag-service/sdk-core` for smart contract interactions

## Getting Started

### Prerequisites

- Node.js (v16+)
- pnpm
- Docker (for local Arweave development)

### Installation

1. Clone the repository and navigate to the project directory:

```bash
git clone <https://github.com/ethereum-tag-service/ets.git>
cd ets
```

2. Install dependencies using pnpm:

```bash
pnpm install
```

3. Navigate to the off-chain API directory:

```bash
cd apps/offchain-api
```

4. Create a `.env.local` file based on the example:

```bash
cp .env.example .env.local
```

5. Configure your `.env.local` file with appropriate values:

```

# API Configuration

PORT=3000
NODE_ENV=development

# RPC URLs

BASE_SEPOLIA_RPC_URL=<https://sepolia.base.org>
ARBITRUM_SEPOLIA_RPC_URL=<https://sepolia-rollup.arbitrum.io/rpc>

# Fallback RPC URLs

ARBITRUM_SEPOLIA_FALLBACK_RPC_URLS=<https://arbitrum-sepolia.publicnode.com,https://sepolia-rollup.arbitrum.io/rpc>
BASE_SEPOLIA_FALLBACK_RPC_URLS=<https://base-sepolia.blockpi.network/v1/rpc/public,https://base-sepolia.publicnode.com>

# Wallet - This is a development key, don't use in production

PRIVATE_KEY="always hobby dismiss alarm nation romance around spring rebel cereal olympic faculty"

# Arweave Configuration

ARWEAVE_JWK_PATH=./arweave-keyfile.json
ARWEAVE_GATEWAY=<http://localhost:1984>

# Set to 'true' to use mock Arweave (no actual uploads)

MOCK_ARWEAVE=true

# Alchemy API Key

ALCHEMY_API_KEY=TjjzoNYlIqWqZxcoufe60bhVbARhkxYX
```

### Setting up ArLocal (Arweave Local Development Server)

1. Install ArLocal globally:

```bash
npm install -g arlocal
```

1. Start ArLocal in a separate terminal:

```bash
arlocal
```

This will start an Arweave test node on <http://localhost:1984>.

1. Generate test Arweave wallet for development:

Either:

- Create an Arweave keyfile manually (JSON format)
- Use the provided script to generate one:

```bash
pnpm mint-ar
```

This script will mint test AR tokens to your local wallet.

### Running the API in Development Mode

Start the development server:

```bash
pnpm dev
```

The API will be available at <http://localhost:3000> with automatic reloading on code changes.

## API Endpoints

### Target Endpoints

- **POST /api/target/enrich**
  - Processes a target URL, extracts metadata, and stores it on Arweave
  - Request body: `{ "chainId": number, "targetId": string }`
  - Response: Metadata extraction result with Arweave transaction ID

### Health Check

- **GET /health**
  - Simple health check endpoint to verify the service is running
  - Response: `{ "status": "ok" }`

## Mock Mode vs. Production Mode

The API can run in two modes:

### Mock Mode (Development)

Set `MOCK_ARWEAVE=true` in your .env file to:

- Skip actual Arweave transactions
- Generate deterministic mock transaction IDs
- Avoid needing real AR tokens

### Production Mode

Set `MOCK_ARWEAVE=false` and provide a valid Arweave JWK file to:

- Create real Arweave transactions
- Store data permanently on the Arweave network
- Require AR tokens in your wallet

## Testing

Run the test suite:

```bash
pnpm test
```

## Additional Scripts

- **Mint AR tokens for local development**:

  ```bash
  pnpm mint-ar
  ```

- **Build for production**:

  ```bash
  pnpm build
  ```

- **Start production server**:

  ```bash
  pnpm start
  ```

## Technical Notes

- All Arweave transactions include ETS-specific tags for easy identification
- The service handles connection fallbacks for RPC endpoints to improve reliability
- Metadata extraction attempts to capture rich content (OpenGraph, Twitter Cards, etc.)
- API responses include HTTP status codes from target URLs to help identify dead links
