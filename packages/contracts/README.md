# Ethereum Tag Service Contracts

Ethereum Tag Service (ETS) is an experimental EVM based content tagging service, aimed at Web3 developers, running in alpha/testnet phase on the Polygon Blockchain.

In ETS, tags, content tagging & tagging data are fully composable units & services. Tagging can be performed via a JavaScript front-end client such as Ethers or Wagmi, or contract-to-contract interaction.

The quickest way to get started with contract-to-contract interaction is by [getting a Publisher ID](../../docs/get-publisher-id.md) and implementing the [ETSPublisherV1](../contracts/contracts/publishers/interfaces/IETSPublisherV1.sol) interface with it inside your own contract.

## Quickstart

To install with [**Hardhat**](https://github.com/nomiclabs/hardhat) or [**Truffle**](https://github.com/trufflesuite/truffle) using `npm`:

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
        IETSPublisherV1(0xd2499cf4a47a959217efeacefb7edbd524661f59);
}

```

> NOTE:
> You can use any Publisher ID you like (for example we used the ETS Publisher ID `0xd2499cf4a47a959217efeacefb7edbd524661f59`), however, all publisher attribution will go the ID you supply.
>
> To attribute your application as the publisher, you'll need to [get a Publisher ID](../../docs/get-publisher-id.md) using the ETS Publisher Factory. It's free, so give it a try.
