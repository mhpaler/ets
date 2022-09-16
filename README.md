# ETS

This monorepo contains the entire code base for Ethereum Tag Service including smart contracts, subgraph and various front-end applications. It uses [Turborepo](https://turborepo.org/) and [pnpm](https://pnpm.io/) as a package manager for the monorepo.

For code releases we use [semantic versioning](https://semver.org/).

## What is ETS?

Ethereum Tag Service (ETS) is an experimental EVM based content tagging service running in alpha phase on Polygon Mumbai testnet.

In ETS, tags, content tagging & tagging data graphs are composable units & APIs that read and write from a blockchain. This treatment preserves data integrity, provenance & attribution across the projects and users that consume the service. The result is (hopefully) a novel way to connect people, places and things across Web3.

For Web3 project owners looking for tagging solutions, our aim is to solve some of your pain points, namely redundant code & infrastructure and limited cross-project reach and engagement.

## Getting Started

If you want to jump right in, head over to [Ethers.js quickstart](./docs/ethers-js-quickstart.md) or [Contract-to-contract quickstart](./docs/contract-to-contract-quickstart.md).

If you want to learn a bit more before diving in, [key concepts](./docs/key-concepts.md), the [system architecture diagram](./docs/system-architecture.md/) and the [Backend API](./docs/contract-apis) are good places to start.

## Documentation

- [Key concepts](./docs/key-concepts.md) (in progress)
- [System architecture diagram](./docs/system-architecture.md)
- [Backend API (contracts)](./docs/backend-api/index.md)
- [Front-end API (subgraph)](./docs/subgraph.md) (TODO)
- [Ethers.js quickstart](./docs/ethers-js-quickstart.md) (TODO)
- [Contract-to-contract quickstart](./docs/contract-to-contract-quickstart.md) (TODO)
- [Local development quickstart](./docs/local-dev-quickstart.md) (TODO)
- [Demos & examples](./docs/examples.md) (TODO)

## Contributing

ETS is an alpha/testnet service being "developed in the open" as open source software (OSS). As such, public participation is both welcome and probably necessary for the project to thrive.

For developers (or anyone for that matter), with questions & feedback please use our Github [discussion forum](https://github.com/ethereum-tag-service/ets/discussions).

We also post occasional updates to [Twitter](https://twitter.com/etsxyz), Medium and [Substack](https://etsxyz.substack.com/) if you want to stay informed.

## Inspiration & Thanks

Launched in 2019 as Hashtag Protocol, ETS has taken many turns to get to where it is today. This path would not have been possible without the input & inspiration from many people and projects. We'd like to thank the following in no particular order:

Andy Gray, James Morgan, Vincent de Almeida, Superfluid, David Post, Startup with Chainlink, Polygon, Hardhat, Xinshu Dong, Elvie Kamalova, Joe Guagliardo, nnnnicholas, Joshua Meteora, RSS3, Michael Palys, Mike Derezin, Sunny He, Mask, Shields, Nouns, Enzyme Finance, Chris Messina, Glen Poppe, MEEM, Stefan Adolf, Robert Douglass, NFTPort, Ben Murray, Open Zeppelin, [Jad Esber](https://twitter.com/Jad_AE)
