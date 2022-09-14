# ETS

Ethereum Tag Service (ETS) is an experimental EVM based tagging protocol.

Tags, content tagging & tagging data graphs are composable units & services that preserve integrity, provenance & attribution across the projects that create or consume them.

Our aim is to solve some of the problems faced by Web3 Project owners looking to implement content tagging in a decentralized manner.

ETS is an alpha phase project running on Polygon Mumbai testnet. Code and data is pre-production and breaking changes are likely to occur between releases.

## Contributing

ETS is open source software (OSS) being "developed in public." Your participation, questions or feedback is very welcome in our [discussion forum](https://github.com/ethereum-tag-service/ets/discussions)

## Thanks

Launched in 2019 as Hashtag Protocol, ETS has taken many turns to get to where it is today. This path would not have been possible without the input & inspiration from many people and projects. We'd like to thank the following in no particular order:

Andy Gray, James Morgan, Vincent de Almeida, David Post, Startup with Chainlink, Polygon, Hardhat, Xinshu Dong, Elvie Kamalova, Joe Guagliardo, nnnicholas, Joshua Meteora, RSS3, Michael Palys, Mike Derezin, Sunny He, Mask, Shields, Nouns, Enzyme Finance, Chris Messina, Glen Poppe, MEEM, Stefan Adolf, Robert Douglass, NFTPort, Ben Murray, Open Zeppelin

## Developer Guide

This repository uses [Turborepo](https://turborepo.org/) and [pnpm](https://pnpm.io/) as a package manager for the monorepo.

### Cloning repo

```bash
git clone https://github.com/ethereum-tag-service/ets.git
cd ets

pnpm install
```

The monorepo is composed of packages, which contain our contracts, subgraph and a few other tidbits, and should you wish to use our code in your project.

The monorepo also contains an apps folder which contains various front-end applications such as our website, explorer, etc.
