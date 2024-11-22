---
"@ethereum-tag-service/contracts": patch
"@ethereum-tag-service/sdk-core": patch
"@ethereum-tag-service/subgraph": patch
---

@ethereum-tag-service/contracts: use hardhat chain instead of localhost for local development

Replace localhost chain (id: 1337) with hardhat chain (id: 31337) in multiChainConfig
to align with Hardhat's default chain ID and prevent network connection issues during
local development. This ensures consistent chain ID usage across the application.

@ethereum-tag-service/sdk-core fix: use local RPC for Hardhat development environment

Update clientFactory to use local RPC URL for chain ID 31337 (Hardhat) instead of
attempting to use Alchemy. This enables proper client initialization during local
development while maintaining Alchemy RPC usage for testnet and mainnet environments.

@ethereum-tag-service/subgraph feat(subgraph): upgrade and optimize subgraph implementation

- Upgrade specVersion to 0.0.4 and enable nonFatalErrors
- Improve address comparison using equals() instead of string conversion
- Update docker compose syntax for newer versions
- Add better error handling with GraphProtocol logging
- Optimize zero address checks in Creator, Platform, and Relayer entities
