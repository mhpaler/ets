# Ethereum Tag Service

Ethereum Tag Service is the community-owned incentivized cross-chain content tagging protocol for the decentralized web.

This repository uses Turborepo and [Yarn](https://classic.yarnpkg.com/lang/en/) as a package manager.

- Website: [ets.xyz](https://ets.xyz)
- App: [app.ets.xyz](https://app.ets.xyz)
- Docs: [ets.xyz/docs](https://ets.xyz/docs)
- Twitter: [@etsproject](https://twitter.com/etsproject)
- Discord: ETS (soon)

## Quick Start

```bash
git clone https://github.com/ethereum-tag-service/ets.git
cd ets

yarn install
```

Get started with:

- [Site](#site) (ets.xyz)
- [App](#app) (app.ets.xyz)
- [Docs](#docs) (ets.xyz/docs)
- [UI](#ui)
- [Subgraph](#subgraph)
- [Contracts](#contracts)
- [Tests](#tests)
- [Deployments](#deployments)

Other packages:

- `config`: `eslint` configurations (includes `eslint-config-next` and `eslint-config-prettier`)
- `tsconfig`: `tsconfig.json`s used throughout the monorepo

<a name="site"></a>
### Site

```bash
yarn site:dev
```

This will start up the Next.js development server and your site will be available at: [http://localhost:3000/](http://localhost:3000/)

The App is built with Next.js and can be found in `apps/site`.

<a name="app"></a>
### App

```bash
yarn app:dev
```

This will start up the Next.js development server and your site will be available at: [http://localhost:3000/](http://localhost:3000/)

The App is built with Next.js and can be found in `apps/app`.

To interact with the local contract, be sure to switch your MetaMask Network to `Localhost 8545`.

<a name="docs"></a>
### Docs

```bash
yarn docs:dev
```

This will start up the Next.js development server and your site will be available at: [http://localhost:3000/](http://localhost:3000/)

The App is built with Next.js and can be found in `apps/docs`.


<a name="ui"></a>
### UI

The UI package (`/packages/ui`) is a stub React component library shared by the `site`, `app`, and `docs` applications.

<a name="subgraph"></a>
### Subgraph

To develop using a local subgraph, you'll need to have [Docker](https://www.docker.com/products/docker-desktop) installed. Be sure you have already run `yarn hardhart` and `yarn hardhat:deploy` so your contracts are deployed to the local Hardhat network before running the following commands.

First, open up a new terminal and spin up a local Docker graph node container. It will automatically clean up any old data:

```bash
yarn docker:start
```

In another terminal, create your local subgraph (only required to run once):

```bash
yarn graph:create-local
```

Deploy your local subgraph:

```bash
yarn graph:ship-local
```

Once you make changes to your subgraph in `packages/subgraph`, you can deploy your contracts and your subgraph in one go by running:

```bash
yarn graph:deploy-and-graph
```

If you want to remove the Docker container, run:

```bash
yarn docker:remove
```

<a name="contracts"></a>
### Contracts

Contract are located in `packages/hardhat/contracts`.

```bash
yarn hardhat
```

Running `yarn hardhat` spins up a Hardhat network instance that you can connect to using MetaMask. In a different terminal in the same directory, run:

```bash
yarn hardhat:deploy
```

This will deploy the contracts to the Hardhat network.

Or, if you would like to deploy and then watch the [contracts](#contracts) for changes and auto-deploy them to the local Hardhat network, you can just run:

```bash
yarn hardhat:watch
```

Deployment and watching scripts are located in `packages/hardhat/scripts` and `packages/hardhat/deploy`.

<a name="tests"></a>
### Tests

To run tests:

```bash
yarn hardhat:test
```

<a name="deployments"></a>
### Deployments

To deploy contracts to Polygon Mumbai, run:

```bash
yarn hardhat:deploy-mumbai
```

To deploy the subgraph:

```bash
yarn graph:ship-mumbai
```

## Thanks

Thanks to Austin Griffith for [Scaffold-ETH](https://github.com/scaffold-eth/scaffold-eth).
