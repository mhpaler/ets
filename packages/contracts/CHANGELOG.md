# @ethereum-tag-service/contracts

## 0.0.7

### Patch Changes

- [#508](https://github.com/ethereum-tag-service/ets/pull/508) [`f896c72`](https://github.com/ethereum-tag-service/ets/commit/f896c72eb60e3df072829a20f732fb1c0ed2bf0e) Thanks [@mhpaler](https://github.com/mhpaler)! - Add onlyRelayer Modifier to applyTagsWithRawInput() for Early Validation. Add VERSION constant to upgradeable contracts.

- [#508](https://github.com/ethereum-tag-service/ets/pull/508) [`f896c72`](https://github.com/ethereum-tag-service/ets/commit/f896c72eb60e3df072829a20f732fb1c0ed2bf0e) Thanks [@mhpaler](https://github.com/mhpaler)! - Update contracts to support cross-relayer tagging record editing. Update subgraph and sdk-core to align.

## 0.0.6

### Patch Changes

- [#495](https://github.com/ethereum-tag-service/ets/pull/495) [`9e561c8`](https://github.com/ethereum-tag-service/ets/commit/9e561c8b195ff63e6acf14a9a06672fb21d62bf4) Thanks [@mhpaler](https://github.com/mhpaler)! - Update hardhat, fix tests, add new docs generator

## 0.0.5

### Patch Changes

- [#491](https://github.com/ethereum-tag-service/ets/pull/491) [`392f4d9`](https://github.com/ethereum-tag-service/ets/commit/392f4d9dca1b7f6d191c6051d20ca8c2ff29f324) Thanks [@mhpaler](https://github.com/mhpaler)! - Update README

## 0.0.4

### Patch Changes

- [#485](https://github.com/ethereum-tag-service/ets/pull/485) [`f491609`](https://github.com/ethereum-tag-service/ets/commit/f491609cb03e756eb4d5b567f30e1d98f11fc64c) Thanks [@mhpaler](https://github.com/mhpaler)! - Remove /src, include /contracts in package

## 0.0.3

### Patch Changes

- [#473](https://github.com/ethereum-tag-service/ets/pull/473) [`dd527ea`](https://github.com/ethereum-tag-service/ets/commit/dd527ea061686107510492dcedf7ea2a2555a18c) Thanks [@mhpaler](https://github.com/mhpaler)! - Update typescript and viem.

## 0.0.2

### Patch Changes

- [#460](https://github.com/ethereum-tag-service/ets/pull/460) [`7df289c`](https://github.com/ethereum-tag-service/ets/commit/7df289c25cadc9cc7cea9a3b56d13d7896f26c67) Thanks [@mhpaler](https://github.com/mhpaler)! - Fix solhint

## 0.0.1

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

- [#394](https://github.com/ethereum-tag-service/ets/pull/394) [`465ffe6`](https://github.com/ethereum-tag-service/ets/commit/465ffe6a5d99a469e770d5118e231eccf3faa86f) Thanks [@mhpaler](https://github.com/mhpaler)! - Significant refactor of the contracts package including the following:

    1. Refactor deployment scripts to take target chain as argument.
    2. Refactor package bundler to utilize tsup
    3. Change deployment artifacts folder to /src
    4. Add chain visibility functions to package including chains() & availableChainIds()
    5. Add utility functions see /src/utils.ts

    These changes make it easier for consuming applications to access available chain info via the @ethereum-tag-service/contracts package.

## 0.0.1

### Patch Changes

- [#364](https://github.com/ethereum-tag-service/ets/pull/364) [`c85ab03`](https://github.com/ethereum-tag-service/ets/commit/c85ab033adbff506a27e0c747da01a0ac53e9f59) Thanks [@mhpaler](https://github.com/mhpaler)! - Add and configure and execute repository & package linting.
