# @ethereum-tag-service/sdk-core

## 0.0.8

### Patch Changes

- [#408](https://github.com/ethereum-tag-service/ets/pull/408) [`a68f6a7`](https://github.com/ethereum-tag-service/ets/commit/a68f6a70a1616c1e75e5df6e2ee4e3c546620d82) Thanks [@mhpaler](https://github.com/mhpaler)! - Support local accounts in sdk-core

## 0.0.7

### Patch Changes

- [#404](https://github.com/ethereum-tag-service/ets/pull/404) [`32cd824`](https://github.com/ethereum-tag-service/ets/commit/32cd82415e907e6d143281e2d9b5436d5a44fb1c) Thanks [@mhpaler](https://github.com/mhpaler)! - Remove dependency on .env var NEXT_PUBLIC_ALCHEMY_KEY

## 0.0.6

### Patch Changes

- [#401](https://github.com/ethereum-tag-service/ets/pull/401) [`d544088`](https://github.com/ethereum-tag-service/ets/commit/d544088664ac78424d290ee417c85dd9bf205749) Thanks [@mhpaler](https://github.com/mhpaler)! - Support multi-chains for ETS testnet.

- [#396](https://github.com/ethereum-tag-service/ets/pull/396) [`b11d21e`](https://github.com/ethereum-tag-service/ets/commit/b11d21ea8ede9938442165da29550dfef405a658) Thanks [@mhpaler](https://github.com/mhpaler)! - @ethereum-tag-service/contracts: use hardhat chain instead of localhost for local development

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

- Updated dependencies [[`d544088`](https://github.com/ethereum-tag-service/ets/commit/d544088664ac78424d290ee417c85dd9bf205749), [`b11d21e`](https://github.com/ethereum-tag-service/ets/commit/b11d21ea8ede9938442165da29550dfef405a658), [`465ffe6`](https://github.com/ethereum-tag-service/ets/commit/465ffe6a5d99a469e770d5118e231eccf3faa86f)]:
  - @ethereum-tag-service/contracts@0.0.1

## 0.0.5

### Patch Changes

- [#381](https://github.com/ethereum-tag-service/ets/pull/381) [`29f28d2`](https://github.com/ethereum-tag-service/ets/commit/29f28d22ffdf412156afe76f1acc08aa72d5ce00) Thanks [@mhpaler](https://github.com/mhpaler)! - Simplify the RelayerClient.createTaggingRecord function.

- [#380](https://github.com/ethereum-tag-service/ets/pull/380) [`13e2413`](https://github.com/ethereum-tag-service/ets/commit/13e24136e3eae44404e3655c5a826465736452d0) Thanks [@mhpaler](https://github.com/mhpaler)! - Upgrade Viem version in SDKs to 2.20.0

## 0.0.4

### Patch Changes

- [#364](https://github.com/ethereum-tag-service/ets/pull/364) [`c85ab03`](https://github.com/ethereum-tag-service/ets/commit/c85ab033adbff506a27e0c747da01a0ac53e9f59) Thanks [@mhpaler](https://github.com/mhpaler)! - Add and configure and execute repository & package linting.

## 0.0.3

### Patch Changes

- [#359](https://github.com/ethereum-tag-service/ets/pull/359) [`e1b2c38`](https://github.com/ethereum-tag-service/ets/commit/e1b2c38f4c10b2f225d30354732004cf90620f1e) Thanks [@mhpaler](https://github.com/mhpaler)! - Adjust the tagExists functions in the tokenClients to be able to check by tagId and tag string.

## 0.0.2

### Patch Changes

- 7cba9b3: add info for created tags

## 0.0.1

### Patch Changes

- ddefb50: Initial alpha-testnet release of sdk packages.