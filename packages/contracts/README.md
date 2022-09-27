# Ethereum Tag Service Contracts

In ETS, tags, content tagging & tagging data are fully composable units & services. This treatment preserves data integrity, provenance & attribution across the projects and users that consume the service. The result is (hopefully) a novel way to connect people, places and things across Web3.

Ethereum Tag Service contains a suite of contracts, that make it relatively easy for third parties to integrate

## Quickstart

To install with [**Hardhat**](https://github.com/nomiclabs/hardhat) or [**Truffle**](https://github.com/trufflesuite/truffle):

```sh
npm install @ethereum-tag-service/contracts
```

or pnpm

```sh
pnpm install @ethereum-tag-service/contracts
```

## Usage

Import the `ETSPublisherV1` interface and instantiate it with a valid Publisher ID.

```solidity
pragma solidity ^0.8.0;

import {IETSPublisherV1} from "@ethereum-tag-service/contracts/publishers/interfaces/IETSPublisherV1.sol";

contract MyContract {
    IETSPublisherV1 public etsPublisher =
        IETSPublisherV1(0xe188a29bdd896fe0e6e1d025ed6a144530fb7535);
}

```

> NOTE:
> You can use any Publisher ID you like (for example the ETS Publisher ID `0xe188a29bdd896fe0e6e1d025ed6a144530fb7535`), however, all publisher attribution will go to ETS.
>
> To attribute your application as the publisher, you'll need to [get your own Publisher ID](../../docs/get-publisher-id.md) using the ETS Publisher Factory.
