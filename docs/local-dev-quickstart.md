# Local development quickstart

This guide will get you up and running with a full ETS stack running locally, including contracts, subgraph, and the ETS Explorer for visualizing ETS data.

Make a copy of `.env.example` in the project root named `.env`. The default settings in there should be enough to get you going.

Run all commands should be run from the project root.

## Contracts

Open a tab in your terminal and start the local Hardhat blockchain

```bash
pnpm run hardhat
```

Open another tab and compile and deploy the contracts

```bash
pnpm hardhat:deploy
```

note addresses for all locally deployed contracts are saved to `config/config.json`

## Subgraph

Make sure Docker is up and running, then open another terminal tab and run the following (still from the project root) to start your local graph node:

```bash
pnpm graph:node-start
```

Next, open another terminal tab and run the following to generate your local subgraph.yaml (uses a script to parse hardhat config into a template):

```bash
pnpm graph:prepare-local
```

Next, create your local subgraph (only required to run once):

```bash
pnpm graph:create-local
```

Deploy your local subgraph:

```bash
pnpm graph:ship-local
```

If everything is successful, the deployment url of your local subgraph will be printed out, which you can copy and paste into a browser to use the local subgraph explorer. Your query end-point will also be printed out.

## ETS Explorer

To easily visualize data written locally, you might find the ETS Explorer useful. This is the same explorer running at [app.ets.xyz](https://app.ets.xyz).

Open another tab in your terminal, still in the project root and run:

```bash
pnpm app:dev
```

At this point you are ready to begin interacting with ETS. We recommend heading to the [JavaScript client quickstart](./js-client-quickstart.md)

## Deployment

### Quickstart

Configure hardhat.config.js to meet your needs, then from within the contracts root, run

```bash
# for localhost
pnpm run deploy

# for mumbai
pnpm run deploy-mumbai

# Or calling hardhat directly
hardhat deploy --tags deployAll --network localhost
```

### Deployment details

ETS deployment scripts rely heavily on [Hardhat Deploy](https://www.npmjs.com/package/hardhat-deploy) and [Open Zeppelin Upgrades](https://www.npmjs.com/package/@openzeppelin/hardhat-upgrades) plugins.

For granularity, each contract is deployed with a different script. Settings common or reused
between scripts are in `setup.js`.

Order of deployment is important. This is controlled by the `tag` and a `dependency` features
provided by hardhat-deploy. Deployment begins by passing the `deployAll` tag to hardhat-deploy (see
`deploy.js`). `deployAll` it claims as dependency the last script to be deployed (ETSTargetTagger).
ETSTargetTagger.js in turn sets its dependency (ETS). This dependency chain continues until it
reaches the last dependency (ETSAccessControls) at which point the contracts start deploying from
the last dependency (ETSAccessControls) to the first (ETSTargetTagger).

Once everything is deployed, the final configuration settings in `deploy.js` are executed.

We use [Ethernal](https://doc.tryethernal.com/) as a rapid development tool. If you have Ethernal
enabled, fill out the following in your `.env file` and each contract will be verified as it's
deployed to Ethernal:

```text
ETHERNAL_EMAIL=
ETHERNAL_PASSWORD=
ETHERNAL_DISABLED=false
ETHERNAL_WORKSPACE=
```

Setting `ETHERNAL_DISABLED=false` for on chain deployments will attempt to verify the contracts
using the verify task provided by [hardhat-etherscan](https://hardhat.org/hardhat-runner/plugins/nomiclabs-hardhat-etherscan). For more details see `utils/verify.js`
