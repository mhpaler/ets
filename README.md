# ETS

This monorepo contains the entire code base for Ethereum Tag Service including smart contracts, subgraph and various front-end applications. It uses [Turborepo](https://turborepo.org/) and [pnpm](https://pnpm.io/) as a package manager for the monorepo.

## What is ETS?

Ethereum Tag Service (ETS) is an experimental EVM based tagging protocol.

Tags, content tagging & tagging data graphs are composable units & services that preserve integrity, provenance & attribution across the projects that create or consume them.

Our aim is to solve some of the problems faced by Web3 Project owners looking to implement content tagging in a decentralized manner, as well as some of the problems inherent to centralized tagging.

ETS is in alpha phase running on Polygon Mumbai testnet. Code and data on that testnet is pre-production and breaking changes may occur between releases.

## Contributing

ETS is open source software (OSS) being "developed in the open." Your participation, question or feedback is very welcome in our [discussion forum](https://github.com/ethereum-tag-service/ets/discussions)

## Thanks

Launched in 2019 as Hashtag Protocol, ETS has taken many turns to get to where it is today. This path would not have been possible without the input & inspiration from many people and projects. We'd like to thank the following in no particular order:

Andy Gray, James Morgan, Vincent de Almeida, David Post, Startup with Chainlink, Polygon, Hardhat, Xinshu Dong, Elvie Kamalova, Joe Guagliardo, nnnicholas, Joshua Meteora, RSS3, Michael Palys, Mike Derezin, Sunny He, Mask, Shields, Nouns, Enzyme Finance, Chris Messina, Glen Poppe, MEEM, Stefan Adolf, Robert Douglass, NFTPort, Ben Murray, Open Zeppelin

### Cloning repo

```bash
git clone https://github.com/ethereum-tag-service/ets.git
cd ets

pnpm install
```

The monorepo is composed of packages, which contain our contracts, subgraph and a few other tidbits, and should you wish to use our code in your project.

The monorepo also contains an apps folder which contains various front-end applications such as our website, explorer, etc.
