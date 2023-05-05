<!-- markdownlint-disable MD041 -->

![System architecture diagram](./docs/assets/logo-leaderboard.png)

This monorepo contains the entire code base for Ethereum Tag Service including smart contracts, subgraph and various front-end applications. It uses [Turborepo](https://turborepo.org/) and [pnpm](https://pnpm.io/) as a package manager for the monorepo.

For code releases we use [semantic versioning](https://semver.org/).

## What is ETS?

Ethereum Tag Service (ETS) is an experimental EVM based content tagging service, aimed at Web3 developers, running in alpha/testnet phase on the Polygon Blockchain.

In ETS, tags, content tagging & tagging data are fully composable units & services. This treatment is intended to reduce infrastructure, preserve data integrity and increase reach & engagement for the projects that consume the service.

## Getting Started

If you want to jump right in, head over to [JavaScript client quickstart](./docs/js-client-quickstart.md) or [Contract-to-contract quickstart](./docs/contract-to-contract-quickstart.md).



To learn a bit more before diving in, see [key concepts](./docs/key-concepts.md) and the [system architecture diagram](./docs/system-architecture.md/).

## Demos

[ETS Explorer](https://app.ets.xyz) - Visualization of ETS tagging graph on the Polygon Mumbai testnet.

[Lenster Integration](https://lenster.ets.xyz) - Our fork of Lenster App itegrated with ETS. Helps to watch the video first.

[Lenster Integration Video](https://www.youtube.com/watch?v=9HgA__Hvsko) - Six minute demo showing an integration between ETS and Lenster illustrating how Ethereum Tag Service can be used as backend for social bookmarking infrastructure.

## Documentation

- [Key concepts](./docs/key-concepts.md)
- [System architecture diagram](./docs/system-architecture.md)
- [Get a Publisher ID](./docs/get-publisher-id.md)
- [JavaScript client quickstart](./docs/js-client-quickstart.md)
- [Local development quickstart](./docs/local-dev-quickstart.md) (todo)
- [Contract-to-contract quickstart](./packages/contracts/README.md)
- [Backend API (contracts)](./docs/backend-api/index.md)
- [Front-end API (subgraph)](./docs/subgraph.md)
- [Demos & examples](./docs/examples.md) (todo)

## Contributing

ETS is an alpha/testnet service being "developed in the open" as open source software (OSS). As such, public participation is both welcome and necessary for the project to thrive.

For developers (or anyone for that matter), with questions & feedback please use our Github [discussion forum](https://github.com/ethereum-tag-service/ets/discussions). For bug reports or issues, please [open an issue](https://github.com/ethereum-tag-service/ets/issues).

We also post occasional updates to [Twitter](https://twitter.com/etsxyz) and [Substack](https://etsxyz.substack.com/) if you want to stay informed.

## Inspiration & Thanks

Launched in 2019 as Hashtag Protocol, ETS has taken many turns to get to where it is today. This path would not have been possible without the input & inspiration from many people and projects. We'd like to thank the following in no particular order:

Andy Gray, James Morgan, Vincent de Almeida, Superfluid, David Post, Startup with Chainlink, Polygon, Hardhat, Xinshu Dong, Elvie Kamalova, Joe Guagliardo, nnnnicholas, Joshua Meteora, RSS3, Michael Palys, Mike Derezin, Sunny He, Mask, Shields, Nouns, Enzyme Finance, Chris Messina, Glen Poppe, MEEM, Stefan Adolf, Robert Douglass, NFTPort, Ben Murray, Open Zeppelin, Jad Esber
