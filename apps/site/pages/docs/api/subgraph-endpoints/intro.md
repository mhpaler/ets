# @ethereum-tag-service/subgraph-endpoints

A lightweight package that provides network-specific subgraph endpoint URLs for the Ethereum Tag Service (ETS).

## Core Functionality

The subgraph-endpoints package provides a mapping system for ETS subgraph endpoints across different networks. It handles the resolution of chain IDs to their corresponding Graph Protocol endpoints.

## Installation

  :::code-group

  ```bash [npm]
  npm install @ethereum-tag-service/subgraph-endpoints
  ```

  ```bash [pnpm]
  pnpm add @ethereum-tag-service/subgraph-endpoints
  ```

  ```bash [bun]
  bun i @ethereum-tag-service/subgraph-endpoints
  ```

  :::

Currently supported networks:

- localhost: `http://localhost:8000/subgraphs/name/ets-local`
- arbitrumSepolia: `https://api.studio.thegraph.com/query/87165/ets-arbitrum-sepolia/version/latest`
- baseSepolia: `https://api.studio.thegraph.com/query/87165/ets-base-sepolia/version/latest`

Supported Chain IDs:

- 31337: localhost
- 1337: localhost
- 421614: arbitrumSepolia
- 84532: baseSepolia
