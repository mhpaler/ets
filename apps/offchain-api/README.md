# ETS Off-Chain API

## Technical Summary

The ETS Off-Chain API is a Node.js service that provides off-chain processing capabilities for the Ethereum Tag Service (ETS) ecosystem. It serves as a bridge between on-chain smart contracts and various off-chain resources, primarily handling URL metadata extraction, permanent data storage, and CTAG auction management.

### Core Features

- **Target URL Processing**: Extracts metadata from any URL (webpages, images, PDFs, etc.)
- **Permanent Storage**: Stores metadata on Arweave for decentralized, permanent storage
- **Integration with ETS Contracts**: Communicates with ETS smart contracts across multiple chains
- **Multi-Chain Support**: Works with multiple EVM chains including Arbitrum Sepolia and Base Sepolia
- **CTAG Auction Management**: Determines the next eligible CTAG (tokenized Tag NFT) for auction based on usage metrics

### Architecture

The service is built with a modular architecture:

- **Express API Server**: Handles HTTP requests and responses
- **Controller Layer**: Processes incoming requests and orchestrates service interactions
- **Service Layer**: Contains domain-specific business logic
  - `metadataService`: Extracts and processes metadata from target URLs
  - `arweaveService`: Handles interaction with Arweave blockchain
  - `tagService`: Manages CTAG selection for auctions based on usage metrics
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

PORT=4000
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

The API will be available at <http://localhost:4000> with automatic reloading on code changes.

## API Documentation

### Health Check

#### GET /health

Simple health check endpoint to verify the service is running.

**Parameters:** None

**Response:**

```json
{
  "status": "ok"
}
```

### Target Endpoints

#### POST /api/target/enrich

Processes a target URL, extracts metadata, and stores it on Arweave.

**Parameters:**

```json
{
  "chainId": 31337,  // Required: The chain ID to use
  "targetId": "123"  // Required: The ID of the target to enrich
}
```

**Example Request:**

```bash
curl -X POST http://localhost:4000/api/target/enrich \
  -H "Content-Type: application/json" \
  -d '{"chainId": 31337, "targetId": "123"}'
```

**Example Response:**

```json
{
  "success": true,
  "message": "Target metadata extracted and stored successfully",
  "data": {
    "chainId": 31337,
    "targetId": "123",
    "metadata": {
      "title": "Example Page Title",
      "description": "This is an example description",
      "image": "https://example.com/image.jpg"
    },
    "transactionId": "abcdef1234567890",
    "statusCode": 200
  }
}
```

### Auction Endpoints

#### POST /auction/next

Returns the next CTAG (tokenized Tag NFT) that should be released for auction.

**Parameters:**

```json
{
  "chainId": 31337  // Required: The chain ID to query
}
```

**Example Request:**

```bash
curl -X POST http://localhost:4000/auction/next \
  -H "Content-Type: application/json" \
  -d '{"chainId": 31337}'
```

**Example Response (Tag Found):**

```json
{
  "success": true,
  "message": "Found next tag for auction",
  "data": {
    "chainId": 31337,
    "hasEligibleTag": true,
    "tagId": "123",
    "tagDisplay": "test-tag"
  }
}
```

**Example Response (No Tag Found):**

```json
{
  "success": true,
  "message": "No eligible tags found for auction",
  "data": {
    "chainId": 31337,
    "hasEligibleTag": false
  }
}
```

**Error Response (Invalid Chain ID):**

```json
{
  "success": false,
  "message": "Chain ID 999 is not supported",
  "error": {
    "statusCode": 400
  }
}
```

#### POST /auction/webhook

Handles auction event webhooks (primarily for RequestCreateAuction events).

**Parameters:**

```json
{
  "chainId": 31337,          // Required: The chain ID where the event occurred
  "eventName": "RequestCreateAuction",  // Required: The name of the event
  // Additional event-specific parameters may be required
}
```

**Example Request:**

```bash
curl -X POST http://localhost:4000/auction/webhook \
  -H "Content-Type: application/json" \
  -d '{"chainId": 31337, "eventName": "RequestCreateAuction"}'
```

**Example Response (Success):**

```json
{
  "success": true,
  "message": "Auction webhook received and being processed",
  "data": {
    "event": "RequestCreateAuction",
    "chainId": 31337,
    "status": "processing"
  }
}
```

**Example Response (Unsupported Event):**

```json
{
  "success": false,
  "message": "Unsupported event: SomeUnknownEvent"
}
```

## About the CTAG Auction Selection Process

The CTAG auction selection process is handled by the `tagService` which:

1. Fetches tags owned by the platform address from the subgraph
2. Filters for tags that are eligible for auction (never auctioned or all auctions settled)
3. Selects the most appropriate tag based on these criteria:
   - Tags with positive usage (`tagAppliedInTaggingRecord`) are prioritized, with highest usage selected first
   - If no tags have been used, the oldest tag is selected

This intelligent selection mechanism ensures that the most popular and useful tags are made available for auction first, enhancing the value proposition for potential bidders.

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
- The auction selection algorithm prioritizes tags based on usage statistics, promoting more valuable tags
