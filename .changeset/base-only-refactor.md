---
"@ethereum-tag-service/contracts": major
"@ethereum-tag-service/sdk-core": major  
"@ethereum-tag-service/sdk-react-hooks": major
"@ethereum-tag-service/subgraph-endpoints": major
---

BREAKING: Refactor ETS to Base-only architecture

This release removes all Arbitrum support and refactors ETS to run exclusively on Base blockchain. This is a breaking change for all applications using ETS on Arbitrum.

**Breaking Changes:**
- Removed all Arbitrum Sepolia (chainId: 421614) contract deployments and configurations
- Removed Arbitrum network support from multichain configuration
- Removed arbitrumSepolia subgraph endpoints
- SDK clients now only support Base Sepolia (chainId: 84532) and localhost (chainId: 31337)
- Environment-aware contract address resolution now properly supports localhost development

**Migration Guide:**
- Update all chainId references from 421614 (Arbitrum Sepolia) to 84532 (Base Sepolia)  
- Update wagmi chain imports from `arbitrumSepolia` to `baseSepolia`
- Update subgraph endpoint calls to use Base Sepolia instead of Arbitrum
- Update testnet ETH faucet links to Base Sepolia faucets
- No code changes needed for environment-aware deployments (staging/production)

**Technical Improvements:**
- Fixed localhost contract address resolution for development environments
- Simplified architecture with single blockchain support
- Updated Wagmi CLI plugin to generate backward-compatible contract addresses
- Preserved environment-specific contract resolution (staging/production)